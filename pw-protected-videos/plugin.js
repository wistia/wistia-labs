Wistia.plugin("passwordProtected", function(video, options) {

  var uuid = W.seqId();

  var pwProtectedVideoFonts = document.getElementById('pw_protected_video_fonts');
  if (!pwProtectedVideoFonts) {
    var fontCss = "@font-face {" +
      "font-family: 'Open Sans';" +
      "font-style: normal;" +
      "font-weight: 400;" +
      "src: local('Open Sans'), local('OpenSans'), url(" + Wistia.proto() + "//themes.googleusercontent.com/static/fonts/opensans/v6/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');" +
      "}" +
      "@font-face {" +
      "font-family: 'Open Sans';" +
      "font-style: normal;" +
      "font-weight: 600;" +
      "src: local('Open Sans Semibold'), local('OpenSans-Semibold'), url(" + Wistia.proto() + "//themes.googleusercontent.com/static/fonts/opensans/v6/MTP_ySUJH_bn48VBG8sNSqRDOzjiPcYnFooOUGCOsRk.woff) format('woff');" +
      "}" +
      "@font-face {" +
      "font-family: 'Open Sans';" +
      "font-style: normal;" +
      "font-weight: 700;" +
      "src: local('Open Sans Bold'), local('OpenSans-Bold'), url(" + Wistia.proto() + "//themes.googleusercontent.com/static/fonts/opensans/v6/k3k702ZOKiLJc3WVjuplzKRDOzjiPcYnFooOUGCOsRk.woff) format('woff');" +
      "}" +
      "@font-face {" +
      "font-family: 'Open Sans';" +
      "font-style: normal;" +
      "font-weight: 800;" +
      "src: local('Open Sans Extrabold'), local('OpenSans-Extrabold'), url(" + Wistia.proto() + "//themes.googleusercontent.com/static/fonts/opensans/v6/EInbV5DfGHOiMmvb1Xr-hqRDOzjiPcYnFooOUGCOsRk.woff) format('woff');" +
      "}" +
      "@font-face {" +
      "font-family: 'Open Sans';" +
      "font-style: italic;" +
      "font-weight: 300;" +
      "src: local('Open Sans Light Italic'), local('OpenSansLight-Italic'), url(" + Wistia.proto() + "//themes.googleusercontent.com/static/fonts/opensans/v6/PRmiXeptR36kaC0GEAetxvR_54zmj3SbGZQh3vCOwvY.woff) format('woff');" +
      "}";

    pwProtectedVideoFonts = Wistia.util.addInlineCss(document.body, fontCss);
    pwProtectedVideoFonts.id = 'pw_protected_video_fonts';
  }

  var fb;
  var hashedPw;
  function firebaseInitCallback() {
    fb.read(options.seed + hashedPw, function(val) {
      var hashedId;
      if (hashedId = val.val()) {
        // Replace the video
        Wistia.remote.media(hashedId, function(media) {
          video.replace(media, video.options);

          // When the real video is ready, get rid of the overlay
          video.ready(function() {
            overlay.style.display = 'none';
          });
        });
      } else {
        // Wrong password
        text.style.color = 'red';
        text.innerHTML = 'That password is incorrect. Please try again.';
      }
    });
  }

  function checkPassword(e) {
    Wistia.remote.script('http://localhost:8000/pw-protected-videos/sha256.js', function() {
      hashedPw = Sha256.hash(passwordInput.value);

      Wistia.remote.script('http://localhost:8000/pw-protected-videos/firebase_client.js', function() {
        fb = new FirebaseClient('https://pw-protected-videos.firebaseIO.com/', {
          initCallback: firebaseInitCallback
        });
      });
    });

    e.preventDefault();
  }

  var overlayCssElement = document.getElementById('pw_protected_video_css');
  if (!overlayCssElement) {
    var overlayCss = "" +
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
      "margin-top: " + parseInt(video.height() / 4) + "px;" +
      "}";

    overlayCssElement = Wistia.util.addInlineCss(document.body, overlayCss);
    overlayCssElement.id = 'pw_protected_video_css';
  }

  function showOverlay() {
    var overlay = document.createElement('div');
    overlay.id = uuid;

    overlay.innerHTML = "" +
      "<form id='" + uuid + "_challenge_container'>\n" +
      "<p id='" + uuid + "_challenge_text'>" + options.challenge + "</p>\n" +
      "<input id='" + uuid + "_password_input' type='password' />\n" +
      "<button id='" + uuid + "_password_submit' type='button' />\n" +
      "<p id='" + uuid + "_error_text' style='display:none;'>&nbsp;</p>\n" +
      "</form>\n";

    video.grid.top_inside.appendChild(overlay);
  }

  function removeOverlay() {
  }

});
