(function() {
  window.wistiaEmbedShepherdReady = function() {
    wistiaEmbeds.onFind(function(video) {
      video.bind('conversion', function() {
        var hutk = Wistia.cookie('hubspotutk');
        video.foreignData({ hubspot_hutk: hutk });
      });
    });
  };

  if (typeof window.wistiaEmbeds === 'undefined') {
    // load embed shepherd
    var es = document.createElement('script');
    es.type = 'text/javascript';
    es.async = true;
    es.src = '//fast.wistia.com/static/embed_shepherd-v1.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(es, s);
  } else {
    wistiaEmbedShepherdReady();
  }
})();
