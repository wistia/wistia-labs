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
      
      @outputEmbedCode.setOption("videoFoam", true)
      
      if isIframe or isPopover
        $("#output_embed_code").val(@outputEmbedCode.toString() + @iframeApiString)
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
    
    # Example Stuff
    if (!Wistia.localStorage("videoFoam.cleared"))
      showExample()
      $(".show_example_text").hide()
      $(".clear_example_text").show()
    else
      $(".show_example_text").show()
      $(".clear_example_text").hide()
    

    $("#clear_example").click (event) ->
      event.preventDefault()
      resetInterface()
      $(".show_example_text").show()
      $(".clear_example_text").hide()
      Wistia.localStorage("videoFoam.cleared", true)

    $("#show_example").click (event) ->
      event.preventDefault()
      showExample()
      $(".show_example_text").hide()
      $(".clear_example_text").show()
      Wistia.localStorage("videoFoam.cleared", false)
  )

window.resetInterface = ->
  $("#source_embed_code").val("").keyup().change()


window.showExample = ->
  resetInterface()
  $("#source_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/atnj7kek19?playerColor=81b7db&version=v1&videoHeight=304&videoWidth=540\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"540\" height=\"304\"></iframe>").keyup().change()

