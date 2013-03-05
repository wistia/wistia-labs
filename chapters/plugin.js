Wistia.plugin("chapters", function(video, options) {
  var uuid = Wistia.seqId();

  function getNumChapters() {
    var count = 0;
    while (options["ch_" + (count + 1).toString() + "_time"]) {
      count++;
    }
    return count;
  }

  function goToChapter(chapter_number) {
    wistiaEmbed.time(options["ch_" + chapter_number.toString() + "_time"]);
    return false;
  }

  function getChapterListCSS() {
    var css = "#" + uuid + "{";
    css += "width: " + options["width"] + ";";
    css += "height: 100%;";
    css += "max-height: 100%;";
    css += "background: #fff;";
    css += "overflow: scroll;";
    css += "}";

    css += "#" + uuid + " ul a:hover {";
    css += "color: #fff;";
    css += "}";

    css += "#" + uuid + " ul {";
    css += "padding-top: 0px;";
    css += "margin-top: 0px;";
    css += "margin-bottom: 0px;";
    css += "padding-bottom: 0px;";
    css += "list-style-type: none;";
    css += "}";

    css += "#" + uuid + " ul li {";
    css += "padding-top: 12px;";
    css += "padding-bottom: 12px;";
    css += "margin-left: -40px;";
    css += "padding-left: 8px;";
    css += "}";

    css += "#" + uuid + " ul li:hover {";
    css += "background: #333;";
    css += "}";
    return css;
  }

  function secondsToTime(seconds) {
    var mins = Math.floor(seconds / 60).toString();
    var secs = (seconds % 60);
    if (secs < 10)
      secs = "0" + secs.toString();
    else
      secs = secs.toString();
    return mins + ":" + secs;
  }

  function showChapterList() {
    var chapter_list_html = '<ul class="wistia_chapters_list">'
    for (var i = 1; i <= getNumChapters(); i++) {
      chapter_list_html += '<a href="#" onclick="javascript:wistiaEmbed.plugin.chapters.goToChapter(' + i.toString() + '); return false;">';

      chapter_list_html += '<li class="wistia_chapter_item">';
      if (options["show_timestamps"] == "yes") {
        chapter_list_html += "(" + secondsToTime(options["ch_" + i.toString() + "_time"]) + ") ";
      }
      chapter_list_html += options["ch_" + (i).toString() + "_title"];
      chapter_list_html += '</li>';
      chapter_list_html += '</a>';

    }
    chapter_list_html += '</ul>';
    var chapter_list_div = document.createElement('div', document);
    chapter_list_div.id = uuid;
    chapter_list_div.innerHTML = chapter_list_html;

    location_obj = wistiaEmbed.grid.right;
    if (options["location"] == "left") {
      location_obj = wistiaEmbed.grid.left
    }
    location_obj.appendChild(chapter_list_div);

    Wistia.util.addInlineCss(chapter_list_div, getChapterListCSS());
  }
  function hideChapterList() {

  }

  // Return an object with a public interface
  // for the plugin, if you want.
  return {
    goToChapter: goToChapter,
    getNumChapters: getNumChapters, // This can be private once we're done.
    showChapterList: showChapterList
  };
});
