import type { APIRoute } from 'astro';
import { db } from '../../lib/db.js';

export const GET: APIRoute = async () => {
  try {
    const monitors = db.prepare('SELECT id, name, target, current_status FROM monitors WHERE active = 1').all() as any[];

    let upCount = 0;
    let downCount = 0;
    let pausedCount = 0;

    for (const m of monitors) {
      if (m.current_status === 'up') upCount++;
      else if (m.current_status === 'down') downCount++;
      else if (m.current_status === 'paused') pausedCount++;
    }

    const checksCount = db.prepare('SELECT COUNT(*) as count FROM monitor_checks').get() as { count: number };
    const incidentsCount = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status != 'resolved'").get() as { count: number };

    // Latest latencies
    let latencyLines = '';
    for (const m of monitors) {
      const lastCheck = db.prepare(`
        SELECT response_time_ms FROM monitor_checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 1
      `).get(m.id) as { response_time_ms: number } | undefined;

      const cleanName = m.name.replace(/"/g, '\\"');
      const cleanTarget = m.target.replace(/"/g, '\\"');
      const lat = lastCheck ? lastCheck.response_time_ms : 0;
      latencyLines += `sentinelup_monitor_latency_ms{id="${m.id}",name="${cleanName}",target="${cleanTarget}"} ${lat}\n`;
    }

    const metricsText = `
# HELP sentinelup_monitors_total Total number of active monitors by status
# TYPE sentinelup_monitors_total gauge
sentinelup_monitors_total{status="up"} ${upCount}
sentinelup_monitors_total{status="down"} ${downCount}
sentinelup_monitors_total{status="paused"} ${pausedCount}

# HELP sentinelup_checks_total Total number of checks recorded
# TYPE sentinelup_checks_total counter
sentinelup_checks_total ${checksCount.count}

# HELP sentinelup_active_incidents_total Total number of currently active incidents
# TYPE sentinelup_active_incidents_total gauge
sentinelup_active_incidents_total ${incidentsCount.count}

# HELP sentinelup_monitor_latency_ms Latest latency in milliseconds per monitor
# TYPE sentinelup_monitor_latency_ms gauge
${latencyLines}
`.trim();

    return new Response(metricsText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; version=0.0.4' }
    });
  } catch (err: any) {
    return new Response(`Error generating metrics: ${err.message}`, { status: 500 });
  }
};
