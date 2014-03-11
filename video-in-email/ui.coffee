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

  debounceUpdates: ->
    clearTimeout("updateOutputTimeout")
    updateOutputTimeout = setTimeout(@updateOutputEmbedCode, 100)

  updateOutputEmbedCode: =>
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      @width = @getVideoWidth()

      $("#output_embed_code").val(@outputEmbedCode.toString())

      @updatePreview()
      @updateVideoCode()
    else
      $("#output_embed_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html("<div id=\"placeholder_preview\">Your video here</div>")

  updatePreview: =>
    Wistia.timeout "updatePreview", =>
      if @change
      else if !@previewEmbedded
        @outputEmbedCode.previewInElem "preview", { type: "api" }, =>
          @previewEmbedded = true
    , 100

  updateVideoCode: =>
    Wistia.timeout "updateVideoCode", =>
      $('#video_code').val(@outputVideoCode())
      styles = { height: '200px', width: '585px', 'font-family': 'Courier' }
      $('#video_code').css(styles)
    , 100
    Wistia.hashedId = Wistia.EmbedCode.parse($("#source_embed_code").val()).hashedId()
    Wistia.remote.media "#{Wistia.hashedId}", (media) ->
      Wistia.mp4Url = media.assets.iphone.url.replace('.bin', '/video.mp4')
      Wistia.posterUrl = media.assets.still.url
      Wistia.playerColor = media.embed_options.playerColor

  outputVideoCode: =>
    """
    <video width="#{@getVideoWidth()}" poster="#{@getPosterUrl()}" controls="controls">
      <source src="#{@getVideoMp4()}" type="video/mp4"/>
      <a href="#{@getFallbackLink()}"><img src="#{@getPosterUrl().replace('.bin', '.jpg')}?image_play_button=true&image_play_button_color=#{@getPlayerColor()}&image_resize=#{@getVideoWidth()}" width="#{@getVideoWidth()}"/></a>
    </video>
    """

  getVideoWidth: ->
    parseInt($("#video_width").val())

  getFallbackLink: ->
    $("#fallback_link").val()

  getVideoMp4: ->
    return Wistia.mp4Url

  getPosterUrl: ->
    return Wistia.posterUrl

  getPlayerColor: ->
    return Wistia.playerColor


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
