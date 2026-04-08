/**
 * LenSuh — Product Tabs / Accordion (S11)
 * Keyboard: Arrow-Keys between tabs, Enter/Space activates.
 * ARIA: role="tablist", role="tab", role="tabpanel", aria-selected.
 */

(function () {
  'use strict';

  var ProductTabs = {
    init: function () {
      document.querySelectorAll('[data-product-tabs]').forEach(function (container) {
        var style = container.getAttribute('data-tab-style');
        if (style === 'tabs') {
          ProductTabs.initTabs(container);
        } else {
          ProductTabs.initAccordion(container);
        }
      });
    },

    initTabs: function (container) {
      var tabs = container.querySelectorAll('[data-tab-trigger]');
      var panels = container.querySelectorAll('[data-tab-panel]');

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          ProductTabs.activateTab(tab, tabs, panels);
        });

        tab.addEventListener('keydown', function (e) {
          var index = Array.prototype.indexOf.call(tabs, tab);
          var next;

          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            next = index + 1 >= tabs.length ? 0 : index + 1;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            next = index - 1 < 0 ? tabs.length - 1 : index - 1;
          } else if (e.key === 'Home') {
            e.preventDefault();
            next = 0;
          } else if (e.key === 'End') {
            e.preventDefault();
            next = tabs.length - 1;
          }

          if (typeof next !== 'undefined') {
            ProductTabs.activateTab(tabs[next], tabs, panels);
            tabs[next].focus();
          }
        });
      });
    },

    activateTab: function (activeTab, allTabs, allPanels) {
      var targetId = activeTab.getAttribute('data-tab-trigger');

      allTabs.forEach(function (t) {
        var isActive = t === activeTab;
        t.setAttribute('aria-selected', String(isActive));
        t.setAttribute('tabindex', isActive ? '0' : '-1');
        t.classList.toggle('product-tabs__tab--active', isActive);
      });

      allPanels.forEach(function (p) {
        var isActive = p.getAttribute('data-tab-panel') === targetId;
        p.hidden = !isActive;
        p.classList.toggle('product-tabs__panel--active', isActive);
      });
    },

    initAccordion: function (container) {
      container.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-accordion-trigger]');
        if (!trigger) return;

        var targetId = trigger.getAttribute('data-accordion-trigger');
        var panel = container.querySelector('[data-tab-panel="' + targetId + '"]');
        if (!panel) return;

        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
        trigger.classList.toggle('product-tabs__accordion-trigger--active', !isOpen);
        panel.hidden = isOpen;
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    ProductTabs.init();
  });
})();
