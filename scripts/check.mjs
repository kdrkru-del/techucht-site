import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { servicePages } from '../src/data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = [
  'index.html',
  'spb/index.html',
  ...servicePages.map((page) => `${page.slug}/index.html`),
  'privacy/index.html',
  'consent/index.html',
  '404.html',
  '404/index.html',
];

const requiredMain = [
  '<title>Регистрация самоходной техники в Гостехнадзоре — Москва и МО | ТехУчёт</title>',
  'content="Постановка, перерегистрация и снятие самоходной техники с учёта в Гостехнадзоре. Тракторы, погрузчики, экскаваторы и другая техника."',
  'Регистрация самоходной техники в Гостехнадзоре в Москве и Московской области',
  'от 5 000 ₽',
  'Поможем подготовить документы и сопроводим постановку на учёт, снятие с учёта, восстановление документов и другие регистрационные действия с самоходной техникой.',
  'data-counter="85">85',
  'data-counter="3200">3 200',
  'data-counter="7">7',
  'ООО «ЮНАТ»',
  'ОГРН 1242500018859',
  'jobstat@bk.ru',
  'Постановка техники на учёт в Гостехнадзоре',
  'Снятие техники с учёта в Гостехнадзоре',
  'Перерегистрация техники в Гостехнадзоре',
  'Техосмотр самоходной техники в Гостехнадзоре',
  'Нужна регистрация техники в Гостехнадзоре?',
  'Оставьте номер телефона — проверим документы и подскажем порядок оформления.',
];

