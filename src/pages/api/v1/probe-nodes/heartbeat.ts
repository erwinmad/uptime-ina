import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db.js';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const body = await request.json().catch(() => ({}));
    const { token, latency_ms } = body;

    const rawToken = authHeader || token;
    if (!rawToken) {
      return new Response(JSON.stringify({ error: 'Token autentikasi probe node diperlukan' }), { status: 401 });
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const node = db.prepare('SELECT id, name FROM probe_nodes WHERE api_token_hash = ?').get(tokenHash) as any;

    if (!node) {
      return new Response(JSON.stringify({ error: 'Probe node tidak valid' }), { status: 403 });
    }

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE probe_nodes 
      SET status = 'online', last_heartbeat_at = ?, latency_ms = COALESCE(?, latency_ms)
      WHERE id = ?
    `).run(nowIso, latency_ms || null, node.id);

    return new Response(JSON.stringify({
      success: true,
      timestamp: nowIso,
      node: node.name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
