/**
 * LenSuh — Cross-Selling (S10)
 * Shopify Recommendations API, lazy-loaded via Intersection Observer.
 * No innerHTML — uses Section Rendering API + DOMParser + cloneNode.
 */

(function () {
  'use strict';

  var CrossSelling = {
    init: function () {
      var sections = document.querySelectorAll('[data-section-type="cross-selling"]');
      if (sections.length === 0) return;

      sections.forEach(function (section) {
        var productId = section.getAttribute('data-product-id');
        if (!productId) return;

        CrossSelling.load(section, productId);
      });
    },

    load: function (section, productId) {
      var sectionId = section.getAttribute('data-section-id');
      var baseUrl = section.getAttribute('data-base-url') || '';
      var maxProducts = section.getAttribute('data-max-products') || '4';

      var url = baseUrl + '/recommendations/products?product_id=' + productId +
        '&limit=' + maxProducts +
        '&section_id=' + sectionId;

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var newGrid = doc.querySelector('[data-cross-selling-grid]');
          var currentGrid = section.querySelector('[data-cross-selling-grid]');

          if (newGrid && currentGrid && newGrid.children.length > 0) {
            var cloned = newGrid.cloneNode(true);
            currentGrid.replaceWith(cloned);
          }
        })
        .catch(function (err) {
          console.error('[CrossSelling] load failed:', err);
        });
    }
  };

  // Lazy-load via Intersection Observer registration
  if (window.theme && window.theme.registerSection) {
    window.theme.registerSection('cross-selling', function (section) {
      var productId = section.getAttribute('data-product-id');
      if (productId) {
        CrossSelling.load(section, productId);
      }
    });
  }

  // Also init on DOMContentLoaded for non-lazy
  document.addEventListener('DOMContentLoaded', function () {
    CrossSelling.init();
  });
})();
