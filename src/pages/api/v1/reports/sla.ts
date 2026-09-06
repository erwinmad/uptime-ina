import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../lib/db.js';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '30d'; // 24h, 7d, 30d, 90d, this_month
    const targetSla = parseFloat(url.searchParams.get('sla') || '99.9');

    let timeFilterSql = "datetime('now', '-30 days')";
    let totalMinutes = 30 * 24 * 60;

    if (range === '24h') {
      timeFilterSql = "datetime('now', '-24 hours')";
      totalMinutes = 24 * 60;
    } else if (range === '7d') {
      timeFilterSql = "datetime('now', '-7 days')";
      totalMinutes = 7 * 24 * 60;
    } else if (range === '90d') {
      timeFilterSql = "datetime('now', '-90 days')";
      totalMinutes = 90 * 24 * 60;
    } else if (range === 'this_month') {
      timeFilterSql = "datetime('now', 'start of month')";
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      totalMinutes = Math.max(60, Math.floor((now.getTime() - startOfMonth.getTime()) / (1000 * 60)));
    }

    // Allowed downtime minutes in this timeframe
    const allowedDowntimeMinutes = Number((totalMinutes * (1 - targetSla / 100)).toFixed(1));

    const monitors = db.prepare('SELECT id, name, type, target, interval_seconds, active, current_status, is_featured, category_name FROM monitors ORDER BY is_featured DESC, name ASC').all() as any[];

    const reportMonitors = monitors.map((m) => {
      // Fetch check aggregations
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_checks,
          SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_checks,
          SUM(CASE WHEN status = 'down' THEN 1 ELSE 0 END) as down_checks,
          AVG(response_time_ms) as avg_response_time,
          MIN(response_time_ms) as min_response_time,
          MAX(response_time_ms) as max_response_time
        FROM monitor_checks
        WHERE monitor_id = ? AND checked_at >= ${timeFilterSql}
      `).get(m.id) as any;

      const totalChecks = stats.total_checks || 0;
      const upChecks = stats.up_checks || 0;
      const downChecks = stats.down_checks || 0;
      const uptimePct = totalChecks > 0 ? Number(((upChecks / totalChecks) * 100).toFixed(3)) : 100;
      const avgLatency = Math.round(stats.avg_response_time || 0);

      // Estimate downtime minutes based on interval and failed checks
      const intervalSec = m.interval_seconds || 60;
      const estimatedDowntimeMinutes = Number(((downChecks * intervalSec) / 60).toFixed(1));

      // Fetch incidents in this timeframe
      const incidents = db.prepare(`
        SELECT id, title, status, started_at, resolved_at
        FROM incidents
        WHERE monitor_id = ? AND started_at >= ${timeFilterSql}
        ORDER BY started_at DESC
      `).all(m.id) as any[];

      const resolvedIncidents = incidents.filter(i => i.resolved_at);
      let totalRecoveryMs = 0;
      for (const inc of resolvedIncidents) {
        totalRecoveryMs += new Date(inc.resolved_at).getTime() - new Date(inc.started_at).getTime();
      }
      const mttrMinutes = resolvedIncidents.length > 0 ? Math.round(totalRecoveryMs / (resolvedIncidents.length * 60000)) : 0;

      // Error budget consumption
      const errorBudgetConsumedMinutes = Math.min(estimatedDowntimeMinutes, allowedDowntimeMinutes * 2);
      const errorBudgetRemainingMinutes = Math.max(0, Number((allowedDowntimeMinutes - estimatedDowntimeMinutes).toFixed(1)));
      const errorBudgetPercentConsumed = allowedDowntimeMinutes > 0 
        ? Math.min(100, Number(((estimatedDowntimeMinutes / allowedDowntimeMinutes) * 100).toFixed(1)))
        : 100;

      let complianceStatus: 'met' | 'risk' | 'breached' = 'met';
      if (uptimePct < targetSla) {
        complianceStatus = 'breached';
      } else if (errorBudgetPercentConsumed > 75) {
        complianceStatus = 'risk';
      }

      // History by day for sparkline
      const history = db.prepare(`
        SELECT 
          date(checked_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_count,
          AVG(response_time_ms) as avg_resp
        FROM monitor_checks
        WHERE monitor_id = ? AND checked_at >= ${timeFilterSql}
        GROUP BY date(checked_at)
        ORDER BY date ASC
      `).all(m.id) as any[];

      return {
        id: m.id,
        name: m.name,
        type: m.type,
        target: m.target,
        active: m.active === 1,
        is_featured: m.is_featured === 1,
        category_name: m.category_name || 'Uncategorized',
        current_status: m.current_status,
        total_checks: totalChecks,
        up_checks: upChecks,
        down_checks: downChecks,
        uptime_percentage: uptimePct,
        target_sla: targetSla,
        avg_latency_ms: avgLatency,
        min_latency_ms: stats.min_response_time || 0,
        max_latency_ms: stats.max_response_time || 0,
        downtime_minutes: estimatedDowntimeMinutes,
        allowed_downtime_minutes: allowedDowntimeMinutes,
        error_budget_remaining_minutes: errorBudgetRemainingMinutes,
        error_budget_percent_consumed: errorBudgetPercentConsumed,
        compliance_status: complianceStatus,
        incident_count: incidents.length,
        mttr_minutes: mttrMinutes,
        history
      };
    });

    // Global summary
    const totalMonitors = reportMonitors.length;
    const metCount = reportMonitors.filter(m => m.compliance_status === 'met').length;
    const riskCount = reportMonitors.filter(m => m.compliance_status === 'risk').length;
    const breachedCount = reportMonitors.filter(m => m.compliance_status === 'breached').length;

    const totalSystemChecks = reportMonitors.reduce((acc, m) => acc + m.total_checks, 0);
    const totalSystemUp = reportMonitors.reduce((acc, m) => acc + m.up_checks, 0);
    const globalUptime = totalSystemChecks > 0 ? Number(((totalSystemUp / totalSystemChecks) * 100).toFixed(3)) : 100;
    const totalDowntimeMinutes = Number(reportMonitors.reduce((acc, m) => acc + m.downtime_minutes, 0).toFixed(1));

    return new Response(JSON.stringify({
      range,
      target_sla: targetSla,
      timeframe_total_minutes: totalMinutes,
      allowed_downtime_minutes: allowedDowntimeMinutes,
      generated_at: new Date().toISOString(),
      summary: {
        total_monitors: totalMonitors,
        global_uptime_percentage: globalUptime,
        total_downtime_minutes: totalDowntimeMinutes,
        met_count: metCount,
        risk_count: riskCount,
        breached_count: breachedCount,
        compliance_rate: totalMonitors > 0 ? Number(((metCount / totalMonitors) * 100).toFixed(1)) : 100
      },
      monitors: reportMonitors
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
