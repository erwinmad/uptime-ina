import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../lib/db.js';
import { logAudit } from '../../../lib/security.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async () => {
  try {
    const policies = db.prepare('SELECT * FROM escalation_policies ORDER BY created_at DESC').all() as any[];
    const parsed = policies.map(p => ({
      ...p,
      channel_ids: JSON.parse(p.channel_ids || '[]')
    }));
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { name, wait_minutes = 5, channel_ids = [] } = await request.json();
    if (!name) {
      return new Response(JSON.stringify({ error: 'Nama kebijakan eskalasi wajib diisi' }), { status: 400 });
    }

    const id = 'esc_' + nanoid(10);
    db.prepare(`
      INSERT INTO escalation_policies (id, name, wait_minutes, channel_ids)
      VALUES (?, ?, ?, ?)
    `).run(id, name, wait_minutes, JSON.stringify(channel_ids));

    logAudit('escalation.created', 'escalation', id, { name, wait_minutes });

    return new Response(JSON.stringify({ success: true, id }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Policy ID is required' }), { status: 400 });
    }

    db.prepare('DELETE FROM escalation_policies WHERE id = ?').run(id);
    logAudit('escalation.deleted', 'escalation', id, {});

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

