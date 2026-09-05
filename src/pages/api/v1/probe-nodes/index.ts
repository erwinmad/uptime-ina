import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export const GET: APIRoute = async () => {
  try {
    const nodes = db.prepare(`
      SELECT id, name, region, status, last_heartbeat_at, latency_ms, created_at
      FROM probe_nodes
      ORDER BY created_at ASC
    `).all() as any[];

    // Auto update status to offline if last heartbeat > 5 minutes
    const now = Date.now();
    const evaluated = nodes.map(node => {
      const last = node.last_heartbeat_at ? new Date(node.last_heartbeat_at).getTime() : 0;
      const isOnline = last > 0 && (now - last < 5 * 60 * 1000);
      return {
        ...node,
        status: isOnline ? 'online' : 'offline'
      };
    });

    return new Response(JSON.stringify(evaluated), {
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

    const body = await request.json();
    const { name, region = 'cjr-dc1' } = body;

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: 'Nama Probe Node wajib diisi' }), { status: 400 });
    }

    const id = 'prb_' + nanoid(10);
    const rawSecret = 'prb_sec_' + crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawSecret).digest('hex');
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO probe_nodes (id, name, region, api_token_hash, status, last_heartbeat_at, latency_ms, created_at)
      VALUES (?, ?, ?, ?, 'online', ?, 8, ?)
    `).run(id, name.trim(), region.trim().toLowerCase(), tokenHash, nowIso, nowIso);

    logAudit('probe_node.created', 'probe_node', id, { name, region });

    return new Response(JSON.stringify({
      success: true,
      node: { id, name: name.trim(), region: region.trim().toLowerCase() },
      secret_token: rawSecret
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
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
      return new Response(JSON.stringify({ error: 'ID probe node wajib disertakan' }), { status: 400 });
    }

    db.prepare('DELETE FROM probe_nodes WHERE id = ?').run(id);
    logAudit('probe_node.deleted', 'probe_node', id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
