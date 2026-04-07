/**
 * LenSuh — Sticky ATC + Quick Buy (S5)
 * Handles sticky add-to-cart bars, quantity, variant sync, buy now, and quick buy.
 */

(function () {
  'use strict';

  /* ---- Sticky ATC (Mobile + Desktop) ---- */
  var StickyATC = {
    mobileEl: null,
    desktopEl: null,

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
      var observer = new IntersectionObserver(function (entries) {
        self.toggle(!entries[0].isIntersecting);
      }, { threshold: 0 });

      observer.observe(mainATC);
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
      // ATC buttons — read quantity from sibling input
      document.addEventListener('click', function (e) {
        var addBtn = e.target.closest('[data-sticky-atc-add]');
        if (addBtn) {
          var container = addBtn.closest('[data-sticky-atc-mobile], [data-sticky-atc-desktop]');
          var qtyInput = container ? container.querySelector('[data-sticky-qty-input]') : null;
          var qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
          if (isNaN(qty) || qty < 1) qty = 1;
          addToCart(addBtn.getAttribute('data-variant-id'), qty);
          return;
        }

        // Buy Now button
        var buyNow = e.target.closest('[data-sticky-buy-now]');
        if (buyNow) {
          var variantId = buyNow.getAttribute('data-variant-id');
          buyNowRedirect(variantId);
          return;
        }

        // Quantity +/- buttons
        var minus = e.target.closest('[data-sticky-qty-minus]');
        var plus = e.target.closest('[data-sticky-qty-plus]');
        if (minus || plus) {
          var parent = (minus || plus).closest('.sticky-atc-mobile__qty, .sticky-atc-desktop__qty');
          if (!parent) return;
          var input = parent.querySelector('[data-sticky-qty-input]');
          if (!input) return;
          var val = parseInt(input.value, 10) || 1;
          input.value = Math.max(1, val + (minus ? -1 : 1));
        }
      });

      // Variant select sync (desktop + mobile)
      document.querySelectorAll('[data-sticky-variant-select], [data-sticky-variant-select-mobile]').forEach(function (select) {
        select.addEventListener('change', function () {
          var container = select.closest('[data-sticky-atc-mobile], [data-sticky-atc-desktop]');
          if (!container) return;
          var btns = container.querySelectorAll('[data-sticky-atc-add], [data-sticky-buy-now]');
          btns.forEach(function (btn) {
            btn.setAttribute('data-variant-id', select.value);
          });
        });
      });
    }
  };

  /* ---- Quick Buy ---- */
  var QuickBuy = {
    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      document.addEventListener('click', function (e) {
        var addBtn = e.target.closest('[data-quick-add]');
        if (addBtn) {
          e.preventDefault();
          addBtn.disabled = true;
          addToCart(addBtn.getAttribute('data-variant-id'), 1)
            .finally(function () { addBtn.disabled = false; });
          return;
        }

        var modalBtn = e.target.closest('[data-quick-buy-modal-trigger]');
        if (modalBtn) {
          e.preventDefault();
          QuickBuy.openModal(modalBtn.getAttribute('data-product-url'));
        }
      });
    },

    openModal: function (productUrl) {
      fetch(productUrl + '?section_id=main-product')
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');

          var modal = document.createElement('div');
          modal.className = 'quick-buy-modal';
          modal.setAttribute('role', 'dialog');
          modal.setAttribute('aria-modal', 'true');

          var overlay = document.createElement('div');
          overlay.className = 'quick-buy-modal__overlay';

          var content = document.createElement('div');
          content.className = 'quick-buy-modal__content';

          var closeBtn = document.createElement('button');
          closeBtn.type = 'button';
          closeBtn.className = 'quick-buy-modal__close';
          closeBtn.setAttribute('aria-label', 'Close');
          closeBtn.textContent = '\u00D7';

          var variantsEl = doc.querySelector('.main-product__variants');
          var buyEl = doc.querySelector('.main-product__buy');
          if (variantsEl) content.appendChild(variantsEl.cloneNode(true));
          if (buyEl) content.appendChild(buyEl.cloneNode(true));
          content.appendChild(closeBtn);

          modal.appendChild(overlay);
          modal.appendChild(content);
          document.body.appendChild(modal);

          window.theme.trapFocus(content);

          var closeModal = function () {
            if (modal.parentNode) document.body.removeChild(modal);
            document.body.classList.remove('overflow-hidden');
          };

          overlay.addEventListener('click', closeModal);
          closeBtn.addEventListener('click', closeModal);
          document.addEventListener('keydown', function handler(ev) {
            if (ev.key === 'Escape') {
              closeModal();
              document.removeEventListener('keydown', handler);
            }
          });

          document.body.classList.add('overflow-hidden');
        })
        .catch(function (err) {
          console.error('[QuickBuy] Failed to load product:', err);
          window.theme.Toast.show(
            window.theme.strings.fetchError || 'Something went wrong.',
            'error', 4000
          );
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
        window.theme.Toast.show(
          window.theme.strings.cartUpdated || 'Cart updated',
          'success'
        );
        return item;
      })
      .catch(function (err) {
        console.error('[addToCart]', err);
        window.theme.Toast.show(
          window.theme.strings.fetchError || 'Something went wrong.',
          'error', 4000
        );
        throw err;
      });
  }

  /* ---- Buy Now: Skip cart, go straight to checkout ---- */
  function buyNowRedirect(variantId) {
    window.location.href = '/cart/' + variantId + ':1';
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    StickyATC.init();
    QuickBuy.init();
  });

  window.theme = window.theme || {};
  window.theme.addToCart = addToCart;
})();
