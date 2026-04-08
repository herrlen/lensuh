/**
 * LenSuh — Color Swatches (S11)
 * Switches variant image on hover/click, updates price.
 * No innerHTML, addEventListener only, === only.
 */

(function () {
  'use strict';

  var ColorSwatches = {
    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      document.addEventListener('click', function (e) {
        var swatch = e.target.closest('[data-swatch-value]');
        if (!swatch) return;

        var container = swatch.closest('[data-color-swatches]');
        if (!container) return;

        // Update active state
        container.querySelectorAll('[data-swatch-value]').forEach(function (s) {
          var isActive = s === swatch;
          s.classList.toggle('color-swatches__swatch--active', isActive);
          s.setAttribute('aria-checked', String(isActive));
        });

        // Update variant image
        var imageUrl = swatch.getAttribute('data-variant-image');
        if (imageUrl) {
          var mainImage = document.querySelector('.main-product__media-item--active img');
          if (mainImage) {
            mainImage.src = imageUrl;
            mainImage.srcset = '';
          }
        }

        // Update price
        var price = swatch.getAttribute('data-variant-price');
        if (price) {
          var priceEl = document.querySelector('.main-product__price-current');
          if (priceEl) {
            priceEl.textContent = ColorSwatches.formatMoney(parseInt(price, 10));
          }
        }

        // Update hidden variant select
        var variantId = swatch.getAttribute('data-variant-id');
        if (variantId) {
          var select = document.querySelector('.main-product__variant-select');
          if (select) {
            select.value = variantId;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }

          // Update form hidden input
          var formInput = document.querySelector('.main-product__buy input[name="id"]');
          if (formInput) {
            formInput.value = variantId;
          }

          // Publish variant change event
          window.theme.publish('variant:changed', { id: variantId });
        }
      });
    },

    formatMoney: function (cents) {
      return (cents / 100).toLocaleString(undefined, {
        style: 'currency',
        currency: window.theme.currency || 'EUR'
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    ColorSwatches.init();
  });
})();
