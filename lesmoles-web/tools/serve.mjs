#!/usr/bin/env node
// Servidor local para ver dist/ en el navegador:  npm run serve  → http://localhost:4321
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const PORT = Number(process.env.PORT || 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function resolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let file = path.join(DIST, clean);
  if (!file.startsWith(DIST)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  return fs.existsSync(file) ? file : null;
}

export function createServer() {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    // /restaurant → /restaurant/ (como en el hosting)
    if (!pathname.endsWith('/') && !path.extname(pathname) && resolve(pathname + '/')) {
      res.writeHead(301, { Location: pathname + '/' });
      return res.end();
    }
    let file = resolve(pathname);
    let status = 200;
    if (!file) {
      status = 404;
      const lang = pathname.split('/')[1];
      file = resolve(['es', 'en'].includes(lang) ? `/${lang}/404.html` : '/404.html');
    }
    res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
}
