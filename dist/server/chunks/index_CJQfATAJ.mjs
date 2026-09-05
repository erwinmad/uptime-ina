import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import crypto from "crypto";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/probe-nodes/index.ts
var probe_nodes_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const nodes = db.prepare(`
      SELECT id, name, region, status, last_heartbeat_at, latency_ms, created_at
      FROM probe_nodes
      ORDER BY created_at ASC
    `).all();
		const now = Date.now();
		const evaluated = nodes.map((node) => {
			const last = node.last_heartbeat_at ? new Date(node.last_heartbeat_at).getTime() : 0;
			const isOnline = last > 0 && now - last < 3e5;
			return {
				...node,
				status: isOnline ? "online" : "offline"
			};
		});
		return new Response(JSON.stringify(evaluated), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var POST = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const { name, region = "cjr-dc1" } = await request.json();
		if (!name || !name.trim()) return new Response(JSON.stringify({ error: "Nama Probe Node wajib diisi" }), { status: 400 });
		const id = "prb_" + nanoid(10);
		const rawSecret = "prb_sec_" + crypto.randomBytes(24).toString("hex");
		const tokenHash = crypto.createHash("sha256").update(rawSecret).digest("hex");
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		db.prepare(`
      INSERT INTO probe_nodes (id, name, region, api_token_hash, status, last_heartbeat_at, latency_ms, created_at)
      VALUES (?, ?, ?, ?, 'online', ?, 8, ?)
    `).run(id, name.trim(), region.trim().toLowerCase(), tokenHash, nowIso, nowIso);
		logAudit("probe_node.created", "probe_node", id, {
			name,
			region
		});
		return new Response(JSON.stringify({
			success: true,
			node: {
				id,
				name: name.trim(),
				region: region.trim().toLowerCase()
			},
			secret_token: rawSecret
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var DELETE = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return new Response(JSON.stringify({ error: "ID probe node wajib disertakan" }), { status: 400 });
		db.prepare("DELETE FROM probe_nodes WHERE id = ?").run(id);
		logAudit("probe_node.deleted", "probe_node", id);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/probe-nodes/index@_@ts
var page = () => probe_nodes_exports;
//#endregion
export { page };
