function pluginSrc(sourceEmbedCode) {
  if (!/^\/labs\//.test(location.pathname)) {
    return sourceEmbedCode.proto() + "//" + location.hostname + (location.port != 80 ? ":" + location.port : "") + location.pathname.replace(/\/$/g, "") + "/googleAnalytics.js";
  } else {
    return sourceEmbedCode.proto() + "//fast.wistia.com/labs/googleAnalytics/googleAnalytics.js";
  }
}

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {
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
  });
};
