import { n as db } from "./db_BJLNYA76.mjs";
import crypto from "crypto";
//#region src/lib/security.ts
function hashToken(token) {
	return crypto.createHash("sha256").update(token).digest("hex");
}
function generatePushToken() {
	const rawToken = crypto.randomBytes(24).toString("base64url");
	return {
		rawToken,
		tokenHash: hashToken(rawToken)
	};
}
function generateApiKey(name, scopes = ["*"]) {
	const rawKey = `sk_live_${crypto.randomBytes(20).toString("hex")}`;
	return {
		rawKey,
		keyHash: hashToken(rawKey),
		preview: `sk_live_...${rawKey.slice(-6)}`
	};
}
function logAudit(action, resourceType, resourceId, metadata = {}) {
	try {
		db.prepare(`
      INSERT INTO audit_logs (action, resource_type, resource_id, metadata)
      VALUES (?, ?, ?, ?)
    `).run(action, resourceType || null, resourceId || null, JSON.stringify(metadata));
	} catch (err) {
		console.error("Audit log error:", err);
	}
}
//#endregion
export { logAudit as i, generatePushToken as n, hashToken as r, generateApiKey as t };
