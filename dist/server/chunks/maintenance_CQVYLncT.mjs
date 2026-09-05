import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/maintenance.ts
var maintenance_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const windows = db.prepare(`
      SELECT * FROM maintenance_windows ORDER BY start_time DESC
    `).all();
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		const formatted = windows.map((w) => {
			const isCurrentlyActive = w.active && w.start_time <= nowIso && w.end_time >= nowIso;
			let monitorIds = ["*"];
			try {
				monitorIds = JSON.parse(w.affected_monitor_ids || "[\"*\"]");
			} catch {}
			return {
				...w,
				is_currently_active: Boolean(isCurrentlyActive),
				affected_monitor_ids: monitorIds
			};
		});
		return new Response(JSON.stringify(formatted), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { title, description = "", start_time, end_time, affected_monitor_ids = ["*"] } = await request.json();
		if (!title || !start_time || !end_time) return new Response(JSON.stringify({ error: "Title, start_time, and end_time are required" }), { status: 400 });
		const id = "maint_" + nanoid(10);
		const affectedJson = typeof affected_monitor_ids === "string" ? affected_monitor_ids : JSON.stringify(affected_monitor_ids);
		db.prepare(`
      INSERT INTO maintenance_windows (id, title, description, start_time, end_time, affected_monitor_ids, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, title, description, start_time, end_time, affectedJson);
		logAudit("maintenance.created", "maintenance_window", id, {
			title,
			start_time,
			end_time
		});
		return new Response(JSON.stringify({
			id,
			title,
			start_time,
			end_time
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var DELETE = async ({ request }) => {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return new Response(JSON.stringify({ error: "Missing maintenance window id" }), { status: 400 });
		db.prepare("DELETE FROM maintenance_windows WHERE id = ?").run(id);
		logAudit("maintenance.deleted", "maintenance_window", id);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/maintenance@_@ts
var page = () => maintenance_exports;
//#endregion
export { page };
