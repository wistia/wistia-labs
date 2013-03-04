# Wistia Labs

Welcome to Wistia Labs!A Lab takes an embed code and modifies it
to do something cool. 


## Make your own lab

To get started, copy the `template` folder to a new name. Then 
you can modify the files for your lab.

- __index.html:__ The HTML for your lab file.
- __style.css:__ Custom styles for this particular lab page.
- __ui.js:__ Javascript for this particular lab page.
- __plugin.js:__ A skeleton of a Wistia plugin. Rename at will please.


## Run a Testing Server

    python -m SimpleHTTPServer

Then you can access your lab at http://localhost:8000/mylabname/.

For more information about plugins, you might want to [check out 
the Plugin API docs](http://wistia.com/doc/plugin-api) and 
[the Embed Shepherd docs](http://wistia.com/doc/embed-shepherd).
