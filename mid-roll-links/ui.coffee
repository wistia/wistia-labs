class midRoll
  constructor: ->
    @previewEmbedded = false
    @change = false
    @exampleEmbedCode = "<div id=\"wistia_r2wybv7xr0\" class=\"wistia_embed\" style=\"width:640px;height:360px;\" data-video-width=\"640\" data-video-height=\"360\">&nbsp;</div><script charset=\"ISO-8859-1\" src=\"http://fast.wistia.com/static/concat/E-v1.js\"></script> <script> wistiaEmbed = Wistia.embed(\"r2wybv7xr0\", { version: \"v1\", videoWidth: 640, videoHeight: 360, volumeControl: true, controlsVisibleOnLoad: true }); </script>"

    # for disabling fullscreen
    $(document).on "click", ".turn_off_fullscreen", (event) ->
      event.preventDefault()
      source = Wistia.EmbedCode.parse($("#source_embed_code").val())
      source.setOption("fullscreenButton", false)
      $("#source_embed_code").val(source.toString()).keyup()

    $("#source_embed_code").on "keyup", ->
      change = true
      @debounceUpdateOutput

    $("a[name=add_new]").on 'click', (e) ->
      e.preventDefault()
      @addMidRollInput()

    $("a[name=remove_all]").on 'click', (e) ->
      e.preventDefault()
      @removeAllInputs()
      @addMidRollInput()
      @updateOutput()

    $("a[name=see_example]").on 'click', (e) ->
      e.preventDefault()
      @removeAllInputs()
      $("#source_embed_code").val(exampleEmbedCode)
      @addMidRollData("YOU SHOULD CLICK HERE", "unclebenny.com", Oo02, 10)
      @addMidRollData("CHECK OUT UNCLE BENNY!", "unclebenny.com", Oo08, 14)
      @addMidRollData("BUY OUR STUFF!", "unclebenny.com", 12, 22)
      @debounceUpdateOutput

    # Update the output whenever a configuration input changes
    $("#configure")
      .on("keyup", "input[type=text], textarea", @debounceUpdateOutput)
      .on("change", "select", @debounceUpdateOutput)
      .on("click", ":radio,:checkbox", @debounceUpdateOutput)

    @addDefaultMidRoll("Check Out Wistia", "http://wistia.com", "?", "?")


  #if no http on linkHref, let's add it
  maybeAddHttp: (href) ->
    if href.indexOf("http") == -1
      return "http://" + href
    else
      return href

  # get the mid rolls data off the page
  midRollDataFromPage: ->
    $(".midrolls .link_and_time_range_combo").not("#link_and_time_range_combo_template").each ->
      $this = $(this)
      linkText = $this.find("input[name=link_text]").val()
      linkHref = maybeAddHttp($this.find("input[name=link_href]").val())
      start = $this.find("input[name=start]").val()
      end = $this.find("input[name=end]").val()
      if linkText && linkHref && parseInt(start, 10) && end
        result.push
          linkText: linkText,
          linkHref: linkHref,
          start: parseInt(start, 10),
          end: parseInt(end, 10)
    return result

  # for when we want to clear all inputs
  removeAllInputs: ->
    $(".midrolls .link_and_time_range_combo")
      .not("#link_and_time_range_combo_template")
      .remove()

  updateOutput: ->
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if @sourceEmbedCode && @sourceEmbedCode.isValid()
      @playerColor = @outputEmbedCode.options().playerColor || "636155"

      @outputEmbedCode.setOption('plugin.midRollLinks.src', "http://localhost:8000/mid-roll-links/mid-roll-links.js")
      @outputEmbedCode.setOption('plugin.midRollLinks.links', @midRollData)
      @outputEmbedCode.setOption('plugin.midRollLinks.playerColor', @playerColor)

      $("#output_embed_code").val(outputEmbedCode.toString())

    else
      # Show an error if invalid. We can be more specific 
      # if we expect a certain problem.
      $("#output_embed_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')

  updatePreviewAndOutputEmbeds: ->
    @updateEmbedCode()
    @updatePreview()  
  
  updatePreview: ->
    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      Wistia.timeout 'updatePreview', ->
        if change
          @outputEmbedCode.previewInElem("preview", { type: 'api' }, =>
            change = false
            window.previewEmbed.plugin.midRollLinks.update
              "links": @midrolldata,
              "playerColor": @playerColor
          )
        else
          window.previewEmbed.plugin.midRollLinks.update
            "links": @midrolldata,
            "playerColor": @playerColor
      , 250
    else
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')

  updatePlugin: ->
    return unless previewEmbed? and previewEmbed.plugin.midRollLinks

    Wistia.timeout 'updatePlugin', =>
      window.previewEmbed.plugin.midRollLinks.update
        "links": @midRollData
        "playerColor": @playerColor
    
  updateEmbedCode: ->
    hasFullscreen = sourceEmbedCode.options().fullscreenButton == null || sourceEmbedCode.options().fullscreenButton
    hasMidRoll = Wistia.obj.get(outputEmbedCode.options(), "plugin.midRollLinks")
    fullScreenAlert = "This embed code has fullscreen enabled with mid-rolls. " + 
      "Just so you know, the Midroll Links won't show up when fullscreen. " + 
      "You might want to <a href='#' class='turn_off_fullscreen'>turn off fullscreen</a>."

    @setUpPlugin()

    if hasFullscreen && hasMidRoll
      $("#alert").html(fullScreenAlert).show()
    else
      $("#alert").html("").hide()

#   embedMidRollPreview: ->
#     outputEmbedCode.setOption('plugin.midRollLinks.links', {'links': []})
#     outputEmbedCode.setOption('plugin.midRollLinks.playerColor', sourceEmbedCode.options().playerColor)

#     $("#output_embed_code").val(outputEmbedCode.toString())
#     outputEmbedCode.previewInElem "preview", { type: 'api' }, ->
#       @previewEmbedded = true
#       change = false
#       @updateEmbedCode()





  # Updating is kind of a heavy operation; we don't want to 
  # do it on every single keystroke.
  debounceUpdateOutput: ->
    clearTimeout(@updateOutputTimeout)
    updateOutputTimeout = setTimeout(@updateOutput, 500)

  # add another midroll input
  addMidRollInput: ->
    $elem = $("#link_and_time_range_combo_template").clone()
    $elem.show().removeAttr("id")
    $(".midrolls .mid_roll_entries").append($elem)
    return $elem

  # add new mid roll data
  addMidRollData: (link_text, link_href, start, end) ->
    $elem = @addMidRollInput()
    $elem.find("input[name=link_text]").focus().val(link_text)
    $elem.find("input[name=link_href]").focus().val(link_href)
    $elem.find("input[name=start]").focus().val(start)
    $elem.find("input[name=end]").focus().val(end)

  # add default midRoll
  addDefaultMidRoll: (link_text, link_href, start, end) ->
    $elem = @addMidRollInput()
    $elem.find("input[name=link_text]").example(link_text)
    $elem.find("input[name=link_href]").example(link_href)
    $elem.find("input[name=start]").example(start)
    $elem.find("input[name=end]").example(end)


# Assign all DOM bindings on doc-ready in here. We can also 
# run whatever initialization code we might need.
window.setupLabInterface = ($) ->
  $(->
    window.midroll = new midRoll()
  )
