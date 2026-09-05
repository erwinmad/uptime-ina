import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { nanoid } from "nanoid";
//#region src/pages/api/v1/on-call.ts
var on_call_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
});
var GET = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const parsed = db.prepare("SELECT * FROM on_call_schedules ORDER BY created_at DESC").all().map((s) => ({
			...s,
			shift_days: JSON.parse(s.shift_days || "[]")
		}));
		return new Response(JSON.stringify(parsed), {
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
		const { name, primary_name, primary_contact, secondary_name, secondary_contact, shift_days, shift_start_time, shift_end_time } = await request.json();
		if (!name || !primary_name || !primary_contact) return new Response(JSON.stringify({ error: "Nama jadwal, nama operator utama, dan kontak wajib diisi" }), { status: 400 });
		const id = "oncall_" + nanoid(10);
		db.prepare(`
      INSERT INTO on_call_schedules (id, name, primary_name, primary_contact, secondary_name, secondary_contact, shift_days, shift_start_time, shift_end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, primary_name, primary_contact, secondary_name || "", secondary_contact || "", JSON.stringify(shift_days || [
			"Senin",
			"Selasa",
			"Rabu",
			"Kamis",
			"Jumat",
			"Sabtu",
			"Minggu"
		]), shift_start_time || "08:00", shift_end_time || "20:00");
		logAudit("oncall.created", "on_call", id, {
			name,
			primary_name
		});
		return new Response(JSON.stringify({
			success: true,
			id
		}), { status: 201 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var DELETE = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (!(token ? validateSession(token) : null)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return new Response(JSON.stringify({ error: "Schedule ID is required" }), { status: 400 });
		db.prepare("DELETE FROM on_call_schedules WHERE id = ?").run(id);
		logAudit("oncall.deleted", "on_call", id, {});
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/on-call@_@ts
var page = () => on_call_exports;
//#endregion
export { page };
