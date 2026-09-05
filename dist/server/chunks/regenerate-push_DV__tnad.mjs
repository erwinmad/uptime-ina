import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import crypto from "crypto";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/monitors/[id]/regenerate-push.ts
var regenerate_push_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ params, request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const { id } = params;
		const monitor = db.prepare("SELECT * FROM monitors WHERE id = ?").get(id);
		if (!monitor) return new Response(JSON.stringify({ error: "Monitor not found" }), { status: 404 });
		const rawToken = nanoid(32);
		const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
		db.prepare(`
      UPDATE monitors 
      SET push_token_raw = ?, push_token_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(rawToken, hash, id);
		logAudit("monitor.push_token_rotated", "monitor", id, { name: monitor.name });
		return new Response(JSON.stringify({
			success: true,
			push_token_raw: rawToken
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/monitors/[id]/regenerate-push@_@ts
var page = () => regenerate_push_exports;
//#endregion
export { page };
