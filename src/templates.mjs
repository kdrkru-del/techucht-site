import {
  site,
  services,
  serviceOptions,
  problems,
  processSteps,
  cases,
  faq,
} from './data.mjs';

const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

function head({ title, description, canonical, prefix = '', schemas = [] }) {
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0a101b">
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${site.brand}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site.baseUrl}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${site.baseUrl}/og.png">
  <title>${title}</title>
  <link rel="icon" type="image/png" href="${prefix}favicon.png?v=3">
  <link rel="shortcut icon" type="image/png" href="${prefix}favicon.png?v=3">
  <link rel="apple-touch-icon" href="${prefix}favicon.png?v=3">
  <link rel="preload" href="${prefix}style.css?v=11" as="style">
  <link rel="stylesheet" href="${prefix}style.css?v=11">
  <script src="${prefix}site-config.js?v=11"></script>
  <script src="${prefix}script.js?v=11" defer></script>
  ${schemas.map((schema) => `<script type="application/ld+json">${jsonLd(schema)}</script>`).join('\n  ')}`;
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.company,
    alternateName: site.brand,
    url: `${site.baseUrl}/`,
    logo: `${site.baseUrl}/logo.png`,
    telephone: site.phone,
    email: site.email,
    identifier: [
      { '@type': 'PropertyValue', name: 'ИНН', value: site.inn },
      { '@type': 'PropertyValue', name: 'КПП', value: site.kpp },
      { '@type': 'PropertyValue', name: 'ОГРН', value: site.ogrn },
    ],
    areaServed: { '@type': 'Country', name: 'Россия' },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone,
      email: site.email,
      contactType: 'customer service',
      areaServed: 'RU',
      availableLanguage: 'Russian',
    },
  };
}

function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

function serviceSchema({ name, description, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: { '@type': 'Organization', name: site.company, url: `${site.baseUrl}/` },
    areaServed: { '@type': 'Country', name: 'Россия' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: '5000',
      description: 'Стоимость от 5 000 ₽. Точная стоимость определяется после проверки документов.',
    },
  };
}

function maxContactContent() {
  return 'MAX';
}

function quickContacts({ modifier = '', includePhone = true } = {}) {
  const className = ['quick-contacts', modifier].filter(Boolean).join(' ');
  const phoneLink = includePhone ? `<a class="quick-contact quick-contact--phone track-phone" href="${site.phoneHref}">Позвонить</a>` : '';
  return `<div class="${className}" aria-label="Быстрые контакты">${phoneLink}
    <a class="quick-contact quick-contact--whatsapp track-whatsapp" href="${site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
    <a class="quick-contact quick-contact--telegram track-telegram" href="${site.telegram}" target="_blank" rel="noopener">Telegram</a>
    <a class="quick-contact quick-contact--max track-max is-disabled" aria-label="MAX" aria-disabled="true" title="Ссылка на MAX будет добавлена после её получения">${maxContactContent()}</a>
  </div>`;
}

function header(prefix = '') {
  const home = prefix || './';
  return `<header class="header" id="header">
    <div class="container header__inner">
      <a class="logo" href="${home}" aria-label="ТехУчёт — главная">
        <img class="logo__img" src="${prefix}logo.png" width="1024" height="682" alt="ТехУчёт — Гостехнадзор">
      </a>
      <nav class="nav" aria-label="Основная навигация">
        <a href="${home}#services">Услуги</a>
        <a href="${home}#situations">Сложные ситуации</a>
        <a href="${home}#process">Как работаем</a>
        <a href="${home}#faq">Вопросы</a>
      </nav>
      <div class="header__actions">
        <a class="header__phone track-phone" href="${site.phoneHref}">${site.phone}</a>
        ${quickContacts({ modifier: 'quick-contacts--header', includePhone: false })}
        <button class="btn btn--small btn--outline" type="button" data-modal-open>Перезвоните мне</button>
      </div>
      <button class="menu-button" type="button" aria-label="Открыть меню" aria-controls="mobile-menu" aria-expanded="false" data-menu-button>
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobile-menu" hidden data-mobile-menu>
      <div class="container">
        <nav aria-label="Мобильная навигация">
          <a href="${home}#services">Услуги</a>
          <a href="${home}#situations">Сложные ситуации</a>
          <a href="${home}#process">Как работаем</a>
          <a href="${home}#faq">Вопросы</a>
        </nav>
        ${quickContacts({ modifier: 'quick-contacts--menu' })}
      </div>
    </div>
  </header>`;
}

function consentField(id, prefix = '') {
  return `<label class="consent" for="${id}">
    <input id="${id}" name="consent" type="checkbox" required>
    <span>Я соглашаюсь на <a href="${prefix}consent/" target="_blank">обработку персональных данных</a> и принимаю <a href="${prefix}privacy/" target="_blank">Политику конфиденциальности</a>.</span>
  </label>`;
}

function honeypot() {
  return `<div class="honeypot" aria-hidden="true">
    <label>Оставьте поле пустым <input class="ym-disable-keys" type="text" name="_honey" tabindex="-1" autocomplete="off"></label>
  </div>`;
}

function serviceSelect(id, selected = '') {
  return `<label class="field" for="${id}">
    <span>Услуга *</span>
    <select id="${id}" name="service" required>
      <option value="">Выберите услугу</option>
      ${serviceOptions.map((option) => `<option value="${option}"${option === selected ? ' selected' : ''}>${option}</option>`).join('')}
    </select>
  </label>`;
}

function regionSelect(id) {
  return `<label class="field" for="${id}">
    <span>Регион *</span>
    <select id="${id}" name="region" required data-region-select>
      <option value="">Выберите регион</option>
    </select>
  </label>`;
}

function formStatus() {
  return '<p class="form-status" role="status" aria-live="polite" data-form-status></p>';
}

function simpleContactFields(id) {
  return `<div class="form-grid">
    <label class="field" for="${id}-name"><span>Имя *</span><input class="ym-disable-keys" id="${id}-name" name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться" required></label>
    <label class="field" for="${id}-phone"><span>Телефон *</span><input class="ym-disable-keys" id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
  </div>`;
}

function simpleHeroForm() {
  return `<form class="form-card hero-form" id="hero-lead" data-lead-form data-form-name="Форма первого экрана" novalidate>
    ${honeypot()}
    <div class="form-card__header">
      <p class="eyebrow">Заявка</p>
      <h2>Оставьте имя и телефон</h2>
      <p>Специалист перезвонит и уточнит детали.</p>
    </div>
    ${simpleContactFields('hero')}
    ${consentField('hero-consent')}
    <button class="btn btn--primary btn--full" type="submit">Отправить заявку</button>
    ${formStatus()}
  </form>`;
}

function simpleFinalForm({ id = 'main-lead', prefix = '', title = 'Получите консультацию по оформлению техники' } = {}) {
  return `<form class="form-card lead-form" id="${id}" data-lead-form data-form-name="${title}" novalidate>
    ${honeypot()}
    <div class="form-card__header"><p class="eyebrow">Заявка</p><h2>${title}</h2><p>Оставьте имя и телефон — специалист перезвонит и уточнит детали.</p></div>
    ${simpleContactFields(id)}
    ${consentField(`${id}-consent`, prefix)}
    <button class="btn btn--primary btn--full" type="submit">Отправить заявку</button>
    ${formStatus()}
  </form>`;
}

function simpleCallbackModal(prefix = '') {
  return `<div class="modal" id="callback-modal" hidden data-modal>
    <div class="modal__backdrop" data-modal-close></div>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="callback-title">
      <button class="icon-button modal__close" type="button" aria-label="Закрыть окно" data-modal-close>×</button>
      <h2 id="callback-title">Заказать обратный звонок</h2>
      <p>Оставьте имя и телефон — специалист свяжется с вами в рабочее время.</p>
      <form data-lead-form data-form-name="Обратный звонок" novalidate>
        ${honeypot()}
        ${simpleContactFields('callback')}
        ${consentField('callback-consent', prefix)}
        <button class="btn btn--primary btn--full" type="submit">Заказать звонок</button>
        ${formStatus()}
      </form>
    </div>
  </div>`;
}

function heroForm() {
  const heroOptions = [
    'Постановка на учёт',
    'Снятие с учёта',
    'Восстановление ПСМ',
    'Восстановление СТС',
    'Технический осмотр',
    'Внесение изменений',
    'Отказ или сложная ситуация',
    'Другое',
  ];
  return `<form class="form-card hero-form" id="hero-lead" data-lead-form data-form-name="Форма первого экрана" novalidate>
    ${honeypot()}
    <div class="form-card__header">
      <p class="eyebrow">Расчёт стоимости</p>
      <h2>Уточните задачу</h2>
      <span data-step-label>Шаг 1 из 2</span>
    </div>
    <fieldset class="form-step" data-hero-step="1">
      <legend>Какая услуга требуется?</legend>
      <div class="choice-grid">
        ${heroOptions.map((option) => `<label class="choice"><input type="radio" name="service" value="${option}" required><span>${option}</span></label>`).join('')}
      </div>
      <label class="field" for="hero-phone"><span>Телефон *</span><input id="hero-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
      <button class="btn btn--primary btn--full" type="button" data-hero-next>Получить расчёт стоимости</button>
      <p class="field-error" data-step-error role="alert"></p>
    </fieldset>
    <fieldset class="form-step" data-hero-step="2" hidden>
      <legend>Осталось немного</legend>
      ${regionSelect('hero-region')}
      <label class="field" for="hero-tech"><span>Вид техники</span><input id="hero-tech" name="tech" type="text" placeholder="Например, трактор МТЗ-82"></label>
      <label class="field" for="hero-owner"><span>Тип собственника</span><select id="hero-owner" name="owner"><option value="">Выберите вариант</option><option>Физическое лицо</option><option>ИП</option><option>Организация</option></select></label>
      <label class="field" for="hero-comment"><span>Комментарий</span><textarea id="hero-comment" name="comment" rows="3" placeholder="Коротко опишите задачу (необязательно)"></textarea></label>
      ${consentField('hero-consent')}
      <div class="form-actions"><button class="btn btn--text" type="button" data-hero-back>Назад</button><button class="btn btn--primary" type="submit">Отправить заявку</button></div>
      ${formStatus()}
    </fieldset>
  </form>`;
}

function finalForm({ id = 'main-lead', selected = '', prefix = '', title = 'Получите консультацию по оформлению техники' } = {}) {
  return `<form class="form-card lead-form" id="${id}" data-lead-form data-form-name="${title}" novalidate>
    ${honeypot()}
    <div class="form-card__header"><p class="eyebrow">Заявка</p><h2>${title}</h2><p>Специалист уточнит задачу, проверит документы и назовёт стоимость работ.</p></div>
    <div class="form-grid">
      <label class="field" for="${id}-name"><span>Имя</span><input id="${id}-name" name="name" type="text" autocomplete="name" placeholder="Необязательно"></label>
      <label class="field" for="${id}-phone"><span>Телефон *</span><input id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
      ${regionSelect(`${id}-region`)}
      ${serviceSelect(`${id}-service`, selected)}
    </div>
    <label class="field" for="${id}-comment"><span>Комментарий</span><textarea id="${id}-comment" name="comment" rows="4" placeholder="Опишите задачу (необязательно)"></textarea></label>
    ${consentField(`${id}-consent`, prefix)}
    <button class="btn btn--primary btn--full" type="submit">Отправить заявку</button>
    ${formStatus()}
  </form>`;
}

function callbackModal(prefix = '') {
  return `<div class="modal" id="callback-modal" hidden data-modal>
    <div class="modal__backdrop" data-modal-close></div>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="callback-title">
      <button class="icon-button modal__close" type="button" aria-label="Закрыть окно" data-modal-close>×</button>
      <h2 id="callback-title">Заказать обратный звонок</h2>
      <p>Оставьте номер и регион — специалист свяжется с вами в рабочее время.</p>
      <form data-lead-form data-form-name="Обратный звонок" novalidate>
        ${honeypot()}
        <input type="hidden" name="service" value="Обратный звонок">
        <label class="field"><span>Имя</span><input name="name" type="text" autocomplete="name" placeholder="Необязательно"></label>
        <label class="field"><span>Телефон *</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
        ${regionSelect('callback-region')}
        ${consentField('callback-consent', prefix)}
        <button class="btn btn--primary btn--full" type="submit">Заказать звонок</button>
        ${formStatus()}
      </form>
    </div>
  </div>`;
}

function mobileBar(href = '#lead-form') {
  return `<div class="mobile-bar" aria-label="Быстрые действия">
    <a class="quick-contact quick-contact--phone track-phone" href="${site.phoneHref}">Позвонить</a>
    <a class="quick-contact quick-contact--whatsapp track-whatsapp" href="${site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
    <a class="quick-contact quick-contact--telegram track-telegram" href="${site.telegram}" target="_blank" rel="noopener">Telegram</a>
    <a class="quick-contact quick-contact--max track-max is-disabled" aria-label="MAX" aria-disabled="true" title="Ссылка на MAX будет добавлена после её получения">${maxContactContent()}</a>
  </div>`;
}

function footer(prefix = '') {
  const home = prefix || './';
  return `<footer class="footer" id="contacts">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a class="logo" href="${home}"><img class="logo__img" src="${prefix}logo.png" width="1024" height="682" alt="ТехУчёт — Гостехнадзор"></a>
        <p>Компания по сопровождению регистрационных действий с самоходной техникой по всей России.</p>
      </div>
      <div><h2>Услуги</h2><a href="${prefix}registraciya/">Постановка на учёт</a><a href="${prefix}snyatie-s-ucheta/">Снятие с учёта</a><a href="${prefix}vosstanovlenie-psm/">Восстановление ПСМ</a><a href="${prefix}vosstanovlenie-sts/">Восстановление СТС</a><a href="${prefix}tehosmotr/">Техосмотр</a><a href="${prefix}slozhnye-sluchai/">Сложные случаи</a></div>
      <div><h2>Контакты</h2><a class="track-phone" href="${site.phoneHref}">${site.phone}</a><a class="track-whatsapp" href="${site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a class="track-telegram" href="${site.telegram}" target="_blank" rel="noopener">Telegram</a><a class="footer-max track-max is-disabled" aria-label="MAX" aria-disabled="true" title="Ссылка на MAX будет добавлена после её получения">${maxContactContent()}</a><a class="track-email" href="${site.emailHref}">${site.email}</a><span>${site.hours}</span></div>
      <div><h2>Реквизиты</h2><span>${site.company}</span><span>ИНН ${site.inn}</span><span>КПП ${site.kpp}</span><span>ОГРН ${site.ogrn}</span></div>
    </div>
    <div class="container footer__bottom">
      <span>© <span data-current-year>${new Date().getFullYear()}</span> ${site.brand}</span>
      <a href="${prefix}privacy/">Политика конфиденциальности</a>
      <a href="${prefix}consent/">Согласие на обработку данных</a>
    </div>
  </footer>`;
}

function faqBlock(items = faq) {
  return `<div class="faq-list">${items.map(([question, answer], index) => `<article class="faq-item"><h3><button type="button" aria-expanded="${index === 0 ? 'true' : 'false'}" data-faq-button><span>${question}</span><span class="faq-icon" aria-hidden="true">+</span></button></h3><div class="faq-answer"${index === 0 ? '' : ' hidden'}><p>${answer}</p></div></article>`).join('')}</div>`;
}

function contactPanel() {
  return `<aside class="contact-panel">
    <p class="eyebrow">Связаться напрямую</p>
    <a class="contact-panel__primary track-phone" href="${site.phoneHref}">${site.phone}</a>
    ${quickContacts({ modifier: 'quick-contacts--contact', includePhone: false })}
    <a class="contact-panel__email track-email" href="${site.emailHref}">${site.email}</a>
    <dl><div><dt>Режим работы</dt><dd>${site.hours}</dd></div><div><dt>Стоимость услуг</dt><dd>от 5 000 ₽</dd></div><div><dt>Ориентировочный срок</dt><dd>3–5 рабочих дней</dd></div><div><dt>География</dt><dd>Вся Россия</dd></div></dl>
  </aside>`;
}

function serviceExtraSection(page) {
  if (page.key === 'registration') {
    return `<section class="section section--alt service-detail" id="pereregistraciya">
      <div class="container">
        <div class="section-heading section-heading--left">
          <p class="eyebrow">Переоформление техники</p>
          <h2>Перерегистрация и смена собственника самоходной техники</h2>
          <p>Помогаем подготовить документы для переоформления самоходной техники при смене собственника, продаже, передаче по договору или изменении регистрационных данных. До начала работ проверяем документы на технику, основание перехода права и сведения о новом собственнике.</p>
        </div>
        <div class="service-detail__grid">
          <div class="service-detail__panel">
            <h3>С какой техникой работаем</h3>
            <ul class="check-list">
              <li>Регистрация трактора</li>
              <li>Регистрация погрузчика</li>
              <li>Регистрация вилочного погрузчика</li>
              <li>Регистрация экскаватора</li>
              <li>Регистрация экскаватора-погрузчика</li>
              <li>Регистрация самоходной машины</li>
              <li>Постановка другой спецтехники на учёт в Гостехнадзоре</li>
            </ul>
          </div>
          <div class="service-detail__panel">
            <h3>Что входит в сопровождение</h3>
            <ul class="check-list">
              <li>Предварительная проверка документов</li>
              <li>Проверка основания смены собственника</li>
              <li>Подготовка заявления и комплекта документов</li>
              <li>Сопровождение регистрационных действий</li>
              <li>Информирование о недостающих документах и возможных препятствиях</li>
            </ul>
          </div>
        </div>
        <div class="service-detail__actions">
          <a class="btn btn--primary" href="#page-form" data-select-service="Внесение изменений" data-service-event="changes">Проверить документы для переоформления</a>
          <p>Возможность переоформления, итоговый порядок и срок зависят от документов, истории владения и требований соответствующего подразделения Гостехнадзора.</p>
        </div>
      </div>
    </section>`;
  }

  if (page.key === 'inspection') {
    return `<section class="section section--alt service-detail" id="akt-osmotra">
      <div class="container">
        <div class="section-heading section-heading--left">
          <p class="eyebrow">Осмотр техники</p>
          <h2>Акт осмотра самоходной техники</h2>
          <p>Помогаем подготовить документы и организовать сопровождение осмотра самоходной техники, когда для регистрационных действий требуется акт осмотра. Предварительно проверяем сведения о собственнике, документы на технику и идентификационные данные.</p>
        </div>
        <div class="service-detail__panel service-detail__panel--wide">
          <h3>Что проверяем до осмотра</h3>
          <ul class="check-list service-detail__list--columns">
            <li>Паспорт самоходной машины или сведения об ЭПСМ</li>
            <li>Документы о праве собственности</li>
            <li>Сведения о собственнике</li>
            <li>Заводские и идентификационные номера</li>
            <li>Соответствие сведений в документах</li>
            <li>Комплект документов для требуемого регистрационного действия</li>
          </ul>
        </div>
        <div class="service-detail__actions">
          <a class="btn btn--primary" href="#page-form" data-select-service="Технический осмотр" data-service-event="inspection">Получить консультацию по акту осмотра</a>
          <p>Возможность оформления акта и итоговый порядок действий зависят от документов, состояния идентификационной маркировки, региона и требований соответствующего подразделения Гостехнадзора.</p>
        </div>
      </div>
    </section>`;
  }

  return '';
}

export function mainPage() {
  const title = 'Регистрация самоходной техники в Москве, МО и по всей России — ТехУчёт';
  const description = 'Проверка документов и сопровождение регистрации самоходной техники в Москве, МО и по всей России. Услуги от 5 000 ₽, ориентировочный срок 3–5 рабочих дней.';
  const canonical = `${site.baseUrl}/`;
  return `<!DOCTYPE html>
