/**
 * CRO-Agent Tracker v1.0
 * Сквозной трекер поведения посетителей из Яндекс.Директ:
 * Запрос -> Совпадение с оффером -> Телефон/Контакты -> Форма -> Точка ухода
 */
(function () {
  'use strict';

  const currentScript = document.currentScript || document.querySelector('script[data-site]');
  const siteSlug = (currentScript && currentScript.getAttribute('data-site')) || window.location.hostname || 'okna-center.pro';
  const apiEndpoint = (currentScript && currentScript.getAttribute('data-endpoint')) ||
    window.CRO_AGENT_ENDPOINT ||
    'http://localhost:4200/api/track';

  // Уникальный ID сессии
  const SESSION_KEY = 'cro_agent_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // Чтение UTM и параметров Яндекс.Директ
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source') || (params.get('yclid') ? 'yandex' : 'direct');
  const utmMedium = params.get('utm_medium') || (params.get('yclid') ? 'cpc' : 'organic');
  const utmCampaign = params.get('utm_campaign') || '';
  const utmContent = params.get('utm_content') || '';
  const utmTerm = params.get('utm_term') || params.get('keyword') || '';
  const searchQuery = params.get('search_query') || params.get('q') || params.get('text') || utmTerm || '';
  const yclid = params.get('yclid') || '';

  const startTime = Date.now();
  const PHONE_REGEX = /(?:\+7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/;

  // Состояние текущего визита
  const state = {
    session_id: sessionId,
    project_slug: siteSlug,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
    search_query: searchQuery,
    yclid: yclid,
    landing_page: window.location.pathname + window.location.search,
    page_h1: '',
    device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
    duration_sec: 0,
    max_scroll_pct: 15,
    exit_section: 'Первый экран',
    saw_phone: false,
    phone_view_ms: 0,
    clicked_phone: false,
    unclickable_phone_clicks: 0,
    copied_phone: false,
    saw_contacts: false,
    clicked_messenger: false,
    saw_form: false,
    started_form: false,
    abandoned_field: '',
    submitted_lead: false,
    dead_clicks_count: 0,
    dead_click_targets: []
  };

  // Определение заголовка H1
  function capturePageContext() {
    const h1El = document.querySelector('h1');
    if (h1El && h1El.innerText) {
      state.page_h1 = h1El.innerText.trim().replace(/\s+/g, ' ').slice(0, 180);
    } else {
      state.page_h1 = document.title || 'Главная страница';
    }
  }

  // Вычисление глубины скролла
  function updateScrollDepth() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      1
    );
    const winHeight = window.innerHeight || 1;
    const pct = Math.min(100, Math.round(((scrollTop + winHeight) / docHeight) * 100));
    if (pct > state.max_scroll_pct) {
      state.max_scroll_pct = pct;
    }
  }

  // Наблюдение за ключевыми блоками (телефон, контакты, формы, секции)
  function initObservers() {
    if (!('IntersectionObserver' in window)) return;

    // 1. Наблюдение за телефонами (был ли просмотр телефона глазами > 1.5 сек)
    let phoneEnterTime = 0;
    const phoneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          phoneEnterTime = Date.now();
          setTimeout(() => {
            if (phoneEnterTime > 0) {
              state.saw_phone = true;
              state.phone_view_ms += 1500;
            }
          }, 1500);
        } else if (phoneEnterTime > 0) {
          const delta = Date.now() - phoneEnterTime;
          state.phone_view_ms += delta;
          if (state.phone_view_ms >= 1500) {
            state.saw_phone = true;
          }
          phoneEnterTime = 0;
        }
      });
    }, { threshold: 0.5 });

    // Находим все ссылки tel: и текстовые элементы с номером телефона
    const allElements = document.querySelectorAll('a[href^="tel:"], [data-phone], .phone, .header-phone, span, div, p');
    allElements.forEach((el) => {
      if (
        (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href').startsWith('tel:')) ||
        el.hasAttribute('data-phone') ||
        (el.children.length === 0 && PHONE_REGEX.test(el.textContent || ''))
      ) {
        phoneObserver.observe(el);
      }
    });

    // 2. Наблюдение за секциями страницы, формами и контактами
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const label = el.getAttribute('data-section-name') ||
          (el.querySelector('h1, h2, h3') && el.querySelector('h1, h2, h3').innerText.trim().slice(0, 60)) ||
          el.id ||
          'Секция страницы';

        state.exit_section = label;

        const textLower = (label + ' ' + (el.className || '') + ' ' + (el.id || '')).toLowerCase();
        if (textLower.includes('контакт') || textLower.includes('contact') || textLower.includes('адрес') || el.tagName === 'FOOTER') {
          state.saw_contacts = true;
        }
        if (el.tagName === 'FORM' || el.querySelector('form') || textLower.includes('калькулятор') || textLower.includes('заявк')) {
          state.saw_form = true;
        }
      });
    }, { threshold: 0.35 });

    document.querySelectorAll('header, section, footer, form, [data-section-name]').forEach((sec) => {
      sectionObserver.observe(sec);
    });
  }

  // Слушатель кликов: рабочие телефоны, НЕрабочие телефоны, мессенджеры и "мертвые клики"
  function initClickTracking() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;

      const link = target.closest('a');
      const button = target.closest('button, [role="button"], input[type="submit"], input[type="button"]');
      const text = (target.innerText || target.getAttribute('alt') || target.getAttribute('title') || '').trim();

      // 1. Клик по рабочей ссылке tel:
      if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('tel:')) {
        state.saw_phone = true;
        state.clicked_phone = true;
        sendTelemetry();
        return;
      }

      // 2. Клик по мессенджеру (WhatsApp / Telegram)
      if (link && link.getAttribute('href')) {
        const href = link.getAttribute('href').toLowerCase();
        if (href.includes('wa.me') || href.includes('whatsapp') || href.includes('t.me') || href.includes('telegram')) {
          state.clicked_messenger = true;
          sendTelemetry();
          return;
        }
      }

      // 3. Клик по НЕкликабельному номеру телефона (текст с номером без <a href="tel:">)
      const closestPhoneText = (target.textContent || '').trim();
      if (!link && (PHONE_REGEX.test(closestPhoneText) || target.closest('[data-unclickable-phone]'))) {
        state.saw_phone = true;
        state.unclickable_phone_clicks += 1;
        sendTelemetry();
        return;
      }

      // 4. Детекция "мертвых кликов" (Dead Clicks) — клик по фото, карточке или тексту без действия
      const isInteractive = Boolean(
        link ||
        button ||
        target.closest('input, select, textarea, label, summary, details')
      );

      if (!isInteractive) {
        const img = target.closest('img, .photo-card, .gallery-item, [data-dead-target]');
        if (img || target.tagName === 'IMG' || target.classList.contains('card-image')) {
          state.dead_clicks_count += 1;
          const itemLabel =
            (img && (img.getAttribute('data-dead-target') || img.getAttribute('alt'))) ||
            text.slice(0, 50) ||
            'Фото товара/услуги без ссылки';
          if (!state.dead_click_targets.includes(itemLabel)) {
            state.dead_click_targets.push(itemLabel);
          }
          sendTelemetry();
        }
      }
    }, true);

    // Отслеживание копирования телефона
    document.addEventListener('copy', () => {
      const sel = window.getSelection ? window.getSelection().toString() : '';
      if (PHONE_REGEX.test(sel)) {
        state.saw_phone = true;
        state.copied_phone = true;
        sendTelemetry();
      }
    });
  }

  // Отслеживание работы с формой и калькулятором
  function initFormTracking() {
    document.addEventListener('focusin', (e) => {
      const input = e.target;
      if (!input || !['INPUT', 'TEXTAREA', 'SELECT'].includes(input.tagName)) return;
      state.saw_form = true;
      state.started_form = true;
      const fieldName =
        input.getAttribute('data-field-label') ||
        input.getAttribute('placeholder') ||
        input.getAttribute('name') ||
        'Поле формы';
      if (!state.submitted_lead) {
        state.abandoned_field = fieldName;
      }
    });

    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form) return;
      state.saw_form = true;
      state.started_form = true;
      state.submitted_lead = true;
      state.abandoned_field = '';
      sendTelemetry();
    });
  }

  // Отправка данных на сервер
  function sendTelemetry() {
    state.duration_sec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    updateScrollDepth();

    const payload = JSON.stringify(state);
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(apiEndpoint, blob);
    } else {
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  }

  // Инициализация
  function init() {
    capturePageContext();
    initObservers();
    initClickTracking();
    initFormTracking();
    window.addEventListener('scroll', updateScrollDepth, { passive: true });

    // Отправка каждые 5 секунд и при уходе со страницы
    setInterval(sendTelemetry, 5000);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendTelemetry();
      }
    });
    window.addEventListener('pagehide', sendTelemetry);

    // Первичная регистрация входа
    setTimeout(sendTelemetry, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Публичный API для тестирования и ручной отправки событий
  window.CROAgent = {
    getState: () => ({ ...state }),
    flush: sendTelemetry
  };
})();
