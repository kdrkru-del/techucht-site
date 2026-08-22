import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { servicePages } from '../src/data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = [
  'index.html',
  ...servicePages.map((page) => `${page.slug}/index.html`),
  'privacy/index.html',
  'consent/index.html',
  '404.html',
  '404/index.html',
];

const requiredMain = [
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
];

const errors = [];
for (const file of htmlFiles) {
  const html = await readFile(join(root, file), 'utf8');
  if (!html.includes('<link rel="canonical"')) errors.push(`${file}: missing canonical`);
  if (!html.includes('name="consent"') && !file.startsWith('404')) errors.push(`${file}: missing consent field`);
  if (html.includes('name="keywords"')) errors.push(`${file}: meta keywords found`);
  for (const value of forbidden) {
    if (html.includes(value)) errors.push(`${file}: forbidden text "${value}"`);
  }
}

const main = await readFile(join(root, 'index.html'), 'utf8');
for (const value of requiredMain) {
  if (!main.includes(value)) errors.push(`index.html: required text missing "${value}"`);
}

const js = await readFile(join(root, 'site-config.js'), 'utf8');
if (!js.includes('"YANDEX_METRIKA_ID": ""')) errors.push('site-config.js: empty YANDEX_METRIKA_ID placeholder missing');
if (!js.includes('"TELEGRAM_URL": "https://t.me/Romatran"')) errors.push('site-config.js: TELEGRAM_URL missing');
if (!js.includes('"MAX_URL": ""')) errors.push('site-config.js: empty MAX_URL placeholder missing');
if (!js.includes('formsubmit.co/ajax/jobstat@bk.ru')) errors.push('site-config.js: approved form endpoint missing');

const mainMaxLinks = (main.match(/class="[^"]*track-max/g) || []).length;
if (mainMaxLinks < 6) errors.push(`index.html: expected MAX in all contact areas, found ${mainMaxLinks}`);
if (/href="[^"]*max\.ru/i.test(main)) errors.push('index.html: MAX URL must come from site-config.js');

const clientScript = await readFile(join(root, 'script.js'), 'utf8');
if (!clientScript.includes("trackGoal('click_max')")) errors.push('script.js: click_max goal missing');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files.`);
