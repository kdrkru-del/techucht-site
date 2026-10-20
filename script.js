(() => {
  'use strict';

  const CONFIG = window.TECHUCHET_CONFIG || {};
  const METRIKA_ID = String(CONFIG.YANDEX_METRIKA_ID || '').trim();
  const ATTRIBUTION_KEY = 'techuchet_attribution';
  const GOALS = {
    registration: 'service_registration',
    deregistration: 'service_deregistration',
    restore_psm: 'service_restore_psm',
    restore_sts: 'service_restore_sts',
    inspection: 'service_inspection',
    complex_case: 'service_complex_case',
  };
  const SERVICE_BY_PATH = {
    '/spb/': 'Регистрация спецтехники — Санкт-Петербург и Ленинградская область',
    '/registraciya/': 'Постановка на учёт',
    '/snyatie-s-ucheta/': 'Снятие с учёта',
    '/vosstanovlenie-psm/': 'Восстановление ПСМ',
    '/vosstanovlenie-sts/': 'Восстановление СТС',
    '/tehosmotr/': 'Технический осмотр',
    '/slozhnye-sluchai/': 'Отказ или сложная ситуация',
  };
  const currentPath = window.location.pathname.replace(/index\.html$/, '');
  const pageService = Object.entries(SERVICE_BY_PATH).find(([path]) => currentPath.endsWith(path))?.[1];
  let selectedService = pageService || 'Консультация';
  let cachedMetrikaClientId = '';

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
    initWebvisorPrivacy();
    initMetrika();
    primeMetrikaClientId();
    initContacts();
    initCurrentYear();
    initMenu();
    initModal();
    initRegions();
    initPhoneMasks();
    initHeroForm();
    initLeadForms();
    initAbandonedCapture();
    initFaq();
    initDocumentsTool();
    initServiceSelection();
    initClickTracking();
    initChatWidget();
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
      window.setTimeout(() => dialog?.querySelector('input[name="name"]')?.focus(), 0);
    };
    const close = () => {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
    document.querySelectorAll('[data-modal-open]').forEach((button) => button.addEventListener('click', () => {
      const isOrder = button.dataset.leadIntent === 'order';
      selectedService = button.dataset.selectService || pageService || 'Консультация';
      const form = modal.querySelector('form');
      modal.querySelector('#callback-title').textContent = isOrder ? 'Заказать услугу' : 'Бесплатная консультация';
      const desc = modal.querySelector('[data-modal-description]');
      if (desc) {
        desc.textContent = isOrder
          ? 'Оставьте номер — специалист уточнит задачу и стоимость оформления.'
          : 'Есть вопрос по постановке, снятию или техосмотру? Оставьте номер — специалист свяжется с вами.';
      }
      const channel = modal.querySelector('[data-document-channel]');
      if (channel) channel.hidden = true;
      form.dataset.selectedService = selectedService;
      form.dataset.formName = isOrder ? `Заказ услуги: ${selectedService}` : 'Бесплатная консультация';
      form.querySelector('[type="submit"]').textContent = isOrder ? 'Заказать услугу' : 'Получить консультацию';
      open();
    }));
    modal.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) close();
      if (event.key === 'Tab' && !modal.hidden) {
        const items = [...dialog.querySelectorAll('a[href], button, input, textarea, select')].filter(el => !el.disabled && el.tabIndex !== -1 && el.getClientRects().length);
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
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
    function formatPhone(val) {
      let digits = val.replace(/\D/g, '');
      if (!digits.length) return '';
      if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
      else if (!digits.startsWith('7')) digits = `7${digits}`;
      digits = digits.slice(0, 11);

      let res = '+7 (';
      if (digits.length > 1) res += digits.slice(1, Math.min(4, digits.length));
      if (digits.length >= 4) res += `) ${digits.slice(4, Math.min(7, digits.length))}`;
      if (digits.length >= 7) res += `-${digits.slice(7, Math.min(9, digits.length))}`;
      if (digits.length >= 9) res += `-${digits.slice(9, 11)}`;
      return res;
    }

    document.querySelectorAll('input[type="tel"]').forEach((input) => {
      input.addEventListener('focus', () => {
        if (!input.value || input.value.trim() === '') {
          input.value = '+7 (';
          setTimeout(() => {
            input.setSelectionRange(input.value.length, input.value.length);
          }, 0);
        }
      });

      input.addEventListener('input', (e) => {
        const cur = input.value;
        const digits = cur.replace(/\D/g, '');
        if (!digits || (digits === '7' && cur.length <= 4)) {
          if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
            input.value = '';
            return;
          }
        }
        input.value = formatPhone(cur);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length <= 4) {
          input.value = '';
        }
      });

      input.addEventListener('blur', () => {
        const digits = input.value.replace(/\D/g, '');
        if (digits.length <= 1) {
          input.value = '';
        }
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
      form.addEventListener('input', () => {
        if (form.dataset.formName === 'Chat callback widget' || form.dataset.formName === 'Callback widget') {
          // micro-event handled inside chat flow
        } else {
          trackGoal('lead_form_start');
        }
      }, { once: true });
      form.addEventListener('submit', (event) => submitLead(event, form));

      const consent = form.querySelector('input[name="consent"]');
      if (consent) {
        consent.addEventListener('change', () => {
          if (consent.checked) {
            consent.closest('.consent')?.classList.remove('is-invalid');
          }
        });
      }
    });
  }

  function normalizePhone(raw) {
    let digits = String(raw || '').replace(/\D/g, '');
    if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
    if (!digits.startsWith('7') && digits.length === 10) digits = `7${digits}`;
    return digits.length === 11 ? `+${digits}` : '';
  }

  function initAbandonedCapture() {
    document.querySelectorAll('[data-lead-form]').forEach((form) => {
      const phoneInput = form.querySelector('input[name="phone"], input[type="tel"]');
      const nameInput = form.querySelector('input[name="name"]');
      if (!phoneInput) return;

      let abandonedTimer = null;

      const scheduleSend = (delayMs) => {
        if (form.dataset.submitting === 'true' || form.dataset.submitted === 'true') return;
        const norm = normalizePhone(phoneInput.value);
        if (!norm) return;
        if (sessionStorage.getItem(`tehuchet_abandoned_${norm}`)) return;

        if (abandonedTimer) clearTimeout(abandonedTimer);
        abandonedTimer = setTimeout(() => {
          sendAbandoned(norm);
        }, delayMs);
      };

      const sendAbandoned = async (norm) => {
        if (form.dataset.submitting === 'true' || form.dataset.submitted === 'true') return;
        if (sessionStorage.getItem(`tehuchet_abandoned_${norm}`)) return;
        try { sessionStorage.setItem(`tehuchet_abandoned_${norm}`, '1'); } catch { /* Storage disabled */ }

        const attribution = getAttribution();
        const clientId = await getMetrikaClientId();
        const service = form.dataset.selectedService || selectedService || 'Консультация';
        const nameVal = nameInput ? nameInput.value.trim() : '';

        const payload = {
          service,
          phone: norm,
          name: nameVal,
          source: 'tehuchet24.ru',
          page: window.location.href,
          page_url: window.location.href,
          page_title: document.title,
          entry_page: document.referrer || '',
          landing_url: attribution.landing_url || window.location.href,
          form_name: `${form.dataset.formName || 'Форма'} (Брошенный ввод)`,
          abandoned: true,
          fields: {
            phone: norm,
            name: nameVal,
            service,
            comment: '⚠️ Внимание: клиент ввёл номер на сайте ТехУчёт, но не завершил отправку (брошенный ввод)',
          },
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
          date_time: new Date().toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'medium' }),
          created_at: new Date().toISOString(),
        };

        trackGoal('lead_abandoned_captured');

        if (CONFIG.FORM_ENDPOINT) {
          fetch(CONFIG.FORM_ENDPOINT, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch((err) => {
            console.warn('[ТехУчёт] Ошибка отправки брошенного ввода:', err);
          });
        }
      };

      phoneInput.addEventListener('input', () => {
        scheduleSend(15000);
      });

      phoneInput.addEventListener('blur', () => {
        scheduleSend(5000);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          const norm = normalizePhone(phoneInput.value);
          if (norm) sendAbandoned(norm);
        }
      });

      window.addEventListener('pagehide', () => {
        const norm = normalizePhone(phoneInput.value);
        if (norm) sendAbandoned(norm);
      });
    });
  }

  function renderErrorFallback(status, form) {
    if (!status) return;
    const phoneInput = form.querySelector('input[name="phone"]');
    const nameInput = form.querySelector('input[name="name"]');
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const service = form.dataset.selectedService || selectedService || 'Консультация';
    const textMsg = encodeURIComponent(
      `Здравствуйте! Заявка с сайта tehuchet24.ru:\n• Услуга: ${service}${phoneVal ? `\n• Телефон: ${phoneVal}` : ''}${nameVal ? `\n• Имя: ${nameVal}` : ''}`
    );
    const tel = CONFIG.PHONE || '+7 925 757-78-88';
    const telHref = CONFIG.PHONE_HREF || 'tel:+79257577888';
    const waBase = CONFIG.WHATSAPP_URL || 'https://wa.me/79257577888';
    const tgBase = CONFIG.TELEGRAM_URL || 'https://t.me/Romatran';
    const waUrl = `${waBase}${waBase.includes('?') ? '&' : '?'}text=${textMsg}`;
    const tgUrl = `${tgBase}${tgBase.includes('?') ? '&' : '?'}text=${textMsg}`;

    status.innerHTML = `
      <div class="lead-fallback-actions">
        <p class="lead-fallback-title">Не удалось отправить заявку через форму связи. Свяжитесь напрямую в 1 клик — специалист на связи:</p>
        <div class="lead-fallback-buttons">
          <a class="btn-fallback btn-fallback--tel track-phone" href="${telHref}">Позвонить: ${tel}</a>
          <a class="btn-fallback btn-fallback--wa track-whatsapp" href="${waUrl}" target="_blank" rel="noopener">Написать в WhatsApp</a>
          <a class="btn-fallback btn-fallback--tg track-telegram" href="${tgUrl}" target="_blank" rel="noopener">Написать в Telegram</a>
        </div>
      </div>
    `;
    status.classList.remove('is-success');
    status.querySelectorAll('.track-phone').forEach((link) => link.addEventListener('click', () => trackGoal('click_phone')));
    status.querySelectorAll('.track-whatsapp').forEach((link) => link.addEventListener('click', () => trackGoal('click_whatsapp')));
    status.querySelectorAll('.track-telegram').forEach((link) => link.addEventListener('click', () => trackGoal('click_telegram')));
  }

  async function submitLead(event, form) {
    event.preventDefault();

    form.dataset.submitted = 'true';

    if (form.dataset.submitting === 'true') return;

    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');
    const phone = form.querySelector('input[name="phone"]');
    const phoneValid = phone && phone.value.replace(/\D/g, '').length >= 11;
    const consent = form.querySelector('input[name="consent"]');
    const consentValid = consent ? consent.checked : true;

    phone?.classList.toggle('is-invalid', !phoneValid);
    consent?.closest('.consent')?.classList.toggle('is-invalid', !consentValid);

    if (!phoneValid) {
      phone?.focus();
      setStatus(status, 'Укажите корректный номер телефона.', false);
      return;
    }

    if (!consentValid) {
      consent?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      consent?.focus();
      setStatus(status, 'Отметьте согласие на обработку персональных данных.', false);
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus(status, 'Заполните обязательные поля формы.', false);
      return;
    }
    const honeypot = form.querySelector('input[name="_honey"]');
    if (honeypot?.value) {
      setStatus(status, 'Не удалось отправить заявку. Попробуйте ещё раз.', false);
      trackGoal('lead_form_error');
      return;
    }
    form.dataset.submitting = 'true';
    setButtonLoading(button, true);
    setStatus(status, 'Отправляем заявку…', null);

    if (form.dataset.formName === 'Chat callback widget' || form.dataset.formName === 'Callback widget') {
      // Chat callback widget: real conversion goal lead_form_success fires only after successful 200 OK below
    } else {
      trackGoal('lead_form_submit');
    }
    try {
      const payload = await buildPayload(form);
      await sendLead(payload);
      form.reset();
      setStatus(status, 'Заявка отправлена. Специалист свяжется с вами в рабочее время.', true);
      trackGoal('lead_form_success');
      form.dispatchEvent(new CustomEvent('lead:success', { bubbles: true }));
    } catch (error) {
      console.error('[ТехУчёт] Ошибка отправки формы:', error);
      renderErrorFallback(status, form);
      trackGoal('lead_form_error');
    } finally {
      form.dataset.submitting = 'false';
      setButtonLoading(button, false);
    }
  }

  async function buildPayload(form) {
    const payload = Object.fromEntries(new FormData(form).entries());
    const attribution = getAttribution();
    const clientId = await getMetrikaClientId();
    const service = payload.service || form.dataset.selectedService || selectedService || 'Консультация';
    return {
      ...payload,
      service,
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
      landing_url: attribution.landing_url || window.location.href,
      fields: {
        phone: payload.phone || '',
        name: payload.name || '',
        service,
        comment: payload.comment || `Заявка с формы: ${form.dataset.formName || 'Форма сайта'}`,
      },
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
        if (service) {
          selectedService = service;
          document.querySelectorAll('[data-lead-form]').forEach((form) => {
            form.dataset.selectedService = service;
          });
        }
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
        if (!link.hasAttribute('data-modal-open')) trackGoal('lead_form_open');
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
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];
    const hasNewAttribution = keys.some((key) => params.has(key));
    keys.forEach((key) => {
      if (params.get(key)) current[key] = params.get(key);
    });
    if (hasNewAttribution || !current.landing_url) {
      current.landing_url = window.location.href;
      current.captured_at = new Date().toISOString();
    }
    try { sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current)); } catch { /* Storage can be disabled. */ }
  }

  function getAttribution() {
    try { return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || '{}'); } catch { return {}; }
  }

  function initWebvisorPrivacy() {
    document.querySelectorAll('[data-lead-form] input, [data-lead-form] textarea, [data-lead-form] select').forEach((field) => {
      field.classList.add('ym-disable-keys');
    });
  }

  function initMetrika() {
    if (!/^\d+$/.test(METRIKA_ID)) return;
    const guardKey = `__techuchetMetrikaInitialized${METRIKA_ID}`;
    if (window[guardKey]) return;
    window[guardKey] = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${encodeURIComponent(METRIKA_ID)}`;
    document.head.append(script);
    window.ym(Number(METRIKA_ID), 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }

  function trackGoal(name) {
    if (!/^\d+$/.test(METRIKA_ID) || typeof window.ym !== 'function') return;
    window.ym(Number(METRIKA_ID), 'reachGoal', name);
  }

  function requestMetrikaClientId(onValue = () => {}) {
    if (!/^\d+$/.test(METRIKA_ID) || typeof window.ym !== 'function') return;
    window.ym(Number(METRIKA_ID), 'getClientID', (value) => {
      const clientId = String(value || '');
      if (!clientId) return;
      cachedMetrikaClientId = clientId;
      onValue(clientId);
    });
  }

  function primeMetrikaClientId() {
    [0, 250, 750, 1500, 3000].forEach((delay) => {
      window.setTimeout(() => requestMetrikaClientId(), delay);
    });
  }

  function getMetrikaClientId() {
    if (cachedMetrikaClientId) return Promise.resolve(cachedMetrikaClientId);
    return new Promise((resolve) => {
      if (!/^\d+$/.test(METRIKA_ID) || typeof window.ym !== 'function') {
        resolve('');
        return;
      }
      let settled = false;
      let retryTimer;
      let deadlineTimer;
      const finish = (value = '') => {
        if (settled) return;
        settled = true;
        window.clearInterval(retryTimer);
        window.clearTimeout(deadlineTimer);
        resolve(String(value || ''));
      };
      const attempt = () => {
        if (cachedMetrikaClientId) {
          finish(cachedMetrikaClientId);
          return;
        }
        requestMetrikaClientId(finish);
      };
      attempt();
      if (settled) return;
      retryTimer = window.setInterval(attempt, 200);
      deadlineTimer = window.setTimeout(() => finish(cachedMetrikaClientId), 1000);
    });
  }

  function initChatWidget() {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    const launcher = widget.querySelector('[data-chat-launcher]');
    const openBtn = widget.querySelector('[data-chat-open]');
    const dismissBtns = widget.querySelectorAll('[data-chat-dismiss]');
    const minimizeBtns = widget.querySelectorAll('[data-chat-minimize]');
    const backdrop = widget.querySelector('[data-chat-backdrop]');
    const body = widget.querySelector('[data-chat-body]');
    const messagesContainer = widget.querySelector('[data-chat-messages]');
    const typingIndicator = widget.querySelector('[data-chat-typing]');
    const quickRepliesContainer = widget.querySelector('[data-chat-quick-replies]');
    const formBox = widget.querySelector('[data-chat-form-box]');
    const form = formBox?.querySelector('form');
    const phoneInput = form?.querySelector('input[name="phone"]');
    const backBtn = formBox?.querySelector('[data-chat-back]');
    const successBox = widget.querySelector('[data-chat-success]');
    const waSuccessBtn = successBox?.querySelector('[data-chat-wa-success]');
    const inputForm = widget.querySelector('[data-chat-input-form]');
    const textInput = widget.querySelector('[data-chat-input]');

    let dialogueStarted = false;
    let currentService = '';
    let currentServiceKey = '';
    let userQuestion = '';

    const SERVICES = [
      {
        key: 'registration',
        label: 'Поставить технику на учёт',
        serviceName: 'Постановка техники на учёт',
        botReply: 'Хорошо. Поможем с постановкой спецтехники на учёт.',
        waText: 'Здравствуйте! Интересует постановка техники на учёт в Гостехнадзоре.'
      },
      {
        key: 'deregistration',
        label: 'Снять технику с учёта',
        serviceName: 'Снятие техники с учёта',
        botReply: 'Поможем со снятием спецтехники с учёта. Специалист уточнит ситуацию и необходимые документы.',
        waText: 'Здравствуйте! Интересует снятие спецтехники с учёта в Гостехнадзоре.'
      },
      {
        key: 'inspection',
        label: 'Техосмотр',
        serviceName: 'Техосмотр спецтехники',
        botReply: 'Поможем с техосмотром техники. Специалист уточнит вид транспорта и вашу задачу.',
        waText: 'Здравствуйте! Интересует техосмотр спецтехники.'
      },
      {
        key: 'restore',
        label: 'Восстановить ПСМ / СТС',
        serviceName: 'Восстановление ПСМ / СТС',
        botReply: 'Поможем с восстановлением ПСМ или СТС. Специалист уточнит, какой документ утрачен или повреждён.',
        waText: 'Здравствуйте! Интересует восстановление ПСМ или СТС спецтехники.'
      },
      {
        key: 'complex',
        label: 'Сложная ситуация / отказ',
        serviceName: 'Сложная ситуация в Гостехнадзоре',
        botReply: 'Опишите ситуацию в двух словах или оставьте номер — специалист разберётся подробнее.',
        waText: 'Здравствуйте! Нужна помощь в сложной ситуации с Гостехнадзором.'
      },
      {
        key: 'other',
        label: 'Другое',
        serviceName: 'Консультация по спецтехнике',
        botReply: 'Понял вас. Поможем решить вашу задачу по спецтехнике в Гостехнадзоре.',
        waText: 'Здравствуйте! Нужна консультация по спецтехнике в Гостехнадзоре.'
      }
    ];

    const isDismissed = () => {
      try {
        return sessionStorage.getItem('techuchet_chat_dismissed') === 'true';
      } catch {
        return false;
      }
    };

    const isInteracted = () => {
      try {
        return sessionStorage.getItem('techuchet_chat_interacted') === 'true';
      } catch {
        return false;
      }
    };

    if (isDismissed()) {
      widget.classList.add('is-dismissed');
    }

    const scrollToBottom = () => {
      if (!body) return;
      window.requestAnimationFrame(() => {
        body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
      });
    };

    const showTyping = (show) => {
      if (!typingIndicator) return;
      typingIndicator.hidden = !show;
      if (show) scrollToBottom();
    };

    const appendBotMessage = (text) => {
      if (!messagesContainer) return;
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg--bot';
      const bubble = document.createElement('div');
      bubble.className = 'chat-msg__bubble';
      bubble.textContent = text;
      msg.appendChild(bubble);
      messagesContainer.appendChild(msg);
      scrollToBottom();
    };

    const appendUserMessage = (text) => {
      if (!messagesContainer) return;
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg--user';
      const bubble = document.createElement('div');
      bubble.className = 'chat-msg__bubble';
      bubble.textContent = text;
      msg.appendChild(bubble);
      messagesContainer.appendChild(msg);
      scrollToBottom();
    };

    const showQuickReplies = (items) => {
      if (!quickRepliesContainer) return;
      quickRepliesContainer.innerHTML = '';
      items.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-replies__btn';
        btn.textContent = item.text;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          item.onClick();
        });
        quickRepliesContainer.appendChild(btn);
      });
      quickRepliesContainer.hidden = false;
      scrollToBottom();
    };

    const hideQuickReplies = () => {
      if (!quickRepliesContainer) return;
      quickRepliesContainer.hidden = true;
      quickRepliesContainer.innerHTML = '';
    };

    const getWaUrl = (text) => {
      const base = CONFIG.WHATSAPP_URL || 'https://wa.me/79257577888';
      return `${base}?text=${encodeURIComponent(text)}`;
    };

    const startDialogue = () => {
      if (dialogueStarted) return;
      dialogueStarted = true;

      showTyping(true);
      window.setTimeout(() => {
        showTyping(false);
        appendBotMessage('Здравствуйте! Помогу разобраться с оформлением спецтехники в Гостехнадзоре.');

        showTyping(true);
        window.setTimeout(() => {
          showTyping(false);
          appendBotMessage('Какая услуга вас интересует?');
          showQuickReplies(
            SERVICES.map((s) => ({
              text: s.label,
              onClick: () => selectService(s)
            }))
          );
        }, 900);
      }, 600);
    };

    const selectService = (s) => {
      trackGoal('chat_service_selected');
      currentService = s.serviceName;
      currentServiceKey = s.key;
      hideQuickReplies();
      appendUserMessage(s.label);

      showTyping(true);
      window.setTimeout(() => {
        showTyping(false);
        appendBotMessage(s.botReply);

        showTyping(true);
        window.setTimeout(() => {
          showTyping(false);
          appendBotMessage('Хотите, чтобы специалист уточнил детали и назвал стоимость?');
          showContactOptions();
        }, 600);
      }, 600);
    };

    const showContactOptions = () => {
      showQuickReplies([
        { text: 'Да, перезвоните мне', onClick: openCallbackFlow },
        { text: 'Написать в WhatsApp', onClick: openWhatsAppFlow },
        { text: 'Задать вопрос здесь', onClick: openFreeQuestionFlow }
      ]);
    };

    const openCallbackFlow = () => {
      trackGoal('chat_callback_open');
      hideQuickReplies();
      appendUserMessage('Да, перезвоните мне');

      showTyping(true);
      window.setTimeout(() => {
        showTyping(false);
        appendBotMessage('Оставьте номер телефона — специалист ТехУчёт свяжется с вами и ответит на все вопросы.');

        if (form) {
          const serviceInput = form.querySelector('input[name="service"]');
          const commentInput = form.querySelector('input[name="comment"]');
          if (serviceInput) serviceInput.value = currentService || 'Обратный звонок из чата';
          if (commentInput) {
            commentInput.value = userQuestion
              ? `Вопрос клиента: ${userQuestion}`
              : `Заказ звонка по услуге: ${currentService || 'Общая консультация'}`;
          }
        }
        if (formBox) formBox.hidden = false;
        scrollToBottom();
        window.setTimeout(() => phoneInput?.focus(), 150);
      }, 400);
    };

    const openWhatsAppFlow = () => {
      trackGoal('chat_whatsapp_click');
      hideQuickReplies();
      appendUserMessage('Написать в WhatsApp');

      const item = SERVICES.find((s) => s.key === currentServiceKey);
      const waText = item ? item.waText : (userQuestion ? `Здравствуйте! Вопрос: ${userQuestion}` : 'Здравствуйте! Интересует оформление спецтехники в Гостехнадзоре.');
      const waUrl = getWaUrl(waText);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      appendBotMessage('Открываю диалог в WhatsApp. Если понадобится обратный звонок — нажмите кнопку ниже:');
      showQuickReplies([
        { text: 'Заказать звонок по телефону', onClick: openCallbackFlow }
      ]);
    };

    const openFreeQuestionFlow = () => {
      hideQuickReplies();
      appendUserMessage('Хочу задать вопрос здесь');
      appendBotMessage('Напишите ваш вопрос в строке внизу — мы передадим его специалисту.');
      window.setTimeout(() => textInput?.focus(), 100);
    };

    const handleTextInputSubmit = (e) => {
      e?.preventDefault();
      const q = textInput?.value.trim();
      if (!q) return;
      userQuestion = q;
      if (textInput) textInput.value = '';
      appendUserMessage(q);

      showTyping(true);
      window.setTimeout(() => {
        showTyping(false);
        appendBotMessage('Спасибо! Чтобы специалист мог ответить на ваш вопрос, оставьте номер телефона или напишите нам в WhatsApp.');
        showQuickReplies([
          { text: 'Оставить номер телефона', onClick: openCallbackFlow },
          { text: 'Написать в WhatsApp', onClick: openWhatsAppFlow }
        ]);
      }, 600);
    };

    inputForm?.addEventListener('submit', handleTextInputSubmit);

    backBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (formBox) formBox.hidden = true;
      showContactOptions();
    });

    form?.addEventListener('lead:success', () => {
      if (formBox) formBox.hidden = true;
      if (successBox) {
        successBox.hidden = false;
        if (waSuccessBtn) {
          const item = SERVICES.find((s) => s.key === currentServiceKey);
          const waText = item ? item.waText : (userQuestion ? `Здравствуйте! Вопрос из чата: ${userQuestion}` : 'Здравствуйте! Заявка из чата на сайте.');
          waSuccessBtn.href = getWaUrl(waText);
        }
      }
      scrollToBottom();
    });

    const openChat = (isAuto = false) => {
      widget.classList.remove('is-dismissed');
      widget.classList.add('is-open');
      try {
        sessionStorage.setItem('techuchet_chat_interacted', 'true');
      } catch {
        /* storage disabled */
      }
      if (isAuto) {
        trackGoal('chat_auto_open');
      } else {
        trackGoal('chat_manual_open');
      }

      if (!dialogueStarted) {
        startDialogue();
      } else {
        scrollToBottom();
      }
    };

    const minimizeChat = () => {
      widget.classList.remove('is-open');
      openBtn?.focus();
    };

    const dismissChat = () => {
      widget.classList.remove('is-open');
      widget.classList.add('is-dismissed');
      try {
        sessionStorage.setItem('techuchet_chat_dismissed', 'true');
      } catch {
        /* storage disabled */
      }
    };

    openBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      openChat(false);
    });

    minimizeBtns.forEach((btn) => btn.addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeChat();
    }));

    dismissBtns.forEach((btn) => btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissChat();
    }));

    backdrop?.addEventListener('click', minimizeChat);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && widget.classList.contains('is-open')) {
        minimizeChat();
      }
    });

    // Auto-open logic
    let formInteracted = false;
    const markFormInteraction = () => {
      formInteracted = true;
    };

    document.querySelectorAll('.lead-section input, .lead-section textarea, #callback-modal input').forEach((el) => {
      el.addEventListener('focus', markFormInteraction, { once: true });
      el.addEventListener('input', markFormInteraction, { once: true });
    });

    const isMobile = window.innerWidth <= 640;
    if (!isDismissed() && !isInteracted()) {
      window.setTimeout(() => {
        if (isDismissed() || isInteracted() || formInteracted) return;
        if (document.querySelector('.modal.is-open')) return;

        if (isMobile) {
          return;
        }

        openChat(true);
      }, 5000);
    }
  }
})();

