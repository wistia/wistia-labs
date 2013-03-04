function loadRelativeScripts(scripts, callback) {
  var transformed = [];
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


function loadRelativeCss(files) {
  for (var i = 0; i < files.length; i++) {
    if (/(?:\/|\/index.html)$/.test(location.pathname)) {
      $("head").append("<link rel='stylesheet' href='" + files[i] + "' />");
    } else {
      $("head").append("<link rel='stylesheet' href='" + location.pathname + "/" + files[i] + "' />");
    }
  }
  return files;
}

(function($) {

  // Allow jamjars to be opened and closed.
  $(function() {
    $(".jamjar").each(function() {
      var title = $(this).find(".jamjar_title").text();
      $(this).jamjar({ title: title });
    });

    if ($.fn.durationEntry) {
      $("input.duration").durationEntry();
    }
  });

}(jQuery));
