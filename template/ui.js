window.setupLabInterface = function($) {
  function updateOutput() {
    var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
    var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

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


  // Updating is kind of a heavy operation; we don't want to 
  // do it on every single keystroke.
  var updateOutputTimeout;
  function debounceUpdateOutput() {
    clearTimeout(updateOutputTimeout);
    updateOutputTimeout = setTimeout(updateOutput, 500);
  }


  // Assign all DOM bindings on doc-ready in this function.
  $(function() {

    // Update the output whenever a configuration input changes.
    $("#configure")
      .on("keyup", "input[type=text], textarea", debounceUpdateOutput)
      .on("change", "select", debounceUpdateOutput)
      .on("click", ":radio,:checkbox", debounceUpdateOutput);

  });

};
