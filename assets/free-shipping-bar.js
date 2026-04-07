/**
 * LenSuh — Free Shipping Bar (S6)
 * Updates live when cart changes via Event-Bus.
 */

(function () {
  'use strict';

  var FreeShippingBar = {
    el: null,
    threshold: 0,

    init: function () {
      this.el = document.querySelector('[data-free-shipping-bar]');
      if (!this.el) return;

      this.threshold = parseInt(this.el.getAttribute('data-threshold'), 10) || 0;
      if (this.threshold === 0) return;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;
      window.theme.subscribe('cart:updated', function (cart) {
        if (cart && typeof cart.total_price !== 'undefined') {
          self.update(cart.total_price);
        }
      });
      window.theme.subscribe('cart:item-added', function () {
        self.fetchAndUpdate();
      });
    },

    fetchAndUpdate: function () {
      var self = this;
      fetch('/cart.js', { headers: { 'Content-Type': 'application/json' } })
        .then(function (res) { return res.json(); })
        .then(function (cart) { self.update(cart.total_price); })
        .catch(function (err) {
          console.error('[FreeShippingBar] fetch failed:', err);
        });
    },

    update: function (cartTotal) {
      var remaining = Math.max(0, this.threshold - cartTotal);
      var progress = Math.min(100, Math.round((cartTotal / this.threshold) * 100));

      var messageEl = this.el.querySelector('[data-shipping-message]');
      var progressEl = this.el.querySelector('[data-shipping-progress]');

      if (messageEl) {
        if (remaining <= 0) {
          messageEl.textContent = window.theme.strings.freeShippingReached || 'Free shipping!';
        } else {
          var formatted = this.formatMoney(remaining);
          var template = window.theme.strings.freeShippingRemaining || 'Only {amount} until free shipping!';
          messageEl.textContent = template.replace('{amount}', formatted);
        }
      }

      if (progressEl) {
        progressEl.style.width = progress + '%';
        progressEl.setAttribute('aria-valuenow', String(progress));
      }
    },

    formatMoney: function (cents) {
      return (cents / 100).toLocaleString(undefined, {
        style: 'currency',
        currency: window.theme.currency || 'EUR'
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    FreeShippingBar.init();
  });
})();
