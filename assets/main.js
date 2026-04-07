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
