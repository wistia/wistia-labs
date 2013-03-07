class midroll
  constructor: ->
    @previewEmbedded = false
    @change = false
    @exampleEmbedCode = "<div id=\"wistia_r2wybv7xr0\" class=\"wistia_embed\" style=\"width:640px;height:360px;\" data-video-width=\"640\" data-video-height=\"360\">&nbsp;</div><script charset=\"ISO-8859-1\" src=\"http://fast.wistia.com/static/concat/E-v1.js\"></script> <script> wistiaEmbed = Wistia.embed(\"r2wybv7xr0\", { version: \"v1\", videoWidth: 640, videoHeight: 360, volumeControl: true, controlsVisibleOnLoad: true }); </script>"

    $(document).on "click", ".turn_off_fullscreen", (event) =>
      event.preventDefault()
      source = Wistia.EmbedCode.parse($("#source_embed_code").val())
      source.setOption("fullscreenButton", false)
      $("#source_embed_code").val(source.toString()).keyup()

    $("#source_embed_code").on "keyup", =>
      change = true
      @updateOutput()

    $("a[name=add_new]").on 'click', (e) =>
      e.preventDefault()
      @addMidrollInput()

    $("a[name=remove_all]").on 'click', (e) =>
      e.preventDefault()
      @removeAllInputs()
      @addMidrollInput()
      @updateOutput()

    $("a[name=see_example]").on 'click', (e) =>
      e.preventDefault()
      @removeAllInputs()
      $("#source_embed_code").val(@exampleEmbedCode)
      @updateOutput()
      @addMidrollData("YOU SHOULD CLICK HERE", "unclebenny.com", 2, 10)
      @addMidrollData("CHECK OUT UNCLE BENNY!", "unclebenny.com", 8, 14)
      @addMidrollData("BUY OUR STUFF!", "unclebenny.com", 12, 22)
      @updateOutput()

    # Update the output whenever a configuration input changes
    $("#configure")
      .on "keyup", "input[type=text], textarea", @updateOutput()
      .on "change", "select", @updateOutput()
      .on "click", ":radio,:checkbox", @updateOutput()

    #@addDefaultMidroll("Check Out Wistia", "http://wistia.com", "?", "?")

  updateOutput: ->
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      @playerColor = @outputEmbedCode.options().playerColor or "636155"
      console.log "playerColor", @playerColor

      @outputEmbedCode.setOption('plugin.midrollLinks.src', "http://localhost:8000/mid-roll-links/mid-roll-links.js")
      @outputEmbedCode.setOption('plugin.midrollLinks.playerColor', @playerColor)

      @updateEmbedCode()

    else
      # error time!
      $("#output_embed_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')
  
  # the "new embed code" box
  updateEmbedCode: ->
    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      hasFullscreen = @sourceEmbedCode.options().fullscreenButton == null or @sourceEmbedCode.options().fullscreenButton
      hasMidRoll = Wistia.obj.get(@outputEmbedCode.options(), "plugin.midRollLinks")
      fullScreenAlert = "This embed code has fullscreen enabled with mid-rolls. " +
        "Just so you know, the Midroll Links won't show up when fullscreen. " +
        "You might want to <a href='#' class='turn_off_fullscreen'>turn off fullscreen</a>."
      @midrollData = @midrollDataFromPage()

      if hasFullscreen and hasMidRoll
        $("#alert").html(fullScreenAlert).show()
      else
        $("#alert").html("").hide()

      if !@previewEmbedded
        @setupPlugin()
      else
        @updatePreview()

    else
      $("#output_embed_code").html "Something looks wrong with that embed code." +
        " Please try adding again."
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')

  setupPlugin: ->
    console.log "plugin setup ran!"
    console.log "previewEmbedded", @previewEmbedded
    @outputEmbedCode.setOption('plugin.midrollLinks.links', {'links': []})
    @outputEmbedCode.setOption('plugin.midrollLinks.playerColor', @playerColor)

    $("#output_embed_code").val(@outputEmbedCode.toString())
    @previewEmbedded = true
    @outputEmbedCode.previewInElem "preview", { type: 'api' }, =>
      @updatePreview()

  updatePreview: ->
    Wistia.timeout 'updatePreview', ->
      if @change
        @outputEmbedCode.previewInElem("preview", { type: 'api' }, =>
          window.previewEmbed.plugin.midrollLinks.update
            "links": @midrollData
            "playerColor": @playerColor
          @change = false
        )
      else
        if window.previewEmbed.ready
          console.log "running non change update"
          window.previewEmbed.plugin.midrollLinks
            "links": @midrolldata
            "playerColor": @playerColor
    , 250

#   Updating is kind of a heavy operation; we don't want to 
#   do it on every single keystroke.
# debounceUpdateOutput: ->
#   clearTimeout(updateOutputTimeout)
#   updateOutputTimeout = setTimeout(@updateOutput, 500)

  # get the mid rolls data off the page
  midrollDataFromPage: ->
    result = []
    $(".midrolls .link_and_time_range_combo").not("#link_and_time_range_combo_template").each (index, entry) =>
      linkText = $(entry).find("input[name=link_text]").val()
      console.log "linkText", linkText
      linkHref = @maybeAddHttp($(entry).find("input[name=link_href]").val())
      start = $(entry).find("input[name=start]").val()
      end = $(entry).find("input[name=end]").val()
      if linkText and linkHref and parseInt(start, 10) and end
        result.push
          linkText: linkText
          linkHref: linkHref
          start: parseInt(start, 10)
          end: parseInt(end, 10)
    return result

  # add another midroll input
  addMidrollInput: ->
    $elem = $("#link_and_time_range_combo_template").clone()
    $elem.show().removeAttr("id")
    $(".midrolls .mid_roll_entries").append($elem)
    $elem

  # add new mid roll data
  addMidrollData: (link_text, link_href, start, end) ->
    $elem = @addMidrollInput()
    $elem.find("input[name=link_text]").focus().val(link_text)
    $elem.find("input[name=link_href]").focus().val(link_href)
    $elem.find("input[name=start]").focus().val(start)
    $elem.find("input[name=end]").focus().val(end)

  # add default midRoll
  addDefaultMidroll: (link_text, link_href, start, end) ->
    $elem = @addMidrollInput()
    # lets try adding a class on there we can ignore in the midRollData
    $elem.addClass('example')
    $elem.find("input[name=link_text]").example(link_text)
    $elem.find("input[name=link_href]").example(link_href)
    $elem.find("input[name=start]").example(start)
    $elem.find("input[name=end]").example(end)

  # for when we want to clear all inputs
  removeAllInputs: ->
    $(".midrolls .link_and_time_range_combo")
      .not("#link_and_time_range_combo_template")
      .remove()

  #if no http on linkHref, let's add it
  maybeAddHttp: (href) ->
    console.log "href", href
    if href.indexOf("http") == -1 then "http://" + href else href

# Assign all DOM bindings on doc-ready in here. We can also 
# run whatever initialization code we might need.
window.setupLabInterface = ($) ->
  $(->
    window.midroll = new midroll()
  )
