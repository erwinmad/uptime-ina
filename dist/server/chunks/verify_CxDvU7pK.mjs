import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { l as verifyPassword, n as db } from "./db_BJLNYA76.mjs";
//#region src/pages/api/v1/status-pages/[slug]/verify.ts
var verify_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ params, request, cookies }) => {
	try {
		const { slug } = params;
		const { password } = await request.json();
		const page = db.prepare("SELECT * FROM status_pages WHERE slug = ?").get(slug);
		if (!page) return new Response(JSON.stringify({ error: "Status page not found" }), { status: 404 });
		if (!page.password_hash || page.password_hash.trim() === "") return new Response(JSON.stringify({
			success: true,
			message: "No password required"
		}), { status: 200 });
		if (!password || !verifyPassword(password, page.password_hash)) return new Response(JSON.stringify({ error: "Kata sandi salah." }), { status: 401 });
		cookies.set(`sp_auth_${slug}`, "unlocked", {
			path: `/status/${slug}`,
			httpOnly: true,
			sameSite: "lax",
			maxAge: 604800
		});
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/status-pages/[slug]/verify@_@ts
var page = () => verify_exports;
//#endregion
export { page };
