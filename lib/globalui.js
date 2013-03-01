function loadRelativeScripts(scripts, callback) {
  var transformed = []
  for (var i = 0; i < scripts.length; i++) {
    if (/(?:\/|\/index.html)$/.test(location.pathname)) {
      transformed.push({ src: scripts[i], async: false });
    } else {
      transformed.push({ src: location.pathname + "/" + scripts[i], async: false });
    }
  }
  Wistia.remote.scripts(transformed, callback);
  return transformed;
}

(function($) {

  // Allow jamjars to be opened and closed.
  $(function() {
    $(".jamjar").each(function() {
      var title = $(this).find(".jamjar_title").text();
      $(this).jamjar({ title: title });
    });

    $("input[data-example]").each(function() {
      $(this).example($(this).attr("data-example"));
    });
  });

}(jQuery));
