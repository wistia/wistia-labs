((W) ->

  W.plugin "ageRestriction", (video, options = {}) ->

    return unless options.minimumAge

    minimumAge = parseInt(options.minimumAge)
    uuid = W.seqId("age_gate_")

    # Prevent playing
    video.suppressPlay(true)
    video.pause()

    # Create Age Gate elements
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
        "margin-top": "#{video.height() / 5}px"
    }

    challengeTextLineOne = W.elem.fromObject {
      id: "#{uuid}-challenge-text-line-one"
      innerHTML: "<div>You must be at least <span id='#{uuid}-minimum-age'>#{minimumAge}</span></div><div>to view this video.</div>"
      style:
        "font-size": "28px"
        "font-weight": 700
        "letter-spacing": "1px"
        "line-height": "1.5em"
        "margin": "0 auto"
        "width": "55%"
    }

    challengeTextLineTwo = W.elem.fromObject {
      id: "#{uuid}-challenge-text-line-two"
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
        "margin": "20px 0"
    }

    dateOfBirth = W.elem.fromObject {
      id: "#{uuid}-dob"
      tagName: "input"
      type: "date"
      style:
        "border": "0"
        "border-radius": "0"
        "color": "#666"
        "font-size": "16px"
        "font-family": "Open Sans,Arial,sans-serif"
        "height": "40px"
        "line-height": "40px"
        "margin": "0"
        "outline": "none"
        "padding": "0 0 0 10px"
        "text-transform": "uppercase"
        "vertical-align": "top"
        "width": "160px"
    }

    inlineCss = """
      ##{uuid}-dob::-webkit-inner-spin-button,
      ##{uuid}-dob::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
      }
    """

    submitButton = W.elem.fromObject {
      id: "#{uuid}-submit-button"
      tagName: "input"
      type: "submit"
      value: "Submit"
      style:
        "background-color": "#3498ea"
        "border": "0"
        "border-radius": "0"
        "color": "#fff"
        "cursor": "pointer"
        "display": "inline-block"
        "font-size": "16px"
        "height": "40px"
        "line-height": "40px"
        "outline": "0"
        "padding": "0"
        "text-transform": "uppercase"
        "vertical-align": "top"
        "width": "100px"
    }

    errorText = W.elem.fromObject {
      id: "#{uuid}-error-text"
      innerHTML: "<div>You are not old enough</div></div>to view this video.</div>"
      style:
        "color": "#f5d535"
        "display": "none"
        "font-size": "28px"
        "font-weight": 700
        "letter-spacing": "1px"
        "line-height": "1.5em"
        "margin": "0 auto"
        "padding-top": "1em"
        "width": "55%"
    }

    # Append all age gate elements to DOM
    W.util.addInlineCss(elem, inlineCss)
    W.elem.append container, challengeTextLineOne
    W.elem.append dobForm, dateOfBirth
    W.elem.append dobForm, submitButton
    W.elem.append container, dobForm
    W.elem.append container, challengeTextLineTwo
    W.elem.append container, errorText
    W.elem.append elem, container
    W.elem.append video.grid.top_inside, elem

    # Setup click handlers
    playVideo = ->
      if (elem && (parent = elem.parentNode))
        parent.removeChild(elem)
        elem = null

      video.suppressPlay(false)

    displayErrorMessage = ->
      dobForm.style.display = "none"
      challengeTextLineTwo.style.display = "none"
      errorText.style.display = "block"

    checkAge = ->
      dob = dateOfBirth.value
      age = Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25))

      if age >= minimumAge then playVideo() else displayErrorMessage()
      false

    updateAge = (age) ->
      return unless age
      age = parseInt(age)
      document.getElementById("#{uuid}-minimum-age").innerHTML = age

    submitButton.onclick = checkAge

    { updateAge: updateAge }

)(Wistia)
