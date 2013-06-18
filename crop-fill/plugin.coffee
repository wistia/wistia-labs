((W) ->

  W.plugin 'cropFill', (video, options) ->

    # Get the video's aspect ratio ASAP.
    # We need it for all resizing calculations.
    videoAspect = null
    video.hasData ->
      still = video.data.media.assets.still
      videoAspect = still.width / still.height

    # To position this properly, the target needs to have a position from 
    # which we can set offsets.
    target = video.container.parentNode
    if target isnt document.body and !/absolute|fixed|relative/.test(target.style.position)
      target.style.position = 'relative'
      target.style.overflow = 'hidden'
    video.container.style.position = 'absolute'

    # Resize the video and reposition it so it's properly cropped
    resize = ->
      targetWidth = W.elem.width(target)
      targetHeight = W.elem.height(target)
      targetAspect = targetWidth / targetHeight

      if targetAspect > videoAspect
        # target is wider than video, so match width and crop top/bottom
        video.width(targetWidth)
        video.height(targetWidth / videoAspect)
        newTop = -(video.height() - targetHeight) / 2
        video.container.style.top = "#{Math.round(newTop)}px"
        video.container.style.left = '0px'
      else
        # target is taller than video, so match height and crop left/right
        video.height(targetHeight)
        video.width(targetHeight * videoAspect)
        newLeft = -(video.width() - targetWidth) / 2
        video.container.style.left = "#{Math.round(newLeft)}px"
        video.container.style.top = '0px'

    # Poll on the parent dimensions every 500ms
    lastWidth = W.elem.width(target)
    lastHeight = W.elem.height(target)
    watchTarget = ->
      widthNow = W.elem.width(target)
      heightNow = W.elem.height(target)
      if lastWidth isnt widthNow
        resize()
        lastWidth = widthNow
      else if lastHeight isnt heightNow
        resize()
        lastHeight = heightNow
      W.timeout "#{video.uuid}.cropFill.watchTarget", watchTarget, 500
    unwatchTarget = ->
      W.clearTimeouts "#{video.uuid}.cropFill.watchTarget"

    # Resize if the dimensions of the container or the video change
    watchTarget()
    video.bind('widthchange', resize)
    video.bind('heightchange', resize)

    # Resize ASAP
    video.hasData(resize)

    resize: resize
    watch: watchTarget
    unwatch: unwatchTarget

)(Wistia)
