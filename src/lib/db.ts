import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { nanoid } from 'nanoid';

const DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'sentinelup.db');

export const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS monitors (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'http', 'tcp', 'ping', 'push', 'dns'
      target TEXT NOT NULL,
      port INTEGER,
      interval_seconds INTEGER DEFAULT 60,
      timeout_seconds INTEGER DEFAULT 15,
      retries_before_down INTEGER DEFAULT 6,
      http_method TEXT DEFAULT 'GET',
      http_headers TEXT DEFAULT '{}',
      http_body TEXT,
      expected_status_codes TEXT DEFAULT '[200]',
      keyword_match TEXT,
      keyword_type TEXT DEFAULT 'contains',
      ssl_check_enabled INTEGER DEFAULT 0,
      ssl_expiry_alert_days INTEGER DEFAULT 14,
      active INTEGER DEFAULT 1,
      current_status TEXT DEFAULT 'pending', -- 'up', 'down', 'pending', 'paused'
      consecutive_fails INTEGER DEFAULT 0,
      last_checked_at TEXT,
      last_status_change_at TEXT,
      push_token_raw TEXT, -- displayed once or regenerated
      push_token_hash TEXT,
      push_expected_interval_seconds INTEGER,
      push_grace_period_seconds INTEGER DEFAULT 60,
      push_last_received_at TEXT,
      tags TEXT DEFAULT '[]', -- JSON array of string tags
      dns_record_type TEXT DEFAULT 'A', -- 'A', 'AAAA', 'CNAME', 'MX', 'TXT'
      dns_expected_value TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_monitors_active ON monitors(active);
    CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(current_status);

    CREATE TABLE IF NOT EXISTS api_integrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      api_url TEXT NOT NULL,
      sync_interval_hours INTEGER DEFAULT 168, -- default 1 week
      default_interval_seconds INTEGER DEFAULT 60,
      auto_sync INTEGER DEFAULT 1,
      last_synced_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS maintenance_windows (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      affected_monitor_ids TEXT DEFAULT '["*"]', -- JSON array of monitor IDs or ["*"] for all
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS monitor_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
      status TEXT NOT NULL, -- 'up', 'down'
      response_time_ms INTEGER,
      status_code INTEGER,
      error_message TEXT,
      ssl_days_remaining INTEGER,
      checked_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_checks_monitor_checked ON monitor_checks(monitor_id, checked_at DESC);

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      monitor_id TEXT REFERENCES monitors(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'investigating', -- 'investigating', 'identified', 'monitoring', 'resolved'
      started_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT,
      is_auto_created INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS incident_updates (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      status TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notification_channels (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      type TEXT NOT NULL, -- 'webhook', 'telegram', 'discord', 'slack', 'email'
      name TEXT NOT NULL,
      config TEXT NOT NULL, -- JSON
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status_pages (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_public INTEGER DEFAULT 1,
      password_hash TEXT,
      theme_config TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status_page_monitors (
      status_page_id TEXT NOT NULL REFERENCES status_pages(id) ON DELETE CASCADE,
      monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
      display_order INTEGER DEFAULT 0,
      custom_label TEXT,
      PRIMARY KEY (status_page_id, monitor_id)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      key_preview TEXT NOT NULL,
      scopes TEXT DEFAULT '["*"]',
      last_used_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

    CREATE TABLE IF NOT EXISTS status_page_subscribers (
      id TEXT PRIMARY KEY,
      status_page_id TEXT NOT NULL REFERENCES status_pages(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS escalation_policies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      wait_minutes INTEGER DEFAULT 5,
      channel_ids TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS on_call_schedules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      primary_name TEXT NOT NULL,
      primary_contact TEXT NOT NULL,
      secondary_name TEXT,
      secondary_contact TEXT,
      shift_days TEXT DEFAULT '["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]',
      shift_start_time TEXT DEFAULT '08:00',
      shift_end_time TEXT DEFAULT '20:00',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS probe_nodes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      api_token_hash TEXT,
      status TEXT DEFAULT 'online',
      last_heartbeat_at TEXT,
      latency_ms INTEGER DEFAULT 5,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safe column migrations for existing database
  try {
    const tableInfo = db.prepare("PRAGMA table_info(monitors)").all() as { name: string }[];
    const colNames = new Set(tableInfo.map(c => c.name));
    if (!colNames.has('tags')) db.exec("ALTER TABLE monitors ADD COLUMN tags TEXT DEFAULT '[]'");
    if (!colNames.has('dns_record_type')) db.exec("ALTER TABLE monitors ADD COLUMN dns_record_type TEXT DEFAULT 'A'");
    if (!colNames.has('dns_expected_value')) db.exec("ALTER TABLE monitors ADD COLUMN dns_expected_value TEXT");

    const incInfo = db.prepare("PRAGMA table_info(incidents)").all() as { name: string }[];
    const incCols = new Set(incInfo.map(c => c.name));
    if (!incCols.has('root_cause')) db.exec("ALTER TABLE incidents ADD COLUMN root_cause TEXT");
    if (!incCols.has('action_items')) db.exec("ALTER TABLE incidents ADD COLUMN action_items TEXT");
    if (!incCols.has('prevention_plan')) db.exec("ALTER TABLE incidents ADD COLUMN prevention_plan TEXT");
  } catch (err) {
    console.error('Migration error:', err);
  }

  // Seed default probe nodes if empty
  try {
    const probeCount = db.prepare('SELECT COUNT(*) as count FROM probe_nodes').get() as { count: number };
    if (probeCount.count === 0) {
      const nowIso = new Date().toISOString();
      db.prepare(`
        INSERT INTO probe_nodes (id, name, region, status, last_heartbeat_at, latency_ms, created_at)
        VALUES ('prb_primary', 'Node Utama — Cianjur Data Center', 'cjr-dc1', 'online', ?, 4, ?)
      `).run(nowIso, nowIso);
      db.prepare(`
        INSERT INTO probe_nodes (id, name, region, status, last_heartbeat_at, latency_ms, created_at)
        VALUES ('prb_secondary', 'Node Edge — Jakarta Gateway', 'jkt-idc', 'online', ?, 12, ?)
      `).run(nowIso, nowIso);
    }
  } catch (err) {
    console.error('Probe seeding error:', err);
  }

  // Seed default data if empty
  const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get() as { count: number };
  if (orgCount.count === 0) {
    db.prepare(`
      INSERT INTO organizations (id, name, slug)
      VALUES ('org-default', 'deTAK Default Org', 'default')
    `).run();

    db.prepare(`
      INSERT INTO status_pages (id, slug, title, description, is_public)
      VALUES ('sp-default', 'main', 'deTAK System Status', 'Real-time uptime and incident report for all primary services', 1)
    `).run();
  }

  // Seed default branding settings if empty
  const settingCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get() as { count: number };
  if (settingCount.count === 0) {
    const seedSettings = [
      ['app_name', 'deTAK'],
      ['app_tagline', 'Platform Observabilitas & Pemantauan Ketersediaan Layanan'],
      ['footer_text', 'Powered by deTAK — Uptime & Observability Platform'],
      ['logo_icon', '💓'],
      ['favicon_url', ''],
      ['primary_color', '#4f46e5']
    ];
    for (const [k, v] of seedSettings) {
      db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)').run(k, v);
    }
  }

  // Seed default admin user if empty (strictly no public registration)
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@detak.local').toLowerCase();
    const defaultPass = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const defaultName = 'Administrator';
    const hashed = hashPassword(defaultPass);
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at)
      VALUES ('usr_admin_default', ?, ?, ?, 'admin', ?)
    `).run(defaultEmail, hashed, defaultName, nowIso);
    console.log(`🔐 Admin initialized: ${defaultEmail}`);
  }
}

export interface BrandingSettings {
  app_name: string;
  app_tagline: string;
  footer_text: string;
  logo_icon: string;
  favicon_url: string;
  primary_color: string;
}

export function getBrandingSettings(): BrandingSettings {
  const defaults: BrandingSettings = {
    app_name: 'deTAK',
    app_tagline: 'Platform Observabilitas & Pemantauan Ketersediaan Layanan',
    footer_text: 'Powered by deTAK — Uptime & Observability Platform',
    logo_icon: '🌐',
    favicon_url: '',
    primary_color: '#4f46e5'
  };

  try {
    const rows = db.prepare('SELECT key, value FROM system_settings').all() as { key: string; value: string }[];
    for (const r of rows) {
      if (r.key in defaults) {
        (defaults as any)[r.key] = r.value;
      }
    }
  } catch (err) {
    console.error('Error fetching branding settings:', err);
  }
  return defaults;
}

export function updateBrandingSettings(settings: Partial<BrandingSettings>) {
  const stmt = db.prepare(`
    INSERT INTO system_settings (key, value, updated_at) 
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);
  for (const [k, v] of Object.entries(settings)) {
    if (v !== undefined && v !== null) {
      stmt.run(k, String(v));
    }
  }
}

// ================= AUTHENTICATION HELPERS ================= //

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

export function getUserCount(): number {
  try {
    const res = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    return res ? res.count : 0;
  } catch {
    return 0;
  }
}

export function createSession(userId: string, durationDays = 30): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run('sess_' + nanoid(10), userId, token, expiresAt);
  return { token, expiresAt };
}

export function validateSession(token: string): { user: { id: string; email: string; full_name: string; role: string } } | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const nowIso = new Date().toISOString();
    const session = db.prepare(`
      SELECT s.*, u.id as user_id, u.email, u.full_name, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > ?
    `).get(token, nowIso) as any;

    if (!session) return null;
    return {
      user: {
        id: session.user_id,
        email: session.email,
        full_name: session.full_name || 'Operator',
        role: session.role || 'admin'
      }
    };
  } catch (err) {
    console.error('Session validation error:', err);
    return null;
  }
}

export function deleteSession(token: string): void {
  if (!token) return;
  try {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  } catch (err) {
    console.error('Session deletion error:', err);
  }
}

export function updateUserPassword(userId: string, newPassword: string): boolean {
  try {
    const hashed = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashed, userId);
    return true;
  } catch (err) {
    console.error('Update password error:', err);
    return false;
  }
}

// Auto init on import
initDb();


