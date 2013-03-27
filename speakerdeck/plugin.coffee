Wistia.plugin 'speakerdeck', (video, options) ->

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


  updateTimings = (pairs) ->
    timings = new Timings(pairs)
    updateSlideForTime()


  # slidechange fn
  # this is called whenever the current slide changes in speakerdeck,
  # regardless of whether we change it or a user changes it
  slideChange = (slide) ->
    return unless video.state() is 'playing' or video.state() is 'paused'
    return if suppressSlideSync

    suppressSlideSyncTemporarily()
    time = timings.timeForSlide(slide)
    video.time(time) if time?



  # this is to get the API handle
  speakerDeck = null
  numberOfSlides = null
  readyCallback = null
  ready = false


  window.onSpeakerDeckPlayerReady = (s) ->
    speakerDeck = s

    # get the total number of slides by seeking way past the end and then
    # examining the current slide number
    suppressSlideSyncTemporarily()
    speakerDeck.goToSlide(10000)
    setTimeout ->
      numberOfSlides = speakerDeck.currentSlide?.number
      speakerDeck.goToSlide(1)
    , 10

    # bind to slide change
    speakerDeck.on('change', (slide) ->
      slideChange(slide.number) if slide
    )

    ready = true
    readyCallback() if readyCallback



  # when we're advancing slides by time we need to 
  suppressSlideSync = false
  suppressSlideSyncTemporarily = ->
    suppressSlideSync = true
    Wistia.timeout "suppressSlideSyncTemporarily", ->
      suppressSlideSync = false
    , 100


  updateSlideForTime = (t) ->
    return unless speakerDeck

    t ?= video.time()

    slideNum = timings.slideForTime(t)
    if speakerDeck.currentSlide?.number isnt slideNum
      suppressSlideSyncTemporarily()
      speakerDeck.goToSlide(slideNum)


  video.bind 'timechange', updateSlideForTime



  # setup those initial timings, son
  timingStr = options.timings || ''
  timingPairs = []
  for tStr in timingStr.split('_')
    t = tStr.split('-')
    timingPairs.push [parseInt(t[0]), parseInt(t[1])]

  timings = new Timings(timingPairs)

  position = options.position || 'right'
  width = options.width || video.width()
  height = options.height || video.height()
  aspect = options.aspect || (4/3)

  # put it next to the vidjeo
  deckElem = document.createElement('div')
  deckElem.innerHTML = "<div class='speakerdeck-embed' data-ratio='#{aspect}' data-id='#{options.deckId}'></div>"

  deckElem.style.width = "#{width}px"
  deckElem.style.height = "#{height}px"
  video.grid[position].appendChild(deckElem)
  video.fit()

  # load it up
  Wistia.remote.script '//speakerdeck.com/assets/embed.js'

  {
    updateTimings: updateTimings
    numberOfSlides: -> numberOfSlides
    currentSlide: -> speakerDeck.currentSlide?.number or 0
    ready: (callback) ->
      if ready
        callback()
      else
        readyCallback = callback
  }
