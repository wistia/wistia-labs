
// FirebaseClient is our function that wraps connections to firebase
var FirebaseClient = function(uri, opts) {
  var self = this;
  opts = opts || {};

  Wistia.remote.script('https://cdn.firebase.com/v0/firebase.js', function() {
    self.fb = new Firebase(uri);

    if (opts.authToken) {
      self.fb.auth(opts.authToken, function(error, result) {
        if (error) {
          opts.failedAuthCallback.call(self, error);
        } else {
          opts.successfulAuthCallback.call(self, result);
        }
      });
    }

    self.write = function(key, data) {
      self.fb.child(key).set(data);
    };

    self.read = function(key, callback) {
      self.fb.child(key).on('value', callback);
    };

    if (opts.initCallback) {
      opts.initCallback.call();
    }
  });
};
