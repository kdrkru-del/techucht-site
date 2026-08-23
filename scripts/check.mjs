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
];

const errors = [];
for (const file of htmlFiles) {
  const html = await readFile(join(root, file), 'utf8');
  if (!html.includes('<link rel="canonical"')) errors.push(`${file}: missing canonical`);
  if (!html.includes('https://tehuchet24.ru')) errors.push(`${file}: custom production domain missing`);
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
if (!main.includes('href="vosstanovlenie-sts/"')) errors.push('index.html: restore STS service page link missing');

const js = await readFile(join(root, 'site-config.js'), 'utf8');
if (!js.includes('"YANDEX_METRIKA_ID": "111852031"')) errors.push('site-config.js: Yandex Metrika ID 111852031 missing');
if (!js.includes('"TELEGRAM_URL": "https://t.me/Romatran"')) errors.push('site-config.js: TELEGRAM_URL missing');
if (!js.includes('"MAX_URL": "https://max.ru/u/f9LHodD0cOIyRnk4XSMp9LQv3nUe6pWwsL4DqMp_p80p0ISba6wNwFpIQy4"')) errors.push('site-config.js: personal MAX profile URL missing');
if (!js.includes('zelsrez-leads.roman-k-0b3.workers.dev/api/lead')) errors.push('site-config.js: Telegram lead endpoint missing');

const mainMaxLinks = (main.match(/class="[^"]*track-max/g) || []).length;
if (mainMaxLinks < 6) errors.push(`index.html: expected MAX in all contact areas, found ${mainMaxLinks}`);
if (/href="[^"]*max\.ru/i.test(main)) errors.push('index.html: MAX URL must come from site-config.js');
const mainMaxTags = main.match(/<a class="[^"]*track-max[^"]*"[^>]*>[\s\S]*?<\/a>/g) || [];
if (mainMaxTags.some((tag) => /925[\s-]*757|79257577888/.test(tag))) errors.push('index.html: phone must not be displayed inside MAX buttons');
if (!main.includes('href="logo.png"')) errors.push('index.html: favicon missing');

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
  "trackGoal('lead_form_start')",
  "trackGoal('lead_form_open')",
  "trackGoal('lead_form_error')",
  "trackGoal('click_phone')",
  "trackGoal('click_whatsapp')",
  "trackGoal('click_telegram')",
  "trackGoal('click_email')",
  "webvisor: true",
  "trackLinks: true",
  "accurateTrackBounce: true",
  "'getClientID'",
  'window.setInterval(attempt, 200)',
  "field.classList.add('ym-disable-keys')",
  'page_url: window.location.href',
  'page_title: document.title',
  'form_name: form.dataset.formName',
  'client_id: clientId',
  'yclid: attribution.yclid',
]) {
  if (!clientScript.includes(invariant)) errors.push(`script.js: form submission invariant missing "${invariant}"`);
}
if (clientScript.includes('webvisor: false')) errors.push('script.js: Webvisor must be enabled');
if (/trackGoal\(['"](?:qualified_lead|sale)['"]\)/.test(clientScript)) errors.push('script.js: offline goals must not fire on the website');

for (const file of htmlFiles.filter((file) => !file.startsWith('404'))) {
  const html = await readFile(join(root, file), 'utf8');
  const leadForms = html.match(/<form\b[^>]*data-lead-form[\s\S]*?<\/form>/g) || [];
  if (!leadForms.length) errors.push(`${file}: lead forms missing`);
  leadForms.forEach((form, index) => {
    if (!/name="name"[^>]*type="text"/.test(form)) errors.push(`${file}: form ${index + 1} missing name field`);
    if (!/name="phone"[^>]*type="tel"/.test(form)) errors.push(`${file}: form ${index + 1} missing phone field`);
    if (!/class="[^"]*ym-disable-keys[^"]*"[^>]*name="name"/.test(form)) errors.push(`${file}: form ${index + 1} name field is not protected from Webvisor`);
    if (!/class="[^"]*ym-disable-keys[^"]*"[^>]*name="phone"/.test(form)) errors.push(`${file}: form ${index + 1} phone field is not protected from Webvisor`);
    if (/<select\b|<textarea\b|type="radio"|name="(?:region|service|tech|owner|comment)"/.test(form)) {
      errors.push(`${file}: form ${index + 1} contains fields other than name and phone`);
    }
  });
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files.`);
