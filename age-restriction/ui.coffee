window.jsFileName = "plugin.js"
window.jsProductionPath = "fast.wistia.com/labs/age-restriction"

class AgeRestriction
  constructor: ->
    @previewEmbedded = false
    @change = false
    @exampleEmbedCode = '<div id="wistia_6s43yb8v80" class="wistia_embed" style="width:640px;height:360px;"> </div><script charset="ISO-8859-1" src="//fast.wistia.com/assets/external/E-v1.js"></script><script>wistiaEmbed = Wistia.embed("6s43yb8v80");</script>'

    $("#source_embed_code").on "keyup", =>
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

  setupExample: ->
    $("#source_embed_code").val(@exampleEmbedCode)
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
      @minimumAge = @getMinimumAge()
      @type = @getType()

      @outputEmbedCode.setOption("plugin.ageRestriction.src", pluginSrc(@sourceEmbedCode))
      @outputEmbedCode.setOption("plugin.ageRestriction.type", @type)
      @outputEmbedCode.setOption("plugin.ageRestriction.minimumAge", @minimumAge)

      $("#output_embed_code").val(@outputEmbedCode.toString())

      @updatePreview()
    else
      $("#output_embed_code").val("Please enter a valid Wistia embed code.")
      $("#preview").html("<div id=\"placeholder_preview\">Your video here</div>")

  updatePreview: =>
    Wistia.timeout "updatePreview", =>
      if @change
        window.previewEmbed.plugin.ageRestriction.updateType(@type)
        window.previewEmbed.plugin.ageRestriction.updateAge(@minimumAge)
      else if !@previewEmbedded
        @outputEmbedCode.previewInElem "preview", { type: "api" }, =>
          window.previewEmbed.plugin?ageRestriction.updateType(@type)
          window.previewEmbed.plugin?ageRestriction.updateAge(@minimumAge)
          @previewEmbedded = true
    , 100

  waitFor: (cond, timeout = 5000) ->
    result = new Wistia.StopGo()
    timeoutId = Wistia.seqId()
    startTime = new Date().getTime()
    fn = ->
      if new Date().getTime() - startTime > 5000
        console?.log('Condition ', cond, ' never came true')
      else if cond()
        result.go()
      else
        Wistia.timeout timeoutId, fn, 100
    fn()
    result

  getMinimumAge: ->
    parseInt($("#minimum-age").val())

  getType: ->
    if $("input#age").is(':checked')
      "age"
    else if $("input#dob").is(':checked')
      "dob"

# Assign all DOM bindings on doc-ready in here. We can also 
# run whatever initialization code we might need.
window.setupLabInterface = ($) ->
  $ ->
    window.ageRestriction = new AgeRestriction()

    if !Wistia.localStorage("ageRestriction.cleared")
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
      Wistia.localStorage("ageRestriction.cleared", true)

    $("#show_example").click (event) ->
      event.preventDefault()
      showExample()
      $(".show_example_text").hide()
      $(".clear_example_text").show()
      Wistia.localStorage("ageRestriction.cleared", false)


window.resetInterface = ->
  ageRestriction.clearAll()

window.showExample = ->
  ageRestriction.setupExample()

setupLabInterface(jQuery)

