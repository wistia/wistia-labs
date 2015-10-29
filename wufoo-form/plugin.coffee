((W) ->

  # ### Non-plugin Helper Functions

   W.plugin "wufooForm", (video, options = {}) ->

    showForm = ->
      wufooForm = $("#wufoo-m1vmnn3l0x4bbg4")
      wufooForm.show()

    video.bind("end", showForm)
  
    # Public interface.
    {
    }

)(Wistia)
