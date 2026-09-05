import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, n as db } from "./db_BJLNYA76.mjs";
//#region src/pages/api/v1/reports/sla.ts
var sla_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const url = new URL(request.url);
		const range = url.searchParams.get("range") || "30d";
		const targetSla = parseFloat(url.searchParams.get("sla") || "99.9");
		let timeFilterSql = "datetime('now', '-30 days')";
		let totalMinutes = 43200;
		if (range === "24h") {
			timeFilterSql = "datetime('now', '-24 hours')";
			totalMinutes = 1440;
		} else if (range === "7d") {
			timeFilterSql = "datetime('now', '-7 days')";
			totalMinutes = 10080;
		} else if (range === "90d") {
			timeFilterSql = "datetime('now', '-90 days')";
			totalMinutes = 129600;
		} else if (range === "this_month") {
			timeFilterSql = "datetime('now', 'start of month')";
			const now = /* @__PURE__ */ new Date();
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			totalMinutes = Math.max(60, Math.floor((now.getTime() - startOfMonth.getTime()) / 6e4));
		}
		const allowedDowntimeMinutes = Number((totalMinutes * (1 - targetSla / 100)).toFixed(1));
		const reportMonitors = db.prepare("SELECT id, name, type, target, interval_seconds, active, current_status FROM monitors ORDER BY name ASC").all().map((m) => {
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
      `).get(m.id);
			const totalChecks = stats.total_checks || 0;
			const upChecks = stats.up_checks || 0;
			const downChecks = stats.down_checks || 0;
			const uptimePct = totalChecks > 0 ? Number((upChecks / totalChecks * 100).toFixed(3)) : 100;
			const avgLatency = Math.round(stats.avg_response_time || 0);
			const intervalSec = m.interval_seconds || 60;
			const estimatedDowntimeMinutes = Number((downChecks * intervalSec / 60).toFixed(1));
			const incidents = db.prepare(`
        SELECT id, title, status, started_at, resolved_at
        FROM incidents
        WHERE monitor_id = ? AND started_at >= ${timeFilterSql}
        ORDER BY started_at DESC
      `).all(m.id);
			const resolvedIncidents = incidents.filter((i) => i.resolved_at);
			let totalRecoveryMs = 0;
			for (const inc of resolvedIncidents) totalRecoveryMs += new Date(inc.resolved_at).getTime() - new Date(inc.started_at).getTime();
			const mttrMinutes = resolvedIncidents.length > 0 ? Math.round(totalRecoveryMs / (resolvedIncidents.length * 6e4)) : 0;
			Math.min(estimatedDowntimeMinutes, allowedDowntimeMinutes * 2);
			const errorBudgetRemainingMinutes = Math.max(0, Number((allowedDowntimeMinutes - estimatedDowntimeMinutes).toFixed(1)));
			const errorBudgetPercentConsumed = allowedDowntimeMinutes > 0 ? Math.min(100, Number((estimatedDowntimeMinutes / allowedDowntimeMinutes * 100).toFixed(1))) : 100;
			let complianceStatus = "met";
			if (uptimePct < targetSla) complianceStatus = "breached";
			else if (errorBudgetPercentConsumed > 75) complianceStatus = "risk";
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
      `).all(m.id);
			return {
				id: m.id,
				name: m.name,
				type: m.type,
				target: m.target,
				active: m.active === 1,
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
		const totalMonitors = reportMonitors.length;
		const metCount = reportMonitors.filter((m) => m.compliance_status === "met").length;
		const riskCount = reportMonitors.filter((m) => m.compliance_status === "risk").length;
		const breachedCount = reportMonitors.filter((m) => m.compliance_status === "breached").length;
		const totalSystemChecks = reportMonitors.reduce((acc, m) => acc + m.total_checks, 0);
		const totalSystemUp = reportMonitors.reduce((acc, m) => acc + m.up_checks, 0);
		const globalUptime = totalSystemChecks > 0 ? Number((totalSystemUp / totalSystemChecks * 100).toFixed(3)) : 100;
		const totalDowntimeMinutes = Number(reportMonitors.reduce((acc, m) => acc + m.downtime_minutes, 0).toFixed(1));
		return new Response(JSON.stringify({
			range,
			target_sla: targetSla,
			timeframe_total_minutes: totalMinutes,
			allowed_downtime_minutes: allowedDowntimeMinutes,
			generated_at: (/* @__PURE__ */ new Date()).toISOString(),
			summary: {
				total_monitors: totalMonitors,
				global_uptime_percentage: globalUptime,
				total_downtime_minutes: totalDowntimeMinutes,
				met_count: metCount,
				risk_count: riskCount,
				breached_count: breachedCount,
				compliance_rate: totalMonitors > 0 ? Number((metCount / totalMonitors * 100).toFixed(1)) : 100
			},
			monitors: reportMonitors
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/reports/sla@_@ts
var page = () => sla_exports;
//#endregion
export { page };
