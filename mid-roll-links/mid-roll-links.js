Wistia.plugin("midRollLinks", function(video, options) {

  var isMobile = /ipad|iphone|ipod|android/i.test(navigator.userAgent);
  var links = options.links;

  function midRollLinkHtml(link) {
    var linkHtml = "<a href=\"" + link.linkHref + "\" target=\"_blank\" class=\"mid-roll-link\" style=\"display:block;height:28px;\">" + link.linkText + "</a>";
    return linkHtml;
  }

  // Each person in the people array has his own scope and function set
  function addLinks(links) {
    var linkElemWrapper = document.createElement("div");
    linkElemWrapper.id = video.uuid + "_midroll";
    linkElemWrapper.style.position = "absolute";
    linkElemWrapper.style.top = "6px";
    linkElemWrapper.style.right = "6px";
    linkElemWrapper.style.textAlign = "right";
    video.grid.right_inside.appendChild(linkElemWrapper);

    for (var i = 0; i < links.length; i++) {
      (function(link) {
        var visible = false;
        var linkElem;

        function addLink() {
          console.log(link);
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
          "  opacity: 1;\n" +
          "  filter: alpha(opacity=100);\n" +
          "  -webkit-transition: opacity .4s ease-in-out;\n" +
          "  -moz-transition: opacity .4s ease-in-out;\n" +
          "  -o-transition: opacity .4s ease-in-out;\n" +
          "  -ms-transition: opacity .4s ease-in-out;\n" +
          "  transition: opacity .4s ease-in-out;\n" +
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
