import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../lib/db.js';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

// GET: Inisialisasi setup 2FA (generate secret & QR code)
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const user = db.prepare('SELECT id, email, is_2fa_enabled, totp_secret FROM users WHERE id = ?').get(session.user.id) as any;
    if (!user) {
      return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), { status: 404 });
    }

    if (user.is_2fa_enabled) {
      return new Response(JSON.stringify({ is_2fa_enabled: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Generate secret baru jika belum aktif
    const secret = generateSecret();
    const otpauth = generateURI({
      issuer: 'Uptime CJR',
      label: user.email,
      secret
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    // Simpan temporary secret
    db.prepare('UPDATE users SET totp_secret = ? WHERE id = ?').run(secret, user.id);

    return new Response(JSON.stringify({
      is_2fa_enabled: false,
      secret,
      qr_code: qrCodeDataUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

// POST: Verifikasi token & toggle aktifkan / nonaktifkan 2FA
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { action, code } = body;

    const user = db.prepare('SELECT id, totp_secret, is_2fa_enabled FROM users WHERE id = ?').get(session.user.id) as any;
    if (!user || !user.totp_secret) {
      return new Response(JSON.stringify({ error: 'Konfigurasi 2FA belum diinisialisasi.' }), { status: 400 });
    }

    // Action: DISABLE
    if (action === 'disable') {
      const isValid = verifySync({ token: String(code).trim(), secret: user.totp_secret }).valid;
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Kode 2FA tidak valid.' }), { status: 400 });
      }

      db.prepare('UPDATE users SET is_2fa_enabled = 0, totp_secret = NULL WHERE id = ?').run(user.id);
      return new Response(JSON.stringify({ success: true, message: '2FA berhasil dinonaktifkan.' }), { status: 200 });
    }

    // Action: ENABLE (Verifikasi awal kode dari Authenticator app)
    const isValid = verifySync({ token: String(code).trim(), secret: user.totp_secret }).valid;
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Kode autentikasi 6-digit salah atau kadaluarsa.' }), { status: 400 });
    }

    db.prepare('UPDATE users SET is_2fa_enabled = 1 WHERE id = ?').run(user.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Autentikasi Dua Faktor (2FA) berhasil diaktifkan!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
