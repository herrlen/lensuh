/**
 * LenSuh — Theme JS (S0 Skeleton)
 */

(function () {
  'use strict';

  /* ---- Utility: debounce ---- */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ---- Toast notifications ---- */
  const Toast = {
    el: null,
    timeout: null,

    init() {
      this.el = document.getElementById('toast');
    },

    show(message, duration = 3000) {
      if (!this.el) return;
      this.el.textContent = message;
      this.el.classList.add('toast--visible');
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.hide(), duration);
    },

    hide() {
      if (!this.el) return;
      this.el.classList.remove('toast--visible');
    }
  };

  /* ---- Focus trap (for modals / drawers) ---- */
  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    first.focus();
  }

  /* ---- Section load / unload events (OS 2.0) ---- */
  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target;
    initSection(section);
  });

  function initSection(section) {
    // Placeholder for section-specific JS initialization
  }

  /* ---- DOM Ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    Toast.init();

    // Initialize all sections
    document.querySelectorAll('[data-section-type]').forEach(initSection);
  });

  /* ---- Expose utilities globally ---- */
  window.theme = window.theme || {};
  window.theme.debounce = debounce;
  window.theme.Toast = Toast;
  window.theme.trapFocus = trapFocus;
})();
