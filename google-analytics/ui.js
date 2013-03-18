window.jsFileName = 'ga.js';
window.jsProductionPath = 'fast.wistia.com/labs/google-analytics';


function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if ($("#mode_all").is(":checked")) {
    $("#output_embed_code").val(embedShepherdPluginCode("googleAnalytics", {
      src: pluginSrc(),
      outsideIframe: true
    }));
  } else if (sourceEmbedCode && sourceEmbedCode.isValid()) {
    var isIframe = Wistia.EmbedCode.isIframe(outputEmbedCode) || Wistia.EmbedCode.isPopover(outputEmbedCode);

    // Set custom options on the embed code.
    outputEmbedCode.setOption("plugin.googleAnalytics.src", pluginSrc(sourceEmbedCode));
    if (isIframe) {
      outputEmbedCode.setOption("plugin.googleAnalytics.outsideIframe", true);
    }

    // Display the output.
    if (isIframe) {
      var result = outputEmbedCode.toString() + "\n<script src=\"http://fast.wistia.com/static/iframe-api-v1.js\"></script>"
      $("#output_embed_code").val(result);
    } else {
      $("#output_embed_code").val(outputEmbedCode.toString());
    }
    outputEmbedCode.previewInElem("preview");
  } else {

    // Show an error if invalid. We can be more specific 
    // if we expect a certain problem.
    $("#output_embed_code").val("Please enter a valid Wistia embed code.");
    $("#preview").html('<div id="placeholder_preview">Your video here</div>');
  }
}


// Updating is kind of a heavy operation; we don't want to 
// do it on every single keystroke.
var updateOutputTimeout;
function debounceUpdateOutput() {
  clearTimeout(updateOutputTimeout);
  updateOutputTimeout = setTimeout(updateOutput, 500);
}


// Assign all DOM bindings on doc-ready in here. We can also 
// run whatever initialization code we might need.
window.setupLabInterface = function($) {
  $(function() {
    // Update the output whenever a configuration input changes.
    $("#configure")
      .on("keyup", "input[type=text], textarea", debounceUpdateOutput)
      .on("change", "select", debounceUpdateOutput)
      .on("click", ":radio,:checkbox", debounceUpdateOutput);
    
    $("#mode_all").click(function() {
      $(".paste_embed_code.jamjar").hide();
      $(".instructions.jamjar .for_all").show();
      $(".instructions.jamjar .for_one").hide();
      $("#preview_area").hide();
    });

    $("#mode_one").click(function() {
      $(".paste_embed_code.jamjar").show();
      $(".instructions.jamjar .for_all").hide();
      $(".instructions.jamjar .for_one").show();
      $("#preview_area").show();
    });

    $("#output_embed_code").click(function() {
      $(this).select();
    });

    wistiaEmbeds.bind("percentwatched", function(video, p) {
      $("#percent_watched").text("Watched " + Math.round(p * 100) + "%");
    });
    wistiaEmbeds.bind("pushedtogoogleanalytics", function(video, key, val) {
      if (key === "play") {
        $("#event_notifications .events").append("<li>Pushed a play event to google analytics.</li>");
      } else {
        $("#event_notifications .events").append("<li>Pushed an event to google analytics: " + Math.round(val * 100) + "% watched.</li>");
      }
    });

  });
};
