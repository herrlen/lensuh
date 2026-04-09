/**
 * LenSuh — Video Background (S13)
 * Intersection Observer: Play when visible, pause when not.
 * Also handles video-hero pause/play.
 * No innerHTML, IIFE, === only.
 */

(function () {
  'use strict';

  var VideoBackground = {
    init: function () {
      if (!('IntersectionObserver' in window)) return;

      var videos = document.querySelectorAll('[data-video-bg-el], [data-video-hero]');
      if (videos.length === 0) return;

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(function () {
              // Autoplay blocked — silent fail
            });
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.25 });

      videos.forEach(function (video) {
        observer.observe(video);
      });

      // Mobile static: hide video on mobile if setting enabled
      var heroWrappers = document.querySelectorAll('[data-video-hero-wrapper]');
      heroWrappers.forEach(function (wrapper) {
        var video = wrapper.querySelector('[data-video-hero]');
        if (video && window.innerWidth < 750) {
          var section = wrapper.closest('[data-section-type="video-hero"]');
          if (section) {
            // Check if mobile_static is implied by poster--desktop-only class
            var poster = wrapper.querySelector('.video-hero__poster--desktop-only');
            if (!poster) {
              // Mobile static enabled — hide video
              video.style.display = 'none';
            }
          }
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    VideoBackground.init();
  });
})();
