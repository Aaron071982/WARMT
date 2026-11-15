(function () {
  'use strict';

  const moneyFormat = (window.theme && window.theme.moneyFormat) || '${{amount}}';

  function formatMoney(cents) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    const value = (Number(cents) / 100).toFixed(2);
    return moneyFormat
      .replace(/\{\{\s*amount\s*\}\}/, value)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(Number(cents) / 100).toString())
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, value.replace('.', ','));
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ---------- Header ---------- */
  function initHeader() {
    const header = document.querySelector('[data-site-header]');
    if (!header) return;

    const transparent = header.dataset.transparent === 'true';
    const onScroll = () => {
      if (!transparent) return;
      if (window.scrollY > 40) {
        header.classList.add('site-header--scrolled');
        header.classList.remove('site-header--transparent');
      } else {
        header.classList.add('site-header--transparent');
        header.classList.remove('site-header--scrolled');
      }
    };

    if (transparent) {
      header.classList.add('site-header--transparent');
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    const closeBtn = document.querySelector('[data-mobile-nav-close]');

    function openMenu() {
      if (!mobileNav) return;
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      toggle && toggle.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      if (!mobileNav) return;
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
      toggle && toggle.setAttribute('aria-expanded', 'false');
    }

    toggle && toggle.addEventListener('click', openMenu);
    closeBtn && closeBtn.addEventListener('click', closeMenu);
    mobileNav &&
      mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    const nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach((n) => io.observe(n));
  }

  /* ---------- Cart drawer ---------- */
  const Cart = {
    drawer: null,
    countEls: null,

    init() {
      this.drawer = document.querySelector('[data-cart-drawer]');
      this.countEls = document.querySelectorAll('[data-cart-count]');
      if (!this.drawer) return;

      document.querySelectorAll('[data-cart-open]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });

      this.drawer.querySelectorAll('[data-cart-close]').forEach((btn) => {
        btn.addEventListener('click', () => this.close());
      });

      this.drawer.addEventListener('click', (e) => {
        const remove = e.target.closest('[data-cart-remove]');
        if (remove) {
          e.preventDefault();
          this.change(remove.dataset.cartRemove, 0);
          return;
        }
        const qty = e.target.closest('[data-cart-qty]');
        if (qty) {
          e.preventDefault();
          const key = qty.dataset.key;
          const delta = Number(qty.dataset.cartQty);
          const current = Number(qty.dataset.current);
          this.change(key, Math.max(0, current + delta));
        }
      });
    },

    open() {
      if (!this.drawer) {
        window.location.href = (window.theme && window.theme.routes.cart_url) || '/cart';
        return;
      }
      this.drawer.classList.add('is-open');
      document.body.classList.add('cart-drawer-open');
      this.refresh();
    },

    close() {
      if (!this.drawer) return;
      this.drawer.classList.remove('is-open');
      document.body.classList.remove('cart-drawer-open');
    },

    toast(message) {
      const el = document.getElementById('CartToast');
      if (!el) return;
      el.textContent = message;
      el.hidden = false;
      setTimeout(() => {
        el.hidden = true;
      }, 2400);
    },

    updateCount(count) {
      this.countEls &&
        this.countEls.forEach((el) => {
          el.textContent = String(count);
          el.hidden = count < 1;
        });
    },

    async refresh() {
      try {
        const res = await fetch((window.theme.routes.cart_url || '/cart') + '.js');
        const cart = await res.json();
        this.render(cart);
        this.updateCount(cart.item_count);
      } catch (err) {
        console.error(err);
      }
    },

    render(cart) {
      if (!this.drawer) return;
      const body = this.drawer.querySelector('[data-cart-drawer-body]');
      const footer = this.drawer.querySelector('[data-cart-drawer-footer]');
      const subtotal = this.drawer.querySelector('[data-cart-subtotal]');
      if (!body) return;

      if (!cart.items.length) {
        body.innerHTML = '<p class="cart-drawer__empty">Your cart is empty</p>';
        footer && (footer.hidden = true);
        return;
      }

      footer && (footer.hidden = false);
      if (subtotal) subtotal.textContent = formatMoney(cart.total_price);

      body.innerHTML = cart.items
        .map((item) => {
          const img = item.image
            ? `<img src="${item.image}" alt="${item.product_title.replace(/"/g, '&quot;')}" width="120" height="120" loading="lazy">`
            : '<div class="gallery-placeholder">Item</div>';
          return `
            <article class="cart-drawer__item">
              <div class="cart-drawer__item-media">${img}</div>
              <div>
                <h3 class="cart-item__title">${item.product_title}</h3>
                ${item.variant_title && item.variant_title !== 'Default Title' ? `<p class="cart-item__variant">${item.variant_title}</p>` : ''}
                <p class="cart-item__variant">${formatMoney(item.final_line_price)}</p>
                <div class="qty" style="margin:0.75rem 0">
                  <button type="button" class="qty__btn" data-cart-qty="-1" data-key="${item.key}" data-current="${item.quantity}" aria-label="Decrease">−</button>
                  <span class="qty__input" aria-live="polite">${item.quantity}</span>
                  <button type="button" class="qty__btn" data-cart-qty="1" data-key="${item.key}" data-current="${item.quantity}" aria-label="Increase">+</button>
                </div>
                <button type="button" class="cart-item__remove" data-cart-remove="${item.key}">Remove</button>
              </div>
            </article>`;
        })
        .join('');
    },

    async add(form) {
      const formData = new FormData(form);
      try {
        const res = await fetch(window.theme.routes.cart_add_url + '.js', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.description || data.message || 'Cart error');
        await this.refresh();
        if (window.theme.cartDrawer) this.open();
        else this.toast('Added to cart');
        return data;
      } catch (err) {
        this.toast(err.message || window.theme.strings.cartError);
        throw err;
      }
    },

    async change(key, quantity) {
      try {
        const res = await fetch(window.theme.routes.cart_change_url + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: key, quantity })
        });
        const cart = await res.json();
        if (!res.ok) throw new Error(cart.message || 'Unable to update cart');
        this.render(cart);
        this.updateCount(cart.item_count);
      } catch (err) {
        this.toast(err.message || window.theme.strings.cartError);
      }
    }
  };

  /* ---------- Product form ---------- */
  function initProductForms() {
    document.querySelectorAll('[data-product-form]').forEach((root) => {
      const form = root.tagName === 'FORM' ? root : root.closest('form');
      if (!form) return;
      const section = form.closest('[data-product-section]') || form;
      const priceEl = section.querySelector('[data-product-price]');
      const availEl = section.querySelector('[data-product-availability]');
      const submitBtn = form.querySelector('[data-add-to-cart]');
      const variantInput = form.querySelector('[name="id"]');
      const variantsScript = section.querySelector('[data-product-variants-json]');
      let variants = [];
      try {
        if (variantsScript) {
          variants = JSON.parse(variantsScript.textContent);
        } else if (root.dataset.variants) {
          variants = JSON.parse(root.dataset.variants);
        }
      } catch (e) {
        variants = [];
      }

      function selectedOptions() {
        return Array.from(form.querySelectorAll('[data-option-index]')).map((group) => {
          const selected = group.querySelector(
            '.variant-pill.is-selected, .heat-zone-pill.is-selected, select'
          );
          if (selected && selected.tagName === 'SELECT') return selected.value;
          if (selected) return selected.dataset.value || selected.dataset.heatZones;
          return null;
        });
      }

      function findVariant() {
        const opts = selectedOptions();
        if (!variants.length) return { id: variantInput && variantInput.value, available: !submitBtn.disabled, price: null, options: opts };
        return variants.find((v) => v.options.every((opt, i) => opt === opts[i]));
      }

      function updateUI() {
        const variant = findVariant();
        if (!variant || !variant.id) {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = window.theme.strings.unavailable;
          }
          if (availEl) {
            availEl.dataset.available = 'false';
            availEl.textContent = window.theme.strings.unavailable;
          }
          return;
        }

        if (variantInput) variantInput.value = variant.id;
        if (priceEl && variant.price != null) priceEl.innerHTML = formatMoney(variant.price);
        if (availEl) {
          availEl.dataset.available = String(variant.available);
          availEl.textContent = variant.available ? 'In stock' : window.theme.strings.soldOut;
        }
        if (submitBtn) {
          submitBtn.disabled = !variant.available;
          submitBtn.textContent = variant.available
            ? window.theme.strings.addToCart
            : window.theme.strings.soldOut;
        }

        if (variants.length) {
          const url = new URL(window.location.href);
          url.searchParams.set('variant', variant.id);
          window.history.replaceState({}, '', url);
        }
      }

      form.querySelectorAll('.variant-pill, .heat-zone-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          const group = pill.closest('[data-option-index]');
          if (!group) return;
          group
            .querySelectorAll('.variant-pill, .heat-zone-pill')
            .forEach((p) => {
              p.classList.remove('is-selected');
              if (p.hasAttribute('aria-pressed')) p.setAttribute('aria-pressed', 'false');
            });
          pill.classList.add('is-selected');
          if (pill.hasAttribute('aria-pressed')) pill.setAttribute('aria-pressed', 'true');
          updateUI();
        });
      });

      form.querySelectorAll('select[data-option-select]').forEach((select) => {
        select.addEventListener('change', updateUI);
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitBtn) submitBtn.disabled = true;
        try {
          await Cart.add(form);
        } finally {
          updateUI();
        }
      });

      updateUI();
    });
  }

  /* ---------- Qty steppers ---------- */
  function initQty() {
    document.querySelectorAll('[data-qty]').forEach((wrap) => {
      const input = wrap.querySelector('input');
      wrap.querySelectorAll('[data-qty-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const delta = Number(btn.dataset.qtyBtn);
          const next = Math.max(1, Number(input.value || 1) + delta);
          input.value = next;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    });
  }

  /* ---------- Gallery thumbs ---------- */
  function initGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
      const main = gallery.querySelector('[data-gallery-main]');
      const activeImg = () => main && (main.querySelector('[data-gallery-active]') || main.querySelector('img'));
      const thumbs = gallery.querySelectorAll('[data-gallery-thumb]');

      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          thumbs.forEach((t) => t.classList.remove('is-active'));
          thumb.classList.add('is-active');
          const img = activeImg();
          if (!img) return;
          img.style.opacity = '0';
          setTimeout(() => {
            img.src = thumb.dataset.src;
            img.alt = thumb.dataset.alt || '';
            img.style.opacity = '1';
          }, 180);
        });
      });
    });
  }

  /* ---------- Heat zone maps ---------- */
  const HEAT_NOTES = {
    '2': '2 zones — focused core warmth',
    '4': '4 zones — balanced core coverage',
    '8': '8 zones — extended body coverage',
    '9': '9 zones — maximum full coverage'
  };

  function buildZoneMap(el, count) {
    const n = Number(count) || 0;
    el.innerHTML = '';
    for (let i = 0; i < 9; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'hz-dot' + (i < n ? ' is-on' : '');
      el.appendChild(dot);
    }
  }

  function initHeatZones() {
    document.querySelectorAll('[data-heat-pills]').forEach((group) => {
      const note = group.parentElement.querySelector('[data-heat-note]');
      const spec = document.querySelector('[data-spec-zones]');
      group.querySelectorAll('[data-heat-zones]').forEach((pill) => {
        const map = pill.querySelector('[data-zone-map]');
        if (map) buildZoneMap(map, pill.dataset.heatZones);
        pill.addEventListener('click', () => {
          group.querySelectorAll('[data-heat-zones]').forEach((p) => {
            p.classList.remove('is-selected');
            p.setAttribute('aria-pressed', 'false');
          });
          pill.classList.add('is-selected');
          pill.setAttribute('aria-pressed', 'true');
          const z = pill.dataset.heatZones;
          if (note) note.textContent = HEAT_NOTES[z] || `${z} heat zones`;
          if (spec) spec.textContent = z;
          // sync hidden form input if present
          const input = document.querySelector('[data-heat-input]');
          if (input) {
            input.value = z;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    });
  }

  function initSizePills() {
    document.querySelectorAll('[data-size-pills]').forEach((group) => {
      group.querySelectorAll('[data-size-pill]').forEach((pill) => {
        pill.addEventListener('click', () => {
          group.querySelectorAll('[data-size-pill]').forEach((p) => p.classList.remove('is-selected'));
          pill.classList.add('is-selected');
          pill.classList.add('is-pulse');
          setTimeout(() => pill.classList.remove('is-pulse'), 450);
        });
      });
    });
  }

  /* ---------- Inventory color switch (jackets, gloves, …) ---------- */
  function initInventoryProduct() {
    document.querySelectorAll('[data-inventory-product]').forEach((section) => {
      const catalogEl = section.querySelector('[data-inventory-catalog]');
      if (!catalogEl) return;
      let catalog = {};
      try {
        catalog = JSON.parse(catalogEl.textContent);
      } catch (e) {
        return;
      }

      const idPrefix = section.dataset.idPrefix || 'product-';

      function applyColor(color) {
        const entry = catalog[color];
        if (!entry) return;
        section.dataset.color = color;
        section.id = idPrefix + color;

        const thumbs = section.querySelectorAll('[data-gallery-thumb]');
        const mainImg = section.querySelector('[data-gallery-active]');
        const titleEl = section.querySelector('[data-product-title]');
        entry.images.forEach((img, i) => {
          const thumb = thumbs[i];
          if (!thumb) return;
          thumb.dataset.src = img.src;
          thumb.dataset.alt = img.alt;
          const thumbImg = thumb.querySelector('img');
          if (thumbImg) thumbImg.src = img.src;
        });
        if (mainImg && entry.images[0]) {
          mainImg.src = entry.images[0].src;
          mainImg.alt = entry.images[0].alt;
        }
        if (titleEl && entry.title) titleEl.textContent = entry.title;
        thumbs.forEach((t, i) => t.classList.toggle('is-active', i === 0));

        section.querySelectorAll('[data-color-pill]').forEach((pill) => {
          const on = pill.dataset.color === color;
          pill.classList.toggle('is-selected', on);
          pill.setAttribute('aria-pressed', String(on));
        });
      }

      section.querySelectorAll('[data-color-pill]').forEach((pill) => {
        pill.addEventListener('click', () => applyColor(pill.dataset.color));
      });

      function fromHash() {
        const hash = (window.location.hash || '').replace(/^#/, '');
        if (!hash.startsWith(idPrefix)) return;
        const color = hash.slice(idPrefix.length);
        if (catalog[color]) applyColor(color);
      }
      window.addEventListener('hashchange', fromHash);
      fromHash();
    });

    document.querySelectorAll('[data-demo-add]').forEach((btn) => {
      if (btn.dataset.boundDemo) return;
      btn.dataset.boundDemo = '1';
      btn.addEventListener('click', () => {
        const toast = document.getElementById('CartToast');
        if (toast) {
          toast.textContent = 'Connect Shopify products to enable cart';
          toast.hidden = false;
          setTimeout(() => {
            toast.hidden = true;
          }, 2400);
        }
      });
    });
  }

  /* ---------- Slideshow ---------- */
  function initSlideshow() {
    const root = document.querySelector('[data-slideshow]');
    if (!root) return;

    const imgA = root.querySelector('[data-slideshow-img]');
    const imgB = root.querySelector('[data-slideshow-img-next]');
    const caption = root.querySelector('[data-slideshow-caption]');
    const progress = root.querySelector('[data-slideshow-progress]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let slides = [];
    let index = 0;
    let timer = null;
    let showingA = true;
    const DURATION = 3200;

    function collectFromGallery(gallery) {
      return Array.from(gallery.querySelectorAll('[data-gallery-thumb]')).map((t) => ({
        src: t.dataset.src,
        alt: t.dataset.alt || ''
      }));
    }

    function renderProgress() {
      if (!progress) return;
      progress.innerHTML = slides
        .map(
          (_, i) =>
            `<span class="slideshow__progress-dot${i === index ? ' is-active' : ''}" style="--slide-duration:${DURATION}ms"></span>`
        )
        .join('');
    }

    function show(i, animate) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      const slide = slides[index];
      const current = showingA ? imgA : imgB;
      const next = showingA ? imgB : imgA;

      if (!animate || reduced) {
        imgA.className = 'slideshow__img is-active';
        imgB.className = 'slideshow__img';
        imgA.src = slide.src;
        imgA.alt = slide.alt;
        showingA = true;
      } else {
        next.src = slide.src;
        next.alt = slide.alt;
        current.classList.remove('is-active');
        current.classList.add('is-exit');
        next.classList.remove('is-exit');
        next.classList.add('is-active');
        showingA = !showingA;
      }
      if (caption) caption.textContent = slide.alt;
      renderProgress();
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    function play() {
      stop();
      if (reduced || slides.length < 2) return;
      timer = setInterval(() => show(index + 1, true), DURATION);
    }

    function open(gallery, startIndex) {
      slides = collectFromGallery(gallery);
      if (!slides.length) return;
      root.hidden = false;
      document.body.classList.add('slideshow-open');
      show(startIndex || 0, false);
      play();
    }

    function close() {
      stop();
      root.hidden = true;
      document.body.classList.remove('slideshow-open');
    }

    document.querySelectorAll('[data-open-slideshow]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gallery = btn.closest('[data-product-gallery]');
        if (!gallery) return;
        const activeThumb = gallery.querySelector('[data-gallery-thumb].is-active');
        const thumbs = Array.from(gallery.querySelectorAll('[data-gallery-thumb]'));
        const start = Math.max(0, thumbs.indexOf(activeThumb));
        open(gallery, start);
      });
    });

    root.querySelectorAll('[data-slideshow-close]').forEach((el) => el.addEventListener('click', close));
    root.querySelector('[data-slideshow-prev]')?.addEventListener('click', () => {
      show(index - 1, true);
      play();
    });
    root.querySelector('[data-slideshow-next]')?.addEventListener('click', () => {
      show(index + 1, true);
      play();
    });

    document.addEventListener('keydown', (e) => {
      if (root.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') {
        show(index - 1, true);
        play();
      }
      if (e.key === 'ArrowRight') {
        show(index + 1, true);
        play();
      }
    });
  }

  /* ---------- Size guide ---------- */
  function initSizeGuide() {
    const modal = document.querySelector('[data-size-guide]');
    if (!modal) return;
    document.querySelectorAll('[data-size-guide-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('is-open');
      });
    });
    modal.querySelectorAll('[data-size-guide-close]').forEach((btn) => {
      btn.addEventListener('click', () => modal.classList.remove('is-open'));
    });
  }

  /* ---------- Cart page forms ---------- */
  function initCartPage() {
    const form = document.querySelector('[data-cart-page-form]');
    if (!form) return;
    form.querySelectorAll('[data-cart-page-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = btn.closest('[data-cart-line]');
        const input = line && line.querySelector('input[name*="updates"]');
        if (input) input.value = 0;
        form.submit();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initReveals();
    Cart.init();
    initProductForms();
    initQty();
    initGallery();
    initHeatZones();
    initSizePills();
    initInventoryProduct();
    initSlideshow();
    initSizeGuide();
    initCartPage();
    window.HeatedCart = Cart;
  });
})();

