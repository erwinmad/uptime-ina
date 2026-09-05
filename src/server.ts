import http from 'http';
import path from 'path';
import fs from 'fs';
import sirv from 'sirv';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { startMonitoringEngine } from './lib/engine.js';
import { db } from './lib/db.js';
import { broadcastEvent } from './lib/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  console.log('🌟 Starting SentinelUp Platform...');

  // 1. Seed demo monitors if table is empty
  const monitorCount = db.prepare('SELECT COUNT(*) as count FROM monitors').get() as { count: number };
  if (monitorCount.count === 0) {
    console.log('🌱 Seeding initial monitors for immediate demonstration...');
    db.prepare(`
      INSERT INTO monitors (id, name, type, target, interval_seconds, timeout_seconds, retries_before_down, current_status)
      VALUES 
        ('mon_cloudflare', 'Cloudflare DNS', 'http', 'https://1.1.1.1', 30, 10, 2, 'pending'),
        ('mon_google_dns', 'Google Public DNS', 'tcp', '8.8.8.8', 30, 10, 2, 'pending'),
        ('mon_github', 'GitHub API', 'http', 'https://api.github.com', 45, 10, 2, 'pending')
    `).run();
  }

  // 2. Load Astro SSR handler
  let astroHandler: any = null;
  const entryPath = path.resolve(__dirname, './dist/server/entry.mjs');
  if (fs.existsSync(entryPath)) {
    const entry = await import(entryPath);
    astroHandler = entry.handler;
  } else {
    console.warn('⚠️ ./dist/server/entry.mjs not found yet. Astro routes will be unavailable until built.');
  }

  // 3. Static asset handler for client files (CSS, JS, images)
  const clientDir = path.resolve(__dirname, './dist/client');
  const serveStatic = fs.existsSync(clientDir)
    ? sirv(clientDir, { dev: false, etag: true, single: false })
    : (req: any, res: any, next: any) => next();

  // 4. Create unified HTTP server
  const server = http.createServer((req, res) => {
    serveStatic(req, res, () => {
      if (astroHandler) {
        astroHandler(req, res);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>SentinelUp is starting... please build the project.</h1>');
      }
    });
  });

  // 5. Attach WebSocket server on /ws
  const wss = new WebSocketServer({ noServer: true });
  const clients = new Set<WebSocket>();

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'connected', time: new Date().toISOString() }));

    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  // 6. Start the Probing Scheduler Engine
  startMonitoringEngine();

  // 7. Listen on port
  server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  SentinelUp Platform is LIVE at: http://localhost:${PORT}`);
    console.log(`📊  Dashboard:    http://localhost:${PORT}/dashboard`);
    console.log(`🌐  Status Page:  http://localhost:${PORT}/status/main`);
    console.log(`📈  Prometheus:   http://localhost:${PORT}/api/metrics`);
    console.log(`======================================================\n`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
