/**
 * LenSuh — Before/After Slider (S12)
 * Drag handle, touch+mouse, keyboard (Arrow Keys).
 * No innerHTML, IIFE, === only.
 */

(function () {
  'use strict';

  var BeforeAfter = {
    init: function () {
      document.querySelectorAll('[data-before-after]').forEach(function (container) {
        BeforeAfter.setup(container);
      });
    },

    setup: function (container) {
      var handle = container.querySelector('[data-slider-handle]');
      var afterClip = container.querySelector('[data-after-clip]');
      if (!handle || !afterClip) return;

      var isDragging = false;

      var setPosition = function (percent) {
        percent = Math.max(0, Math.min(100, percent));
        handle.style.left = percent + '%';
        afterClip.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
        container.setAttribute('aria-valuenow', String(Math.round(percent)));
      };

      var getPercent = function (clientX) {
        var rect = container.getBoundingClientRect();
        return ((clientX - rect.left) / rect.width) * 100;
      };

      // Mouse
      handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        isDragging = true;
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        setPosition(getPercent(e.clientX));
      });

      document.addEventListener('mouseup', function () {
        isDragging = false;
      });

      // Touch
      handle.addEventListener('touchstart', function (e) {
        isDragging = true;
      }, { passive: true });

      document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        var touch = e.touches[0];
        setPosition(getPercent(touch.clientX));
      }, { passive: true });

      document.addEventListener('touchend', function () {
        isDragging = false;
      });

      // Keyboard
      container.addEventListener('keydown', function (e) {
        var current = parseFloat(container.getAttribute('aria-valuenow')) || 50;
        var step = 2;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          setPosition(current - step);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          setPosition(current + step);
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    BeforeAfter.init();
  });
})();
