import { db } from './db.js';
import { nanoid } from 'nanoid';
import { logAudit } from './security.js';

export interface SyncItem {
  nama_aplikasi: string;
  url_aplikasi: string;
  kategori?: string;
  nama_skpd?: string;
  nama_jenis_aplikasi?: string;
  is_active?: number | boolean;
}

export interface SyncResult {
  totalFetched: number;
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  items: Array<{
    name: string;
    target: string;
    category: string;
    status: 'added' | 'updated' | 'exists';
  }>;
}

export async function processApiSync(apiUrl: string, defaultIntervalSeconds = 3600, integrationId?: string): Promise<SyncResult> {
  // Fetch data from external API
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API mengembalikan status ${response.status}: ${response.statusText}`);
  }

  const rawJson = await response.json();
  
  // Support either { data: [...] } or direct array [...]
  let list: any[] = [];
  if (Array.isArray(rawJson)) {
    list = rawJson;
  } else if (Array.isArray(rawJson.data)) {
    list = rawJson.data;
  } else if (rawJson.items && Array.isArray(rawJson.items)) {
    list = rawJson.items;
  } else {
    throw new Error('Format JSON tidak dikenali. Harus berupa array atau memiliki properti "data" / "items".');
  }

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const processedItems: SyncResult['items'] = [];

  const checkStmt = db.prepare(`
    SELECT id, name, target, category_name, active 
    FROM monitors 
    WHERE RTRIM(target, '/') = RTRIM(?, '/')
       OR target = ? 
       OR target = ? || '/'
       OR target = RTRIM(?, '/')
  `);
  const insertStmt = db.prepare(`
    INSERT INTO monitors (
      id, name, type, target, interval_seconds, timeout_seconds, retries_before_down,
      http_method, http_headers, http_body, expected_status_codes, keyword_type,
      ssl_check_enabled, ssl_expiry_alert_days, active, current_status, category_name, tags
    ) VALUES (
      ?, ?, 'http', ?, ?, 15, 6,
      'GET', '{}', '', '[200, 201, 301, 302, 403]', 'contains',
      1, 14, ?, 'pending', ?, ?
    )
  `);
  const updateStmt = db.prepare(`
    UPDATE monitors 
    SET name = ?, category_name = COALESCE(?, category_name), active = ?, expected_status_codes = '[200, 201, 301, 302, 403]', updated_at = datetime('now')
    WHERE id = ?
  `);

  const nowIso = new Date().toISOString();

  for (const item of list) {
    const name = (item.nama_aplikasi || item.name || item.title || '').trim();
    let url = (item.url_aplikasi || item.url || item.target || '').trim();

    // Default to active unless explicitly false/0
    const isActive = (item.is_active === false || item.is_active === 0 || item.is_active === "0" || item.is_active === "false") ? 0 : 1;

    if (!name || !url) {
      skippedCount++;
      continue;
    }

    // Sanitize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Normalisasi: buang trailing slash di akhir jika path-nya hanya root '/'
    try {
      const parsed = new URL(url);
      if (parsed.pathname === '/') {
        url = `${parsed.protocol}//${parsed.host}`;
      }
    } catch {}

    const category = item.kategori || item.nama_skpd || item.nama_jenis_aplikasi || item.category || 'Layanan Utama';
    const tag = item.slug_aplikasi || item.alias_skpd || 'api-sync';
    const tagsJson = JSON.stringify(['api-sync', tag]);

    const existing = checkStmt.get(url, url, url, url) as any;

    if (existing) {
      // Update name/category/is_active if changed
      updateStmt.run(name, category, isActive, existing.id);
      updatedCount++;
      processedItems.push({
        name,
        target: url,
        category,
        status: 'updated'
      });
    } else {
      // Insert new monitor with mapped is_active state
      const newId = 'mon_' + nanoid(10);
      insertStmt.run(newId, name, url, defaultIntervalSeconds, isActive, category, tagsJson);
      addedCount++;
      processedItems.push({
        name,
        target: url,
        category,
        status: 'added'
      });
    }
  }

  // If this sync is tied to an integration entry, update last_synced_at
  if (integrationId) {
    db.prepare('UPDATE api_integrations SET last_synced_at = ? WHERE id = ?').run(nowIso, integrationId);
  }

  logAudit('monitors.api_sync', 'monitors', integrationId || 'manual', {
    url: apiUrl,
    added: addedCount,
    updated: updatedCount,
    skipped: skippedCount,
    total: list.length,
    items: processedItems.filter(i => i.status === 'added' || i.status === 'updated')
  });

  return {
    totalFetched: list.length,
    addedCount,
    updatedCount,
    skippedCount,
    items: processedItems
  };
}
