function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {
    // Set custom options on the embed code.

    // Add as many chapters as have been filled in
    for (var i = 1; i <= 8; i++) {
      if ($("#chapter_" + i.toString() + "_title").val() != "") {
        outputEmbedCode.setOption("plugin.chapters.ch_" + i.toString() + "_title", $("#chapter_" + i.toString() + "_title").val());
        outputEmbedCode.setOption("plugin.chapters.ch_" + i.toString() + "_time", $("#chapter_" + i.toString() + "_time").val());
      }
    }

    outputEmbedCode.setOption("plugin.chapters.width", $("#chapters_width").val());
    outputEmbedCode.setOption("plugin.chapters.location", $("#chapters_location").val());
    outputEmbedCode.setOption("plugin.chapters.show_timestamps", $("#chapters_show_timestamps").val());

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
  });
};

var chapter_count = 1;
function generate_chapter() {
  num = chapter_count.toString();
  div = document.createElement('div');
  html = '<input id="chapter_' + num + '_title" type="text" value="Chapter ' + num + '" class="chapter_title_input"/>';
  html += ' @ ';
  html += '<input id="chapter_' + num + '_time" type="text" value="0" class="timeat chapter_time_input"/>';
  div.innerHTML = html;
  document.getElementById('configure_chapters').appendChild(div);
  $('#chapter_' + num + '_time').timeatEntry();
  chapter_count++;

  debounceUpdateOutput();
}
