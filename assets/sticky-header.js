/**
 * LenSuh — Sticky Header (S8)
 * Slim version on scroll, scroll-direction-aware on mobile.
 * Uses transform for CLS = 0.
 */

(function () {
  'use strict';

  var StickyHeader = {
    header: null,
    sentinel: null,
    lastScrollY: 0,
    isSticky: false,
    ticking: false,

    init: function () {
      this.header = document.querySelector('.header');
      this.sentinel = document.querySelector('[data-sticky-sentinel]');
      if (!this.header || !this.sentinel) return;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) {
            self.makeSticky();
          } else {
            self.removeSticky();
          }
        }, { threshold: 0 });

        observer.observe(this.sentinel);
      }

      // Scroll direction detection for mobile
      window.addEventListener('scroll', function () {
        if (self.ticking) return;
        self.ticking = true;
        requestAnimationFrame(function () {
          self.handleScroll();
          self.ticking = false;
        });
      }, { passive: true });
    },

    handleScroll: function () {
      if (!this.isSticky) return;

      var currentY = window.scrollY;
      var isMobile = window.innerWidth < 750;
      var style = this.header.getAttribute('data-sticky-style') || 'always';

      if (style === 'scroll-up' || isMobile) {
        if (currentY > this.lastScrollY && currentY > 100) {
          // Scrolling down → hide
          this.header.classList.add('header--hidden');
        } else {
          // Scrolling up → show
          this.header.classList.remove('header--hidden');
        }
      }

      this.lastScrollY = currentY;
    },

    makeSticky: function () {
      this.isSticky = true;
      this.header.classList.add('header--sticky');
      this.header.classList.add('header--slim');
    },

    removeSticky: function () {
      this.isSticky = false;
      this.header.classList.remove('header--sticky');
      this.header.classList.remove('header--slim');
      this.header.classList.remove('header--hidden');
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    StickyHeader.init();
  });
})();
