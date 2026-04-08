/**
 * LenSuh — Size Chart Modal (S11)
 * Opens/closes modal, Focus-Trap, ESC, builds table from JSON metafield.
 * No innerHTML — uses DOM API.
 */

(function () {
  'use strict';

  var SizeChart = {
    modal: null,

    init: function () {
      this.modal = document.querySelector('[data-size-chart-modal]');
      if (!this.modal) return;

      this.buildTable();
      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      // Open
      document.querySelectorAll('[data-size-chart-open]').forEach(function (btn) {
        btn.addEventListener('click', function () { self.open(); });
      });

      // Close
      this.modal.querySelectorAll('[data-size-chart-close]').forEach(function (btn) {
        btn.addEventListener('click', function () { self.close(); });
      });

      // ESC
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.modal.getAttribute('aria-hidden') === 'false') {
          self.close();
        }
      });
    },

    open: function () {
      this.modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overflow-hidden');
      window.theme.trapFocus(this.modal.querySelector('.size-chart-modal__content'));
    },

    close: function () {
      this.modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('overflow-hidden');
      var trigger = document.querySelector('[data-size-chart-open]');
      if (trigger) trigger.focus();
    },

    buildTable: function () {
      var table = this.modal.querySelector('[data-size-chart-table]');
      if (!table) return;

      // Get JSON from script tag or data attribute
      var jsonEl = document.querySelector('[data-size-chart-json]');
      if (!jsonEl) return;

      var data;
      try {
        data = JSON.parse(jsonEl.textContent);
      } catch (err) {
        console.error('[SizeChart] Invalid JSON:', err);
        return;
      }

      if (!Array.isArray(data) || data.length === 0) return;

      // Build header
      var thead = document.createElement('thead');
      var headerRow = document.createElement('tr');
      var keys = Object.keys(data[0]);
      keys.forEach(function (key) {
        var th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Build body
      var tbody = document.createElement('tbody');
      data.forEach(function (row) {
        var tr = document.createElement('tr');
        keys.forEach(function (key) {
          var td = document.createElement('td');
          td.textContent = row[key] || '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    SizeChart.init();
  });
})();
