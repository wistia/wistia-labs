Wistia.plugin 'prez', (video, options) ->

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

  # slidechange fn
  # this is called whenever the current slide changes in speakerdeck,
  # regardless of whether we change it or a user changes it
  slideChange = (slide) ->
    console.log "changed slide to: #{slide}"


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


  video.bind 'secondchange', (s) ->
    if s % 5 == 0
      speakerDeck.nextSlide()


  update = (options) ->
    console.log "updated prez"

  { update: update }
