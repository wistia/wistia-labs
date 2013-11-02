((W) ->


  W.plugin "ageGate", (video, options = {}) ->

    return unless options.ageRestriction

    ageRestriction = options.ageRestriction
    uuid = W.seqId("age_gate_")

    # Prevent playing
    video.suppressPlay(true)
    video.pause()

    # Create Age Gate elements
    ageGateElem = W.elem.fromObject {
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

    ageGateContainer = W.elem.fromObject {
      id: "#{uuid}-container"
      style:
        "margin-top": "#{video.height() / 3}px"
    }

    ageGateChallengeText = W.elem.fromObject {
      id: "#{uuid}-challenge-text"
      innerHTML: "Are you at least #{ageRestriction} year#{if (ageRestriction == 0 or ageRestriction > 1) then 's' else ''} of age?"
      style:
        "font-size": "28px"
        "font-weight": 300
        "margin-bottom": "10px"
    }

    sharedButtonStyle =
      "background-color": "#3498ea"
      "border": 0
      "border-radius": 0
      "cursor": "pointer"
      "display": "inline-block"
      "font-size": "16px"
      "font-weight": "600"
      "height": "40px"
      "letter-spacing": "2px"
      "line-height": "40px"
      "margin": "12px"
      "outline": "none"
      "padding": "0 12px"
      "text-transform": "uppercase"
      "width": "70px"

    ageGateYesButton = W.elem.fromObject {
      id: "#{uuid}-yes-button"
      class: "#{uuid}-button"
      innerHTML: "Yes"
      style: sharedButtonStyle
    }

    ageGateNoButton = W.elem.fromObject {
      id: "#{uuid}-no-button"
      class: "#{uuid}-button"
      innerHTML: "No"
      style: sharedButtonStyle
    }

    ageGateErrorText = W.elem.fromObject {
      id: "#{uuid}-error-text"
      innerHTML: "Sorry, you cannot watch this video."
      style:
        "color": "#f5d535"
        "display": "none"
        "font-size": "28px"
        "font-weight": 300
        "margin-top": "10px"
    }

    # Append Age Gate elements to DOM
    W.elem.append ageGateContainer, ageGateChallengeText
    W.elem.append ageGateContainer, ageGateYesButton
    W.elem.append ageGateContainer, ageGateNoButton
    W.elem.append ageGateContainer, ageGateErrorText
    W.elem.append ageGateElem, ageGateContainer
    W.elem.append video.grid.top_inside, ageGateElem

    # Setup click handlers
    playVideo = ->
      if (ageGateElem && (parent = ageGateElem.parentNode))
        parent.removeChild(ageGateElem)
        ageGateElem = null

      video.suppressPlay(false)

    displayErrorMessage = ->
      ageGateErrorText.style.display = "block"
      ageGateYesButton.style.display = "none"
      ageGateNoButton.style.display = "none"
      ageGateChallengeText.style.display = "none"

    ageGateYesButton.onclick = playVideo
    ageGateNoButton.onclick = displayErrorMessage

)(Wistia)
