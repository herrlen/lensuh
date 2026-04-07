/**
 * LenSuh — Cart Drawer (S5)
 * Slide-in cart with Ajax API, optimistic UI, body-scroll-lock.
 * Loaded via theme.loadModule('cart-drawer.js') or directly with defer.
 */

(function () {
  'use strict';

  var SELECTORS = {
    drawer: '#cart-drawer',
    overlay: '[data-cart-drawer-close]',
    body: '[data-cart-drawer-body]',
    items: '[data-cart-drawer-items]',
    empty: '[data-cart-drawer-empty]',
    footer: '[data-cart-drawer-footer]',
    subtotal: '[data-cart-drawer-subtotal]',
    note: '[data-cart-note]',
    cartCount: '[data-cart-count]',
    qtyMinus: '[data-qty-minus]',
    qtyPlus: '[data-qty-plus]',
    qtyInput: '[data-qty-input]',
    removeItem: '[data-remove-item]'
  };

  var CLASSES = {
    open: 'cart-drawer--open',
    bodyLock: 'overflow-hidden',
    updating: 'cart-drawer--updating'
  };

  var CartDrawer = {
    el: null,
    isOpen: false,

    init: function () {
      this.el = document.querySelector(SELECTORS.drawer);
      if (!this.el) return;

      this.bindEvents();
      this.subscribeToEvents();
    },

    bindEvents: function () {
      var self = this;

      // Close buttons + overlay
      this.el.querySelectorAll(SELECTORS.overlay).forEach(function (btn) {
        btn.addEventListener('click', function () { self.close(); });
      });

      // ESC key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.isOpen) {
          self.close();
        }
      });

      // Quantity + Remove (delegated)
      this.el.addEventListener('click', function (e) {
        var minus = e.target.closest(SELECTORS.qtyMinus);
        var plus = e.target.closest(SELECTORS.qtyPlus);
        var remove = e.target.closest(SELECTORS.removeItem);

        if (minus) {
          self.handleQuantity(minus, -1);
        } else if (plus) {
          self.handleQuantity(plus, 1);
        } else if (remove) {
          var key = remove.getAttribute('data-line-key');
          self.updateItem(key, 0);
        }
      });

      // Quantity direct input (debounced)
      this.el.addEventListener('change', function (e) {
        var input = e.target.closest(SELECTORS.qtyInput);
        if (!input) return;
        var key = input.getAttribute('data-line-key');
        var qty = parseInt(input.value, 10);
        if (isNaN(qty) || qty < 0) qty = 0;
        self.updateItem(key, qty);
      });

      // Cart note (debounced)
      var noteEl = this.el.querySelector(SELECTORS.note);
      if (noteEl) {
        noteEl.addEventListener('change', function () {
          self.updateNote(noteEl.value);
        });
      }
    },

    subscribeToEvents: function () {
      var self = this;

      window.theme.subscribe('cart:item-added', function () {
        self.refresh().then(function () {
          self.open();
        });
      });

      window.theme.subscribe('cart:updated', function () {
        self.refresh();
      });
    },

    open: function () {
      if (!this.el || this.isOpen) return;
      this.isOpen = true;
      this.el.classList.add(CLASSES.open);
      this.el.setAttribute('aria-hidden', 'false');
      document.body.classList.add(CLASSES.bodyLock);
      window.theme.trapFocus(this.el.querySelector('.cart-drawer__panel'));
      window.theme.publish('cart-drawer:open');
    },

    close: function () {
      if (!this.el || !this.isOpen) return;
      this.isOpen = false;
      this.el.classList.remove(CLASSES.open);
      this.el.setAttribute('aria-hidden', 'true');
      document.body.classList.remove(CLASSES.bodyLock);
      window.theme.publish('cart-drawer:close');
    },

    handleQuantity: function (btn, delta) {
      var item = btn.closest('[data-cart-item]');
      if (!item) return;
      var input = item.querySelector(SELECTORS.qtyInput);
      var key = input.getAttribute('data-line-key');
      var newQty = Math.max(0, parseInt(input.value, 10) + delta);

      // Optimistic UI
      input.value = newQty;
      this.updateItem(key, newQty);
    },

    updateItem: function (key, quantity) {
      var self = this;
      this.el.classList.add(CLASSES.updating);

      return fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (cart) {
          self.renderCart(cart);
          self.updateCartCount(cart.item_count);
          window.theme.publish('cart:updated', cart);
        })
        .catch(function (err) {
          console.error('[CartDrawer] updateItem failed:', err);
          var msg = window.theme.strings.fetchError || 'Something went wrong.';
          window.theme.Toast.show(msg, 4000);
          self.refresh();
        })
        .finally(function () {
          self.el.classList.remove(CLASSES.updating);
        });
    },

    updateNote: function (note) {
      fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note })
      }).catch(function (err) {
        console.error('[CartDrawer] updateNote failed:', err);
      });
    },

    refresh: function () {
      var self = this;
      return fetch('/cart.js', {
        headers: { 'Content-Type': 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          self.renderCart(cart);
          self.updateCartCount(cart.item_count);
        })
        .catch(function (err) {
          console.error('[CartDrawer] refresh failed:', err);
        });
    },

    renderCart: function (cart) {
      var body = this.el.querySelector(SELECTORS.body);
      var footer = this.el.querySelector(SELECTORS.footer);
      var subtotal = this.el.querySelector(SELECTORS.subtotal);

      if (cart.item_count === 0) {
        body.innerHTML = '';
        var emptyDiv = document.createElement('div');
        emptyDiv.className = 'cart-drawer__empty';
        emptyDiv.setAttribute('data-cart-drawer-empty', '');

        var p = document.createElement('p');
        p.textContent = window.theme.strings.cartEmpty || 'Your cart is empty';
        emptyDiv.appendChild(p);

        var link = document.createElement('a');
        link.href = '/collections/all';
        link.className = 'btn btn--primary';
        link.setAttribute('data-cart-drawer-close', '');
        link.textContent = window.theme.strings.continueShopping || 'Continue shopping';
        emptyDiv.appendChild(link);

        body.appendChild(emptyDiv);
        if (footer) footer.hidden = true;
        return;
      }

      if (footer) {
        footer.hidden = false;
      }
      if (subtotal) {
        subtotal.textContent = this.formatMoney(cart.total_price);
      }

      // Re-fetch section HTML for full re-render
      this.fetchSectionHTML();
    },

    fetchSectionHTML: function () {
      var self = this;
      var sectionId = this.el.getAttribute('data-section-id');

      fetch('/?section_id=' + sectionId)
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var newDrawer = doc.querySelector(SELECTORS.drawer);
          if (newDrawer && self.el) {
            var newBody = newDrawer.querySelector(SELECTORS.body);
            var newFooter = newDrawer.querySelector(SELECTORS.footer);
            var currentBody = self.el.querySelector(SELECTORS.body);
            var currentFooter = self.el.querySelector(SELECTORS.footer);

            if (newBody && currentBody) {
              currentBody.innerHTML = newBody.innerHTML;
            }
            if (newFooter && currentFooter) {
              currentFooter.innerHTML = newFooter.innerHTML;
              currentFooter.hidden = newFooter.hidden;
            }
          }
        })
        .catch(function (err) {
          console.error('[CartDrawer] fetchSectionHTML failed:', err);
        });
    },

    updateCartCount: function (count) {
      document.querySelectorAll(SELECTORS.cartCount).forEach(function (el) {
        el.textContent = count;
      });
    },

    formatMoney: function (cents) {
      return (cents / 100).toLocaleString(undefined, {
        style: 'currency',
        currency: window.theme.currency || 'EUR'
      });
    }
  };

  // Register as lazy section or init immediately
  if (window.theme && window.theme.registerSection) {
    window.theme.registerSection('cart-drawer', function () {
      CartDrawer.init();
    });
  }

  // Also init on DOMContentLoaded for non-lazy loading
  document.addEventListener('DOMContentLoaded', function () {
    CartDrawer.init();
  });

  // Expose for external access
  window.theme = window.theme || {};
  window.theme.CartDrawer = CartDrawer;
})();
