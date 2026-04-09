/**
 * LenSuh — FAQ Accordion (S15)
 * Keyboard accessible: Enter/Space toggles, Arrow keys navigate.
 * No innerHTML, addEventListener, IIFE, === only.
 */

(function () {
  'use strict';

  var FAQ = {
    init: function () {
      document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-faq-toggle]');
        if (!trigger) return;

        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        var panel = document.getElementById(trigger.getAttribute('aria-controls'));
        if (!panel) return;

        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
      });

      // Keyboard: Arrow keys between FAQ items
      document.addEventListener('keydown', function (e) {
        var trigger = e.target.closest('[data-faq-toggle]');
        if (!trigger) return;

        var section = trigger.closest('.faq-section');
        if (!section) return;

        var triggers = Array.prototype.slice.call(section.querySelectorAll('[data-faq-toggle]'));
        var index = triggers.indexOf(trigger);
        var next;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          next = index + 1 >= triggers.length ? 0 : index + 1;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          next = index - 1 < 0 ? triggers.length - 1 : index - 1;
        }

        if (typeof next !== 'undefined') {
          triggers[next].focus();
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    FAQ.init();
  });
})();
