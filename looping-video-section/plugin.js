$(document).ready(function() {
  // Set initial variables
    var st;
    var et;
  // Clear variables
  var clearVariables = function() {
    st = null;
    et = null;
    $("#starttime").val("");
    $("#endtime").val("");
  }; 
  
  $("#clear").click(function() {
    clearVariables();
  });

  // Adding checks to ensure the stuff entered into the inputs is actually text -- clear it if not
    var checkStart = function() {
    if (!isNaN(parseInt(st, 10))) {
      console.log("st = " + st);
      if (et == undefined || st < et) {
      }
      else {
          alert("Your start time must be before your end time");
          $("#starttime").val("");
      }
    }
    else {
      alert("That's not a number, silly. Put a number in this time!");
      $("#starttime").val("");
    }};

    var checkEnd = function() {
      if (!isNaN(parseInt(et, 10))) {
        console.log("et = " + et);
        if (st == undefined || et > st) {          
        }
        else {
          alert("Your end time must be after your start time");
          $("#endtime").val("");
        }
      }
      else {
        alert("That's not a number, silly. Put a number in this time!");
        $("#endtime").val("");
      }
    };
  // Check to see if value entered is longer than the actual video in seconds
  var tooManySecondsStart = function(s) {
    if (s > wistiaEmbed.duration()) {
      alert("Hey now, that's more seconds than your video has!");
      $("#starttime").val("");
    }
  };

  var tooManySecondsEnd = function(s) {
    if (s > wistiaEmbed.duration()) {
      alert("Hey now, that's more seconds than your video has!");
      $("#endtime").val("");
    }
  };

  // Update times based on text field inputs
    var setStart = function() {
      st = parseInt($("#starttime").val(), 10);
      checkStart();
      tooManySecondsStart(st);
    };

    var setEnd = function() {
      et = parseInt($("#endtime").val(), 10);
      checkEnd();
      tooManySecondsEnd(et);
    };

    $("#startinput").submit(function(s) {
      s.preventDefault();
      setStart();
      return false;
    });

    $("#endinput").submit(function(e) {
      e.preventDefault();
      setEnd();
      return false;
    });

  // Testing command to check what variables are set as
  var runChecks = function() {
    console.log("st = " + st);
    console.log("et = " + et);
  };
  // reset to start time
  var goToStart = function() {
    wistiaEmbed.time(st);
    wistiaEmbed.play();
  };
  // Whenever you hit the end time, reset the player to the start time and play it
  wistiaEmbed.bind("secondchange", function (s) {
    if(s === et) {
      goToStart();
    }
  });
  // If outside of the specified range, reset to start time
  var inRange = function() {
    if (wistiaEmbed.time() < st || wistiaEmbed.time() > et) {
      wistiaEmbed.time(st);
    }
  };
  // Run the check for range every time the player is seeked
  wistiaEmbed.bind("seek", function() {
    inRange();
  });
  // make sure you're playing in the loop zone
  wistiaEmbed.bind("play", function() {
    inRange();
  });
});