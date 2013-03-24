window.jsFileName = 'plugin.js';
window.jsProductionPath = 'fast.wistia.com/labs/chapters';

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  window.outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {
    // Set custom options on the embed code.

    // Add as many chapters as have been filled in
    $(".chapter_title_input").each(function(i) {
      var j = i + 1;
      if ($("#chapter_" + j + "_title").val() != "") {
        outputEmbedCode.setOption("plugin.chapters.ch_" + j + "_title", $("#chapter_" + j + "_title").val());
        outputEmbedCode.setOption("plugin.chapters.ch_" + j + "_time", $("#chapter_" + j + "_time").val());
      }
    });

    outputEmbedCode.setOption("plugin.chapters.src", pluginSrc(sourceEmbedCode));
    outputEmbedCode.setOption("plugin.chapters.width", $("#chapters_width").val());
    outputEmbedCode.setOption("plugin.chapters.location", $("#chapters_location").val());
    outputEmbedCode.setOption("plugin.chapters.show_timestamps", $("#chapters_show_timestamps").val());
    outputEmbedCode.width(outputEmbedCode.width() + parseInt($("#chapters_width").val(), 10));

    // Display the output.
    $("#output_embed_code").val(outputEmbedCode.toString());
    outputEmbedCode.previewInElem("preview");

    var isIframe = Wistia.EmbedCode.isIframe(outputEmbedCode);
    var isPopover = Wistia.EmbedCode.isPopover(outputEmbedCode);
    var iframeSrcTooLong = isIframe && outputEmbedCode._rawSrc.length > 2000;
    var popoverSrcTooLong = isPopover && outputEmbedCode._rawHref.length > 2000;
    if (iframeSrcTooLong || popoverSrcTooLong) {
      $("#alert").html("The options are too complex for " +
        "this type of embed code. Please switch to an API or SEO embed code " +
        "to ensure it will work on all browsers.").show();
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


// Assign all DOM bindings on doc-ready in here. We can also 
// run whatever initialization code we might need.
window.setupLabInterface = function($) {
  $(function() {
    // Update the output whenever a configuration input changes.
    $("#configure")
      .on("keyup", "input[type=text], textarea", debounceUpdateOutput)
      .on("change", "select", debounceUpdateOutput)
      .on("click", ":radio,:checkbox", debounceUpdateOutput);
  });

  for (var i = 0; i < 3; i++){
    generateChapter();
  }

  $("#add_another").click(function(event) {
    event.preventDefault();
    generateChapter();
  });
};

var chapterCount = 1;
function generateChapter() {
  num = chapterCount.toString();
  div = document.createElement('div');
  html = '<input id="chapter_' + num + '_title" type="text" value="Chapter ' + num + '" class="chapter_title_input"/>';
  html += ' @ ';
  html += '<input id="chapter_' + num + '_time" type="text" value="0" class="timeat chapter_time_input"/>';
  div.innerHTML = html;
  document.getElementById('configure_chapters').appendChild(div);
  $('#chapter_' + num + '_time').timeatEntry();
  chapterCount++;

  debounceUpdateOutput();
}
