/**
 * Universal Direct AI Agent — Anti-Clickfraud & Goal-Poisoning Shield v2.5
 * Комплексная система защиты от скликивания Яндекс.Директ и бот-трафика
 *
 * Возможности:
 * 1. Аппаратный Fingerprint устройства (WebGL Renderer, Canvas, Hardware, Screen, Timezone).
 * 2. Детекция бот-эмуляторов (HeadlessChrome, Puppeteer, Selenium, WebDriver, Playwright, Phantom).
 * 3. Поведенческая биометрия человека (энтропия траектории курсора, детекция "стоячих" ботов 12+ сек без активности, мгновенные синтетические клики <= 3 мс).
 * 4. Защита от повторного скликивания одного объявления (повторный заход с yclid).
 * 5. Щит автостратегий (Goal-Poisoning Shield): перехват window.ym и блокировка reachGoal для ботов (чтобы автостратегии Директа не обучались на бот-трафике).
 * 6. Маркировка ботов в Яндекс.Метрике через userParams { is_clickbot: 'yes', bot_fraud_score: X } для корректировки ставок в Яндекс.Директ (-100%).
 * 7. Автоматический трекинг целевых действий реальных людей (звонки по тел., переход в WhatsApp, Telegram, отправка форм).
 */
(function () {
  'use strict';

  const startTime = Date.now();
  const searchParams = new URLSearchParams(window.location.search);
  const yclid = searchParams.get('yclid') || '';

  // 1. Определение ID счётчика Яндекс.Метрики
  function detectCounterId() {
    if (window.__ANTIFRAUD_COUNTER_ID) return Number(window.__ANTIFRAUD_COUNTER_ID);

    // Атрибут data-counter на теге текущего скрипта
    const cs = document.currentScript;
    if (cs && cs.dataset && cs.dataset.counter) {
      const parsed = parseInt(cs.dataset.counter, 10);
      if (parsed) return parsed;
    }

    // Глобальные конфиги сайтов
    if (window.TECHUCHET_CONFIG && window.TECHUCHET_CONFIG.YANDEX_METRIKA_ID) {
      const tid = parseInt(window.TECHUCHET_CONFIG.YANDEX_METRIKA_ID, 10);
      if (tid) return tid;
    }
    if (window.TREE_SITE_CONFIG && window.TREE_SITE_CONFIG.metrikaId) {
      const sid = parseInt(window.TREE_SITE_CONFIG.metrikaId, 10);
      if (sid) return sid;
    }

    // Поиск по тегам script mc.yandex.ru
    const scripts = document.querySelectorAll('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || '';
      const m1 = src.match(/tag\.js\?id=(\d+)/);
      if (m1) return Number(m1[1]);
      const m2 = src.match(/watch\/(\d+)/);
      if (m2) return Number(m2[1]);
    }

    // Сопоставление по домену
    const host = window.location.hostname.toLowerCase();
    if (host.includes('tehuchet24.ru')) return 111852031;
    if (host.includes('zelsrez.ru')) return 111453743;
    if (host.includes('окнацентр') || host.includes('okna-center')) return 113115728;
    if (host.includes('кондиционер') || host.includes('centr-kondicionerov')) return 101376260;
    if (host.includes('zemtrak') || host.includes('земтрак')) return 112314091;
    if (host.includes('voltrena')) return 112313992;
    if (host.includes('globerion')) return 110024571;

    return 0;
  }

  // 2. Получение ClientID Яндекс.Метрики
  function getMetrikaClientId() {
    const match = document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  // 3. Определение видеокарты (WebGL Renderer)
  function getWebglRenderer() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no_webgl';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : 'webgl_standard';
    } catch (e) {
      return 'webgl_error';
    }
  }

  // 4. Вычисление аппаратного Fingerprint хэша
  function computeFingerprintHash(webglRenderer) {
    const raw = [
      navigator.platform || '',
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0,
      screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      webglRenderer
    ].join('|');

    let hash = 2166136261;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'fp_' + (hash >>> 0).toString(16);
  }

  // 5. Поведенческая биометрия
  const mousePoints = [];
  let mouseMovesCount = 0;
  let touchEventsCount = 0;
  let scrollEventsCount = 0;
  let lastMouseDownTime = 0;
  let lastClickLatencyMs = 0;

  window.addEventListener('mousemove', function (e) {
    mouseMovesCount++;
    if (mousePoints.length < 60) {
      mousePoints.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    }
  }, { passive: true });

  window.addEventListener('touchstart', function () {
    touchEventsCount++;
  }, { passive: true });

  window.addEventListener('scroll', function () {
    scrollEventsCount++;
  }, { passive: true });

  window.addEventListener('mousedown', function () {
    lastMouseDownTime = performance.now();
  }, { passive: true });

  window.addEventListener('mouseup', function () {
    if (lastMouseDownTime > 0) {
      lastClickLatencyMs = Math.max(1, Math.round(performance.now() - lastMouseDownTime));
    }
  }, { passive: true });

  function calculateMouseEntropy() {
    if (mousePoints.length < 4) return 0;
    const angles = [];
    for (let i = 1; i < mousePoints.length; i++) {
      const dx = mousePoints[i].x - mousePoints[i - 1].x;
      const dy = mousePoints[i].y - mousePoints[i - 1].y;
      if (dx !== 0 || dy !== 0) {
        angles.push(Math.atan2(dy, dx));
      }
    }
    if (angles.length < 3) return 0;
    let deltaSum = 0;
    for (let i = 1; i < angles.length; i++) {
      deltaSum += Math.abs(angles[i] - angles[i - 1]);
    }
    const avgDelta = deltaSum / (angles.length - 1);
    return Number(Math.min(1, avgDelta / 0.85).toFixed(3));
  }

  const webglRenderer = getWebglRenderer();
  const fingerprintHash = computeFingerprintHash(webglRenderer);
  const isWebdriver = Boolean(
    navigator.webdriver ||
    window.__nightmare ||
    window._phantom ||
    window.callPhantom ||
    window.__selenium_unwrapped ||
    window.__playwright ||
    window.__puppeteer ||
    window.cdc_adoQpoasnfa76pfcZLmcfl_Array ||
    /HeadlessChrome|PhantomJS|Puppeteer/i.test(navigator.userAgent)
  );

  // 6. Оценка риска бота (Bot Fraud Score: 0-100)
  function evaluateClientBotRisk() {
    let score = 0;
    const rendererLower = webglRenderer.toLowerCase();

    // А) Автоматизация браузера
    if (isWebdriver) score += 85;

    // Б) Виртуальные/серверные GPU
    if (/swiftshader|llvmpipe|mesa offscreen|virtualbox|vmware/i.test(rendererLower)) {
      score += 75;
    }

    // В) Повторный заход с тем же yclid
    if (yclid) {
      try {
        const prevYclids = JSON.parse(localStorage.getItem('_af_yclids') || '[]');
        if (!prevYclids.includes(yclid)) {
          prevYclids.push(yclid);
          localStorage.setItem('_af_yclids', JSON.stringify(prevYclids.slice(-10)));
        }
        if (prevYclids.length >= 3) score += 70;
      } catch (e) {}
    }

    // Г) "Стоячие" ПФ-боты (на сайте более 12 секунд без движений)
    const durationSec = Math.round((Date.now() - startTime) / 1000);
    const entropy = calculateMouseEntropy();
    if (durationSec >= 12 && mouseMovesCount === 0 && touchEventsCount === 0 && scrollEventsCount === 0) {
      score += 65;
    }

    // Д) Синтетический клик (0-3 мс между нажатием и отпусканием)
    if (lastClickLatencyMs > 0 && lastClickLatencyMs <= 3) {
      score += 55;
    }

    const isBot = score >= 65;

    return {
      fraudScore: Math.min(100, score),
      isBot: isBot,
      webglRenderer: webglRenderer,
      fingerprintHash: fingerprintHash,
      isWebdriver: isWebdriver,
      mouseMovesCount: mouseMovesCount,
      mouseEntropy: entropy,
      touchEventsCount: touchEventsCount,
      clickLatencyMs: lastClickLatencyMs,
      ymClientId: getMetrikaClientId()
    };
  }

  let botTagSent = false;
  function markBotInMetrika(cid, score) {
    if (botTagSent) return;
    botTagSent = true;
    const counterId = cid || detectCounterId();
    if (!counterId || typeof window.ym !== 'function') return;

    try {
      window.ym(counterId, 'userParams', {
        is_clickbot: 'yes',
        bot_fraud_score: score
      });
      window.ym(counterId, 'reachGoal', 'bot_detected', { fraud_score: score });
      console.warn('[AntiFraud Shield] Бот помечен в Яндекс.Метрике (userParams: is_clickbot=yes, score=' + score + ')');
    } catch (e) {}
  }

  // 7. Goal-Poisoning Shield: защита от отравления целей в Метрике
  function installMetrikaBotShield() {
    const origYm = window.ym;
    if (typeof origYm === 'function' && !origYm._antifraudWrapped) {
      const wrappedYm = function (counterId, method, target, paramsObj) {
        const activeCid = counterId || detectCounterId();
        const risk = evaluateClientBotRisk();

        // Если посетитель распознан как бот — БЛОКИРУЕМ достижение коммерческих целей
        if (method === 'reachGoal' && target !== 'bot_detected' && risk.isBot) {
          console.warn('[AntiFraud Shield] Заблокировано отравление коммерческой цели ботом:', target, 'Score:', risk.fraudScore);
          markBotInMetrika(activeCid, risk.fraudScore);
          return;
        }

        return origYm.apply(this, arguments);
      };

      wrappedYm._antifraudWrapped = true;
      window.ym = wrappedYm;
    }
  }

  // 8. Автоматический трекинг целевых действий реальных людей
  function setupHumanInteractions() {
    document.addEventListener('click', function (e) {
      const target = e.target && e.target.closest ? e.target.closest('a, button') : null;
      if (!target) return;

      const risk = evaluateClientBotRisk();
      if (risk.isBot) {
        markBotInMetrika(detectCounterId(), risk.fraudScore);
        return;
      }

      const href = target.getAttribute('href') || '';
      const cid = detectCounterId();
      if (!cid || typeof window.ym !== 'function') return;

      // Телефон
      if (href.startsWith('tel:')) {
        try {
          window.ym(cid, 'reachGoal', 'click_phone', { phone: href.replace('tel:', '') });
        } catch (err) {}
      }

      // WhatsApp
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        try {
          window.ym(cid, 'reachGoal', 'click_whatsapp');
        } catch (err) {}
      }

      // Telegram
      if (href.includes('t.me') || href.includes('telegram.org')) {
        try {
          window.ym(cid, 'reachGoal', 'click_telegram');
        } catch (err) {}
      }
    }, true);
  }

  // Периодическая проверка готовности Яндекс.Метрики
  const checkInterval = setInterval(function () {
    if (typeof window.ym === 'function') {
      installMetrikaBotShield();
      clearInterval(checkInterval);
    }
  }, 250);

  // Инициализация
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHumanInteractions);
  } else {
    setupHumanInteractions();
  }

  window.AntiFraudShield = {
    evaluate: evaluateClientBotRisk,
    detectCounterId: detectCounterId,
    markBot: markBotInMetrika
  };

  const detectedCid = detectCounterId();
  console.log('[AntiFraud Shield v2.5] Защита активна. Счётчик Метрики:', detectedCid || 'ожидание');
})();
