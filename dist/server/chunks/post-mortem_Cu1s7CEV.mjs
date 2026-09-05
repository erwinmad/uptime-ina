import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
//#region src/pages/api/v1/incidents/[id]/post-mortem.ts
var post_mortem_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ params, request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const { id } = params;
		const { root_cause, action_items, prevention_plan } = await request.json();
		const incident = db.prepare("SELECT id, title FROM incidents WHERE id = ?").get(id);
		if (!incident) return new Response(JSON.stringify({ error: "Incident not found" }), { status: 404 });
		db.prepare(`
      UPDATE incidents
      SET root_cause = ?, action_items = ?, prevention_plan = ?
      WHERE id = ?
    `).run(root_cause || "", action_items || "", prevention_plan || "", id);
		logAudit("incident.post_mortem_updated", "incident", id, { title: incident.title });
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/incidents/[id]/post-mortem@_@ts
var page = () => post_mortem_exports;
//#endregion
export { page };
