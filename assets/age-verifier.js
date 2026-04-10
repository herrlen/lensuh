/**
 * LenSuh — Age Verifier (S18)
 * Cookie-based first-visit popup. Not ESC-dismissable (compliance).
 * Focus-Trap, no innerHTML, IIFE, === only.
 */

(function () {
  'use strict';

  var COOKIE_NAME = 'age_verified';
  var COOKIE_DAYS = 30;

  var AgeVerifier = {
    el: null,

    init: function () {
      this.el = document.querySelector('[data-age-verifier]');
      if (!this.el) return;

      // Already verified → stay hidden
      if (this.getCookie(COOKIE_NAME)) return;

      this.show();
      this.bindEvents();
    },

    show: function () {
      this.el.setAttribute('aria-hidden', 'false');
      this.el.classList.add('age-verifier--visible');
      document.body.classList.add('overflow-hidden');
      window.theme.trapFocus(this.el.querySelector('.age-verifier__content'));
    },

    hide: function () {
      this.el.setAttribute('aria-hidden', 'true');
      this.el.classList.remove('age-verifier--visible');
      document.body.classList.remove('overflow-hidden');
    },

    bindEvents: function () {
      var self = this;

      var yesBtn = this.el.querySelector('[data-age-yes]');
      var noBtn = this.el.querySelector('[data-age-no]');

      if (yesBtn) {
        yesBtn.addEventListener('click', function () {
          self.setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
          self.hide();
        });
      }

      if (noBtn) {
        noBtn.addEventListener('click', function () {
          var url = self.el.getAttribute('data-redirect-url');
          if (url) {
            window.location.href = url;
          } else {
            window.location.href = 'https://www.google.com';
          }
        });
      }

      // Block ESC key — compliance requirement (not dismissable)
      this.el.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    },

    setCookie: function (name, value, days) {
      var expires = '';
      if (days) {
        var d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + d.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
    },

    getCookie: function (name) {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    AgeVerifier.init();
  });
})();
