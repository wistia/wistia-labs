# window.jsFileName = "plugin.js"

class VideoInEmail
  constructor: ->
    @previewEmbedded = false
    @change = false
    @exampleEmbedCode = """
    <iframe src="//fast.wistia.net/embed/iframe/7phpe910v3" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" allowfullscreen mozallowfullscreen webkitallowfullscreen oallowfullscreen msallowfullscreen width="600" height="338"></iframe>
    """

    $("#source_embed_code").on "keyup", =>
      @previewEmbedded = false
      @change = false
      @debounceUpdates()

    $("#video_width").on "keyup", =>
      @previewEmbedded = false
      @change = false
      width = parseInt($("#video_width").val())
      @updateEmbedWidth(width) if width and width > 0
      @debounceUpdates()

    $("#fallback_link").on "keyup", =>
      @previewEmbedded = false
      @change = false
      @debounceUpdates()

    $("a[name=remove_all]").on 'click', (e) =>
      e.preventDefault()
      @clearAll()

    $("a[name=see_example]").on 'click', (e) =>
      e.preventDefault()
      @setupExample()

    $("a[name=reset]").on 'click', (e) =>
      e.preventDefault()
      @change = false
      @previewEmbedded = false
      @debounceUpdates()

    $("#configure input[type=number]").on "change", =>
      @change = true
      @debounceUpdates()

    $("#configure input[type=radio]").on "change", =>
      @change = true
      @debounceUpdates()

    $("#configure textarea").on "change", =>
      @change = true
      @debounceUpdates()

  setupExample: ->
    $("#source_embed_code").val(@exampleEmbedCode)
    $("#video_width").val(600)
    $("#fallback_link").val("https://home.wistia.com/medias/7phpe910v3")
    @previewEmbedded = false
    @change = false
    @debounceUpdates()

  clearAll: ->
    $("#source_embed_code").val("")
    @previewEmbedded = false
    @change = false
    @debounceUpdates()

  updateEmbedWidth: (newWidth) ->
    oldHeight = Wistia.EmbedCode.parse($("#source_embed_code").val()).height()
    oldWidth = Wistia.EmbedCode.parse($("#source_embed_code").val()).width()
    newHeight = Math.round(oldHeight * newWidth / oldWidth)

    newEmbed = Wistia.EmbedCode.parse($("#source_embed_code").val()).width(newWidth).height(newHeight)
    $("#source_embed_code").val(newEmbed)

  debounceUpdates: ->
    clearTimeout("updateOutputTimeout")
    updateOutputTimeout = setTimeout(@updateOutput, 100)

  updateOutput: =>
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      @width = @getVideoWidth()
      @updatePreview()
      @updateVideoCode()
    else
      $("#video_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html("<div id=\"placeholder_preview\">Your video here</div>")

  updatePreview: =>
    Wistia.timeout "updatePreview", =>
      if @change
      else if !@previewEmbedded
        @sourceEmbedCode.previewInElem "preview", { type: "api" }, =>
          @previewEmbedded = true
    , 100

  updateVideoCode: =>
    hashedId = Wistia.EmbedCode.parse($("#source_embed_code").val()).hashedId()
    Wistia.remote.media hashedId, (media) =>
      mp4Url = media.assets.iphone.url.replace('.bin', '/video.mp4')
      posterUrl = media.assets.still.url
      playerColor = media.embed_options.playerColor
      $('#video_code').val(@outputVideoCode(@getVideoWidth(), posterUrl, mp4Url, @getFallbackLink(), posterUrl, playerColor))
      styles = { height: '200px', width: '585px', 'font-family': 'Courier' }
      $('#video_code').css(styles)

  outputVideoCode: (width, poster, mp4, fallbackLink, fallbackImage, playerColor) =>
    """
    <video width="#{width}" poster="#{poster}" controls="controls">
      <source src="#{mp4}" type="video/mp4"/>
      <a href="#{fallbackLink}"><img src="#{fallbackImage.replace('.bin', '.jpg')}?image_play_button=true&image_play_button_color=#{playerColor}&image_resize=#{width}" width="#{width}"/></a>
    </video>
    """

  getVideoWidth: ->
    parseInt($("#video_width").val())

  getFallbackLink: ->
    $("#fallback_link").val()


# Assign all DOM bindings on doc-ready in here. We can also
# run whatever initialization code we might need.
window.setupLabInterface = ($) ->
  $ ->
    window.videoInEmail = new VideoInEmail()

    if !Wistia.localStorage("videoInEmail.cleared")
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
      Wistia.localStorage("videoInEmail.cleared", true)

    $("#show_example").click (event) ->
      event.preventDefault()
      showExample()
      $(".show_example_text").hide()
      $(".clear_example_text").show()
      Wistia.localStorage("videoInEmail.cleared", false)


window.resetInterface = ->
  videoInEmail.clearAll()

window.showExample = ->
  videoInEmail.setupExample()

setupLabInterface(jQuery)
