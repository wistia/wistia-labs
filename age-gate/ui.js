window.jsFileName = 'plugin.js';
window.jsProductionPath = 'fast.wistia.com/labs/age-gate';

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {

    // CHANGE ME!!!
    // Here's where you modify the embed code to add and configure your plugin.
    outputEmbedCode.setOption("plugin.ageGate.src", pluginSrc(sourceEmbedCode));

    ageRestriction = parseInt(document.getElementById("age-gate").value) || 18;

    outputEmbedCode.setOption("plugin.ageGate.ageRestriction", ageRestriction);

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
  updateOutputTimeout = setTimeout(updateOutput, 1000);
}


// Assign all DOM bindings on doc-ready in here. We can also
// run whatever initialization code we might need.
window.setupLabInterface = function($) {
  $(function() {
    // Update the output whenever a configuration input changes.
    $("#configure")
      .on("keyup", "input[type=text], input[type=number], textarea", debounceUpdateOutput)
      .on("change", "input[type=number]", debounceUpdateOutput)
      .on("change", "select", debounceUpdateOutput)
      .on("click", ":radio,:checkbox", debounceUpdateOutput);

    if (!Wistia.localStorage("template.cleared")) {
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
      Wistia.localStorage("template.cleared", true);
    });

    $("#show_example").click(function(event) {
      event.preventDefault();
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
      Wistia.localStorage("template.cleared", false);
    });
  });
};

window.resetInterface = function() {
  $("#source_embed_code").val("").keyup().change();
};

window.showExample = function() {
  resetInterface();
  $("#source_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/kl7nfgwauq?playerColor=81b7db&version=v1&videoHeight=360&videoWidth=640\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"640\" height=\"360\"></iframe>").keyup().change();
};

setupLabInterface(jQuery);
