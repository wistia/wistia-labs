function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

var FIREBASE_AUTH_TOKEN = 'z69Xs2mftj0chWxDVKxz2arq8yoWpDxqisExOrJ3';
var DUMMY_HASHED_ID = 'fc5eec8d82';

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {
    var fb = new FirebaseClient('https://pw-protected-videos.firebaseIO.com/', {
        authToken: FIREBASE_AUTH_TOKEN,
        failedAuthCallback: function(error) {
          $("#preview").html('<div id="placeholder_preview">Error authenticating with data store.</div>');
        },
        successfulAuthCallback: function(result) {
          var random = randomString(20);
          var hashedPw = Sha256.hash($('#password').val());
          var fbKey = random + hashedPw;
          fb.write(fbKey, sourceEmbedCode.hashedId());

          // Set custom options on the embed code.
          outputEmbedCode.setOption("plugin.passwordProtected", {
            src: "http://localhost:8000/pw-protected-videos/pw-protected-videos-plugin.js",
            seed: random
          });

          // replace the output with a dummy video
          outputEmbedCode.hashedId(DUMMY_HASHED_ID);

          // Display the output.
          $("#output_embed_code").val(outputEmbedCode.toString());
          outputEmbedCode.previewInElem("preview");
        }
    });

  } else {

    // Show an error if invalid. We can be more specific 
    // if we expect a certain problem.
    $("#output_embed_code").val("Please enter a valid Wistia embed code.");
    $("#preview").html('<div id="placeholder_preview">Your video here</div>');
  }
}


// Updating is kind of a heavy operation; we don't want to 
// do it on every single keystroke.
var updateOutputTimeout;
function debounceUpdateOutput() {
  clearTimeout(updateOutputTimeout);
  updateOutputTimeout = setTimeout(updateOutput, 500);
}


// Assign all DOM bindings on doc-ready in here. We can also 
// run whatever initialization code we might need.
window.setupLabInterface = function($) {
  $(function() {
    // Update the output whenever the user clicks the update button.
    $("#configure")
      .on("click", "#update_password", function(e) {
        debounceUpdateOutput();
        e.preventDefault();
      });
  });
};
