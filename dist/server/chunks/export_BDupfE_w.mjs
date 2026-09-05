import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as validateSession, n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/v1/backup/export.ts
var export_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ request, cookies }) => {
	try {
		const token = cookies.get("sentinel_session")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		const session = token ? validateSession(token) : null;
		if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		if (session.user.role !== "admin") return new Response(JSON.stringify({ error: "Hanya Admin yang dapat mengunduh backup database" }), { status: 403 });
		const format = new URL(request.url).searchParams.get("format") || "json";
		const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		logAudit("backup.exported", "system", "backup", {
			format,
			exported_by: session.user.email
		});
		if (format === "sqlite") {
			const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "sentinelup.db");
			if (!fs.existsSync(dbPath)) return new Response(JSON.stringify({ error: "File database tidak ditemukan" }), { status: 404 });
			try {
				db.pragma("wal_checkpoint(TRUNCATE)");
			} catch {}
			const fileBuffer = fs.readFileSync(dbPath);
			return new Response(fileBuffer, {
				status: 200,
				headers: {
					"Content-Type": "application/x-sqlite3",
					"Content-Disposition": `attachment; filename="sentinelup-backup-${dateStr}.db"`,
					"Content-Length": fileBuffer.length.toString()
				}
			});
		}
		const monitors = db.prepare("SELECT * FROM monitors").all();
		const channels = db.prepare("SELECT id, type, name, active, created_at FROM notification_channels").all();
		const statusPages = db.prepare("SELECT id, slug, title, description, is_public, created_at FROM status_pages").all();
		const onCall = db.prepare("SELECT * FROM on_call_schedules").all();
		const escalations = db.prepare("SELECT * FROM escalation_policies").all();
		const maintenance = db.prepare("SELECT * FROM maintenance_windows").all();
		const exportData = {
			version: "1.0",
			exported_at: (/* @__PURE__ */ new Date()).toISOString(),
			exported_by: session.user.email,
			data: {
				monitors,
				notification_channels: channels,
				status_pages: statusPages,
				on_call_schedules: onCall,
				escalation_policies: escalations,
				maintenance_windows: maintenance
			}
		};
		const jsonStr = JSON.stringify(exportData, null, 2);
		return new Response(jsonStr, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="sentinelup-export-${dateStr}.json"`
			}
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/backup/export@_@ts
var page = () => export_exports;
//#endregion
export { page };
