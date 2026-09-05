import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit, t as generateApiKey } from "./security_PTJEZbom.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/api-keys.ts
var api_keys_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const parsed = db.prepare("SELECT id, name, key_preview, scopes, last_used_at, created_at FROM api_keys ORDER BY created_at DESC").all().map((k) => ({
			...k,
			scopes: JSON.parse(k.scopes || "[\"*\"]")
		}));
		return new Response(JSON.stringify(parsed), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { name, scopes = ["*"] } = await request.json();
		if (!name) return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
		const { rawKey, keyHash, preview } = generateApiKey(name, scopes);
		const id = "key_" + nanoid(10);
		db.prepare(`
      INSERT INTO api_keys (id, name, key_hash, key_preview, scopes)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, keyHash, preview, JSON.stringify(scopes));
		logAudit("api_key.created", "api_key", id, {
			name,
			scopes
		});
		return new Response(JSON.stringify({
			id,
			name,
			raw_key: rawKey,
			preview,
			scopes,
			message: "Save this API key safely. It will not be shown again."
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
		if (!id) return new Response(JSON.stringify({ error: "Missing key id" }), { status: 400 });
		db.prepare("DELETE FROM api_keys WHERE id = ?").run(id);
		logAudit("api_key.revoked", "api_key", id);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/api-keys@_@ts
var page = () => api_keys_exports;
//#endregion
export { page };
