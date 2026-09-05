import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
//#region src/pages/api/v1/audit-logs.ts
var audit_logs_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	try {
		const parsed = db.prepare(`
      SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100
    `).all().map((l) => {
			let meta = {};
			try {
				meta = JSON.parse(l.metadata || "{}");
			} catch {}
			return {
				...l,
				metadata: meta
			};
		});
		return new Response(JSON.stringify(parsed), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/audit-logs@_@ts
var page = () => audit_logs_exports;
//#endregion
export { page };
