import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as db } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
//#region src/pages/api/v1/channels/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({ DELETE: () => DELETE });
var DELETE = async ({ params }) => {
	try {
		const { id } = params;
		db.prepare("DELETE FROM notification_channels WHERE id = ?").run(id);
		logAudit("channel.deleted", "channel", id);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/channels/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };
