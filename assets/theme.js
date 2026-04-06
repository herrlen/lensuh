/**
 * LenSuh — Theme JS (S0 Skeleton)
 */

(function () {
  'use strict';

  /* ---- Pub/Sub Event-Bus ---- */
  const EventBus = {
    _listeners: {},

    subscribe(event, callback) {
      if (typeof callback !== 'function') return;
      if (!this._listeners[event]) {
        this._listeners[event] = [];
      }
      this._listeners[event].push(callback);

      return function unsubscribe() {
        EventBus._listeners[event] = EventBus._listeners[event].filter(
          function (cb) { return cb !== callback; }
        );
      };
    },

    publish(event, data) {
      if (!this._listeners[event]) return;
      this._listeners[event].forEach(function (callback) {
        try {
          callback(data);
        } catch (err) {
          console.error('[EventBus] Error in "' + event + '" handler:', err);
        }
      });
    }
  };

  /* ---- Utility: debounce ---- */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ---- Utility: throttle ---- */
  function throttle(fn, limit) {
    let waiting = false;
    return function (...args) {
      if (waiting) return;
      fn.apply(this, args);
      waiting = true;
      setTimeout(function () { waiting = false; }, limit);
    };
  }

  /* ---- Fetch wrapper with error handling + Toast feedback ---- */
  function fetchJSON(url, options) {
    return fetch(url, options)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .catch(function (err) {
        console.error('[fetchJSON]', url, err);
        var errorMsg = window.theme.strings.fetchError || 'Something went wrong. Please try again.';
        Toast.show(errorMsg, 4000);
        throw err;
      });
  }

  /* ---- Toast notifications ---- */
  const Toast = {
    el: null,
    timeout: null,

    init() {
      this.el = document.getElementById('toast');
    },

    show(message, duration) {
      if (!this.el) return;
      duration = duration || 3000;
      this.el.textContent = message;
      this.el.classList.add('toast--visible');
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function () { Toast.hide(); }, duration);
    },

    hide() {
      if (!this.el) return;
      this.el.classList.remove('toast--visible');
    }
  };

  /* ---- Focus trap (for modals / drawers) ---- */
  function trapFocus(container) {
    var focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

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
    initSection(event.target);
  });

  function initSection(section) {
    // Placeholder for section-specific JS initialization
  }

  /* ---- DOM Ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    Toast.init();
    document.querySelectorAll('[data-section-type]').forEach(initSection);
  });

  /* ---- Expose utilities globally ---- */
  window.theme = window.theme || {};
  window.theme.strings = window.theme.strings || {};
  window.theme.debounce = debounce;
  window.theme.throttle = throttle;
  window.theme.fetchJSON = fetchJSON;
  window.theme.Toast = Toast;
  window.theme.trapFocus = trapFocus;
  window.theme.subscribe = EventBus.subscribe.bind(EventBus);
  window.theme.publish = EventBus.publish.bind(EventBus);
})();
