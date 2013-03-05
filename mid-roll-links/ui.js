// we only want to embed once
var embedded = false;

// if no http on linkHref, let's add it
function maybeAddHttp(href) {
  if (href.indexOf("http") == -1) {
    return "http://" + href;
  }
  return href;
}

// does all the works
function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  // update the embed code!
  function updateEmbedCode() {
    var midRollData = midRollDataFromPage();
    var hasFullscreen = sourceEmbedCode.options().fullscreenButton == null || sourceEmbedCode.options().fullscreenButton;
    var hasMidRoll = Wistia.obj.get(sourceEmbedCode.options(), "plugin.midRollLinks");
    var fullScreenAlert = "This embed code has fullscreen enabled with mid-rolls." + 
      "Just so you know, the Follow buttons won't show up when fullscreen. " + 
      "You might want to <a href='#' class='turn_off_fullscreen'>turn off fullscreen</a>."

    // uncomment this for production
    //outputEmbedCode.setOption('plugin.midRollLinks.src', outputEmbedCode.proto() + 
    //"//" + Wistia.remote.embedHost({ ssl: outputEmbedCode.ssl() }) + "/labs/mid-roll-links/mid-roll-links.js");

    if (midRollData.length > 0) {
      outputEmbedCode.setOption('plugin.midRollLinks.src', "http://localhost:8000/mid-roll-links/plugin.js");
      outputEmbedCode.setOption('plugin.midRollLinks.links', midRollData);
      previewEmbed.plugin.midRollLinks.update({ "links": midRollData });
    }
    $("#output_embed_code").val(outputEmbedCode.toString());

    if (hasFullscreen && hasMidRoll) {
      $("#alert").html(fullScreenAlert).show();
    } else {
      $("#alert").html("").hide();
    }
  }

  function embedMidRollPreview() {
    $("#output_embed_code").val(outputEmbedCode.toString());
    outputEmbedCode.previewInElem("preview");
    embedded = true;
    updateEmbedCode();
  }

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

// Check to see if the midroll inputs are currently filled
function allMidRollInputsTaken() {
  var result = true;
  $(".midrolls .link_and_time_range_combo").not("#link_and_time_range_combo_template").each(function() {
    var linkText = $(this).find("input[name=link_text]").val();
    var linkHref = $(this).find("input[name=link_href]").val();
    var start = $(this).find("input[name=start]").val();
    var end = $(this).find("input[name=end]").val();
    if ($.trim(linkText) == "" || $.trim(linkHref) == "" || $.trim(start) == "" || $.trim(end) == "") {
      result = false;
    }
    if (!/^\d+$/.test(start) || !/^\d+$/.test(end)) {
      result = false;
    }
  });
  return result;
}

// should we add another MidRoll Template?
function conditionallyAddNewMidRollInput() {
  if (allMidRollInputsTaken()) {
    addMidRollInput();
  }
}

$(".midrolls").on("keyup", "input[type=text]", conditionallyAddNewMidRollInput);

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

    // Add in default midRoll Example
    addDefaultMidRoll("Check Out Wistia", "http://wistia.com", "?", "?");
    addMidRollData("Oooo Check Out Benny", "hesajerk.com", 03, 10);
  });
};
