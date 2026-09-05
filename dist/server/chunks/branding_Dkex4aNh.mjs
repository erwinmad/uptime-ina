import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as getBrandingSettings, o as updateBrandingSettings } from "./db_BJLNYA76.mjs";
import { i as logAudit } from "./security_PTJEZbom.mjs";
import { t as broadcastEvent } from "./websocket_DCwyqNSY.mjs";
//#region src/pages/api/v1/settings/branding.ts
var branding_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	try {
		const branding = getBrandingSettings();
		return new Response(JSON.stringify(branding), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		updateBrandingSettings(body);
		const updated = getBrandingSettings();
		logAudit("branding.updated", "system_settings", "branding", body);
		broadcastEvent("branding_updated", updated);
		return new Response(JSON.stringify(updated), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/v1/settings/branding@_@ts
var page = () => branding_exports;
//#endregion
export { page };
