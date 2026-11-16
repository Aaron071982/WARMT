(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isVideo(el) {
    return el && el.tagName === 'VIDEO';
  }

  function pauseMedia(root) {
    root.querySelectorAll('video').forEach((video) => {
      if (!video.paused) video.pause();
    });
    root.classList.add('media-paused');
  }

  function playVideo(video) {
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    const start = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };
    if (video.readyState >= 2) start();
    else video.addEventListener('canplay', start, { once: true });
  }

  function playMedia(root) {
    if (reducedMotion) return;
    root.classList.remove('media-paused');
    root.querySelectorAll('video[data-autoplay="true"]').forEach(playVideo);
  }

  function initCinematicMedia() {
    const sections = document.querySelectorAll('[data-cinematic-media]');
    if (!sections.length) return;

    if (reducedMotion) {
      sections.forEach((section) => {
        section.querySelectorAll('video').forEach((video) => {
          video.removeAttribute('autoplay');
          video.pause();
          video.setAttribute('hidden', '');
        });
        section.querySelectorAll('[data-reduced-fallback]').forEach((img) => {
          img.hidden = false;
        });
        section.querySelectorAll('.heat-media').forEach((el) => {
          el.classList.remove('is-animated');
        });
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playMedia(entry.target);
          } else {
            pauseMedia(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '15% 0px' }
    );

    sections.forEach((section, index) => {
      // Eager first section for LCP; lazy-control the rest
      if (index === 0) {
        playMedia(section);
      } else {
        pauseMedia(section);
      }
      io.observe(section);
    });
  }

  function initHeatOverlays() {
    document.querySelectorAll('[data-heat-media]').forEach((el) => {
      const enabled = el.dataset.heatEnabled === 'true';
      const mode = el.dataset.heatMode || 'prerendered';
      if (!enabled || mode !== 'overlay' || reducedMotion) {
        el.classList.remove('is-animated');
        return;
      }
      el.classList.add('is-animated');
    });
  }

  function validateExternalUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
      return parsed.href;
    } catch (e) {
      return null;
    }
  }

  // Expose for theme editor / debugging
  window.HeatedMedia = {
    validateExternalUrl,
    pauseMedia,
    playMedia
  };

  document.addEventListener('DOMContentLoaded', () => {
    initCinematicMedia();
    initHeatOverlays();
  });
})();
