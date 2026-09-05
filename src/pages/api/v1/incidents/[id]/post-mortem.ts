import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../../lib/db.js';
import { logAudit } from '../../../../../lib/security.js';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { root_cause, action_items, prevention_plan } = body;

    const incident = db.prepare('SELECT id, title FROM incidents WHERE id = ?').get(id) as any;
    if (!incident) {
      return new Response(JSON.stringify({ error: 'Incident not found' }), { status: 404 });
    }

    db.prepare(`
      UPDATE incidents
      SET root_cause = ?, action_items = ?, prevention_plan = ?
      WHERE id = ?
    `).run(root_cause || '', action_items || '', prevention_plan || '', id);

    logAudit('incident.post_mortem_updated', 'incident', id, { title: incident.title });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
