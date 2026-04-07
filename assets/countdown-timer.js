/**
 * LenSuh — Countdown Timer (S10)
 * ONLY with real end date — NO fake/looping timers.
 * Theme Store Req. 8: No deceptive CRO patterns.
 * Auto-hides when timer reaches 0.
 */

(function () {
  'use strict';

  var CountdownTimer = {
    timers: [],

    init: function () {
      var elements = document.querySelectorAll('[data-countdown-timer]');
      if (elements.length === 0) return;

      var self = this;
      elements.forEach(function (el) {
        var endDateStr = el.getAttribute('data-end-date');
        if (!endDateStr) return;

        var endDate = new Date(endDateStr);
        if (isNaN(endDate.getTime())) {
          console.error('[CountdownTimer] Invalid date:', endDateStr);
          return;
        }

        var timer = {
          el: el,
          endDate: endDate,
          daysEl: el.querySelector('[data-countdown-days]'),
          hoursEl: el.querySelector('[data-countdown-hours]'),
          minutesEl: el.querySelector('[data-countdown-minutes]'),
          secondsEl: el.querySelector('[data-countdown-seconds]'),
          interval: null
        };

        self.update(timer);
        timer.interval = setInterval(function () {
          self.update(timer);
        }, 1000);

        self.timers.push(timer);
      });
    },

    update: function (timer) {
      var now = new Date().getTime();
      var distance = timer.endDate.getTime() - now;

      if (distance <= 0) {
        // Timer expired — hide, NO restart/loop
        clearInterval(timer.interval);
        timer.el.hidden = true;
        timer.el.setAttribute('aria-hidden', 'true');
        return;
      }

      var SEC = 1000;
      var MIN = SEC * 60;
      var HOUR = MIN * 60;
      var DAY = HOUR * 24;

      var days = Math.floor(distance / DAY);
      var hours = Math.floor((distance % DAY) / HOUR);
      var minutes = Math.floor((distance % HOUR) / MIN);
      var seconds = Math.floor((distance % MIN) / SEC);

      if (timer.daysEl) timer.daysEl.textContent = this.pad(days);
      if (timer.hoursEl) timer.hoursEl.textContent = this.pad(hours);
      if (timer.minutesEl) timer.minutesEl.textContent = this.pad(minutes);
      if (timer.secondsEl) timer.secondsEl.textContent = this.pad(seconds);
    },

    pad: function (n) {
      return n < 10 ? '0' + n : String(n);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    CountdownTimer.init();
  });
})();
