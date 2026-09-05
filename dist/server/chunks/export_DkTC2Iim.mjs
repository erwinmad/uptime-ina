import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
//#region src/pages/api/v1/monitors/[id]/export.ts
var export_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ params, request }) => {
	try {
		const { id } = params;
		const url = new URL(request.url);
		const format = (url.searchParams.get("format") || "csv").toLowerCase();
		const range = (url.searchParams.get("range") || "30d").toLowerCase();
		const monitor = db.prepare("SELECT * FROM monitors WHERE id = ?").get(id);
		if (!monitor) return new Response("Monitor not found", { status: 404 });
		let intervalSql = "'-30 days'";
		if (range === "24h") intervalSql = "'-1 day'";
		else if (range === "7d") intervalSql = "'-7 days'";
		else if (range === "90d") intervalSql = "'-90 days'";
		const checks = db.prepare(`
      SELECT checked_at, status, response_time_ms, status_code, ssl_days_remaining, error_message
      FROM monitor_checks
      WHERE monitor_id = ? AND checked_at >= datetime('now', ${intervalSql})
      ORDER BY checked_at DESC
    `).all(id);
		const safeName = monitor.name.replace(/[^a-zA-Z0-9_-]/g, "_");
		if (format === "json") return new Response(JSON.stringify(checks, null, 2), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="${safeName}_checks_${range}.json"`
			}
		});
		const csvRows = ["timestamp,status,response_time_ms,status_code,ssl_days_remaining,error_message"];
		for (const c of checks) {
			const cleanMsg = (c.error_message || "").replace(/"/g, "\"\"");
			csvRows.push(`"${c.checked_at}","${c.status}",${c.response_time_ms || 0},${c.status_code || ""},${c.ssl_days_remaining || ""},"${cleanMsg}"`);
		}
		return new Response(csvRows.join("\n"), {
			status: 200,
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="${safeName}_checks_${range}.csv"`
			}
		});
	} catch (err) {
		return new Response(`Export error: ${err.message}`, { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/monitors/[id]/export@_@ts
var page = () => export_exports;
//#endregion
export { page };
