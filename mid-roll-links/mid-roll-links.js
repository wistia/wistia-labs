Wistia.plugin("midRollLinks", function(video, options) {
  var isMobile = /ipad|iphone|ipod|android/i.test(navigator.userAgent);
  var links = options.links;
  var linkSpacing = "20px";
  var margin = "6px";

  function midRollLinkHtml(link) {
    var linkHtml = "<a href=\"" + link.linkHref + "\" target=\"_blank\" class=\"mid-roll-link\" style=\"display:block;\">" + link.linkText + "</a>";
    return linkHtml;
  }

  function setColors(playerColor) {
    color = new Wistia.Color(playerColor);
    console.log(color.toHex());
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
    borderColor
      .lighten(50);
    return {
      borderColor: borderColor.toHex(),
      hoverBgColor: hoverBgColor.toHex(),
      playerColor: color.toHex(),
      selectedBgColor: selectedBgColor.toHex(),
      selectedTextColor: selectedTextColor.toHex()
    }
  }

  function setLinkSpacing() {
    video.ready(function() {
      if (video.data.media.branding || video.options.branding) {
        console.log("as many as 20");
        return "20px";
      } else {
        console.log("only 6");
        return "6px";
      }
    });
  }

  // Each person in the people array has his own scope and function set
  function addLinks(links) {
    var linkElemWrapper = document.createElement("div");
    linkElemWrapper.id = video.uuid + "_midroll";
    linkElemWrapper.style.position = "relative";
    linkElemWrapper.style.top = linkSpacing;
    linkElemWrapper.style.right = linkSpacing;
    linkElemWrapper.style.textAlign = "right";
    video.grid.right_inside.appendChild(linkElemWrapper);

    video.trigger("unbindlinks");

    for (var i = 0; i < links.length; i++) {
      (function(link) {
        var visible = false;
        var linkElem;

        function addLink() {
          linkElem = document.createElement("div");
          linkElem.style.whiteSpace = "nowrap";
          linkElem.className = "wistia_initial";
          linkElem.innerHTML = midRollLinkHtml(link);
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

    function update(options) {
      setColors(options.playerColor);
      addLinks(options.links);
    }

    if (links && links.length) {
      addLinks(links);
    }

    if (!document.getElementById("wistia_midroll_links_css")) {
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
          "  background-color: #" + setColors(options.playerColor).selectedBgColor + ";\n" +
          "  border: 2px solid #" + setColors(options.playerColor).borderColor + ";\n" +
          "  color: #" + setColors(options.playerColor).selectedTextColor + ";\n" +
          "  font-size: 16px;\n" +
          "  margin: " + margin + ";\n" +
          "  padding: 5px;\n" +
          "  text-align: center;\n" +
          "}"
          );
      styleElem.id = "wistia_midroll_links_css";
    }

    // Return an object with a public interface 
    // for the plugin, if you want.
    return {
      update: update
    }
  });
