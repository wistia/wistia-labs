class VideoFoam
  constructor: ->

    @resizeable = false
    @iframeApiString = "\n<script src='//fast.wistia.com/static/iframe-api-v1.js'></script>"

    $("#configure")
      .on("keyup", "input[type=text], textarea", => @debounceUpdateOutput())

  # Updating is kind of a heavy operation; we don't want to 
  # do it on every single keystroke.
  debounceUpdateOutput: =>
    clearTimeout("updateOutputTimeout")
    updateOutputTimeout = setTimeout(@updateOutput, 500)


  updateOutput: =>
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      isIframe = Wistia.EmbedCode.isIframe(@sourceEmbedCode)
      isPopover = Wistia.EmbedCode.isPopover(@sourceEmbedCode)
      
      @outputEmbedCode.setOption("videoFoam", true);
      
      if isIframe or isPopover
        @outputEmbedCode = @outputEmbedCode.toString() + @iframeApiString
        $("#output_embed_code").val(@outputEmbedCode)
      else
        $("#output_embed_code").val(@outputEmbedCode)

      @outputEmbedCode.previewInElem("preview")
      $("#try").show()
      unless @resizeable
        @addResizableTo($("#draggable_wrapper"))
        @resizeable = true
      
    else
      $("#output_embed_code").val(
        """
        Hmm, that embed code doesn't look right. Maybe our dog chewed on it?
        """
      )
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')

  addResizableTo: (elem) ->
    elem
      .addClass('foamed')
      .draggable()
      .resizable()

# Assign all DOM bindings on doc-ready in here. We can also 
# run whatever initialization code we might need.
window.setupLabInterface = ($) ->
  $(->
    window.VideoFoam = new VideoFoam()
  )
