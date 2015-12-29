Wistia.plugin("midrollLinks", function(video, options) {
  var isMobile = /ipad|iphone|ipod|android/i.test(navigator.userAgent);
  var links = options.links;
  var margin = "6px";

  // load google font for plugin stylez
  window.WebFontConfig = {
    google: { families: [ 'Open+Sans:700:latin' ] }
  };

  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();

  function midrollLinkHtml(link) {
    var linkHtml = "<a href=\"" + link.linkHref + "\" target=\"_blank\" class=\"mid-roll-link\" style=\"display:block;\">" + link.linkText + "</a>";
    return linkHtml;
  }

  function setColors(playerColor) {
    color = new Wistia.Color(playerColor);
    selectedBgColor = new Wistia.Color(color);
    selectedBgColor.saturation(selectedBgColor.saturation() * .8);
    if (selectedBgColor.grayLevel() > .8) {
      selectedTextColor = new Wistia.Color(color).darken(180);
    } else {
      selectedTextColor = new Wistia.Color("fff");
    }
    hoverBgColor = new Wistia.Color(selectedBgColor).blend("fff", .8);
    hoverBgColor.saturation(hoverBgColor.saturation() * .3);
    borderColor = new Wistia.Color(selectedBgColor);
    borderColor.lighten(50);
    return {
      borderColor: borderColor.toHex(),
      hoverBgColor: hoverBgColor.toHex(),
      playerColor: color.toHex(),
      selectedBgColor: selectedBgColor.toHex(),
      selectedTextColor: selectedTextColor.toHex()
    }
  }

  var linkSpacing = function() {
    if (video.data.media.branding || video.options.branding) {
      return "20px";
    } else {
      return "6px";
    }
  }

  // Each link in the link set has it's own scope. Not confusing at all.
  function addLinks(links) {
    var linkElemWrapper = document.createElement("div");
    linkElemWrapper.id = video.uuid + "_midroll";
    linkElemWrapper.style.position = "absolute";
    linkElemWrapper.style.right = "6px";
    linkElemWrapper.style.textAlign = "right";
    video.grid.right_inside.appendChild(linkElemWrapper);
    video.ready(function() {
      linkElemWrapper.style.top = linkSpacing();
    });

    video.trigger("unbindlinks");

    for (var i = 0; i < links.length; i++) {
      (function(link) {
        var visible = false;
        var linkElem;

        function addLink() {
          linkElem = document.createElement("div");
          linkElem.style.whiteSpace = "nowrap";
          linkElem.className = "wistia_initial";
          linkElem.innerHTML = midrollLinkHtml(link);
          linkElemWrapper.appendChild(linkElem);
          
          // hide on mobile
          if (isMobile) {
            linkElem.style.visibility = "hidden";
          }
          setTimeout(function() {
            if (linkElem) {
              linkElem.className = "wistia_visible";
            }
          }, 500);

          visible = true;
        }

        function removeLink() {
          var par;

          if (linkElem) {
            linkElem.style.visibility = "hidden";
            linkElem.className = "wistia_invisible";
            setTimeout(function() {
              if (linkElem && (par = linkElem.parentNode)) {
                par.removeChild(linkElem);
              }
              linkElem = null;
            }, 400);
          }
          visible = false;
        }

        function toggleVisibilityBasedOnTime(s) {
          if (!visible && s >= link.start && s < link.end) {
            removeLink();
            addLink();
          } else if (visible && (s < link.start || s >= link.end)) {
            removeLink();
          }
        }

        function unbindAndRemoveAllLinks() {
          removeLink();
          visible = false;
          video.unbind("secondchange", toggleVisibilityBasedOnTime);
          video.unbind("end", toggleVisibilityBasedOnTime);
          video.unbind("unbindlinks", unbindAndRemoveAllLinks);
        }

        video.bind("secondchange", toggleVisibilityBasedOnTime);
        video.bind("end", toggleVisibilityBasedOnTime);
        video.bind("unbindlinks", unbindAndRemoveAllLinks);

      }(links[i]));
    }}

    // public update method always updates stylings to catch color changes
    function update(options) {
      updateStylings();
      addLinks(options.links);
    }

    if (links && links.length) {
      addLinks(links);
    }

    function updateStylings() {
      video.hasData(function() {
        var colors = setColors("" + video.params.playerColor);
        styleElem = Wistia.util.addInlineCss(document.body, ".wistia_initial {\n" +
            "  opacity: 0;\n" +
            "  filter: alpha(opacity=0);\n" +
            "}\n" +
            ".wistia_invisible {\n" +
            "  opacity: 0;\n" +
            "  filter: alpha(opacity=0);\n" +
            "  -webkit-transition: opacity .4s ease-in-out;\n" +
            "  -moz-transition: opacity .4s ease-in-out;\n" +
            "  -o-transition: opacity .4s ease-in-out;\n" +
            "  -ms-transition: opacity .4s ease-in-out;\n" +
            "  transition: opacity .4s ease-in-out;\n" +
            "}\n" +
            ".wistia_visible {\n" +
            "  opacity: 0.9;\n" +
            "  filter: alpha(opacity=90);\n" +
            "  -webkit-transition: opacity .4s ease-in-out;\n" +
            "  -moz-transition: opacity .4s ease-in-out;\n" +
            "  -o-transition: opacity .4s ease-in-out;\n" +
            "  -ms-transition: opacity .4s ease-in-out;\n" +
            "  transition: opacity .4s ease-in-out;\n" +
            "}\n" +
            ".wistia_visible a {\n" +
            "  background-color: #" + colors.selectedBgColor + ";\n" +
            "  color: #" + colors.selectedTextColor + ";\n" +
            "  font-family: 'Open Sans', sans-serif;\n" +
            "  letter-spacing: 0px;\n" +
            "  font-weight: bold;" +
            "  font-size: 18px;\n" +
            "  margin: " + margin + ";\n" +
            "  padding: 5px 17px 7px;\n" +
            "  border-radius: 20px;\n" +
            "  -moz-box-shadow: 0px 0px 17px rgba(0,0,0,.2);\n" +
            "  -webkit-box-shadow: 0px 0px 17px rgba(0,0,0,.2);\n" +
            "  box-shadow: 0px 0px 17px rgba(0,0,0,.2);\n" +
            "  text-align: center;\n" +
            "  text-decoration: none; \n" +
            "}"
        );
        styleElem.id = "wistia_midroll_links_css";
      });
    }

    if (!document.getElementById("wistia_midroll_links_css")) {
      updateStylings();
    }

    // Return an object with a public interface 
    // for the plugin, if you want.
    return {
      update: update,
      options: options
    }
  });