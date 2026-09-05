import type { APIRoute } from 'astro';
import { db, verifyPassword, updateUserPassword, validateSession } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;

    if (!session) {
      return new Response(JSON.stringify({ error: 'Akses ditolak. Silakan masuk kembali.' }), { status: 401 });
    }

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
      return new Response(JSON.stringify({ error: 'Kata sandi lama dan baru wajib diisi.' }), { status: 400 });
    }

    if (new_password.length < 6) {
      return new Response(JSON.stringify({ error: 'Kata sandi baru minimal 6 karakter.' }), { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user.id) as any;
    if (!user || !user.password_hash || !verifyPassword(current_password, user.password_hash)) {
      return new Response(JSON.stringify({ error: 'Kata sandi saat ini tidak cocok.' }), { status: 400 });
    }

    const success = updateUserPassword(session.user.id, new_password);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Gagal memperbarui kata sandi di database.' }), { status: 500 });
    }

    logAudit('user.password_changed', 'user', session.user.id, { email: session.user.email });

    return new Response(JSON.stringify({ success: true, message: 'Kata sandi berhasil diperbarui!' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
