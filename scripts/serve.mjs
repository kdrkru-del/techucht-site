import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 8765);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let relative = normalize(pathname).replace(/^([/\\])+/, '');
    if (!relative || pathname.endsWith('/')) relative = join(relative, 'index.html');
    let target = join(root, relative);
    if (!target.startsWith(root)) throw new Error('Invalid path');
    try {
      if ((await stat(target)).isDirectory()) target = join(target, 'index.html');
    } catch {
      target = join(root, '404.html');
      response.statusCode = 404;
    }
    const body = await readFile(target);
    response.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(body);
  } catch {
    response.statusCode = 500;
    response.end('Server error');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Local URL: http://127.0.0.1:${port}/`);
});
