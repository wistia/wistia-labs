window.jsFileName = 'plugin.js'
window.jsProductionPath = 'fast.wistia.com/labs/resumable'

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if ($("#mode_all").is(":checked")) {
    var options = { src: pluginSrc() };
    $("#output_embed_code").val(embedShepherdPluginCode("resumable", options));
  } else if (sourceEmbedCode && sourceEmbedCode.isValid()) {

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

    // Mode Switcher Stuff
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


    // Example stuff
    if (!Wistia.localStorage("resumable.cleared")) {
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
      Wistia.localStorage("resumable.cleared", true);
    });

    $("#show_example").click(function(event) {
      event.preventDefault();
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
      Wistia.localStorage("resumable.cleared", false);
    });
  });
};

window.resetInterface = function() {
  $("#source_embed_code").val("").keyup().change();
  $("#mode_all").removeAttr("checked").trigger("click").change();
  $("#mode_one").attr("checked", "checked").trigger("click").change();
};

window.showExample = function() {
  resetInterface();
  $("#source_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/oefj398m6q?playerColor=81b7db&version=v1&videoHeight=304&videoWidth=540\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"540\" height=\"304\"></iframe>").keyup().change();
};

setupLabInterface(jQuery);
