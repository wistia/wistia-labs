(($) ->
  $.fn.timeatEntry = (options = {}) ->

    $(this).each ->
      $original = $(this)
      $original.hide()

      $minutes = $("<input type='text' class='minutes' />")
      $sep = $("<span class='sep'>:</span>")
      $seconds = $("<input type='text' class='seconds' />")
      $wrapper = $("<div class='timeat_entry'></div>")
        .append($minutes)
        .append($sep)
        .append($seconds)
      $original.after $wrapper

      updateOriginal = ->
        $original.val(parseInt(($minutes.val() or 0) * 60, 10) + parseInt($seconds.val() or 0, 10)).trigger("keyup").trigger("change")

      isNavKey = (event) ->
        event.keyCode is 46 or event.keyCode is 8 or event.keyCode is 9 or event.keyCode is 27 or event.keyCode is 13 or
          (event.keyCode is 65 and event.ctrlKey is true) or
          (event.keyCode >= 35 and event.keyCode <= 39)

      preventNonNumericKeystrokes = (event) ->
        return if isNavKey(event)
        c = String.fromCharCode(event.which)
        event.preventDefault() unless /\d/.test(c)
        return
      
      updateVisibleTimeFromSeconds = (seconds) ->
        if seconds? and seconds isnt ""
          minutes = seconds % 60
          seconds = seconds - minutes * 60
          $minutes.val(minutes)
          $seconds.val(formatSeconds(seconds))

      formatSeconds = (seconds) ->
        if seconds < 10
          "0" + (parseInt(seconds, 10) or 0)
        else
          seconds

      # Prevent invalid values in minutes.
      $minutes.bind "keydown", preventNonNumericKeystrokes

      # Prevent invalid values in seconds.
      $seconds.bind "keydown", preventNonNumericKeystrokes
      $seconds.bind "keyup", (event) ->
        if $seconds.val() >= 60
          $seconds.val(59)
          $seconds.preventDefault()

      # Format seconds correctly on blur.
      $seconds.bind "blur", (event) ->
        $seconds.val(formatSeconds($seconds.val()))

      $seconds.add($minutes).bind "keyup", updateOriginal

      # Initialize the UI from the original value.
      updateVisibleTimeFromSeconds($original.val())

)(jQuery)
