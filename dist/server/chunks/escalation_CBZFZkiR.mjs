import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/escalation.ts
var escalation_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const parsed = db.prepare("SELECT * FROM escalation_policies ORDER BY created_at DESC").all().map((p) => ({
			...p,
			channel_ids: JSON.parse(p.channel_ids || "[]")
		}));
		return new Response(JSON.stringify(parsed), {
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
		const { name, wait_minutes = 5, channel_ids = [] } = await request.json();
		if (!name) return new Response(JSON.stringify({ error: "Nama kebijakan eskalasi wajib diisi" }), { status: 400 });
		const id = "esc_" + nanoid(10);
		db.prepare(`
      INSERT INTO escalation_policies (id, name, wait_minutes, channel_ids)
      VALUES (?, ?, ?, ?)
    `).run(id, name, wait_minutes, JSON.stringify(channel_ids));
		logAudit("escalation.created", "escalation", id, {
			name,
			wait_minutes
		});
		return new Response(JSON.stringify({
			success: true,
			id
		}), { status: 201 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var DELETE = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return new Response(JSON.stringify({ error: "Policy ID is required" }), { status: 400 });
		db.prepare("DELETE FROM escalation_policies WHERE id = ?").run(id);
		logAudit("escalation.deleted", "escalation", id, {});
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/escalation@_@ts
var page = () => escalation_exports;
//#endregion
export { page };
