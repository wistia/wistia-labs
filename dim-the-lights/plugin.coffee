((W) ->

  # ### Non-plugin Helper Functions

  # Get the absolute offset of an element.
  pageOffset = (elem) ->
    curLeft = curTop = 0
    if elem.offsetParent
      while elem
        curLeft += elem.offsetLeft
        curTop += elem.offsetTop
        elem = elem.offsetParent
    left: curLeft
    top: curTop


  # Different event listeners for IE and normal 
  # browsers, obviously.
  if W.detect.browser.msie
    bindEvent = (elem, event, fn) -> elem.attachEvent "on#{event}", fn
  else
    bindEvent = (elem, event, fn) -> elem.addEventListener event, fn, false


  # Remove an element.
  removeElem = (elem) ->
    if elem and par = elem.parentNode
      par.removeChild(elem)
      elem = null


  docHeight = ->
    body = document.body
    html = document.documentElement
    Math.max(body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight)


  docWidth = ->
    body = document.body
    html = document.documentElement
    Math.max(body.scrollWidth, body.offsetWidth,
      html.clientWidth, html.scrollWidth, html.offsetWidth)


  W.plugin "dimTheLights", (video, options = {}) ->

    # Popovers are already dimmed.
    return if video.options?.popover

    # ### Internal Functions

    # Position and size each backdrop quadrant.
    #
    # - Left and right quadrants are full document height.
    # - Top and bottom quadrants fill the gaps.
    positionElems = ->
      return unless dimmed

      offset = pageOffset(container)
      videoX = offset.left
      videoY = offset.top
      videoWidth = video.width()
      videoHeight = video.height()

      elems.left.style.width = "#{videoX}px"
      elems.left.style.height = "#{docHeight()}px"
      elems.left.style.left = "0px"
      elems.left.style.top = "0px"

      elems.right.style.width = "#{docWidth() - videoX - videoWidth}px"
      elems.right.style.height = "#{docHeight()}px"
      elems.right.style.left = "#{videoX + videoWidth}px"
      elems.right.style.top = "0px"

      elems.top.style.width = "#{videoWidth}px"
      elems.top.style.height = "#{videoY}px"
      elems.top.style.left = "#{videoX}px"
      elems.top.style.top = "0px"

      elems.bottom.style.width = "#{videoWidth}px"
      elems.bottom.style.height = "#{docHeight() - videoY - videoHeight}px"
      elems.bottom.style.left = "#{videoX}px"
      elems.bottom.style.top = "#{videoY + videoHeight}px"


    # TO DIM:
    #
    # 1. Add a class to the container so we can setup box-shadow.
    # 2. Add a class to the body so we can kill textarea resizers. (They show up on top of the backdrops.)
    # 3. Insert the backdrops at the end of the document
    # 4. Position and resize the backdrops around the video.
    # 5. Add a class to show the backdrops. It's animated with CSS3 transitions.
    dimmed = false
    dim = ->
      dimmed = true
      addStyle()
      container.className = container.className.replace(/\s*wistia-dim-target/g, "") + " wistia-dim-target"
      document.body.className = (document.body.className or "").replace(/\s*wistia-dim-the-lights/g, "") + " wistia-dim-the-lights"
      for k, v of elems
        document.body.appendChild v
      positionElems()
      for k, elem of elems
        elem.className = elem.className.replace(/\s*wistia-invisible/g, "") + " wistia-visible"


    # TO UNDIM:
    #
    # 1. Unset all classes that dimming set.
    # 2. Set a class to fade out the backdrops with CSS3.
    # 3. Remove the backdrop elements when fadeout is complete.
    undim = ->
      dimmed = false
      container.className = container.className.replace(/\s*wistia-dim-target/g, "")
      document.body.className = (document.body.className or "").replace(/\s*wistia-dim-the-lights/g, "")
      for k, elem of elems
        ((elem) ->
          elem.className = elem.className.replace(/\s*wistia-visible/g, "") + " wistia-invisible"
          W.timeout "#{uuid}.undim.#{k}", ->
            removeElem(elem)
            removeStyle()
          , 500
        )(elem)


    # We have separate styles for each instance of dim-the-lights 
    # because they can have different colors or opacities.
    styleElem = null

    removeStyle = ->
      removeElem(styleElem)

    addStyle = ->
      removeStyle()

      prop = "opacity"
      t = .5

      transitionCss = """
      -webkit-transition: #{prop} #{t}s ease-in-out;
      -moz-transition: #{prop} #{t}s ease-in-out;
      -o-transition: #{prop} #{t}s ease-in-out;
      -ms-transition: #{prop} #{t}s ease-in-out;
      transition: #{prop} #{t}s ease-in-out;
      """

      styleElem = W.util.addInlineCss document.body, """
      .wistia-dim-backdrop {
      background-color:#{options.backgroundColor};
      cursor:pointer;
      filter:alpha(opacity=0);
      opacity:0;
      z-index:16777271;
      position: absolute;
      }
      .wistia-dim-backdrop.wistia-visible {
      filter:alpha(opacity=#{Math.round(options.backgroundOpacity * 100)});
      opacity:#{options.backgroundOpacity};
      #{transitionCss}
      }
      .wistia-dim-backdrop.wistia-invisible {
      filter:alpha(opacity=0);
      opacity:0;
      #{transitionCss}
      }
      .wistia-dim-target {
      box-shadow:0 0 50px 5px rgba(0,0,0,.95);
      }
      .wistia-dim-the-lights textarea {
      resize:none!important;
      }
      """


    # Unset dimming bindings and turn it off.
    autoDimOff = ->
      options.autoDim = false
      video.unbind "play", dim
      video.unbind "pause", undim
      video.unbind "end", undim


    # Set up dimming bindings and turn it on.
    autoDimOn = ->
      autoDimOff()
      options.autoDim = true
      video.bind "play", dim
      video.bind "pause", undim
      video.bind "end", undim


    # ### Initialize
    uuid = W.seqId()

    # Extend options
    options = W.extend
      backgroundColor: "#000000"
      backgroundOpacity: .6
      autoDim: true
    , options
    options.autoDim = W.obj.cast(options.autoDim)
    container = if video.iframe then video.iframe else video.container

    # Create the backdrop quadrants.
    elems = {}
    for k in ['left', 'right', 'top', 'bottom']
      elems[k] = document.createElement("div")
      elems[k].id = "#{uuid}_#{k}"
      elems[k].className = "wistia-dim-backdrop"

    # Clicking the backdrop should pause and undim.
    for k, elem of elems
      bindEvent elem, "click", ->
        video.pause() if options.autoDim
        undim()

    # Setup autodim bindings on load.
    autoDimOn() if options.autoDim

    # In case the video or window is resized while the video is playing, 
    # reposition the dimming elements.
    video.bind "widthchanged", positionElems
    video.bind "heightchanged", positionElems
    bindEvent window, "resize", positionElems

    video.bind "down", undim


    # Public interface.
    {
      dim: dim
      undim: undim
      elems: elems
      reposition: positionElems
      autoDimOff: autoDimOff
      autoDimOn: autoDimOn
    }

)(Wistia)
