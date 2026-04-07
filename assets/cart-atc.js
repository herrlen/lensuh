/**
 * LenSuh — Sticky ATC + Quick Buy (S5)
 * Handles sticky add-to-cart bars and quick buy buttons.
 */

(function () {
  'use strict';

  /* ---- Sticky ATC (Mobile + Desktop) ---- */
  var StickyATC = {
    mobileEl: null,
    desktopEl: null,
    observer: null,

    init: function () {
      this.mobileEl = document.querySelector('[data-sticky-atc-mobile]');
      this.desktopEl = document.querySelector('[data-sticky-atc-desktop]');

      if (!this.mobileEl && !this.desktopEl) return;

      this.observeATC();
      this.bindEvents();
    },

    observeATC: function () {
      var mainATC = document.querySelector('.main-product__add-to-cart');
      if (!mainATC || !('IntersectionObserver' in window)) return;

      var self = this;
      this.observer = new IntersectionObserver(function (entries) {
        var isVisible = entries[0].isIntersecting;
        self.toggle(!isVisible);
      }, { threshold: 0 });

      this.observer.observe(mainATC);
    },

    toggle: function (show) {
      if (this.mobileEl) {
        this.mobileEl.classList.toggle('sticky-atc-mobile--visible', show);
        this.mobileEl.setAttribute('aria-hidden', String(!show));
      }
      if (this.desktopEl) {
        this.desktopEl.classList.toggle('sticky-atc-desktop--visible', show);
        this.desktopEl.setAttribute('aria-hidden', String(!show));
      }
    },

    bindEvents: function () {
      document.querySelectorAll('[data-sticky-atc-add]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var variantId = btn.getAttribute('data-variant-id');
          addToCart(variantId, 1);
        });
      });

      // Desktop variant select sync
      var variantSelect = document.querySelector('[data-sticky-variant-select]');
      if (variantSelect) {
        variantSelect.addEventListener('change', function () {
          var btn = variantSelect.closest('.sticky-atc-desktop__inner')
            .querySelector('[data-sticky-atc-add]');
          if (btn) {
            btn.setAttribute('data-variant-id', variantSelect.value);
          }
        });
      }
    }
  };

  /* ---- Quick Buy ---- */
  var QuickBuy = {
    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      // Direct add (no variants)
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-quick-add]');
        if (!btn) return;
        e.preventDefault();
        var variantId = btn.getAttribute('data-variant-id');
        btn.disabled = true;
        addToCart(variantId, 1).finally(function () {
          btn.disabled = false;
        });
      });

      // Modal trigger (has variants)
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-quick-buy-modal-trigger]');
        if (!btn) return;
        e.preventDefault();
        var productUrl = btn.getAttribute('data-product-url');
        QuickBuy.openModal(productUrl);
      });
    },

    openModal: function (productUrl) {
      // Fetch product section via Section Rendering API
      fetch(productUrl + '?section_id=main-product')
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var productForm = doc.querySelector('.main-product__variants, .main-product__buy');

          if (!productForm) return;

          // Create modal
          var modal = document.createElement('div');
          modal.className = 'quick-buy-modal';
          modal.setAttribute('role', 'dialog');
          modal.setAttribute('aria-modal', 'true');
          modal.setAttribute('aria-label', 'Quick buy');

          var overlay = document.createElement('div');
          overlay.className = 'quick-buy-modal__overlay';

          var content = document.createElement('div');
          content.className = 'quick-buy-modal__content';

          var closeBtn = document.createElement('button');
          closeBtn.type = 'button';
          closeBtn.className = 'quick-buy-modal__close';
          closeBtn.setAttribute('aria-label', 'Close');
          closeBtn.innerHTML = '&times;';

          // Get variants + buy section
          var variantsEl = doc.querySelector('.main-product__variants');
          var buyEl = doc.querySelector('.main-product__buy');
          if (variantsEl) content.appendChild(variantsEl.cloneNode(true));
          if (buyEl) content.appendChild(buyEl.cloneNode(true));
          content.appendChild(closeBtn);

          modal.appendChild(overlay);
          modal.appendChild(content);
          document.body.appendChild(modal);

          // Focus trap + close handlers
          window.theme.trapFocus(content);

          var closeModal = function () {
            document.body.removeChild(modal);
            document.body.classList.remove('overflow-hidden');
          };

          overlay.addEventListener('click', closeModal);
          closeBtn.addEventListener('click', closeModal);
          document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
              closeModal();
              document.removeEventListener('keydown', handler);
            }
          });

          document.body.classList.add('overflow-hidden');
        })
        .catch(function (err) {
          console.error('[QuickBuy] Failed to load product:', err);
          var msg = window.theme.strings.fetchError || 'Something went wrong.';
          window.theme.Toast.show(msg, 4000);
        });
    }
  };

  /* ---- Shared: Add to Cart ---- */
  function addToCart(variantId, quantity) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(variantId, 10),
        quantity: quantity || 1
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (item) {
        window.theme.publish('cart:item-added', item);
        var msg = window.theme.strings.cartUpdated || 'Cart updated';
        window.theme.Toast.show(msg);
        return item;
      })
      .catch(function (err) {
        console.error('[addToCart]', err);
        var msg = window.theme.strings.fetchError || 'Something went wrong.';
        window.theme.Toast.show(msg, 4000);
        throw err;
      });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    StickyATC.init();
    QuickBuy.init();
  });

  // Expose
  window.theme = window.theme || {};
  window.theme.addToCart = addToCart;
})();
