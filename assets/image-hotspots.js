/**
 * LenSuh — Image Hotspots (S12)
 * Click pin → show product tooltip. ESC/click-outside to close.
 * No innerHTML, addEventListener only, IIFE.
 */

(function () {
  'use strict';

  var ImageHotspots = {
    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      // Pin click toggle
      document.addEventListener('click', function (e) {
        var pin = e.target.closest('[data-hotspot-pin]');
        if (pin) {
          var index = pin.getAttribute('data-hotspot-pin');
          var section = pin.closest('[data-section-type="image-hotspots"]');
          if (!section) return;

          var tooltip = section.querySelector('[data-hotspot-tooltip="' + index + '"]');
          var isOpen = pin.getAttribute('aria-expanded') === 'true';

          // Close all others
          ImageHotspots.closeAll(section);

          if (!isOpen && tooltip) {
            pin.setAttribute('aria-expanded', 'true');
            tooltip.setAttribute('aria-hidden', 'false');
            tooltip.classList.add('image-hotspots__tooltip--visible');
          }
          return;
        }

        // Click outside closes tooltips
        if (!e.target.closest('[data-hotspot-tooltip]')) {
          document.querySelectorAll('[data-section-type="image-hotspots"]').forEach(function (section) {
            ImageHotspots.closeAll(section);
          });
        }
      });

      // ESC closes
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          document.querySelectorAll('[data-section-type="image-hotspots"]').forEach(function (section) {
            ImageHotspots.closeAll(section);
          });
        }
      });
    },

    closeAll: function (section) {
      section.querySelectorAll('[data-hotspot-pin]').forEach(function (p) {
        p.setAttribute('aria-expanded', 'false');
      });
      section.querySelectorAll('[data-hotspot-tooltip]').forEach(function (t) {
        t.setAttribute('aria-hidden', 'true');
        t.classList.remove('image-hotspots__tooltip--visible');
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    ImageHotspots.init();
  });
})();
