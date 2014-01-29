(function(W) {
  W.plugin('playWhenVisible', function(video, options) {
    function isOnScreen() {
      var offset = W.elem.offset(video.grid.center);
      var offsetTop = offset.top;
      var offsetBottom = offsetTop + video.videoHeight();
      var scrollTop = W.util.scrollTop();
      var scrollBottom = W.util.scrollTop() + W.elem.height(window)
      return (offsetTop >= scrollTop && offsetTop < scrollBottom) ||
        (offsetBottom >= scrollTop && offsetBottom < scrollBottom) ||
        (offsetTop <= scrollTop && offsetBottom >= scrollBottom);
    }

    var onScreen = false;
    function togglePlayWhenVisible() {
      if (isOnScreen()) {
        if (!onScreen) {
          video.play();
        }
        onScreen = true;
      } else {
        if (onScreen) {
          video.rebuild();
          video.pause();
        }
        onScreen = false;
      }
    }
    function debounceTogglePlayWhenVisible() {
      W.timeout("" + video.uuid + ".debounce_toggle_play_when_visible", togglePlayWhenVisible, 300);
    }
    W.elem.bind(window, 'scroll', debounceTogglePlayWhenVisible)
    W.elem.bind(window, 'resize', debounceTogglePlayWhenVisible)
    togglePlayWhenVisible();
  });
}(Wistia));
