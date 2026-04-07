/**
 * LenSuh — In-Store Pickup (S6)
 * Fetches pickup availability via Shopify API.
 */

(function () {
  'use strict';

  var InStorePickup = {
    el: null,

    init: function () {
      this.el = document.querySelector('[data-in-store-pickup]');
      if (!this.el) return;

      this.fetchAvailability();
      this.bindVariantChange();
    },

    bindVariantChange: function () {
      var self = this;
      window.theme.subscribe('variant:changed', function (data) {
        if (data && data.id) {
          self.el.setAttribute('data-variant-id', data.id);
          self.fetchAvailability();
        }
      });
    },

    fetchAvailability: function () {
      var variantId = this.el.getAttribute('data-variant-id');
      var baseUrl = this.el.getAttribute('data-base-url') || '';
      if (!variantId) return;

      var self = this;
      var url = baseUrl + '/variants/' + variantId + '/pickup_availability.json';

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          self.render(data.pick_up_availabilities || []);
        })
        .catch(function (err) {
          console.error('[InStorePickup] fetch failed:', err);
          self.el.textContent = '';
        });
    },

    render: function (locations) {
      var self = this;
      // Clear existing content safely
      while (self.el.firstChild) {
        self.el.removeChild(self.el.firstChild);
      }

      if (locations.length === 0) return;

      var templateEl = document.querySelector('[data-pickup-template]');
      if (!templateEl) return;
      var templateHTML = templateEl.textContent || templateEl.innerText;

      locations.forEach(function (loc) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(templateHTML.trim(), 'text/html');
        var el = doc.body.firstChild;
        if (!el) return;

        var clone = el.cloneNode(true);
        var statusEl = clone.querySelector('[data-pickup-status]');
        var nameEl = clone.querySelector('[data-pickup-name]');
        var addressEl = clone.querySelector('[data-pickup-address]');

        if (statusEl) {
          statusEl.textContent = loc.available
            ? (window.theme.strings.pickupAvailable || 'Available for pickup')
            : (window.theme.strings.pickupUnavailable || 'Unavailable');
          statusEl.className = 'in-store-pickup__status in-store-pickup__status--' +
            (loc.available ? 'available' : 'unavailable');
        }
        if (nameEl) {
          nameEl.textContent = loc.location.name || '';
        }
        if (addressEl) {
          var addr = loc.location.address || {};
          addressEl.textContent = [addr.address1, addr.city, addr.zip].filter(Boolean).join(', ');
        }

        self.el.appendChild(clone);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    InStorePickup.init();
  });
})();
