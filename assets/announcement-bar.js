/**
 * LenSuh — Announcement Bar (S10)
 * Multi-slide rotation, dismissable (cookie), countdown support.
 * No innerHTML, addEventListener only.
 */

(function () {
  'use strict';

  var COOKIE_NAME = 'announcement_dismissed';
  var COOKIE_DAYS = 7;

  var AnnouncementBar = {
    el: null,
    slides: [],
    currentIndex: 0,
    interval: null,

    init: function () {
      this.el = document.querySelector('[data-section-type="announcement-bar"]');
      if (!this.el) return;

      // Check if dismissed
      if (this.el.getAttribute('data-dismissable') === 'true' && this.getCookie(COOKIE_NAME)) {
        this.el.hidden = true;
        return;
      }

      this.slides = this.el.querySelectorAll('[data-announcement-slide]');
      if (this.slides.length <= 1) return;

      this.bindEvents();
      this.startAutoRotate();
    },

    bindEvents: function () {
      var self = this;

      var prevBtn = this.el.querySelector('[data-announcement-prev]');
      var nextBtn = this.el.querySelector('[data-announcement-next]');
      var dismissBtn = this.el.querySelector('[data-announcement-dismiss]');

      if (prevBtn) {
        prevBtn.addEventListener('click', function () { self.prev(); });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () { self.next(); });
      }
      if (dismissBtn) {
        dismissBtn.addEventListener('click', function () { self.dismiss(); });
      }
    },

    show: function (index) {
      this.slides.forEach(function (slide, i) {
        slide.classList.toggle('announcement-bar__slide--active', i === index);
      });
      this.currentIndex = index;
    },

    next: function () {
      var nextIndex = (this.currentIndex + 1) % this.slides.length;
      this.show(nextIndex);
      this.resetAutoRotate();
    },

    prev: function () {
      var prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
      this.show(prevIndex);
      this.resetAutoRotate();
    },

    startAutoRotate: function () {
      var self = this;
      var sectionEl = this.el.closest('[data-section-id]');
      var speed = 5;
      if (sectionEl) {
        // Read from section settings via data attribute or default
        speed = parseInt(sectionEl.getAttribute('data-auto-rotate'), 10) || 5;
      }
      if (speed === 0) return;

      this.interval = setInterval(function () {
        self.next();
      }, speed * 1000);
    },

    resetAutoRotate: function () {
      clearInterval(this.interval);
      this.startAutoRotate();
    },

    dismiss: function () {
      this.el.hidden = true;
      this.setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
      clearInterval(this.interval);
    },

    setCookie: function (name, value, days) {
      var expires = '';
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
    },

    getCookie: function (name) {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    AnnouncementBar.init();
  });
})();
