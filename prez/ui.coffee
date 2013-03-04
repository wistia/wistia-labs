class Prez
  constructor: ->
    # some stuff that we need to know
    @prezChromeHeight = 65
    @hasPrez = false
    @prezPosition = $('#presentation_position').val()

    $("#presentation_url").on "keyup", => @updatePresentation()
    $("#presentation_position").on "change", => @updatePresentationPosition()
    $("#source_embed_code").on "keyup", => @updateEmbedCode()


  # called when the presentation changes
  updatePresentation: ->
    @hasPrez = false
    prezUrl = $('#presentation_url').val()
    @getPresentationData(prezUrl,
      (data) =>
        @prezOriginalWidth = data.width
        @prezOriginalHeight = data.height
        @prezId = @_extractSpeakerDeckId(data.html)

        @hasPrez = true
        @updateEmbedCode()
    )


  updatePresentationPosition: ->
    @prezPosition = $('#presentation_position').val()
    @updateEmbedCode()


  _extractSpeakerDeckId: (embedCode) ->
    regex = /speakerdeck\.com\/player\/([0-9a-zA-Z]+)/
    regex.exec(embedCode)[1]


  prezWidth: ->
    if @prezPosition is 'left' or @prezPosition is 'right'
      Math.round (@sourceEmbedCode.height() - @prezChromeHeight) * @prezSlideAspect()
    else
      @sourceEmbedCode.width()


  prezHeight: ->
    if @prezPosition is 'left' or @prezPosition is 'right'
      @sourceEmbedCode.height()
    else
      Math.round @sourceEmbedCode.width() / @prezSlideAspect() + @prezChromeHeight


  prezSlideAspect: ->
    @prezOriginalWidth / (@prezOriginalHeight - @prezChromeHeight)


  updateEmbedCode: ->
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if (@sourceEmbedCode && @sourceEmbedCode.isValid())

      if @hasPrez
        # max room for the prez, you know what i mean
        if @prezPosition is 'left' or @prezPosition is 'right'
          @outputEmbedCode.width(@sourceEmbedCode.width() + @prezWidth())
        else
          @outputEmbedCode.height(@sourceEmbedCode.height() + @prezHeight())

        @outputEmbedCode.setOption("plugin.prez.src", "http://localhost:8000/prez/plugin.js")
        @outputEmbedCode.setOption("plugin.prez.speakerDeckId", @prezId)
        @outputEmbedCode.setOption("plugin.prez.width", @prezWidth())
        @outputEmbedCode.setOption("plugin.prez.height", @prezHeight())
        @outputEmbedCode.setOption("plugin.prez.position", @prezPosition)

      # Display the output.
      $("#output_embed_code").val(@outputEmbedCode.toString())
      @outputEmbedCode.previewInElem("preview", { type: 'api' })

    else

      # Show an error if invalid. We can be more specific 
      # if we expect a certain problem.
      $("#output_embed_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')


  # Updating is kind of a heavy operation we don't want to 
  # do it on every single keystroke.
  debounce: ->
    clearTimeout(@updateOutputTimeout)
    @updateOutputTimeout = setTimeout(@updateOutput, 500)


  # given a speakerdeck URL and a callback, call the callback with the output of
  # the oEmbed endpoint
  #
  # see here for example: 
  # https:#speakerdeck.com/oembed.json?url=https%3A%2F%2Fspeakerdeck.com%2Ftammielis%2Fdesigning-for-humans-not-robots
  #
  getPresentationData: (url, callback) ->

    speakerDeckOembedUrl = "https://speakerdeck.com/oembed.json?url=#{encodeURIComponent(url)}"

    $.getJSON(
      "http://jsonp.ru/?callback=?",
      { url: speakerDeckOembedUrl },
      (raw) ->
        data = $.parseJSON(raw['body'])
        callback(data)
    )


# Assign all DOM bindings on doc-ready in here. We can also 
# run whatever initialization code we might need.
window.setupLabInterface = ($) ->
  $(->
    window.prez = new Prez()
  )
