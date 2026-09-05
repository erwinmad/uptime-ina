import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as getBrandingSettings, n as db } from "./db_BJLNYA76.mjs";
//#region src/pages/api/v1/status-pages/[slug].ts
var _slug__exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ params }) => {
	try {
		const { slug } = params;
		const page = db.prepare("SELECT * FROM status_pages WHERE slug = ?").get(slug);
		if (!page) return new Response(JSON.stringify({ error: "Status page not found" }), { status: 404 });
		const branding = getBrandingSettings();
		let monitors = db.prepare(`
      SELECT m.id, m.name, m.type, m.current_status, m.last_checked_at, m.interval_seconds, spm.custom_label
      FROM status_page_monitors spm
      JOIN monitors m ON spm.monitor_id = m.id
      WHERE spm.status_page_id = ? AND m.active = 1
      ORDER BY spm.display_order ASC
    `).all(page.id);
		if (monitors.length === 0) monitors = db.prepare(`
        SELECT id, name, type, current_status, last_checked_at, interval_seconds, name as custom_label
        FROM monitors
        WHERE active = 1
        ORDER BY created_at ASC
      `).all();
		const anyDown = monitors.some((m) => m.current_status === "down");
		const systemStatus = monitors.length === 0 ? "operational" : anyDown ? "degraded" : "operational";
		const enrichedMonitors = monitors.map((m) => {
			const recentChecks = db.prepare(`
        SELECT status, response_time_ms, checked_at
        FROM monitor_checks
        WHERE monitor_id = ?
        ORDER BY checked_at DESC
        LIMIT 30
      `).all(m.id).reverse();
			const history = db.prepare(`
        SELECT 
          date(checked_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_count
        FROM monitor_checks
        WHERE monitor_id = ? AND checked_at >= datetime('now', '-60 days')
        GROUP BY date(checked_at)
        ORDER BY date ASC
      `).all(m.id);
			const totalChecks = history.reduce((sum, h) => sum + h.total, 0);
			const totalUp = history.reduce((sum, h) => sum + h.up_count, 0);
			const uptimePercentage = totalChecks > 0 ? Number((totalUp / totalChecks * 100).toFixed(2)) : 100;
			const lastCheck = recentChecks.length > 0 ? recentChecks[recentChecks.length - 1] : null;
			return {
				...m,
				uptime_percentage: uptimePercentage,
				recent_checks: recentChecks,
				avg_latency: lastCheck ? lastCheck.response_time_ms : null,
				history
			};
		});
		const enrichedIncidents = db.prepare(`
      SELECT i.*, m.name as monitor_name
      FROM incidents i
      LEFT JOIN monitors m ON i.monitor_id = m.id
      ORDER BY i.started_at DESC
      LIMIT 10
    `).all().map((inc) => {
			const updates = db.prepare("SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC").all(inc.id);
			return {
				...inc,
				updates
			};
		});
		return new Response(JSON.stringify({
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
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/status-pages/[slug]@_@ts
var page = () => _slug__exports;
//#endregion
export { page };
