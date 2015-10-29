((W) ->

  # ### Non-plugin Helper Functions

   W.plugin "wufooForm", (video, options = {}) ->

    showForm = ->
      $('.open-lightbox').trigger('click')

    video.bind("end", showForm)
  
    # Public interface.
    {
    }

)(Wistia)
