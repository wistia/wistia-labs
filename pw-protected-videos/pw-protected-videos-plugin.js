Wistia.plugin("passwordProtected", function(video, options) {

  function checkPassword(e) {
    Wistia.remote.script('http://localhost:8000/pw-protected-videos/sha256.js', function() {
      var hashedPw = Sha256.hash(passwordInput.value);

      Wistia.remote.script('http://localhost:8000/pw-protected-videos/firebase_client.js', function() {
        var fb = new FirebaseClient('https://pw-protected-videos.firebaseIO.com/', {
          initCallback: function() {
            console.log(fb);
            var hashedId = fb.read(options.seed + hashedPw, function(val) {
              overlay.style.display = 'none';
              console.log(val.val());
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
  overlay.style['background-color'] = '#fff';
  overlay.style['text-align'] = 'center';

  var challengeContainer = document.createElement('div');

  var text = document.createElement('p');
  text.innerHTML = 'Please enter a password to see this video';
  challengeContainer.appendChild(text);

  var passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'the_password';
  challengeContainer.appendChild(passwordInput);

  var submitButton = document.createElement('input');
  submitButton.type = 'button';
  submitButton.id = 'submit';
  submitButton.value = 'Submit';
  submitButton.onclick = checkPassword;
  challengeContainer.appendChild(submitButton);

  challengeContainer.style['margin-left'] = 'auto';
  challengeContainer.style['margin-right'] = 'auto';
  overlay.appendChild(challengeContainer);
  challengeContainer.style['margin-top'] = (parseInt((video.height() / 2)) - parseInt(challengeContainer.style.height / 2)) + 'px';


  // Cool plugin stuff goes here.
  video.grid.top_inside.appendChild(overlay);

  // Return an object with a public interface 
  // for the plugin, if you want.
  return {};
});
