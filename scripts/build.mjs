import { access, copyFile, cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, spbSite, servicePages, documentLists } from '../src/data.mjs';
import {
  contactsPage,
  legalPage,
  mainPage,
  notFoundPage,
  servicePage,
  spbPage,
  spbSubdomainMainPage,
  spbSubdomainServicePage,
  spbSubdomainContactsPage,
  spbSubdomainLegalPage,
  spbSubdomainNotFoundPage,
} from '../src/templates.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const distSpb = join(root, 'dist-spb');
const utf8 = { encoding: 'utf8' };

const staticWorker = `function assetPath(pathname, hostname) {
  if (hostname === 'spb.tehuchet24.ru') {
    if (pathname === '/' || pathname === '') return '/spb/index.html';
    if (pathname.startsWith('/assets/') || pathname.includes('.')) return pathname;
    if (pathname.endsWith('/')) return '/spb' + pathname + 'index.html';
    return '/spb' + pathname + '/index.html';
  }
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
    if (url.pathname === '/api/lead') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept'
          }
        });
      }
      if (request.method === 'POST') {
        const bodyText = await request.text();
        const upstream = await fetch('https://zelsrez-leads.roman-k-0b3.workers.dev/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://tehuchet24.ru'
          },
          body: bodyText
        });
        const respText = await upstream.text();
        return new Response(respText, {
          status: upstream.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    const response = await fetchAsset(request, env, assetPath(url.pathname, url.hostname));
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

async function outputSpb(relativePath, content) {
  const target = join(distSpb, relativePath);
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

// 1. Build main Moscow site
await output('index.html', mainPage());
await output('spb/index.html', spbPage());

for (const page of servicePages) {
  await output(`${page.slug}/index.html`, servicePage(page));
  // Also build SPB subpages under spb/<slug>/
  await output(`spb/${page.slug}/index.html`, spbSubdomainServicePage(page));
}

await output('kontakty/index.html', contactsPage());
await output('privacy/index.html', legalPage('privacy'));
await output('consent/index.html', legalPage('consent'));
await output('404.html', notFoundPage());
await output('404/index.html', notFoundPage({ nested: true }));

await output('spb/kontakty/index.html', spbSubdomainContactsPage());
await output('spb/privacy/index.html', spbSubdomainLegalPage('privacy'));
await output('spb/consent/index.html', spbSubdomainLegalPage('consent'));

const publicConfig = {
  PHONE: site.phone,
  PHONE_HREF: site.phoneHref,
  WHATSAPP_URL: site.whatsapp,
  TELEGRAM_URL: site.telegram,
  MAX_URL: site.maxUrl,
  EMAIL: site.email,
  FORM_ENDPOINT: site.formEndpoint,
  FALLBACK_FORM_ENDPOINT: `https://formsubmit.co/ajax/${site.email}`,
  YANDEX_METRIKA_ID: site.yandexMetrikaId,
  DOCUMENT_LISTS: documentLists,
};

await output('site-config.js', `window.TECHUCHET_CONFIG = ${JSON.stringify(publicConfig, null, 2)};\n`);

const urls = ['', 'spb/', ...servicePages.map((page) => `${page.slug}/`), 'kontakty/', 'privacy/', 'consent/'];
const sitemapUrls = ['', 'spb/', ...servicePages.map((page) => `${page.slug}/`), 'kontakty/'];

await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((path) => `  <url><loc>${site.baseUrl}/${path}</loc><lastmod>2026-09-28</lastmod></url>`).join('\n')}
</urlset>
`);

await output('robots.txt', `User-agent: *
Allow: /
Clean-param: yclid&utm_source&utm_medium&utm_campaign&utm_content&utm_term /

Sitemap: ${site.baseUrl}/sitemap.xml
`);

await output('site.webmanifest', JSON.stringify({
  name: 'ТехУчёт',
  short_name: 'ТехУчёт',
  start_url: './',
  display: 'standalone',
  background_color: '#F6F8FB',
  theme_color: '#17324D',
  icons: [{ src: 'favicon.png', sizes: '1254x1254', type: 'image/png' }],
}, null, 2));

// 2. Build standalone SPB subdomain bundle in dist-spb/
await rm(distSpb, { recursive: true, force: true });
await mkdir(distSpb, { recursive: true });

await outputSpb('index.html', spbSubdomainMainPage());
for (const page of servicePages) {
  await outputSpb(`${page.slug}/index.html`, spbSubdomainServicePage(page));
}
await outputSpb('kontakty/index.html', spbSubdomainContactsPage());
await outputSpb('privacy/index.html', spbSubdomainLegalPage('privacy'));
await outputSpb('consent/index.html', spbSubdomainLegalPage('consent'));
await outputSpb('404.html', spbSubdomainNotFoundPage());
await outputSpb('404/index.html', spbSubdomainNotFoundPage({ nested: true }));
await outputSpb('CNAME', 'spb.tehuchet24.ru\n');

const spbSitemapUrls = ['', ...servicePages.map((page) => `${page.slug}/`), 'kontakty/'];
await outputSpb('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${spbSitemapUrls.map((path) => `  <url><loc>${spbSite.baseUrl}/${path}</loc><lastmod>2026-09-28</lastmod></url>`).join('\n')}
</urlset>
`);

await outputSpb('robots.txt', `User-agent: *
Allow: /
Clean-param: yclid&utm_source&utm_medium&utm_campaign&utm_content&utm_term /

Sitemap: ${spbSite.baseUrl}/sitemap.xml
`);

for (const file of [
  'style.css', 'script.js', 'site-config.js', 'cro-tracker.js', 'favicon.png', 'logo.png', 'logo-dark.png', 'og.png', 'site.webmanifest'
]) {
  await copyFile(join(root, file), join(distSpb, file));
}
await cp(join(root, 'assets'), join(distSpb, 'assets'), { recursive: true });

// 3. Build dist/ hosting bundle
if (!dist.startsWith(root)) throw new Error('Refusing to write outside the project.');
await mkdir(dist, { recursive: true });
await rm(join(dist, 'server'), { recursive: true, force: true });
await rm(join(dist, 'client'), { recursive: true, force: true });
await rm(join(dist, '.openai'), { recursive: true, force: true });
await rm(join(dist, '.gitkeep'), { force: true });
await mkdir(join(dist, 'server'), { recursive: true });
await mkdir(join(dist, 'client'), { recursive: true });

for (const file of [
  'index.html', '404.html', 'style.css', 'script.js', 'site-config.js', 'cro-tracker.js', 'favicon.png', 'logo.png', 'logo-dark.png', 'og.png',
  'robots.txt', 'sitemap.xml', 'site.webmanifest', 'yandex_51c60f752ea2994f.html', 'yandex_97c871531f08a479.html',
]) {
  await copyFile(join(root, file), join(dist, 'client', file));
}

for (const directory of [
  'assets', '404', 'spb', ...servicePages.map((page) => page.slug), 'kontakty', 'privacy', 'consent',
]) {
  await cp(join(root, directory), join(dist, 'client', directory), { recursive: true });
}

await writeFile(join(dist, 'server', 'index.js'), staticWorker, 'utf8');

const hostingConfig = join(root, '.openai', 'hosting.json');
if (await exists(hostingConfig)) {
  await mkdir(join(dist, '.openai'), { recursive: true });
  await copyFile(hostingConfig, join(dist, '.openai', 'hosting.json'));
}

console.log(`Built ${urls.length + 2} HTML pages, SPB standalone bundle (${spbSitemapUrls.length} pages in dist-spb/) and hosting bundle.`);
