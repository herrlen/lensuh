/**
 * LenSuh — Collection Filters + Sorting (S8)
 * Shopify Storefront Filtering API, Ajax-based, URL-driven.
 * No innerHTML — uses DOMParser + cloneNode.
 */

(function () {
  'use strict';

  var SELECTORS = {
    section: '[data-section-type="collection"]',
    form: '[data-filter-form]',
    panel: '[data-filter-panel]',
    toggle: '[data-filter-drawer-toggle]',
    close: '[data-filter-drawer-close]',
    products: '[data-collection-products]',
    grid: '[data-product-grid]',
    count: '[data-product-count]',
    chips: '[data-active-chips]',
    chipRemove: '[data-chip-remove]',
    sort: '[data-sort-select]',
    clear: '[data-filter-clear]',
    checkbox: '[data-filter-checkbox]',
    priceMin: '[data-filter-price-min]',
    priceMax: '[data-filter-price-max]'
  };

  var CollectionFilters = {
    section: null,
    sectionId: null,

    init: function () {
      this.section = document.querySelector(SELECTORS.section);
      if (!this.section) return;
      this.sectionId = this.section.getAttribute('data-section-id');
      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      // Filter form submit
      var form = this.section.querySelector(SELECTORS.form);
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          self.applyFilters();
        });

        // Checkbox change → auto-apply on desktop
        form.addEventListener('change', function (e) {
          if (e.target.matches(SELECTORS.checkbox) && window.innerWidth >= 750) {
            self.applyFilters();
          }
        });
      }

      // Sort change
      var sortSelect = this.section.querySelector(SELECTORS.sort);
      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          self.applyFilters();
        });
      }

      // Chip remove (delegated)
      this.section.addEventListener('click', function (e) {
        var chip = e.target.closest(SELECTORS.chipRemove);
        if (chip) {
          e.preventDefault();
          self.fetchAndRender(chip.href);
        }

        var clear = e.target.closest(SELECTORS.clear);
        if (clear) {
          e.preventDefault();
          self.fetchAndRender(clear.href);
        }
      });

      // Mobile filter drawer
      var toggle = this.section.querySelector(SELECTORS.toggle);
      var panel = this.section.querySelector(SELECTORS.panel);
      var closeBtn = this.section.querySelector(SELECTORS.close);

      if (toggle && panel) {
        toggle.addEventListener('click', function () {
          var isOpen = panel.getAttribute('aria-hidden') === 'false';
          if (isOpen) {
            self.closeDrawer(toggle, panel);
          } else {
            self.openDrawer(toggle, panel);
          }
        });
      }

      if (closeBtn && panel && toggle) {
        closeBtn.addEventListener('click', function () {
          self.closeDrawer(toggle, panel);
        });
      }

      // ESC to close filter drawer
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel && panel.getAttribute('aria-hidden') === 'false') {
          self.closeDrawer(toggle, panel);
        }
      });
    },

    openDrawer: function (toggle, panel) {
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add('collection-filters__panel--open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('overflow-hidden');
      window.theme.trapFocus(panel);
    },

    closeDrawer: function (toggle, panel) {
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('collection-filters__panel--open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
      if (toggle) toggle.focus();
    },

    applyFilters: function () {
      var form = this.section.querySelector(SELECTORS.form);
      var sort = this.section.querySelector(SELECTORS.sort);
      if (!form) return;

      var formData = new FormData(form);
      var params = new URLSearchParams();

      for (var pair of formData.entries()) {
        if (pair[1] !== '' && pair[1] !== '0') {
          params.append(pair[0], pair[1]);
        }
      }

      if (sort && sort.value) {
        params.set('sort_by', sort.value);
      }

      var collectionUrl = this.section.getAttribute('data-collection-url') || window.location.pathname;
      var url = collectionUrl + '?' + params.toString();

      this.fetchAndRender(url);
    },

    fetchAndRender: function (url) {
      var self = this;
      var sectionUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + 'section_id=' + this.sectionId;

      // Update URL without reload
      window.history.pushState({}, '', url);

      this.section.classList.add('main-collection--loading');

      fetch(sectionUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');

          // Replace products area via cloneNode
          var newProducts = doc.querySelector(SELECTORS.products);
          var currentProducts = self.section.querySelector(SELECTORS.products);
          if (newProducts && currentProducts) {
            var cloned = newProducts.cloneNode(true);
            currentProducts.replaceWith(cloned);
          }

          // Replace filters panel via cloneNode
          var newFilters = doc.querySelector('[data-collection-filters]');
          var currentFilters = self.section.querySelector('[data-collection-filters]');
          if (newFilters && currentFilters) {
            var clonedFilters = newFilters.cloneNode(true);
            currentFilters.replaceWith(clonedFilters);
          }

          self.section.classList.remove('main-collection--loading');

          // Re-bind events after DOM replacement
          self.bindEvents();

          // Scroll to top of collection
          self.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(function (err) {
          console.error('[CollectionFilters] fetch failed:', err);
          self.section.classList.remove('main-collection--loading');
          window.theme.Toast.show(
            window.theme.strings.fetchError || 'Something went wrong.',
            'error', 4000
          );
        });
    }
  };

  // Handle browser back/forward
  window.addEventListener('popstate', function () {
    window.location.reload();
  });

  document.addEventListener('DOMContentLoaded', function () {
    CollectionFilters.init();
  });
})();
