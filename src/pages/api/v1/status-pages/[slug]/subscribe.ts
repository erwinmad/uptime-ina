import type { APIRoute } from 'astro';
import { db } from '../../../../../lib/db.js';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { slug } = params;
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Alamat email tidak valid.' }), { status: 400 });
    }

    const page = db.prepare('SELECT id FROM status_pages WHERE slug = ?').get(slug) as any;
    if (!page) {
      return new Response(JSON.stringify({ error: 'Status page not found' }), { status: 404 });
    }

    const existing = db.prepare('SELECT id FROM status_page_subscribers WHERE status_page_id = ? AND email = ?').get(page.id, email.toLowerCase().trim());
    if (existing) {
      return new Response(JSON.stringify({ success: true, message: 'Email Anda sudah terdaftar untuk langganan notifikasi.' }), { status: 200 });
    }

    const id = 'sub_' + nanoid(10);
    db.prepare('INSERT INTO status_page_subscribers (id, status_page_id, email) VALUES (?, ?, ?)').run(id, page.id, email.toLowerCase().trim());

    return new Response(JSON.stringify({ success: true, message: 'Berhasil berlangganan notifikasi insiden!' }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
