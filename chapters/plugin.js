Wistia.plugin("chapters", function(video, options) {
  var uuid = Wistia.seqId();
  var chapterListCreated = false;

  function getNumChapters() {
    var count = 0;
    while (options["ch_" + (count + 1).toString() + "_time"]) {
      count++;
    }
    return count;
  }

  function goToChapter(chapterNumber) {
    video.time(options["ch_" + chapterNumber.toString() + "_time"]);
    return false;
  }

  function getChapterListCss() {
    var css = "#" + uuid + "{\n";
    css += "width: " + options["width"] + ";\n";
    css += "height: " + (video.videoHeight() - 6).toString() + "px;\n";
    css += "max-height: " + (video.videoHeight() - 6).toString() + "px;\n";
    css += "background: #fff;\n";
    css += "overflow: scroll;\n";
    css += "border-top: 3px solid #" + video.params.playerColor + ";\n";
    css += "border-right: 3px solid #" + video.params.playerColor + ";\n";
    css += "border-bottom: 3px solid #" + video.params.playerColor + ";\n";
    css += "}\n";

    css += "#" + uuid + " ul a {\n";
    css += "color: #555;\n";
    css += "}\n";

    css += "#" + uuid + " ul a:hover {\n";
    css += "color: #000;\n";
    css += "}\n";

    css += "#" + uuid + " ul {\n";
    css += "padding-top: 0px;\n";
    css += "margin-top: 0px;\n";
    css += "margin-bottom: 0px;\n";
    css += "padding-bottom: 0px;\n";
    css += "list-style-type: none;\n";
    css += "}\n";

    css += "#" + uuid + " ul li {\n";
    css += "padding-top: 12px;\n";
    css += "padding-bottom: 12px;\n";
    css += "margin-left: -40px;\n";
    css += "padding-left: 18px;\n";
    css += "padding-right: 18px;\n";
    css += "line-height: 18px;\n";
    css += "}\n";

    css += "#" + uuid + " ul li:hover {\n";
    css += "background: #ebedef;\n";
    css += "}\n";

    return css;
  }

  var styleElem;
  function addCss() {
    styleElem = Wistia.util.addInlineCss(document.getElementById(uuid), getChapterListCss());
  }

  function removeCss() {
    var par;
    if (styleElem && (par = styleElem.parentNode)) {
      par.removeChild(styleElem);
      styleElem = null;
    }
  }

  function refreshCss() {
    removeCss();
    addCss();
  }

  function secondsToTime(seconds) {
    var mins = Math.floor(seconds / 60).toString();
    var secs = (seconds % 60);
    if (secs < 10) {
      secs = "0" + secs.toString();
    } else {
      secs = secs.toString();
    }
    return mins + ":" + secs;
  }

  function createChapterList() {
    var locationObj;
    if (options.location == "left") {
      locationObj = video.grid.left;
    } else {
      locationObj = video.grid.right;
    }

    var chapterListHtml = '<ul class="wistia_chapters_list">'
    for (var i = 1; i <= getNumChapters(); i++) {
      chapterListHtml += '<a href="#" id="' + uuid + '_chapter_' + i + '">';

      chapterListHtml += '<li class="wistia_chapter_item">';
      if (options["show_timestamps"] == "yes") {
        chapterListHtml += "(" + secondsToTime(options["ch_" + i.toString() + "_time"]) + ") ";
      }
      chapterListHtml += options["ch_" + (i).toString() + "_title"];
      chapterListHtml += '</li>';
      chapterListHtml += '</a>';

    }
    chapterListHtml += '</ul>';
    var chapterListDiv = document.createElement('div');
    chapterListDiv.id = uuid;
    chapterListDiv.innerHTML = chapterListHtml;

    locationObj.appendChild(chapterListDiv);
    refreshCss();

    for (var i = 1; i <= getNumChapters(); i++) {
      chapterLink = document.getElementById(uuid + "_chapter_" + i);
      (function(i) {
        chapterLink.onclick = function() {
          goToChapter(i);
          return false;
        };
      }(i));
    }

    chapterListCreated = true;
  }

  function showChapterList() {
    if (!chapterListCreated)
      createChapterList();
    document.getElementById(uuid).style.display = "block";
  }

  function hideChapterList() {
    document.getElementById(uuid).style.display = "none";
  }

  showChapterList();

  video.bind("widthchanged", refreshCss);
  video.bind("heightchanged", refreshCss);

  // Return an object with a public interface
  // for the plugin, if you want.
  return {
    goToChapter: goToChapter,
    showChapterList: showChapterList,
    hideChapterList: hideChapterList
  };
});

