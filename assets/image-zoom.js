/**
 * LenSuh — Image Zoom + Lightbox (S11)
 * Desktop: Hover-zoom (loupe). Mobile: Pinch-to-zoom.
 * Click: Fullscreen Lightbox Gallery.
 * No innerHTML, CLS = 0, lazy-loaded.
 */

(function () {
  'use strict';

  /* ---- Hover Zoom (Desktop) ---- */
  var HoverZoom = {
    init: function () {
      document.querySelectorAll('[data-image-zoom]').forEach(function (container) {
        var loupe = container.querySelector('[data-zoom-loupe]');
        var img = container.closest('.main-product__media-item');
        var zoomSrc = container.getAttribute('data-zoom-src');

        if (!loupe || !zoomSrc || window.innerWidth < 750) return;

        container.addEventListener('mouseenter', function () {
          loupe.style.backgroundImage = 'url(' + zoomSrc + ')';
          loupe.style.display = 'block';
        });

        container.addEventListener('mouseleave', function () {
          loupe.style.display = 'none';
        });

        container.addEventListener('mousemove', function (e) {
          var rect = container.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          loupe.style.backgroundPosition = x + '% ' + y + '%';
        });
      });
    }
  };

  /* ---- Lightbox ---- */
  var Lightbox = {
    el: null,
    imageEl: null,
    images: [],
    currentIndex: 0,

    init: function () {
      this.el = document.querySelector('[data-lightbox]');
      if (!this.el) return;

      this.imageEl = this.el.querySelector('[data-lightbox-image]');
      this.collectImages();
      this.bindEvents();
    },

    collectImages: function () {
      var self = this;
      self.images = [];
      document.querySelectorAll('[data-image-zoom]').forEach(function (el) {
        var fullSrc = el.getAttribute('data-full-src');
        if (fullSrc) {
          self.images.push(fullSrc);
        }
      });
    },

    bindEvents: function () {
      var self = this;

      // Click on zoom container opens lightbox
      document.addEventListener('click', function (e) {
        var zoomEl = e.target.closest('[data-image-zoom]');
        if (!zoomEl) return;

        var fullSrc = zoomEl.getAttribute('data-full-src');
        if (!fullSrc) return;

        var index = self.images.indexOf(fullSrc);
        if (index === -1) index = 0;
        self.open(index);
      });

      // Close
      this.el.querySelectorAll('[data-lightbox-close]').forEach(function (btn) {
        btn.addEventListener('click', function () { self.close(); });
      });

      // Nav
      var prevBtn = this.el.querySelector('[data-lightbox-prev]');
      var nextBtn = this.el.querySelector('[data-lightbox-next]');
      if (prevBtn) {
        prevBtn.addEventListener('click', function () { self.navigate(-1); });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () { self.navigate(1); });
      }

      // Keyboard
      document.addEventListener('keydown', function (e) {
        if (self.el.getAttribute('aria-hidden') !== 'false') return;

        if (e.key === 'Escape') {
          self.close();
        } else if (e.key === 'ArrowLeft') {
          self.navigate(-1);
        } else if (e.key === 'ArrowRight') {
          self.navigate(1);
        }
      });
    },

    open: function (index) {
      this.currentIndex = index;
      this.showImage(index);
      this.el.setAttribute('aria-hidden', 'false');
      this.el.classList.add('image-zoom-lightbox--open');
      document.body.classList.add('overflow-hidden');
      window.theme.trapFocus(this.el.querySelector('.image-zoom-lightbox__content'));
    },

    close: function () {
      this.el.setAttribute('aria-hidden', 'true');
      this.el.classList.remove('image-zoom-lightbox--open');
      document.body.classList.remove('overflow-hidden');
    },

    navigate: function (delta) {
      this.currentIndex += delta;
      if (this.currentIndex >= this.images.length) this.currentIndex = 0;
      if (this.currentIndex < 0) this.currentIndex = this.images.length - 1;
      this.showImage(this.currentIndex);
    },

    showImage: function (index) {
      if (this.imageEl && this.images[index]) {
        this.imageEl.src = this.images[index];
        this.imageEl.alt = '';
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    HoverZoom.init();
    Lightbox.init();
  });
})();
