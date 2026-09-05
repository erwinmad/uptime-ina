import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { t as broadcastEvent } from "./websocket_DCwyqNSY.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/incidents.ts
var incidents_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const enriched = db.prepare(`
      SELECT 
        i.*,
        m.name as monitor_name,
        m.target as monitor_target
      FROM incidents i
      LEFT JOIN monitors m ON i.monitor_id = m.id
      ORDER BY i.started_at DESC
      LIMIT 50
    `).all().map((inc) => {
			const updates = db.prepare(`
        SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC
      `).all(inc.id);
			return {
				...inc,
				updates
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
		const { monitor_id, title, status = "investigating", message = "Incident created manually" } = await request.json();
		if (!title) return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
		const id = "inc_" + nanoid(10);
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		db.prepare(`
      INSERT INTO incidents (id, monitor_id, title, status, started_at, is_auto_created)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(id, monitor_id || null, title, status, nowIso);
		db.prepare(`
      INSERT INTO incident_updates (id, incident_id, message, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run("upd_" + nanoid(10), id, message, status, nowIso);
		logAudit("incident.created", "incident", id, {
			title,
			monitor_id
		});
		broadcastEvent("incident_created", {
			id,
			title,
			status,
			started_at: nowIso
		});
		return new Response(JSON.stringify({
			id,
			title,
			status,
			started_at: nowIso
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/incidents@_@ts
var page = () => incidents_exports;
//#endregion
export { page };
