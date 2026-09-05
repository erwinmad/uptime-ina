// src/server.ts
import http2 from "http";
import path2 from "path";
import fs2 from "fs";
import sirv from "sirv";
import { fileURLToPath } from "url";
import { WebSocketServer as WebSocketServer2 } from "ws";

// src/lib/engine.ts
import http from "http";
import https from "https";
import net from "net";
import tls from "tls";
import dns from "dns";

// src/lib/db.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { nanoid } from "nanoid";
var DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
var DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "sentinelup.db");
var db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS monitors (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'http', 'tcp', 'ping', 'push', 'dns'
      target TEXT NOT NULL,
      port INTEGER,
      interval_seconds INTEGER DEFAULT 60,
      timeout_seconds INTEGER DEFAULT 15,
      retries_before_down INTEGER DEFAULT 3,
      http_method TEXT DEFAULT 'GET',
      http_headers TEXT DEFAULT '{}',
      http_body TEXT,
      expected_status_codes TEXT DEFAULT '[200]',
      keyword_match TEXT,
      keyword_type TEXT DEFAULT 'contains',
      ssl_check_enabled INTEGER DEFAULT 0,
      ssl_expiry_alert_days INTEGER DEFAULT 14,
      active INTEGER DEFAULT 1,
      current_status TEXT DEFAULT 'pending', -- 'up', 'down', 'pending', 'paused'
      consecutive_fails INTEGER DEFAULT 0,
      last_checked_at TEXT,
      last_status_change_at TEXT,
      push_token_raw TEXT, -- displayed once or regenerated
      push_token_hash TEXT,
      push_expected_interval_seconds INTEGER,
      push_grace_period_seconds INTEGER DEFAULT 60,
      push_last_received_at TEXT,
      tags TEXT DEFAULT '[]', -- JSON array of string tags
      dns_record_type TEXT DEFAULT 'A', -- 'A', 'AAAA', 'CNAME', 'MX', 'TXT'
      dns_expected_value TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_monitors_active ON monitors(active);
    CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(current_status);

    CREATE TABLE IF NOT EXISTS maintenance_windows (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      affected_monitor_ids TEXT DEFAULT '["*"]', -- JSON array of monitor IDs or ["*"] for all
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS monitor_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
      status TEXT NOT NULL, -- 'up', 'down'
      response_time_ms INTEGER,
      status_code INTEGER,
      error_message TEXT,
      ssl_days_remaining INTEGER,
      checked_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_checks_monitor_checked ON monitor_checks(monitor_id, checked_at DESC);

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      monitor_id TEXT REFERENCES monitors(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'investigating', -- 'investigating', 'identified', 'monitoring', 'resolved'
      started_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT,
      is_auto_created INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS incident_updates (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      status TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notification_channels (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      type TEXT NOT NULL, -- 'webhook', 'telegram', 'discord', 'slack', 'email'
      name TEXT NOT NULL,
      config TEXT NOT NULL, -- JSON
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status_pages (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_public INTEGER DEFAULT 1,
      password_hash TEXT,
      theme_config TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status_page_monitors (
      status_page_id TEXT NOT NULL REFERENCES status_pages(id) ON DELETE CASCADE,
      monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
      display_order INTEGER DEFAULT 0,
      custom_label TEXT,
      PRIMARY KEY (status_page_id, monitor_id)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      key_preview TEXT NOT NULL,
      scopes TEXT DEFAULT '["*"]',
      last_used_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

    CREATE TABLE IF NOT EXISTS status_page_subscribers (
      id TEXT PRIMARY KEY,
      status_page_id TEXT NOT NULL REFERENCES status_pages(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS escalation_policies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      wait_minutes INTEGER DEFAULT 5,
      channel_ids TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS on_call_schedules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      primary_name TEXT NOT NULL,
      primary_contact TEXT NOT NULL,
      secondary_name TEXT,
      secondary_contact TEXT,
      shift_days TEXT DEFAULT '["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]',
      shift_start_time TEXT DEFAULT '08:00',
      shift_end_time TEXT DEFAULT '20:00',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS probe_nodes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      api_token_hash TEXT,
      status TEXT DEFAULT 'online',
      last_heartbeat_at TEXT,
      latency_ms INTEGER DEFAULT 5,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  try {
    const tableInfo = db.prepare("PRAGMA table_info(monitors)").all();
    const colNames = new Set(tableInfo.map((c) => c.name));
    if (!colNames.has("tags")) db.exec("ALTER TABLE monitors ADD COLUMN tags TEXT DEFAULT '[]'");
    if (!colNames.has("dns_record_type")) db.exec("ALTER TABLE monitors ADD COLUMN dns_record_type TEXT DEFAULT 'A'");
    if (!colNames.has("dns_expected_value")) db.exec("ALTER TABLE monitors ADD COLUMN dns_expected_value TEXT");
    const incInfo = db.prepare("PRAGMA table_info(incidents)").all();
    const incCols = new Set(incInfo.map((c) => c.name));
    if (!incCols.has("root_cause")) db.exec("ALTER TABLE incidents ADD COLUMN root_cause TEXT");
    if (!incCols.has("action_items")) db.exec("ALTER TABLE incidents ADD COLUMN action_items TEXT");
    if (!incCols.has("prevention_plan")) db.exec("ALTER TABLE incidents ADD COLUMN prevention_plan TEXT");
  } catch (err) {
    console.error("Migration error:", err);
  }
  try {
    const probeCount = db.prepare("SELECT COUNT(*) as count FROM probe_nodes").get();
    if (probeCount.count === 0) {
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      db.prepare(`
        INSERT INTO probe_nodes (id, name, region, status, last_heartbeat_at, latency_ms, created_at)
        VALUES ('prb_primary', 'Node Utama \u2014 Cianjur Data Center', 'cjr-dc1', 'online', ?, 4, ?)
      `).run(nowIso, nowIso);
      db.prepare(`
        INSERT INTO probe_nodes (id, name, region, status, last_heartbeat_at, latency_ms, created_at)
        VALUES ('prb_secondary', 'Node Edge \u2014 Jakarta Gateway', 'jkt-idc', 'online', ?, 12, ?)
      `).run(nowIso, nowIso);
    }
  } catch (err) {
    console.error("Probe seeding error:", err);
  }
  const orgCount = db.prepare("SELECT COUNT(*) as count FROM organizations").get();
  if (orgCount.count === 0) {
    db.prepare(`
      INSERT INTO organizations (id, name, slug)
      VALUES ('org-default', 'SentinelUp Default Org', 'default')
    `).run();
    db.prepare(`
      INSERT INTO status_pages (id, slug, title, description, is_public)
      VALUES ('sp-default', 'main', 'SentinelUp System Status', 'Real-time uptime and incident report for all primary services', 1)
    `).run();
  }
  const settingCount = db.prepare("SELECT COUNT(*) as count FROM system_settings").get();
  if (settingCount.count === 0) {
    const seedSettings = [
      ["app_name", "Uptime CJR"],
      ["app_tagline", "Sistem Pemantauan Ketersediaan Layanan & Infrastruktur"],
      ["footer_text", "\xA9 2026 Uptime CJR \u2014 Dinas Komunikasi dan Informatika"],
      ["logo_icon", "\u{1F310}"],
      ["favicon_url", ""],
      ["primary_color", "#4f46e5"]
    ];
    for (const [k, v] of seedSettings) {
      db.prepare("INSERT INTO system_settings (key, value) VALUES (?, ?)").run(k, v);
    }
  }
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  if (userCount.count === 0) {
    const defaultEmail = (process.env.ADMIN_EMAIL || "admin@cjr.go.id").toLowerCase();
    const defaultPass = process.env.ADMIN_PASSWORD || "Password123!";
    const defaultName = "Administrator Diskominfo";
    const hashed = hashPassword(defaultPass);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at)
      VALUES ('usr_admin_default', ?, ?, ?, 'admin', ?)
    `).run(defaultEmail, hashed, defaultName, nowIso);
    console.log(`\u{1F510} Admin initialized: ${defaultEmail}`);
  }
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
initDb();

// src/lib/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
var clients = /* @__PURE__ */ new Set();
function broadcastEvent(type, data) {
  const message = JSON.stringify({ type, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
      }
    }
  }
}

// src/lib/notifications.ts
async function dispatchAlert(monitorName, target, status, details) {
  const channels = db.prepare("SELECT * FROM notification_channels WHERE active = 1").all();
  if (channels.length === 0) return;
  const title = status === "down" ? `\u{1F6A8} [ALERT] ${monitorName} is DOWN` : `\u2705 [RECOVERY] ${monitorName} is BACK UP`;
  const description = status === "down" ? `Monitor ${monitorName} (${target}) failed.
Reason: ${details.errorMessage || `HTTP Status ${details.statusCode}` || "Connection failed"}` : `Monitor ${monitorName} (${target}) is responding normally.
Response time: ${details.responseTimeMs}ms`;
  for (const channel of channels) {
    try {
      const config = JSON.parse(channel.config || "{}");
      if (channel.type === "webhook" && config.url) {
        await fetch(config.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: status === "down" ? "monitor.down" : "monitor.up",
            monitor: monitorName,
            target,
            status,
            ...details,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          })
        });
      } else if (channel.type === "discord" && config.webhookUrl) {
        const color = status === "down" ? 15158332 : 3066993;
        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title,
                description,
                color,
                fields: [
                  { name: "Target", value: target, inline: true },
                  { name: "Status", value: status.toUpperCase(), inline: true },
                  ...details.responseTimeMs ? [{ name: "Latency", value: `${details.responseTimeMs}ms`, inline: true }] : [],
                  ...details.errorMessage ? [{ name: "Error", value: details.errorMessage, inline: false }] : []
                ],
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }
            ]
          })
        });
      } else if (channel.type === "telegram" && config.botToken && config.chatId) {
        const text = `*${title}*

Target: \`${target}\`
Status: *${status.toUpperCase()}*
${details.errorMessage ? `Error: ${details.errorMessage}
` : ""}${details.responseTimeMs ? `Latency: ${details.responseTimeMs}ms
` : ""}Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
        await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: config.chatId,
            text,
            parse_mode: "Markdown"
          })
        });
      } else if (channel.type === "slack" && config.webhookUrl) {
        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `${title}
${description}`
          })
        });
      }
    } catch (err) {
      console.error(`Failed to send notification via ${channel.name} (${channel.type}):`, err);
    }
  }
}

// src/lib/engine.ts
import { nanoid as nanoid2 } from "nanoid";
var recentDownEvents = [];
var massOutageAlertSent = false;
var lastMassAlertTime = 0;
async function checkSslCertificate(hostname, port = 443, timeoutMs = 8e3) {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          timeout: timeoutMs,
          rejectUnauthorized: false
        },
        () => {
          const cert = socket.getPeerCertificate();
          socket.destroy();
          if (cert && cert.valid_to) {
            const expiryDate = new Date(cert.valid_to);
            const now = /* @__PURE__ */ new Date();
            const daysRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
            resolve(daysRemaining);
          } else {
            resolve(void 0);
          }
        }
      );
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
async function probeHttp(monitor) {
  const startTime = Date.now();
  let targetUrl = monitor.target;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "http://" + targetUrl;
  }
  const expectedCodes = JSON.parse(monitor.expected_status_codes || "[200]");
  let customHeaders = {};
  try {
    customHeaders = JSON.parse(monitor.http_headers || "{}");
  } catch {
  }
  const timeoutMs = (monitor.timeout_seconds || 15) * 1e3;
  const isHttps = targetUrl.startsWith("https://");
  let sslDaysRemaining;
  if (isHttps && monitor.ssl_check_enabled) {
    try {
      const parsed = new URL(targetUrl);
      sslDaysRemaining = await checkSslCertificate(parsed.hostname, parsed.port ? parseInt(parsed.port) : 443, timeoutMs);
    } catch {
    }
  }
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const client = isHttps ? https : http;
      const req = client.request(
        {
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
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            if (body.length < 5e4) {
              body += chunk.toString();
            }
          });
          res.on("end", () => {
            const responseTimeMs = Date.now() - startTime;
            const statusCode = res.statusCode || 0;
            const isCodeOk = expectedCodes.includes(statusCode);
            let isKeywordOk = true;
            if (monitor.keyword_match && monitor.keyword_match.trim() !== "") {
              const hasKw = body.includes(monitor.keyword_match);
              if (monitor.keyword_type === "not_contains") {
                isKeywordOk = !hasKw;
              } else {
                isKeywordOk = hasKw;
              }
            }
            if (!isCodeOk) {
              resolve({
                status: "down",
                responseTimeMs,
                statusCode,
                errorMessage: `Expected status [${expectedCodes.join(", ")}], got ${statusCode}`,
                sslDaysRemaining
              });
            } else if (!isKeywordOk) {
              resolve({
                status: "down",
                responseTimeMs,
                statusCode,
                errorMessage: `Keyword assertion failed: "${monitor.keyword_match}" (${monitor.keyword_type || "contains"})`,
                sslDaysRemaining
              });
            } else {
              resolve({
                status: "up",
                responseTimeMs,
                statusCode,
                sslDaysRemaining
              });
            }
          });
        }
      );
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
      if (monitor.http_body && ["POST", "PUT", "PATCH"].includes(monitor.http_method.toUpperCase())) {
        req.write(monitor.http_body);
      }
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
function checkPushHeartbeat(monitor) {
  const now = Date.now();
  const lastReceived = monitor.push_last_received_at ? new Date(monitor.push_last_received_at).getTime() : 0;
  const intervalSeconds = monitor.push_expected_interval_seconds || monitor.interval_seconds || 60;
  const graceSeconds = monitor.push_grace_period_seconds || 60;
  const maxAllowedAgeMs = (intervalSeconds + graceSeconds) * 1e3;
  if (lastReceived === 0) {
    return {
      status: "pending",
      responseTimeMs: 0,
      errorMessage: "Waiting for initial push heartbeat"
    };
  }
  const ageMs = now - lastReceived;
  if (ageMs > maxAllowedAgeMs) {
    return {
      status: "down",
      responseTimeMs: 0,
      errorMessage: `Push heartbeat missed: expected every ${intervalSeconds}s (grace: ${graceSeconds}s), last ping ${Math.round(ageMs / 1e3)}s ago`
    };
  }
  return {
    status: "up",
    responseTimeMs: 0
  };
}
async function probeDns(monitor) {
  const startTime = Date.now();
  const host = monitor.target.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  const recordType = (monitor.dns_record_type || "A").toUpperCase();
  return new Promise(async (resolve) => {
    try {
      let records = [];
      if (recordType === "AAAA") {
        records = await dns.promises.resolve6(host);
      } else if (recordType === "CNAME") {
        records = await dns.promises.resolveCname(host);
      } else if (recordType === "MX") {
        const mx = await dns.promises.resolveMx(host);
        records = mx.map((m) => `${m.exchange} (${m.priority})`);
      } else if (recordType === "TXT") {
        const txt = await dns.promises.resolveTxt(host);
        records = txt.map((t) => t.join(" "));
      } else {
        records = await dns.promises.resolve4(host);
      }
      const responseTimeMs = Date.now() - startTime;
      if (monitor.dns_expected_value && monitor.dns_expected_value.trim() !== "") {
        const expected = monitor.dns_expected_value.trim();
        const matches = records.some((r) => r.includes(expected));
        if (!matches) {
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
function isUnderMaintenance(monitorId) {
  try {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const windows = db.prepare(`
      SELECT affected_monitor_ids FROM maintenance_windows 
      WHERE active = 1 AND start_time <= ? AND end_time >= ?
    `).all(nowIso, nowIso);
    for (const w of windows) {
      const ids = JSON.parse(w.affected_monitor_ids || '["*"]');
      if (ids.includes("*") || ids.includes(monitorId)) return true;
    }
  } catch (err) {
    console.error("Error checking maintenance window:", err);
  }
  return false;
}
async function executeCheck(monitor) {
  let result;
  if (monitor.type === "push") {
    result = checkPushHeartbeat(monitor);
    if (result.status === "pending") return;
  } else if (monitor.type === "dns") {
    result = await probeDns(monitor);
  } else if (monitor.type === "tcp" || monitor.type === "ping") {
    result = await probeTcp(monitor);
  } else {
    result = await probeHttp(monitor);
  }
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const inMaintenance = isUnderMaintenance(monitor.id);
  db.prepare(`
    INSERT INTO monitor_checks (monitor_id, status, response_time_ms, status_code, error_message, ssl_days_remaining, checked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    monitor.id,
    result.status,
    result.responseTimeMs || 0,
    result.statusCode || null,
    result.errorMessage || null,
    result.sslDaysRemaining || null,
    nowIso
  );
  let newStatus = monitor.current_status;
  let consecutiveFails = monitor.consecutive_fails || 0;
  let statusChanged = false;
  if (result.status === "down") {
    consecutiveFails += 1;
    if (consecutiveFails >= monitor.retries_before_down && monitor.current_status !== "down") {
      newStatus = "down";
      statusChanged = true;
      const incidentId = "inc_" + nanoid2(10);
      const title = `${monitor.name} is DOWN`;
      db.prepare(`
        INSERT INTO incidents (id, monitor_id, title, status, started_at, is_auto_created)
        VALUES (?, ?, ?, 'investigating', ?, 1)
      `).run(incidentId, monitor.id, title, nowIso);
      db.prepare(`
        INSERT INTO incident_updates (id, incident_id, message, status, created_at)
        VALUES (?, ?, ?, 'investigating', ?)
      `).run("upd_" + nanoid2(10), incidentId, result.errorMessage || "Target check failed", nowIso);
      if (!inMaintenance) {
        const nowTs = Date.now();
        recentDownEvents.push({
          monitorId: monitor.id,
          name: monitor.name,
          target: monitor.target,
          timestamp: nowTs
        });
        recentDownEvents = recentDownEvents.filter((e) => nowTs - e.timestamp < 6e4);
        if (recentDownEvents.length >= 3 && (!massOutageAlertSent || nowTs - lastMassAlertTime > 5 * 6e4)) {
          massOutageAlertSent = true;
          lastMassAlertTime = nowTs;
          const affectedList = recentDownEvents.map((e) => e.name).join(", ");
          dispatchAlert(
            "\u{1F6A8} OUTAGE MASSAL TERDETEKSI",
            `${recentDownEvents.length} Layanan Down Bersamaan`,
            "down",
            {
              errorMessage: `Terdeteksi ${recentDownEvents.length} layanan/server down bersamaan: ${affectedList}`,
              incidentId
            }
          );
          broadcastEvent("mass_outage_detected", {
            count: recentDownEvents.length,
            affected: recentDownEvents.map((e) => e.name),
            timestamp: nowIso
          });
        } else {
          dispatchAlert(monitor.name, monitor.target, "down", {
            statusCode: result.statusCode,
            responseTimeMs: result.responseTimeMs,
            errorMessage: result.errorMessage,
            incidentId
          });
        }
      } else {
        console.log(`\u{1F527} [Maintenance Window] Alert suppressed for monitor: ${monitor.name}`);
      }
    }
  } else {
    consecutiveFails = 0;
    if (monitor.current_status === "down") {
      newStatus = "up";
      statusChanged = true;
      recentDownEvents = recentDownEvents.filter((e) => e.monitorId !== monitor.id);
      if (recentDownEvents.length === 0) {
        massOutageAlertSent = false;
      }
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
        `).run("upd_" + nanoid2(10), inc.id, nowIso);
      }
      if (!inMaintenance) {
        dispatchAlert(monitor.name, monitor.target, "up", {
          statusCode: result.statusCode,
          responseTimeMs: result.responseTimeMs
        });
      }
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
  if (statusChanged) {
    broadcastEvent("status_changed", {
      monitorId: monitor.id,
      name: monitor.name,
      oldStatus: monitor.current_status,
      newStatus,
      changedAt: nowIso
    });
  }
}
var schedulerTimer = null;
var isRunning = false;
function startMonitoringEngine() {
  if (isRunning) return;
  isRunning = true;
  console.log("\u{1F680} SentinelUp Monitoring Engine started.");
  const tick = async () => {
    try {
      const activeMonitors = db.prepare(`
        SELECT * FROM monitors WHERE active = 1 AND current_status != 'paused'
      `).all();
      const now = Date.now();
      for (const monitor of activeMonitors) {
        const lastChecked = monitor.last_checked_at ? new Date(monitor.last_checked_at).getTime() : 0;
        const intervalMs = (monitor.interval_seconds || 60) * 1e3;
        if (now - lastChecked >= intervalMs) {
          executeCheck(monitor).catch((err) => {
            console.error(`Error probing monitor ${monitor.name}:`, err);
          });
        }
      }
    } catch (err) {
      console.error("Scheduler tick error:", err);
    }
  };
  schedulerTimer = setInterval(tick, 2e3);
  tick();
}

// src/server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var PORT = parseInt(process.env.PORT || "3000", 10);
var HOST = process.env.HOST || "0.0.0.0";
async function start() {
  console.log("\u{1F31F} Starting SentinelUp Platform...");
  const monitorCount = db.prepare("SELECT COUNT(*) as count FROM monitors").get();
  if (monitorCount.count === 0) {
    console.log("\u{1F331} Seeding initial monitors for immediate demonstration...");
    db.prepare(`
      INSERT INTO monitors (id, name, type, target, interval_seconds, timeout_seconds, retries_before_down, current_status)
      VALUES 
        ('mon_cloudflare', 'Cloudflare DNS', 'http', 'https://1.1.1.1', 30, 10, 2, 'pending'),
        ('mon_google_dns', 'Google Public DNS', 'tcp', '8.8.8.8', 30, 10, 2, 'pending'),
        ('mon_github', 'GitHub API', 'http', 'https://api.github.com', 45, 10, 2, 'pending')
    `).run();
  }
  let astroHandler = null;
  const entryPath = path2.resolve(__dirname, "./dist/server/entry.mjs");
  if (fs2.existsSync(entryPath)) {
    const entry = await import(entryPath);
    astroHandler = entry.handler;
  } else {
    console.warn("\u26A0\uFE0F ./dist/server/entry.mjs not found yet. Astro routes will be unavailable until built.");
  }
  const clientDir = path2.resolve(__dirname, "./dist/client");
  const serveStatic = fs2.existsSync(clientDir) ? sirv(clientDir, { dev: false, etag: true, single: false }) : (req, res, next) => next();
  const server = http2.createServer((req, res) => {
    serveStatic(req, res, () => {
      if (astroHandler) {
        astroHandler(req, res);
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>SentinelUp is starting... please build the project.</h1>");
      }
    });
  });
  const wss = new WebSocketServer2({ noServer: true });
  const clients2 = /* @__PURE__ */ new Set();
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });
  wss.on("connection", (ws) => {
    clients2.add(ws);
    ws.send(JSON.stringify({ type: "connected", time: (/* @__PURE__ */ new Date()).toISOString() }));
    ws.on("close", () => clients2.delete(ws));
    ws.on("error", () => clients2.delete(ws));
  });
  startMonitoringEngine();
  server.listen(PORT, HOST, () => {
    console.log(`
======================================================`);
    console.log(`\u{1F6E1}\uFE0F  SentinelUp Platform is LIVE at: http://localhost:${PORT}`);
    console.log(`\u{1F4CA}  Dashboard:    http://localhost:${PORT}/dashboard`);
    console.log(`\u{1F310}  Status Page:  http://localhost:${PORT}/status/main`);
    console.log(`\u{1F4C8}  Prometheus:   http://localhost:${PORT}/api/metrics`);
    console.log(`======================================================
`);
  });
}
start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
