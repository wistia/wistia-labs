window.jsFileName = 'plugin.js'
window.jsProductionPath = 'fast.wistia.com/labs/mid-roll-links'

class Midroll
  constructor: ->
    @previewEmbedded = false
    @change = false
    @exampleEmbedCode = "<div id=\"wistia_s1kuzpsgq0\" class=\"wistia_embed\" style=\"width:640px;height:360px;\" data-video-width=\"640\" data-video-height=\"360\">&nbsp;</div><script charset=\"ISO-8859-1\" src=\"http://fast.wistia.com/static/concat/E-v1.js\"></script> <script> wistiaEmbed = Wistia.embed(\"s1kuzpsgq0\", { version: \"v1\", videoWidth: 640, videoHeight: 360, volumeControl: true, controlsVisibleOnLoad: true }); </script>"

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
      @clearAll()

    $("a[name=see_example]").on 'click', (e) =>
      e.preventDefault()
      @setupExample()

    # Update the output whenever a configuration input changes
    $("#configure").on("keyup", "input[type=text], textarea", => @debounceUpdates())


  setupExample: ->
    @removeAllInputs()
    $("#source_embed_code").val(@exampleEmbedCode)
    @previewEmbedded = false
    @debounceUpdates()
    @addMidrollData("I'm Jeff!", "http://jeffvincent.me", 0, 6)
    @addMidrollData("Get candy necklaces!", "http://www.amazon.com/CANDY-NECKLACE-36-count-Tub/dp/B002HY1YJI", 10, 15)
    @debounceUpdates()

  clearAll: ->
    $("#source_embed_code").val("")
    @previewEmbedded = false
    @removeAllInputs()
    @addMidrollInput()
    @debounceUpdates()


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

      @outputEmbedCode.setOption('plugin.midrollLinks.src', pluginSrc(@sourceEmbedCode))
      @outputEmbedCode.setOption('plugin.midrollLinks.links', @midrollData)

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

  updatePreview: =>
    Wistia.timeout 'updatePreview', =>
      if @change
        @outputEmbedCode.previewInElem("preview", { type: 'api' }, =>
          @waitFor(-> window.previewEmbed.plugin?.midrollLinks).run =>
            window.previewEmbed.plugin.midrollLinks.update
              links: @midrollData
              playerColor: @playerColor
            @change = false
        )
      else if !@previewEmbedded
        @outputEmbedCode.previewInElem("preview", { type: 'api' }, =>
          @waitFor(-> window.previewEmbed.plugin?.midrollLinks).run =>
            window.previewEmbed.plugin.midrollLinks.update
              links: @midrollData
            @previewEmbedded = true
        )
      else
        @waitFor(-> window.previewEmbed.plugin?.midrollLinks).run =>
          window.previewEmbed.plugin.midrollLinks.update
            links: @midrollData
    , 250


  waitFor: (cond, timeout = 5000) ->
    result = new Wistia.StopGo()
    timeoutId = Wistia.seqId()
    startTime = new Date().getTime()
    fn = ->
      if new Date().getTime() - startTime > 5000
        console?.log('Condition ', cond, ' never came true')
      else if cond()
        result.go()
      else
        Wistia.timeout timeoutId, fn, 100
    fn()
    result


  # get the mid rolls data off the page
  midrollDataFromPage: ->
    result = []
    $(".midrolls .link_and_time_range_combo")
      .not("#link_and_time_range_combo_template")
      .each (index, entry) =>
        linkText = $(entry).find("input[name=link_text]").val()
        linkHref = @maybeAddHttp $(entry).find("input[name=link_href]").val()
        start = $(entry).find("input[name=start]").val()
        end = $(entry).find("input[name=end]").val()
        if linkText and linkHref and /^\d+$/.test(start) and /^\d+$/.test(end)
          result.push
            linkText: linkText
            linkHref: linkHref
            start: parseInt(start, 10)
            end: parseInt(end, 10)
    result

  # add another midroll input
  addMidrollInput: ->
    $elem = $("#link_and_time_range_combo_template").clone()
    $elem.show().removeAttr("id")
    $(".midrolls .mid_roll_entries").append($elem)
    $elem.find(".timing input").timeatEntry()
    $elem

  # add new mid roll data
  addMidrollData: (linkText, linkHref, start, end) ->
    $elem = @addMidrollInput()
    $elem.find("input[name=link_text]").val(linkText)
    $elem.find("input[name=link_href]").val(linkHref)
    $elem.find("input[name=start]").val(start).triggerHandler("update")
    $elem.find("input[name=end]").val(end).triggerHandler("update")

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
  $ ->
    window.midroll = new Midroll()

    if !Wistia.localStorage("midRollLinks.cleared")
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
      Wistia.localStorage("midRollLinks.cleared", true)

    $("#show_example").click (event) ->
      event.preventDefault()
      showExample()
      $(".show_example_text").hide()
      $(".clear_example_text").show()
      Wistia.localStorage("midRollLinks.cleared", false)

window.resetInterface = ->
  midroll.clearAll()

window.showExample = ->
  midroll.setupExample()

setupLabInterface(jQuery)
