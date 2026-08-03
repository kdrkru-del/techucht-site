/* =============================================
   ТехУчёт — JavaScript
   ============================================= */

'use strict';

// ======== DOM Ready ========
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroAnimateIn();
  initCounters();
  initScrollReveal();
  initPhoneMask();
  initSelectDetect();
  initRegions();
  initGeoDetect();
  initSmoothScroll();
});

// ======================================================
// 1. HEADER — sticky + transparent
// ======================================================
function initHeader() {
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ======================================================
// 2. MOBILE MENU
// ======================================================
function toggleMenu() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('burger-btn');
  nav.classList.toggle('open');
  btn.classList.toggle('active');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('burger-btn');
  nav.classList.remove('open');
  btn.classList.remove('active');
  document.body.style.overflow = '';
}

// ======================================================
// 3. MODAL
// ======================================================
function openModal() {
  document.getElementById('callbackModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('callbackModal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e) {
  if (e.target.id === 'callbackModal') closeModal();
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ======================================================
// 4. HERO ANIMATE-IN
// ======================================================
function initHeroAnimateIn() {
  const els = document.querySelectorAll('.animate-in');
  els.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay + 200);
  });
}

// ======================================================


// ======================================================
// 7. COUNTERS ANIMATION
// ======================================================
function initCounters() {
  const cards = document.querySelectorAll('.stat-card');
  let animated = false;

  const animate = () => {
    if (animated) return;
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        animated = true;
        cards.forEach(c => animateCounter(c));
      }
    });
  };

  window.addEventListener('scroll', animate, { passive: true });
  animate();
}

function animateCounter(card) {
  const el = card.querySelector('.counter');
  if (!el) return;
  const target = parseInt(card.dataset.count || '0');
  const duration = 2000;
  const start = performance.now();

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('ru-RU');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('ru-RU');
  };
  requestAnimationFrame(step);
}

// ======================================================
// 8. SCROLL REVEAL
// ======================================================
function initScrollReveal() {
  const els = document.querySelectorAll(
    '.service-card, .step, .stat-card, .pricing-card, .faq-item, .contact-item, .footer__col'
  );

  els.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), idx * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

// ======================================================
// 9. PHONE MASK
// ======================================================
function initPhoneMask() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', function () {
      let val = this.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (val.startsWith('7')) {
        val = val.slice(0, 11);
        let res = '+7';
        if (val.length > 1) res += ' (' + val.slice(1, 4);
        if (val.length >= 4) res += ') ' + val.slice(4, 7);
        if (val.length >= 7) res += '-' + val.slice(7, 9);
        if (val.length >= 9) res += '-' + val.slice(9, 11);
        this.value = res;
      } else if (val.length > 0) {
        this.value = '+' + val;
      }
    });
  });
}

// ======================================================
// 10. SELECT VALUE DETECT (for label float)
// ======================================================
function initSelectDetect() {
  document.querySelectorAll('.form-select').forEach(sel => {
    sel.addEventListener('change', function () {
      this.classList.toggle('has-value', this.value !== '');
    });
  });
}

// ======================================================
// 11. REGIONS LIST
// ======================================================
const REGIONS = [
  'Республика Адыгея','Республика Алтай','Республика Башкортостан',
  'Республика Бурятия','Республика Дагестан','Республика Ингушетия',
  'Кабардино-Балкарская Республика','Республика Калмыкия','Карачаево-Черкесская Республика',
  'Республика Карелия','Республика Коми','Республика Крым',
  'Республика Марий Эл','Республика Мордовия','Республика Саха (Якутия)',
  'Республика Северная Осетия — Алания','Республика Татарстан','Республика Тыва',
  'Удмуртская Республика','Республика Хакасия','Чеченская Республика',
  'Чувашская Республика','Алтайский край','Забайкальский край',
  'Камчатский край','Краснодарский край','Красноярский край',
  'Пермский край','Приморский край','Ставропольский край',
  'Хабаровский край','Амурская область','Архангельская область',
  'Астраханская область','Белгородская область','Брянская область',
  'Владимирская область','Волгоградская область','Вологодская область',
  'Воронежская область','Ивановская область','Иркутская область',
  'Калининградская область','Калужская область','Кемеровская область',
  'Кировская область','Костромская область','Курганская область',
  'Курская область','Ленинградская область','Липецкая область',
  'Магаданская область','Московская область','Мурманская область',
  'Нижегородская область','Новгородская область','Новосибирская область',
  'Омская область','Оренбургская область','Орловская область',
  'Пензенская область','Псковская область','Ростовская область',
  'Рязанская область','Самарская область','Саратовская область',
  'Сахалинская область','Свердловская область','Смоленская область',
  'Тамбовская область','Тверская область','Томская область',
  'Тульская область','Тюменская область','Ульяновская область',
  'Челябинская область','Ярославская область','г. Москва',
  'г. Санкт-Петербург','г. Севастополь','Еврейская автономная область',
  'Ненецкий автономный округ','Ханты-Мансийский автономный округ — Югра',
  'Чукотский автономный округ','Ямало-Ненецкий автономный округ'
];

function initRegions() {
  const selects = document.querySelectorAll('select[name="region"]');
  selects.forEach(sel => {
    REGIONS.forEach(region => {
      const opt = document.createElement('option');
      opt.value = region;
      opt.textContent = region;
      sel.appendChild(opt);
    });
  });
}

// ======================================================
// 12. GEO DETECTION
// ======================================================
function initGeoDetect() {
  // Try to detect region via free IP API
  fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
    .then(r => r.json())
    .then(data => {
      if (data && data.region) {
        // Try to match region
        const detected = data.region;
        const city = data.city || '';

        document.querySelectorAll('select[name="region"]').forEach(sel => {
          const opts = Array.from(sel.options);
          const match = opts.find(o =>
            o.value.toLowerCase().includes(detected.toLowerCase()) ||
            detected.toLowerCase().includes(o.value.toLowerCase().replace(/республика |область |край |г\. /gi, ''))
          );
          if (match) {
            sel.value = match.value;
            sel.classList.add('has-value');
          }
        });

        document.querySelectorAll('input[name="city"]').forEach(inp => {
          if (city && !inp.value) inp.value = city;
        });
      }
    })
    .catch(() => { /* silent fail */ });
}

// ======================================================
// 13. FAQ ACCORDION
// ======================================================
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  document.querySelectorAll('.faq-item__question').forEach(b => b.setAttribute('aria-expanded', 'false'));

  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// ======================================================
// 14. FORM SUBMIT
// ======================================================
function submitForm(e, formId) {
  e.preventDefault();
  const form = document.getElementById(formId);
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  // Loading state
  btn.disabled = true;
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:spin 1s linear infinite"><path d="M9 2a7 7 0 010 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> Отправляем...`;

  // Collect data
  const data = new FormData(form);
  const payload = {};
  data.forEach((v, k) => payload[k] = v);

  console.log('[ТехУчёт] Заявка:', payload);

  // Simulate send (replace with real endpoint)
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = originalText;
    form.reset();
    document.querySelectorAll('.form-select').forEach(s => s.classList.remove('has-value'));

    if (formId === 'callbackForm') closeModal();

    showToast();
  }, 1200);
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ======================================================
// 15. SMOOTH SCROLL
// ======================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// CSS keyframe for spinner
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);
