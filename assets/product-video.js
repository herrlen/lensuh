/**
 * LenSuh — Product Video (S13)
 * Facade Pattern: Click poster → load/show player.
 * YouTube/Vimeo embed from URL, Shopify hosted via media tags.
 * No innerHTML — DOM API only. IIFE, === only.
 */

(function () {
  'use strict';

  var YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  var VIMEO_REGEX = /vimeo\.com\/(\d+)/;

  var ProductVideo = {
    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      document.addEventListener('click', function (e) {
        var playBtn = e.target.closest('[data-video-play]');
        if (!playBtn) return;

        var container = playBtn.closest('[data-product-video]');
        if (!container) return;

        ProductVideo.activate(container);
      });
    },

    activate: function (container) {
      var facade = container.querySelector('[data-video-facade]');
      var player = container.querySelector('[data-video-player]');
      if (!facade || !player) return;

      // If player already has content (Shopify media tag), just show it
      if (player.children.length > 0) {
        facade.hidden = true;
        player.hidden = false;
        return;
      }

      // Custom URL — build iframe
      var url = container.getAttribute('data-video-url');
      if (!url) return;

      var embedUrl = this.getEmbedUrl(url);
      if (!embedUrl) return;

      var iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('loading', 'lazy');
      iframe.className = 'product-video__iframe';
      iframe.title = 'Video';

      player.appendChild(iframe);
      facade.hidden = true;
      player.hidden = false;
    },

    getEmbedUrl: function (url) {
      var ytMatch = url.match(YOUTUBE_REGEX);
      if (ytMatch) {
        return 'https://www.youtube-nocookie.com/embed/' + ytMatch[1] + '?autoplay=1&rel=0';
      }

      var vimeoMatch = url.match(VIMEO_REGEX);
      if (vimeoMatch) {
        return 'https://player.vimeo.com/video/' + vimeoMatch[1] + '?autoplay=1';
      }

      return null;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    ProductVideo.init();
  });
})();
