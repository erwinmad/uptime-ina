import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';
import { executeCheck, type MonitorRecord } from '../../../../lib/engine.js';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id) as any;

    if (!monitor) {
      return new Response(JSON.stringify({ error: 'Monitor not found' }), { status: 404 });
    }

    // Last 100 checks
    const recentChecks = db.prepare(`
      SELECT * FROM monitor_checks 
      WHERE monitor_id = ? 
      ORDER BY checked_at DESC 
      LIMIT 100
    `).all(id);

    // 90-day daily uptime summary for SLA bar
    const dailyHistory = db.prepare(`
      SELECT 
        date(checked_at) as date,
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_checks,
        AVG(CASE WHEN status = 'up' AND response_time_ms > 0 THEN response_time_ms ELSE NULL END) as avg_latency
      FROM monitor_checks
      WHERE monitor_id = ? AND checked_at >= datetime('now', '-90 days')
      GROUP BY date(checked_at)
      ORDER BY date ASC
    `).all(id);

    // Active incidents
    const incidents = db.prepare(`
      SELECT * FROM incidents WHERE monitor_id = ? ORDER BY started_at DESC LIMIT 10
    `).all(id);

    return new Response(
      JSON.stringify({
        ...monitor,
        recent_checks: recentChecks,
        daily_history: dailyHistory,
        incidents
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();

    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id) as MonitorRecord | undefined;
    if (!monitor) {
      return new Response(JSON.stringify({ error: 'Monitor tidak ditemukan' }), { status: 404 });
    }

    // If only requested to run check now without other field updates
    if (body.run_check_now) {
      await executeCheck(monitor);
      const lastCheck = db.prepare('SELECT * FROM monitor_checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 1').get(id) as any;
      const freshMonitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id) as any;

      return new Response(JSON.stringify({
        success: true,
        message: 'Check completed',
        check_result: lastCheck,
        monitor: freshMonitor
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const allowedFields = [
      'name', 'target', 'port', 'interval_seconds', 'timeout_seconds',
      'retries_before_down', 'http_method', 'http_headers', 'http_body',
      'expected_status_codes', 'keyword_match', 'keyword_type',
      'ssl_check_enabled', 'ssl_expiry_alert_days', 'active', 'current_status',
      'push_expected_interval_seconds', 'push_grace_period_seconds',
      'tags', 'dns_record_type', 'dns_expected_value', 'category_name', 'is_featured'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        let val = body[field];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        values.push(val);
      }
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada data valid yang diubah' }), { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE monitors SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    logAudit('monitor.updated', 'monitor', id, body);

    const updated = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    db.prepare('DELETE FROM monitors WHERE id = ?').run(id);
    logAudit('monitor.deleted', 'monitor', id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
