import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit, n as generatePushToken } from "./security_PTJEZbom.mjs";
import { n as isUnderMaintenance, t as executeCheck } from "./engine_D9OuBn11.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/monitors.ts
var monitors_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const enriched = db.prepare(`
      SELECT m.*, 
        (SELECT COUNT(*) FROM incidents i WHERE i.monitor_id = m.id AND i.status != 'resolved') as active_incidents_count
      FROM monitors m 
      ORDER BY m.created_at DESC
    `).all().map((m) => {
			const recentChecks = db.prepare(`
        SELECT status, response_time_ms, checked_at 
        FROM monitor_checks 
        WHERE monitor_id = ? 
        ORDER BY checked_at DESC 
        LIMIT 30
      `).all(m.id);
			const stats24h = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_count,
          AVG(CASE WHEN status = 'up' AND response_time_ms > 0 THEN response_time_ms ELSE NULL END) as avg_latency
        FROM monitor_checks 
        WHERE monitor_id = ? AND checked_at >= datetime('now', '-1 day')
      `).get(m.id);
			const uptime24h = stats24h && stats24h.total > 0 ? Number((stats24h.up_count / stats24h.total * 100).toFixed(2)) : 100;
			let parsedTags = [];
			try {
				parsedTags = JSON.parse(m.tags || "[]");
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
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const id = "mon_" + nanoid(10);
		const { name, type = "http", target, port = null, interval_seconds = 60, timeout_seconds = 15, retries_before_down = 3, http_method = "GET", http_headers = "{}", http_body = "", expected_status_codes = "[200]", keyword_match = "", keyword_type = "contains", ssl_check_enabled = 0, ssl_expiry_alert_days = 14, tags = [], dns_record_type = "A", dns_expected_value = "", category_name = "Uncategorized" } = body;
		if (!name || !target) return new Response(JSON.stringify({ error: "Name and Target are required" }), { status: 400 });
		let pushTokenRaw = null;
		let pushTokenHash = null;
		let pushInterval = null;
		let pushGrace = 60;
		if (type === "push") {
			const generated = generatePushToken();
			pushTokenRaw = generated.rawToken;
			pushTokenHash = generated.tokenHash;
			pushInterval = Number(body.push_expected_interval_seconds) || interval_seconds || 60;
			pushGrace = Number(body.push_grace_period_seconds) || 60;
		}
		const tagsJson = typeof tags === "string" ? tags : JSON.stringify(tags);
		db.prepare(`
      INSERT INTO monitors (
        id, name, type, target, port, interval_seconds, timeout_seconds, retries_before_down,
        http_method, http_headers, http_body, expected_status_codes, keyword_match, keyword_type,
        ssl_check_enabled, ssl_expiry_alert_days, push_token_raw, push_token_hash, 
        push_expected_interval_seconds, push_grace_period_seconds, tags, dns_record_type, dns_expected_value, category_name
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `).run(id, name, type, target, port, interval_seconds, timeout_seconds, retries_before_down, http_method, http_headers, http_body, expected_status_codes, keyword_match, keyword_type, ssl_check_enabled ? 1 : 0, ssl_expiry_alert_days, pushTokenRaw, pushTokenHash, pushInterval, pushGrace, tagsJson, dns_record_type, dns_expected_value, category_name);
		logAudit("monitor.created", "monitor", id, {
			name,
			type,
			target
		});
		const newMonitor = db.prepare("SELECT * FROM monitors WHERE id = ?").get(id);
		if (type !== "push") executeCheck(newMonitor).catch(console.error);
		return new Response(JSON.stringify(newMonitor), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/monitors@_@ts
var page = () => monitors_exports;
//#endregion
export { page };
