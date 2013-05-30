# Wistia Labs

Welcome to **Wistia Labs!** 

A Lab takes an embed code and modifies it to do something cool :punch:


### Make your own lab

**NOTE:** Where `mylabname` is referenced below, you should use whatever 
the name of your lab is.

To get started, first clone this repository!

    git clone git@github.com:wistia/wistia-labs.git

Then create your own branch in git.

    cd wistia-labs
    git checkout -b mylabname

Now you can copy the `template` folder to `mylabname`, and 
modify its contents, which should include:

- __index.html:__ The HTML for your lab file.
- __style.css:__ Custom styles for this particular lab page.
- __ui.js:__ Javascript for this particular lab page.
- __plugin.js:__ A skeleton of a Wistia plugin. Rename at will please.


### Run a Testing Server

    python -m SimpleHTTPServer

Then you can access your lab at http://localhost:8000/mylabname/.

### Deploying Labs

So, you think your new update is so special, huh? Actually it probably is, we
should get it up there and live in a hurry!

* First, commit your changes and push to master.
* If you have never run this before, run from wistiacom:

    `git submodule update --init`

* Next, get up-to-date on wistiacom, and then run:

    `script/update_labs`
    
* Run doomcrank:

    `./crank wistiacom production wistia:deploy:update`

* If your update is to a plugin itself, you will also need to bust the cache
  from Fastly, which you can do from a wistia-app machine:

    `Fastly.purge_key('labs')`

### Other Goodies

Use Wistia's simple `localStorage` API to save data for a single domain.

To set:

    Wistia.localStorage("my-custom-key", "a-value");
    Wistia.localStorage("nested.key", { an: "object" });

To get:

    Wistia.localStorage("my-custom-key");
    Wistia.localStorage("nested.key");


### More Information

For more information about plugins, you might want to [check out 
the Plugin API docs](http://wistia.com/doc/plugin-api) and 
[the Embed Shepherd docs](http://wistia.com/doc/embed-shepherd).
