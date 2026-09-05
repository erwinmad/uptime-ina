import type { APIRoute } from 'astro';
import { getBrandingSettings, updateBrandingSettings } from '../../../../lib/db.js';
import { logAudit } from '../../../../lib/security.js';
import { broadcastEvent } from '../../../../lib/websocket.js';

export const GET: APIRoute = async () => {
  try {
    const branding = getBrandingSettings();
    return new Response(JSON.stringify(branding), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    updateBrandingSettings(body);
    const updated = getBrandingSettings();

    logAudit('branding.updated', 'system_settings', 'branding', body);
    broadcastEvent('branding_updated', updated);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
