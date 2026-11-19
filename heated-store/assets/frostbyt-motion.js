/* ==========================================================================
   Frostbyt Motion
   Cold → warm. The page starts frosted and heats up as you use it.

   1. Heat bar        thin scroll-progress line that goes from ice to ember
   2. Hero thaw       frost vignette melts away on load, headline sharpens
   3. Snowfall        canvas flakes in the hero that melt around the cursor
   4. Warm cursor     soft ember light that follows the pointer (desktop)
   5. Thermal scan    product cards "power on" with a scan line as they appear;
                      on touch screens the card in the middle of the screen heats
   6. Thaw headings   section titles reveal letter by letter, ice → ember → white
   7. Heat preview    picking heating zones flashes the glowing photo
   8. Tilt            product photo tilts toward the pointer (desktop)
   9. Ember burst     sparks fly from Add to cart when an item is added

   Everything respects prefers-reduced-motion and pauses off-screen.
   ========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;
  const settings = window.frostbytMotion || {};
  if (settings.enabled === false) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isIndex = document.body.classList.contains('template-index');

  root.classList.add('fb-motion');
  if (reduceMotion) root.classList.add('fb-reduced');

  /* ------------------------------------------------------------------ */
  /* 1. Heat bar                                                         */
  /* ------------------------------------------------------------------ */
  function initHeatBar() {
    const bar = document.createElement('div');
    bar.className = 'fb-heatbar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty('--fb-progress', p.toFixed(4));
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------ */
  /* 6. Split + thaw headings                                            */
  /* ------------------------------------------------------------------ */
  function splitText(el) {
    if (el.dataset.fbSplit) return;
    const text = el.textContent.trim();
    if (!text) return;
    el.dataset.fbSplit = '1';
    el.setAttribute('aria-label', text);
    const frag = document.createDocumentFragment();
    let i = 0;
    text.split(/(\s+)/).forEach((chunk) => {
      if (/^\s+$/.test(chunk)) {
        frag.appendChild(document.createTextNode(' '));
        return;
      }
      const word = document.createElement('span');
      word.className = 'fb-word';
      word.setAttribute('aria-hidden', 'true');
      for (const ch of chunk) {
        const c = document.createElement('span');
        c.className = 'fb-char';
        c.style.setProperty('--i', i++);
        c.textContent = ch;
        word.appendChild(c);
      }
      frag.appendChild(word);
    });
    el.textContent = '';
    el.appendChild(frag);
  }

  function initHeadings() {
    const heads = document.querySelectorAll(
      '.cinematic__headline, .inventory-section__title, .featured-product__title'
    );
    if (!heads.length) return;
    heads.forEach((h) => {
      splitText(h);
      h.classList.add('fb-thaw');
    });
    if (reduceMotion) {
      heads.forEach((h) => h.classList.add('fb-thaw--in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('fb-thaw--in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    heads.forEach((h) => io.observe(h));
  }

  /* ------------------------------------------------------------------ */
  /* 2. Hero thaw                                                        */
  /* ------------------------------------------------------------------ */
  function initHeroThaw() {
    const hero = document.querySelector('.cinematic-hero');
    if (!hero) return;
    const frost = document.createElement('div');
    frost.className = 'fb-frost';
    frost.setAttribute('aria-hidden', 'true');
    frost.innerHTML = '<span class="fb-frost__bloom"></span>';
    const media = hero.querySelector('.cinematic__media') || hero;
    media.appendChild(frost);

    if (reduceMotion) {
      hero.classList.add('fb-thawed');
      return;
    }
    hero.classList.add('fb-frosted');
    const start = () =>
      setTimeout(() => {
        hero.classList.add('fb-thawed');
      }, 650);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    // Safety: never leave the hero frosted if load is slow
    setTimeout(() => hero.classList.add('fb-thawed'), 3500);
  }

  /* ------------------------------------------------------------------ */
  /* 3. Snowfall that melts near the cursor                              */
  /* ------------------------------------------------------------------ */
  function initSnow() {
    if (reduceMotion || settings.snow === false) return;
    const hero = document.querySelector('.cinematic-hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'fb-snow';
    canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = window.innerWidth < 750 ? 55 : 120;
    let w = 0;
    let h = 0;
    let flakes = [];
    let running = false;
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    let wind = 0.25;

    function resize() {
      const r = hero.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeFlake(randomY) {
      const depth = Math.random();
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -10,
        r: 0.6 + depth * 2.2,
        vy: 0.25 + depth * 0.9,
        vx: (Math.random() - 0.5) * 0.25,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.01,
        a: 0.35 + depth * 0.55,
        melt: 0
      };
    }

    function reset() {
      resize();
      flakes = Array.from({ length: count }, () => makeFlake(true));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const radius = 150;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.sway += f.swaySpeed;
        f.x += f.vx + Math.sin(f.sway) * 0.35 + wind * f.r * 0.15;
        f.y += f.vy;

        if (pointer.active) {
          const dx = f.x - pointer.x;
          const dy = f.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius * radius) {
            const d = Math.sqrt(d2) || 1;
            const force = (1 - d / radius) * 2.2;
            f.x += (dx / d) * force;
            f.y += (dy / d) * force * 0.6 - 0.3;
            f.melt = Math.min(1, f.melt + 0.06);
          }
        }
        if (f.melt > 0) f.melt = Math.max(0, f.melt - 0.008);

        if (f.y > h + 10 || f.x < -20 || f.x > w + 20 || f.melt >= 0.99) {
          flakes[i] = makeFlake(false);
          continue;
        }

        const alpha = f.a * (1 - f.melt);
        const r = f.r * (1 - f.melt * 0.6);
        if (f.melt > 0.05) {
          // warming flakes pick up an ember tint
          ctx.fillStyle = `rgba(255, ${Math.round(200 - f.melt * 110)}, ${Math.round(160 - f.melt * 130)}, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(235, 245, 255, ${alpha})`;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
      wind = 0.25 + ((pointer.x / w) - 0.5) * 0.6;
    });
    hero.addEventListener('pointerleave', () => {
      pointer.active = false;
      wind = 0.25;
    });

    new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting && !document.hidden ? play() : pause()));
    }).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(reset, 150);
    });
    reset();
    play();
  }

  /* ------------------------------------------------------------------ */
  /* 4. Warm cursor light                                                */
  /* ------------------------------------------------------------------ */
  function initWarmCursor() {
    if (reduceMotion || !finePointer || !isIndex) return;
    const glow = document.createElement('div');
    glow.className = 'fb-cursor';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let raf = 0;
    let moving = false;

    function step() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) {
        raf = requestAnimationFrame(step);
      } else {
        moving = false;
      }
    }
    window.addEventListener(
      'pointermove',
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        glow.classList.add('is-on');
        if (!moving) {
          moving = true;
          raf = requestAnimationFrame(step);
        }
      },
      { passive: true }
    );
    document.addEventListener('pointerleave', () => glow.classList.remove('is-on'));

    // Brighten over things you can buy
    document.addEventListener('pointerover', (e) => {
      const hot = e.target.closest('.inventory-card, .btn, [data-add-to-cart], .color-pill, .heat-zone-pill');
      glow.classList.toggle('is-hot', !!hot);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 5. Thermal scan + heat-on-scroll for product cards                  */
  /* ------------------------------------------------------------------ */
  function initThermalCards() {
    const cards = document.querySelectorAll('[data-inventory-card]');
    if (!cards.length) return;

    cards.forEach((card) => {
      const stage = card.querySelector('.inventory-card__stage');
      if (stage && !stage.querySelector('.fb-scanline')) {
        const line = document.createElement('span');
        line.className = 'fb-scanline';
        line.setAttribute('aria-hidden', 'true');
        stage.appendChild(line);
      }
      // make sure the glow photo is ready before the scan reaches it
      const glowImg = card.querySelector('.inventory-card__img--glow');
      if (glowImg) glowImg.loading = 'eager';
    });

    if (reduceMotion) return;

    // One-time power-on scan when a card scrolls into view
    const scanIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const card = e.target;
          scanIO.unobserve(card);
          const idx = Array.prototype.indexOf.call(card.parentElement.children, card);
          setTimeout(() => {
            card.classList.add('fb-scan');
            setTimeout(() => card.classList.remove('fb-scan'), 2300);
          }, idx * 220);
        });
      },
      { threshold: 0.45 }
    );
    cards.forEach((c) => scanIO.observe(c));

    // Touch screens have no hover: heat the card that's in the middle of the screen
    if (!finePointer) {
      const midIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => e.target.classList.toggle('fb-heated', e.isIntersecting));
        },
        { rootMargin: '-38% 0px -38% 0px', threshold: 0 }
      );
      cards.forEach((c) => midIO.observe(c));
    }
  }

  /* ------------------------------------------------------------------ */
  /* 7. Heat preview when choosing heating zones                         */
  /* ------------------------------------------------------------------ */
  function initHeatPreview() {
    document.querySelectorAll('[data-inventory-product]').forEach((section) => {
      const main = section.querySelector('[data-gallery-main]');
      if (!main) return;
      const overlay = document.createElement('img');
      overlay.className = 'fb-heat-preview';
      overlay.alt = '';
      overlay.setAttribute('aria-hidden', 'true');
      main.appendChild(overlay);
      let timer;

      section.addEventListener('click', (e) => {
        const pill = e.target.closest('.heat-zone-pill');
        if (!pill) return;
        // The second thumbnail is the "heat on" view for the selected color
        const thumbs = section.querySelectorAll('[data-gallery-thumb]');
        const glowThumb = thumbs[1];
        if (!glowThumb || !glowThumb.dataset.src) return;
        overlay.src = glowThumb.dataset.src;
        main.classList.remove('fb-previewing');
        void main.offsetWidth;
        main.classList.add('fb-previewing');
        const zones = parseInt(pill.dataset.heatZones, 10) || 4;
        main.style.setProperty('--fb-heat', Math.min(1, zones / 9).toFixed(2));
        clearTimeout(timer);
        timer = setTimeout(() => main.classList.remove('fb-previewing'), 2200);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 8. Tilt the product photo toward the pointer                        */
  /* ------------------------------------------------------------------ */
  function initTilt() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll('.inventory-gallery__main').forEach((el) => {
      let raf = 0;
      el.classList.add('fb-tilt');
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--fb-rx', (-py * 6).toFixed(2) + 'deg');
          el.style.setProperty('--fb-ry', (px * 8).toFixed(2) + 'deg');
          el.style.setProperty('--fb-gx', ((px + 0.5) * 100).toFixed(1) + '%');
          el.style.setProperty('--fb-gy', ((py + 0.5) * 100).toFixed(1) + '%');
        });
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--fb-rx', '0deg');
        el.style.setProperty('--fb-ry', '0deg');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 9. Ember burst on add to cart                                       */
  /* ------------------------------------------------------------------ */
  let lastAddButton = null;
  function initEmbers() {
    document.addEventListener(
      'click',
      (e) => {
        const btn = e.target.closest('[data-add-to-cart]');
        if (btn) lastAddButton = btn;
      },
      true
    );
    document.addEventListener('frostbyt:cart-added', () => {
      const btn = lastAddButton;
      document.querySelectorAll('[data-cart-count]').forEach((c) => {
        c.classList.remove('fb-pop');
        void c.offsetWidth;
        c.classList.add('fb-pop');
      });
      if (!btn || reduceMotion) return;
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const n = 18;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'fb-ember';
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
        const dist = 50 + Math.random() * 90;
        s.style.left = cx + (Math.random() - 0.5) * r.width * 0.6 + 'px';
        s.style.top = cy + 'px';
        s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(angle) * dist - 30 + 'px');
        s.style.setProperty('--s', (0.5 + Math.random() * 0.9).toFixed(2));
        s.style.animationDelay = Math.random() * 120 + 'ms';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1400);
      }
    });
  }

  function init() {
    initHeatBar();
    initHeadings();
    if (isIndex) {
      initHeroThaw();
      initSnow();
    }
    initWarmCursor();
    initThermalCards();
    initHeatPreview();
    initTilt();
    initEmbers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
