import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, l as verifyPassword, n as db, r as deleteSession, t as createSession } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
//#region src/pages/api/v1/auth.ts
var auth_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async ({ cookies, request }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		const session = token ? validateSession(token) : null;
		return new Response(JSON.stringify({
			authenticated: !!session,
			user: session ? session.user : null
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var POST = async ({ request, cookies }) => {
	try {
		const { action, email, password } = await request.json();
		if (action === "setup" || action === "register") return new Response(JSON.stringify({ error: "Pendaftaran akun publik dinonaktifkan demi keamanan. Silakan masuk menggunakan akun operator." }), { status: 403 });
		if (action === "login") {
			if (!email || !password) return new Response(JSON.stringify({ error: "Email dan kata sandi wajib diisi." }), { status: 400 });
			const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
			if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) return new Response(JSON.stringify({ error: "Email atau kata sandi tidak cocok." }), { status: 401 });
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(nowIso, user.id);
			const session = createSession(user.id);
			cookies.set("sentinel_session", session.token, {
				path: "/",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 2592e3
			});
			logAudit("user.login_success", "user", user.id, { email: user.email });
			return new Response(JSON.stringify({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					full_name: user.full_name,
					role: user.role
				}
			}), { status: 200 });
		}
		if (action === "logout") {
			const token = cookies.get("sentinel_session")?.value;
			if (token) deleteSession(token);
			cookies.delete("sentinel_session", { path: "/" });
			return new Response(JSON.stringify({ success: true }), { status: 200 });
		}
		return new Response(JSON.stringify({ error: "Aksi tidak valid." }), { status: 400 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/auth@_@ts
var page = () => auth_exports;
//#endregion
export { page };
