/**
 * LenSuh — Tabs Section (S18)
 * Keyboard accessible tab navigation.
 */

(function () {
  'use strict';

  var TabsSection = {
    init: function () {
      document.querySelectorAll('[data-section-type="tabs"]').forEach(function (section) {
        TabsSection.setup(section);
      });
    },

    setup: function (section) {
      var tabs = section.querySelectorAll('[data-tab-trigger]');
      var panels = section.querySelectorAll('[data-tab-panel]');

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          TabsSection.activate(tab, tabs, panels);
        });

        tab.addEventListener('keydown', function (e) {
          var idx = Array.prototype.indexOf.call(tabs, tab);
          var next;
          if (e.key === 'ArrowRight') { e.preventDefault(); next = (idx + 1) % tabs.length; }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); next = (idx - 1 + tabs.length) % tabs.length; }
          if (typeof next !== 'undefined') {
            TabsSection.activate(tabs[next], tabs, panels);
            tabs[next].focus();
          }
        });
      });
    },

    activate: function (activeTab, allTabs, allPanels) {
      var id = activeTab.getAttribute('data-tab-trigger');
      allTabs.forEach(function (t) {
        var isActive = t === activeTab;
        t.setAttribute('aria-selected', String(isActive));
        t.setAttribute('tabindex', isActive ? '0' : '-1');
        t.classList.toggle('tabs-section__tab--active', isActive);
      });
      allPanels.forEach(function (p) {
        var isActive = p.getAttribute('data-tab-panel') === id;
        p.hidden = !isActive;
        p.classList.toggle('tabs-section__panel--active', isActive);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    TabsSection.init();
  });
})();
