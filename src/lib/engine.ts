import http from 'http';
import https from 'https';
import net from 'net';
import tls from 'tls';
import dns from 'dns';
import { db } from './db.js';
import { broadcastEvent } from './websocket.js';
import { dispatchAlert } from './notifications.js';
import { nanoid } from 'nanoid';

export interface MonitorRecord {
  id: string;
  name: string;
  type: string;
  target: string;
  port?: number;
  interval_seconds: number;
  timeout_seconds: number;
  retries_before_down: number;
  http_method: string;
  http_headers: string;
  http_body?: string;
  expected_status_codes: string;
  keyword_match?: string;
  keyword_type?: string;
  ssl_check_enabled: number;
  ssl_expiry_alert_days: number;
  active: number;
  current_status: string;
  consecutive_fails: number;
  last_checked_at?: string;
  push_token_raw?: string;
  push_token_hash?: string;
  push_expected_interval_seconds?: number;
  push_grace_period_seconds?: number;
  push_last_received_at?: string;
  tags?: string;
  dns_record_type?: string;
  dns_expected_value?: string;
}

interface CheckResult {
  status: 'up' | 'down';
  responseTimeMs: number;
  statusCode?: number;
  errorMessage?: string;
  sslDaysRemaining?: number;
}

// Notification Grouping / Mass Outage Detection state
interface DownEvent {
  monitorId: string;
  name: string;
  target: string;
  timestamp: number;
}
let recentDownEvents: DownEvent[] = [];
let massOutageAlertSent = false;
let lastMassAlertTime = 0;

/** Check SSL expiration for HTTPS targets */
async function checkSslCertificate(hostname: string, port = 443, timeoutMs = 8000): Promise<number | undefined> {
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
            const now = new Date();
            const daysRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            resolve(daysRemaining);
          } else {
            resolve(undefined);
          }
        }
      );

      socket.on('error', () => {
        socket.destroy();
        resolve(undefined);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(undefined);
      });
    } catch {
      resolve(undefined);
    }
  });
}

/** Check HTTP / HTTPS target */
async function probeHttp(monitor: MonitorRecord): Promise<CheckResult> {
  const startTime = Date.now();
  let targetUrl = monitor.target;
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'http://' + targetUrl;
  }

  const expectedCodes: number[] = JSON.parse(monitor.expected_status_codes || '[200]');
  let customHeaders: Record<string, string> = {};
  try {
    customHeaders = JSON.parse(monitor.http_headers || '{}');
  } catch {}

  const timeoutMs = (monitor.timeout_seconds || 15) * 1000;
  const isHttps = targetUrl.startsWith('https://');

  let sslDaysRemaining: number | undefined;
  if (isHttps && monitor.ssl_check_enabled) {
    try {
      const parsed = new URL(targetUrl);
      sslDaysRemaining = await checkSslCertificate(parsed.hostname, parsed.port ? parseInt(parsed.port) : 443, timeoutMs);
    } catch {}
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
          method: monitor.http_method || 'GET',
          headers: {
            'User-Agent': 'SentinelUp-Monitor/1.0',
            ...customHeaders
          },
          timeout: timeoutMs,
          rejectUnauthorized: false
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            if (body.length < 50000) {
              body += chunk.toString();
            }
          });

          res.on('end', () => {
            const responseTimeMs = Date.now() - startTime;
            const statusCode = res.statusCode || 0;
            const isCodeOk = expectedCodes.includes(statusCode);

            let isKeywordOk = true;
            if (monitor.keyword_match && monitor.keyword_match.trim() !== '') {
              const hasKw = body.includes(monitor.keyword_match);
              if (monitor.keyword_type === 'not_contains') {
                isKeywordOk = !hasKw;
              } else {
                isKeywordOk = hasKw;
              }
            }

            if (!isCodeOk) {
              resolve({
                status: 'down',
                responseTimeMs,
                statusCode,
                errorMessage: `Expected status [${expectedCodes.join(', ')}], got ${statusCode}`,
                sslDaysRemaining
              });
            } else if (!isKeywordOk) {
              resolve({
                status: 'down',
                responseTimeMs,
                statusCode,
                errorMessage: `Keyword assertion failed: "${monitor.keyword_match}" (${monitor.keyword_type || 'contains'})`,
                sslDaysRemaining
              });
            } else {
              resolve({
                status: 'up',
                responseTimeMs,
                statusCode,
                sslDaysRemaining
              });
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 'down',
          responseTimeMs: Date.now() - startTime,
          errorMessage: `Request timed out after ${monitor.timeout_seconds || 15}s`,
          sslDaysRemaining
        });
      });

      req.on('error', (err) => {
        resolve({
          status: 'down',
          responseTimeMs: Date.now() - startTime,
          errorMessage: err.message || 'Connection failed',
          sslDaysRemaining
        });
      });

      if (monitor.http_body && ['POST', 'PUT', 'PATCH'].includes(monitor.http_method.toUpperCase())) {
        req.write(monitor.http_body);
      }
      req.end();
    } catch (err: any) {
      resolve({
        status: 'down',
        responseTimeMs: Date.now() - startTime,
        errorMessage: err.message || 'Invalid URL or config',
        sslDaysRemaining
      });
    }
  });
}

