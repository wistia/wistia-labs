window.jsFileName = 'plugin.js';
window.jsProductionPath = 'fast.wistia.com/labs/dim-the-lights';

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if ($("#mode_all").is(":checked")) {
    var options = {
      src: pluginSrc(),
      outsideIframe: true
    };
    if ($("#dim_color_white").is(":checked")) {
      options.backgroundColor = $("#dim_color_white").val();
    }
    if ($("#auto_dim_off").is(":checked")) {
      options.autoDim = false;
    }
    $("#output_embed_code").val(embedShepherdPluginCode("dimTheLights", options));
  } else if (sourceEmbedCode && sourceEmbedCode.isValid()) {

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
      $("#auto_example").show();
    });

    $("#auto_dim_off").click(function() {
      $("#manual_example").show();
      $("#auto_example").hide();
    });

    wistiaEmbeds.onFind(function(video) {
      $("#manual_example .dim").unbind("click");
      $("#manual_example .dim").bind("click", function(event) {
        event.preventDefault();
        video.plugin.dimTheLights.dim();
      });
    });

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

    if (!Wistia.localStorage("dimTheLights.cleared")) {
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
      Wistia.localStorage("dimTheLights.cleared", true);
    });

    $("#show_example").click(function(event) {
      event.preventDefault();
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
      Wistia.localStorage("dimTheLights.cleared", false);
    });
  });
};

window.resetInterface = function() {
  $("#source_embed_code").val("").keyup().change();
  $("#dim_color_white").removeAttr("checked").keyup().change();
  $("#dim_color_black").attr("checked", "checked").keyup().change();
  $("#auto_dim_off").removeAttr("checked").keyup().change();
  $("#auto_dim_on").attr("checked", "checked").keyup().change();
  $("#mode_all").removeAttr("checked").trigger("click").change();
  $("#mode_one").attr("checked", "checked").trigger("click").change();
};

window.showExample = function() {
  resetInterface();
  $("#source_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/i58yer6i2f?playerColor=81b7db&version=v1&videoHeight=272&videoWidth=640\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"640\" height=\"272\"></iframe>").keyup().change();
};
