import type { APIRoute } from 'astro';
import { validateSession } from '../../../../lib/db.js';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('session')?.value || cookies.get('sentinel_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const session = token ? validateSession(token) : null;
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '30d';
    const sla = url.searchParams.get('sla') || '99.9';

    // Target URL to render as PDF
    const origin = url.origin;
    const targetUrl = `${origin}/reports?range=${range}&sla=${sla}&print=true`;

    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    // Share the session cookie to the headless browser
    if (token) {
      await context.addCookies([
        {
          name: 'session',
          value: token,
          domain: url.hostname,
          path: '/'
        }
      ]);
    }

    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 20000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SLA-Report-${range}-${new Date().toISOString().slice(0,10)}.pdf"`
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
