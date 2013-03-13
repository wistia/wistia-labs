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
      @change = true
      @debounceUpdates()

    $("a[name=add_new]").on 'click', (e) =>
      e.preventDefault()
      @addMidrollInput()

    $("a[name=remove_all]").on 'click', (e) =>
      e.preventDefault()
      @removeAllInputs()
      @addMidrollInput()
      @debounceUpdates()

    $("a[name=see_example]").on 'click', (e) =>
      e.preventDefault()
      @removeAllInputs()
      $("#source_embed_code").val(@exampleEmbedCode)
      @debounceUpdates()
      @addMidrollData("YOU SHOULD CLICK HERE", "unclebenny.com", 2, 10)
      @addMidrollData("CHECK OUT UNCLE BENNY!", "unclebenny.com", 8, 14)
      @addMidrollData("BUY OUR STUFF!", "unclebenny.com", 12, 22)
      @debounceUpdates()

    # Update the output whenever a configuration input changes
    $("#configure").on("keyup", "input[type=text], textarea", => @debounceUpdates())


  # Updating is kind of a heavy operation; we don't want to 
  # do it on every single keystroke.
  debounceUpdates: ->
    clearTimeout("updateOutputTimeout")
    updateOutputTimeout = setTimeout(@updateOutputEmbedCode, 500)


  updateOutputEmbedCode: =>
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      @errors = @getErrors()
      @playerColor = @outputEmbedCode.options().playerColor or "636155"
      @midrollData = @midrollDataFromPage()

      @outputEmbedCode.setOption('plugin.midrollLinks.src', "http://localhost:8000/mid-roll-links/mid-roll-links.js")
      @outputEmbedCode.setOption('plugin.midrollLinks.links', @midrollData)
      @outputEmbedCode.setOption('plugin.midrollLinks.playerColor', @playerColor)

      if @errors
        $("#alert").html(@errors).show()
      else
        $("#alert").html("").hide()

      $("#output_embed_code").val(@outputEmbedCode.toString())

      @updatePreview()

    else
      # error time!
      $("#output_embed_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')

  updatePreview: () =>
    Wistia.timeout 'updatePreview', =>
      if @change
        @outputEmbedCode.previewInElem("preview", { type: 'api' }, =>
          window.previewEmbed.plugin.midrollLinks.update
            links: @midrollData
            playerColor: @playerColor
          @change = false
        )
      else if !@previewEmbedded
        @outputEmbedCode.previewInElem("preview", { type: 'api' }, =>
          window.previewEmbed.plugin.midrollLinks.update
            links: @midrollData
          @previewEmbedded = true
        )
      else
        window.previewEmbed.plugin.midrollLinks.update
          links: @midrollData
    , 250


  # get the mid rolls data off the page
  midrollDataFromPage: ->
    result = []
    $(".midrolls .link_and_time_range_combo").not("#link_and_time_range_combo_template").each (index, entry) =>
      linkText = $(entry).find("input[name=link_text]").val()
      linkHref = @maybeAddHttp $(entry).find("input[name=link_href]").val()
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
    $elem.find("input[name=link_text]").val(link_text)
    $elem.find("input[name=link_href]").val(link_href)
    $elem.find("input[name=start]").val(start)
    $elem.find("input[name=end]").val(end)

  # for when we want to clear all inputs
  removeAllInputs: ->
    $(".midrolls .link_and_time_range_combo")
      .not("#link_and_time_range_combo_template")
      .remove()

  getErrors: ->
    hasFullscreen = @sourceEmbedCode.options().fullscreenButton == null or @sourceEmbedCode.options().fullscreenButton
    hasMidRoll = Wistia.obj.get(@outputEmbedCode.options(), "plugin.midRollLinks")
    fullScreenAlert = "This embed code has fullscreen enabled with mid-rolls. " +
      "Just so you know, the Midroll Links won't show up when fullscreen. " +
      "You might want to <a href='#' class='turn_off_fullscreen'>turn off fullscreen</a>."

    if hasFullscreen and hasMidRoll
      fullScreenAlert
    else
      ""

  #if no http on linkHref, let's add it
  maybeAddHttp: (href) ->
    if href.indexOf("http") == -1 then "http://" + href else href

# Assign all DOM bindings on doc-ready in here. We can also 
# run whatever initialization code we might need.
window.setupLabInterface = ($) ->
  $(->
    window.midroll = new midroll()
  )
