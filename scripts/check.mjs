import { access, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, site, servicePages } from '../src/data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const legacyHostSuffix = ['github', 'io'].join('.');
const legacyProductionUrl = `kdrkru-del.${legacyHostSuffix}/techucht-site`;
const expectedProductionUrl = 'https://tehuchet24.ru';
const htmlFiles = [
  'index.html',
  ...servicePages.map((page) => `${page.slug}/index.html`),
  'privacy/index.html',
  'consent/index.html',
  '404.html',
  '404/index.html',
];

const requiredMain = [
  'Регистрация самоходной техники в Москве, МО и по всей России',
  'от 5 000 ₽',
  'Поможем подготовить документы и сопроводим постановку на учёт, снятие с учёта, восстановление документов и другие регистрационные действия с самоходной техникой.',
  'data-counter="85">85',
  'data-counter="3200">3 200',
  'data-counter="7">7',
  'ООО «ЮНАТ»',
  'ОГРН 1242500018859',
  'jobstat@bk.ru',
];

const forbidden = [
  'roman.k@mail.ru',
  '8 800 000-00-00',
  '8 800 123-45-67',
  'Базовый',
  'Премиум',
  'Оплата после результата',
  'Аванс 50%',
  '2 350 ₽',
  'Личное обращение',
  'FormSubmit',
  '3 000 ₽',
  'Восстановление ПСМ или ЭПСМ',
  'Восстановление ПСМ и ЭПСМ',
  'Восстановление ЭПСМ',
  'восстановить ЭПСМ',
  'card-index"><span>01</span>',
  'РАБОТАЕМ ПО ВСЕЙ РОССИИ',
];

const errors = [];
async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (SITE_URL !== expectedProductionUrl || site.baseUrl !== expectedProductionUrl) {
  errors.push(`src/data.mjs: SITE_URL must be ${expectedProductionUrl}`);
}

for (const file of htmlFiles) {
  const html = await readFile(join(root, file), 'utf8');
  const route = file === 'index.html' ? '' : file.replace(/index\.html$/, '');
  const expectedCanonical = file.startsWith('404') ? `${site.baseUrl}/404` : `${site.baseUrl}/${route}`;
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}">`)) {
    errors.push(`${file}: canonical must be ${expectedCanonical}`);
  }
  if (!html.includes(`<meta property="og:url" content="${expectedCanonical}">`)) {
    errors.push(`${file}: og:url must be ${expectedCanonical}`);
  }
  if (!html.includes(`<meta property="og:image" content="${site.baseUrl}/og.png">`)) {
    errors.push(`${file}: og:image must use the production domain`);
  }
  if (!html.includes(`<meta name="twitter:image" content="${site.baseUrl}/og.png">`)) {
    errors.push(`${file}: twitter:image must use the production domain`);
  }
  if (html.includes(legacyProductionUrl) || html.includes(legacyHostSuffix)) {
    errors.push(`${file}: legacy GitHub Pages URL found`);
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch {
      errors.push(`${file}: invalid JSON-LD`);
    }
  }
  if (!html.includes('name="consent"') && !file.startsWith('404')) errors.push(`${file}: missing consent field`);
  if ((html.match(/site-config\.js\?v=11/g) || []).length !== 1) errors.push(`${file}: site-config.js must be included exactly once`);
  if ((html.match(/script\.js\?v=11/g) || []).length !== 1) errors.push(`${file}: script.js must be included exactly once`);
  if (/mc\.yandex\.ru\/metrika\/tag\.js/.test(html)) errors.push(`${file}: inline duplicate Metrika loader found`);
  if (html.includes('name="keywords"')) errors.push(`${file}: meta keywords found`);
  for (const value of forbidden) {
    if (html.includes(value)) errors.push(`${file}: forbidden text "${value}"`);
  }
}

const main = await readFile(join(root, 'index.html'), 'utf8');
for (const value of requiredMain) {
  if (!main.includes(value)) errors.push(`index.html: required text missing "${value}"`);
}
if (!main.includes('"price":"5000"')) errors.push('index.html: schema.org price 5000 missing');
for (const value of ['Восстановление ПСМ', 'Восстановление СТС', 'data-service-event="restore_sts"']) {
  if (!main.includes(value)) errors.push(`index.html: document service missing "${value}"`);
}