/** Check TCP Port target */
async function probeTcp(monitor: MonitorRecord): Promise<CheckResult> {
  const startTime = Date.now();
  const host = monitor.target.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  const port = monitor.port || 80;
  const timeoutMs = (monitor.timeout_seconds || 15) * 1000;

  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      const responseTimeMs = Date.now() - startTime;
      socket.destroy();
      resolve({
        status: 'up',
        responseTimeMs
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        status: 'down',
        responseTimeMs: Date.now() - startTime,
        errorMessage: `TCP connection timed out after ${monitor.timeout_seconds}s`
      });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({
        status: 'down',
        responseTimeMs: Date.now() - startTime,
        errorMessage: `TCP socket error: ${err.message}`
      });
    });
  });
}

/** Check Push / Heartbeat target (evaluated by schedule expiration) */
function checkPushHeartbeat(monitor: MonitorRecord): CheckResult {
  const now = Date.now();
  const lastReceived = monitor.push_last_received_at ? new Date(monitor.push_last_received_at).getTime() : 0;
  const intervalSeconds = monitor.push_expected_interval_seconds || monitor.interval_seconds || 60;
  const graceSeconds = monitor.push_grace_period_seconds || 60;
  const maxAllowedAgeMs = (intervalSeconds + graceSeconds) * 1000;

  if (lastReceived === 0) {
    return {
      status: 'pending',
      responseTimeMs: 0,
      errorMessage: 'Waiting for initial push heartbeat'
    } as any;
  }

  const ageMs = now - lastReceived;
  if (ageMs > maxAllowedAgeMs) {
    return {
      status: 'down',
      responseTimeMs: 0,
      errorMessage: `Push heartbeat missed: expected every ${intervalSeconds}s (grace: ${graceSeconds}s), last ping ${Math.round(ageMs / 1000)}s ago`
    };
  }

  return {
    status: 'up',
    responseTimeMs: 0
  };
}

/** Check DNS resolution for hostname */
async function probeDns(monitor: MonitorRecord): Promise<CheckResult> {
  const startTime = Date.now();
  const host = monitor.target.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  const recordType = (monitor.dns_record_type || 'A').toUpperCase();

  return new Promise(async (resolve) => {
    try {
      let records: string[] = [];
      if (recordType === 'AAAA') {
        records = await dns.promises.resolve6(host);
      } else if (recordType === 'CNAME') {
        records = await dns.promises.resolveCname(host);
      } else if (recordType === 'MX') {
        const mx = await dns.promises.resolveMx(host);
        records = mx.map(m => `${m.exchange} (${m.priority})`);
      } else if (recordType === 'TXT') {
        const txt = await dns.promises.resolveTxt(host);
        records = txt.map(t => t.join(' '));
      } else {
        // Default 'A'
        records = await dns.promises.resolve4(host);
      }

      const responseTimeMs = Date.now() - startTime;

      if (monitor.dns_expected_value && monitor.dns_expected_value.trim() !== '') {
        const expected = monitor.dns_expected_value.trim();
        const matches = records.some(r => r.includes(expected));
        if (!matches) {
          resolve({
            status: 'down',
            responseTimeMs,
            errorMessage: `DNS ${recordType} expected "${expected}", got [${records.join(', ')}]`
          });
          return;
        }
      }

      resolve({
        status: 'up',
        responseTimeMs
      });
    } catch (err: any) {
      resolve({
        status: 'down',
        responseTimeMs: Date.now() - startTime,
        errorMessage: `DNS query failed: ${err.message || 'Lookup error'}`
      });
    }
  });
}

