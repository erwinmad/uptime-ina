import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.js';
import { generatePushToken, logAudit } from '../../../lib/security.js';
import { executeCheck, isUnderMaintenance, type MonitorRecord } from '../../../lib/engine.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async () => {
  try {
    const monitors = db.prepare(`
      SELECT m.*, 
        (SELECT COUNT(*) FROM incidents i WHERE i.monitor_id = m.id AND i.status != 'resolved') as active_incidents_count
      FROM monitors m 
      ORDER BY m.is_featured DESC, m.created_at DESC
    `).all() as any[];

    // Enrich each monitor with SLA calculation (last 24h & 90d) and recent checks
    const enriched = monitors.map((m) => {
      // Recent 30 checks for mini bar
      const recentChecks = db.prepare(`
        SELECT status, response_time_ms, checked_at 
        FROM monitor_checks 
        WHERE monitor_id = ? 
        ORDER BY checked_at DESC 
        LIMIT 30
      `).all(m.id);

      // 24-hour uptime percentage
      const stats24h = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_count,
          AVG(CASE WHEN status = 'up' AND response_time_ms > 0 THEN response_time_ms ELSE NULL END) as avg_latency
        FROM monitor_checks 
        WHERE monitor_id = ? AND checked_at >= datetime('now', '-1 day')
      `).get(m.id) as { total: number; up_count: number; avg_latency: number | null };

      const uptime24h = stats24h && stats24h.total > 0
        ? Number(((stats24h.up_count / stats24h.total) * 100).toFixed(2))
        : 100;

      let parsedTags: string[] = [];
      try {
        parsedTags = JSON.parse(m.tags || '[]');
      } catch {}

      return {
        ...m,
        tags: parsedTags,
        is_under_maintenance: isUnderMaintenance(m.id),
        recent_checks: recentChecks.reverse(),
        uptime_24h: uptime24h,
        avg_latency_24h: Math.round(stats24h?.avg_latency || 0)
      };
    });

    return new Response(JSON.stringify(enriched), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const id = 'mon_' + nanoid(10);
    const {
      name,
      type = 'http',
      target,
      port = null,
      interval_seconds = 60,
      timeout_seconds = 15,
      retries_before_down = 6,
      http_method = 'GET',
      http_headers = '{}',
      http_body = '',
      expected_status_codes = '[200]',
      keyword_match = '',
      keyword_type = 'contains',
      ssl_check_enabled = 0,
      ssl_expiry_alert_days = 14,
      tags = [],
      dns_record_type = 'A',
      dns_expected_value = '',
      category_name = 'Uncategorized',
      is_featured = 0
    } = body;

    if (!name || !target) {
      return new Response(JSON.stringify({ error: 'Name and Target are required' }), { status: 400 });
    }

    let pushTokenRaw: string | null = null;
    let pushTokenHash: string | null = null;
    let pushInterval: number | null = null;
    let pushGrace: number = 60;

    if (type === 'push') {
      const generated = generatePushToken();
      pushTokenRaw = generated.rawToken;
      pushTokenHash = generated.tokenHash;
      pushInterval = Number(body.push_expected_interval_seconds) || interval_seconds || 60;
      pushGrace = Number(body.push_grace_period_seconds) || 60;
    }

    const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags);

    db.prepare(`
      INSERT INTO monitors (
        id, name, type, target, port, interval_seconds, timeout_seconds, retries_before_down,
        http_method, http_headers, http_body, expected_status_codes, keyword_match, keyword_type,
        ssl_check_enabled, ssl_expiry_alert_days, push_token_raw, push_token_hash, 
        push_expected_interval_seconds, push_grace_period_seconds, tags, dns_record_type, dns_expected_value, category_name, is_featured
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id, name, type, target, port, interval_seconds, timeout_seconds, retries_before_down,
      http_method, http_headers, http_body, expected_status_codes, keyword_match, keyword_type,
      ssl_check_enabled ? 1 : 0, ssl_expiry_alert_days, pushTokenRaw, pushTokenHash,
      pushInterval, pushGrace, tagsJson, dns_record_type, dns_expected_value, category_name, is_featured ? 1 : 0
    );

    logAudit('monitor.created', 'monitor', id, { name, type, target });

    const newMonitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id) as MonitorRecord;

    // Immediately test non-push monitors in background
    if (type !== 'push') {
      executeCheck(newMonitor).catch(console.error);
    }

    return new Response(JSON.stringify(newMonitor), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
