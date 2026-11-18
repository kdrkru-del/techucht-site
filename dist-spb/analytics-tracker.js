/**
 * TechUchet Privacy-Compliant Behavioral Analytics Tracker
 * Directly sends non-PII visitor events to Supabase Edge Function: track-visitor-event
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://ujrohghrsjrvhrokvfnn.supabase.co/functions/v1/track-visitor-event';
  var PROJECT_ID = '86c7285d-18c3-47a5-aa5f-d80f84b02054'; // ТехУчёт
  var SESSION_STORAGE_KEY = 'tu_sess_id';
  var VISITOR_STORAGE_KEY = 'tu_vis_id';

  // 1. Session and Visitor ID Management
  function getOrCreateId(storage, key, prefix) {
    try {
      var val = storage.getItem(key);
      if (!val) {
        val = prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        storage.setItem(key, val);
      }
      return val;
    } catch (e) {
      return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }
  }

  var visitorId = getOrCreateId(localStorage, VISITOR_STORAGE_KEY, 'v');
  var sessionId = getOrCreateId(sessionStorage, SESSION_STORAGE_KEY, 's');

  // 2. Parse attribution parameters from URL / Storage
  function getAttribution() {
    var params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || 'direct',
      medium: params.get('utm_medium') || null,
      campaign_id: params.get('utm_campaign') || null,
      search_query: params.get('utm_term') || null,
      yclid: params.get('yclid') || null,
    };
  }

  var attribution = getAttribution();

  // 3. Dispatch Event to Supabase
  function sendEvent(eventName, eventData) {
    if (!eventName) return;
    eventData = eventData || {};

    // Get Metrika client ID if available
    var metrikaClientId = window.cachedMetrikaClientId || null;
    if (!metrikaClientId && typeof window.ym === 'function') {
      try {
        window.ym(111852031, 'getClientID', function (id) {
          if (id) window.cachedMetrikaClientId = id;
        });
      } catch (err) {}
    }

    var payload = {
      project_id: PROJECT_ID,
      session_id: sessionId,
      visitor_id: visitorId,
      event_name: eventName,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer || null,
      source: attribution.source,
      medium: attribution.medium,
      campaign_id: attribution.campaign_id,
      search_query: attribution.search_query,
      client_id: metrikaClientId,
      event_data: eventData,
      device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    };

    var jsonStr = JSON.stringify(payload);

    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([jsonStr], { type: 'application/json' });
        navigator.sendBeacon(ENDPOINT, blob);
      } else {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr,
          keepalive: true,
        }).catch(function () {});
      }
    } catch (e) {
      // Ignore network errors in tracker
    }
  }

  // Expose global tracker
  window.TechUchetTracker = {
    sendEvent: sendEvent,
    getSessionId: function () { return sessionId; },
    getVisitorId: function () { return visitorId; },
  };

  // 4. Initial page_view
  sendEvent('page_view', {
    title: document.title,
    path: window.location.pathname,
    referrer: document.referrer,
  });

  // 5. Scroll depth tracking (25, 50, 75, 90, 100)
  var trackedScrolls = {};
  var scrollThresholds = [25, 50, 75, 90, 100];

  function checkScroll() {
    var doc = document.documentElement;
    var winHeight = window.innerHeight || doc.clientHeight;
    var docHeight = Math.max(
      document.body.scrollHeight, doc.scrollHeight,
      document.body.offsetHeight, doc.offsetHeight
    );
    var scrollTop = window.pageYOffset || doc.scrollTop;
    var maxScroll = docHeight - winHeight;

    if (maxScroll <= 0) return;
    var percent = Math.min(100, Math.round((scrollTop / maxScroll) * 100));

    scrollThresholds.forEach(function (threshold) {
      if (percent >= threshold && !trackedScrolls[threshold]) {
        trackedScrolls[threshold] = true;
        sendEvent('scroll_depth', { depth: threshold });
      }
    });
  }

  var scrollTimer = null;
  window.addEventListener('scroll', function () {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function () {
      scrollTimer = null;
      checkScroll();
    }, 200);
  }, { passive: true });

  // 6. Form Abandonment & Field Tracking
  function setupForms() {
    var forms = document.querySelectorAll('form, [data-lead-form]');
    forms.forEach(function (form) {
      var formStarted = false;
      var phoneStarted = false;

      // Track form visibility
      if (window.IntersectionObserver) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              sendEvent('form_view', { form_id: form.id || 'lead_form' });
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        observer.observe(form);
      }

      // Track focus on fields (ONLY field name, NO field content)
      form.addEventListener('focusin', function (e) {
        var target = e.target;
        if (!target || !target.name) return;
        var fieldName = target.name.toLowerCase();

        if (!formStarted) {
          formStarted = true;
          sendEvent('form_start', { first_field: fieldName });
        }

        sendEvent('form_field_focus', { field: fieldName });
      });

      // Track phone typing start (NO numbers sent)
      var phoneInput = form.querySelector('input[type="tel"], input[name="phone"]');
      if (phoneInput) {
        phoneInput.addEventListener('input', function () {
          if (!phoneStarted && phoneInput.value.replace(/\D/g, '').length >= 1) {
            phoneStarted = true;
            sendEvent('form_phone_started', { field: 'phone' });
          }
        });
      }

      // Submit attempt
      form.addEventListener('submit', function () {
        sendEvent('form_submit_attempt', { form_id: form.id || 'lead_form' });
      });
    });
  }

  // 7. Click Tracking (tel, whatsapp, telegram, CTA)
  function setupClicks() {
    document.addEventListener('click', function (e) {
      var target = e.target && e.target.closest ? e.target.closest('a, button') : null;
      if (!target) return;

      var href = (target.getAttribute('href') || '').toLowerCase();

      if (href.indexOf('tel:') === 0) {
        sendEvent('phone_click', {});
      } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
        sendEvent('whatsapp_click', {});
      } else if (href.indexOf('t.me') !== -1 || href.indexOf('telegram.org') !== -1) {
        sendEvent('telegram_click', {});
      } else if (target.hasAttribute('data-open-modal') || target.classList.contains('btn-primary')) {
        sendEvent('cta_click', { cta_text: (target.innerText || '').slice(0, 50).trim() });
      }
    }, true);
  }

  // 8. Hook into script.js trackGoal to automatically intercept Metrika reachGoal
  function hookTrackGoal() {
    var origTrackGoal = window.trackGoal;
    window.trackGoal = function (name) {
      // Call original trackGoal to keep Metrika 100% intact
      if (typeof origTrackGoal === 'function') {
        try { origTrackGoal(name); } catch (e) {}
      }

      // Map to behavioral events
      if (name === 'lead_form_success') {
        sendEvent('form_success', { goal: name });
      } else if (name === 'lead_form_error') {
        sendEvent('form_error', { goal: name });
      } else if (name === 'lead_form_start') {
        sendEvent('form_start', { goal: name });
      } else if (name === 'lead_form_open') {
        sendEvent('form_view', { goal: name });
      } else if (name === 'chat_auto_open') {
        sendEvent('chat_auto_open', { goal: name });
      } else if (name === 'chat_manual_open') {
        sendEvent('chat_manual_open', { goal: name });
      } else if (name === 'chat_service_selected') {
        sendEvent('chat_service_selected', { goal: name });
      } else if (name === 'click_phone') {
        sendEvent('phone_click', { goal: name });
      } else if (name === 'click_whatsapp') {
        sendEvent('whatsapp_click', { goal: name });
      } else if (name === 'click_telegram') {
        sendEvent('telegram_click', { goal: name });
      }
    };
  }

  // 9. Exit intent detection
  var exitIntentTracked = false;
  document.addEventListener('mouseleave', function (e) {
    if (!exitIntentTracked && e.clientY <= 0) {
      exitIntentTracked = true;
      sendEvent('exit_intent', {});
    }
  });

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setupForms();
      setupClicks();
      hookTrackGoal();
    });
  } else {
    setupForms();
    setupClicks();
    hookTrackGoal();
  }
})();
