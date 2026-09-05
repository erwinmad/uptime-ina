import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/status-pages/[slug]/subscribe.ts
var subscribe_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ params, request }) => {
	try {
		const { slug } = params;
		const { email } = await request.json();
		if (!email || !email.includes("@")) return new Response(JSON.stringify({ error: "Alamat email tidak valid." }), { status: 400 });
		const page = db.prepare("SELECT id FROM status_pages WHERE slug = ?").get(slug);
		if (!page) return new Response(JSON.stringify({ error: "Status page not found" }), { status: 404 });
		if (db.prepare("SELECT id FROM status_page_subscribers WHERE status_page_id = ? AND email = ?").get(page.id, email.toLowerCase().trim())) return new Response(JSON.stringify({
			success: true,
			message: "Email Anda sudah terdaftar untuk langganan notifikasi."
		}), { status: 200 });
		const id = "sub_" + nanoid(10);
		db.prepare("INSERT INTO status_page_subscribers (id, status_page_id, email) VALUES (?, ?, ?)").run(id, page.id, email.toLowerCase().trim());
		return new Response(JSON.stringify({
			success: true,
			message: "Berhasil berlangganan notifikasi insiden!"
		}), { status: 201 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/status-pages/[slug]/subscribe@_@ts
var page = () => subscribe_exports;
//#endregion
export { page };
