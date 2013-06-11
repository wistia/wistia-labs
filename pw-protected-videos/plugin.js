Wistia.plugin("passwordProtected", function(video, options) {

  var uuid = Wistia.seqId("wistia_password_protected_");
  var fb;
  var gotSha256 = false;
  var gotFireBaseClient = false;
  var fireBaseReady = new Wistia.StopGo();
  var styleElem;
  var sha256Src = Wistia.proto() +
    '//' + pluginHost() + '/pw-protected-videos/sha256.js';
  var fbClientSrc = Wistia.proto() +
    '//' + pluginHost() + '/lib/firebase_client.js';

  window.WebFontConfig = {
    google: { families: [ 'Open+Sans:400:latin', 'Open+Sans:700:latin' ] }
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


  function loadVideoByHashedId(hashedId, callback) {
    var errorTextElem = document.getElementById(uuid + "_error_text");
    errorTextElem.style.visibility = "visible";
    errorTextElem.innerHTML = "Loading the video...";
    Wistia.remote.media(hashedId, function(media) {
      video.suppressPlay(false);
      video.replace(media, video.options);
      video.ready(removeOverlay);
      if (callback) {
        callback();
      }
    });
  }

  function loadVideoByPassword(hashedPw, options) {
    options = Wistia.extend({
      seed: null,
      showError: true
    }, options);
    var errorTextElem = document.getElementById(uuid + "_error_text");
    fireBaseReady(function() {
      fb.read(options.seed + hashedPw, function(val) {
        var hashedId;
        if (hashedId = val.val()) {
          Wistia.localStorage(savedPasswordKey(), hashedPw);
          loadVideoByHashedId(hashedId, function() {
            video.trigger("correct-password");
          });
        } else if (options.showError) {
          errorTextElem.innerHTML = "That password is incorrect. Please try again.";
          errorTextElem.style.visibility = "visible";
          video.trigger("invalid-password");
        }
      });
    });
  }

  function savedPasswordKey() {
    return ["password_protected", options.seed];
  }

  function isDev() {
   return location.port || location.domain === 'localhost' || location.domain === '127.0.0.1';
  }

  function pluginHost() {
    if (isDev()) {
      return "localhost:8000";
    } else {
      return "fast.wistia.com/labs/";
    }
  }

  Wistia.remote.script(sha256Src, function() {
    gotSha256 = true;
    if (gotFireBaseClient) {
      fireBaseReady(true);
    }
  });

  Wistia.remote.script(fbClientSrc, function() {
    fb = new FirebaseClient('https://pw-protected-videos.firebaseIO.com/', {
      initCallback: function() {
        gotFireBaseClient = true;
        if (gotSha256) {
          fireBaseReady(true);
        }
      }
    });
  });

  function checkPassword(e) {
    e = window.event != null ? window.event : e;
    var passwordInput = document.getElementById(uuid + "_password_input");
    fireBaseReady(function() {
      loadVideoByPassword(Sha256.hash(passwordInput.value), {
        seed: options.seed
      });
    });
    e.preventDefault && e.preventDefault();
    e.returnValue = false;
  }

  function addCss() {
    styleElem = Wistia.util.addInlineCss(document.getElementById(uuid), getCss());
  }

  function removeCss() {
    var par;
    if (styleElem && (par = styleElem.parentNode)) {
      par.removeChild(styleElem);
      styleElem = null;
    }
  }

  function refreshCss() {
    removeCss();
    addCss();
  }

  function getCss() {
    return "" +
      "#" + uuid + " {" +
      "box-shadow:rgba(0,0,0,.9) 0 0 " + Math.round(Math.max(video.videoHeight(), video.videoWidth()) / 2) + "px 30px inset;" +
      "position: absolute;" +
      "width: " + video.width() + "px;" +
      "height: " + video.height() + "px;" +
      "top: 0;" +
      "left: 0;" +
      "background-color: #333;" +
      "text-align: center;" +
      "}" +

      "#" + uuid + "_challenge_text {" +
      "color: #fff;" +
      "font-family: Open Sans,Arial,sans-serif;" +
      "font-weight: 300;" +
      "font-size: 28px;" +
      "}" +

      "#" + uuid + "_password_input {" +
      "border: 0;" +
      "border-radius: 0;" +
      "margin: 0;" +
      "padding: 0 8px;" +
      "outline: none;" +
      "height: 40px;" +
      "width: 200px;" +
      "line-height: 40px;" +
      "font-size: 16px;" +
      "vertical-align: top;" +
      "}" +
      
      "#" + uuid + "_password_submit {" +
      "border: 0;" +
      "border-radius: 0;" +
      "cursor: pointer;" +
      "font-family: Open Sans,Arial,sans-serif;" +
      "font-size: 16px;" +
      "background: #6c9cbb;" +
      "letter-spacing: 2px;" +
      "font-weight: 600;" +
      "display: inline-block;" +
      "height: 40px;" +
      "line-height: 40px;" +
      "color: #fff;" +
      "margin: 0;" +
      "padding: 0 12px;" +
      "outline: none;" +
      "zoom: 1;" +
      "text-transform: uppercase;" +
      "vertical-align: top;" +
      "}" +
      
      "#" + uuid + "_challenge_container {" +
      "margin-left: auto;" +
      "margin-right: auto;" +
      "}" +
      
      "#" + uuid + "_error_text {" +
      "color: #f5d535;" +
      "margin:20px 0 0 0;" +
      "}";
  }

  function showOverlay() {
    var overlay = document.createElement('div');
    overlay.id = uuid;

    overlay.innerHTML = "" +
      "<form id='" + uuid + "_challenge_container'>\n" +
      "<p id='" + uuid + "_challenge_text'>" + options.challenge + "</p>\n" +
      "<input id='" + uuid + "_password_input' type='password' />" +
      "<button id='" + uuid + "_password_submit'>Submit</button>\n" +
      "<p id='" + uuid + "_error_text' style='visibility:hidden;'>&nbsp;</p>\n" +
      "</form>\n";

    video.grid.top_inside.appendChild(overlay);
    refreshCss();
    centerVertically();

    var submitElem = document.getElementById(uuid + "_password_submit");
    submitElem.onclick = checkPassword;

    var inputElem = document.getElementById(uuid + "_password_input");
    inputElem.onkeyup = function(e) {
      e = window.event != null ? window.event : e;
      keycode = e.which || e.keyCode;
      if (keycode === 13) {
        e.preventDefault && e.preventDefault();
        e.returnValue = false;
        checkPassword(e);
      } else {
        var errorTextElem = document.getElementById(uuid + "_error_text");
        errorTextElem.innerHTML = "&nbsp;";
      }
    };

    var formElem = document.getElementById(uuid + "_challenge_container");
    formElem.onsubmit = function() { return false; };
  }

  function removeOverlay() {
    var overlay = document.getElementById(uuid);
    var par;
    if (overlay && (par = overlay.parentNode)) {
      par.removeChild(overlay);
      overlay = null;
    }
  }

  function refreshOverlay() {
    removeOverlay();
    showOverlay();
  }

  function centerVertically() {
    var overlayElem = document.getElementById(uuid);
    var containerElem = document.getElementById(uuid + "_challenge_container");
    var overlayHeight = Wistia.util.elemHeight(overlayElem);
    var containerHeight = Wistia.util.elemHeight(containerElem);
    var offset = (overlayHeight - containerHeight) / 2;
    containerElem.style.marginTop = "" + offset + "px";
  }

  function fit() {
    refreshCss();
    centerVertically();
  }

  // On load, show the overlay, and use the stored password if it's available.
  refreshOverlay();

  if (!options || !options.dontSavePassword) {
    var savedPassword;
    if (savedPassword = Wistia.localStorage(savedPasswordKey())) {
      loadVideoByPassword(savedPassword, {
        seed: options.seed,
        showError: false
      });
    }
  }

  // Prevent playing
  video.suppressPlay(true);
  video.pause();

  // If the video dimensions change, update the overlay.
  video.bind("widthchange", fit).bind("heightchange", fit);

  // We don't know when the font loads, and it looks horrible in 
  // IE7 unless we fit after the font is ready. So let's just 
  // spam `fit()`.
  Wistia.timeout(video.uuid + "_pw_protected1", fit, 500)
  Wistia.timeout(video.uuid + "_pw_protected2", fit, 1500)
  Wistia.timeout(video.uuid + "_pw_protected3", fit, 4000)

  return {
    reprotect: function() {
      Wistia.localStorage(savedPasswordKey(), "");
    },
    savedPasswordKey: savedPasswordKey,
    fit: fit,
    firebase: function() { return fb; },
    options: function() { return options; }
  };
});
