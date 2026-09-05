import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { t as executeCheck } from "./engine_D9OuBn11.mjs";
//#region src/pages/api/v1/monitors/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	PATCH: () => PATCH
});
var GET = async ({ params }) => {
	try {
		const { id } = params;
		const monitor = db.prepare("SELECT * FROM monitors WHERE id = ?").get(id);
		if (!monitor) return new Response(JSON.stringify({ error: "Monitor not found" }), { status: 404 });
		const recentChecks = db.prepare(`
      SELECT * FROM monitor_checks 
      WHERE monitor_id = ? 
      ORDER BY checked_at DESC 
      LIMIT 100
    `).all(id);
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
		const incidents = db.prepare(`
      SELECT * FROM incidents WHERE monitor_id = ? ORDER BY started_at DESC LIMIT 10
    `).all(id);
		return new Response(JSON.stringify({
			...monitor,
			recent_checks: recentChecks,
			daily_history: dailyHistory,
			incidents
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var PATCH = async ({ params, request }) => {
	try {
		const { id } = params;
		const body = await request.json();
		const allowedFields = [
			"name",
			"target",
			"port",
			"interval_seconds",
			"timeout_seconds",
			"retries_before_down",
			"http_method",
			"http_headers",
			"http_body",
			"expected_status_codes",
			"keyword_match",
			"keyword_type",
			"ssl_check_enabled",
			"ssl_expiry_alert_days",
			"active",
			"current_status",
			"push_expected_interval_seconds",
			"push_grace_period_seconds",
			"tags",
			"dns_record_type",
			"dns_expected_value",
			"category_name"
		];
		const updates = [];
		const values = [];
		for (const field of allowedFields) if (body[field] !== void 0) {
			updates.push(`${field} = ?`);
			let val = body[field];
			if (typeof val === "object" && val !== null) val = JSON.stringify(val);
			values.push(val);
		}
		if (updates.length === 0) return new Response(JSON.stringify({ error: "No valid fields provided" }), { status: 400 });
		updates.push("updated_at = datetime('now')");
		values.push(id);
		db.prepare(`UPDATE monitors SET ${updates.join(", ")} WHERE id = ?`).run(...values);
		logAudit("monitor.updated", "monitor", id, body);
		const updated = db.prepare("SELECT * FROM monitors WHERE id = ?").get(id);
		if (body.run_check_now) executeCheck(updated).catch(console.error);
		return new Response(JSON.stringify(updated), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var DELETE = async ({ params }) => {
	try {
		const { id } = params;
		db.prepare("DELETE FROM monitors WHERE id = ?").run(id);
		logAudit("monitor.deleted", "monitor", id);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/monitors/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };
