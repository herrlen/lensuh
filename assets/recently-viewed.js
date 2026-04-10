/**
 * LenSuh — Recently Viewed Products (S18)
 * localStorage-based product tracking.
 * Builds DOM via createElement (no innerHTML).
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'recently_viewed';
  var MAX_ITEMS = 8;

  var RecentlyViewed = {
    init: function () {
      this.trackCurrent();
      this.render();
    },

    trackCurrent: function () {
      // Track current product if on product page
      var productJson = document.querySelector('[data-current-product]');
      if (!productJson) return;

      try {
        var product = JSON.parse(productJson.textContent);
        if (!product || !product.id) return;

        var stored = this.getStored();
        stored = stored.filter(function (p) { return p.id !== product.id; });
        stored.unshift(product);
        stored = stored.slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch (e) {
        console.error('[RecentlyViewed] track error:', e);
      }
    },

    getStored: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },

    render: function () {
      var grid = document.querySelector('[data-recently-viewed-grid]');
      var empty = document.querySelector('[data-recently-viewed-empty]');
      if (!grid) return;

      var products = this.getStored();
      if (products.length === 0) {
        if (empty) empty.hidden = false;
        return;
      }

      if (empty) empty.hidden = true;

      products.forEach(function (p) {
        var link = document.createElement('a');
        link.href = p.url || '#';
        link.className = 'recently-viewed__card';

        if (p.image) {
          var img = document.createElement('img');
          img.src = p.image;
          img.alt = p.title || '';
          img.width = 150;
          img.height = 150;
          img.loading = 'lazy';
          img.className = 'recently-viewed__image';
          link.appendChild(img);
        }

        var title = document.createElement('span');
        title.className = 'recently-viewed__title';
        title.textContent = p.title || '';
        link.appendChild(title);

        if (p.price) {
          var price = document.createElement('span');
          price.className = 'recently-viewed__price';
          price.setAttribute('data-price-wrapper', '');
          price.textContent = p.price;
          link.appendChild(price);
        }

        grid.appendChild(link);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    RecentlyViewed.init();
  });
})();
