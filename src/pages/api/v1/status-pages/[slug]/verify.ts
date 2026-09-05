import type { APIRoute } from 'astro';
import { db, verifyPassword } from '../../../../../lib/db.js';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { slug } = params;
    const body = await request.json();
    const { password } = body;

    const page = db.prepare('SELECT * FROM status_pages WHERE slug = ?').get(slug) as any;
    if (!page) {
      return new Response(JSON.stringify({ error: 'Status page not found' }), { status: 404 });
    }

    if (!page.password_hash || page.password_hash.trim() === '') {
      return new Response(JSON.stringify({ success: true, message: 'No password required' }), { status: 200 });
    }

    if (!password || !verifyPassword(password, page.password_hash)) {
      return new Response(JSON.stringify({ error: 'Kata sandi salah.' }), { status: 401 });
    }

    // Set cookie to unlock
    cookies.set(`sp_auth_${slug}`, 'unlocked', {
      path: `/status/${slug}`,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
