/* ─────────────────────────────────────────────
   INNERLICHT.CH · main.js
   - Ambient light canvas
   - Floating particles
   - Scroll/load reveal
   - Email notify form
───────────────────────────────────────────── */

'use strict';

/* ── Ambient Light Canvas ─────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('light-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, tick = 0;

  const orbs = [
    { xRatio: 0.15, yRatio: 0.25, r: 0.45, color: 'rgba(198,122,74,0.10)',  speed: 0.0004, phase: 0 },
    { xRatio: 0.78, yRatio: 0.6,  r: 0.38, color: 'rgba(138,154,123,0.08)', speed: 0.0006, phase: 1.2 },
    { xRatio: 0.5,  yRatio: 0.85, r: 0.30, color: 'rgba(158,92,52,0.06)',   speed: 0.0005, phase: 2.4 },
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    orbs.forEach(orb => {
      const drift = Math.sin(tick * orb.speed + orb.phase) * 0.06;
      const x = (orb.xRatio + drift) * W;
      const y = (orb.yRatio + drift * 0.5) * H;
      const r = orb.r * Math.min(W, H);

      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, orb.color);
      g.addColorStop(1, 'transparent');

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


/* ── Floating Particles ───────────────────── */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = 22;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 2.5 + 1;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      --dur: ${6 + Math.random() * 10}s;
      --delay: ${Math.random() * 12}s;
      opacity: 0;
    `;

    container.appendChild(p);
  }
})();


/* ── Reveal on Load / Scroll ──────────────── */
(function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  // Stagger delays
  items.forEach((el, i) => {
    el.style.transitionDelay = `${0.2 + i * 0.15}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  items.forEach(el => observer.observe(el));
})();



