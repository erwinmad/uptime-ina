import crypto from 'crypto';
import { db } from './db.js';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generatePushToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(24).toString('base64url');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

export function generateApiKey(name: string, scopes: string[] = ['*']): { rawKey: string; keyHash: string; preview: string } {
  const randomPart = crypto.randomBytes(20).toString('hex');
  const rawKey = `sk_live_${randomPart}`;
  const keyHash = hashToken(rawKey);
  const preview = `sk_live_...${rawKey.slice(-6)}`;
  return { rawKey, keyHash, preview };
}

export function logAudit(action: string, resourceType?: string, resourceId?: string, metadata: Record<string, any> = {}) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (action, resource_type, resource_id, metadata)
      VALUES (?, ?, ?, ?)
    `).run(action, resourceType || null, resourceId || null, JSON.stringify(metadata));
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
