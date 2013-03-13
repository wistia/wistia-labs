Wistia.plugin("passwordProtected", function(video, options) {

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
      if (val.val()) {
        // Replace the video
        Wistia.remote.media(val.val(), function(media) {
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
    var overlayCss = ".pw_protected_video_overlay {" +
      "position: absolute;" +
      "width: " + video.width() + "px;" +
      "height: " + video.height() + "px;" +
      "top: 0;" +
      "left: 0;" +
      "background-color: #333;" +
      "text-align: center;" +
      "}" +

      ".pw_protected_video_text {" +
      "color: #fff;" +
      "font-family: Open Sans,Arial,sans-serif;" +
      "font-weight: 300;" +
      "font-size: 28px;" +
      "}" +

      ".pw_protected_password {" +
      "border: 0;" +
      "border-radius: 0;" +
      "margin: 0;" +
      "padding: 0 8px;" +
      "outline: none;" +
      "height: 40px;" +
      "width: 150px;" +
      "line-height: 40px;" +
      "font-size: 16px;" +
      "vertical-align: top;" +
      "}" +
      
      ".pw_protected_submit {" +
      "border: 0;" +
      "border-radius: 0;" +
      "cursor: pointer;" +
      "font-family: Open Sans,Arial,sans-serif;" +
      "font-size: 16px;" +
      "background: #6c9cbb" +
      "letter-spacing: 2px;" +
      "font-weight: 600;" +
      "display: inline-block;" +
      "height: 40px;" +
      "line-height: 40px;" +
      "color: #fff;" +
      "margin: 0;" +
      "padding: 0 4px;" +
      "outline: none;" +
      "zoom: 1;" +
      "text-transform: uppercase;" +
      "vertical-align: top;" +
      "}" +
      
      ".pw_protected_challenge_container {" +
      "margin-left: auto;" +
      "margin-right: auto;" +
      "margin-top: " + parseInt(video.height() / 4) + "px;" +
      "}";

    overlayCssElement = Wistia.util.addInlineCss(document.body, overlayCss);
    overlayCssElement.id = 'pw_protected_video_css';
  }

  var overlay = document.createElement('div');
  overlay.className = 'pw_protected_video_overlay';

  var challengeContainer = document.createElement('form');
  challengeContainer.onsubmit = checkPassword;

  var text = document.createElement('p');
  text.className = 'pw_protected_video_text';
  text.innerHTML = options.challenge;
  challengeContainer.appendChild(text);

  var passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.className = 'pw_protected_password';
  challengeContainer.appendChild(passwordInput);

  var submitButton = document.createElement('input');
  submitButton.type = 'button';
  submitButton.id = 'submit';
  submitButton.value = 'Submit';
  submitButton.onclick = checkPassword;
  submitButton.className = 'pw_protected_submit';
  challengeContainer.appendChild(submitButton);

  challengeContainer.className = 'pw_protected_challenge_container';
  overlay.appendChild(challengeContainer);


  // Cool plugin stuff goes here.
  video.grid.top_inside.appendChild(overlay);

  // Return an object with a public interface 
  // for the plugin, if you want.
  return {};
});
