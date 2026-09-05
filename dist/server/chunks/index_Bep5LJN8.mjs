import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { a as hashPassword, c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/users/index.ts
var users_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const users = db.prepare(`
      SELECT id, email, full_name, role, created_at, last_login_at
      FROM users
      ORDER BY created_at ASC
    `).all();
		return new Response(JSON.stringify(users), {
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
		const session = token ? validateSession(token) : null;
		if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		if (session.user.role !== "admin") return new Response(JSON.stringify({ error: "Hanya Admin yang dapat menambahkan operator baru." }), { status: 403 });
		const { email, full_name, password, role = "editor" } = await request.json();
		if (!email || !email.includes("@")) return new Response(JSON.stringify({ error: "Alamat email tidak valid." }), { status: 400 });
		if (!password || password.length < 8) return new Response(JSON.stringify({ error: "Kata sandi minimal 8 karakter." }), { status: 400 });
		if (![
			"admin",
			"editor",
			"viewer"
		].includes(role)) return new Response(JSON.stringify({ error: "Role tidak valid." }), { status: 400 });
		const normalizedEmail = email.trim().toLowerCase();
		if (db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail)) return new Response(JSON.stringify({ error: "Alamat email sudah terdaftar." }), { status: 400 });
		const id = "usr_" + nanoid(10);
		const passwordHash = hashPassword(password);
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, normalizedEmail, passwordHash, full_name?.trim() || "Operator", role, nowIso);
		logAudit("user.created", "user", id, {
			email: normalizedEmail,
			role,
			created_by: session.user.email
		});
		return new Response(JSON.stringify({
			success: true,
			user: {
				id,
				email: normalizedEmail,
				full_name: full_name?.trim() || "Operator",
				role
			}
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
		const session = token ? validateSession(token) : null;
		if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		if (session.user.role !== "admin") return new Response(JSON.stringify({ error: "Hanya Admin yang dapat menghapus operator." }), { status: 403 });
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return new Response(JSON.stringify({ error: "ID operator wajib disertakan." }), { status: 400 });
		if (id === session.user.id) return new Response(JSON.stringify({ error: "Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk." }), { status: 400 });
		const userToDelete = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(id);
		if (!userToDelete) return new Response(JSON.stringify({ error: "Operator tidak ditemukan." }), { status: 404 });
		if (userToDelete.role === "admin") {
			if (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count <= 1) return new Response(JSON.stringify({ error: "Tidak dapat menghapus satu-satunya akun Administrator." }), { status: 400 });
		}
		db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
		db.prepare("DELETE FROM users WHERE id = ?").run(id);
		logAudit("user.deleted", "user", id, {
			email: userToDelete.email,
			deleted_by: session.user.email
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/users/index@_@ts
var page = () => users_exports;
//#endregion
export { page };
