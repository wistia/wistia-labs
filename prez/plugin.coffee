Wistia.plugin 'prez', (video, options) ->

  class Timings
    constructor: (pairs) ->
      @pairs = pairs or []
      @reversePairs = @pairs.reverse()

    slideForTime: (time) ->
      for pair in @reversePairs
        return pair[0] if time >= pair[1]
      null

    timeForSlide: (slide) ->
      for pair in @pairs
        return pair[1] if slide is pair[0]
      null

  # stop those timings son
  timings = new Timings()
  updateTimings = (pairs) ->
    console.log "updated timings"
    timings = new Timings(pairs)



  # slidechange fn
  # this is called whenever the current slide changes in speakerdeck,
  # regardless of whether we change it or a user changes it
  slideChange = (slide) ->
    return unless video.state() is 'playing' or video.state() is 'paused'

    if suppressSlideSync
      console.log "SUPPRESSING SYNC: changed slide to: #{slide}"
    else
      suppressSlideSyncTemporarily()
      time = timings.timeForSlide(slide)
      console.log "SYNCING: #{slide} -> #{time}"
      video.time(time) if time isnt null



  # this is to get the API handle
  speakerDeck = null
  window.onSpeakerDeckPlayerReady = (s) ->
    speakerDeck = s

    # bind to slide change
    speakerDeck.on('change', (slide) ->
      slideChange(slide.number)
    )


  # load it up
  Wistia.remote.script '//speakerdeck.com/assets/embed.js'

  # when we're advancing slides by time we need to 
  suppressSlideSync = false
  suppressSlideSyncTemporarily = ->
    console.log 'suppressing'
    suppressSlideSync = true
    setTimeout ->
      suppressSlideSync = false
    , 100

  video.bind 'timechange', (t) ->
    slideNum = timings.slideForTime(t)
    console.log "time is: #{t}, should be on slide: #{slideNum}"
    if speakerDeck.currentSlide.number isnt slideNum
      suppressSlideSyncTemporarily()
      speakerDeck.goToSlide(slideNum)


  position = options.position || 'right'
  width = options.width || video.width()
  height = options.height || video.height()

  # put it next to the vidjeo
  prezElem = document.createElement('div')
  prezElem.innerHTML = "<div class='speakerdeck-embed' data-id='#{options.speakerDeckId}'></div>"

  prezElem.style.width = "#{width}px"
  prezElem.style.height = "#{height}px"
  video.grid[position].appendChild(prezElem)
  video.fit()

  { updateTimings: updateTimings }
