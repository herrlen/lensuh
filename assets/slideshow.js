/**
 * LenSuh — Slideshow (S18)
 * Auto-rotate, prev/next, pause on hover.
 */

(function () {
  'use strict';

  var Slideshow = {
    init: function () {
      document.querySelectorAll('[data-section-type="slideshow"]').forEach(function (section) {
        Slideshow.setup(section);
      });
    },

    setup: function (section) {
      var slides = section.querySelectorAll('[data-slide]');
      if (slides.length <= 1) return;

      var current = 0;
      var interval = null;

      var show = function (idx) {
        slides.forEach(function (s, i) {
          s.classList.toggle('slideshow__slide--active', i === idx);
        });
        current = idx;
      };

      var next = function () {
        show((current + 1) % slides.length);
      };

      var prev = function () {
        show((current - 1 + slides.length) % slides.length);
      };

      var prevBtn = section.querySelector('[data-slideshow-prev]');
      var nextBtn = section.querySelector('[data-slideshow-next]');

      if (prevBtn) prevBtn.addEventListener('click', prev);
      if (nextBtn) nextBtn.addEventListener('click', next);

      var start = function () {
        interval = setInterval(next, 5000);
      };
      var stop = function () {
        clearInterval(interval);
      };

      section.addEventListener('mouseenter', stop);
      section.addEventListener('mouseleave', start);

      start();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    Slideshow.init();
  });
})();
