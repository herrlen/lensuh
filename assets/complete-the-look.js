/**
 * LenSuh — Complete the Look (S12)
 * "Add all" — adds all look products to cart via Ajax.
 * No innerHTML, .catch() on all fetches, IIFE.
 */

(function () {
  'use strict';

  var CompleteTheLook = {
    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-add-all-look]');
        if (!btn) return;

        var section = btn.closest('[data-section-type="complete-the-look"]');
        if (!section) return;

        var items = section.querySelectorAll('[data-look-item]');
        if (items.length === 0) return;

        btn.disabled = true;
        btn.textContent = window.theme.strings.adding || 'Adding...';

        var addItems = [];
        items.forEach(function (item) {
          var variantId = item.getAttribute('data-variant-id');
          if (variantId) {
            addItems.push({ id: parseInt(variantId, 10), quantity: 1 });
          }
        });

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: addItems })
        })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(function () {
            window.theme.Toast.show(
              window.theme.strings.cartUpdated || 'Cart updated',
              'success'
            );
            window.theme.publish('cart:item-added');
            btn.textContent = window.theme.strings.added || 'Added!';
            setTimeout(function () {
              btn.disabled = false;
              btn.textContent = window.theme.strings.addAll || 'Add all to cart';
            }, 2000);
          })
          .catch(function (err) {
            console.error('[CompleteTheLook] add failed:', err);
            window.theme.Toast.show(
              window.theme.strings.fetchError || 'Something went wrong.',
              'error', 4000
            );
            btn.disabled = false;
            btn.textContent = window.theme.strings.addAll || 'Add all to cart';
          });
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    CompleteTheLook.init();
  });
})();
