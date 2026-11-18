(function () {
  'use strict';

  const STORAGE_KEY = 'frostbyt_privacy_choice_v1';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
    } catch (e) {
      /* ignore quota / private mode */
    }
  }

  function loadShopifyPrivacy(callback) {
    if (!window.Shopify || typeof window.Shopify.loadFeatures !== 'function') {
      callback(null);
      return;
    }
    window.Shopify.loadFeatures(
      [{ name: 'consent-tracking-api', version: '0.1' }],
      function (error) {
        if (error || !window.Shopify.customerPrivacy) {
          callback(null);
          return;
        }
        callback(window.Shopify.customerPrivacy);
      }
    );
  }

  function applyConsent(api, choice) {
    const analytics = !!choice.analytics;
    const marketing = !!choice.marketing;
    if (api && typeof api.setTrackingConsent === 'function') {
      api.setTrackingConsent(
        {
          analytics: analytics,
          marketing: marketing,
          preferences: analytics || marketing,
          sale_of_data: marketing
        },
        function () {}
      );
    }
    document.documentElement.dataset.privacyAnalytics = analytics ? '1' : '0';
    document.documentElement.dataset.privacyMarketing = marketing ? '1' : '0';
    window.dispatchEvent(
      new CustomEvent('frostbyt:privacy-updated', { detail: { analytics: analytics, marketing: marketing } })
    );
  }

  function init() {
    const banner = $('[data-privacy-banner]');
    const prefs = $('[data-privacy-prefs]');
    if (!banner || !prefs) return;

    const analyticsInput = $('[data-privacy-analytics]', prefs);
    const marketingInput = $('[data-privacy-marketing]', prefs);

    function openPrefs() {
      prefs.hidden = false;
      document.documentElement.classList.add('privacy-prefs-open');
      const first = analyticsInput || $('[data-privacy-save]', prefs);
      if (first) first.focus();
    }

    function closePrefs() {
      prefs.hidden = true;
      document.documentElement.classList.remove('privacy-prefs-open');
    }

    function hideBanner() {
      banner.hidden = true;
    }

    function showBanner() {
      banner.hidden = false;
    }

    function syncInputs(choice) {
      if (analyticsInput) analyticsInput.checked = !!choice.analytics;
      if (marketingInput) marketingInput.checked = !!choice.marketing;
    }

    function saveChoice(partial) {
      const choice = {
        analytics: !!partial.analytics,
        marketing: !!partial.marketing,
        decidedAt: new Date().toISOString()
      };
      writeStored(choice);
      syncInputs(choice);
      loadShopifyPrivacy(function (api) {
        applyConsent(api, choice);
      });
      hideBanner();
      closePrefs();
    }

    $all('[data-privacy-open-prefs]').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openPrefs();
      });
    });

    $all('[data-privacy-prefs-close]', prefs).forEach((btn) => {
      btn.addEventListener('click', closePrefs);
    });

    const acceptBtn = $('[data-privacy-accept]', banner);
    const rejectBtn = $('[data-privacy-reject]', banner);
    const customizeBtn = $('[data-privacy-customize]', banner);
    const saveBtn = $('[data-privacy-save]', prefs);

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        saveChoice({ analytics: true, marketing: true });
      });
    }
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        saveChoice({ analytics: false, marketing: false });
      });
    }
    if (customizeBtn) {
      customizeBtn.addEventListener('click', openPrefs);
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        saveChoice({
          analytics: !!(analyticsInput && analyticsInput.checked),
          marketing: !!(marketingInput && marketingInput.checked)
        });
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !prefs.hidden) closePrefs();
    });

    const stored = readStored();
    loadShopifyPrivacy(function (api) {
      let shouldShow = true;
      if (api && typeof api.shouldShowBanner === 'function') {
        try {
          shouldShow = !!api.shouldShowBanner();
        } catch (e) {
          shouldShow = !stored;
        }
      } else {
        shouldShow = !stored;
      }

      if (stored) {
        syncInputs(stored);
        applyConsent(api, stored);
      } else {
        applyConsent(api, { analytics: false, marketing: false });
      }

      if (shouldShow) showBanner();
      else hideBanner();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
