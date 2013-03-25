window.jsFileName = 'plugin.js'
window.jsProductionPath = 'fast.wistia.com/labs/pw-protected-videos'

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
            src: pluginSrc(sourceEmbedCode),
            seed: random,
            challenge: $('#challenge').val()
          });

          // replace the output with a dummy video
          outputEmbedCode.hashedId(DUMMY_HASHED_ID);

          if (Wistia.EmbedCode.isApi(outputEmbedCode)) {
            outputEmbedCode.containerId("wistia_protected_" + random);
          }

          // Display the output.
          $("#output_embed_code").val(outputEmbedCode.toString());
          outputEmbedCode.previewInElem("preview", { type: "api" });
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
    $("#configure").on("click", "#update_password", function(e) {
      debounceUpdateOutput();
      e.preventDefault();
    });

    // Example stuff
    if (!Wistia.localStorage("videoFoam.cleared")) {
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
    } else {
      $(".show_example_text").show();
      $(".clear_example_text").hide();
    }

    $("#clear_example").click(function(event) {
      event.preventDefault();
      resetInterface();
      $(".show_example_text").show();
      $(".clear_example_text").hide();
      Wistia.localStorage("videoFoam.cleared", true);
    });

    $("#show_example").click(function(event) {
      event.preventDefault();
      showExample();
      $(".show_example_text").hide();
      $(".clear_example_text").show();
      Wistia.localStorage("videoFoam.cleared", false);
    });
  });
};

window.resetInterface = function() {
  $("#source_embed_code").val("");
  $("#challenge").val("Enter the password to view this video.");
  $("#password").val("Enter password");
  $("#preview").html('<div id="placeholder_preview">Your video here</div>');
};

window.showExample = function() {
  resetInterface();
  $("#source_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/c0bcb3b617?playerColor=81b7db&version=v1&videoHeight=304&videoWidth=540\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"540\" height=\"304\"></iframe>");
  $("#output_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/fc5eec8d82?playerColor=81b7db&version=v1&videoHeight=304&videoWidth=540&plugin%5BpasswordProtected%5D%5Bsrc%5D=http%3A%2F%2Flocalhost%3A8000%2Fpw-protected-videos%2Fplugin.js&plugin%5BpasswordProtected%5D%5Bseed%5D=IbnTUGfO9hv1zklq4h9b&plugin%5BpasswordProtected%5D%5Bchallenge%5D=Enter%20the%20password%20to%20view%20this%20video&plugin%5BpasswordProtected%5D%5BdontSavePassword%5D=true\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"540\" height=\"304\"></iframe>");
  var outputEmbedCode = Wistia.EmbedCode.parse($("#output_embed_code").val());
  outputEmbedCode.previewInElem("preview");
  $("#challenge").val("Enter the password to view this video.");
  $("#password").val("wistia");
};
