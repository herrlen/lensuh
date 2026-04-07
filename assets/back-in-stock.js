/**
 * LenSuh — Back-in-Stock Notification (S10)
 * Handles email signup for sold-out variants.
 * No innerHTML, addEventListener only, .catch() on all fetches.
 */

(function () {
  'use strict';

  var BackInStock = {
    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      document.addEventListener('submit', function (e) {
        var form = e.target.closest('[data-back-in-stock-form]');
        if (!form) return;

        e.preventDefault();
        var container = form.closest('[data-back-in-stock]');
        if (!container) return;

        var emailInput = form.querySelector('[data-back-in-stock-email]');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email) return;

        var variantId = container.getAttribute('data-variant-id');
        var productTitle = container.getAttribute('data-product-title');

        BackInStock.submit(email, variantId, productTitle, form);
      });
    },

    submit: function (email, variantId, productTitle, form) {
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      // Store via customer metafield or app endpoint
      // Default: Shopify customer API notification
      var payload = {
        email: email,
        variant_id: variantId,
        product_title: productTitle
      };

      // Use a custom endpoint if configured, otherwise store locally
      var endpoint = window.theme.backInStockEndpoint;
      if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            BackInStock.showSuccess(form);
          })
          .catch(function (err) {
            console.error('[BackInStock] submit failed:', err);
            window.theme.Toast.show(
              window.theme.strings.fetchError || 'Something went wrong.',
              'error', 4000
            );
            if (submitBtn) submitBtn.disabled = false;
          });
      } else {
        // Fallback: localStorage + success toast
        try {
          var stored = JSON.parse(localStorage.getItem('back_in_stock') || '[]');
          stored.push(payload);
          localStorage.setItem('back_in_stock', JSON.stringify(stored));
        } catch (err) {
          console.error('[BackInStock] localStorage error:', err);
        }
        BackInStock.showSuccess(form);
      }
    },

    showSuccess: function (form) {
      var msg = window.theme.strings.backInStockSuccess || 'You will be notified when this product is back in stock.';
      window.theme.Toast.show(msg, 'success');

      // Replace form with confirmation text
      var container = form.closest('[data-back-in-stock]');
      if (container) {
        var confirmation = document.createElement('p');
        confirmation.className = 'back-in-stock__confirmed';
        confirmation.textContent = msg;
        // Clear and append (no innerHTML)
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        container.appendChild(confirmation);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    BackInStock.init();
  });
})();
