import { access, copyFile, cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, servicePages, documentLists } from '../src/data.mjs';
import { legalPage, mainPage, notFoundPage, servicePage } from '../src/templates.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const utf8 = { encoding: 'utf8' };

const staticWorker = `function assetPath(pathname) {
  if (pathname.endsWith('/')) return pathname + 'index.html';
  if (!pathname.split('/').pop().includes('.')) return pathname + '/index.html';
  return pathname;
}

async function fetchAsset(request, env, pathname, status = 200) {
  const url = new URL(request.url);
  url.pathname = pathname;
  const response = await env.ASSETS.fetch(new Request(url, request));
  if (response.status === 404) return response;
  return new Response(response.body, { status, headers: response.headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await fetchAsset(request, env, assetPath(url.pathname));
    if (response.status !== 404) return response;
    const notFoundUrl = new URL(request.url);
    notFoundUrl.pathname = '/404/';
    const notFound = await env.ASSETS.fetch(new Request(notFoundUrl, request));
    if (notFound.status === 404) return new Response('Not found', { status: 404 });
    return new Response(notFound.body, { status: 404, headers: notFound.headers });
  }
};
`;

async function output(relativePath, content) {
  const target = join(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, utf8);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

await output('index.html', mainPage());

for (const page of servicePages) {
  await output(`${page.slug}/index.html`, servicePage(page));
}

await output('privacy/index.html', legalPage('privacy'));
await output('consent/index.html', legalPage('consent'));
await output('404.html', notFoundPage());
await output('404/index.html', notFoundPage({ nested: true }));

const publicConfig = {
  PHONE: site.phone,
  PHONE_HREF: site.phoneHref,
  WHATSAPP_URL: site.whatsapp,
  TELEGRAM_URL: site.telegram,
  MAX_URL: site.maxUrl,
  EMAIL: site.email,
  FORM_ENDPOINT: site.formEndpoint,
  YANDEX_METRIKA_ID: site.yandexMetrikaId,
  DOCUMENT_LISTS: documentLists,
};

await output('site-config.js', `window.TECHUCHET_CONFIG = ${JSON.stringify(publicConfig, null, 2)};\n`);

const urls = ['', ...servicePages.map((page) => `${page.slug}/`), 'privacy/', 'consent/'];

await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${site.baseUrl}/${path}</loc><lastmod>2026-08-23</lastmod></url>`).join('\n')}
</urlset>
`);

await output('robots.txt', `User-agent: *
Allow: /

Sitemap: ${site.baseUrl}/sitemap.xml
`);

await output('site.webmanifest', JSON.stringify({
  name: 'ТехУчёт',
  short_name: 'ТехУчёт',
  start_url: './',
  display: 'standalone',
  background_color: '#0a101b',
  theme_color: '#0a101b',
  icons: [{ src: 'logo.png', sizes: '1024x682', type: 'image/png' }],
}, null, 2));

if (!dist.startsWith(root)) throw new Error('Refusing to write outside the project.');
await mkdir(dist, { recursive: true });
await rm(join(dist, 'server'), { recursive: true, force: true });
await rm(join(dist, 'client'), { recursive: true, force: true });
await rm(join(dist, '.openai'), { recursive: true, force: true });
await rm(join(dist, '.gitkeep'), { force: true });
await mkdir(join(dist, 'server'), { recursive: true });
await mkdir(join(dist, 'client'), { recursive: true });

for (const file of [
  'index.html', '404.html', 'style.css', 'script.js', 'site-config.js', 'logo.png', 'og.png',
  'robots.txt', 'sitemap.xml', 'site.webmanifest',
]) {
  await copyFile(join(root, file), join(dist, 'client', file));
}

for (const directory of [
  'assets', '404', ...servicePages.map((page) => page.slug), 'privacy', 'consent',
]) {
  await cp(join(root, directory), join(dist, 'client', directory), { recursive: true });
}

await writeFile(join(dist, 'server', 'index.js'), staticWorker, 'utf8');

const hostingConfig = join(root, '.openai', 'hosting.json');
if (await exists(hostingConfig)) {
  await mkdir(join(dist, '.openai'), { recursive: true });
  await copyFile(hostingConfig, join(dist, '.openai', 'hosting.json'));
}

console.log(`Built ${urls.length + 2} HTML pages and hosting bundle.`);
