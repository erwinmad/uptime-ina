import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import crypto from "crypto";
//#region src/pages/api/v1/probe-nodes/heartbeat.ts
var heartbeat_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ request }) => {
	try {
		const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		const { token, latency_ms } = await request.json().catch(() => ({}));
		const rawToken = authHeader || token;
		if (!rawToken) return new Response(JSON.stringify({ error: "Token autentikasi probe node diperlukan" }), { status: 401 });
		const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
		const node = db.prepare("SELECT id, name FROM probe_nodes WHERE api_token_hash = ?").get(tokenHash);
		if (!node) return new Response(JSON.stringify({ error: "Probe node tidak valid" }), { status: 403 });
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		db.prepare(`
      UPDATE probe_nodes 
      SET status = 'online', last_heartbeat_at = ?, latency_ms = COALESCE(?, latency_ms)
      WHERE id = ?
    `).run(nowIso, latency_ms || null, node.id);
		return new Response(JSON.stringify({
			success: true,
			timestamp: nowIso,
			node: node.name
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/probe-nodes/heartbeat@_@ts
var page = () => heartbeat_exports;
//#endregion
export { page };