const forbidden = [
  'ФЕДЕРАЛЬНЫЙ СЕРВИС',
  'КОММЕРЧЕСКИЙ СЕРВИС СОПРОВОЖДЕНИЯ',
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
  if ((html.match(/rel="icon"[^>]*favicon\.png\?v=3/g) || []).length !== 1) errors.push(`${file}: favicon link missing`);
  if ((html.match(/rel="shortcut icon"[^>]*favicon\.png\?v=3/g) || []).length !== 1) errors.push(`${file}: shortcut favicon link missing`);
  if ((html.match(/rel="apple-touch-icon"[^>]*favicon\.png\?v=3/g) || []).length !== 1) errors.push(`${file}: apple touch icon link missing`);
  if (/rel="(?:shortcut )?icon"[^>]*logo\.png/.test(html)) errors.push(`${file}: rectangular logo used as favicon`);
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
for (const value of ['id="service-restore_psm"', 'Восстановление ПСМ и СТС', 'href="vosstanovlenie-psm/"']) {
  if (!main.includes(value)) errors.push(`index.html: combined document recovery service missing "${value}"`);
}
for (const value of ['id="service-restore_sts"', 'id="service-documents"', 'id="service-plates"', 'Получение или замена регистрационных документов', 'Получение или замена номерных знаков']) {
  if (main.includes(value)) errors.push(`index.html: removed service card returned "${value}"`);
}
const serviceCardCount = (main.match(/<article class="service-card"/g) || []).length;
if (serviceCardCount !== 6) errors.push(`index.html: expected 6 service cards, found ${serviceCardCount}`);
for (const value of ['class="card-index"', 'service-card--featured', '<strong>Восстановление документов</strong>']) {
  if (main.includes(value)) errors.push(`index.html: removed service-card decoration returned "${value}"`);
}

const advertisingLandings = [
  'registraciya/index.html',
  'snyatie-s-ucheta/index.html',
  'tehosmotr/index.html',
];
for (const file of advertisingLandings) {
  const html = await readFile(join(root, file), 'utf8');
  for (const id of ['price', 'documents', 'how', 'page-form']) {
    if (!html.includes(`id="${id}"`)) errors.push(`${file}: advertising anchor #${id} missing`);
  }
}

const registrationPage = await readFile(join(root, 'registraciya/index.html'), 'utf8');
for (const value of [
  'id="pereregistraciya"',
  'Перерегистрация и смена собственника самоходной техники в Гостехнадзоре',
  'Регистрация трактора',
  'Регистрация погрузчика',
  'Регистрация вилочного погрузчика',
  'Регистрация экскаватора',
  'Регистрация экскаватора-погрузчика',
  'Регистрация самоходной машины',
  'Постановка другой спецтехники на учёт в Гостехнадзоре',
  'Проверить документы для переоформления',
]) {
  if (!registrationPage.includes(value)) errors.push(`registraciya/index.html: required advertising content missing "${value}"`);
}

const inspectionPage = await readFile(join(root, 'tehosmotr/index.html'), 'utf8');
for (const value of [
  'id="akt-osmotra"',
  'Акт осмотра самоходной техники',
  'Что проверяем до осмотра',
  'Получить консультацию по акту осмотра',
]) {
  if (!inspectionPage.includes(value)) errors.push(`tehosmotr/index.html: required advertising content missing "${value}"`);
}

const spbPage = await readFile(join(root, 'spb/index.html'), 'utf8');
for (const value of [
  '<title>Регистрация техники в Гостехнадзоре — Санкт-Петербург и ЛО | ТехУчёт</title>',
  'content="Регистрация, перерегистрация и снятие самоходной техники с учёта в Гостехнадзоре. Санкт-Петербург и Ленинградская область."',
  '<link rel="canonical" href="https://tehuchet24.ru/spb/">',
  'Регистрация самоходной техники в Гостехнадзоре в Санкт-Петербурге и Ленинградской области',
  'Работаем по Санкт-Петербургу и Ленинградской области',
  'Поможем поставить самоходную технику на учёт в Гостехнадзоре, снять её с учёта, переоформить при смене собственника и проверить документы.',
  'Регистрация техники в Санкт-Петербурге и Ленинградской области',
  'Гостехнадзоре Санкт-Петербурга и Ленинградской области',
  'Рассчитать стоимость',
  'Получить консультацию',
  'data-form-name="СПб — форма первого экрана"',
  'data-form-name="СПб — повторная форма"',
  'Постановка техники на учёт в Гостехнадзоре',
  'Перерегистрация техники в Гостехнадзоре',
  'Снятие техники с учёта в Гостехнадзоре',
  'Техосмотр самоходной техники в Гостехнадзоре',
  'Регистрируем в Гостехнадзоре тракторы, погрузчики, экскаваторы, квадроциклы и другую самоходную технику.',
  'Нужна регистрация техники в Гостехнадзоре?',
  'Оставьте номер телефона — проверим документы и подскажем порядок оформления.',
  'href="tel:+79995522001"',
  '"@type":"FAQPage"',
  '"name":"Санкт-Петербург"',
  '"name":"Ленинградская область"',
]) {
  if (!spbPage.includes(value)) errors.push(`spb/index.html: required landing content missing "${value}"`);
}

const requiredGostekhnadzorFaq = [
  'Как поставить самоходную технику на учёт в Гостехнадзоре?',
  'Какие документы нужны для регистрации техники в Гостехнадзоре?',
  'Какая техника регистрируется в Гостехнадзоре?',
  'Как снять самоходную технику с учёта в Гостехнадзоре?',
  'Как проходит перерегистрация техники в Гостехнадзоре?',
];
for (const file of ['index.html', 'spb/index.html']) {
  const html = file === 'index.html' ? main : spbPage;
  for (const question of requiredGostekhnadzorFaq) {
    if (!html.includes(question)) errors.push(`${file}: Gostekhnadzor FAQ missing "${question}"`);
  }
}

for (const page of servicePages) {
  const file = `${page.slug}/index.html`;
  const html = await readFile(join(root, file), 'utf8');
  const heroMatch = html.match(/<section class="service-hero">[\s\S]*?<\/section>/);
  if (!heroMatch || !heroMatch[0].includes('Гостехнадзор')) errors.push(`${file}: first screen must mention Gostekhnadzor`);
  if (!html.includes('Нужна регистрация техники в Гостехнадзоре?')) errors.push(`${file}: pre-form Gostekhnadzor heading missing`);
  if (!html.includes('Оставьте номер телефона — проверим документы и подскажем порядок оформления.')) errors.push(`${file}: pre-form explanation missing`);
  if (!html.includes(`data-form-name="Получить консультацию: ${page.short}"`)) errors.push(`${file}: lead form analytics name changed`);
  for (const question of ['Сколько стоит услуга?', 'Какой ориентировочный срок?', 'Как проходит работа с Гостехнадзором по этой услуге?']) {
    if (!html.includes(question)) errors.push(`${file}: service FAQ missing "${question}"`);
  }
}
if ((spbPage.match(/data-spb-service-card/g) || []).length !== 7) errors.push('spb/index.html: expected 7 regional service cards');
if ((spbPage.match(/<form\b[^>]*data-lead-form/g) || []).length !== 3) errors.push('spb/index.html: expected hero, final and callback forms');
if (/Москв/.test(spbPage)) errors.push('spb/index.html: Moscow text leaked into regional landing');
if (!spbPage.includes('../site-config.js?v=11') || !spbPage.includes('../script.js?v=11')) errors.push('spb/index.html: shared scripts missing');

for (const id of ['services', 'vehicles', 'process', 'cases', 'faq', 'form', 'registration', 'reregistration', 'deregistration', 'inspection']) {
  const matches = spbPage.match(new RegExp(`id="${id}"`, 'g')) || [];
  if (matches.length !== 1) errors.push(`spb/index.html: expected one #${id} anchor, found ${matches.length}`);
}
for (const href of ['#registration', '#reregistration', '#deregistration', '#inspection', '#vehicles', '#cases']) {
  if (!spbPage.includes(`href="${href}"`)) errors.push(`spb/index.html: regional footer link ${href} missing`);
}
for (const href of ['../registraciya/', '../snyatie-s-ucheta/', '../vosstanovlenie-psm/', '../vosstanovlenie-sts/', '../tehosmotr/', '../slozhnye-sluchai/']) {
  if (spbPage.includes(`href="${href}"`)) errors.push(`spb/index.html: Moscow service link ${href} must not be present`);
}
if ((spbPage.match(/href="#form"/g) || []).length !== 9) errors.push('spb/index.html: expected all 7 card CTAs plus 2 supporting CTAs to lead to #form');
if (!spbPage.includes('href="./#cases"')) errors.push('spb/index.html: regional navigation must lead to #cases');
if (spbPage.includes('href="./#situations"')) errors.push('spb/index.html: obsolete #situations navigation remains');

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('<loc>https://tehuchet24.ru/spb/</loc>')) errors.push('sitemap.xml: /spb/ URL missing');

