// we only want to embed once
var embedded = false;
// we also want the preview to update if the source changes
var change = false;

// if no http on linkHref, let's add it
function maybeAddHttp(href) {
  if (href.indexOf("http") == -1) {
    return "http://" + href;
  }
  return href;
}

// get the mid rolls data that has been entered
function midRollDataFromPage() {
  var result = [];
  $(".midrolls .link_and_time_range_combo").not("#link_and_time_range_combo_template").each(function() {
    var $this = $(this);
    var linkText = $this.find("input[name=link_text]").val();
    var linkHref = maybeAddHttp($this.find("input[name=link_href]").val());
    var start = $this.find("input[name=start]").val();
    var end = $this.find("input[name=end]").val();
    if (linkText && linkHref && parseInt(start, 10) && end) {
      result.push({
        linkText: linkText,
        linkHref: linkHref,
        start: parseInt(start, 10),
        end: parseInt(end, 10)
      });
    }
  });
  return result;
}

function removeAllInputs() {
  $(".midrolls .link_and_time_range_combo").not("#link_and_time_range_combo_template").remove();
  addMidRollInput();
  updateOutput();
}

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  function setUpPlugin(midrolldata) {
    var midRollData = midRollDataFromPage();
    // uncomment this for production
    //outputEmbedCode.setOption('plugin.midRollLinks.src', outputEmbedCode.proto() + 
    //"//" + Wistia.remote.embedHost({ ssl: outputEmbedCode.ssl() }) + "/labs/mid-roll-links/mid-roll-links.js");
    outputEmbedCode.setOption('plugin.midRollLinks.links', midRollData);
    outputEmbedCode.setOption('plugin.midRollLinks.playerColor', sourceEmbedCode.options().playerColor);
    updatePreviewAndOutputEmbeds(midRollData);
  }

  function updatePreviewAndOutputEmbeds(midrolldata) {
    // update with new midroll links
    $("#output_embed_code").val(outputEmbedCode.toString());

    if (change) {
      outputEmbedCode.previewInElem("preview", { type: 'api' }, function() {
        change = false;
        window.previewEmbed.plugin.midRollLinks.update({ 
          "links": midrolldata,
          "playerColor": sourceEmbedCode.options().playerColor || "636155"
        });
      });
    } else {
      window.previewEmbed.plugin.midRollLinks.update({ 
        "links": midrolldata,
        "playerColor": sourceEmbedCode.options().playerColor || "636155"
      });
    }
  }


  // update the embed code!
  function updateEmbedCode() {
    var hasFullscreen = sourceEmbedCode.options().fullscreenButton == null || sourceEmbedCode.options().fullscreenButton;
    var hasMidRoll = Wistia.obj.get(outputEmbedCode.options(), "plugin.midRollLinks");
    var fullScreenAlert = "This embed code has fullscreen enabled with mid-rolls. " + 
      "Just so you know, the Midroll Links won't show up when fullscreen. " + 
      "You might want to <a href='#' class='turn_off_fullscreen'>turn off fullscreen</a>."

    setUpPlugin();

    if (hasFullscreen && hasMidRoll) {
      $("#alert").html(fullScreenAlert).show();
    } else {
      $("#alert").html("").hide();
    }
  }

  function embedMidRollPreview() {
    outputEmbedCode.setOption('plugin.midRollLinks.src', "http://localhost:8000/mid-roll-links/mid-roll-links.js");
    outputEmbedCode.setOption('plugin.midRollLinks.links', {'links': []});
    outputEmbedCode.setOption('plugin.midRollLinks.playerColor', sourceEmbedCode.options().playerColor);

    $("#output_embed_code").val(outputEmbedCode.toString());
    outputEmbedCode.previewInElem("preview", { type: 'api' }, function(){
      embedded = true;
      change = false;
      updateEmbedCode();
    });
  }

  // first time 
  if (sourceEmbedCode && sourceEmbedCode.isValid()) {
    if (!embedded) { 
      embedMidRollPreview(); 
    } else {
      updateEmbedCode();
    }

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

// add another midroll input
function addMidRollInput() {
  var $elem = $("#link_and_time_range_combo_template").clone();
  $elem.show().removeAttr("id");
  $(".midrolls .mid_roll_entries").append($elem);
  return $elem;
}

function addMidRollData(link_text, link_href, start, end) {
  $elem = addMidRollInput();
  $elem.find("input[name=link_text]").focus().val(link_text);
  $elem.find("input[name=link_href]").focus().val(link_href);
  $elem.find("input[name=start]").focus().val(start);
  $elem.find("input[name=end]").focus().val(end);
}

// add default midRoll
function addDefaultMidRoll(link_text, link_href, start, end) {
  $elem = addMidRollInput();
  $elem.find("input[name=link_text]").example(link_text);
  $elem.find("input[name=link_href]").example(link_href);
  $elem.find("input[name=start]").example(start);
  $elem.find("input[name=end]").example(end);
}

$(document).on("click", ".turn_off_fullscreen", function(event) {
  event.preventDefault();
  var source = Wistia.EmbedCode.parse($("#source_embed_code").val());
  source.setOption("fullscreenButton", false);
  $("#source_embed_code").val(source.toString()).keyup();
});

// Assign all DOM bindings on doc-ready in here. We can also 
// run whatever initialization code we might need.
window.setupLabInterface = function($) {
  $(function() {
    // Update the output whenever a configuration input changes.
    $("#configure")
      .on("keyup", "input[type=text], textarea", debounceUpdateOutput)
      .on("change", "select", debounceUpdateOutput)
      .on("click", ":radio,:checkbox", debounceUpdateOutput);

    $("#source_embed_code").on("keyup", function() {
      change = true;
      debounceUpdateOutput;
    });

    $("a[name=add_new]").on('click', function(e) {
      e.preventDefault();
      addMidRollInput();
    });

    $("a[name=remove_all]").on('click', function(e) {
      e.preventDefault();
      removeAllInputs();
    });

    // Add in default midRoll Example
    addDefaultMidRoll("Check Out Wistia", "http://wistia.com", "?", "?");
//  addMidRollData("CHECK OUT UNCLE BENNY!", "unclebenny.com", 02, 10);
//  addMidRollData("CHECK OUT UNCLE BENNY!", "unclebenny.com", 08, 14);
//  addMidRollData("CHECK OUT UNCLE BENNY!", "unclebenny.com", 12, 22);
//  addMidRollData("CHECK OUT UNCLE BENNY!", "unclebenny.com", 24, 40);
  });
};
