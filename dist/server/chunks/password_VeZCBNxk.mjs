import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, l as verifyPassword, n as db, s as updateUserPassword } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
//#region src/pages/api/v1/auth/password.ts
var password_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		const session = token ? validateSession(token) : null;
		if (!session) return new Response(JSON.stringify({ error: "Akses ditolak. Silakan masuk kembali." }), { status: 401 });
		const { current_password, new_password } = await request.json();
		if (!current_password || !new_password) return new Response(JSON.stringify({ error: "Kata sandi lama dan baru wajib diisi." }), { status: 400 });
		if (new_password.length < 6) return new Response(JSON.stringify({ error: "Kata sandi baru minimal 6 karakter." }), { status: 400 });
		const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user.id);
		if (!user || !user.password_hash || !verifyPassword(current_password, user.password_hash)) return new Response(JSON.stringify({ error: "Kata sandi saat ini tidak cocok." }), { status: 400 });
		if (!updateUserPassword(session.user.id, new_password)) return new Response(JSON.stringify({ error: "Gagal memperbarui kata sandi di database." }), { status: 500 });
		logAudit("user.password_changed", "user", session.user.id, { email: session.user.email });
		return new Response(JSON.stringify({
			success: true,
			message: "Kata sandi berhasil diperbarui!"
		}), { status: 200 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/auth/password@_@ts
var page = () => password_exports;
//#endregion
export { page };
