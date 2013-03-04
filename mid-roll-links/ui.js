function updateOutput() {
  var sourceEmbedCode = newEmbedCodeFromPage();
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  var hasFullscreen = newEmbed.options().fullscreenButton == null || newEmbed.options().fullscreenButton;
  var hasMidRoll = Wistia.obj.get(newEmbed.options(), "plugin.midRollLinks.links");
  var recapNames = $("#postroll_recap").is(":checked");

  if (hasFullscreen && hasMidRoll && !recapNames) {
    $("#alert").html("This embed code has fullscreen enabled with mid-rolls. Just so you know, the Follow buttons won't show up when fullscreen. You can leave it as it is, <a href='#' class='recap_names_at_end'>recap the names at the end</a>, or <a href='#' class='turn_off_fullscreen'>turn off fullscreen</a>.").show();
  } else {
    $("#alert").html("").hide();
  }

  // get the mid rolls data
  function midrollDataFromPage() {
    var result = [];
    $(".midrolls .link_and_time_range_combo").each(function() {
      var $this = $(this);
      var linkText = $this.find("input[name=link_text]").val();
      var linkHref = $this.find("input[name=link_href]").val();
      var start = $this.find("input[name=start]").val();
      var end = $this.find("input[name=end]").val();
      if (link_text && start && end) {
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

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {

    // Set custom options on the embed code.
    // CHANGE ME!!!

    outputEmbedCode.setOption("myCustomOption", "giraffe");
    outputEmbedCode.setOption("nested.option", "cantelope");
    outputEmbedCode.setOption("also.basic-objects", { extraConfig: true });
    outputEmbedCode.setOption("anotherOption", $("#another_option").val());

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


// update the embed code!
function newEmbedCodeFromPage() {
  var postRollOptions = postRollOptionsFromPage();
  var newEmbed = window.sourceEmbed = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if ($.trim(postRollOptions.linkText)) {
    newEmbed.setOption('plugin.midRollLinks.postRoll', postRollOptions);
    newEmbed.removeOption('plugin.postRoll');
    newEmbed.removeOption('plugin.postRoll-v1');
  }

  var midRollData = midrollDataFromPage();
  if (midRollData.length > 0) {
    newEmbed.setOption('plugin.midRollLinks.links', midRollData);
    if ($("#postroll_recap").is(":checked")) {
      var recapDataHash = {};
      for (var i = 0; i < midRollData.length; i++) {
        var linkData = Wistia.extend({}, midRollData[i]);
        delete linkData.start;
        delete linkData.end;
        recapDataHash[linkData.linkText] = personData.linkText;
        recapDataHash[linkData.linkHref] = personData.linkHref;
      }
      var recapData = [];
      for (var key in recapDataHash) {
        if (recapDataHash.hasOwnProperty(key)) {
          recapData.push(recapDataHash[key]);
        }
      }
      newEmbed.setOption('plugin.midRollLinks.recap', recapData);
    }
  }

  if (Wistia.obj.get(newEmbed.options(), 'plugin.midRollLinks')) {
    newEmbed.setOption('plugin.midRollLinks.src', newEmbed.proto() + "//" + Wistia.remote.embedHost({ ssl: newEmbed.ssl() }) + "/labs/mid-roll-links/mid-roll-links.js");
  }

  return newEmbed;
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
}

// add default midRoll
function addDefaultMidRoll(link_text, link_href, example_time) {
  addMidRollInput();
  $(".midrolls").find("input[name=link_text]").example(link_text);
  $(".midrolls").find("input[name=link_href]").example(link_href);
  $(".midrolls").find("input[name=start], input[name=end]").example(example_time);
}

// add midroll - candidate for removal
function addMidRoll(link_text, link_href, start, end) {
  var $lastRangeCombo = $(".midrolls .link_and_time_range_combo").not("#link_and_time_range_combo_template").last();
  $lastRangeCombo.find("input[name=link_text]").focus().val(link_text).keyup().blur();
  $lastRangeCombo.find("input[name=link_href]").focus().val(link_href).keyup().blur();
  $lastRangeCombo.find("input[name=start]").focus().val(start).keyup().blur();
  $lastRangeCombo.find("input[name=end]").focus().val(end).keyup().blur();
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
  addDefaultMidRoll("Check Out Wistia", "http://wistia.com", "?");
  });
};
