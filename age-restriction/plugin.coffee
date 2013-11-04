((W) ->

  W.plugin "ageRestriction", (video, options = {}) ->

    return unless options.type
    return unless options.minimumAge

    minimumAge = parseInt(options.minimumAge)
    uuid = W.seqId("age_gate_")

    # Prevent playing
    video.suppressPlay(true)
    video.pause()

    standardFontSize = "#{video.height()/ 20}px"
    largeFontSize = "#{video.height() / 15}px"

    inlineCss = """
      ##{uuid}-dob::-webkit-inner-spin-button,
      ##{uuid}-dob::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
      }
    """

    buttonStyle =
      "background-color": "#3498ea"
      "border": "0"
      "border-radius": "0"
      "color": "#fff"
      "cursor": "pointer"
      "display": "inline-block"
      "font-size": standardFontSize
      "height": "40px"
      "line-height": "40px"
      "margin-right": "10px"
      "outline": "0"
      "padding": "0 10px"
      "vertical-align": "top"

    challengeTextStyle =
      "font-size": largeFontSize
      "font-weight": 700
      "margin": "0 auto"
      "padding-bottom": "1em"
      "width": "85%"

    elem = W.elem.fromObject {
      id: uuid
      style:
        "background-color": "#333"
        "color": "#fff"
        "font-family": "Open Sans,Arial,sans-serif"
        "height": "#{video.height()}px"
        "left": 0
        "top": 0
        "position": "absolute"
        "text-align": "center"
        "width": "#{video.width()}px"
        "z-index": 100
      }

    container = W.elem.fromObject {
      id: "#{uuid}-container"
      style:
        "margin-top": "#{video.height() / 4}px"
    }

    errorText = W.elem.fromObject {
      id: "#{uuid}-error-text"
      innerHTML: "<div>You are not old enough to view this video.</div>"
      style:
        "color": "#f5d535"
        "display": "none"
        "font-size": largeFontSize
        "font-weight": 700
        "margin": "0 auto"
        "width": "85%"
    }

    challengeText = W.elem.fromObject {
      id: "#{uuid}-challenge-text"
      innerHTML: "<div>You must be at least <span class='#{uuid}-minimum-age'>#{minimumAge}</span> to view this video."
      style: challengeTextStyle
    }

    yesButton = W.elem.fromObject {
      id: "#{uuid}-yes-button"
      innerHTML: "I'm <span class='#{uuid}-minimum-age'>#{minimumAge}</span> or over"
      style: buttonStyle
    }

    noButton = W.elem.fromObject {
      id: "#{uuid}-no-button"
      innerHTML: "I'm under <span class='#{uuid}-minimum-age'>#{minimumAge}</span>"
      style: buttonStyle
    }

    challengeSubtitle = W.elem.fromObject {
      id: "#{uuid}-challenge-subtitle"
      innerHTML: "Please enter your date of birth."
      style:
        "font-style": "italic"
        "font-size": "20px"
        "margin": "0 auto"
    }

    dobForm = W.elem.fromObject {
      id: "#{uuid}-dob-form"
      tagName: "form"
      style:
        "margin-bottom": "1em"
    }

    dateOfBirth = W.elem.fromObject {
      id: "#{uuid}-dob"
      tagName: "input"
      type: "date"
      style:
        "border": "0"
        "border-radius": "0"
        "color": "#666"
        "font-size": standardFontSize
        "font-family": "Open Sans,Arial,sans-serif"
        "height": "40px"
        "line-height": "40px"
        "margin": "0"
        "outline": "none"
        "padding": "0 10px"
        "text-transform": "uppercase"
        "vertical-align": "top"
        "width": "140px"
    }

    submitButton = W.elem.fromObject {
      id: "#{uuid}-submit-button"
      tagName: "input"
      type: "submit"
      value: "Play"
      style: buttonStyle
    }

    createAgeElements = ->
      W.elem.append container, challengeText
      W.elem.append container, yesButton
      W.elem.append container, noButton

      yesButton.onclick = playVideo
      noButton.onclick = displayErrorMessage

    createDOBElements = ->
      W.util.addInlineCss(elem, inlineCss)
      W.elem.append dobForm, dateOfBirth
      W.elem.append dobForm, submitButton
      W.elem.append container, challengeText
      W.elem.append container, dobForm
      W.elem.append container, challengeSubtitle

      submitButton.onclick = checkAge

    createSharedElements= ->
      W.elem.append container, errorText
      W.elem.append elem, container
      W.elem.append video.grid.top_inside, elem

    # Setup click handlers
    playVideo = ->
      removeExitingForm()
      removeOverlay()
      video.suppressPlay(false)
      video.play()

    displayErrorMessage = ->
      if yesButton? && noButton?
        yesButton.style.display = "none"
        noButton.style.display = "none"
      if dobForm? && challengeSubtitle?
        dobForm.style.display = "none"
        challengeSubtitle.style.display = "none"
      errorText.style.display = "block"

    checkAge = ->
      dob = document.getElementById("#{uuid}-dob").value
      age = Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25))

      if age >= minimumAge then playVideo() else displayErrorMessage()
      false

    removeExitingForm = ->
      if (container && (parent = container.parentNode))
        parent.removeChild(container)
        container = null

    removeOverlay = ->
      if (elem && (parent = elem.parentNode))
        parent.removeChild(elem)
        elem = null

    updateAge = (age) ->
      return unless age
      minimumAge = parseInt(age)
      elements = document.getElementsByClassName("#{uuid}-minimum-age")
      for e in elements
        e.innerHTML = age

    updateType = (type) ->
      return unless type
      removeExitingForm()

      container = W.elem.fromObject {
          id: "#{uuid}-container"
          style:
            "margin-top": "#{video.height() / 4}px"
        }

      if type == 'age'then createAgeElements()
      if type == 'dob' then createDOBElements()
      createSharedElements()

    createAgeElements() if options.type =="age"
    createDOBElements() if options.type =="dob"
    createSharedElements()

    {
      updateAge: updateAge
      updateType: updateType
    }

)(Wistia)
