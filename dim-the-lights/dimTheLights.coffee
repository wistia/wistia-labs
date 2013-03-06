Wistia.plugin "dimTheLights", (video, options = {}) ->
  return if video.options?.popover
  uuid = Wistia.seqId()
  container = if video.iframe then video.iframe else video.container

  # Correctly calculate the absolute page offset of an element cross-browser.
  pageOffset = (elem) ->
    curLeft = curTop = 0
    if elem.offsetParent
      while elem
        curLeft += elem.offsetLeft
        curTop += elem.offsetTop
        elem = elem.offsetParent
    left: curLeft
    top: curTop

  if Wistia.detect.browser.msie
    bindEvent = (elem, event, fn) -> elem.attachEvent "on#{event}", fn
  else
    bindEvent = (elem, event, fn) -> elem.addEventListener event, fn, false

  removeElem = (elem) ->
    if par = elem.parentNode
      par.removeChild(elem)
      elem = null

  elems = {}
  for k in ['left', 'right', 'top', 'bottom']
    elems[k] = document.createElement("div")
    elems[k].id = "#{uuid}_#{k}"
    elems[k].className = "wistia-dim-backdrop"

  setBasicStyles = (elem) ->
    elem.style.position = "absolute"
    if Wistia.detect.browser.msie and Wistia.detect.browser.version < 8
      elem.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorStr='#000000e6', endColorStr='#000000e6')"
    else
      elem.style.backgroundColor = "rgba(0,0,0,.9)"

  positionElems = ->
    offset = pageOffset(container)
    videoX = offset.left
    videoY = offset.top
    videoWidth = video.width()
    videoHeight = video.height()
    docWidth = document.body.clientWidth
    docHeight = document.body.clientHeight

    elems.left.style.width = "#{videoX}px"
    elems.left.style.height = "#{docHeight}px"
    elems.left.style.left = "0px"
    elems.left.style.top = "0px"

    elems.right.style.width = "#{docWidth - videoX - videoWidth}px"
    elems.right.style.height = "#{docHeight}px"
    elems.right.style.left = "#{videoX + videoWidth}px"
    elems.right.style.top = "0px"

    elems.top.style.width = "#{videoWidth}px"
    elems.top.style.height = "#{videoY}px"
    elems.top.style.left = "#{videoX}px"
    elems.top.style.top = "0px"

    elems.bottom.style.width = "#{videoWidth}px"
    elems.bottom.style.height = "#{docHeight - videoY - videoHeight}px"
    elems.bottom.style.left = "#{videoX}px"
    elems.bottom.style.top = "#{videoY + videoHeight}px"

  insertElems = ->
    for k, v of elems
      document.body.appendChild v

  dimmed = false
  dim = ->
    dimmed = true
    container.className = container.className.replace(/wistia-dim-target/g, "") + " wistia-dim-target"
    document.body.className = (document.body.className or "").replace(/wistia-dim-the-lights/g, "") + " wistia-dim-the-lights"
    insertElems()
    positionElems()
    for k, elem of elems
      elem.className = elem.className.replace(/wistia-invisible/g, "") + " wistia-visible"

  undim = ->
    dimmed = false
    container.className = container.className.replace(/wistia-dim-target/g, "")
    document.body.className = (document.body.className or "").replace(/wistia-dim-the-lights/g, "")
    for k, elem of elems
      ((elem) ->
        elem.className = elem.className.replace(/wistia-visible/g, "") + " wistia-invisible"
        Wistia.timeout "#{uuid}.undim.#{k}", (-> removeElem(elem)), 600
      )(elem)

  setupBackdropBindings = (elem) ->
    bindEvent elem, "click", ->
      video.pause()
      undim()

  bindEvent window, "resize", ->
    positionElems() if dimmed

  for k, elem of elems
    setBasicStyles(elem)
    setupBackdropBindings(elem)

  prop = "opacity"
  t = ".6"

  Wistia.util.addInlineCss document.body, """
  .wistia-dim-backdrop {
  cursor:pointer;
  filter:alpha(opacity=0);
  opacity:0;
  z-index:16777271;
  }
  .wistia-dim-backdrop.wistia-visible {
  filter:alpha(opacity=100);
  opacity:1;
  -webkit-transition: #{prop} #{t}s ease-in-out;
  -moz-transition: #{prop} #{t}s ease-in-out;
  -o-transition: #{prop} #{t}s ease-in-out;
  -ms-transition: #{prop} #{t}s ease-in-out;
  transition: #{prop} #{t}s ease-in-out;
  }
  .wistia-dim-backdrop.wistia-invisible {
  filter:alpha(opacity=0);
  opacity:0;
  -webkit-transition: #{prop} #{t}s ease-in-out;
  -moz-transition: #{prop} #{t}s ease-in-out;
  -o-transition: #{prop} #{t}s ease-in-out;
  -ms-transition: #{prop} #{t}s ease-in-out;
  transition: #{prop} #{t}s ease-in-out;
  }
  .wistia-dim-target {
  box-shadow:0 0 50px 5px rgba(0,0,0,.95);
  }
  .wistia-dim-the-lights textarea {
  resize:none!important;
  }
  """

  video.bind "play", dim
  video.bind "pause", undim
  video.bind "end", undim

  {
    dim: dim
    undim: undim
    elems: elems
  }
