import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { a as hashPassword, c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/status-pages/index.ts
var status_pages_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const result = db.prepare(`
      SELECT id, slug, title, description, is_public, password_hash, theme_config, created_at
      FROM status_pages
      ORDER BY created_at ASC
    `).all().map((p) => {
			const monitorRows = db.prepare(`
        SELECT monitor_id FROM status_page_monitors WHERE status_page_id = ? ORDER BY display_order ASC
      `).all(p.id);
			return {
				id: p.id,
				slug: p.slug,
				title: p.title,
				description: p.description,
				is_public: p.is_public === 1,
				is_protected: Boolean(p.password_hash && p.password_hash.trim() !== ""),
				url: `/status/${p.slug}`,
				monitor_ids: monitorRows.map((m) => m.monitor_id),
				monitors_count: monitorRows.length,
				created_at: p.created_at
			};
		});
		return new Response(JSON.stringify(result), {
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
		const { title, slug: rawSlug, description = "", is_public = true, password = "", monitor_ids = [] } = await request.json();
		if (!title || !title.trim()) return new Response(JSON.stringify({ error: "Judul status page wajib diisi" }), { status: 400 });
		const slug = (rawSlug || title).toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
		if (!slug) return new Response(JSON.stringify({ error: "Slug tidak valid" }), { status: 400 });
		if (db.prepare("SELECT id FROM status_pages WHERE slug = ?").get(slug)) return new Response(JSON.stringify({ error: `Slug "${slug}" sudah digunakan. Pilih slug lain.` }), { status: 400 });
		const id = "sp_" + nanoid(10);
		const passwordHash = password && password.trim() !== "" ? hashPassword(password) : null;
		db.prepare(`
      INSERT INTO status_pages (id, slug, title, description, is_public, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, slug, title.trim(), description.trim(), is_public ? 1 : 0, passwordHash);
		if (Array.isArray(monitor_ids) && monitor_ids.length > 0) {
			const insertStmt = db.prepare(`
        INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order)
        VALUES (?, ?, ?)
      `);
			for (let i = 0; i < monitor_ids.length; i++) insertStmt.run(id, monitor_ids[i], i);
		}
		logAudit("status_page.created", "status_page", id, {
			slug,
			title,
			monitor_count: monitor_ids.length
		});
		return new Response(JSON.stringify({
			success: true,
			id,
			slug,
			url: `/status/${slug}`
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var DELETE = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return new Response(JSON.stringify({ error: "ID status page wajib disertakan" }), { status: 400 });
		const page = db.prepare("SELECT id, slug FROM status_pages WHERE id = ?").get(id);
		if (!page) return new Response(JSON.stringify({ error: "Status page tidak ditemukan" }), { status: 404 });
		if (page.slug === "main") return new Response(JSON.stringify({ error: "Status page utama (main) tidak dapat dihapus." }), { status: 403 });
		db.prepare("DELETE FROM status_pages WHERE id = ?").run(id);
		logAudit("status_page.deleted", "status_page", id, { slug: page.slug });
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/status-pages/index@_@ts
var page = () => status_pages_exports;
//#endregion
export { page };
