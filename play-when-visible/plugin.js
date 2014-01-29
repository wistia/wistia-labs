(function(W) {
  W.plugin('playWhenVisible', function(video, options) {
    var onScreen = false;
    function togglePlayWhenVisible() {
      var offset = W.elem.offset(video.container);
      var scrollTop = W.util.scrollTop();
      var scrollBottom = W.util.scrollTop() + W.elem.height(window);
      if (offset.top > scrollTop && offset.top < scrollBottom) {
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
