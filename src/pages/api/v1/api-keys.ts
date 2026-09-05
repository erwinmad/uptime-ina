import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.js';
import { generateApiKey, logAudit } from '../../../lib/security.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async () => {
  try {
    const keys = db.prepare('SELECT id, name, key_preview, scopes, last_used_at, created_at FROM api_keys ORDER BY created_at DESC').all() as any[];
    const parsed = keys.map((k) => ({
      ...k,
      scopes: JSON.parse(k.scopes || '["*"]')
    }));
    return new Response(JSON.stringify(parsed), {
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
    const { name, scopes = ['*'] } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
    }

    const { rawKey, keyHash, preview } = generateApiKey(name, scopes);
    const id = 'key_' + nanoid(10);

    db.prepare(`
      INSERT INTO api_keys (id, name, key_hash, key_preview, scopes)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, keyHash, preview, JSON.stringify(scopes));

    logAudit('api_key.created', 'api_key', id, { name, scopes });

    return new Response(
      JSON.stringify({
        id,
        name,
        raw_key: rawKey, // Displayed ONLY once!
        preview,
        scopes,
        message: 'Save this API key safely. It will not be shown again.'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'Missing key id' }), { status: 400 });

    db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);
    logAudit('api_key.revoked', 'api_key', id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
