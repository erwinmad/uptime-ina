import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
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