const js = await readFile(join(root, 'site-config.js'), 'utf8');
if (!js.includes('"YANDEX_METRIKA_ID": "111852031"')) errors.push('site-config.js: Yandex Metrika ID 111852031 missing');
if ((js.match(/111852031/g) || []).length !== 1) errors.push('site-config.js: Yandex Metrika ID must occur exactly once');
if ((js.match(/const src = `https:\/\/mc\.yandex\.ru\/metrika\/tag\.js/g) || []).length !== 1) errors.push('site-config.js: Metrika loader must be declared exactly once');
for (const option of ['webvisor: true', 'clickmap: true', 'accurateTrackBounce: true', 'trackLinks: true']) {
  if (!js.includes(option)) errors.push(`site-config.js: Metrika option missing "${option}"`);
}
if (/ecommerce/i.test(js)) errors.push('site-config.js: ecommerce must remain disabled');
if (!js.includes('"TELEGRAM_URL": "https://t.me/Romatran"')) errors.push('site-config.js: TELEGRAM_URL missing');
if (!js.includes('"MAX_URL": "https://max.ru/u/f9LHodD0cOIyRnk4XSMp9LQv3nUe6pWwsL4DqMp_p80p0ISba6wNwFpIQy4"')) errors.push('site-config.js: personal MAX profile URL missing');
if (!js.includes('zelsrez-leads.roman-k-0b3.workers.dev/api/lead')) errors.push('site-config.js: Telegram lead endpoint missing');

const mainMaxLinks = (main.match(/class="[^"]*track-max/g) || []).length;
if (mainMaxLinks < 6) errors.push(`index.html: expected MAX in all contact areas, found ${mainMaxLinks}`);
if (/href="[^"]*max\.ru/i.test(main)) errors.push('index.html: MAX URL must come from site-config.js');
const mainMaxTags = main.match(/<a class="[^"]*track-max[^"]*"[^>]*>[\s\S]*?<\/a>/g) || [];
if (mainMaxTags.some((tag) => /925[\s-]*757|79257577888/.test(tag))) errors.push('index.html: phone must not be displayed inside MAX buttons');
if (!main.includes('href="favicon.png?v=2"')) errors.push('index.html: favicon v2 missing');
if (!main.includes('rel="shortcut icon"')) errors.push('index.html: shortcut favicon missing');
if (!main.includes('href="vosstanovlenie-sts/"')) errors.push('index.html: restoration STS page link missing');

const clientScript = await readFile(join(root, 'script.js'), 'utf8');
if (!clientScript.includes("trackGoal('click_max')")) errors.push('script.js: click_max goal missing');
if (!clientScript.includes("restore_sts: 'service_restore_sts'")) errors.push('script.js: service_restore_sts goal missing');
if (!clientScript.includes('form.dataset.selectedService || selectedService')) errors.push('script.js: CTA service handoff missing');
for (const invariant of [
  "form.addEventListener('submit', (event) => submitLead(event, form))",
  'fetch(CONFIG.FORM_ENDPOINT',
  "method: 'POST'",
  'result?.ok === true',
  "trackGoal('lead_form_success')",
  "trackGoal('lead_form_error')",
  "trackGoal('lead_form_start')",
  "trackGoal('lead_form_open')",
  'getClientID',
  'cachedMetrikaClientId',
  'landing_url',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'yclid',
  'client_id',
  'ym-disable-keys',
]) {
  if (!clientScript.includes(invariant)) errors.push(`script.js: form submission invariant missing "${invariant}"`);
}
if (/mc\.yandex\.ru\/metrika\/tag\.js|initYandexMetrika/.test(clientScript)) errors.push('script.js: duplicate Metrika initialization found');
for (const offlineOnlyGoal of ['qualified_lead', 'sale']) {
  if (clientScript.includes(offlineOnlyGoal)) errors.push(`script.js: offline-only goal must not fire on site "${offlineOnlyGoal}"`);
}

for (const file of htmlFiles.filter((file) => !file.startsWith('404'))) {
  const html = await readFile(join(root, file), 'utf8');
  const leadForms = html.match(/<form\b[^>]*data-lead-form[\s\S]*?<\/form>/g) || [];
  if (!leadForms.length) errors.push(`${file}: lead forms missing`);
  leadForms.forEach((form, index) => {
    if (!/name="name"[^>]*type="text"/.test(form)) errors.push(`${file}: form ${index + 1} missing name field`);
    if (!/name="phone"[^>]*type="tel"/.test(form)) errors.push(`${file}: form ${index + 1} missing phone field`);
    for (const field of form.match(/<(?:input|select|textarea)\b[^>]*>/g) || []) {
      if (!/class="[^"]*ym-disable-keys/.test(field)) errors.push(`${file}: form ${index + 1} contains an unprotected Webvisor field`);
    }
    if (/<select\b|<textarea\b|type="radio"|name="(?:region|service|tech|owner|comment)"/.test(form)) {
      errors.push(`${file}: form ${index + 1} contains fields other than name and phone`);
    }
  });
}

const productionOrigin = new URL(site.baseUrl).origin;
for (const file of htmlFiles) {
  const html = await readFile(join(root, file), 'utf8');
  const documentPath = file === 'index.html' ? '/' : `/${file.replace(/index\.html$/, '')}`;
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (!reference || /^(?:tel:|mailto:|javascript:|data:)/i.test(reference)) continue;
    const url = new URL(reference, new URL(documentPath, productionOrigin));
    if (url.origin !== productionOrigin) continue;
    const pathname = decodeURIComponent(url.pathname);
    const lastSegment = pathname.split('/').filter(Boolean).at(-1) || '';
    const relativeTarget = pathname.replace(/^\/+/, '');
    const target = pathname.endsWith('/') || !lastSegment.includes('.')
      ? join(root, relativeTarget, 'index.html')
      : join(root, relativeTarget);
    if (!(await exists(target))) {
      errors.push(`${file}: broken internal reference "${reference}"`);
      continue;
    }
    if (url.hash && url.hash !== '#' && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      if (!targetHtml.includes(`id="${id}"`) && !targetHtml.includes(`name="${id}"`)) {
        errors.push(`${file}: missing fragment target "${reference}"`);
      }
    }
  }
}

const expectedSitemapUrls = [
  `${site.baseUrl}/`,
  ...servicePages.map((page) => `${site.baseUrl}/${page.slug}/`),
  `${site.baseUrl}/privacy/`,
  `${site.baseUrl}/consent/`,
];
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (JSON.stringify(sitemapUrls) !== JSON.stringify(expectedSitemapUrls)) {
  errors.push('sitemap.xml: URLs do not match the real indexable pages');
}
const sitemapLastModified = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
if (sitemapLastModified.length !== expectedSitemapUrls.length || sitemapLastModified.some((value) => value !== site.lastModified)) {
  errors.push(`sitemap.xml: every lastmod must be ${site.lastModified}`);
}
if (sitemap.includes(legacyHostSuffix)) errors.push('sitemap.xml: legacy GitHub Pages URL found');

const robots = await readFile(join(root, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${site.baseUrl}/sitemap.xml`)) errors.push('robots.txt: production sitemap URL missing');
if (robots.includes(legacyHostSuffix)) errors.push('robots.txt: legacy GitHub Pages URL found');

const cname = (await readFile(join(root, 'CNAME'), 'utf8')).trim();
if (cname !== new URL(site.baseUrl).hostname) errors.push('CNAME: domain does not match SITE_URL');

for (const file of ['src/data.mjs', 'src/templates.mjs', 'scripts/build.mjs']) {
  const source = await readFile(join(root, file), 'utf8');
  if (source.includes(legacyProductionUrl) || source.includes(legacyHostSuffix)) {
    errors.push(`${file}: legacy GitHub Pages URL found in generator source`);
  }
}

const templatesSource = await readFile(join(root, 'src', 'templates.mjs'), 'utf8');
if (!templatesSource.includes('<p class="hero__badge">ФЕДЕРАЛЬНЫЙ СЕРВИС</p>')) errors.push('src/templates.mjs: simplified federal service badge missing');
if (/services\.map\(\(service, index\)/.test(templatesSource)) errors.push('src/templates.mjs: numbered service cards returned');
const styleSource = await readFile(join(root, 'style.css'), 'utf8');
if (!styleSource.includes('font-size: clamp(30px, 3.4vw, 46px); line-height: 1.06;')) errors.push('style.css: approved compact hero heading size missing');


const distClient = join(root, 'dist', 'client');
if (await exists(distClient)) {
  for (const file of [...htmlFiles, 'sitemap.xml', 'robots.txt']) {
    const built = await readFile(join(distClient, file), 'utf8');
    if (built.includes(legacyProductionUrl) || built.includes(legacyHostSuffix)) {
      errors.push(`dist/client/${file}: legacy GitHub Pages URL found after build`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files.`);
