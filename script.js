(() => {
  'use strict';

  const CONFIG = window.TECHUCHET_CONFIG || {};
  const METRIKA_ID = String(CONFIG.YANDEX_METRIKA_ID || '').trim();
  const ATTRIBUTION_KEY = 'techuchet_attribution';
  const GOALS = {
    registration: 'service_registration',
    deregistration: 'service_deregistration',
    restore_psm: 'service_restore_psm',
    inspection: 'service_inspection',
    complex_case: 'service_complex_case',
  };

  const REGIONS = [
    'Республика Адыгея', 'Республика Алтай', 'Республика Башкортостан', 'Республика Бурятия',
    'Республика Дагестан', 'Республика Ингушетия', 'Кабардино-Балкарская Республика',
    'Республика Калмыкия', 'Карачаево-Черкесская Республика', 'Республика Карелия',
    'Республика Коми', 'Республика Крым', 'Республика Марий Эл', 'Республика Мордовия',
    'Республика Саха (Якутия)', 'Республика Северная Осетия — Алания', 'Республика Татарстан',
    'Республика Тыва', 'Удмуртская Республика', 'Республика Хакасия', 'Чеченская Республика',
    'Чувашская Республика', 'Алтайский край', 'Забайкальский край', 'Камчатский край',
    'Краснодарский край', 'Красноярский край', 'Пермский край', 'Приморский край',
    'Ставропольский край', 'Хабаровский край', 'Амурская область', 'Архангельская область',
    'Астраханская область', 'Белгородская область', 'Брянская область', 'Владимирская область',
    'Волгоградская область', 'Вологодская область', 'Воронежская область', 'Ивановская область',
    'Иркутская область', 'Калининградская область', 'Калужская область', 'Кемеровская область',
    'Кировская область', 'Костромская область', 'Курганская область', 'Курская область',
    'Ленинградская область', 'Липецкая область', 'Магаданская область', 'Московская область',
    'Мурманская область', 'Нижегородская область', 'Новгородская область', 'Новосибирская область',
    'Омская область', 'Оренбургская область', 'Орловская область', 'Пензенская область',
    'Псковская область', 'Ростовская область', 'Рязанская область', 'Самарская область',
    'Саратовская область', 'Сахалинская область', 'Свердловская область', 'Смоленская область',
    'Тамбовская область', 'Тверская область', 'Томская область', 'Тульская область',
    'Тюменская область', 'Ульяновская область', 'Челябинская область', 'Ярославская область',
    'Москва', 'Санкт-Петербург', 'Севастополь', 'Еврейская автономная область',
    'Ненецкий автономный округ', 'Ханты-Мансийский автономный округ — Югра',
    'Чукотский автономный округ', 'Ямало-Ненецкий автономный округ', 'Другой регион',
  ];

  document.addEventListener('DOMContentLoaded', () => {
    captureAttribution();
    initMetrika();
    initContacts();
    initCurrentYear();
    initMenu();
    initModal();
    initRegions();
    initPhoneMasks();
    initHeroForm();
    initLeadForms();
    initFaq();
    initDocumentsTool();
    initServiceSelection();
    initClickTracking();
  });

  function initContacts() {
    document.querySelectorAll('.track-phone').forEach((link) => {
      if (CONFIG.PHONE_HREF) link.href = CONFIG.PHONE_HREF;
    });
    document.querySelectorAll('.track-whatsapp').forEach((link) => {
      if (CONFIG.WHATSAPP_URL) link.href = CONFIG.WHATSAPP_URL;
    });
    document.querySelectorAll('.track-telegram').forEach((link) => {
      if (CONFIG.TELEGRAM_URL) link.href = CONFIG.TELEGRAM_URL;
    });
    const maxUrl = String(CONFIG.MAX_URL || '').trim();
    document.querySelectorAll('.track-max').forEach((link) => {
      link.setAttribute('aria-label', 'MAX');
      if (maxUrl) {
        link.href = maxUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.classList.remove('is-disabled');
        link.removeAttribute('aria-disabled');
        link.removeAttribute('title');
      } else {
        link.removeAttribute('href');
        link.classList.add('is-disabled');
        link.setAttribute('aria-disabled', 'true');
        link.title = 'Ссылка на MAX будет добавлена после её получения';
      }
    });
    document.querySelectorAll('.track-email').forEach((link) => {
      if (CONFIG.EMAIL) link.href = `mailto:${CONFIG.EMAIL}`;
    });
  }

  function initCurrentYear() {
    document.querySelectorAll('[data-current-year]').forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function initMenu() {
    const button = document.querySelector('[data-menu-button]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) return;
    const close = () => {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Открыть меню');
    };
    button.addEventListener('click', () => {
      const willOpen = menu.hidden;
      menu.hidden = !willOpen;
      button.setAttribute('aria-expanded', String(willOpen));
      button.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  }

  function initModal() {
    const modal = document.querySelector('[data-modal]');
    if (!modal) return;
    const dialog = modal.querySelector('.modal__dialog');
    let previousFocus = null;
    const open = () => {
      previousFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      trackGoal('lead_form_open');
      window.setTimeout(() => dialog?.querySelector('input:not([type="hidden"])')?.focus(), 0);
    };
    const close = () => {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
    document.querySelectorAll('[data-modal-open]').forEach((button) => button.addEventListener('click', open));
    modal.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) close();
    });
    modal.addEventListener('lead:success', close);
  }

  function initRegions() {
    document.querySelectorAll('[data-region-select]').forEach((select) => {
      if (select.options.length > 1) return;
      const fragment = document.createDocumentFragment();
      REGIONS.forEach((region) => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        fragment.append(option);
      });
      select.append(fragment);
    });
  }

  function initPhoneMasks() {
    document.querySelectorAll('input[type="tel"]').forEach((input) => {
      input.addEventListener('input', () => {
        let digits = input.value.replace(/\D/g, '');
        if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
        if (!digits.startsWith('7') && digits.length) digits = `7${digits}`;
        digits = digits.slice(0, 11);
        if (!digits.length) return;
        const parts = ['+7'];
        if (digits.length > 1) parts.push(` (${digits.slice(1, 4)}`);
        if (digits.length >= 4) parts.push(`) ${digits.slice(4, 7)}`);
        if (digits.length >= 7) parts.push(`-${digits.slice(7, 9)}`);
        if (digits.length >= 9) parts.push(`-${digits.slice(9, 11)}`);
        input.value = parts.join('');
      });
    });
  }

  function initHeroForm() {
    const form = document.getElementById('hero-lead');
    if (!form) return;
    const first = form.querySelector('[data-hero-step="1"]');
    const second = form.querySelector('[data-hero-step="2"]');
    const next = form.querySelector('[data-hero-next]');
    const back = form.querySelector('[data-hero-back]');
    const label = form.querySelector('[data-step-label]');
    const error = form.querySelector('[data-step-error]');
    next?.addEventListener('click', () => {
      const service = form.querySelector('input[name="service"]:checked');
      const phone = form.querySelector('input[name="phone"]');
      const validPhone = phone && phone.value.replace(/\D/g, '').length >= 11;
      form.querySelector('.choice-grid')?.classList.toggle('is-invalid', !service);
      phone?.classList.toggle('is-invalid', !validPhone);
      if (!service || !validPhone) {
        error.textContent = 'Выберите услугу и укажите корректный номер телефона.';
        (!service ? form.querySelector('input[name="service"]') : phone)?.focus();
        return;
      }
      error.textContent = '';
      first.hidden = true;
      second.hidden = false;
      label.textContent = 'Шаг 2 из 2';
      trackGoal('quiz_step_1');
      second.querySelector('select, input, textarea')?.focus();
    });
    back?.addEventListener('click', () => {
      second.hidden = true;
      first.hidden = false;
      label.textContent = 'Шаг 1 из 2';
      next?.focus();
    });
    form.addEventListener('lead:success', () => {
      second.hidden = true;
      first.hidden = false;
      label.textContent = 'Шаг 1 из 2';
      trackGoal('quiz_complete');
    });
  }

  function initLeadForms() {
    document.querySelectorAll('[data-lead-form]').forEach((form) => {
      form.addEventListener('input', () => trackGoal('lead_form_start'), { once: true });
      form.addEventListener('submit', (event) => submitLead(event, form));
    });
  }

  async function submitLead(event, form) {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');
    const phone = form.querySelector('input[name="phone"]');
    const phoneValid = phone && phone.value.replace(/\D/g, '').length >= 11;
    phone?.classList.toggle('is-invalid', !phoneValid);
    if (!form.checkValidity() || !phoneValid) {
      form.reportValidity();
      setStatus(status, 'Проверьте обязательные поля и номер телефона.', false);
      return;
    }
    const honeypot = form.querySelector('input[name="_honey"]');
    if (honeypot?.value) {
      setStatus(status, 'Не удалось отправить заявку. Попробуйте ещё раз.', false);
      trackGoal('lead_form_error');
      return;
    }
    setButtonLoading(button, true);
    setStatus(status, 'Отправляем заявку…', null);
    try {
      const payload = await buildPayload(form);
      await sendLead(payload);
      form.reset();
      setStatus(status, 'Заявка отправлена. Специалист свяжется с вами в рабочее время.', true);
      trackGoal('lead_form_success');
      form.dispatchEvent(new CustomEvent('lead:success', { bubbles: true }));
    } catch (error) {
      console.error('[ТехУчёт] Ошибка отправки формы:', error);
      setStatus(status, `Не удалось отправить заявку. Позвоните ${CONFIG.PHONE || '+7 925 757-78-88'} или повторите попытку.`, false);
      trackGoal('lead_form_error');
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function buildPayload(form) {
    const payload = Object.fromEntries(new FormData(form).entries());
    const attribution = getAttribution();
    const clientId = await getMetrikaClientId();
    const service = payload.service || 'Консультация';
    return {
      ...payload,
      _subject: `Новая заявка с сайта ТехУчёт — ${service}`,
      _captcha: 'false',
      _template: 'table',
      date_time: new Date().toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'medium' }),
      created_at: new Date().toISOString(),
      source: 'tehuchet24.ru',
      page: window.location.href,
      entry_page: document.referrer || '',
      form_name: form.dataset.formName || 'Форма сайта',
      page_url: window.location.href,
      page_title: document.title,
      utm: {
        utm_source: attribution.utm_source || '',
        utm_medium: attribution.utm_medium || '',
        utm_campaign: attribution.utm_campaign || '',
        utm_content: attribution.utm_content || '',
        utm_term: attribution.utm_term || '',
        yclid: attribution.yclid || '',
      },
      utm_source: attribution.utm_source || '',
      utm_medium: attribution.utm_medium || '',
      utm_campaign: attribution.utm_campaign || '',
      utm_content: attribution.utm_content || '',
      utm_term: attribution.utm_term || '',
      yclid: attribution.yclid || '',
      client_id: clientId || '',
    };
  }

  async function sendLead(payload) {
    if (!CONFIG.FORM_ENDPOINT) throw new Error('Form endpoint is not configured');
    const response = await fetch(CONFIG.FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let result = null;
    try { result = await response.json(); } catch { result = null; }
    const accepted = result?.ok === true || String(result?.success).toLowerCase() === 'true';
    if (!response.ok || !accepted) throw new Error(result?.message || `HTTP ${response.status}`);
    return result;
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    if (loading) {
      button.dataset.label = button.textContent;
      button.textContent = 'Отправляем…';
      button.disabled = true;
    } else {
      button.textContent = button.dataset.label || button.textContent;
      button.disabled = false;
    }
  }

  function setStatus(node, message, success) {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('is-success', success === true);
  }

  function initFaq() {
    document.querySelectorAll('[data-faq-button]').forEach((button) => {
      button.addEventListener('click', () => {
        const answer = button.closest('.faq-item')?.querySelector('.faq-answer');
        if (!answer) return;
        const opening = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(opening));
        answer.hidden = !opening;
      });
    });
  }

  function initDocumentsTool() {
    const tool = document.querySelector('[data-documents-tool]');
    const lists = CONFIG.DOCUMENT_LISTS;
    if (!tool || !lists) return;
    let owner = 'person';
    let action = 'registration';
    const render = () => {
      const list = tool.querySelector('[data-document-list]');
      const items = lists?.[owner]?.[action] || [];
      list.replaceChildren(...items.map((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
      }));
    };
    tool.querySelectorAll('[data-owner]').forEach((button) => button.addEventListener('click', () => {
      owner = button.dataset.owner;
      tool.querySelectorAll('[data-owner]').forEach((item) => item.classList.toggle('is-active', item === button));
      render();
    }));
    tool.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
      action = button.dataset.action;
      tool.querySelectorAll('[data-action]').forEach((item) => item.classList.toggle('is-active', item === button));
      render();
    }));
  }

  function initServiceSelection() {
    document.querySelectorAll('[data-select-service]').forEach((link) => {
      link.addEventListener('click', () => {
        const service = link.dataset.selectService || '';
        const situation = link.dataset.situation || '';
        document.querySelectorAll('select[name="service"]').forEach((select) => {
          const matching = Array.from(select.options).find((option) => option.value === service);
          if (matching) select.value = service;
        });
        document.querySelectorAll('input[type="radio"][name="service"]').forEach((radio) => {
          radio.checked = radio.value === service;
        });
        if (situation) {
          const comment = document.querySelector('#main-lead textarea[name="comment"]');
          if (comment) comment.value = situation;
        }
        const eventName = GOALS[link.dataset.serviceEvent];
        if (eventName) trackGoal(eventName);
        trackGoal('lead_form_open');
      });
    });
  }

  function initClickTracking() {
    document.querySelectorAll('.track-phone').forEach((link) => link.addEventListener('click', () => trackGoal('click_phone')));
    document.querySelectorAll('.track-whatsapp').forEach((link) => link.addEventListener('click', () => trackGoal('click_whatsapp')));
    document.querySelectorAll('.track-telegram').forEach((link) => link.addEventListener('click', () => trackGoal('click_telegram')));
    document.querySelectorAll('.track-max').forEach((link) => link.addEventListener('click', () => {
      if (link.getAttribute('aria-disabled') !== 'true') trackGoal('click_max');
    }));
    document.querySelectorAll('.track-email').forEach((link) => link.addEventListener('click', () => trackGoal('click_email')));
    document.querySelectorAll('[data-mobile-lead]').forEach((link) => link.addEventListener('click', () => trackGoal('lead_form_open')));
  }

  function captureAttribution() {
    const params = new URLSearchParams(window.location.search);
    const current = getAttribution();
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'].forEach((key) => {
      if (params.get(key)) current[key] = params.get(key);
    });
    try { sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current)); } catch { /* Storage can be disabled. */ }
  }

  function getAttribution() {
    try { return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || '{}'); } catch { return {}; }
  }

  function initMetrika() {
    if (!/^\d+$/.test(METRIKA_ID)) return;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.append(script);
    window.ym(Number(METRIKA_ID), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  }

  function trackGoal(name) {
    if (!/^\d+$/.test(METRIKA_ID) || typeof window.ym !== 'function') return;
    window.ym(Number(METRIKA_ID), 'reachGoal', name);
  }

  function getMetrikaClientId() {
    return new Promise((resolve) => {
      if (!/^\d+$/.test(METRIKA_ID) || typeof window.ym !== 'function') {
        resolve('');
        return;
      }
      let settled = false;
      const finish = (value = '') => {
        if (settled) return;
        settled = true;
        resolve(String(value || ''));
      };
      window.ym(Number(METRIKA_ID), 'getClientID', finish);
      window.setTimeout(() => finish(''), 900);
    });
  }
})();
