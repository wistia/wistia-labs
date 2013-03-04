Wistia.plugin("chapters", function(video, options) {

  function goToChapter(chapter_number) {
    wistiaEmbed.time(options["ch_" + chapter_number.toString() + "_time"]);
    return false;
  }


  // Return an object with a public interface 
  // for the plugin, if you want.
  return {
    goToChapter: goToChapter
  };


});


// wistiaEmbed.plugin.chapters.goToChapter()


