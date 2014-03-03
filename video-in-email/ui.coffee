# window.jsFileName = "plugin.js"

class VideoInEmail
  constructor: ->
    @previewEmbedded = false
    @change = false
    @exampleEmbedCode = """
    <div id="wistia_n9err1v2yk" class="wistia_embed" style="width:640px;height:388px;"><div itemprop="video" itemscope itemtype="http://schema.org/VideoObject"><meta itemprop="name" content="Choosing Background Music - ReelSEO" /><meta itemprop="duration" content="PT4M31S" /><meta itemprop="thumbnailUrl" content="https://embed-ssl.wistia.com/deliveries/e11ab8bcf30ddcef5f2b2a12c4b038613ac4dd84.bin" /><meta itemprop="contentURL" content="https://embed-ssl.wistia.com/deliveries/f33c77c9db099d06d53074d2f31db5ffab62a074.bin" /><meta itemprop="embedURL" content="https://embed-ssl.wistia.com/flash/embed_player_v2.0.swf?2013-10-04&autoPlay=false&banner=false&controlsVisibleOnLoad=false&customColor=87d452&endVideoBehavior=default&fullscreenDisabled=true&hdUrl%5B2pass%5D=true&hdUrl%5Bext%5D=flv&hdUrl%5Bheight%5D=720&hdUrl%5Bsize%5D=89418647&hdUrl%5Btype%5D=hdflv&hdUrl%5Burl%5D=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2F7a18aef53682b02d48ef5caa54e36b35e87f44fd.bin&hdUrl%5Bwidth%5D=1280&mediaDuration=271.0&playButtonVisible=true&showPlayButton=true&showPlaybar=true&showVolume=true&stillUrl=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2Fe11ab8bcf30ddcef5f2b2a12c4b038613ac4dd84.jpg%3Fimage_crop_resized%3D640x360&unbufferedSeek=false&videoUrl=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2Ff33c77c9db099d06d53074d2f31db5ffab62a074.bin" /><meta itemprop="uploadDate" content="2014-02-27T16:15:27Z" /><object id="wistia_n9err1v2yk_seo" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" style="display:block;height:360px;position:relative;width:640px;"><param name="movie" value="https://embed-ssl.wistia.com/flash/embed_player_v2.0.swf?2013-10-04"></param><param name="allowfullscreen" value="true"></param><param name="allowscriptaccess" value="always"></param><param name="bgcolor" value="#000000"></param><param name="wmode" value="opaque"></param><param name="flashvars" value="autoPlay=false&banner=false&controlsVisibleOnLoad=false&customColor=87d452&endVideoBehavior=default&fullscreenDisabled=true&hdUrl%5B2pass%5D=true&hdUrl%5Bext%5D=flv&hdUrl%5Bheight%5D=720&hdUrl%5Bsize%5D=89418647&hdUrl%5Btype%5D=hdflv&hdUrl%5Burl%5D=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2F7a18aef53682b02d48ef5caa54e36b35e87f44fd.bin&hdUrl%5Bwidth%5D=1280&mediaDuration=271.0&playButtonVisible=true&showPlayButton=true&showPlaybar=true&showVolume=true&stillUrl=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2Fe11ab8bcf30ddcef5f2b2a12c4b038613ac4dd84.jpg%3Fimage_crop_resized%3D640x360&unbufferedSeek=false&videoUrl=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2Ff33c77c9db099d06d53074d2f31db5ffab62a074.bin"></param><embed src="https://embed-ssl.wistia.com/flash/embed_player_v2.0.swf?2013-10-04" allowfullscreen="true" allowscriptaccess="always" bgcolor=#000000 flashvars="autoPlay=false&banner=false&controlsVisibleOnLoad=false&customColor=87d452&endVideoBehavior=default&fullscreenDisabled=true&hdUrl%5B2pass%5D=true&hdUrl%5Bext%5D=flv&hdUrl%5Bheight%5D=720&hdUrl%5Bsize%5D=89418647&hdUrl%5Btype%5D=hdflv&hdUrl%5Burl%5D=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2F7a18aef53682b02d48ef5caa54e36b35e87f44fd.bin&hdUrl%5Bwidth%5D=1280&mediaDuration=271.0&playButtonVisible=true&showPlayButton=true&showPlaybar=true&showVolume=true&stillUrl=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2Fe11ab8bcf30ddcef5f2b2a12c4b038613ac4dd84.jpg%3Fimage_crop_resized%3D640x360&unbufferedSeek=false&videoUrl=https%3A%2F%2Fembed-ssl.wistia.com%2Fdeliveries%2Ff33c77c9db099d06d53074d2f31db5ffab62a074.bin" name="wistia_n9err1v2yk_html" style="display:block;height:100%;position:relative;width:100%;" type="application/x-shockwave-flash" wmode="opaque"></embed></object><noscript itemprop="description">Choosing Background Music - ReelSEO</noscript></div></div>
      <script charset="ISO-8859-1" src="//fast.wistia.com/assets/external/E-v1.js"></script>
      <script>
      wistiaEmbed = Wistia.embed("n9err1v2yk", {
        videoFoam: true
      })
      </script>
      <script charset="ISO-8859-1" src="//fast.wistia.com/embed/medias/n9err1v2yk/metadata.js"></script>
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
    $("#video_width").val(500)
    $("#fallback_link").val("http://i.imgur.com/Y9xpLA6.jpg")
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
      styles = { height: '112px', width: '585px', 'font-family': 'Courier' }
      $('#video_code').css(styles)
    , 100
    Wistia.hashedId = Wistia.EmbedCode.parse($("#source_embed_code").val()).hashedId()
    Wistia.remote.media "#{Wistia.hashedId}", (media) ->
      Wistia.mp4Url = media.assets.iphone.url.replace('.bin', '/video.mp4')

  outputVideoCode: =>
    """
    <video width="#{@getVideoWidth()}" height="360" poster="#{@getFallbackLink()}" controls="controls">
      <source src="#{@getVideoMp4()}" type="video/mp4" />
      <a href="#{@getFallbackLink()}"><img src="#{@getFallbackLink()}" width="640" height="360" /></a>
    </video>
    """

  getVideoWidth: ->
    parseInt($("#video_width").val())

  getFallbackLink: ->
    $("#fallback_link").val()

  getVideoMp4: ->
    return  Wistia.mp4Url


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
