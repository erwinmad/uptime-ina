import type { APIRoute } from 'astro';
import { db, verifyPassword, createSession, validateSession, deleteSession } from '../../../lib/db.js';
import { logAudit } from '../../../lib/security.js';

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    // Check cookie or auth header
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;

    return new Response(JSON.stringify({
      authenticated: !!session,
      user: session ? session.user : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    // Strict security: Registration and public setup are disabled to prevent abuse
    if (action === 'setup' || action === 'register') {
      return new Response(JSON.stringify({ 
        error: 'Pendaftaran akun publik dinonaktifkan demi keamanan. Silakan masuk menggunakan akun operator.' 
      }), { status: 403 });
    }

    // 1. User Login
    if (action === 'login') {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email dan kata sandi wajib diisi.' }), { status: 400 });
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;
      if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
        return new Response(JSON.stringify({ error: 'Email atau kata sandi tidak cocok.' }), { status: 401 });
      }

      const nowIso = new Date().toISOString();
      db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(nowIso, user.id);

      const session = createSession(user.id);
      cookies.set('sentinel_session', session.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      });

      logAudit('user.login_success', 'user', user.id, { email: user.email });

      return new Response(JSON.stringify({
        success: true,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
      }), { status: 200 });
    }

    // 2. Logout
    if (action === 'logout') {
      const token = cookies.get('sentinel_session')?.value;
      if (token) {
        deleteSession(token);
      }
      cookies.delete('sentinel_session', { path: '/' });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Aksi tidak valid.' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
