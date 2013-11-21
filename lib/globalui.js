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

function embedShepherdPluginCode(name, options) {
  return "<script src=\"//fast.wistia.com/static/embed_shepherd-v1.js\"></script>\n" +
    "<scri" + "pt>\n" +
    "wistiaEmbeds.onFind(function(video) {\n" +
    "  video.addPlugin(\"" + name + "\", " + Wistia.ApiEmbedCode.evilJsonStringify(options).replace(/\n/g, "\n  ") + ");\n" +
    "});\n" +
    "</scr" + "ipt>\n";
}

function pluginSrc(sourceEmbedCode) {
  if (location.port || location.domain === 'localhost' || location.domain === '127.0.0.1') {
    return "//" + location.hostname + ":" + location.port + location.pathname.replace(/\/$/g, "") + "/" + window.jsFileName;
  } else {
    return "//" + window.jsProductionPath.replace(/\/$/g, "") + '/' + window.jsFileName;
  }
}

(function($) {

  $(function() {
    $(".jamjar").each(function() {
      var title = $(this).find(".jamjar_title").text();
      $(this).jamjar({ title: title });
    });

    if ($.fn.timeatEntry) {
      $("input.timeat").timeatEntry();
    }

    $("#output_embed_code").click(function() {
      $(this).select();
    });

    function resizeGutters() {
      var contentWidth = $("#configure_col").width() + $("#preview_col").width();
      var offset = Math.max(0, ($(window).width() - 909) / 2);
      $("#configure_col").css("padding-left", offset);
      $("#preview_col").css("padding-right", offset);
    }

    resizeGutters();
    $(resizeGutters);
    $(window).resize(resizeGutters);
    $(window).load(resizeGutters);

    $("[data-href]").click(function() {
      window.location.href = $(this).attr("data-href");
    });
  });

}(jQuery));