/** Check if a monitor is covered by an active maintenance window */
export function isUnderMaintenance(monitorId: string): boolean {
  try {
    const nowIso = new Date().toISOString();
    const windows = db.prepare(`
      SELECT affected_monitor_ids FROM maintenance_windows 
      WHERE active = 1 AND start_time <= ? AND end_time >= ?
    `).all(nowIso, nowIso) as { affected_monitor_ids: string }[];

    for (const w of windows) {
      const ids = JSON.parse(w.affected_monitor_ids || '["*"]');
      if (ids.includes('*') || ids.includes(monitorId)) return true;
    }
  } catch (err) {
    console.error('Error checking maintenance window:', err);
  }
  return false;
}

/** Execute probe for a single monitor */
export async function executeCheck(monitor: MonitorRecord): Promise<void> {
  let result: CheckResult;

  if (monitor.type === 'push') {
    result = checkPushHeartbeat(monitor);
    if (result.status === ('pending' as any)) return;
  } else if (monitor.type === 'dns') {
    result = await probeDns(monitor);
  } else if (monitor.type === 'tcp' || monitor.type === 'ping') {
    result = await probeTcp(monitor);
  } else {
    result = await probeHttp(monitor);
  }

  const nowIso = new Date().toISOString();
  const inMaintenance = isUnderMaintenance(monitor.id);

  // Save check result
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

  // State Transition & Incident Management
  let newStatus = monitor.current_status;
  let consecutiveFails = monitor.consecutive_fails || 0;
  let statusChanged = false;

  if (result.status === 'down') {
    consecutiveFails += 1;
    if (consecutiveFails >= monitor.retries_before_down && monitor.current_status !== 'down') {
      newStatus = 'down';
      statusChanged = true;

      // Auto-create incident
      const incidentId = 'inc_' + nanoid(10);
      const title = `${monitor.name} is DOWN`;
      db.prepare(`
        INSERT INTO incidents (id, monitor_id, title, status, started_at, is_auto_created)
        VALUES (?, ?, ?, 'investigating', ?, 1)
      `).run(incidentId, monitor.id, title, nowIso);

      db.prepare(`
        INSERT INTO incident_updates (id, incident_id, message, status, created_at)
        VALUES (?, ?, ?, 'investigating', ?)
      `).run('upd_' + nanoid(10), incidentId, result.errorMessage || 'Target check failed', nowIso);

      // Trigger Alert (only if NOT in maintenance window)
      if (!inMaintenance) {
        const nowTs = Date.now();
        recentDownEvents.push({
          monitorId: monitor.id,
          name: monitor.name,
          target: monitor.target,
          timestamp: nowTs
        });
        recentDownEvents = recentDownEvents.filter(e => nowTs - e.timestamp < 60000);

        // Mass Outage Detection (PRD 5.3): >= 3 monitors down within 60s
        if (recentDownEvents.length >= 3 && (!massOutageAlertSent || (nowTs - lastMassAlertTime > 5 * 60000))) {
          massOutageAlertSent = true;
          lastMassAlertTime = nowTs;
          const affectedList = recentDownEvents.map(e => e.name).join(', ');
          dispatchAlert(
            '🚨 OUTAGE MASSAL TERDETEKSI',
            `${recentDownEvents.length} Layanan Down Bersamaan`,
            'down',
            {
              errorMessage: `Terdeteksi ${recentDownEvents.length} layanan/server down bersamaan: ${affectedList}`,
              incidentId
            }
          );
          broadcastEvent('mass_outage_detected', {
            count: recentDownEvents.length,
            affected: recentDownEvents.map(e => e.name),
            timestamp: nowIso
          });
        } else {
          dispatchAlert(monitor.name, monitor.target, 'down', {
            statusCode: result.statusCode,
            responseTimeMs: result.responseTimeMs,
            errorMessage: result.errorMessage,
            incidentId
          });
        }
      } else {
        console.log(`🔧 [Maintenance Window] Alert suppressed for monitor: ${monitor.name}`);
      }
    }
  } else {
    // result is 'up'
    consecutiveFails = 0;
    if (monitor.current_status === 'down') {
      newStatus = 'up';
      statusChanged = true;
      recentDownEvents = recentDownEvents.filter(e => e.monitorId !== monitor.id);
      if (recentDownEvents.length === 0) {
        massOutageAlertSent = false;
      }

      // Auto-resolve incident
      const activeIncidents = db.prepare(`
        SELECT id FROM incidents WHERE monitor_id = ? AND status != 'resolved'
      `).all(monitor.id) as { id: string }[];

      for (const inc of activeIncidents) {
        db.prepare(`
          UPDATE incidents SET status = 'resolved', resolved_at = ? WHERE id = ?
        `).run(nowIso, inc.id);

        db.prepare(`
          INSERT INTO incident_updates (id, incident_id, message, status, created_at)
          VALUES (?, ?, 'Service recovered automatically. Monitor is responding normally.', 'resolved', ?)
        `).run('upd_' + nanoid(10), inc.id, nowIso);
      }

      // Trigger Recovery Alert (only if NOT in maintenance window)
      if (!inMaintenance) {
        dispatchAlert(monitor.name, monitor.target, 'up', {
          statusCode: result.statusCode,
          responseTimeMs: result.responseTimeMs
        });
      }
    } else if (monitor.current_status === 'pending') {
      newStatus = 'up';
      statusChanged = true;
    }
  }

  // Update monitor in DB
  db.prepare(`
    UPDATE monitors 
    SET current_status = ?, 
        consecutive_fails = ?, 
        last_checked_at = ?,
        last_status_change_at = CASE WHEN ? THEN ? ELSE last_status_change_at END,
        updated_at = ?
    WHERE id = ?
  `).run(newStatus, consecutiveFails, nowIso, statusChanged ? 1 : 0, nowIso, nowIso, monitor.id);

  // Broadcast realtime updates
  broadcastEvent('check_completed', {
    monitorId: monitor.id,
    status: result.status,
    responseTimeMs: result.responseTimeMs,
    statusCode: result.statusCode,
    sslDaysRemaining: result.sslDaysRemaining,
    errorMessage: result.errorMessage,
    checkedAt: nowIso
  });

  if (statusChanged) {
    broadcastEvent('status_changed', {
      monitorId: monitor.id,
      name: monitor.name,
      oldStatus: monitor.current_status,
      newStatus,
      changedAt: nowIso
    });
  }
}

