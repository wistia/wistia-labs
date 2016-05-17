window.jsFileName = 'plugin.js';
window.jsProductionPath = 'fast.wistia.com/labs/crop-fill';

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {

    // CHANGE ME!!!
    // Here's where you modify the embed code to add and configure your plugin.
    outputEmbedCode.setOption("plugin.cropFill.src", pluginSrc(sourceEmbedCode));

    // Display the output.
    outputEmbedCode.fromOembed({ embedType: 'api' }, function(data) {
      outputEmbedCode = Wistia.EmbedCode.parse(data.html);
      $("#output_embed_code").val(outputEmbedCode.toString());
      outputEmbedCode.previewInElem("preview");
    });
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

    if (!Wistia.localStorage("crop-fill.cleared")) {
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
      Wistia.localStorage("crop-fill.cleared", true);
    });

    $("#show_example").click(function(event) {
      event.preventDefault();
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
      Wistia.localStorage("crop-fill.cleared", false);
    });

    $('#preview_area').resizable({ alsoResize: '#preview' });
  });
};

window.resetInterface = function() {
  $("#source_embed_code").val("").keyup().change();
};

window.showExample = function() {
  resetInterface();
  $("#source_embed_code").val("<iframe src=\"//fast.wistia.net/embed/iframe/kl7nfgwauq?playerColor=81b7db&version=v1&videoHeight=360&videoWidth=640\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"640\" height=\"360\"></iframe>").keyup().change();
};

setupLabInterface(jQuery);
