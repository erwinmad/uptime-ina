import type { APIRoute } from 'astro';
import { db, getBrandingSettings } from '../../../lib/db.js';

export const GET: APIRoute = async ({ params, site, url }) => {
  const { slug = 'main' } = params;
  const page = db.prepare('SELECT * FROM status_pages WHERE slug = ?').get(slug) as any;

  if (!page) {
    return new Response('Status page not found', { status: 404 });
  }

  const branding = getBrandingSettings();
  const origin = url.origin;
  const pageUrl = `${origin}/status/${slug}`;

  // Get recent incidents
  const incidents = db.prepare(`
    SELECT i.id, i.title, i.status, i.started_at, i.resolved_at, m.name as monitor_name
    FROM incidents i
    LEFT JOIN monitors m ON i.monitor_id = m.id
    ORDER BY i.started_at DESC
    LIMIT 20
  `).all() as any[];

  const itemsXml = incidents.map(inc => {
    const updates = db.prepare(`
      SELECT message, status, created_at
      FROM incident_updates
      WHERE incident_id = ?
      ORDER BY created_at DESC
    `).all(inc.id) as any[];

    const updateLines = updates.map(u => 
      `<li><strong>[${u.status?.toUpperCase() || 'INFO'}]</strong> ${escapeXml(u.message)} <small>(${new Date(u.created_at).toUTCString()})</small></li>`
    ).join('');

    const description = `
      <![CDATA[
        <p><strong>Layanan Terkait:</strong> ${escapeXml(inc.monitor_name || 'Infrastruktur Sistem')}</p>
        <p><strong>Status Terkini:</strong> ${inc.status?.toUpperCase()}</p>
        <p><strong>Waktu Mulai:</strong> ${new Date(inc.started_at).toUTCString()}</p>
        ${inc.resolved_at ? `<p><strong>Waktu Selesai:</strong> ${new Date(inc.resolved_at).toUTCString()}</p>` : ''}
        <h4>Riwayat Pembaruan:</h4>
        <ul>${updateLines}</ul>
      ]]>
    `.trim();

    return `
      <item>
        <title>[${inc.status?.toUpperCase()}] ${escapeXml(inc.title)}</title>
        <link>${pageUrl}</link>
        <guid isPermaLink="false">${inc.id}</guid>
        <pubDate>${new Date(inc.started_at).toUTCString()}</pubDate>
        <description>${description}</description>
      </item>
    `;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(page.title || branding.app_name)} — Status Layanan RSS</title>
    <link>${pageUrl}</link>
    <description>${escapeXml(page.description || branding.app_tagline)}</description>
    <language>id-ID</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/status/${slug}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`.trim();

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60'
    }
  });
};

function escapeXml(unsafe: string = ''): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
