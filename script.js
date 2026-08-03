/* =============================================
   ТехУчёт — JavaScript
   ============================================= */

'use strict';

// ======== DOM Ready ========
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroAnimateIn();
  initCanvas();
  initParticles();
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
// 5. CANVAS ANIMATION — Excavator Scene
// ======================================================
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let time = 0;
  let rafId;
  let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Stars/particles in background
  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.5 + 0.3,
    a: Math.random()
  }));

  // Ground line Y
  const groundY = () => H * 0.72;

  // ---- Draw sky gradient ----
  function drawSky() {
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#050912');
    grd.addColorStop(0.5, '#0a1428');
    grd.addColorStop(0.72, '#0d1a30');
    grd.addColorStop(1, '#101820');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // ---- Draw stars ----
  function drawStars() {
    stars.forEach(s => {
      const tw = Math.sin(time * 0.5 + s.x * 10) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H * 0.7, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${s.a * tw * 0.6})`;
      ctx.fill();
    });
  }

  // ---- Draw distant city silhouette ----
  function drawCitySilhouette() {
    const gY = groundY();
    ctx.fillStyle = 'rgba(10,20,35,0.9)';

    const buildings = [
      [0.05, 0.12, 0.06, 0.2],
      [0.09, 0.18, 0.04, 0.14],
      [0.12, 0.10, 0.07, 0.22],
      [0.18, 0.16, 0.05, 0.16],
      [0.22, 0.08, 0.04, 0.24],
      [0.78, 0.10, 0.06, 0.22],
      [0.83, 0.16, 0.04, 0.16],
      [0.86, 0.08, 0.07, 0.24],
      [0.92, 0.13, 0.05, 0.19],
      [0.95, 0.07, 0.05, 0.25],
    ];

    buildings.forEach(([x, ht, w, base]) => {
      ctx.fillRect(x * W, gY - ht * H, w * W, ht * H + 2);
    });
  }

  // ---- Draw ground ----
  function drawGround() {
    const gY = groundY();
    const grd = ctx.createLinearGradient(0, gY, 0, H);
    grd.addColorStop(0, '#1a2535');
    grd.addColorStop(0.3, '#141e2e');
    grd.addColorStop(1, '#0a1020');
    ctx.fillStyle = grd;
    ctx.fillRect(0, gY, W, H - gY);

    // Ground line
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.lineTo(W, gY);
    ctx.strokeStyle = 'rgba(245,166,35,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ---- Draw moonrise / ambient glow ----
  function drawGlow() {
    const grd = ctx.createRadialGradient(W * 0.75, H * 0.35, 0, W * 0.75, H * 0.35, W * 0.4);
    const brightness = (Math.sin(time * 0.3) * 0.015 + 0.045);
    grd.addColorStop(0, `rgba(245,166,35,${brightness})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // ---- Excavator ----
  function drawExcavator(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Shadow under machine
    ctx.beginPath();
    ctx.ellipse(0, 40, 120, 18, 0, 0, Math.PI * 2);
    const shadowGrd = ctx.createRadialGradient(0, 40, 0, 0, 40, 120);
    shadowGrd.addColorStop(0, 'rgba(0,0,0,0.5)');
    shadowGrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrd;
    ctx.fill();

    // --- TRACKS ---
    ctx.fillStyle = '#1a2030';
    // Left track
    roundRect(ctx, -95, 18, 80, 24, 8);
    ctx.fill();
    // Right track
    roundRect(ctx, 15, 18, 80, 24, 8);
    ctx.fill();

    // Track links
    ctx.strokeStyle = '#2a3048';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(-95 + i * 10 + (time * 20 % 10), 18);
      ctx.lineTo(-95 + i * 10 + (time * 20 % 10), 42);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15 + i * 10 + (time * 20 % 10), 18);
      ctx.lineTo(15 + i * 10 + (time * 20 % 10), 42);
      ctx.stroke();
    }

    // Track wheels
    [-75, -55, 65, 85].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, 30, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#252d45';
      ctx.fill();
      ctx.strokeStyle = '#3a4560';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // --- MAIN BODY ---
    ctx.fillStyle = '#F5A623';
    roundRect(ctx, -80, -10, 160, 32, 6);
    ctx.fill();

    // Body detail lines
    ctx.strokeStyle = '#D4891A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-60, -10);
    ctx.lineTo(-60, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60, -10);
    ctx.lineTo(60, 22);
    ctx.stroke();

    // --- CAB ---
    ctx.fillStyle = '#E8941C';
    roundRect(ctx, 30, -52, 60, 44, 6);
    ctx.fill();

    // Cab windows
    ctx.fillStyle = 'rgba(100,180,255,0.25)';
    roundRect(ctx, 36, -46, 25, 20, 3);
    ctx.fill();
    roundRect(ctx, 63, -46, 20, 16, 3);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100,180,255,0.15)';
    ctx.lineWidth = 1;
    roundRect(ctx, 36, -46, 25, 20, 3);
    ctx.stroke();

    // Cab light reflection
    const lightPulse = (Math.sin(time * 2) * 0.1 + 0.15);
    ctx.fillStyle = `rgba(255,220,100,${lightPulse})`;
    roundRect(ctx, 37, -45, 8, 5, 2);
    ctx.fill();

    ctx.restore();
  }

  // ---- Excavator ARM ----
  function drawExcavatorArm(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Arm movement
    const boomAngle = -0.9 + Math.sin(time * 0.4) * 0.15;
    const stickAngle = 0.8 + Math.sin(time * 0.4 + 1) * 0.2;
    const bucketAngle = -0.6 + Math.sin(time * 0.4 + 2) * 0.15;

    // BOOM origin
    const boomOriginX = 45;
    const boomOriginY = -30;
    const boomLen = 120;

    // BOOM end
    const boomEndX = boomOriginX + Math.cos(boomAngle) * boomLen;
    const boomEndY = boomOriginY + Math.sin(boomAngle) * boomLen;

    // Draw BOOM
    ctx.beginPath();
    ctx.moveTo(boomOriginX, boomOriginY);
    ctx.lineTo(boomEndX, boomEndY);
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.strokeStyle = '#D4891A';
    ctx.lineWidth = 3;
    ctx.stroke();

    // STICK
    const stickLen = 90;
    const stickEndX = boomEndX + Math.cos(boomAngle + stickAngle) * stickLen;
    const stickEndY = boomEndY + Math.sin(boomAngle + stickAngle) * stickLen;

    ctx.beginPath();
    ctx.moveTo(boomEndX, boomEndY);
    ctx.lineTo(stickEndX, stickEndY);
    ctx.strokeStyle = '#E8941C';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.strokeStyle = '#C07820';
    ctx.lineWidth = 2;
    ctx.stroke();

    // BUCKET
    const bucketLen = 30;
    const bucketEndX = stickEndX + Math.cos(boomAngle + stickAngle + bucketAngle) * bucketLen;
    const bucketEndY = stickEndY + Math.sin(boomAngle + stickAngle + bucketAngle) * bucketLen;

    ctx.beginPath();
    ctx.moveTo(stickEndX, stickEndY);
    ctx.lineTo(bucketEndX, bucketEndY);
    ctx.strokeStyle = '#D4891A';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Bucket scoop
    ctx.beginPath();
    ctx.arc(bucketEndX, bucketEndY, 16, boomAngle + stickAngle + bucketAngle - 0.3, boomAngle + stickAngle + bucketAngle + Math.PI * 0.7);
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Bucket teeth
    const toothAngle = boomAngle + stickAngle + bucketAngle;
    for (let i = 0; i < 3; i++) {
      const ta = toothAngle + Math.PI * 0.3 + i * 0.25;
      ctx.beginPath();
      ctx.moveTo(bucketEndX + Math.cos(ta) * 14, bucketEndY + Math.sin(ta) * 14);
      ctx.lineTo(bucketEndX + Math.cos(ta) * 22, bucketEndY + Math.sin(ta) * 22);
      ctx.strokeStyle = '#C07820';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Hydraulic cylinders (simplified)
    ctx.beginPath();
    ctx.moveTo(boomOriginX + 10, boomOriginY);
    ctx.lineTo(boomEndX - 20, boomEndY);
    ctx.strokeStyle = 'rgba(200,140,40,0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  // ---- Helper: rounded rect ----
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ---- Dust particles ----
  const dustParticles = Array.from({ length: 25 }, () => resetDust());
  function resetDust() {
    return {
      x: 0.3 + Math.random() * 0.4,
      y: 0.72 + Math.random() * 0.04,
      r: Math.random() * 6 + 2,
      a: 0,
      vx: (Math.random() - 0.5) * 0.003,
      vy: -Math.random() * 0.003 - 0.001,
      life: 0,
      maxLife: Math.random() * 120 + 60
    };
  }

  function drawDust() {
    dustParticles.forEach((p, i) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.r += 0.05;
      const lifeRatio = p.life / p.maxLife;
      p.a = lifeRatio < 0.3 ? lifeRatio / 0.3 * 0.12 : (1 - lifeRatio) * 0.12;

      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,150,80,${p.a})`;
      ctx.fill();

      if (p.life >= p.maxLife) dustParticles[i] = resetDust();
    });
  }

  // ---- Draw loader machine (background) ----
  function drawLoader(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.4;

    // Body
    ctx.fillStyle = '#E8941C';
    roundRect(ctx, -50, -15, 100, 30, 6);
    ctx.fill();

    // Wheels
    [-35, 35].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, 20, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#1a2030';
      ctx.fill();
      ctx.strokeStyle = '#2a3048';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Tire detail
      ctx.beginPath();
      ctx.arc(wx, 20, 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#3a4560';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Bucket arm angle animation
    const bucketSwing = Math.sin(time * 0.5 + 1) * 0.2 - 0.3;
    ctx.save();
    ctx.translate(-50, -10);
    ctx.rotate(bucketSwing);

    // Lift arms
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-60, -10);
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Bucket
    ctx.fillStyle = '#D4891A';
    roundRect(ctx, -85, -22, 30, 20, 4);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---- Animated grid (ground) ----
  function drawGrid() {
    const gY = groundY();
    const perspective = 1200;
    const horizon = gY;

    ctx.strokeStyle = 'rgba(245,166,35,0.06)';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i < 8; i++) {
      const t = i / 8;
      const y = horizon + t * (H - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Converging lines (perspective)
    const vp = { x: W * 0.5, y: gY };
    const numLines = 12;
    const offset = (time * 15) % (W / numLines);

    for (let i = -2; i < numLines + 2; i++) {
      const baseX = (i / numLines) * W + offset;
      ctx.beginPath();
      ctx.moveTo(vp.x + (baseX - vp.x) * 0.05, vp.y);
      ctx.lineTo(baseX, H);
      ctx.stroke();
    }
  }

  // ---- Main animation loop ----
  function draw() {
    time += 0.016;

    drawSky();
    drawStars();
    drawGlow();
    drawCitySilhouette();
    drawGrid();
    drawGround();
    drawDust();

    // Background loader (left, smaller, faded)
    const loaderX = W * 0.18 + Math.sin(time * 0.15) * 10;
    const loaderY = groundY() + 8;
    drawLoader(loaderX, loaderY, W < 768 ? 0.5 : 0.7);

    // Main excavator
    const excX = W * 0.62;
    const excY = groundY() + 12;
    const excScale = W < 768 ? 0.65 : (W < 1100 ? 0.85 : 1.1);
    drawExcavator(excX, excY, excScale);
    drawExcavatorArm(excX, excY, excScale);

    rafId = requestAnimationFrame(draw);
  }

  if (!reduceMotion) {
    draw();
  } else {
    // Static fallback — just draw once
    time = 2;
    drawSky();
    drawGlow();
    drawCitySilhouette();
    drawGrid();
    drawGround();
    drawExcavator(W * 0.62, groundY() + 12, 1.1);
    drawExcavatorArm(W * 0.62, groundY() + 12, 1.1);
  }
}

// ======================================================
// 6. CSS PARTICLES
// ======================================================
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = window.innerWidth < 768 ? 8 : 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.setProperty('--duration', `${Math.random() * 10 + 6}s`);
    p.style.setProperty('--delay', `${Math.random() * 6}s`);
    p.style.setProperty('--tx', `${(Math.random() - 0.5) * 120}px`);
    p.style.setProperty('--ty', `${-(Math.random() * 120 + 60)}px`);
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${50 + Math.random() * 30}%`;
    p.style.width = p.style.height = `${Math.random() * 4 + 1}px`;
    p.style.opacity = (Math.random() * 0.6 + 0.2).toString();
    container.appendChild(p);
  }
}

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
