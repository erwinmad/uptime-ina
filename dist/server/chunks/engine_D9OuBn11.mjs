import { n as db } from "./db_BJLNYA76.mjs";
import { t as broadcastEvent } from "./websocket_DCwyqNSY.mjs";
import { t as dispatchAlert } from "./notifications_DFyq7ssr.mjs";
import { nanoid } from "nanoid";
import http from "http";
import https from "https";
import net from "net";
import tls from "tls";
import dns from "dns";
//#region src/lib/engine.ts
var recentDownEvents = [];
var massOutageAlertSent = false;
var lastMassAlertTime = 0;
/** Check SSL expiration for HTTPS targets */
async function checkSslCertificate(hostname, port = 443, timeoutMs = 8e3) {
	return new Promise((resolve) => {
		try {
			const socket = tls.connect({
				host: hostname,
				port,
				servername: hostname,
				timeout: timeoutMs,
				rejectUnauthorized: false
			}, () => {
				const cert = socket.getPeerCertificate();
				socket.destroy();
				if (cert && cert.valid_to) {
					const expiryDate = new Date(cert.valid_to);
					const now = /* @__PURE__ */ new Date();
					resolve(Math.floor((expiryDate.getTime() - now.getTime()) / 864e5));
				} else resolve(void 0);
			});
			socket.on("error", () => {
				socket.destroy();
				resolve(void 0);
			});
			socket.on("timeout", () => {
				socket.destroy();
				resolve(void 0);
			});
		} catch {
			resolve(void 0);
		}
	});
}
/** Check HTTP / HTTPS target */
async function probeHttp(monitor) {
	const startTime = Date.now();
	let targetUrl = monitor.target;
	if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) targetUrl = "http://" + targetUrl;
	const expectedCodes = JSON.parse(monitor.expected_status_codes || "[200]");
	let customHeaders = {};
	try {
		customHeaders = JSON.parse(monitor.http_headers || "{}");
	} catch {}
	const timeoutMs = (monitor.timeout_seconds || 15) * 1e3;
	const isHttps = targetUrl.startsWith("https://");
	let sslDaysRemaining;
	if (isHttps && monitor.ssl_check_enabled) try {
		const parsed = new URL(targetUrl);
		sslDaysRemaining = await checkSslCertificate(parsed.hostname, parsed.port ? parseInt(parsed.port) : 443, timeoutMs);
	} catch {}
	return new Promise((resolve) => {
		try {
			const parsedUrl = new URL(targetUrl);
			const req = (isHttps ? https : http).request({
				protocol: parsedUrl.protocol,
				hostname: parsedUrl.hostname,
				port: parsedUrl.port || (isHttps ? 443 : 80),
				path: parsedUrl.pathname + parsedUrl.search,
				method: monitor.http_method || "GET",
				headers: {
					"User-Agent": "SentinelUp-Monitor/1.0",
					...customHeaders
				},
				timeout: timeoutMs,
				rejectUnauthorized: false
			}, (res) => {
				let body = "";
				res.on("data", (chunk) => {
					if (body.length < 5e4) body += chunk.toString();
				});
				res.on("end", () => {
					const responseTimeMs = Date.now() - startTime;
					const statusCode = res.statusCode || 0;
					const isCodeOk = expectedCodes.includes(statusCode);
					let isKeywordOk = true;
					if (monitor.keyword_match && monitor.keyword_match.trim() !== "") {
						const hasKw = body.includes(monitor.keyword_match);
						if (monitor.keyword_type === "not_contains") isKeywordOk = !hasKw;
						else isKeywordOk = hasKw;
					}
					if (!isCodeOk) resolve({
						status: "down",
						responseTimeMs,
						statusCode,
						errorMessage: `Expected status [${expectedCodes.join(", ")}], got ${statusCode}`,
						sslDaysRemaining
					});
					else if (!isKeywordOk) resolve({
						status: "down",
						responseTimeMs,
						statusCode,
						errorMessage: `Keyword assertion failed: "${monitor.keyword_match}" (${monitor.keyword_type || "contains"})`,
						sslDaysRemaining
					});
					else resolve({
						status: "up",
						responseTimeMs,
						statusCode,
						sslDaysRemaining
					});
				});
			});
			req.on("timeout", () => {
				req.destroy();
				resolve({
					status: "down",
					responseTimeMs: Date.now() - startTime,
					errorMessage: `Request timed out after ${monitor.timeout_seconds || 15}s`,
					sslDaysRemaining
				});
			});
			req.on("error", (err) => {
				resolve({
					status: "down",
					responseTimeMs: Date.now() - startTime,
					errorMessage: err.message || "Connection failed",
					sslDaysRemaining
				});
			});
			if (monitor.http_body && [
				"POST",
				"PUT",
				"PATCH"
			].includes(monitor.http_method.toUpperCase())) req.write(monitor.http_body);
			req.end();
		} catch (err) {
			resolve({
				status: "down",
				responseTimeMs: Date.now() - startTime,
				errorMessage: err.message || "Invalid URL or config",
				sslDaysRemaining
			});
		}
	});
}
/** Check TCP Port target */
async function probeTcp(monitor) {
	const startTime = Date.now();
	const host = monitor.target.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
	const port = monitor.port || 80;
	const timeoutMs = (monitor.timeout_seconds || 15) * 1e3;
	return new Promise((resolve) => {
		const socket = new net.Socket();
		socket.setTimeout(timeoutMs);
		socket.connect(port, host, () => {
			const responseTimeMs = Date.now() - startTime;
			socket.destroy();
			resolve({
				status: "up",
				responseTimeMs
			});
		});
		socket.on("timeout", () => {
			socket.destroy();
			resolve({
				status: "down",
				responseTimeMs: Date.now() - startTime,
				errorMessage: `TCP connection timed out after ${monitor.timeout_seconds}s`
			});
		});
		socket.on("error", (err) => {
			socket.destroy();
			resolve({
				status: "down",
				responseTimeMs: Date.now() - startTime,
				errorMessage: `TCP socket error: ${err.message}`
			});
		});
	});
}
/** Check Push / Heartbeat target (evaluated by schedule expiration) */
function checkPushHeartbeat(monitor) {
	const now = Date.now();
	const lastReceived = monitor.push_last_received_at ? new Date(monitor.push_last_received_at).getTime() : 0;
	const intervalSeconds = monitor.push_expected_interval_seconds || monitor.interval_seconds || 60;
	const graceSeconds = monitor.push_grace_period_seconds || 60;
	const maxAllowedAgeMs = (intervalSeconds + graceSeconds) * 1e3;
	if (lastReceived === 0) return {
		status: "pending",
		responseTimeMs: 0,
		errorMessage: "Waiting for initial push heartbeat"
	};
	const ageMs = now - lastReceived;
	if (ageMs > maxAllowedAgeMs) return {
		status: "down",
		responseTimeMs: 0,
		errorMessage: `Push heartbeat missed: expected every ${intervalSeconds}s (grace: ${graceSeconds}s), last ping ${Math.round(ageMs / 1e3)}s ago`
	};
	return {
		status: "up",
		responseTimeMs: 0
	};
}
/** Check DNS resolution for hostname */
async function probeDns(monitor) {
	const startTime = Date.now();
	const host = monitor.target.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
	const recordType = (monitor.dns_record_type || "A").toUpperCase();
	return new Promise(async (resolve) => {
		try {
			let records = [];
			if (recordType === "AAAA") records = await dns.promises.resolve6(host);
			else if (recordType === "CNAME") records = await dns.promises.resolveCname(host);
			else if (recordType === "MX") records = (await dns.promises.resolveMx(host)).map((m) => `${m.exchange} (${m.priority})`);
			else if (recordType === "TXT") records = (await dns.promises.resolveTxt(host)).map((t) => t.join(" "));
			else records = await dns.promises.resolve4(host);
			const responseTimeMs = Date.now() - startTime;
			if (monitor.dns_expected_value && monitor.dns_expected_value.trim() !== "") {
				const expected = monitor.dns_expected_value.trim();
				if (!records.some((r) => r.includes(expected))) {
					resolve({
						status: "down",
						responseTimeMs,
						errorMessage: `DNS ${recordType} expected "${expected}", got [${records.join(", ")}]`
					});
					return;
				}
			}
			resolve({
				status: "up",
				responseTimeMs
			});
		} catch (err) {
			resolve({
				status: "down",
				responseTimeMs: Date.now() - startTime,
				errorMessage: `DNS query failed: ${err.message || "Lookup error"}`
			});
		}
	});
}
/** Check if a monitor is covered by an active maintenance window */
function isUnderMaintenance(monitorId) {
	try {
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		const windows = db.prepare(`
      SELECT affected_monitor_ids FROM maintenance_windows 
      WHERE active = 1 AND start_time <= ? AND end_time >= ?
    `).all(nowIso, nowIso);
		for (const w of windows) {
			const ids = JSON.parse(w.affected_monitor_ids || "[\"*\"]");
			if (ids.includes("*") || ids.includes(monitorId)) return true;
		}
	} catch (err) {
		console.error("Error checking maintenance window:", err);
	}
	return false;
}
/** Execute probe for a single monitor */
async function executeCheck(monitor) {
	let result;
	if (monitor.type === "push") {
		result = checkPushHeartbeat(monitor);
		if (result.status === "pending") return;
	} else if (monitor.type === "dns") result = await probeDns(monitor);
	else if (monitor.type === "tcp" || monitor.type === "ping") result = await probeTcp(monitor);
	else result = await probeHttp(monitor);
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	const inMaintenance = isUnderMaintenance(monitor.id);
	db.prepare(`
    INSERT INTO monitor_checks (monitor_id, status, response_time_ms, status_code, error_message, ssl_days_remaining, checked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(monitor.id, result.status, result.responseTimeMs || 0, result.statusCode || null, result.errorMessage || null, result.sslDaysRemaining || null, nowIso);
	let newStatus = monitor.current_status;
	let consecutiveFails = monitor.consecutive_fails || 0;
	let statusChanged = false;
	if (result.status === "down") {
		consecutiveFails += 1;
		if (consecutiveFails >= monitor.retries_before_down && monitor.current_status !== "down") {
			newStatus = "down";
			statusChanged = true;
			const incidentId = "inc_" + nanoid(10);
			const title = `${monitor.name} is DOWN`;
			db.prepare(`
        INSERT INTO incidents (id, monitor_id, title, status, started_at, is_auto_created)
        VALUES (?, ?, ?, 'investigating', ?, 1)
      `).run(incidentId, monitor.id, title, nowIso);
			db.prepare(`
        INSERT INTO incident_updates (id, incident_id, message, status, created_at)
        VALUES (?, ?, ?, 'investigating', ?)
      `).run("upd_" + nanoid(10), incidentId, result.errorMessage || "Target check failed", nowIso);
			if (!inMaintenance) {
				const nowTs = Date.now();
				recentDownEvents.push({
					monitorId: monitor.id,
					name: monitor.name,
					target: monitor.target,
					timestamp: nowTs
				});
				recentDownEvents = recentDownEvents.filter((e) => nowTs - e.timestamp < 6e4);
				if (recentDownEvents.length >= 3 && (!massOutageAlertSent || nowTs - lastMassAlertTime > 3e5)) {
					massOutageAlertSent = true;
					lastMassAlertTime = nowTs;
					const affectedList = recentDownEvents.map((e) => e.name).join(", ");
					dispatchAlert("🚨 OUTAGE MASSAL TERDETEKSI", `${recentDownEvents.length} Layanan Down Bersamaan`, "down", {
						errorMessage: `Terdeteksi ${recentDownEvents.length} layanan/server down bersamaan: ${affectedList}`,
						incidentId
					});
					broadcastEvent("mass_outage_detected", {
						count: recentDownEvents.length,
						affected: recentDownEvents.map((e) => e.name),
						timestamp: nowIso
					});
				} else dispatchAlert(monitor.name, monitor.target, "down", {
					statusCode: result.statusCode,
					responseTimeMs: result.responseTimeMs,
					errorMessage: result.errorMessage,
					incidentId
				});
			} else console.log(`🔧 [Maintenance Window] Alert suppressed for monitor: ${monitor.name}`);
		}
	} else {
		consecutiveFails = 0;
		if (monitor.current_status === "down") {
			newStatus = "up";
			statusChanged = true;
			recentDownEvents = recentDownEvents.filter((e) => e.monitorId !== monitor.id);
			if (recentDownEvents.length === 0) massOutageAlertSent = false;
			const activeIncidents = db.prepare(`
        SELECT id FROM incidents WHERE monitor_id = ? AND status != 'resolved'
      `).all(monitor.id);
			for (const inc of activeIncidents) {
				db.prepare(`
          UPDATE incidents SET status = 'resolved', resolved_at = ? WHERE id = ?
        `).run(nowIso, inc.id);
				db.prepare(`
          INSERT INTO incident_updates (id, incident_id, message, status, created_at)
          VALUES (?, ?, 'Service recovered automatically. Monitor is responding normally.', 'resolved', ?)
        `).run("upd_" + nanoid(10), inc.id, nowIso);
			}
			if (!inMaintenance) dispatchAlert(monitor.name, monitor.target, "up", {
				statusCode: result.statusCode,
				responseTimeMs: result.responseTimeMs
			});
		} else if (monitor.current_status === "pending") {
			newStatus = "up";
			statusChanged = true;
		}
	}
	db.prepare(`
    UPDATE monitors 
    SET current_status = ?, 
        consecutive_fails = ?, 
        last_checked_at = ?,
        last_status_change_at = CASE WHEN ? THEN ? ELSE last_status_change_at END,
        updated_at = ?
    WHERE id = ?
  `).run(newStatus, consecutiveFails, nowIso, statusChanged ? 1 : 0, nowIso, nowIso, monitor.id);
	broadcastEvent("check_completed", {
		monitorId: monitor.id,
		status: result.status,
		responseTimeMs: result.responseTimeMs,
		statusCode: result.statusCode,
		sslDaysRemaining: result.sslDaysRemaining,
		errorMessage: result.errorMessage,
		checkedAt: nowIso
	});
	if (statusChanged) broadcastEvent("status_changed", {
		monitorId: monitor.id,
		name: monitor.name,
		oldStatus: monitor.current_status,
		newStatus,
		changedAt: nowIso
	});
}
//#endregion
export { isUnderMaintenance as n, executeCheck as t };
