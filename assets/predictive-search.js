/**
 * LenSuh — Predictive Search (S7)
 * Shopify Predictive Search API with debounce, keyboard nav, aria-combobox.
 * No innerHTML — DOM API only.
 */

(function () {
  'use strict';

  var DEBOUNCE_MS = 300;

  var PredictiveSearch = {
    el: null,
    input: null,
    results: null,
    viewAll: null,
    toggleBtn: null,
    closeBtn: null,
    maxResults: 4,
    activeIndex: -1,
    items: [],

    init: function () {
      this.el = document.querySelector('[data-predictive-search]');
      if (!this.el) return;

      this.input = this.el.querySelector('[data-predictive-search-input]');
      this.results = this.el.querySelector('[data-predictive-search-results]');
      this.viewAll = this.el.querySelector('[data-search-view-all]');
      this.toggleBtn = document.querySelector('[data-search-toggle]');
      this.closeBtn = this.el.querySelector('[data-search-close]');
      this.maxResults = parseInt(this.el.getAttribute('data-max-results'), 10) || 4;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      // Toggle open
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', function () {
          var isOpen = self.el.getAttribute('aria-hidden') === 'false';
          if (isOpen) {
            self.close();
          } else {
            self.open();
          }
        });
      }

      // Close
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', function () {
          self.close();
        });
      }

      // Input: debounced search
      var debounced = window.theme.debounce(function () {
        var query = self.input.value.trim();
        if (query.length < 2) {
          self.clearResults();
          return;
        }
        self.search(query);
      }, DEBOUNCE_MS);

      this.input.addEventListener('input', debounced);

      // Keyboard navigation
      this.input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          self.navigate(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          self.navigate(-1);
        } else if (e.key === 'Enter' && self.activeIndex >= 0) {
          e.preventDefault();
          if (self.items[self.activeIndex]) {
            var link = self.items[self.activeIndex].querySelector('a');
            if (link) link.click();
          }
        } else if (e.key === 'Escape') {
          self.close();
        }
      });

      // Close on click outside
      document.addEventListener('click', function (e) {
        if (self.el.getAttribute('aria-hidden') === 'false' &&
            !e.target.closest('[data-predictive-search]') &&
            !e.target.closest('[data-search-toggle]')) {
          self.close();
        }
      });
    },

    open: function () {
      this.el.setAttribute('aria-hidden', 'false');
      this.el.classList.add('predictive-search--open');
      if (this.toggleBtn) {
        this.toggleBtn.setAttribute('aria-expanded', 'true');
      }
      this.input.focus();
    },

    close: function () {
      this.el.setAttribute('aria-hidden', 'true');
      this.el.classList.remove('predictive-search--open');
      if (this.toggleBtn) {
        this.toggleBtn.setAttribute('aria-expanded', 'false');
      }
      this.clearResults();
      this.input.value = '';
    },

    search: function (query) {
      var self = this;
      var url = '/search/suggest.json?q=' + encodeURIComponent(query) +
        '&resources[type]=product,collection,page,article' +
        '&resources[limit]=' + this.maxResults;

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          self.renderResults(data.resources.results, query);
        })
        .catch(function (err) {
          console.error('[PredictiveSearch] search failed:', err);
          window.theme.Toast.show(
            window.theme.strings.fetchError || 'Something went wrong.',
            'error', 4000
          );
        });
    },

    renderResults: function (results, query) {
      // Clear existing results safely
      while (this.results.firstChild) {
        this.results.removeChild(this.results.firstChild);
      }
      this.items = [];
      this.activeIndex = -1;

      var hasResults = false;
      var types = ['products', 'collections', 'pages', 'articles'];
      var typeLabels = {
        products: window.theme.strings.searchProducts || 'Products',
        collections: window.theme.strings.searchCollections || 'Collections',
        pages: window.theme.strings.searchPages || 'Pages',
        articles: window.theme.strings.searchArticles || 'Articles'
      };

      for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var items = results[type] || [];
        if (items.length === 0) continue;

        hasResults = true;

        var group = document.createElement('div');
        group.className = 'predictive-search__group';

        var heading = document.createElement('span');
        heading.className = 'predictive-search__group-title';
        heading.textContent = typeLabels[type];
        group.appendChild(heading);

        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          var el = this.createResultItem(item, type);
          group.appendChild(el);
          this.items.push(el);
        }

        this.results.appendChild(group);
      }

      // Combobox state
      var combobox = this.el.querySelector('[role="combobox"]');
      if (combobox) {
        combobox.setAttribute('aria-expanded', String(hasResults));
      }

      // View all link
      if (this.viewAll) {
        this.viewAll.hidden = !hasResults;
        this.viewAll.href = '/search?q=' + encodeURIComponent(query);
      }

      if (!hasResults) {
        var noResults = document.createElement('p');
        noResults.className = 'predictive-search__no-results';
        noResults.textContent = window.theme.strings.searchNoResults
          ? window.theme.strings.searchNoResults.replace('{{ terms }}', query).replace('"', '').replace('"', '')
          : 'No results found';
        this.results.appendChild(noResults);
      }
    },

    createResultItem: function (item, type) {
      var el = document.createElement('div');
      el.className = 'predictive-search__item';
      el.setAttribute('role', 'option');

      var link = document.createElement('a');
      link.href = item.url;
      link.className = 'predictive-search__item-link';

      if (type === 'products' && item.featured_image && item.featured_image.url) {
        var img = document.createElement('img');
        img.src = item.featured_image.url.replace(/(\.\w+)(\?|$)/, '_100x$1$2');
        img.alt = item.title || '';
        img.width = 50;
        img.height = 50;
        img.loading = 'lazy';
        img.className = 'predictive-search__item-image';
        link.appendChild(img);
      }

      var info = document.createElement('div');
      info.className = 'predictive-search__item-info';

      var title = document.createElement('span');
      title.className = 'predictive-search__item-title';
      title.textContent = item.title || '';
      info.appendChild(title);

      if (type === 'products' && item.price) {
        var price = document.createElement('span');
        price.className = 'predictive-search__item-price';
        price.setAttribute('data-price-wrapper', '');
        price.textContent = item.price;
        info.appendChild(price);
      }

      link.appendChild(info);
      el.appendChild(link);
      return el;
    },

    navigate: function (delta) {
      if (this.items.length === 0) return;

      // Remove active from current
      if (this.activeIndex >= 0 && this.items[this.activeIndex]) {
        this.items[this.activeIndex].classList.remove('predictive-search__item--active');
      }

      this.activeIndex += delta;
      if (this.activeIndex >= this.items.length) this.activeIndex = 0;
      if (this.activeIndex < 0) this.activeIndex = this.items.length - 1;

      this.items[this.activeIndex].classList.add('predictive-search__item--active');
      this.items[this.activeIndex].scrollIntoView({ block: 'nearest' });
    },

    clearResults: function () {
      while (this.results.firstChild) {
        this.results.removeChild(this.results.firstChild);
      }
      this.items = [];
      this.activeIndex = -1;
      if (this.viewAll) this.viewAll.hidden = true;

      var combobox = this.el.querySelector('[role="combobox"]');
      if (combobox) {
        combobox.setAttribute('aria-expanded', 'false');
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    PredictiveSearch.init();
  });
})();
