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
  let revealed = false;
  const LIGHT_RADIUS = 70;

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
    if (!hasInteracted) drawFog();
  }

  function drawFog() {
    ctx.globalCompositeOperation = 'source-over';
    // Opaque dark fog — slightly different shade than background for visibility
    ctx.fillStyle = '#18171f';
    ctx.fillRect(0, 0, w, h);
    // Add subtle warm glow at center so it doesn't look like a plain rectangle
    const warm = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
    warm.addColorStop(0, 'rgba(196,160,112,0.04)');
    warm.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, w, h);
    // Soft edges so the fog blends into the page
    const edgeFade = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.55);
    edgeFade.addColorStop(0, 'rgba(0,0,0,0)');
    edgeFade.addColorStop(1, 'rgba(19,18,26,0.5)');
    ctx.fillStyle = edgeFade;
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
    grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, LIGHT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  function dissolveFog() {
    if (revealed) return;
    revealed = true;
    canvas.style.transition = 'opacity 1.2s ease';
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top
    };
  }

  function onMove(e) {
    e.preventDefault();
    const { x, y } = getPos(e);
    revealAt(x, y);
  }

  function onTouchStart(e) {
    e.preventDefault();
    onMove(e);
  }

  function onTouchEnd() {
    // After user lifts finger, dissolve remaining fog so buttons become clickable
    setTimeout(dissolveFog, 400);
  }

  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', () => {
    if (hasInteracted) setTimeout(dissolveFog, 600);
  });

  window.addEventListener('resize', resize);
  resize();
})();
