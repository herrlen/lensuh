/**
 * LenSuh — Currency + Language Switcher (S16)
 * Auto-submits localization form on select change.
 * No innerHTML, addEventListener, IIFE, === only.
 */

(function () {
  'use strict';

  var Switcher = {
    init: function () {
      this.bindSelect('[data-currency-select]', 'currency-form');
      this.bindSelect('[data-language-select]', 'language-form');
    },

    bindSelect: function (selectSelector, formId) {
      var select = document.querySelector(selectSelector);
      if (!select) return;

      select.addEventListener('change', function () {
        var form = document.getElementById(formId);
        if (form) {
          form.submit();
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    Switcher.init();
  });
})();