// Background Scheduler Loop
let schedulerTimer: NodeJS.Timeout | null = null;
let isRunning = false;

export function startMonitoringEngine() {
  if (isRunning) return;
  isRunning = true;
  console.log('🚀 SentinelUp Monitoring Engine started.');

  const tick = async () => {
    try {
      const activeMonitors = db.prepare(`
        SELECT * FROM monitors WHERE active = 1 AND current_status != 'paused'
      `).all() as MonitorRecord[];

      const now = Date.now();

      for (const monitor of activeMonitors) {
        const lastChecked = monitor.last_checked_at ? new Date(monitor.last_checked_at).getTime() : 0;
        const intervalMs = (monitor.interval_seconds || 60) * 1000;

        if (now - lastChecked >= intervalMs) {
          // run probe asynchronously without blocking other checks
          executeCheck(monitor).catch((err) => {
            console.error(`Error probing monitor ${monitor.name}:`, err);
          });
        }
      }
    } catch (err) {
      console.error('Scheduler tick error:', err);
    }
  };

  // Run tick every 2 seconds
  schedulerTimer = setInterval(tick, 2000);
  tick(); // immediate first tick
}

export function stopMonitoringEngine() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  isRunning = false;
  console.log('⏹️ SentinelUp Monitoring Engine stopped.');
}
