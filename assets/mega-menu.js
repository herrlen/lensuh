/**
 * LenSuh — Mega Menu + Mobile Menu (S7)
 * Desktop: Fly-out mega menu with keyboard nav (Tab, Arrow, ESC)
 * Mobile: Accordion drill-down with aria-expanded
 * No innerHTML, no onclick, IIFE, === only
 */

(function () {
  'use strict';

  /* ---- Desktop Mega Menu ---- */
  var MegaMenu = {
    parents: null,

    init: function () {
      this.parents = document.querySelectorAll('[data-mega-menu-parent]');
      if (this.parents.length === 0) return;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      this.parents.forEach(function (parent) {
        var trigger = parent.querySelector('[aria-haspopup]');
        var panel = parent.querySelector('[data-mega-menu-panel]');
        if (!trigger || !panel) return;

        // Click toggle
        trigger.addEventListener('click', function () {
          var isOpen = trigger.getAttribute('aria-expanded') === 'true';
          self.closeAll();
          if (!isOpen) {
            self.open(trigger, panel);
          }
        });

        // Hover open (desktop)
        parent.addEventListener('mouseenter', function () {
          if (window.innerWidth >= 750) {
            self.closeAll();
            self.open(trigger, panel);
          }
        });

        parent.addEventListener('mouseleave', function () {
          if (window.innerWidth >= 750) {
            self.close(trigger, panel);
          }
        });

        // Keyboard: ESC closes, Arrow keys navigate
        parent.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            self.close(trigger, panel);
            trigger.focus();
          }

          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            var items = panel.querySelectorAll('[role="menuitem"]');
            if (items.length === 0) return;

            var current = Array.prototype.indexOf.call(items, document.activeElement);
            var next;
            if (e.key === 'ArrowDown') {
              next = current + 1 >= items.length ? 0 : current + 1;
            } else {
              next = current - 1 < 0 ? items.length - 1 : current - 1;
            }
            items[next].focus();
          }
        });
      });

      // Close all on click outside
      document.addEventListener('click', function (e) {
        if (!e.target.closest('[data-mega-menu-parent]')) {
          self.closeAll();
        }
      });
    },

    open: function (trigger, panel) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.classList.add('mega-menu--open');
    },

    close: function (trigger, panel) {
      trigger.setAttribute('aria-expanded', 'false');
      panel.classList.remove('mega-menu--open');
    },

    closeAll: function () {
      this.parents.forEach(function (parent) {
        var trigger = parent.querySelector('[aria-haspopup]');
        var panel = parent.querySelector('[data-mega-menu-panel]');
        if (trigger && panel) {
          trigger.setAttribute('aria-expanded', 'false');
          panel.classList.remove('mega-menu--open');
        }
      });
    }
  };

  /* ---- Mobile Menu ---- */
  var MobileMenu = {
    el: null,
    toggleBtn: null,

    init: function () {
      this.el = document.querySelector('[data-mobile-menu]');
      this.toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
      if (!this.el || !this.toggleBtn) return;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      // Open
      this.toggleBtn.addEventListener('click', function () {
        self.open();
      });

      // Close buttons + overlay
      this.el.querySelectorAll('[data-mobile-menu-close]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          self.close();
        });
      });

      // ESC
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.el.getAttribute('aria-hidden') === 'false') {
          self.close();
        }
      });

      // Accordion triggers
      this.el.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-mobile-accordion-trigger]');
        if (!trigger) return;

        var content = trigger.nextElementSibling;
        if (!content || !content.hasAttribute('data-mobile-accordion-content')) return;

        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
        content.hidden = isOpen;
      });
    },

    open: function () {
      this.el.setAttribute('aria-hidden', 'false');
      this.el.classList.add('mobile-menu--open');
      this.toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('overflow-hidden');
      window.theme.trapFocus(this.el.querySelector('.mobile-menu__panel'));
    },

    close: function () {
      this.el.setAttribute('aria-hidden', 'true');
      this.el.classList.remove('mobile-menu--open');
      this.toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
      this.toggleBtn.focus();
    }
  };

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    MegaMenu.init();
    MobileMenu.init();
  });
})();
