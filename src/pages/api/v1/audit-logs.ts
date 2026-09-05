import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.js';

export const GET: APIRoute = async () => {
  try {
    const logs = db.prepare(`
      SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100
    `).all() as any[];

    const parsed = logs.map((l) => {
      let meta = {};
      try {
        meta = JSON.parse(l.metadata || '{}');
      } catch {}
      return {
        ...l,
        metadata: meta
      };
    });

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
