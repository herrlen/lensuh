/**
 * LenSuh — Shoppable Video (S14)
 * Shows/hides product pins based on video currentTime.
 * Click pin → product card overlay with Quick-Add.
 * No innerHTML, IIFE, === only, addEventListener.
 */

(function () {
  'use strict';

  var ShoppableVideo = {
    init: function () {
      document.querySelectorAll('[data-section-type="shoppable-video"]').forEach(function (section) {
        ShoppableVideo.setup(section);
      });
    },

    setup: function (section) {
      var pins = section.querySelectorAll('[data-shoppable-pin]');
      if (pins.length === 0) return;

      // Find the video element (could be in facade player)
      var checkVideo = function () {
        var video = section.querySelector('video');
        if (video) {
          ShoppableVideo.bindTimeUpdate(section, video, pins);
        } else {
          // Retry after facade is activated
          var observer = new MutationObserver(function () {
            var v = section.querySelector('video');
            if (v) {
              observer.disconnect();
              ShoppableVideo.bindTimeUpdate(section, v, pins);
            }
          });
          observer.observe(section, { childList: true, subtree: true });
        }
      };

      checkVideo();
      ShoppableVideo.bindPinEvents(section);
    },

    bindTimeUpdate: function (section, video, pins) {
      video.addEventListener('timeupdate', function () {
        var currentTime = video.currentTime;

        pins.forEach(function (pin) {
          var start = parseFloat(pin.getAttribute('data-timestamp-start')) || 0;
          var end = parseFloat(pin.getAttribute('data-timestamp-end')) || 0;
          var shouldShow = currentTime >= start && currentTime <= end;

          pin.hidden = !shouldShow;
        });
      });
    },

    bindPinEvents: function (section) {
      // Pin click → toggle card
      section.addEventListener('click', function (e) {
        var pin = e.target.closest('[data-shoppable-pin]');
        if (pin) {
          var index = pin.getAttribute('data-shoppable-pin');
          var card = section.querySelector('[data-shoppable-card="' + index + '"]');
          var isOpen = pin.getAttribute('aria-expanded') === 'true';

          ShoppableVideo.closeAllCards(section);

          if (!isOpen && card) {
            pin.setAttribute('aria-expanded', 'true');
            card.setAttribute('aria-hidden', 'false');
            card.classList.add('shoppable-video__card--visible');
          }
          return;
        }

        // Card close button
        var closeBtn = e.target.closest('[data-shoppable-card-close]');
        if (closeBtn) {
          ShoppableVideo.closeAllCards(section);
          return;
        }

        // Click outside cards
        if (!e.target.closest('[data-shoppable-card]') && !e.target.closest('[data-shoppable-pin]')) {
          ShoppableVideo.closeAllCards(section);
        }
      });

      // ESC closes cards
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          ShoppableVideo.closeAllCards(section);
        }
      });
    },

    closeAllCards: function (section) {
      section.querySelectorAll('[data-shoppable-pin]').forEach(function (p) {
        p.setAttribute('aria-expanded', 'false');
      });
      section.querySelectorAll('[data-shoppable-card]').forEach(function (c) {
        c.setAttribute('aria-hidden', 'true');
        c.classList.remove('shoppable-video__card--visible');
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    ShoppableVideo.init();
  });
})();
