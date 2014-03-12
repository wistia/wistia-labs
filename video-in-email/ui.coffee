# window.jsFileName = "plugin.js"

class VideoInEmail
  constructor: ->
    @exampleEmbedCode = """
    <iframe src="//fast.wistia.net/embed/iframe/7phpe910v3" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" allowfullscreen mozallowfullscreen webkitallowfullscreen oallowfullscreen msallowfullscreen width="600" height="338"></iframe>
    """

    $("#source_embed_code").on 'keyup', =>
      @updateEmbedCodes()
      @debounceUpdates()

    $("#video_width").on 'keyup', =>
      @debounceUpdates()

    $("#video_width").on 'change', =>
      @debounceUpdates()

    $("#fallback_link").on 'keyup', =>
      @debounceUpdates()

    $("a[name=remove_all]").on 'click', (e) =>
      e.preventDefault()
      @clearAll()

    $("a[name=see_example]").on 'click', (e) =>
      e.preventDefault()
      @setupExample()

    $("a[name=reset]").on 'click', (e) =>
      e.preventDefault()
      @debounceUpdates()

  updateEmbedCodes: ->
    @previewEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

  setupExample: ->
    $("#source_embed_code").val(@exampleEmbedCode)
    $("#video_width").val(600)
    $("#fallback_link").val("http://wistia.com")
    @updateEmbedCodes()
    @debounceUpdates()

  clearAll: ->
    $("#source_embed_code").val("")
    @updateEmbedCodes()
    @debounceUpdates()

  debounceUpdates: ->
    clearTimeout(@_updateOutputTimeout)
    @_updateOutputTimeout = setTimeout(@updateOutput, 100)

  updateOutput: =>
    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      @width = @getVideoWidth()
      @updateVideoCode()
      @updatePreview()
    else
      $("#video_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html("<div id=\"placeholder_preview\">Your video here</div>")

  updatePreview: =>
    return if @previewEmbedCode.width() is @getVideoWidth() and @previewLive

    @previewEmbedCode.
      width(@getVideoWidth()).
      height(@getVideoHeight()).
      previewInElem "preview", { type: "api" }, =>
        @previewLive = true

  updateVideoCode: =>
    hashedId = Wistia.EmbedCode.parse($("#source_embed_code").val()).hashedId()
    Wistia.remote.media hashedId, (media) =>
      mp4Url = media.assets.iphone.url.replace('.bin', '/video.mp4')
      posterUrl = media.assets.still.url
      playerColor = media.embed_options.playerColor
      $('#video_code').val(@outputVideoCode(posterUrl, mp4Url, posterUrl, playerColor))
      styles = { height: '200px', width: '585px', 'font-family': 'Courier' }
      $('#video_code').css(styles)

  outputVideoCode: (poster, mp4, fallbackImage, playerColor) =>
    """
    <video width="#{@getVideoWidth()}" height="#{@getVideoHeight()}" poster="#{poster}" controls="controls">
      <source src="#{mp4}" type="video/mp4"/>
      <a href="#{@getFallbackLink()}"><img src="#{fallbackImage.replace('.bin', '.jpg')}?image_play_button=true&image_play_button_color=#{playerColor}&image_resize=#{@getVideoWidth()}" width="#{@getVideoWidth()}" height="#{@getVideoHeight()}"/></a>
    </video>
    """

  getVideoWidth: ->
    parseInt($("#video_width").val())

  getVideoHeight: ->
    aspect = @sourceEmbedCode.width() / @sourceEmbedCode.height()
    Math.round(@getVideoWidth() / aspect)

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
