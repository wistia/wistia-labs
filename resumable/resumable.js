Wistia.plugin("resumable", function(video, options) {
  video.ready( function() {
    
    function resumable_key() {
      return [location.href, video.hashedId(), "resume_time"];
    }

    function set_resume_time(t) {  
      Wistia.localStorage(resumable_key(), t);
    }

    function resume_css() {
      return "#ScreenResume {color: rgb(255, 255, 255); display: block; font-family: 'Open Sans', Arial, sans-serif; font-size: 19px; font-weight: bold; height: 52px; letter-spacing: 1px; line-height: 26.59375px; margin-bottom: 17px; text-align: center; white-space: normal; width: 260px; text-align: center; -webkit-box-shadow: rgba(0, 0, 0, 0.901961) 0px 0px 218px 30px inset; -webkit-transition-delay: 0s; -webkit-transition-duration: 0.6000000238418579s; -webkit-transition-property: left; -webkit-transition-timing-function: cubic-bezier(0.42, 0, 0.58, 1); background-color: rgba(48, 48, 48, 0.819608); box-shadow: rgba(0, 0, 0, 0.901961) 0px 0px 218px 30px inset;} #ScreenResume #resume_play {width: 80px; height: 120px;} #ScreenResume #resume_play #resume_play_arrow {width: 80px; height: 80px; background-image: url(http://localhost:8000/resumable/play-icon.png);} #ScreenResume #resume_play:hover #resume_play_arrow {background-position:0px -80px;} #ScreenResume #resume_skip {width: 80px; height: 120px;} #ScreenResume #resume_skip #resume_skip_arrow {width: 80px; height: 80px; background-image: url(http://localhost:8000/resumable/skip-icon.png);} #ScreenResume #resume_skip:hover #resume_skip_arrow {background-position: 0px -80px;} #resume_play, #resume_skip {font-size: 15px; font-style: italic; font-weight: normal; line-height: 15px;}";
    }

    var resume_time;

    if (resume_time = Wistia.localStorage(resumable_key())) {
      var ResumeScreen = document.createElement("div");
      ResumeScreen.id = "ScreenResume";
      ResumeScreen.style.position = "absolute";
      ResumeScreen.style.top = "0px";
      ResumeScreen.style.left = "0px";
      ResumeScreen.style.width = video.videoWidth() + "px";
      ResumeScreen.style.height = video.videoHeight() + "px";
      ResumeScreen.innerHTML = "<br /><br />It looks like you've watched<br />part of this video before!<br /><div id='resume_play' style='display: inline-block; padding: 0 30px;'><div id='resume_play_arrow'></div>Watch from the beginning</div><div id='resume_skip' style='display: inline-block; padding: 0 30px;'><div id='resume_skip_arrow'></div>Skip to where you left off</div>";
      video.grid.top_inside.appendChild(ResumeScreen);
      Wistia.util.addInlineCss(ResumeScreen, resume_css());
      resume_play = document.getElementById("resume_play");
      resume_skip = document.getElementById("resume_skip");

      resume_skip.onclick = function() {
        var par;
        if (par = ResumeScreen.parentNode) {
          par.removeChild(ResumeScreen);
          ResumeScreen = null;
          video.time(resume_time).play();
        }
      }

      resume_play.onclick = function() {
        var par;
        if (par = ResumeScreen.parentNode) {
          par.removeChild(ResumeScreen);
          ResumeScreen = null;
          video.play();
        }
      }
    }

    else {
      set_resume_time(0);
    }
    
    video.bind("timechange", function(t) {
      set_resume_time(t);
    });

    video.bind("end", function() {
      set_resume_time(0);
    });

  });
  return {};
});
