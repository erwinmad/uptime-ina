import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;

    if (!session) {
      return new Response(JSON.stringify({ error: 'Akses ditolak. Silakan login terlebih dahulu.' }), { status: 401 });
    }

    const payload = await request.json();
    const monitorsList = Array.isArray(payload) ? payload : (payload.monitors || payload.monitorList || []);

    if (!Array.isArray(monitorsList) || monitorsList.length === 0) {
      return new Response(JSON.stringify({ error: 'Data impor kosong atau format tidak valid.' }), { status: 400 });
    }

    let importedCount = 0;
    const insertStmt = db.prepare(`
      INSERT INTO monitors (
        id, name, type, target, port, interval_seconds, timeout_seconds, retries_before_down,
        keyword_match, keyword_type, ssl_check_enabled, active, current_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
    `);

    for (const item of monitorsList) {
      if (!item.name) continue;

      let type = 'http';
      const rawType = String(item.type || '').toLowerCase();
      if (rawType.includes('port') || rawType === 'tcp') type = 'tcp';
      else if (rawType.includes('ping')) type = 'tcp'; // mapped to TCP check
      else if (rawType.includes('push')) type = 'push';
      else if (rawType.includes('dns')) type = 'dns';

      const target = item.url || item.hostname || item.target || 'http://localhost';
      const port = item.port ? parseInt(item.port, 10) : null;
      const interval = item.interval ? parseInt(item.interval, 10) : 60;
      const retries = item.maxretries ? parseInt(item.maxretries, 10) : 3;
      const keyword = item.keyword || null;
      const ssl = target.startsWith('https://') ? 1 : 0;
      const id = 'mon_' + nanoid(10);

      try {
        insertStmt.run(id, item.name, type, target, port, interval, 15, retries, keyword, 'contains', ssl);
        importedCount++;
      } catch (err) {
        console.warn(`Skipped importing monitor "${item.name}":`, err);
      }
    }

    logAudit('monitors.imported_kuma', 'monitor', 'bulk', { count: importedCount, user: session.user.email });

    return new Response(JSON.stringify({
      success: true,
      imported_count: importedCount,
      message: `Berhasil mengimpor ${importedCount} monitor dari data Uptime Kuma!`
    }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
