window.jsFileName = 'resumable.js'
window.jsProductionPath = 'fast.wistia.com/labs/resumable'

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {

    // Set custom options on the embed code.
    outputEmbedCode.setOption("plugin.resumable.src", pluginSrc(sourceEmbedCode));

    // Display the output.
    $("#output_embed_code").val(outputEmbedCode.toString());
    outputEmbedCode.previewInElem("preview", { type: "api" });

    $(".test_it_out").show();

  } else {

    // Show an error if invalid. We can be more specific 
    // if we expect a certain problem.
    $("#output_embed_code").val("Please enter a valid Wistia embed code.");
    $("#preview").html('<div id="placeholder_preview">Your video here</div>');
    $(".test_it_out").hide();
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

    $(".test_it_out a").click(function(event) {
      event.preventDefault();
      previewEmbed.pause();
      previewEmbed.plugin.resumable.setTime(previewEmbed.duration() / 2);
      previewEmbed.plugin.resumable.showOverlay();
    });
  });
};
