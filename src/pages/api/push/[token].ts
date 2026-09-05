import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.js';
import { hashToken } from '../../../lib/security.js';
import { broadcastEvent } from '../../../lib/websocket.js';
import { dispatchAlert } from '../../../lib/notifications.js';
import { nanoid } from 'nanoid';

async function handlePush(token: string, url: URL, bodyData: any = {}) {
  const tokenHash = hashToken(token);
  const monitor = db.prepare(`
    SELECT * FROM monitors WHERE push_token_hash = ?
  `).get(tokenHash) as any;

  if (!monitor) {
    return new Response(JSON.stringify({ error: 'Invalid push token' }), { status: 404 });
  }

  const statusParam = (url.searchParams.get('status') || bodyData.status || 'up').toLowerCase();
  const msgParam = url.searchParams.get('msg') || bodyData.msg || 'Push heartbeat received';
  const pingParam = parseInt(url.searchParams.get('ping') || bodyData.ping || '0', 10);

  const nowIso = new Date().toISOString();
  const isUp = statusParam === 'up';
  const checkStatus = isUp ? 'up' : 'down';

  // Save check result
  db.prepare(`
    INSERT INTO monitor_checks (monitor_id, status, response_time_ms, error_message, checked_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(monitor.id, checkStatus, isUp ? (pingParam || 1) : 0, isUp ? null : msgParam, nowIso);

  let newStatus = monitor.current_status;
  let statusChanged = false;

  if (isUp) {
    if (monitor.current_status === 'down' || monitor.current_status === 'pending') {
      newStatus = 'up';
      statusChanged = true;

      // Auto resolve active incident
      const activeIncidents = db.prepare(`
        SELECT id FROM incidents WHERE monitor_id = ? AND status != 'resolved'
      `).all(monitor.id) as { id: string }[];

      for (const inc of activeIncidents) {
        db.prepare("UPDATE incidents SET status = 'resolved', resolved_at = ? WHERE id = ?").run(nowIso, inc.id);
        db.prepare("INSERT INTO incident_updates (id, incident_id, message, status, created_at) VALUES (?, ?, 'Heartbeat restored via push notification', 'resolved', ?)")
          .run('upd_' + nanoid(10), inc.id, nowIso);
      }

      dispatchAlert(monitor.name, monitor.target, 'up', { responseTimeMs: pingParam });
    }

    db.prepare(`
      UPDATE monitors 
      SET current_status = ?,
          consecutive_fails = 0,
          push_last_received_at = ?,
          last_checked_at = ?,
          last_status_change_at = CASE WHEN ? THEN ? ELSE last_status_change_at END
      WHERE id = ?
    `).run(newStatus, nowIso, nowIso, statusChanged ? 1 : 0, nowIso, monitor.id);
  } else {
    // Reported explicit down from script
    newStatus = 'down';
    statusChanged = monitor.current_status !== 'down';

    if (statusChanged) {
      const incidentId = 'inc_' + nanoid(10);
      db.prepare(`
        INSERT INTO incidents (id, monitor_id, title, status, started_at, is_auto_created)
        VALUES (?, ?, ?, 'investigating', ?, 1)
      `).run(incidentId, monitor.id, `${monitor.name} reported DOWN via push`, nowIso);

      db.prepare(`
        INSERT INTO incident_updates (id, incident_id, message, status, created_at)
        VALUES (?, ?, ?, 'investigating', ?)
      `).run('upd_' + nanoid(10), incidentId, msgParam, nowIso);

      dispatchAlert(monitor.name, monitor.target, 'down', { errorMessage: msgParam, incidentId });
    }

    db.prepare(`
      UPDATE monitors 
      SET current_status = 'down',
          consecutive_fails = consecutive_fails + 1,
          push_last_received_at = ?,
          last_checked_at = ?,
          last_status_change_at = CASE WHEN ? THEN ? ELSE last_status_change_at END
      WHERE id = ?
    `).run(nowIso, nowIso, statusChanged ? 1 : 0, nowIso, monitor.id);
  }

  broadcastEvent('check_completed', {
    monitorId: monitor.id,
    status: checkStatus,
    responseTimeMs: pingParam,
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

  return new Response(JSON.stringify({ success: true, monitor: monitor.name, status: checkStatus }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const { token } = params;
  if (!token) return new Response('Missing token', { status: 400 });
  const url = new URL(request.url);
  return handlePush(token, url);
};

export const POST: APIRoute = async ({ params, request }) => {
  const { token } = params;
  if (!token) return new Response('Missing token', { status: 400 });
  const url = new URL(request.url);
  let body = {};
  try {
    body = await request.json();
  } catch {}
  return handlePush(token, url, body);
};
