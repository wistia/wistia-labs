window.jsFileName = 'plugin.js'
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
  $("#source_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/c0bcb3b617?playerColor=81b7db&version=v1&videoHeight=304&videoWidth=540\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"540\" height=\"304\"></iframe>");
  $("#output_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/fc5eec8d82?playerColor=81b7db&version=v1&videoHeight=304&videoWidth=540&plugin%5BpasswordProtected%5D%5Bsrc%5D=http%3A%2F%2Flocalhost%3A8000%2Fpw-protected-videos%2Fplugin.js&plugin%5BpasswordProtected%5D%5Bseed%5D=IbnTUGfO9hv1zklq4h9b&plugin%5BpasswordProtected%5D%5Bchallenge%5D=Enter%20the%20password%20to%20view%20this%20video\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"540\" height=\"304\"></iframe>");
  var outputEmbedCode = Wistia.EmbedCode.parse($("#output_embed_code").val());
  outputEmbedCode.previewInElem("preview");
  $("#challenge").val("Enter the password to view this video.");
  $("#password").val("wistia");
};
