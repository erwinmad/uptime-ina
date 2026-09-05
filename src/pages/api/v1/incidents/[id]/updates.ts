import type { APIRoute } from 'astro';
import { db } from '../../../../../lib/db.js';
import { logAudit } from '../../../../../lib/security.js';
import { broadcastEvent } from '../../../../../lib/websocket.js';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { message, status } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id) as any;
    if (!incident) {
      return new Response(JSON.stringify({ error: 'Incident not found' }), { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const newStatus = status || incident.status;
    const isResolved = newStatus === 'resolved';

    db.prepare(`
      UPDATE incidents 
      SET status = ?, resolved_at = ? 
      WHERE id = ?
    `).run(newStatus, isResolved ? nowIso : incident.resolved_at, id);

    const updateId = 'upd_' + nanoid(10);
    db.prepare(`
      INSERT INTO incident_updates (id, incident_id, message, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(updateId, id, message, newStatus, nowIso);

    logAudit('incident.updated', 'incident', id, { status: newStatus, message });
    broadcastEvent('incident_updated', { id, status: newStatus, message, updatedAt: nowIso });

    return new Response(JSON.stringify({ success: true, id, status: newStatus }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
