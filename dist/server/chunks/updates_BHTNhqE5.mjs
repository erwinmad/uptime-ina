import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { t as broadcastEvent } from "./websocket_DCwyqNSY.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/incidents/[id]/updates.ts
var updates_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ params, request }) => {
	try {
		const { id } = params;
		const { message, status } = await request.json();
		if (!message) return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
		const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(id);
		if (!incident) return new Response(JSON.stringify({ error: "Incident not found" }), { status: 404 });
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		const newStatus = status || incident.status;
		const isResolved = newStatus === "resolved";
		db.prepare(`
      UPDATE incidents 
      SET status = ?, resolved_at = ? 
      WHERE id = ?
    `).run(newStatus, isResolved ? nowIso : incident.resolved_at, id);
		const updateId = "upd_" + nanoid(10);
		db.prepare(`
      INSERT INTO incident_updates (id, incident_id, message, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(updateId, id, message, newStatus, nowIso);
		logAudit("incident.updated", "incident", id, {
			status: newStatus,
			message
		});
		broadcastEvent("incident_updated", {
			id,
			status: newStatus,
			message,
			updatedAt: nowIso
		});
		return new Response(JSON.stringify({
			success: true,
			id,
			status: newStatus
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/incidents/[id]/updates@_@ts
var page = () => updates_exports;
//#endregion
export { page };
