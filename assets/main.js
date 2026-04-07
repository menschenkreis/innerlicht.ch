/* ─────────────────────────────────────────────
   INNERLICHT.CH · main.js
   - Page navigation
   - Reveal animations
───────────────────────────────────────────── */

'use strict';

(function () {
  // Touch detection
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.documentElement.classList.add('touch-device');
  }

  const pages = document.querySelectorAll('.page');
  const glow  = document.querySelector('.glow');
  const navLinks = document.querySelectorAll('[data-nav]');
  const backBtns = document.querySelectorAll('[data-back]');

  let currentPage = 'page-landing';

  function navigateTo(id) {
    const target = document.getElementById(id);
    if (!target || id === currentPage) return;

    // Fade out current
    pages.forEach(p => p.classList.remove('active'));

    // Landing vs sub-page glow control
    if (id === 'page-landing') {
      glow.classList.remove('dim');
      document.body.style.background = '#13121a';
    } else {
      glow.classList.add('dim');
      document.body.style.background = '#f3ede4';
    }

    // Fade in target
    setTimeout(() => {
      target.classList.add('active');
      target.scrollTop = 0;
      triggerReveals(target);
    }, 80);

    currentPage = id;
    history.pushState({ page: id }, '', '#' + id.replace('page-', ''));
  }

  function navigateBack() {
    history.back();
  }

  // Nav links
  navLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });

  // Back buttons
  backBtns.forEach(btn => {
    btn.addEventListener('click', navigateBack);
  });

  // Browser back
  window.addEventListener('popstate', (e) => {
    const id = (e.state && e.state.page) || 'page-landing';
    const target = document.getElementById(id);
    if (!target) return;

    pages.forEach(p => p.classList.remove('active'));

    if (id === 'page-landing') {
      glow.classList.remove('dim');
      document.body.style.background = '#13121a';
    } else {
      glow.classList.add('dim');
      document.body.style.background = '#f3ede4';
    }

    target.classList.add('active');
    target.scrollTop = 0;
    triggerReveals(target);
    currentPage = id;
  });

  // Handle initial hash
  const hash = location.hash.replace('#', '');
  const map = { connect: 'page-connect', empty: 'page-empty', glossary: 'page-glossary', offer: 'page-offer', about: 'page-about' };
  if (map[hash]) {
    navigateTo(map[hash]);
  } else {
    // Initial reveal on landing
    setTimeout(() => triggerReveals(document.getElementById('page-landing')), 250);
  }
})();

/* ── Reveal ── */
function triggerReveals(container) {
  const items = (container || document).querySelectorAll('[data-reveal]:not(.revealed)');
  items.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.13}s`;
    requestAnimationFrame(() => el.classList.add('revealed'));
  });
}

/* ── Fog Canvas (touch: your finger is the light) ── */
(function () {
  const canvas = document.querySelector('.fog-canvas');
  if (!canvas) return;
  const hint = document.querySelector('.fog-hint');
  const area = document.querySelector('.paths-area');
  if (!area) return;

  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let hasInteracted = false;
  const LIGHT_RADIUS = 80;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = area.getBoundingClientRect();
    w = rect.width + 20;
    h = rect.height + 40;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFog();
  }

  function drawFog() {
    ctx.globalCompositeOperation = 'source-over';
    // Dark fog matching the page background
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, '#1a1922');
    grad.addColorStop(1, '#13121a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  function revealAt(x, y) {
    if (!hasInteracted) {
      hasInteracted = true;
      if (hint) hint.classList.add('hidden');
    }
    ctx.globalCompositeOperation = 'destination-out';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, LIGHT_RADIUS);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, LIGHT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  function onMove(e) {
    e.preventDefault();
    const { x, y } = getPos(e);
    revealAt(x, y);
  }

  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchstart', onMove, { passive: false });
  canvas.addEventListener('mousemove', onMove);

  // Also allow clicks on revealed buttons to pass through
  canvas.addEventListener('click', (e) => {
    const { x, y } = getPos(e);
    revealAt(x, y);
    // Check if fog is cleared enough at this point
    const pixel = ctx.getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data;
    if (pixel[3] < 100) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) el.click();
    }
  });

  window.addEventListener('resize', resize);
  resize();
})();
