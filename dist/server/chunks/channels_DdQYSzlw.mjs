import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/channels.ts
var channels_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const formatted = db.prepare("SELECT * FROM notification_channels ORDER BY created_at DESC").all().map((c) => {
			let cfg = {};
			try {
				cfg = JSON.parse(c.config || "{}");
			} catch {}
			return {
				...c,
				config: cfg
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
		const { type, name, config = {} } = await request.json();
		if (!type || !name) return new Response(JSON.stringify({ error: "Type and Name are required" }), { status: 400 });
		const id = "chan_" + nanoid(10);
		const configStr = typeof config === "string" ? config : JSON.stringify(config);
		db.prepare(`
      INSERT INTO notification_channels (id, type, name, config, active)
      VALUES (?, ?, ?, ?, 1)
    `).run(id, type, name, configStr);
		logAudit("channel.created", "channel", id, {
			type,
			name
		});
		return new Response(JSON.stringify({
			id,
			type,
			name,
			config
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
		if (!id) return new Response(JSON.stringify({ error: "ID channel diperlukan" }), { status: 400 });
		db.prepare("DELETE FROM notification_channels WHERE id = ?").run(id);
		logAudit("channel.deleted", "channel", id);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/channels@_@ts
var page = () => channels_exports;
//#endregion
export { page };
