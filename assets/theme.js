/**
 * LenSuh — Theme JS (S3 Core Web Vitals)
 */

(function () {
  'use strict';

  /* ---- Pub/Sub Event-Bus ---- */
  var EventBus = {
    _listeners: {},

    subscribe: function (event, callback) {
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

    publish: function (event, data) {
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
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  /* ---- Utility: throttle ---- */
  function throttle(fn, limit) {
    var waiting = false;
    return function () {
      if (waiting) return;
      fn.apply(this, arguments);
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
  var Toast = {
    el: null,
    timeout: null,

    init: function () {
      this.el = document.getElementById('toast');
    },

    show: function (message, duration) {
      if (!this.el) return;
      duration = duration || 3000;
      this.el.textContent = message;
      this.el.classList.add('toast--visible');
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function () { Toast.hide(); }, duration);
    },

    hide: function () {
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

  /* ---- Intersection Observer: lazy-load sections ---- */
  var LAZY_LOAD_MARGIN = '200px';

  function observeSections() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var section = entry.target;
        var handler = section.getAttribute('data-lazy-section');

        if (handler && window.theme._sectionHandlers[handler]) {
          window.theme._sectionHandlers[handler](section);
        }

        section.classList.add('section--loaded');
        observer.unobserve(section);
      });
    }, {
      rootMargin: LAZY_LOAD_MARGIN
    });

    document.querySelectorAll('[data-lazy-section]').forEach(function (el) {
      observer.observe(el);
    });

    return observer;
  }

  /**
   * Register a section handler for lazy initialization.
   * Usage: theme.registerSection('cart-drawer', function(el) { ... })
   * Then in Liquid: <div data-lazy-section="cart-drawer">
   */
  function registerSection(name, handler) {
    window.theme._sectionHandlers[name] = handler;
  }

  /* ---- Dynamic Import helper ---- */
  /**
   * Dynamically import a JS module from Shopify assets.
   * Usage: theme.loadModule('cart-drawer.js').then(function(module) { ... })
   * @param {string} filename - Asset filename (e.g. 'cart-drawer.js')
   * @returns {Promise}
   */
  function loadModule(filename) {
    var url = window.theme.assetUrl
      ? window.theme.assetUrl.replace('theme.js', filename)
      : '/assets/' + filename;

    return import(url).catch(function (err) {
      console.error('[loadModule] Failed to load: ' + filename, err);
      throw err;
    });
  }

  /* ---- requestIdleCallback polyfill + helper ---- */
  var idle = window.requestIdleCallback || function (cb) {
    return setTimeout(cb, 1);
  };

  /**
   * Schedule non-critical work for idle time.
   * Usage: theme.onIdle(function() { analytics.init(); })
   */
  function onIdle(callback) {
    idle(callback);
  }

  /* ---- Section load / unload events (OS 2.0) ---- */
  document.addEventListener('shopify:section:load', function (event) {
    initSection(event.target);
  });

  function initSection(section) {
    var type = section.getAttribute('data-section-type');
    if (type && window.theme._sectionHandlers[type]) {
      window.theme._sectionHandlers[type](section);
    }
  }

  /* ---- DOM Ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    Toast.init();

    // Initialize all visible sections
    document.querySelectorAll('[data-section-type]').forEach(initSection);

    // Set up lazy-loading for below-the-fold sections
    observeSections();
  });

  /* ---- Expose utilities globally ---- */
  window.theme = window.theme || {};
  window.theme.strings = window.theme.strings || {};
  window.theme._sectionHandlers = window.theme._sectionHandlers || {};
  window.theme.debounce = debounce;
  window.theme.throttle = throttle;
  window.theme.fetchJSON = fetchJSON;
  window.theme.Toast = Toast;
  window.theme.trapFocus = trapFocus;
  window.theme.subscribe = EventBus.subscribe.bind(EventBus);
  window.theme.publish = EventBus.publish.bind(EventBus);
  window.theme.registerSection = registerSection;
  window.theme.loadModule = loadModule;
  window.theme.onIdle = onIdle;
  window.theme.observeSections = observeSections;
})();
