import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.js';
import { logAudit } from '../../../lib/security.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async () => {
  try {
    const windows = db.prepare(`
      SELECT * FROM maintenance_windows ORDER BY start_time DESC
    `).all() as any[];

    const nowIso = new Date().toISOString();

    const formatted = windows.map((w) => {
      const isCurrentlyActive = w.active && w.start_time <= nowIso && w.end_time >= nowIso;
      let monitorIds: string[] = ['*'];
      try {
        monitorIds = JSON.parse(w.affected_monitor_ids || '["*"]');
      } catch {}

      return {
        ...w,
        is_currently_active: Boolean(isCurrentlyActive),
        affected_monitor_ids: monitorIds
      };
    });

    return new Response(JSON.stringify(formatted), {
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
    const { title, description = '', start_time, end_time, affected_monitor_ids = ['*'] } = body;

    if (!title || !start_time || !end_time) {
      return new Response(JSON.stringify({ error: 'Title, start_time, and end_time are required' }), { status: 400 });
    }

    const id = 'maint_' + nanoid(10);
    const affectedJson = typeof affected_monitor_ids === 'string' ? affected_monitor_ids : JSON.stringify(affected_monitor_ids);

    db.prepare(`
      INSERT INTO maintenance_windows (id, title, description, start_time, end_time, affected_monitor_ids, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, title, description, start_time, end_time, affectedJson);

    logAudit('maintenance.created', 'maintenance_window', id, { title, start_time, end_time });

    return new Response(JSON.stringify({ id, title, start_time, end_time }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'Missing maintenance window id' }), { status: 400 });

    db.prepare('DELETE FROM maintenance_windows WHERE id = ?').run(id);
    logAudit('maintenance.deleted', 'maintenance_window', id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
