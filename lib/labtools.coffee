## Wistia Lab Tools
#
# Wistia has a bunch of different embed codes: iframe, popover, API, SEO.
# Manipulate any of them with a common interface using these tools.

((W, $) ->

  return if W.EmbedCode


  # ## EmbedCode Base Class
  #
  # Set up a class for functionality that's shared between all embed types.
  class W.EmbedCode

    constructor: ->
      throw "You must either use EmbedCode.parse(embedCode) or specify IframeEmbedCode/ApiEmbedCode."


    toString: ->
      @_embedCode


    # ### Preview

    # `targetElem` can be a DOM element or the ID of a DOM element. We set the 
    # HTML of that element to our embed code, and execute any included scripts 
    # in the proper order.
    previewInElem: (targetElem) ->
      if typeof targetElem is 'string'
        targetElem = document.getElementById(targetElem)

      embedCode = @toString()
      if previewCode = W.EmbedCode.parse(embedCode)
        if previewCode instanceof W.ApiEmbedCode
          # Set an extra handle `window.previewEmbed` on API embeds so we can 
          # manipulate them regardless of their real handle.
          previewCode.handle("window.previewEmbed = " + previewCode.handle())
          targetElem.innerHTML = W.util.removeScriptTags(previewCode.toString())
          W.util.execScriptTags(previewCode.toString())
        else if previewCode instanceof W.IframeEmbedCode
          # Iframe embeds don't have any scripts, so just drop it in.
          targetElem.innerHTML = W.util.removeScriptTags(previewCode.toString())
          W.util.execScriptTags(previewCode.toString())
        else if previewCode instanceof W.PopoverEmbedCode
          # For popovers, show the thumbnail, and also get the iframe version 
          # of the embed code via the Wistia oembed endpoint. Then we display 
          # both the thumbnail and the video in the preview.
          @fromOembed (embedType: 'iframe', autoPlay: false), (data) ->
            targetElem.innerHTML = W.util.removeScriptTags(previewCode.toString()) + "<br/>" + data.html
            W.util.execScriptTags(previewCode.toString())
      else
        console?.log("There was an error parsing the preview code:", embedCode)

      this


    # ### Options

    # Set an option in the option hash. The key can be an array or a
    # dot-separated string to set multiple levels in the hash.
    #
    # For example:
    #
    #     embedCode.setOption("plugin.my-awesome-plugin.on", true);
    setOption: (key, val) ->
      newOptions = W.extend({}, @_options)
      W.obj.set(newOptions, key, val)
      @options(newOptions)
      this


    # Extend the options hash starting at key. Extend recursively sets 
    # child elements from one javascript Object to another.
    #
    # For example:
    #
    #     embedCode.extendOption("plugin.my-awesome-plugin", {
    #       on: true,
    #       color: "black"
    #     });
    extendOption: (key, val) ->
      newOptions = W.extend({}, @_options)
      if subSet = W.obj.get(newOptions, key)
        W.extend(subSet, val)
      else
        W.obj.set(newOptions, key, val)
      @options(newOptions)
      this


    # Remove a piece of the options hash by key.
    #
    # For example:
    #
    #     embedCode.removeOption("plugin.my-awesome-plugin");
    removeOption: (key) ->
      newOptions = W.extend({}, @_options)
      W.obj.unset(newOptions, key)
      @options(newOptions)
      this


    # Set or get options.
    options: (newOptions) ->
      if newOptions?
        W.extend @_options, newOptions
      else
        W.extend {}, @_options


    # For Popover and Iframe embed types, all parameters will be parsed
    # first as strings. This method uses regexp matching to convert option 
    # values to the correct type.
    #
    # Sometimes it can get it wrong. For instance, if the playerColor 
    # is all numbers and starts with a 0, it will cast to a number. But 
    # it should really be a string.
    _castOptions: ->
      playerColor = @_options.playerColor or ''
      W.obj.castDeep(@_options)
      @_options.playerColor = playerColor if playerColor


    # ### Oembeds

    # Hit the oembed endpoint with this embed code's options. The 
    # options argument lets you override the current options of this 
    # embed code. In practice, this lets you switch between different 
    # embed types by changing the `embedType` option.
    fromOembed: (options, callback) ->
      options = W.extend
        height: @height()
        ssl: @ssl()
        width: @width()
      , @options(), options
      W.EmbedCode.fromOembed(@hashedId(), options, callback)


    # The options we send to the oembed endpoint.
    _oembedOptions: ->
      W.extend (ssl: @ssl()), @options()


    # ### Helper Methods
    
    ssl: ->
      false


    proto: ->
      if @ssl() then "https:" else "http:"


    # We might have parsed the embed code, but is it valid?
    isValid: ->
      false


    hashedId: (h) ->


    width: (w) ->


    height: (h) ->


  # ### Class-Level Embed Code Functions

  # #### Oembeds

  # Get oembed data using just a hashed ID and options. The data 
  # is returned in the typical oembed format,
  # [detailed in the Wistia docs](http://wistia.com/doc/oembed).
  W.EmbedCode.fromOembed = (hashedId, options = {}, callback) ->
    $.getJSON "#{window.location.protocol}//#{W.constant.oembedHost}/oembed.json?callback=?",
      url: W.EmbedCode.oembedUrl(hashedId, options),
      (json) -> callback(json)


  W.EmbedCode.oembedUrl = (hashedId, options = {}) ->
    "#{if options.ssl then "https:" else "http:"}//#{W.constant.embedHost}/embed/medias/#{hashedId}?#{W.url.jsonToParams(options)}"


  # #### Parse an Embed Code

  # Given an embed code, return a parsed embed code object of 
  # the correct type.
  W.EmbedCode.parse = (embedCode) ->
    if W.EmbedCode.isIframe(embedCode)
      W.IframeEmbedCode.parse(embedCode)
    else if W.EmbedCode.isPopover(embedCode)
      W.PopoverEmbedCode.parse(embedCode)
    else if W.EmbedCode.isApi(embedCode)
      W.ApiEmbedCode.parse(embedCode)
    else
      null


  W.EmbedCode.isIframe = (embedCode) ->
    try
      new W.IframeEmbedCode(embedCode).isValid()
    catch e
      false


  W.EmbedCode.isApi = (embedCode) ->
    try
      new W.ApiEmbedCode(embedCode).isValid()
    catch e
      false


  W.EmbedCode.isPopover = (embedCode) ->
    try
      new W.PopoverEmbedCode(embedCode).isValid()
    catch e
      false


  # An embed code is valid if it can be parsed, and if it 
  # reports itself as valid.
  W.EmbedCode.isValid = (embedCode) ->
    !!W.EmbedCode.parse(embedCode)?.isValid()


  # ## PopoverEmbedCode Class
  class W.PopoverEmbedCode extends W.EmbedCode

    constructor: (embedCode) ->
      @parse(embedCode) if embedCode


    parse: (embedCode) ->
      @_$popoverFrag = $("<div>")
      @_$popoverFrag.html(W.util.removeScriptTags(embedCode))
      @_$popover = @_$popoverFrag.find("[class*=wistia-popover]")
      @_rawHref = @_$popover.attr('href')
      @_hrefUrl = W.url.parse(@_rawHref)
      @_options = W.extend({}, @_hrefUrl.params)
      @_config = {}
      if matches = @_$popover.attr('class').match(/wistia-popover(?:\[([^\]]+)\])?/)
        for match in matches[1].split(',')
          [key, val] = match.split('=')
          W.obj.set(@_config, key, val)
      @_width = parseInt(@_config.width, 10)
      @_height = parseInt(@_config.height, 10)
      @_scripts = W.util.scriptTags(embedCode)
      @_castOptions()
      @_embedCode = @_$popoverFrag.html().replace(/\s+$/g, "") + "\n" + @_scripts.join("\n")


    options: (newOptions) ->
      if newOptions
        newSrc = @_hrefUrl.clone()
        newSrc.params = newOptions
        @_$popover.attr('href', newSrc.absolute())
        @parse @_$popoverFrag.html() + @_scripts.join("\n")
        this
      else
        W.extend {}, @_options
      

    isValid: ->
      @_$popover?.length and @_width and @_height and @_options


    hashedId: (h) ->
      if h?
        @_hrefUrl.path[@_hrefUrl.path.length - 1] = h
        @_$popover.attr("href", @_hrefUrl.absolute())
        @parse(@_$popoverFrag.html())
        this
      else
        @_hrefUrl.path[@_hrefUrl.path.length - 1]


    _classConfig: ->
      ("#{key}=#{val}" for key, val of @_config).join(",")


    width: (w) ->
      if w?
        @_config.width = w
        @_$popover.attr('class', @_classConfig())
        @parse(@_$popoverFrag.html())
        this
      else
        @_width


    height: (h) ->
      if h?
        @_config.height = h
        @_$popover.attr('class', @_classConfig())
        @parse(@_$popoverFrag.html())
        this
      else
        @_height


    ssl: ->
      @_hrefUrl.protocol is "https:"


    toString: ->
      @_embedCode.replace(/&amp;/g, "&")


  W.PopoverEmbedCode.parse = (embedCode) ->
    new W.PopoverEmbedCode(embedCode)


  # ## IframeEmbedCode Class
  class W.IframeEmbedCode extends W.EmbedCode

    constructor: (embedCode) ->
      @parse(embedCode) if embedCode


    parse: (embedCode) ->
      @_$iframeFrag = $("<div>")
      @_$iframeFrag.html(W.util.removeScriptTags(embedCode))
      @_$iframe = @_$iframeFrag.find("iframe.wistia_embed:first")
      @_rawSrc = @_$iframe.attr('src')
      @_srcUrl = W.url.parse(@_rawSrc)
      @_options = W.extend({}, @_srcUrl.params)
      @_width = parseInt(@_$iframe.attr('width'), 10)
      @_height = parseInt(@_$iframe.attr('height'), 10)
      @_castOptions()
      @_embedCode = @_$iframeFrag.html()


    options: (newOptions) ->
      if newOptions
        newSrc = @_srcUrl.clone()
        newSrc.params = newOptions
        @_$iframe.attr('src', newSrc.absolute())
        @parse @_$iframeFrag.html()
        this
      else
        W.extend {}, @_options
      

    isValid: ->
      @_$iframe?.length and @_width and @_height and @_options


    hashedId: (h) ->
      if h?
        @_srcUrl.path[@_srcUrl.path.length - 1] = h
        @_$iframe.attr("src", @_srcUrl.absolute())
        @parse(@_$iframeFrag.html())
        this
      else
        @_srcUrl.path[@_srcUrl.path.length - 1]


    width: (w) ->
      if w?
        @_$iframe.attr('width', w)
        @parse(@_$iframeFrag.html())
        this
      else
        @_width


    height: (h) ->
      if h?
        @_$iframe.attr('height', h)
        @parse(@_$iframeFrag.html())
        this
      else
        @_height


    ssl: ->
      @_srcUrl.protocol is "https:"


    toString: ->
      @_embedCode.replace(/&amp;/g, "&")


  W.IframeEmbedCode.parse = (embedCode) ->
    new W.IframeEmbedCode(embedCode)

  
  # ## ApiEmbedCode Class
  #
  # SEO Embeds are just API embeds with extra content starting in
  # the container. So this class also works with SEO embed types.
  class W.ApiEmbedCode extends W.EmbedCode

    constructor: (embedCode) ->
      @parse(embedCode) if embedCode


    parse: (embedCode) ->
      @_embedCodeFrag = $("<div>")
      @_rawEmbedCode = embedCode
      @_rawHtml = W.util.removeScriptTags(embedCode).replace(/\n+$/g, "\n")
      @_embedCodeFrag.html(@_rawHtml)
      @_containerElem = @_embedCodeFrag.find(".wistia_embed:first")
      @_containerId = @_containerElem.attr("id")
      @_containerContents = @_containerElem.html()
      @_containerHtml = $("<div>").html(@_containerElem.clone()).html()
      @_handle = W.ApiEmbedCode.handle(@_rawEmbedCode)
      @_hashedId = W.ApiEmbedCode.hashedId(@_rawEmbedCode)
      @_rawOptions = W.ApiEmbedCode.rawOptions(@_rawEmbedCode)
      @_options = W.ApiEmbedCode.parseOptions(@_rawOptions)
      @_html = W.util.removeScriptTags(@_rawEmbedCode)
      @_scripts = W.util.scriptTags(@_rawEmbedCode)
      @_embedCode = @_embedCodeFrag.html().replace(/\s+$/g, "") + "\n" + @_scripts.join("\n")
      this


    options: (newOptions) ->
      if newOptions?
        newRawOptions = W.ApiEmbedCode.evilJsonStringify(newOptions)
        @parse(@_rawEmbedCode.replace(@_rawOptions, newRawOptions))
        this
      else
        W.extend {}, @_options


    containerId: (newContainerId) ->
      if newContainerId?
        @setOption('container', newContainerId)
        @_containerElem.attr("id", newContainerId)
        @parse(@_embedCodeFrag.html() + @_scripts.join("\n"))
        this
      else
        @_containerId


    containerContents: (newContents) ->
      if newContents?
        @_containerElem.html(newContents)
        @parse(@_embedCodeFrag.html() + @_scripts.join("\n"))
        this
      else
        @_containerContents


    containerHtml: ->
      @_containerHtml


    handle: (newHandle) ->
      if newHandle?
        matches = @_embedCode.match(W.ApiEmbedCode.rhandle)
        @parse(@_embedCode.replace(matches[0], matches[0].replace(@_handle, newHandle)))
        this
      else
        @_handle


    hashedId: (newHashedId) ->
      if newHashedId?
        @parse(@_embedCode.replace(matches[0], matches[0].replace(@_hashedId, newHashedId)))
        this
      else
        @_hashedId


    css: (prop, val) ->
      if val?
        @_containerElem.css(prop, val)
        @parse(@_embedCodeFrag.html() + @_scripts.join("\n"))
        this
      else
        @_containerElem.css(prop)


    width: (w) ->
      if w?
        @css('width', w)
        this
      else
        @css('width')


    height: (h) ->
      if h?
        @css('height', h)
        this
      else
        @css('height')


    handle: -> @_handle


    hashedId: -> @_hashedId


    ssl: ->
      for scriptTag in W.util.scriptTags(@_rawEmbedCode)
        return true if /src\s*=\s*['"]https:/i.test(scriptTag)
      false


    isValid: ->
      @_containerId and @_handle and @_hashedId and @_options and @height() and @width()


    fromOembed: (options, callback) ->
      options = W.extend
        handle: @handle(),
        height: @height(),
        ssl: @ssl(),
        width: @width()
      , @options(), options
      W.EmbedCode.fromOembed(@hashedId(), options, callback)


  W.ApiEmbedCode.parse = (embedCode) ->
    new W.ApiEmbedCode(embedCode)


  W.ApiEmbedCode.roptions = /Wistia\.embed\(.+?,\s*([\s\S]+)\s*\)/


  W.ApiEmbedCode.rhandle = /<script>\s*([^=]+?)\s*?=\s*Wistia\.embed\(/


  W.ApiEmbedCode.rhashedid = /Wistia\.embed\("(\w+)"/


  W.ApiEmbedCode.handle = (embedCode) ->
    if matches = embedCode.match(W.ApiEmbedCode.rhandle)
      matches[1]
    else
      null


  W.ApiEmbedCode.hashedId = (embedCode) ->
    if matches = embedCode.match(W.ApiEmbedCode.rhashedid)
      matches[1]
    else
      null


  W.ApiEmbedCode.rawOptions = (embedCode) ->
    if matches = embedCode.match(W.ApiEmbedCode.roptions)
      matches[1]
    else
      null


  # Since the options are javascript objects with unquoted keys,
  # we can't parse it with JSON. The easiest way is just to eval it.
  #
  # Note that this is dangerous if the embed code source is untrusted.
  # Please be careful.
  W.ApiEmbedCode.parseOptions = (rawOptions) ->
    try
      eval("(" + rawOptions + ")")
    catch e
      console?.log(matches[1])
      console?.log(e.stack)
      null


  # Given a javascript object, convert it to JSON with unquoted keys 
  # (unless the key has punctuation in it).
  W.ApiEmbedCode.evilJsonStringify = (h) ->
    evilObj = W.ApiEmbedCode.evilDeepCopy h,
      prefix: '_OQ_'
      suffix: '_CQ_'

    result = W.JSON.stringify(evilObj, null, 2)
    result = result.replace(/"_OQ_(.*?[\-\.\#\@\%\^\&\*\(\)].*?)_CQ_"/g, "\"$1\"")
    result = result.replace(/"_OQ_/g, "")
    result = result.replace(/_CQ_"/g, "")
    result


  W.ApiEmbedCode.evilDeepCopy = (h, options) ->
    options = W.extend
      prefix: ""
      suffix: ""
    , options

    if W.obj.isObject(h)
      result = {}
    else if W.obj.isArray(h)
      result = []

    for key, val of h
      if W.obj.isObject(val) or W.obj.isArray(val)
        newVal = W.ApiEmbedCode.evilDeepCopy(val, options)
      else
        newVal = val

      newKey = options.prefix + key + options.suffix
      if W.obj.isArray(result)
        result.push(newVal)
      else
        result[newKey] = newVal

    result


)(Wistia, jQuery)
