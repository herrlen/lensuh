/**
 * LenSuh — SEO Audit Dashboard (S19)
 * Client-side only — checks H1, Meta, Schema, ALT, Canonical.
 * Traffic-light system: green/yellow/red.
 * No innerHTML — uses textContent + classList.
 */

(function () {
  'use strict';

  var SEOAudit = {
    section: null,
    strings: null,

    init: function () {
      this.section = document.querySelector('[data-section-type="seo-audit"]');
      if (!this.section) return;

      var stringsEl = document.querySelector('[data-seo-strings]');
      if (!stringsEl) return;

      try {
        this.strings = JSON.parse(stringsEl.textContent);
      } catch (e) {
        console.error('[SEOAudit] strings parse error:', e);
        return;
      }

      this.runAudit();
    },

    runAudit: function () {
      this.checkH1();
      this.checkMeta();
      this.checkSchema();
      this.checkAlt();
      this.checkCanonical();
    },

    checkH1: function () {
      var h1s = document.querySelectorAll('h1');
      var status, rec, level;

      if (h1s.length === 0) {
        status = this.strings.h1.fail;
        rec = this.strings.h1.rec_fail;
        level = 'fail';
      } else if (h1s.length === 1) {
        status = this.strings.h1.ok;
        rec = this.strings.h1.rec_ok;
        level = 'ok';
      } else {
        status = this.strings.h1.warn;
        rec = this.strings.h1.rec_fail;
        level = 'warn';
      }

      this.setResult('h1', level, status, rec);
    },

    checkMeta: function () {
      var meta = document.querySelector('meta[name="description"]');
      var status, rec, level;

      if (!meta || !meta.content) {
        status = this.strings.meta.fail;
        rec = this.strings.meta.rec_fail;
        level = 'fail';
      } else if (meta.content.length < 50 || meta.content.length > 160) {
        status = this.strings.meta.warn;
        rec = this.strings.meta.rec_fail;
        level = 'warn';
      } else {
        status = this.strings.meta.ok;
        rec = this.strings.meta.rec_ok;
        level = 'ok';
      }

      this.setResult('meta', level, status, rec);
    },

    checkSchema: function () {
      var jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
      var status, rec, level;

      if (jsonLd.length === 0) {
        status = this.strings.schema.fail;
        rec = this.strings.schema.rec_fail;
        level = 'fail';
      } else {
        // Validate JSON syntax
        var valid = true;
        for (var i = 0; i < jsonLd.length; i++) {
          try {
            JSON.parse(jsonLd[i].textContent);
          } catch (e) {
            valid = false;
            break;
          }
        }
        if (valid) {
          status = this.strings.schema.ok;
          rec = this.strings.schema.rec_ok;
          level = 'ok';
        } else {
          status = this.strings.schema.fail;
          rec = this.strings.schema.rec_fail;
          level = 'fail';
        }
      }

      this.setResult('schema', level, status, rec);
    },

    checkAlt: function () {
      var images = document.querySelectorAll('main img, .main-content img');
      var missing = 0;
      images.forEach(function (img) {
        if (!img.alt || img.alt.trim() === '') {
          missing += 1;
        }
      });

      var status, rec, level;
      if (missing === 0) {
        status = this.strings.alt.ok;
        rec = this.strings.alt.rec_ok;
        level = 'ok';
      } else {
        status = this.strings.alt.fail.replace('{count}', String(missing));
        rec = this.strings.alt.rec_fail;
        level = missing > 3 ? 'fail' : 'warn';
      }

      this.setResult('alt', level, status, rec);
    },

    checkCanonical: function () {
      var canonical = document.querySelector('link[rel="canonical"]');
      var status, rec, level;

      if (!canonical || !canonical.href) {
        status = this.strings.canonical.fail;
        rec = this.strings.canonical.rec_fail;
        level = 'fail';
      } else {
        status = this.strings.canonical.ok;
        rec = this.strings.canonical.rec_ok;
        level = 'ok';
      }

      this.setResult('canonical', level, status, rec);
    },

    setResult: function (checkId, level, status, recommendation) {
      var check = this.section.querySelector('[data-seo-check="' + checkId + '"]');
      if (!check) return;

      check.classList.add('seo-audit__check--' + level);

      var indicator = check.querySelector('[data-seo-indicator]');
      if (indicator) {
        indicator.classList.add('seo-audit__indicator--' + level);
      }

      var statusEl = check.querySelector('[data-seo-status]');
      if (statusEl) statusEl.textContent = status;

      var recEl = check.querySelector('[data-seo-recommendation]');
      if (recEl) recEl.textContent = recommendation;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    SEOAudit.init();
  });
})();
