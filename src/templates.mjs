import {
  site,
  services,
  serviceOptions,
  problems,
  processSteps,
  cases,
  faq,
  mainFaq,
  spbLanding,
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
  <link rel="preload" href="${prefix}style.css?v=12" as="style">
  <link rel="stylesheet" href="${prefix}style.css?v=12">
  <script src="${prefix}site-config.js?v=12"></script>
  <script src="${prefix}script.js?v=12" defer></script>
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
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '20:00',
    },
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
      description: 'Стоимость от 5 000 ₽. Точная стоимость определяется после уточнения задачи.',
    },
  };
}


function mainOfferBenefits() {
  return `<ul class="offer-benefits" id="price">
    <li><strong>Без привоза техники</strong><span>на осмотр</span></li>
    <li><strong>от 5 000 ₽</strong><span>Стоимость услуг</span></li>
    <li>Без личных визитов</li>
    <li>По договору</li>
    <li>Для физических и юридических лиц</li>
  </ul>`;
}

function offerBenefits(term = '3–5', region = '') {
  const regionItem = region ? `<li>${region}</li>` : '';
  return `<ul class="offer-benefits" id="price"><li><strong>от 5 000 ₽</strong><span>Стоимость услуг</span></li><li><strong>${term} рабочих дней</strong><span>Ориентировочный срок</span></li><li>По договору</li>${regionItem}<li>Для физлиц и организаций</li><li>Без очередей и личных визитов в Гостехнадзор</li></ul>`;
}

function offerActions(service = 'Консультация', event = '') {
  return `<div class="hero__actions offer-actions"><button class="btn btn--primary" type="button" data-modal-open data-select-service="${service}" data-lead-intent="order" data-service-event="${event}">Заказать услугу</button><button class="btn btn--outline" type="button" data-modal-open data-select-service="${service}" data-lead-intent="consultation" data-service-event="${event}">Бесплатная консультация</button><a class="offer-whatsapp track-whatsapp" href="${site.whatsapp}" target="_blank" rel="noopener">WhatsApp ↗</a></div>`;
}

function b2bBlock() {
  return `<section class="section b2b-section" id="b2b">
    <div class="container">
      <div class="b2b-card">
        <div class="b2b-card__content">
          <h2>Для юридических лиц и парков спецтехники</h2>
          <p class="b2b-card__desc">Работаем по договору с компаниями и владельцами парков техники. Безналичный расчёт, закрывающие документы, постановка и снятие нескольких единиц техники.</p>
          <p class="b2b-card__note">Несколько единиц техники? Рассчитаем стоимость сопровождения.</p>
        </div>
        <div class="b2b-card__action">
          <button class="btn btn--primary" type="button" data-modal-open data-select-service="Регистрация спецтехники" data-lead-intent="order">Получить расчёт</button>
        </div>
      </div>
    </div>
  </section>`;
}

function advantageBlock() {
  return `<section class="section section--highlight advantage-section" id="no-transport">
    <div class="container">
      <div class="advantage-strip">
        <div class="advantage-strip__content">
          <h2>Без привоза техники</h2>
          <p class="advantage-strip__desc">Помогаем оформить регистрационные действия без привоза техники на осмотр. Берём все этапы сопровождения в Гостехнадзоре на себя.</p>
        </div>
        <div class="advantage-strip__action">
          <button class="btn btn--primary" type="button" data-modal-open data-select-service="Консультация" data-lead-intent="consultation">Узнать подробнее</button>
        </div>
      </div>
    </div>
  </section>`;
}

function trustBlock() {
  return `<section class="trust-strip"><div class="container"><h2>Работаем по договору</h2><ul><li>Работаем с физлицами и организациями</li><li>Бесплатная первичная консультация</li><li>Берём оформление в Гостехнадзоре на себя</li></ul><p>${site.company} · ИНН ${site.inn} · КПП ${site.kpp} · ОГРН ${site.ogrn}</p></div></section>`;
}

