Wistia.plugin("passwordProtected", function(video, options) {

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

  Wistia.util.addInlineCss(document.body, fontCss);

  function checkPassword(e) {
    Wistia.remote.script('http://localhost:8000/pw-protected-videos/sha256.js', function() {
      var hashedPw = Sha256.hash(passwordInput.value);

      Wistia.remote.script('http://localhost:8000/pw-protected-videos/firebase_client.js', function() {
        var fb = new FirebaseClient('https://pw-protected-videos.firebaseIO.com/', {
          initCallback: function() {
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
        });
      });
    });

    e.preventDefault();
  }

  var overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.width = video.width() + 'px';
  overlay.style.height = video.height() + 'px';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style['background-color'] = '#333';
  overlay.style['text-align'] = 'center';

  var challengeContainer = document.createElement('form');
  challengeContainer.onsubmit = checkPassword;

  var text = document.createElement('p');
  text.style.color = '#fff';
  text.style['font-family'] = 'Open Sans,Arial,sans-serif';
  text.style['font-weight'] = 300;
  text.style['font-size'] = '28px';
  text.innerHTML = 'This video is password protected';
  challengeContainer.appendChild(text);

  var passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.style.border = 0;
  passwordInput.style['border-radius'] = 0;
  passwordInput.style.margin = 0;
  passwordInput.style.padding = '0 8px';
  passwordInput.style.outline = 'none';
  passwordInput.style.height = '40px';
  passwordInput.style.width = '150px';
  passwordInput.style['line-height'] = '40px';
  passwordInput.style['font-size'] = '16px';
  passwordInput.style['vertical-align'] = 'top';
  challengeContainer.appendChild(passwordInput);

  var submitButton = document.createElement('input');
  submitButton.type = 'button';
  submitButton.id = 'submit';
  submitButton.value = 'Submit';
  submitButton.onclick = checkPassword;
  submitButton.style.border = 0;
  submitButton.style['border-radius'] = 0;
  submitButton.style.cursor = 'pointer';
  submitButton.style['font-family'] = 'Open Sans,Arial,sans-serif';
  submitButton.style['font-size'] = '16px';
  submitButton.style.background = '#6c9cbb';
  submitButton.style['letter-spacing'] = '2px';
  submitButton.style['font-weight'] = 600;
  submitButton.style.display = 'inline-block';
  submitButton.style.height = '40px';
  submitButton.style['line-height'] = '40px';
  submitButton.style.color = '#fff';
  submitButton.style.margin = 0;
  submitButton.style.outline = 'none';
  submitButton.style.zoom = 1;
  submitButton.style['text-transform'] = 'uppercase';
  submitButton.style['vertical-align'] = 'top';
  submitButton.style.padding = '0 4px';

  challengeContainer.appendChild(submitButton);

  challengeContainer.style['margin-left'] = 'auto';
  challengeContainer.style['margin-right'] = 'auto';
  overlay.appendChild(challengeContainer);
  challengeContainer.style['margin-top'] = parseInt((video.height() / 4)) + 'px';


  // Cool plugin stuff goes here.
  video.grid.top_inside.appendChild(overlay);

  // Return an object with a public interface 
  // for the plugin, if you want.
  return {};
});
