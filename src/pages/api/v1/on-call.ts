import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../lib/db.js';
import { logAudit } from '../../../lib/security.js';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const schedules = db.prepare('SELECT * FROM on_call_schedules ORDER BY created_at DESC').all() as any[];
    const parsed = schedules.map(s => ({
      ...s,
      shift_days: JSON.parse(s.shift_days || '[]')
    }));

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { name, primary_name, primary_contact, secondary_name, secondary_contact, shift_days, shift_start_time, shift_end_time } = body;

    if (!name || !primary_name || !primary_contact) {
      return new Response(JSON.stringify({ error: 'Nama jadwal, nama operator utama, dan kontak wajib diisi' }), { status: 400 });
    }

    const id = 'oncall_' + nanoid(10);
    db.prepare(`
      INSERT INTO on_call_schedules (id, name, primary_name, primary_contact, secondary_name, secondary_contact, shift_days, shift_start_time, shift_end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      primary_name,
      primary_contact,
      secondary_name || '',
      secondary_contact || '',
      JSON.stringify(shift_days || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']),
      shift_start_time || '08:00',
      shift_end_time || '20:00'
    );

    logAudit('oncall.created', 'on_call', id, { name, primary_name });

    return new Response(JSON.stringify({ success: true, id }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Schedule ID is required' }), { status: 400 });
    }

    db.prepare('DELETE FROM on_call_schedules WHERE id = ?').run(id);
    logAudit('oncall.deleted', 'on_call', id, {});

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
