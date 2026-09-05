import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../../lib/db.js';
import { logAudit } from '../../../../../lib/security.js';
import crypto from 'crypto';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id) as any;
    if (!monitor) {
      return new Response(JSON.stringify({ error: 'Monitor not found' }), { status: 404 });
    }

    const rawToken = nanoid(32);
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    db.prepare(`
      UPDATE monitors 
      SET push_token_raw = ?, push_token_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(rawToken, hash, id);

    logAudit('monitor.push_token_rotated', 'monitor', id, { name: monitor.name });

    return new Response(JSON.stringify({
      success: true,
      push_token_raw: rawToken
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