const js = await readFile(join(root, 'site-config.js'), 'utf8');
if (!js.includes('"YANDEX_METRIKA_ID": "111852031"')) errors.push('site-config.js: Yandex Metrika ID 111852031 missing');
if (!js.includes('"TELEGRAM_URL": "https://t.me/Romatran"')) errors.push('site-config.js: TELEGRAM_URL missing');
if (!js.includes('"MAX_URL": "https://max.ru/u/f9LHodD0cOIyRnk4XSMp9LQv3nUe6pWwsL4DqMp_p80p0ISba6wNwFpIQy4"')) errors.push('site-config.js: personal MAX profile URL missing');
if (!js.includes('zelsrez-leads.roman-k-0b3.workers.dev/api/lead')) errors.push('site-config.js: Telegram lead endpoint missing');

const mainMaxLinks = (main.match(/class="[^"]*track-max/g) || []).length;
if (mainMaxLinks < 6) errors.push(`index.html: expected MAX in all contact areas, found ${mainMaxLinks}`);
if (/href="[^"]*max\.ru/i.test(main)) errors.push('index.html: MAX URL must come from site-config.js');
const mainMaxTags = main.match(/<a class="[^"]*track-max[^"]*"[^>]*>[\s\S]*?<\/a>/g) || [];
if (mainMaxTags.some((tag) => /999[\s-]*552|79995522001/.test(tag))) errors.push('index.html: phone must not be displayed inside MAX buttons');
if (!main.includes('href="favicon.png?v=3"')) errors.push('index.html: favicon missing');

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
