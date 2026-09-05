import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.js';
import { logAudit } from '../../../lib/security.js';
import { broadcastEvent } from '../../../lib/websocket.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async () => {
  try {
    const incidents = db.prepare(`
      SELECT 
        i.*,
        m.name as monitor_name,
        m.target as monitor_target
      FROM incidents i
      LEFT JOIN monitors m ON i.monitor_id = m.id
      ORDER BY i.started_at DESC
      LIMIT 50
    `).all() as any[];

    const enriched = incidents.map((inc) => {
      const updates = db.prepare(`
        SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC
      `).all(inc.id);
      return {
        ...inc,
        updates
      };
    });

    return new Response(JSON.stringify(enriched), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { monitor_id, title, status = 'investigating', message = 'Incident created manually' } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 });
    }

    const id = 'inc_' + nanoid(10);
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO incidents (id, monitor_id, title, status, started_at, is_auto_created)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(id, monitor_id || null, title, status, nowIso);

    db.prepare(`
      INSERT INTO incident_updates (id, incident_id, message, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('upd_' + nanoid(10), id, message, status, nowIso);

    logAudit('incident.created', 'incident', id, { title, monitor_id });
    broadcastEvent('incident_created', { id, title, status, started_at: nowIso });

    return new Response(JSON.stringify({ id, title, status, started_at: nowIso }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
