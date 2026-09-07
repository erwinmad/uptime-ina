import type { APIRoute } from 'astro';
import { db, validateSession } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Hanya Admin yang dapat mengunduh backup database' }), { status: 403 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const dateStr = new Date().toISOString().slice(0, 10);

    logAudit('backup.exported', 'system', 'backup', { format, exported_by: session.user.email });

    if (format === 'sqlite') {
      const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'sentinelup.db');
      if (!fs.existsSync(dbPath)) {
        return new Response(JSON.stringify({ error: 'File database tidak ditemukan' }), { status: 404 });
      }

      // Checkpoint WAL first so SQLite file has all latest transactions
      try {
        db.pragma('wal_checkpoint(TRUNCATE)');
      } catch {}

      const fileBuffer = fs.readFileSync(dbPath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-sqlite3',
          'Content-Disposition': `attachment; filename="detak-backup-${dateStr}.db"`,
          'Content-Length': fileBuffer.length.toString()
        }
      });
    }

    // Default: JSON export
    const monitors = db.prepare('SELECT * FROM monitors').all();
    const channels = db.prepare('SELECT id, type, name, active, created_at FROM notification_channels').all();
    const statusPages = db.prepare('SELECT id, slug, title, description, is_public, created_at FROM status_pages').all();
    const onCall = db.prepare('SELECT * FROM on_call_schedules').all();
    const escalations = db.prepare('SELECT * FROM escalation_policies').all();
    const maintenance = db.prepare('SELECT * FROM maintenance_windows').all();

    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      exported_by: session.user.email,
      data: {
        monitors,
        notification_channels: channels,
        status_pages: statusPages,
        on_call_schedules: onCall,
        escalation_policies: escalations,
        maintenance_windows: maintenance
      }
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    return new Response(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="detak-export-${dateStr}.json"`
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
