window.jsFileName = 'dimTheLights.js';
window.jsProductionPath = 'fast.wistia.com/labs/dimTheLights';

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {

    var isIframe = Wistia.EmbedCode.isIframe(outputEmbedCode) || Wistia.EmbedCode.isPopover(outputEmbedCode);
    outputEmbedCode.setOption("plugin.dimTheLights.src", pluginSrc(sourceEmbedCode));
    if (isIframe) {
      outputEmbedCode.setOption("plugin.dimTheLights.outsideIframe", true);
    }

    if ($("#dim_color_white").is(":checked")) {
      outputEmbedCode.setOption("plugin.dimTheLights.backgroundColor", $("#dim_color_white").val());
    }
    if ($("#auto_dim_off").is(":checked")) {
      outputEmbedCode.setOption("plugin.dimTheLights.autoDim", false);
    }

    // Display the output.
    if (isIframe) {
      $("#output_embed_code").val(outputEmbedCode.toString() + "\n<scr" + "ipt src=\"http://fast.wistia.com/static/iframe-api-v1.js\"></scri" + "pt>");
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

    $("#auto_dim_on").click(function() {
      $("#manual_example").hide();
    });

    $("#auto_dim_off").click(function() {
      $("#manual_example").show();
    });

    wistiaEmbeds.onFind(function(video) {
      $("#manual_example .dim").unbind("click");
      $("#manual_example .dim").bind("click", function(event) {
        event.preventDefault();
        video.plugin.dimTheLights.dim();
      });
    });
  });
};
