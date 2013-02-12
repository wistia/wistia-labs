Wistia.plugin("wistiafollows", function(video, options) {
  if (video.initializedFollow) {
    return true;
  }

  video.initializedFollow = true;

  var config = options.config;
  var people = options.people;
  var recap = options.recap;
  var isMobile = /ipad|iphone|ipod|android/i.test(navigator.userAgent);

  if (isMobile && people && !recap) {
    var hasPostRoll = false;
    for (var pluginUuid in video.plugins) {
      if (/^postRoll/.test(video.plugins[pluginUuid].pluginName)) {
        hasPostRoll = true;
      }
    }
    if (!hasPostRoll) {
      recap = Wistia.extend([], people);
    }
  }

  function midRollFollowImgSrc(person) {
    return "https://api.twitter.com/1/users/profile_image?screen_name=" + person.screenName + "&size=bigger";
  }

  function midRollFollowHtml(person, options) {
    options = Wistia.extend({
      imgPosition: "left"
    }, options || {});

    var imgHtml = "<img src=\"" + midRollFollowImgSrc(person) + "\" style=\"border-radius:14px;height:28px;margin:0 0 10px 0;" + (options.imgPosition === "left" ? "margin-right:10px;" : "margin-left:10px;") + "vertical-align:top;\" />";
    var linkHtml = "<a href=\"https://twitter.com/" + person.screenName + "\" target=\"_blank\" class=\"twitter-follow-button\" data-show-count=\"false\" data-show-screen-name=\"true\" data-size=\"large\" data-lang=\"en\" style=\"display:block;height:28px;\">Follow @" + person.screenName + "</a>";

    if (options.imgPosition === "left") {
      return imgHtml + linkHtml;
    } else {
      return linkHtml + imgHtml;
    }
  }

  // Each person in the people array has his own scope and function set
  if (people && people.length) {
    var followElemWrapper = document.createElement("div");
    followElemWrapper.id = video.uuid + "_follow";
    followElemWrapper.style.position = "absolute";
    followElemWrapper.style.top = "6px";
    followElemWrapper.style.right = "6px";
    followElemWrapper.style.textAlign = "right";
    video.grid.right_inside.appendChild(followElemWrapper);

    for (var i = 0; i < people.length; i++) {
      (function(person) {
        var visible = false;
        var followElem;
        function removeFollow() {
          var par;
          if (followElem) {
            followElem.className = "wistia_invisible";
            setTimeout(function() {
              if (followElem && (par = followElem.parentNode)) {
                par.removeChild(followElem);
              }
              followElem = null;
            }, 400);
          }
          visible = false;
        }

        function imgSrc() {
          return "https://api.twitter.com/1/users/profile_image?screen_name=" + person.screenName + "&size=bigger";
        }

        function addFollow() {
          followElem = document.createElement("div");
          followElem.style.whiteSpace = "nowrap";
          followElem.className = "wistia_initial";
          followElem.innerHTML = midRollFollowHtml(person);
          followElemWrapper.appendChild(followElem);
          if (isMobile) {
            followElem.style.visibility = "hidden";
          }
          setTimeout(function() {
            if (followElem) {
              followElem.className = "wistia_visible";
            }
          }, 500);
          if (typeof(twttr) != "undefined") {
            twttr.widgets.load();
          }
          visible = true;
        }

        function toggleVisibilityBasedOnTime(s) {
          if (!visible && s >= person.start && s < person.end) {
            removeFollow();
            addFollow();
          } else if (visible && (s < person.start || s >= person.end)) {
            removeFollow();
          }
        }

        function unbindAndRemoveAllFollows() {
          removeFollow();
          visible = false;
          video.unbind("secondchange", toggleVisibilityBasedOnTime);
          video.unbind("end", toggleVisibilityBasedOnTime);
          video.unbind("unbindfollows", unbindAndRemoveAllFollows);
        }

        video.bind("secondchange", toggleVisibilityBasedOnTime);
        video.bind("end", toggleVisibilityBasedOnTime);
        video.bind("unbindfollows", unbindAndRemoveAllFollows);
        var img = new Image();
        img.src = imgSrc();

      }(people[i]));
    }
  }

  var postRollContent = "";
  var postRollHeight = 176;
  var recapHeight = recap ? (recap.length * 38 - 10) : 0;

  if (options.postRoll || (recap && recap.length === 1)) {
    var screenName, showScreenName, lang;
    if (options.postRoll) {
      screenName = options.postRoll.screenName;
      showScreenName = options.postRoll.showScreenName != null ? options.postRoll.showScreenName : "true";
      lang = options.postRoll.lang || "en";
    } else if (recap && recap.length === 1) {
      screenName = recap[0].screenName;
      showScreenName = recap[0].showScreenName != null ? recap[0].showScreenName : "true";
      lang = recap[0].lang || "en";
    }
    var postRollOffset = postRollHeight < recapHeight ? (recapHeight - postRollHeight) / 2 : 0;
    postRollContent = "" +
      "<div class=\"wistia_postroll_follow_wrapper\" style=\"position:relative;top:" + postRollOffset + "px;\">" +
      "<img " +
        "src=\"" + postRollImgSrc() + "\" " +
        "style=\"border-radius:64px;height:128px;margin-bottom:20px;vertical-align:top;width:128px;\"" +
      ">" +
      "<br>" +
      "<a " +
        "href=\"https://twitter.com/" + screenName + "\" " +
        "target=\"_blank\" " +
        "class=\"twitter-follow-button\"" +
        "data-show-count=\"false\"" +
        "data-show-screen-name=\"" + showScreenName + "\" " +
        "data-size=\"large\" " +
        "data-lang=\"" + lang + "\" " +
        "style=\"display:block;height:28px;\"" +
      ">" +
      "Follow @" + screenName +
      "</a>" +
      "</div>";

    function postRollImgSrc() {
      return "https://api.twitter.com/1/users/profile_image?screen_name=" + screenName + "&size=reasonably_small";
    }

    img = new Image()
    img.src = postRollImgSrc()
  }

  if (recap && (options.postRoll || recap.length > 1)) {
    if (postRollContent) {
      postRollContent = "<div style=\"display:inline-block;*display:inline;" + (options.postRoll ? "margin-right: 60px;" : "") + "vertical-align:top;zoom:1;\">" + postRollContent + "</div>"
    }
    var recapHtmlArr = [];
    for (var i = 0; i < recap.length; i++) {
      recapHtmlArr.push(midRollFollowHtml(recap[i], { imgPosition: "left" }));
    }
    var recapOffset = recapHeight < postRollHeight ? Math.round((postRollHeight - recapHeight) / 2) : 0;
    postRollContent = (postRollContent || "") +
      "<div class=\"wistia_postroll_recap_wrapper\" style=\"height:" + recapHeight + "px;top:" + recapOffset + "px;\">" +
      recapHtmlArr.join("<br/>") +
      "</div>";
  }

  if (postRollContent) {
    function initPostRoll() {
      var postRoll = Wistia.plugin.postRoll(video, {
        raw: postRollContent,
        style: {
          backgroundColor: '#1f1b17',
          backgroundOpacity: 0.83,
          boxShadow: 'inset 0 0 640px 20px #000',
          textAlign: 'center'
        }
      });
      video.bind("end", function() {
        if (typeof(twttr) != 'undefined') {
          twttr.widgets.load();
        }
        if (Wistia.detect.android) {
          setTimeout(function() {
            if (typeof(twttr) != 'undefined') {
              twttr.widgets.load();
            }
          }, 100);
        }
        setTimeout(function() {
          video.fit();
        }, 500);
      });
    }
    if (Wistia.plugin['postRoll-v1']) {
      initPostRoll();
    } else {
      Wistia.remote.script(Wistia.plugin._staticAssetUrl('postRoll-v1'), initPostRoll);
    }
  }

  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

  if (!document.getElementById("wistia_follows_css")) {
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
      "}" +
      ".wistia_postroll_follow_wrapper {\n" +
      "  line-height: 0;\n" +
      "  position: relative;\n" +
      "}" +
      ".wistia_postroll_follow_wrapper iframe {\n" +
      "  height: 28px;\n" +
      "  margin: 0;\n" +
      "  vertical-align: top;\n" +
      "}" +
      ".wistia_postroll_recap_wrapper {\n" +
      "  display: inline-block;\n" +
      "  *display: inline;\n" +
      "  font-size: 0;\n" +
      "  line-height: 0;\n" +
      "  padding-left: 1px;\n" +
      "  position: relative;\n" +
      "  text-align: left;\n" +
      "  vertical-align: top;\n" +
      "  zoom: 1;\n" +
      "}" +
      ".wistia_postroll_recap_wrapper iframe {\n" +
      "  height: 28px;\n" +
      "  margin: 0;\n" +
      "  vertical-align: top;\n" +
      "}"
    );
    styleElem.id = "wistia_follows_css";
  }

});
