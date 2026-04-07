/**
 * LenSuh — Cart Drawer (S5)
 * Slide-in cart with Ajax API, optimistic UI, body-scroll-lock.
 * No innerHTML — uses DOMParser + cloneNode or DOM API.
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
    removeItem: '[data-remove-item]',
    undoBar: '[data-undo-bar]',
    undoBtn: '[data-undo-btn]'
  };

  var CLASSES = {
    open: 'cart-drawer--open',
    bodyLock: 'overflow-hidden',
    updating: 'cart-drawer--updating'
  };

  var UNDO_TIMEOUT_MS = 5000;

  var CartDrawer = {
    el: null,
    isOpen: false,
    _undoTimer: null,
    _undoData: null,

    init: function () {
      this.el = document.querySelector(SELECTORS.drawer);
      if (!this.el) return;

      this.bindEvents();
      this.subscribeToEvents();
    },

    bindEvents: function () {
      var self = this;

      // Close buttons + overlay (delegated)
      this.el.addEventListener('click', function (e) {
        if (e.target.closest(SELECTORS.overlay)) {
          self.close();
          return;
        }

        var minus = e.target.closest(SELECTORS.qtyMinus);
        var plus = e.target.closest(SELECTORS.qtyPlus);
        var remove = e.target.closest(SELECTORS.removeItem);
        var undo = e.target.closest(SELECTORS.undoBtn);

        if (minus) {
          self.handleQuantity(minus, -1);
        } else if (plus) {
          self.handleQuantity(plus, 1);
        } else if (remove) {
          var key = remove.getAttribute('data-line-key');
          self.removeWithUndo(key);
        } else if (undo) {
          self.undoRemove();
        }
      });

      // ESC key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.isOpen) {
          self.close();
        }
      });

      // Quantity direct input
      this.el.addEventListener('change', function (e) {
        var input = e.target.closest(SELECTORS.qtyInput);
        if (!input) return;
        var key = input.getAttribute('data-line-key');
        var qty = parseInt(input.value, 10);
        if (isNaN(qty) || qty < 0) qty = 0;
        self.updateItem(key, qty);
      });

      // Cart note
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
      input.value = newQty;
      this.updateItem(key, newQty);
    },

    /* ---- Remove with Undo ---- */
    removeWithUndo: function (key) {
      var self = this;
      var itemEl = this.el.querySelector('[data-line-key="' + key + '"][data-cart-item]');
      if (!itemEl) {
        this.updateItem(key, 0);
        return;
      }

      // Store undo data before removing
      var input = itemEl.querySelector(SELECTORS.qtyInput);
      var previousQty = input ? parseInt(input.value, 10) : 1;
      this._undoData = { key: key, quantity: previousQty };

      // Remove the item
      this.updateItem(key, 0);

      // Show undo bar
      this.showUndoBar();
    },

    showUndoBar: function () {
      var self = this;
      var bar = this.el.querySelector(SELECTORS.undoBar);
      if (bar) {
        bar.hidden = false;
      }
      clearTimeout(this._undoTimer);
      this._undoTimer = setTimeout(function () {
        self.hideUndoBar();
        self._undoData = null;
      }, UNDO_TIMEOUT_MS);
    },

    hideUndoBar: function () {
      var bar = this.el.querySelector(SELECTORS.undoBar);
      if (bar) {
        bar.hidden = true;
      }
    },

    undoRemove: function () {
      if (!this._undoData) return;
      clearTimeout(this._undoTimer);
      this.hideUndoBar();

      var data = this._undoData;
      this._undoData = null;

      // Re-add with original quantity
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.key, quantity: data.quantity })
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
        })
        .catch(function (err) {
          console.error('[CartDrawer] undo failed:', err);
          window.theme.Toast.show(
            window.theme.strings.fetchError || 'Something went wrong.',
            'error', 4000
          );
        });
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
          self.updateCartCount(cart.item_count);
          self.fetchSectionHTML();
        })
        .catch(function (err) {
          console.error('[CartDrawer] updateItem failed:', err);
          window.theme.Toast.show(
            window.theme.strings.fetchError || 'Something went wrong.',
            'error', 4000
          );
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
      self.fetchSectionHTML();
      return fetch('/cart.js', {
        headers: { 'Content-Type': 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          self.updateCartCount(cart.item_count);
        })
        .catch(function (err) {
          console.error('[CartDrawer] refresh failed:', err);
        });
    },

    /**
     * Re-render cart body+footer via Section Rendering API.
     * Uses DOMParser + cloneNode — NO innerHTML assignment.
     */
    fetchSectionHTML: function () {
      var self = this;
      var sectionId = this.el.getAttribute('data-section-id');

      fetch('/?section_id=' + sectionId)
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var newDrawer = doc.querySelector(SELECTORS.drawer);
          if (!newDrawer || !self.el) return;

          // Replace body content via cloneNode (no innerHTML)
          var newBody = newDrawer.querySelector(SELECTORS.body);
          var currentBody = self.el.querySelector(SELECTORS.body);
          if (newBody && currentBody) {
            var clonedBody = newBody.cloneNode(true);
            currentBody.replaceWith(clonedBody);
          }

          // Replace footer via cloneNode
          var newFooter = newDrawer.querySelector(SELECTORS.footer);
          var currentFooter = self.el.querySelector(SELECTORS.footer);
          if (newFooter && currentFooter) {
            var clonedFooter = newFooter.cloneNode(true);
            currentFooter.replaceWith(clonedFooter);
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

  if (window.theme && window.theme.registerSection) {
    window.theme.registerSection('cart-drawer', function () {
      CartDrawer.init();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    CartDrawer.init();
  });

  window.theme = window.theme || {};
  window.theme.CartDrawer = CartDrawer;
})();
