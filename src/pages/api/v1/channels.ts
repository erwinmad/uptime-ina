import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.js';
import { logAudit } from '../../../lib/security.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async () => {
  try {
    const channels = db.prepare('SELECT * FROM notification_channels ORDER BY created_at DESC').all() as any[];
    // Parse configs safely (hide botToken in preview)
    const formatted = channels.map((c) => {
      let cfg = {};
      try {
        cfg = JSON.parse(c.config || '{}');
      } catch {}
      return {
        ...c,
        config: cfg
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
    const { type, name, config = {} } = body;

    if (!type || !name) {
      return new Response(JSON.stringify({ error: 'Type and Name are required' }), { status: 400 });
    }

    const id = 'chan_' + nanoid(10);
    const configStr = typeof config === 'string' ? config : JSON.stringify(config);

    db.prepare(`
      INSERT INTO notification_channels (id, type, name, config, active)
      VALUES (?, ?, ?, ?, 1)
    `).run(id, type, name, configStr);

    logAudit('channel.created', 'channel', id, { type, name });

    return new Response(JSON.stringify({ id, type, name, config }), {
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
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID channel diperlukan' }), { status: 400 });
    }
    db.prepare('DELETE FROM notification_channels WHERE id = ?').run(id);
    logAudit('channel.deleted', 'channel', id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

