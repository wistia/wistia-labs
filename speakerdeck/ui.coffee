window.jsFileName = 'plugin.js'
window.jsProductionPath = 'fast.wistia.com/labs/speakerdeck'

class Prez
  constructor: ->
    # some stuff that we need to know
    @prezChromeHeight = 65
    @hasPrez = false
    @prezPosition = $('#presentation_position').val()
    @$timingsTable = $('#timings')

    $("#presentation_url").on "keyup", =>
      Wistia.timeout('updatePresentation', (=> @updatePresentation()), 500)
    $("#presentation_position").on "change", =>
      Wistia.timeout('updatePresentationPosition', (=> @updatePresentationPosition()), 500)

    $("#source_embed_code").on "keyup", => @updateEmbedCodeAndPreview()

    $("#default_timings").on "click", =>
      msg = """
        This will clear your existing slide timings and replace them with evenly spaced slide advances for the duration of your video.

        Might be good for the Chariots of Fire soundtrack and a presentation that contains lots of childhood photos of yourself.

        Are you sure you want to continue?
      """
      @addDefaultTimings() if confirm(msg)
      false

    $("#clear_timings").on "click", =>
      msg = "This will erase all your current slide timings. Are you sure you want this?"
      if confirm(msg)
        @clearTimings()
        @addTiming()
      false

    $('#timings').on 'keyup', 'input', => @updateTimings()

    $('#next_slide').on 'click', =>
      @nextSlide()
      false

    # next slide when they press 'n'
    $(document).on 'keypress', (e) =>
      @nextSlide() if e.which is 110


    # switch #preview to fixed position when we scroll past it
    @previewTop = $('#preview').position().top
    @fixed = false
    @noFixed = false
    $(window).scroll => @afixPreview()


    # toggle the fixed
    $('#fixed_toggle').on 'click', =>
      if @noFixed
        # ok, let's follow it
        $('#fixed_toggle').html('Unfollow')
        @noFixed = false
        @fixed = false
        @afixPreview()
      else
        # ok, let's not follow it
        $('#fixed_toggle').html('Follow')
        @noFixed = true
        @fixed = false
        $('#preview').css(position: 'relative', top: 0)

      false

    # load/clear example
    $('#load_example').on 'click', =>
      @setupExample()
      $('#header .load').hide()
      $('#header .clear').show()
      false

    $('#clear_example').on 'click', =>
      @clearAll()
      $('#header .clear').hide()
      $('#header .load').show()
      false


  # fix position for the preview
  afixPreview: ->
    if $(window).scrollTop() > (@previewTop - 20) and !@fixed
      $('#preview').css(position: 'fixed', top: 20) unless @noFixed
      $('#fixed_toggle').show()
      @fixed = true
    else if $(window).scrollTop() < (@previewTop - 20) and @fixed
      $('#preview').css(position: 'relative', top: 0)
      $('#fixed_toggle').hide()
      @fixed = false


  # sets up the sweet example video
  setupExample: ->
    $('#source_embed_code').val('<iframe src="http://fast.wistia.net/embed/iframe/p9p5keksr4?controlsVisibleOnLoad=true&version=v1&videoHeight=360&videoWidth=640&volumeControl=true" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" width="640" height="360"></iframe>')
    $('#presentation_url').val('https://speakerdeck.com/ezrafishman/the-bschwartz-labz-preso')
    $('#presentation_position').val('right')
    @clearTimings()
    @addTiming(1,0)
    @addTiming(2,9)
    @addTiming(3,16)
    @addTiming(4,24)
    @addTiming(5,33)
    @updatePresentation()


  # clears the example and all inputs
  clearAll: ->
    $('#next_slide').addClass('disabled')
    $('#source_embed_code').val('')
    $('#presentation_url').val('')
    $('#presentation_position').val('right')
    @clearTimings()
    @updateEmbedCodeAndPreview()
    $("#output_embed_code").val('')


  # sets up a new timing for the next slide at the current time
  nextSlide: ->
    return if $('#next_slide').hasClass('disabled')

    # if the video hasn't started yet, play it and bail
    if window.previewEmbed.state() is 'unknown'
      window.previewEmbed.play()
      @addTiming(1,0)
    else
      @addTiming(
        window.previewEmbed.plugin.speakerdeck.currentSlide() + 1
        parseInt(window.previewEmbed.time())
      )


  updateTimings: ->
    Wistia.timeout 'updateTimings', =>
      return unless window.previewEmbed?.plugin?.speakerdeck
      window.previewEmbed.plugin.speakerdeck.updateTimings(@timings())
      @timeChange()
    , 250



  # a timing is a slide number and a time: [s,t]
  # this returns an array of all the timings
  timings: ->
    for row in @$timingsTable.find('tbody tr')
      [ parseInt($(row).find('input.slide').val()),
        parseInt($(row).find('input.time').val()) ]


  addTiming: (slide, time) ->
    slide ?= 1
    time ?= 0

    row = $(
      """
      <tr>
        <td><input class="slide" type="text" value="#{slide}" /></td>
        <td>@</td>
        <td><input class="time timeat" type="text" value="#{time}" /></td>
        <td><a href="#" class="delete icon icon-cancel" tabindex="-1"></a></td>
      </tr>
      """
    )

    @$timingsTable.append(row)

    row.find(".timeat").timeatEntry()
    row.find("a.delete").click =>
      row.remove()
      @$timingsTable.hide() if @$timingsTable.find('tbody tr').length is 0
      @updateTimings()
      false

    # make sure the rows are always in time order ...
    # keep the entries in time order ...
    @sortTimings()

    @$timingsTable.show()

    # @updateTimings()
    @alreadyTimed = true
    

  sortTimings: ->
    $rows = @$timingsTable.find('tbody tr')
    $rows.sort (a, b) ->
      timeA = parseInt $(a).find('input.timeat').val()
      timeB = parseInt $(b).find('input.timeat').val()
      timeA - timeB
    for row in $rows
      @$timingsTable.append(row)


  # adds evenly spaced queue points
  addDefaultTimings: ->
    @clearTimings()

    slides = window.previewEmbed.plugin.speakerdeck.numberOfSlides() || 1
    duration = window.previewEmbed.duration()

    for slide in [1..slides]
      @addTiming(slide, parseInt(duration * (slide - 1) / slides))


  clearTimings: ->
    @$timingsTable.find('tbody tr').remove()
    @$timingsTable.hide()
    @updateTimings()


  # called when the presentation changes
  updatePresentation: ->
    @hasPrez = false
    prezUrl = $('#presentation_url').val()

    # only speakerdeck addies
    return unless prezUrl.indexOf('speakerdeck.com') > -1

    @getPresentationData(prezUrl,
      (data) =>
        if data and data.width
          @prezOriginalWidth = data.width
          @prezOriginalHeight = data.height
          @prezId = @_extractSpeakerDeckId(data.html)

          @hasPrez = true
          @updateEmbedCodeAndPreview()
        else
          # uh oh, it's broken
          $("#alert").html("Invalid Speaker Deck URL.").show()

    )


  updatePresentationPosition: ->
    @prezPosition = $('#presentation_position').val()
    @updateEmbedCodeAndPreview()


  _extractSpeakerDeckId: (embedCode) ->
    regex = /speakerdeck\.com\/player\/([0-9a-zA-Z]+)/
    regex.exec(embedCode)[1]


  # highlight the controls for easy editing
  timeChange: (t) ->
    window.previewEmbed?.ready =>
      t ?= window.previewEmbed.time()

      rows = @$timingsTable.find('tbody tr')
      for row in rows by -1
        rowTime = parseInt $(row).find('input.time').val()
        if t >= rowTime
          @$timingsTable.find('tbody tr').removeClass('selected')
          $(row).addClass('selected')
          return


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


  updateEmbedCodeAndPreview: ->
    @updateEmbedCode()
    @updatePreview()


  updateEmbedCode: ->
    @sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())
    @outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val())

    if (@sourceEmbedCode && @sourceEmbedCode.isValid())

      # setup presentation
      if @hasPrez
        # max room for the prez, you know what i mean
        if @prezPosition is 'left' or @prezPosition is 'right'
          @outputEmbedCode.width(@sourceEmbedCode.width() + @prezWidth())
        else
          @outputEmbedCode.height(@sourceEmbedCode.height() + @prezHeight())

        @outputEmbedCode.setOption("plugin.speakerdeck.src", pluginSrc(@sourceEmbedCode))
        @outputEmbedCode.setOption("plugin.speakerdeck.deckId", @prezId)
        @outputEmbedCode.setOption("plugin.speakerdeck.width", @prezWidth())
        @outputEmbedCode.setOption("plugin.speakerdeck.height", @prezHeight())
        @outputEmbedCode.setOption("plugin.speakerdeck.aspect", @prezSlideAspect())
        @outputEmbedCode.setOption("plugin.speakerdeck.position", @prezPosition)

      # Display the output.
      $("#output_embed_code").val(@outputEmbedCode.toString())
    else

      # Show an error if invalid. We can be more specific 
      # if we expect a certain problem.
      $("#output_embed_code").val("Enter a valid Wistia embed code.")
      
  
  updatePreview: ->
    if @sourceEmbedCode and @sourceEmbedCode.isValid()
      # window.previewEmbed.remove() if window.previewEmbed
      # window.previewEmbed = null
      Wistia.timeout 'updatePreview', =>
        @outputEmbedCode.previewInElem("preview", { type: 'api' }, =>
          window.previewEmbed.bind "timechange", (t) => @timeChange(t)

          # if the plugin is live ...
          if window.previewEmbed.plugin.speakerdeck
            @updateTimings()
            $('#next_slide').removeClass('disabled')
        )
      , 250
    else
      $("#preview").html('<div id="placeholder_preview">Your video here</div>')


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
