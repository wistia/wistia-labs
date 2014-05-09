window.jsFileName = 'plugin.js';
window.jsProductionPath = 'fast.wistia.com/labs/looping-video-section';

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {

    outputEmbedCode.setOption("plugin.looping-video-section.src", pluginSrc(sourceEmbedCode));

    // Display the output.
    $("#output_embed_code").val(outputEmbedCode.toString());
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

    if (!Wistia.localStorage("looping-video-section.cleared")) {
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
    } else {
      $(".show_example_text").show();
      $(".clear_example_text").hide();
    }

    $("#clear_example").click(function(event) {
      event.preventDefault();
      resetInterface();
      $(".show_example_text").show();
      $(".clear_example_text").hide();
      Wistia.localStorage("looping-video-section.cleared", true);
    });

    $("#show_example").click(function(event) {
      event.preventDefault();
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
      Wistia.localStorage("looping-video-section.cleared", false);
    });
  });
};

window.resetInterface = function() {
  $("#source_embed_code").val("").keyup().change();
};

window.showExample = function() {
  resetInterface();
  $("#source_embed_code").val('<div id="wistia_oefj398m6q" class="wistia_embed" style="width:640px;height:360px;"> </div><script charset="ISO-8859-1" src="//fast.wistia.com/assets/external/E-v1.js"></script><script>wistiaEmbed = Wistia.embed("oefj398m6q");</script>');
};

setupLabInterface(jQuery);
