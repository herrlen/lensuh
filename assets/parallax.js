/**
 * LenSuh — Parallax System (S17)
 * Intersection Observer based — NO scroll-event-listener.
 * translate3d for smooth GPU transforms.
 * Disabled on mobile + prefers-reduced-motion.
 * Usage: <div data-parallax data-parallax-speed="0.3"></div>
 */

(function () {
  'use strict';

  var Parallax = {
    elements: [],
    observer: null,
    rafId: null,
    enabled: true,

    init: function () {
      // Respect prefers-reduced-motion
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) return;

      // Disable on mobile
      if (window.innerWidth < 750) return;

      if (!('IntersectionObserver' in window)) return;

      this.elements = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
      if (this.elements.length === 0) return;

      this.setupObserver();
      this.bindScroll();
    },

    setupObserver: function () {
      var self = this;
      this.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.dataset.parallaxVisible = 'true';
          } else {
            delete entry.target.dataset.parallaxVisible;
          }
        });
      }, { threshold: 0 });

      this.elements.forEach(function (el) {
        self.observer.observe(el);
      });
    },

    bindScroll: function () {
      var self = this;
      // Use rAF instead of scroll events for smooth performance
      var update = function () {
        self.elements.forEach(function (el) {
          if (el.dataset.parallaxVisible !== 'true') return;

          var speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.3;
          var rect = el.getBoundingClientRect();
          var viewportHeight = window.innerHeight;
          var elCenter = rect.top + rect.height / 2;
          var distance = elCenter - viewportHeight / 2;
          var translate = distance * speed * -1;

          el.style.transform = 'translate3d(0, ' + translate + 'px, 0)';
        });

        self.rafId = requestAnimationFrame(update);
      };

      update();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    Parallax.init();
  });
})();
