import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../lib/db.js';
import { processApiSync } from '../../../../lib/apiSync.js';
import { nanoid } from 'nanoid';

// Get active API integrations
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const integrations = db.prepare('SELECT * FROM api_integrations ORDER BY created_at DESC').all();
    
    return new Response(JSON.stringify(integrations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

// Create / Execute API Sync
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { action, id, name, api_url, sync_interval_hours, default_interval_seconds, auto_sync } = body;

    // Action: PREVIEW (Test Fetch)
    if (action === 'preview') {
      if (!api_url) return new Response(JSON.stringify({ error: 'URL API diperlukan' }), { status: 400 });
      // Fetch test (dry run) — use 3600s default to match UI
      const res = await processApiSync(api_url, 3600);
      return new Response(JSON.stringify(res), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Action: SAVE & SYNC
    if (action === 'save') {
      if (!api_url || !name) return new Response(JSON.stringify({ error: 'Nama dan URL wajib diisi' }), { status: 400 });
      
      let targetId = id;
      if (!targetId) {
        targetId = 'api_' + nanoid(10);
        db.prepare(`
          INSERT INTO api_integrations (id, name, api_url, sync_interval_hours, default_interval_seconds, auto_sync)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(targetId, name, api_url, sync_interval_hours || 168, default_interval_seconds || 3600, auto_sync ? 1 : 0);
      } else {
        db.prepare(`
          UPDATE api_integrations 
          SET name = ?, api_url = ?, sync_interval_hours = ?, default_interval_seconds = ?, auto_sync = ?
          WHERE id = ?
        `).run(name, api_url, sync_interval_hours || 168, default_interval_seconds || 3600, auto_sync ? 1 : 0, targetId);
      }

      // Execute actual sync process now — use 3600s default (1 jam) to match UI
      const syncResult = await processApiSync(api_url, default_interval_seconds || 3600, targetId);

      return new Response(JSON.stringify({ success: true, integration_id: targetId, result: syncResult }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Aksi tidak diketahui' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'ID diperlukan' }), { status: 400 });

    db.prepare('DELETE FROM api_integrations WHERE id = ?').run(id);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
