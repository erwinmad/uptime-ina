import type { APIRoute } from 'astro';
import { db, validateSession, hashPassword } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async () => {
  try {
    const pages = db.prepare(`
      SELECT id, slug, title, description, is_public, password_hash, theme_config, created_at
      FROM status_pages
      ORDER BY created_at ASC
    `).all() as any[];

    const result = pages.map(p => {
      const monitorRows = db.prepare(`
        SELECT spm.monitor_id, COALESCE(spm.group_name, 'Layanan Utama') as group_name
        FROM status_page_monitors spm
        WHERE spm.status_page_id = ? 
        ORDER BY spm.display_order ASC
      `).all(p.id) as { monitor_id: string; group_name: string }[];

      // Organize into monitor_groups
      const groupMap: Record<string, string[]> = {};
      monitorRows.forEach(r => {
        if (!groupMap[r.group_name]) groupMap[r.group_name] = [];
        groupMap[r.group_name].push(r.monitor_id);
      });

      const monitor_groups = Object.keys(groupMap).map(name => ({
        group_name: name,
        monitors: groupMap[name]
      }));

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        is_public: p.is_public === 1,
        is_protected: Boolean(p.password_hash && p.password_hash.trim() !== ''),
        url: `/status/${p.slug}`,
        monitor_ids: monitorRows.map(m => m.monitor_id),
        monitor_groups,
        monitors_count: monitorRows.length,
        created_at: p.created_at
      };
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Sesi login tidak valid' }), { status: 401 });
    }

    const body = await request.json();
    const { title, slug: rawSlug, description = '', is_public = true, password = '', monitor_groups = [] } = body;

    if (!title || !title.trim()) {
      return new Response(JSON.stringify({ error: 'Judul status page wajib diisi' }), { status: 400 });
    }

    const slug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug tidak valid' }), { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM status_pages WHERE slug = ?').get(slug);
    if (existing) {
      return new Response(JSON.stringify({ error: `Slug "${slug}" sudah digunakan. Pilih slug lain.` }), { status: 400 });
    }

    const id = 'sp_' + nanoid(10);
    const passwordHash = password && password.trim() !== '' ? hashPassword(password) : null;

    db.prepare(`
      INSERT INTO status_pages (id, slug, title, description, is_public, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, slug, title.trim(), description.trim(), is_public ? 1 : 0, passwordHash);

    // Link monitors with custom group names
    if (Array.isArray(monitor_groups) && monitor_groups.length > 0) {
      const insertStmt = db.prepare(`
        INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order, group_name)
        VALUES (?, ?, ?, ?)
      `);
      let order = 0;
      for (const group of monitor_groups) {
        const grpName = group.group_name || 'Layanan Utama';
        if (Array.isArray(group.monitors)) {
          for (const monId of group.monitors) {
            insertStmt.run(id, monId, order++, grpName);
          }
        }
      }
    }

    logAudit('status_page.created', 'status_page', id, { slug, title, groups_count: monitor_groups.length });

    return new Response(JSON.stringify({
      success: true,
      id,
      slug,
      url: `/status/${slug}`
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
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Sesi login tidak valid' }), { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID status page wajib disertakan' }), { status: 400 });
    }

    const page = db.prepare('SELECT id, slug FROM status_pages WHERE id = ?').get(id) as any;
    if (!page) {
      return new Response(JSON.stringify({ error: 'Status page tidak ditemukan' }), { status: 404 });
    }

    if (page.slug === 'main') {
      return new Response(JSON.stringify({ error: 'Status page utama (main) tidak dapat dihapus.' }), { status: 403 });
    }

    db.prepare('DELETE FROM status_pages WHERE id = ?').run(id);
    logAudit('status_page.deleted', 'status_page', id, { slug: page.slug });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
