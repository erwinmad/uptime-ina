import type { APIRoute } from 'astro';
import { db, getBrandingSettings } from '../../../../lib/db.js';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    const page = db.prepare('SELECT * FROM status_pages WHERE slug = ?').get(slug) as any;

    if (!page) {
      return new Response(JSON.stringify({ error: 'Status page not found' }), { status: 404 });
    }

    const branding = getBrandingSettings();

    // Get assigned monitors
    // If no monitors specifically linked, show all active monitors by default
    let monitors = db.prepare(`
      SELECT m.id, m.name, m.type, m.current_status, m.last_checked_at, m.interval_seconds, spm.custom_label
      FROM status_page_monitors spm
      JOIN monitors m ON spm.monitor_id = m.id
      WHERE spm.status_page_id = ? AND m.active = 1
      ORDER BY spm.display_order ASC
    `).all(page.id) as any[];

    if (monitors.length === 0) {
      monitors = db.prepare(`
        SELECT id, name, type, current_status, last_checked_at, interval_seconds, name as custom_label
        FROM monitors
        WHERE active = 1
        ORDER BY created_at ASC
      `).all() as any[];
    }

    // Calculate overall system status
    const anyDown = monitors.some((m) => m.current_status === 'down');
    const systemStatus = monitors.length === 0 
      ? 'operational' 
      : anyDown 
        ? 'degraded' 
        : 'operational';

    // Enrich each monitor with recent 60-day check summary
    const enrichedMonitors = monitors.map((m) => {
      const recentChecks = db.prepare(`
        SELECT status, response_time_ms, checked_at
        FROM monitor_checks
        WHERE monitor_id = ?
        ORDER BY checked_at DESC
        LIMIT 30
      `).all(m.id).reverse();

      // 90-day SLA history (we use 60 in query)
      const history = db.prepare(`
        SELECT 
          date(checked_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_count
        FROM monitor_checks
        WHERE monitor_id = ? AND checked_at >= datetime('now', '-60 days')
        GROUP BY date(checked_at)
        ORDER BY date ASC
      `).all(m.id) as { date: string; total: number; up_count: number }[];

      // 30-day percentage
      const totalChecks = history.reduce((sum, h) => sum + h.total, 0);
      const totalUp = history.reduce((sum, h) => sum + h.up_count, 0);
      const uptimePercentage = totalChecks > 0 ? Number(((totalUp / totalChecks) * 100).toFixed(2)) : 100;
      const lastCheck = recentChecks.length > 0 ? recentChecks[recentChecks.length - 1] : null;

      return {
        ...m,
        uptime_percentage: uptimePercentage,
        recent_checks: recentChecks,
        avg_latency: lastCheck ? (lastCheck as any).response_time_ms : null,
        history
      };
    });

    // Active & recent incidents
    const incidents = db.prepare(`
      SELECT i.*, m.name as monitor_name
      FROM incidents i
      LEFT JOIN monitors m ON i.monitor_id = m.id
      ORDER BY i.started_at DESC
      LIMIT 10
    `).all() as any[];

    const enrichedIncidents = incidents.map((inc) => {
      const updates = db.prepare('SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC').all(inc.id);
      return {
        ...inc,
        updates
      };
    });

    return new Response(
      JSON.stringify({
        page: {
          title: page.title,
          description: page.description,
          slug: page.slug,
          is_public: page.is_public
        },
        branding,
        system_status: systemStatus,
        monitors: enrichedMonitors,
        incidents: enrichedIncidents
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