function serviceNavigation() {
  const allServices = [
    {
      title: 'Постановка на учёт',
      desc: 'Оформление постановки самоходной техники на учёт в Гостехнадзоре. Сопровождение под ключ до получения СТС и номеров.',
      meta: '<strong>от 5 000 ₽</strong> · 3–5 рабочих дней',
      service: 'Постановка на учёт',
      event: 'registration',
      url: 'registraciya/',
    },
    {
      title: 'Снятие с учёта',
      desc: 'Сопровождение снятия самоходной техники с регистрационного учёта в Гостехнадзоре при продаже, смене владельца или утилизации.',
      meta: '<strong>от 5 000 ₽</strong> · 2–5 рабочих дней',
      service: 'Снятие с учёта',
      event: 'deregistration',
      url: 'snyatie-s-ucheta/',
    },
    {
      title: 'Перерегистрация',
      desc: 'Внесение изменений в регистрационные данные Гостехнадзора при смене собственника, договора лизинга или реквизитов.',
      meta: '<strong>от 5 000 ₽</strong> · 3–5 рабочих дней',
      service: 'Внесение изменений',
      event: 'registration',
      url: 'registraciya/#pereregistraciya',
    },
    {
      title: 'Техосмотр',
      desc: 'Подготовка комплекта документов и сопровождение обязательного технического осмотра самоходной техники в Гостехнадзоре.',
      meta: '<strong>от 5 000 ₽</strong> · 3–5 рабочих дней',
      service: 'Технический осмотр',
      event: 'inspection',
      url: 'tehosmotr/',
    },
    {
      title: 'Сложные случаи',
      desc: 'Разбор отказов Гостехнадзора, неполных цепочек договоров, проблем с номерами агрегатов и нестандартных ситуаций.',
      meta: '<strong>от 5 000 ₽</strong> · от 3 рабочих дней',
      service: 'Отказ или сложная ситуация',
      event: 'complex_case',
      url: 'slozhnye-sluchai/',
    },
    {
      title: 'Восстановление документов',
      desc: 'Помощь при утрате или повреждении ПСМ либо СТС для дальнейшего оформления техники в Гостехнадзоре.',
      meta: '<strong>от 5 000 ₽</strong> · 3–5 рабочих дней',
      service: 'Восстановление ПСМ и СТС',
      event: 'restore_psm',
      url: 'vosstanovlenie-psm/',
    },
  ];

  return `<section class="service-navigation" id="services">
    <div class="container">
      <div class="section-heading">
        <h2>Все услуги по регистрации спецтехники</h2>
        <p>Берём оформление на себя: готовим документы, сопровождаем регистрационные процедуры и доводим до результата.</p>
      </div>
      <div class="service-navigation__grid service-navigation__grid--main">
        ${allServices.map((item) => `<article class="nav-card nav-card--article">
          <span class="nav-card__title">${item.title}</span>
          <span class="nav-card__desc">${item.desc}</span>
          <span class="nav-card__meta">${item.meta}</span>
          <div class="nav-card__actions">
            <button class="btn btn--small btn--primary nav-card__btn" type="button" data-modal-open data-select-service="${item.service}" data-lead-intent="order" data-service-event="${item.event}">Заказать услугу</button>
            <a class="text-link nav-card__more" href="${item.url}">Подробнее →</a>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>`;
}

function commercialDetails(page) {
  if (page.key === 'registration') return `<section class="section section--alt"><div class="container two-column"><div><h2>Что берём на себя</h2><ul class="check-list">${['Подготовка заявления и комплекта документов для подачи', 'Формирование комплекта документов собственника', 'Сопровождение осмотра', 'Сопровождение регистрационной процедуры', 'Взаимодействие с Гостехнадзором', 'Сопровождение до получения результата', 'Помощь в нестандартных ситуациях'].map(x => `<li>${x}</li>`).join('')}</ul></div><div id="owners"><h2>Регистрируем самоходную технику</h2><p>Для физических лиц, ИП и организаций. Постановка нескольких единиц техники и сопровождение парков спецтехники.</p><ul class="equipment-list">${['Тракторы', 'Погрузчики', 'Экскаваторы', 'Квадроциклы', 'Снегоходы', 'Коммунальная техника', 'Дорожно-строительная техника', 'Иная самоходная техника'].map(x => `<li>${x}</li>`).join('')}</ul></div></div></section>`;
  if (page.key === 'deregistration') return `<section class="section section--alt"><div class="container"><h2>Когда требуется снятие с учёта</h2><p>Обратитесь за оформлением, если ваша задача связана с одной из ситуаций:</p><ul class="equipment-list">${['Продажа техники', 'Утилизация', 'Вывоз в другой регион', 'Изменение собственника', 'Прекращение регистрации', 'Снятие с учёта парка техники', 'Другие регистрационные действия'].map(x => `<li>${x}</li>`).join('')}</ul><p class="section-note">Работаем по договору с компаниями и частными владельцами. Подготовим документы и сопроводим снятие с учёта в Гостехнадзоре до результата.</p></div></section>`;
  return '';
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

function header(prefix = '', sectionBase = null, { homeHref = null, situationsId = 'situations' } = {}) {
  const home = homeHref || prefix || './';
  const sections = sectionBase || home;
  return `<header class="header" id="header">
    <div class="container header__inner">
      <a class="logo" href="${home}" aria-label="ТехУчёт — главная">
        <img class="logo__img" src="${prefix}logo.png" width="1024" height="682" alt="ТехУчёт — Гостехнадзор">
      </a>
      <nav class="nav" aria-label="Основная навигация">
        <a href="${sections}#services">Услуги</a>
        <a href="${sections}#${situationsId}">Сложные ситуации</a>
        <a href="${sections}#process">Как работаем</a>
        <a href="${sections}#faq">Вопросы</a>
      </nav>
      <div class="header__actions">
        <a class="header__phone track-phone" href="${site.phoneHref}">${site.phone}</a>
        ${quickContacts({ modifier: 'quick-contacts--header', includePhone: false })}
        <button class="btn btn--small btn--outline" type="button" data-modal-open>Бесплатная консультация</button>
      </div>
      <button class="menu-button" type="button" aria-label="Открыть меню" aria-controls="mobile-menu" aria-expanded="false" data-menu-button>
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobile-menu" hidden data-mobile-menu>
      <div class="container">
        <nav aria-label="Мобильная навигация">
          <a href="${sections}#services">Услуги</a>
          <a href="${sections}#${situationsId}">Сложные ситуации</a>
          <a href="${sections}#process">Как работаем</a>
          <a href="${sections}#faq">Вопросы</a>
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
  </div><label class="field" for="${id}-comment"><span>Что нужно сделать / вид техники</span><input class="ym-disable-keys" id="${id}-comment" name="comment" type="text" maxlength="1000" placeholder="Например, поставить погрузчик на учёт"></label>`;
}

function simpleHeroForm() {
  return `<form class="form-card hero-form" id="hero-lead" data-lead-form data-form-name="Форма первого экрана" novalidate>
    ${honeypot()}
    <div class="form-card__header">
      <h2>Рассчитать стоимость</h2>
      <p>Оставьте номер — специалист уточнит задачу и стоимость оформления.</p>
    </div>
    ${simpleContactFields('hero')}
    ${consentField('hero-consent')}
    <button class="btn btn--primary btn--full" type="submit">Получить расчёт</button>
    ${formStatus()}
  </form>`;
}

function simpleFinalForm({ id = 'main-lead', prefix = '', title = 'Нужно оформить спецтехнику в Гостехнадзоре?', subtitle = 'Оставьте заявку — поможем с постановкой на учёт, снятием или техосмотром.', formName = 'Оформление спецтехники в Гостехнадзоре' } = {}) {
  return `<form class="form-card lead-form" id="${id}" data-lead-form data-form-name="${formName}" novalidate>
    ${honeypot()}
    <div class="form-card__header"><h2>${title}</h2><p>${subtitle}</p></div>
    ${simpleContactFields(id)}
    ${consentField(`${id}-consent`, prefix)}
    <button class="btn btn--primary btn--full" type="submit">Заказать услугу</button>
    <div class="lead-form__secondary-actions" style="display:flex;gap:10px;margin-top:10px;">
      <button class="btn btn--outline" type="button" data-modal-open data-select-service="Консультация" data-lead-intent="consultation" style="flex:1;">Бесплатная консультация</button>
      <a class="btn btn--outline track-whatsapp" href="${site.whatsapp}" target="_blank" rel="noopener" style="flex:1;text-align:center;">WhatsApp</a>
    </div>
    ${formStatus()}
  </form>`;
}

function simpleCallbackModal(prefix = '') {
  return `<div class="modal" id="callback-modal" hidden data-modal>
    <div class="modal__backdrop" data-modal-close></div>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="callback-title">
      <button class="icon-button modal__close" type="button" aria-label="Закрыть окно" data-modal-close>×</button>
      <h2 id="callback-title">Бесплатная консультация</h2>
      <p data-modal-description>Есть вопрос по постановке, снятию или техосмотру? Оставьте номер — специалист свяжется с вами.</p>
      <form data-lead-form data-form-name="Обратный звонок" novalidate>
        ${honeypot()}
        ${simpleContactFields('callback')}
        ${consentField('callback-consent', prefix)}
        <button class="btn btn--primary btn--full" type="submit">Получить консультацию</button>
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
      <div class="form-actions"><button class="btn btn--text" type="button" data-hero-back>Назад</button><button class="btn btn--primary" type="submit">Бесплатная консультация</button></div>
      ${formStatus()}
    </fieldset>
  </form>`;
}

function finalForm({ id = 'main-lead', selected = '', prefix = '', title = 'Получите консультацию по оформлению техники' } = {}) {
  return `<form class="form-card lead-form" id="${id}" data-lead-form data-form-name="${title}" novalidate>
    ${honeypot()}
    <div class="form-card__header"><h2>${title}</h2><p>Специалист уточнит задачу и назовёт точную стоимость сопровождения.</p></div>
    <div class="form-grid">
      <label class="field" for="${id}-name"><span>Имя</span><input id="${id}-name" name="name" type="text" autocomplete="name" placeholder="Необязательно"></label>
      <label class="field" for="${id}-phone"><span>Телефон *</span><input id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
      ${regionSelect(`${id}-region`)}
      ${serviceSelect(`${id}-service`, selected)}
    </div>
    <label class="field" for="${id}-comment"><span>Комментарий</span><textarea id="${id}-comment" name="comment" rows="4" placeholder="Опишите задачу (необязательно)"></textarea></label>
    ${consentField(`${id}-consent`, prefix)}
    <button class="btn btn--primary btn--full" type="submit">Бесплатная консультация</button>
    ${formStatus()}
  </form>`;
}

function callbackModal(prefix = '') {
  return `<div class="modal" id="callback-modal" hidden data-modal>
    <div class="modal__backdrop" data-modal-close></div>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="callback-title">
      <button class="icon-button modal__close" type="button" aria-label="Закрыть окно" data-modal-close>×</button>
      <h2 id="callback-title">Бесплатная консультация</h2>
      <p>Оставьте номер и регион — специалист свяжется с вами в рабочее время.</p>
      <form data-lead-form data-form-name="Обратный звонок" novalidate>
        ${honeypot()}
        <input type="hidden" name="service" value="Обратный звонок">
        <label class="field"><span>Имя</span><input name="name" type="text" autocomplete="name" placeholder="Необязательно"></label>
        <label class="field"><span>Телефон *</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
        ${regionSelect('callback-region')}
        ${consentField('callback-consent', prefix)}
        <button class="btn btn--primary btn--full" type="submit">Бесплатная консультация</button>
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

function footer(prefix = '', { homeHref = null, serviceLinks = null, description = 'Сопровождение регистрационных действий со спецтехникой в Гостехнадзоре под ключ.' } = {}) {
  const home = homeHref || prefix || './';
  const links = serviceLinks || [
    [`${prefix}registraciya/`, 'Постановка на учёт'],
    [`${prefix}snyatie-s-ucheta/`, 'Снятие с учёта'],
    [`${prefix}vosstanovlenie-psm/`, 'Восстановление ПСМ'],
    [`${prefix}vosstanovlenie-sts/`, 'Восстановление СТС'],
    [`${prefix}tehosmotr/`, 'Техосмотр'],
    [`${prefix}slozhnye-sluchai/`, 'Сложные случаи'],
  ];
  return `<footer class="footer" id="contacts">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a class="logo" href="${home}"><img class="logo__img" src="${prefix}logo.png" width="1024" height="682" alt="ТехУчёт — Гостехнадзор"></a>
        <p>${description}</p>
      </div>
      <div><h2>Услуги</h2>${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</div>
      <div><h2>Контакты</h2><a class="track-phone" href="${site.phoneHref}">${site.phone}</a><a class="track-whatsapp" href="${site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a class="track-telegram" href="${site.telegram}" target="_blank" rel="noopener">Telegram</a><a class="footer-max track-max is-disabled" aria-label="MAX" aria-disabled="true" title="Ссылка на MAX будет добавлена после её получения">${maxContactContent()}</a><a class="track-email" href="${site.emailHref}">${site.email}</a><span>${site.hours}</span></div>
      <div><h2>Реквизиты</h2><span>${site.company}</span><span>ИНН ${site.inn}</span><span>КПП ${site.kpp}</span><span>ОГРН ${site.ogrn}</span></div>
    </div>
    <div class="container footer__bottom">
      <span>© <span data-current-year>${new Date().getFullYear()}</span> ${site.brand}</span>
      <a href="${prefix}privacy/">Политика конфиденциальности</a>
      <a href="${prefix}consent/">Согласие на обработку данных</a>
      <a href="https://voltrena.ru" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary, #f5a623); text-decoration: underline; text-underline-offset: 3px;">Создание и продвижение: voltrena.ru</a>
    </div>
  </footer>`;
}

function faqBlock(items = faq) {
  return `<div class="faq-list">${items.map(([question, answer], index) => `<article class="faq-item"><h3><button type="button" aria-expanded="${index === 0 ? 'true' : 'false'}" data-faq-button><span>${question}</span><span class="faq-icon" aria-hidden="true">+</span></button></h3><div class="faq-answer"${index === 0 ? '' : ' hidden'}><p>${answer}</p></div></article>`).join('')}</div>`;
}

function contactPanel(region = null) {
  const regionRow = region ? `<div><dt>Регион</dt><dd>${region}</dd></div>` : `<div><dt>Сопровождение</dt><dd>Под ключ</dd></div>`;
  return `<aside class="contact-panel">
    <a class="contact-panel__primary track-phone" href="${site.phoneHref}">${site.phone}</a>
    ${quickContacts({ modifier: 'quick-contacts--contact', includePhone: false })}
    <a class="contact-panel__email track-email" href="${site.emailHref}">${site.email}</a>
    <dl><div><dt>Режим работы</dt><dd>${site.hours}</dd></div><div><dt>Стоимость услуг</dt><dd>от 5 000 ₽</dd></div><div><dt>Ориентировочный срок</dt><dd>3–5 рабочих дней</dd></div>${regionRow}</dl>
  </aside>`;
}

function spbLeadForm({ id, title, text, buttonText, formName }) {
  return `<form class="form-card lead-form" id="${id}" data-lead-form data-form-name="${formName}" data-selected-service="${spbLanding.defaultService}" novalidate>
    ${honeypot()}
    <div class="form-card__header"><h2>${title}</h2><p>${text}</p></div>
    ${simpleContactFields(id)}
    ${consentField(`${id}-consent`, '../')}
    <button class="btn btn--primary btn--full" type="submit">${buttonText}</button>
    ${formStatus()}
  </form>`;
}

function spbContactPanel() {
  return `<aside class="contact-panel">
    <h2>Регистрация техники в Санкт-Петербурге и Ленинградской области</h2>
    <a class="contact-panel__primary track-phone" href="${site.phoneHref}">${site.phone}</a>
    ${quickContacts({ modifier: 'quick-contacts--contact', includePhone: false })}
    <a class="contact-panel__email track-email" href="${site.emailHref}">${site.email}</a>
    <dl><div><dt>Регион</dt><dd>Санкт-Петербург и Ленинградская область</dd></div><div><dt>Сопровождение</dt><dd>Под ключ</dd></div><div><dt>Режим работы</dt><dd>${site.hours}</dd></div></dl>
  </aside>`;
}

function serviceExtraSection(page) {
  if (page.key === 'registration') {
    return `<section class="section section--alt service-detail" id="pereregistraciya">
      <div class="container">
        <div class="section-heading section-heading--left">
          <h2>Перерегистрация и смена собственника самоходной техники в Гостехнадзоре</h2>
          <p>Помогаем подготовить документы для переоформления самоходной техники при смене собственника, продаже, передаче по договору или изменении регистрационных данных. До начала работ формируем и выверяем полный комплект документов для Гостехнадзора, основание перехода права и сведения о новом собственнике.</p>
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
              <li>Формирование и выверка комплекта документов</li>
              <li>Оформление оснований перехода права собственности</li>
              <li>Подготовка заявления и комплекта документов</li>
              <li>Сопровождение регистрационных действий</li>
              <li>Информирование о необходимых шагах и сроках</li>
            </ul>
          </div>
        </div>
        <div class="service-detail__actions">
          <a class="btn btn--primary" href="#page-form" data-select-service="Внесение изменений" data-service-event="changes">Заказать переоформление</a>
          <p>Возможность переоформления, итоговый порядок и срок зависят от документов, истории владения и требований соответствующего подразделения Гостехнадзора.</p>
        </div>
      </div>
    </section>`;
  }

  if (page.key === 'inspection') {
    return `<section class="section section--alt service-detail" id="akt-osmotra">
      <div class="container">
        <div class="section-heading section-heading--left">
          <h2>Акт осмотра самоходной техники</h2>
          <p>Помогаем подготовить документы и сопровождаем процедуру осмотра самоходной техники, когда для регистрационных действий требуется акт осмотра. Помогаем оформить необходимые документы без привоза техники на осмотр.</p>
        </div>
        <div class="service-detail__panel service-detail__panel--wide">
          <h3>Что подготавливаем к осмотру</h3>
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
  const title = 'Регистрация спецтехники в Гостехнадзоре под ключ | ТехУчёт';
  const description = 'Постановка на учёт, снятие с учёта, перерегистрация и техосмотр самоходной техники в Гостехнадзоре. Сопровождение под ключ для физических и юридических лиц.';
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
    faqSchema(mainFaq),
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
          <h1>Регистрация спецтехники в Гостехнадзоре под ключ</h1>
          <p class="hero__subtitle">Постановка на учёт, снятие с учёта, перерегистрация и техосмотр самоходной техники. Берём сопровождение оформления на себя.</p>
          ${mainOfferBenefits()}
          ${offerActions()}
        </div>
        <div class="form-stack">
          ${simpleHeroForm()}
          <div class="form-quick-contacts"><span>Или свяжитесь напрямую</span>${quickContacts({ modifier: 'quick-contacts--form' })}</div>
        </div>
      </div>
    </section>

    ${serviceNavigation()}

    ${advantageBlock()}

    <section class="section section--alt" id="situations">
      <div class="container">
        <div class="section-heading"><h2>Разберём ситуацию и предложим порядок действий</h2><p>Поможем разобраться в нестандартном случае и сопроводить оформление в Гостехнадзоре.</p></div>
        <div class="problem-grid">${problems.slice(0, 6).map(([title, text, service = 'Отказ или сложная ситуация', event = 'complex_case']) => `<article class="problem-card"><h3>${title}</h3><p>${text}</p><a class="text-link" href="#lead-form" data-modal-open data-select-service="${service}" data-situation="${title}" data-service-event="${event}" data-lead-intent="consultation">Получить консультацию</a></article>`).join('')}</div>
      </div>
    </section>

    ${b2bBlock()}

    <section class="stats" aria-label="Опыт компании">
      <div class="container stats__grid stats__grid--two">
        <div class="stat"><strong><span data-counter="3200">3 200</span>+</strong><span>выполненных регистраций</span><small>Опыт регистрационных действий</small></div>
        <div class="stat"><strong><span data-counter="7">7</span> лет</strong><span>работы</span><small>Опыт сопровождения регистраций</small></div>
      </div>
    </section>

    ${trustBlock()}

    <section class="section" id="process">
      <div class="container">
        <div class="section-heading"><h2>Как проходит оформление</h2></div>
        <ol class="process-flow">
          <li class="process-flow__step">
            <div class="process-flow__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <div class="process-flow__body">
              <h3>Оставляете заявку</h3>
              <p>Оставляете заявку на сайте или связываетесь с нами напрямую.</p>
            </div>
          </li>
          <li class="process-flow__step">
            <div class="process-flow__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
            <div class="process-flow__body">
              <h3>Уточняем задачу и комплект документов</h3>
              <p>Бесплатно разбираем ситуацию и требования Гостехнадзора.</p>
            </div>
          </li>
          <li class="process-flow__step">
            <div class="process-flow__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
            <div class="process-flow__body">
              <h3>Сопровождаем оформление</h3>
              <p>Готовим необходимые документы и берём взаимодействие с ведомством на себя.</p>
            </div>
          </li>
          <li class="process-flow__step">
            <div class="process-flow__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <div class="process-flow__body">
              <h3>Вы получаете результат</h3>
              <p>Получаете готовые регистрационные документы (СТС) и государственные знаки.</p>
            </div>
          </li>
        </ol>
        <div class="info-strip"><strong>Как правило, 3–5 рабочих дней после получения полного комплекта документов.</strong><span>Точный срок зависит от вида регистрационного действия, комплекта документов и графика работы соответствующего подразделения Гостехнадзора.</span></div>
      </div>
    </section>

    <section class="section section--alt" id="documents">
      <div class="container documents-layout">
        <div class="section-heading section-heading--left"><h2>Что нужно предоставить</h2></div>
        <ul class="check-list">
          <li>ПСМ или сведения об ЭПСМ</li>
          <li>Документ о праве собственности</li>
          <li>Паспорт собственника или реквизиты организации</li>
        </ul>
        <p class="section-note">ПСМ / ЭПСМ предоставляется собственником как часть комплекта документов для оформления. Остальной комплект зависит от ситуации — необходимые документы подготовим в рамках оформления.</p>
        <div style="margin-top: 18px;"><button class="btn btn--primary" type="button" data-modal-open data-select-service="Регистрация спецтехники" data-lead-intent="order">Заказать оформление</button></div>
      </div>
    </section>

    <section class="section" id="cases">
      <div class="container">
        <div class="section-heading"><h2>Примеры задач, с которыми мы работаем</h2><p>Сроки и порядок действий приведены как примеры. Результат зависит от документов и конкретной ситуации.</p></div>
        <div class="case-grid">${cases.filter(c => ['Экскаватор-погрузчик JCB 3CX', 'Трактор МТЗ-82', 'Мини-погрузчик Bobcat S650'].includes(c.title)).map((item) => `<article class="case-card"><h3>${item.title}</h3><dl><div><dt>Ситуация</dt><dd>${item.situation}</dd></div><div><dt>Возможное решение</dt><dd>${item.solution}</dd></div><div><dt>Ориентировочный срок</dt><dd>${item.term}</dd></div></dl><a class="text-link" href="#lead-form" data-select-service="Отказ или сложная ситуация" data-situation="Пример задачи: ${item.title}">Обсудить похожую задачу</a></article>`).join('')}</div>
      </div>
    </section>

    <section class="rules-section" style="padding-bottom: 0;">
      <div class="container">
        <div class="info-strip"><strong>Работаем с учётом актуальных правил регистрации с 1 сентября 2026 года.</strong></div>
      </div>
    </section>

    <section class="section section--alt" id="faq"><div class="container faq-layout"><div class="section-heading section-heading--left"><h2>Коротко о главном</h2><p>Остались вопросы по оформлению техники? Оставьте заявку на консультацию.</p></div>${faqBlock(mainFaq)}</div></section>

    <section class="section lead-section" id="lead-form"><div class="container lead-layout">${contactPanel()}${simpleFinalForm({ title: 'Нужно оформить спецтехнику в Гостехнадзоре?', subtitle: 'Оставьте заявку — поможем с постановкой на учёт, снятием или техосмотром.', formName: 'Оформление спецтехники в Гостехнадзоре' })}</div></section>
  </main>
  ${footer()}
  ${simpleCallbackModal()}
  ${mobileBar()}
</body>
</html>`;
}

export function spbPage() {
  const canonical = `${site.baseUrl}/spb/`;
  const regionalService = serviceSchema({
    name: spbLanding.h1,
    description: spbLanding.description,
    url: canonical,
  });
  regionalService.areaServed = [
    { '@type': 'City', name: 'Санкт-Петербург' },
    { '@type': 'AdministrativeArea', name: 'Ленинградская область' },
  ];
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${site.baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Санкт-Петербург и Ленинградская область', item: canonical },
    ],
  };
  return `<!DOCTYPE html>
<html lang="ru">
<head>
${head({
  title: spbLanding.title,
  description: spbLanding.description,
  canonical,
  prefix: '../',
  schemas: [organizationSchema(), regionalService, faqSchema(spbLanding.faq), breadcrumb],
})}
  <link rel="preload" href="../assets/images/hero_bg.webp" as="image" type="image/webp" imagesrcset="../assets/images/hero_bg-720.webp 720w, ../assets/images/hero_bg-900.webp 900w, ../assets/images/hero_bg.webp 1376w" imagesizes="100vw" fetchpriority="high">
</head>
<body>
  <a class="skip-link" href="#main">К основному содержанию</a>
  ${header('../', './', { homeHref: './', situationsId: 'cases' })}
  <main id="main">
    <section class="hero hero--regional">
      <picture class="hero__media" aria-hidden="true"><source srcset="../assets/images/hero_bg-720.webp 720w, ../assets/images/hero_bg-900.webp 900w, ../assets/images/hero_bg.webp 1376w" sizes="100vw" type="image/webp"><img src="../assets/images/hero_bg.jpg" width="1376" height="768" alt="" fetchpriority="high" decoding="async"></picture>
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="container hero__grid">
        <div class="hero__content">
          <h1>${spbLanding.h1} под ключ</h1>
          <p class="hero__subtitle">${spbLanding.subtitle}</p>
          ${offerBenefits('3–5', 'Санкт-Петербург и ЛО')}
          ${offerActions(spbLanding.defaultService, 'registration')}
        </div>
        <div class="form-stack">
          ${spbLeadForm({ id: 'spb-hero-form', title: 'Рассчитать стоимость регистрации', text: 'Оставьте имя и телефон — специалист уточнит тип техники и задачу.', buttonText: 'Бесплатная консультация', formName: 'СПб — форма первого экрана' })}
          <div class="form-quick-contacts"><span>Или свяжитесь напрямую</span>${quickContacts({ modifier: 'quick-contacts--form' })}</div>
        </div>
      </div>
    </section>

    ${trustBlock()}
    <section class="section" id="services">
      <div class="container">
        <div class="section-heading"><h2>Регистрационные действия с самоходной техникой</h2><p>Помогаем владельцам техники из Санкт-Петербурга и Ленинградской области согласовать порядок оформления и зарегистрировать технику под ключ.</p></div>
        <div class="problem-grid">${spbLanding.services.map((service) => `<article class="problem-card"${service.anchor ? ` id="${service.anchor}"` : ''} data-spb-service-card><h3>${service.title}</h3><p>${service.description}</p><a class="text-link" href="#form" data-select-service="${service.service}" data-service-event="${service.event}">Оставить заявку</a></article>`).join('')}</div>
      </div>
    </section>

    <section class="section section--alt" id="vehicles">
      <div class="container two-column">
        <div class="section-heading section-heading--left"><h2>Зарегистрируем разные виды самоходной техники</h2><p>Регистрируем в Гостехнадзоре тракторы, погрузчики, экскаваторы, квадроциклы и другую самоходную технику.</p></div>
        <div class="service-detail__panel"><ul class="check-list service-detail__list--columns">${spbLanding.techTypes.map((item) => `<li>${item}</li>`).join('')}</ul></div>
      </div>
    </section>

    <section class="rules-section" id="region">
      <div class="container rules-layout">
        <div><h2>Работаем по Санкт-Петербургу и Ленинградской области</h2></div>
        <div><p>Принимаем обращения владельцев самоходной техники из Санкт-Петербурга и населённых пунктов Ленинградской области.</p><a class="text-link" href="#form" data-select-service="${spbLanding.defaultService}" data-service-event="registration">Обсудить задачу</a></div>
      </div>
    </section>

    <section class="section" id="process">
      <div class="container">
        <div class="section-heading"><h2>Четыре понятных этапа</h2></div>
        <div class="service-detail__grid">${processSteps.map(([title, text], index) => `<article class="service-detail__panel"><p class="eyebrow">Этап ${index + 1}</p><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
      </div>
    </section>

    <section class="section section--alt" id="cases">
      <div class="container">
        <div class="section-heading"><h2>Регистрационные задачи без лишних шагов</h2><p>Сначала уточним ситуацию и документы, затем согласуем подходящее регистрационное действие.</p></div>
        <div class="two-column">
          <div class="service-detail__panel"><ul class="check-list">${spbLanding.situations.slice(0, 4).map((item) => `<li>${item}</li>`).join('')}</ul></div>
          <div class="service-detail__panel"><ul class="check-list">${spbLanding.situations.slice(4).map((item) => `<li>${item}</li>`).join('')}</ul><a class="text-link" href="#form" data-select-service="${spbLanding.defaultService}" data-service-event="registration">Уточнить порядок оформления</a></div>
        </div>
      </div>
    </section>

    <section class="section" id="faq"><div class="container faq-layout"><div class="section-heading section-heading--left"><h2>Регистрация техники в Санкт-Петербурге и области</h2><p>Ответы основаны на действующих услугах ТехУчёт24. Точный порядок определим при обращении.</p></div>${faqBlock(spbLanding.faq)}</div></section>

    <section class="section lead-section" id="form"><div class="container lead-layout">${spbContactPanel()}${spbLeadForm({ id: 'spb-final-form', title: 'Нужно оформить спецтехнику в Гостехнадзоре?', text: 'Оставьте заявку — поможем с постановкой на учёт, снятием или техосмотром.', buttonText: 'Заказать услугу', formName: 'СПб — повторная форма' })}</div></section>
  </main>
  ${footer('../', {
    homeHref: './',
    description: 'Сопровождение регистрационных действий со спецтехникой в Гостехнадзоре Санкт-Петербурга и Ленинградской области.',
    serviceLinks: [
      ['#registration', 'Постановка на учёт'],
      ['#reregistration', 'Перерегистрация'],
      ['#deregistration', 'Снятие с учёта'],
      ['#inspection', 'Техосмотр'],
      ['#vehicles', 'Виды техники'],
      ['#cases', 'С чем можно обратиться'],
    ],
  })}
  ${simpleCallbackModal('../')}
  ${mobileBar('#form')}
</body>
</html>`;
}

export function servicePage(page) {
  const landing = {
    registration: ['Постановка спецтехники на учёт в Гостехнадзоре Москвы и МО под ключ', 'Берём оформление в Гостехнадзоре на себя и сопровождаем постановку техники на учёт до результата.'],
    deregistration: ['Снятие спецтехники с учёта в Гостехнадзоре Москвы и МО', 'Берём оформление в Гостехнадзоре на себя и сопроводим снятие техники с регистрационного учёта.'],
    inspection: ['Техосмотр самоходной техники в Гостехнадзоре Москвы и МО', 'Поможем подготовить технику и пройти процедуру технического осмотра самоходной техники в Гостехнадзоре.'],
  }[page.key];
  const canonical = `${site.baseUrl}/${page.slug}/`;
  const description = `${page.description} Стоимость от 5 000 ₽, ориентировочный срок 3–5 рабочих дней.`;
  const pageFaq = [
    ['Как проходит работа с Гостехнадзором по этой услуге?', 'Сначала анализируем задачу и исходные данные, затем уточняем порядок обращения в Гостехнадзор и готовим комплект в рамках выбранной услуги.'],
    ['Какие документы потребуются для обращения в Гостехнадзор?', 'Предварительный список указан на странице. Точный комплект зависит от вида техники, региона, истории владения и выбранного регистрационного действия.'],
    ['Нужно ли привозить технику?', 'Нет, услуга может быть оказана без привоза техники на осмотр. Детали зависят от конкретной ситуации.'],
    ['Госпошлины входят в стоимость услуги?', 'Нет. Стоимость сопровождения — от 5 000 ₽. Государственные пошлины оплачиваются отдельно.'],
    ['Сколько стоит услуга?', 'Стоимость начинается от 5 000 ₽. Точная сумма зависит от региона, вида техники, комплекта документов и сложности ситуации.'],
    ['Какой ориентировочный срок?', 'Большинство стандартных действий выполняется в течение 3–5 рабочих дней после получения полного комплекта документов. Срок зависит от региона и графика Гостехнадзора.'],
    ['Можно ли начать дистанционно?', 'Да. Отправьте сведения о технике и имеющиеся документы специалисту для оценки ситуации. Мы согласуем дальнейший порядок обращения в Гостехнадзор.'],
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
      <div class="container">
        <div class="service-hero__grid"><div><h1>${landing?.[0] || page.h1}</h1><p>${landing?.[1] || page.description}</p>${offerBenefits(page.key === 'deregistration' ? '2–5' : '3–5')}${offerActions(page.short, page.key)}</div>
        <div class="service-summary" id="how"><h2>Что входит в работу</h2><ul>${page.works.map((item) => `<li>${item}</li>`).join('')}</ul><p>Точный порядок определяется после анализа ситуации и имеющихся документов.</p></div></div>
      </div>
    </section>
${commercialDetails(page)}
    ${trustBlock()}
    <section class="section"><div class="container two-column"><div><h2>Когда обращаются</h2><ul class="check-list">${page.situations.map((item) => `<li>${item}</li>`).join('')}</ul></div><div id="documents"><h2>Что подготовить</h2><ul class="check-list">${page.docs.map((item) => `<li>${item}</li>`).join('')}</ul><p class="section-note">Точный перечень зависит от вида техники, региона и истории владения.</p></div></div></section>
${serviceExtraSection(page)}
    <section class="section section--alt"><div class="container faq-layout"><div class="section-heading section-heading--left"><h2>Перед началом работы</h2></div>${faqBlock(pageFaq)}</div></section>
    <section class="section lead-section" id="page-form"><div class="container lead-layout">${contactPanel()}${simpleFinalForm({ id: `${page.slug}-lead`, prefix: '../', title: 'Нужно оформить спецтехнику в Гостехнадзоре?', subtitle: 'Оставьте заявку — поможем с постановкой на учёт, снятием или техосмотром.', formName: `Получить консультацию: ${page.short}` })}</div></section>
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
  return `<!DOCTYPE html><html lang="ru"><head>${head({ title: `${title} — ТехУчёт`, description: `${title} сайта ТехУчёт.`, canonical, prefix: '../', schemas: [organizationSchema()] })}</head><body>${header('../')}<main id="main" class="legal"><div class="container legal__inner"><h1>${title}</h1><p class="legal__updated">Редакция от 8 августа 2026 года</p>${isPrivacy ? privacyContent : consentContent}</div></main>${footer('../')}${simpleCallbackModal('../')}${mobileBar('../')}</body></html>`;
}

export function notFoundPage({ nested = false } = {}) {
  const prefix = nested ? '../' : '';
  return `<!DOCTYPE html><html lang="ru"><head>${head({ title: 'Страница не найдена — ТехУчёт', description: 'Запрошенная страница не найдена.', canonical: `${site.baseUrl}/404`, prefix, schemas: [organizationSchema()] })}</head><body>${header(prefix)}<main class="not-found"><div class="container"><h1>Такой страницы нет</h1><p>Вернитесь на главную или свяжитесь с нами — поможем с оформлением самоходной техники.</p><div class="hero__actions"><a class="btn btn--primary" href="${prefix || './'}">На главную</a><a class="btn btn--outline track-phone" href="${site.phoneHref}">${site.phone}</a></div></div></main>${footer(prefix)}${mobileBar(prefix)}</body></html>`;
}
