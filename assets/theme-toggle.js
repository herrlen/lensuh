/**
 * LenSuh — Dark/Light Mode Toggle (S17)
 * localStorage persistence + system preference detection.
 * Smooth transition. ARIA-label updates.
 * No innerHTML, addEventListener, IIFE, === only.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'theme';

  var ThemeToggle = {
    buttons: null,

    init: function () {
      this.buttons = document.querySelectorAll('[data-theme-toggle]');
      if (this.buttons.length === 0) return;

      var current = document.documentElement.getAttribute('data-theme') || 'light';
      this.updateButtons(current);

      this.bindEvents();
      this.bindSystemListener();
    },

    bindEvents: function () {
      var self = this;
      this.buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          self.toggle();
        });
      });
    },

    bindSystemListener: function () {
      var self = this;
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', function (e) {
        // Only follow system if user hasn't manually chosen
        var stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          self.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    },

    toggle: function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      this.setTheme(next);

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        console.error('[ThemeToggle] localStorage error:', e);
      }
    },

    setTheme: function (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.updateButtons(theme);
      window.theme.publish('theme:changed', { theme: theme });
    },

    updateButtons: function (theme) {
      var label = theme === 'dark'
        ? (window.theme.strings.toggleLight || 'Switch to light mode')
        : (window.theme.strings.toggleDark || 'Switch to dark mode');

      this.buttons.forEach(function (btn) {
        btn.setAttribute('aria-label', label);
        btn.setAttribute('aria-pressed', String(theme === 'dark'));
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    ThemeToggle.init();
  });
})();