<html lang="ru">
<head>
${head({
  title,
  description,
  canonical,
  schemas: [
    organizationSchema(),
    serviceSchema({ name: 'Сопровождение регистрации самоходной техники', description, url: canonical }),
    faqSchema(faq),
  ],
})}
  <link rel="preload" href="assets/images/hero_bg.webp" as="image" type="image/webp" imagesrcset="assets/images/hero_bg-720.webp 720w, assets/images/hero_bg-900.webp 900w, assets/images/hero_bg.webp 1376w" imagesizes="100vw" fetchpriority="high">
</head>
<body>
  <a class="skip-link" href="#main">К основному содержанию</a>
  ${header()}
  <main id="main">
    <section class="hero">
      <picture class="hero__media" aria-hidden="true"><source srcset="assets/images/hero_bg-720.webp 720w, assets/images/hero_bg-900.webp 900w, assets/images/hero_bg.webp 1376w" sizes="100vw" type="image/webp"><img src="assets/images/hero_bg.jpg" width="1376" height="768" alt="" fetchpriority="high" decoding="async"></picture>
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="container hero__grid">
        <div class="hero__content">
          <h1>Регистрация самоходной техники в Москве, МО и по всей России</h1>
          <p class="hero__subtitle">Поможем подготовить документы и сопроводим постановку на учёт, снятие с учёта, восстановление документов и другие регистрационные действия с самоходной техникой.</p>
          <ul class="hero__benefits"><li>Единый номер для связи</li><li>Дистанционная проверка документов</li><li>Сопровождение с учётом региона</li><li>Срок выполнения большинства работ — 3–5 рабочих дней</li></ul>
          <div class="hero__actions"><a class="btn btn--primary" href="#hero-lead">Получить консультацию</a><a class="btn btn--outline" href="#hero-lead">Рассчитать стоимость</a></div>
          <p class="hero__hint">Оставьте заявку — специалист свяжется с вами в рабочее время.</p>
        </div>
        <div class="form-stack">
          ${simpleHeroForm()}
          <div class="form-quick-contacts"><span>Или свяжитесь напрямую</span>${quickContacts({ modifier: 'quick-contacts--form' })}</div>
        </div>
      </div>
    </section>

    <section class="stats" aria-label="Опыт компании">
      <div class="container stats__grid">
        <div class="stat"><strong><span data-counter="85">85</span>+</strong><span>регионов России</span><small>Принимаем обращения по всей стране</small></div>
        <div class="stat"><strong><span data-counter="3200">3 200</span>+</strong><span>выполненных регистраций</span><small>Сохранённый показатель компании</small></div>
        <div class="stat"><strong><span data-counter="7">7</span> лет</strong><span>работы</span><small>Опыт сопровождения регистраций</small></div>
      </div>
    </section>

    <section class="section" id="services">
      <div class="container">
        <div class="section-heading"><p class="eyebrow">Услуги и стоимость</p><h2>Регистрационные действия без неясных тарифов</h2><p>Проверяем документы, готовим комплект и сопровождаем выбранную услугу с учётом требований региона.</p></div>
        <div class="service-grid">${services.map((service) => `<article class="service-card" id="service-${service.key}"><h3>${service.name}</h3><p>${service.situation}</p><h4>Что входит</h4><ul>${service.includes.map((item) => `<li>${item}</li>`).join('')}</ul><div class="service-meta"><span>3–5 рабочих дней</span><strong>от 5 000 ₽</strong></div><div class="card-actions">${service.page ? `<a class="text-link" href="${service.page}/">Подробнее</a>` : '<span></span>'}<a class="btn btn--primary" href="#lead-form" data-select-service="${service.short}" data-service-event="${service.key}">Получить консультацию</a></div></article>`).join('')}</div>
        <p class="section-note">Точная стоимость и срок зависят от вида техники, региона, регистрационного действия и комплекта документов. Итоговую стоимость специалист назовёт после проверки документов. Государственные пошлины и сторонние расходы в цену услуг не включены.</p>
      </div>
    </section>

    <section class="section section--alt" id="situations">
      <div class="container">
        <div class="section-heading"><p class="eyebrow">Проблемные ситуации</p><h2>Разберём документы и предложим порядок действий</h2><p>Не обещаем результат до проверки. Сначала изучаем исходные данные и требования конкретного подразделения.</p></div>
        <div class="problem-grid">${problems.map(([title, text, service = 'Отказ или сложная ситуация', event = 'complex_case']) => `<article class="problem-card"><h3>${title}</h3><p>${text}</p><a class="text-link" href="#lead-form" data-select-service="${service}" data-situation="${title}" data-service-event="${event}">Разобрать мою ситуацию</a></article>`).join('')}</div>
      </div>
    </section>

    <section class="section" id="process">
      <div class="container">
        <div class="section-heading"><p class="eyebrow">Как проходит работа</p><h2>Пять понятных этапов</h2></div>
        <ol class="process-list">${processSteps.map(([title, text], index) => `<li><span>${index + 1}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol>
        <div class="info-strip"><strong>Как правило, 3–5 рабочих дней после получения полного комплекта документов.</strong><span>Точный срок зависит от региона, вида регистрационного действия, комплекта документов и графика работы соответствующего подразделения Гостехнадзора.</span></div>
      </div>
    </section>

    <section class="section section--alt" id="documents">
      <div class="container documents-layout">
        <div class="section-heading section-heading--left"><p class="eyebrow">Документы</p><h2>Предварительный список для вашей ситуации</h2><p>Выберите собственника и регистрационное действие. Список обновится автоматически.</p></div>
        <div class="documents-tool" data-documents-tool>
          <div class="segmented" role="group" aria-label="Тип собственника"><button type="button" class="is-active" data-owner="person">Физическое лицо</button><button type="button" data-owner="company">ИП или организация</button></div>
          <div class="tabs" role="tablist" aria-label="Регистрационное действие"><button type="button" class="is-active" data-action="registration">Постановка на учёт</button><button type="button" data-action="deregistration">Снятие с учёта</button><button type="button" data-action="restore">Восстановление документов</button><button type="button" data-action="inspection">Технический осмотр</button></div>
          <ul class="document-list" data-document-list><li>Паспорт собственника</li><li>Бумажный ПСМ или электронный паспорт (ЭПСМ)</li><li>Документ о праве собственности</li><li>Полис ОСАГО — когда требуется</li><li>Документы на номерные компоненты — при наличии изменений</li></ul>
          <p class="tool-note">Точный перечень зависит от вида техники, регистрационного действия, региона и истории владения. Специалист проверит документы после обращения.</p>
        </div>
      </div>
    </section>

    <section class="section" id="cases">
      <div class="container">
        <div class="section-heading"><p class="eyebrow">Практические примеры</p><h2>Примеры задач, с которыми мы работаем</h2><p>Сроки и порядок действий приведены как примеры. Результат зависит от документов и конкретной ситуации.</p></div>
        <div class="case-grid">${cases.map((item) => `<article class="case-card"><h3>${item.title}</h3><dl><div><dt>Ситуация</dt><dd>${item.situation}</dd></div><div><dt>Возможное решение</dt><dd>${item.solution}</dd></div><div><dt>Ориентировочный срок</dt><dd>${item.term}</dd></div></dl><a class="text-link" href="#lead-form" data-select-service="Отказ или сложная ситуация" data-situation="Пример задачи: ${item.title}">Обсудить похожую задачу</a></article>`).join('')}</div>
      </div>
    </section>

    <section class="rules-section">
      <div class="container rules-layout">
        <div><p class="eyebrow">Изменение законодательства</p><h2>Учитываем новые правила регистрации с 1 сентября 2026 года</h2></div>
        <div><p>При подготовке документов учитываем требования Правил государственной регистрации самоходных машин и других видов техники, утверждённых Постановлением Правительства РФ от 29.05.2026 №625.</p><a class="text-link" href="https://publication.pravo.gov.ru/document/0001202605290095" target="_blank" rel="noopener">Официальный источник</a></div>
      </div>
    </section>

    <section class="section section--alt" id="faq"><div class="container faq-layout"><div class="section-heading section-heading--left"><p class="eyebrow">Частые вопросы</p><h2>Коротко о главном</h2><p>Если вашей ситуации нет в списке, отправьте заявку на разбор документов.</p></div>${faqBlock()}</div></section>

    <section class="section lead-section" id="lead-form"><div class="container lead-layout">${contactPanel()}${simpleFinalForm()}</div></section>
  </main>
  ${footer()}
    ${simpleCallbackModal()}
  ${mobileBar()}
</body>
</html>`;
}

export function servicePage(page) {
  const canonical = `${site.baseUrl}/${page.slug}/`;
  const description = `${page.description} Стоимость от 5 000 ₽, ориентировочный срок 3–5 рабочих дней.`;
  const pageFaq = [
    ['Сколько стоит услуга?', 'Стоимость начинается от 5 000 ₽. Точная сумма зависит от региона, вида техники, комплекта документов и сложности ситуации.'],
    ['Какой ориентировочный срок?', 'Большинство стандартных действий выполняется в течение 3–5 рабочих дней после получения полного комплекта документов. Срок зависит от региона и графика Гостехнадзора.'],
    ['Можно ли начать дистанционно?', 'Да. Отправьте сведения о технике и имеющиеся документы на предварительную проверку. Специалист сообщит дальнейший порядок действий.'],
  ];
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${site.baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: page.short, item: canonical },
    ],
  };
  return `<!DOCTYPE html>
<html lang="ru">
<head>
${head({ title: `${page.h1} — ТехУчёт`, description, canonical, prefix: '../', schemas: [organizationSchema(), serviceSchema({ name: page.h1, description, url: canonical }), faqSchema(pageFaq), breadcrumb] })}
</head>
<body>
  <a class="skip-link" href="#main">К основному содержанию</a>
  ${header('../')}
  <main id="main">
    <section class="service-hero">
      <div class="container"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="../">Главная</a><span>•</span><span>${page.short}</span></nav>
        <div class="service-hero__grid"><div><p class="eyebrow">ТехУчёт • Работаем по всей России</p><h1>${page.h1}</h1><p>${page.description}</p><div class="service-hero__meta" id="price" aria-label="Стоимость и ориентировочный срок"><strong>от 5 000 ₽</strong><span>Ориентировочно 3–5 рабочих дней</span></div><div class="hero__actions"><a class="btn btn--primary" href="#page-form" data-select-service="${page.short}" data-service-event="${page.key}">Получить консультацию</a><a class="btn btn--outline track-phone" href="${site.phoneHref}">${site.phone}</a></div></div>
        <div class="service-summary" id="how"><h2>Что входит в работу</h2><ul>${page.works.map((item) => `<li>${item}</li>`).join('')}</ul><p>Точный порядок определяется после проверки документов.</p></div></div>
      </div>
    </section>
    <section class="section"><div class="container two-column"><div><p class="eyebrow">Типовые ситуации</p><h2>Когда обращаются</h2><ul class="check-list">${page.situations.map((item) => `<li>${item}</li>`).join('')}</ul></div><div id="documents"><p class="eyebrow">Документы</p><h2>Что подготовить</h2><ul class="check-list">${page.docs.map((item) => `<li>${item}</li>`).join('')}</ul><p class="section-note">Точный перечень зависит от вида техники, региона и истории владения.</p></div></div></section>
${serviceExtraSection(page)}
    <section class="section section--alt"><div class="container faq-layout"><div class="section-heading section-heading--left"><p class="eyebrow">Вопросы по услуге</p><h2>Перед началом работы</h2></div>${faqBlock(pageFaq)}</div></section>
    <section class="section lead-section" id="page-form"><div class="container lead-layout">${contactPanel()}${simpleFinalForm({ id: `${page.slug}-lead`, prefix: '../', title: `Получить консультацию: ${page.short}` })}</div></section>
  </main>
  ${footer('../')}
    ${simpleCallbackModal('../')}
  ${mobileBar('#page-form')}
</body>
</html>`;
}

