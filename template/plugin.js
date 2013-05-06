Wistia.plugin("template", function(video, options) {
  console.log("initializing template plugin for", video.hashedId());
  console.log("options are", options);
  video.ready(function() {
    console.log(video.name(), "is ready");
  });
});