export function legalPage(type) {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Политика обработки персональных данных' : 'Согласие на обработку персональных данных';
  const canonical = `${site.baseUrl}/${type}/`;
  const privacyContent = `
    <p>Настоящая Политика определяет порядок обработки персональных данных посетителей сайта «ТехУчёт» оператором ${site.company}, ИНН ${site.inn}, ОГРН ${site.ogrn}.</p>
    <h2>1. Какие данные обрабатываются</h2><p>Имя, телефон, регион, город, сведения о виде техники и выбранной услуге, комментарий к заявке, адрес страницы, UTM-метки, yclid и технический идентификатор ClientID Яндекс.Метрики при его наличии.</p>
    <h2>2. Цели обработки</h2><p>Обработка обращения, обратная связь, расчёт стоимости услуг, подготовка предложения и анализ эффективности рекламных источников. Персональные данные из форм не передаются в Яндекс.Метрику.</p>
    <h2>3. Правовые основания</h2><p>Согласие пользователя, предоставленное установкой обязательного флажка в форме, а также действия, необходимые для ответа на запрос пользователя и заключения договора.</p>
    <h2>4. Способы и сроки обработки</h2><p>Данные передаются по защищённому соединению через технический обработчик Cloudflare Worker в Telegram для доставки заявки оператору. Данные хранятся не дольше, чем этого требуют цели обработки и законодательство Российской Федерации.</p>
    <h2>5. Передача третьим лицам</h2><p>Данные могут обрабатываться Cloudflare, Telegram и другими техническими поставщиками, обеспечивающими работу сайта и передачу заявок, только в объёме, необходимом для оказания соответствующих услуг. Иная передача возможна в случаях, установленных законом.</p>
    <h2>6. Права пользователя</h2><p>Пользователь может запросить сведения об обработке, уточнение, блокирование или удаление данных, а также отозвать согласие, направив письмо на <a href="${site.emailHref}">${site.email}</a>.</p>
    <h2>7. Файлы cookie и аналитика</h2><p>Сайт может сохранять технические параметры рекламного перехода и использовать Яндекс.Метрику после указания владельцем действующего идентификатора счётчика. Пользователь может ограничить cookie в настройках браузера.</p>
    <h2>8. Контакты оператора</h2><p>${site.company}<br>ИНН ${site.inn}, КПП ${site.kpp}, ОГРН ${site.ogrn}<br>Email: <a href="${site.emailHref}">${site.email}</a><br>Телефон: <a href="${site.phoneHref}">${site.phone}</a></p>`;
  const consentContent = `
    <p>Устанавливая флажок согласия и отправляя форму на сайте «ТехУчёт», я свободно, своей волей и в своём интересе даю ${site.company}, ИНН ${site.inn}, ОГРН ${site.ogrn}, согласие на обработку моих персональных данных.</p>
    <h2>1. Состав данных</h2><p>Имя, телефон, регион, город, сведения о виде техники, выбранной услуге и ситуации, комментарий, а также технические данные рекламного перехода: URL страницы, UTM-метки, yclid и ClientID при его наличии.</p>
    <h2>2. Цели</h2><p>Рассмотрение обращения, обратная связь, консультация, расчёт стоимости, подготовка документов и предложения по выбранной услуге.</p>
    <h2>3. Действия с данными</h2><p>Сбор, запись, систематизация, хранение, уточнение, использование, передача через Cloudflare Worker в Telegram и другим техническим поставщикам для доставки заявки оператору, блокирование и удаление.</p>
    <h2>4. Срок и отзыв согласия</h2><p>Согласие действует до достижения целей обработки или до его отзыва. Отозвать согласие можно письмом на <a href="${site.emailHref}">${site.email}</a>. Отзыв не влияет на законность обработки, выполненной до его получения.</p>
    <h2>5. Подтверждение</h2><p>Я подтверждаю, что указанные мной данные принадлежат мне, а предоставленная информация является достоверной.</p>`;
  return `<!DOCTYPE html><html lang="ru"><head>${head({ title: `${title} — ТехУчёт`, description: `${title} сайта ТехУчёт.`, canonical, prefix: '../', schemas: [organizationSchema()] })}</head><body>${header('../')}<main id="main" class="legal"><div class="container legal__inner"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="../">Главная</a><span>•</span><span>${title}</span></nav><p class="eyebrow">Юридическая информация</p><h1>${title}</h1><p class="legal__updated">Редакция от 8 августа 2026 года</p>${isPrivacy ? privacyContent : consentContent}</div></main>${footer('../')}${simpleCallbackModal('../')}${mobileBar('../')}</body></html>`;
}

export function notFoundPage({ nested = false } = {}) {
  const prefix = nested ? '../' : '';
  return `<!DOCTYPE html><html lang="ru"><head>${head({ title: 'Страница не найдена — ТехУчёт', description: 'Запрошенная страница не найдена.', canonical: `${site.baseUrl}/404`, prefix, schemas: [organizationSchema()] })}</head><body>${header(prefix)}<main class="not-found"><div class="container"><p class="eyebrow">Ошибка 404</p><h1>Такой страницы нет</h1><p>Вернитесь на главную или свяжитесь с нами — поможем с оформлением самоходной техники.</p><div class="hero__actions"><a class="btn btn--primary" href="${prefix || './'}">На главную</a><a class="btn btn--outline track-phone" href="${site.phoneHref}">${site.phone}</a></div></div></main>${footer(prefix)}${mobileBar(prefix)}</body></html>`;
}
