;(function($) {
  /*
   * Jamjar: Wistia's expandable box solution. Usable anywhere in the Wistia app.
   *
   */
  $.fn.flashSlideDown = function(speed, callback) {
    return $(this).each(function() {
      var $el = $(this);

      // figure out the height we're animating to
      $el.css({ height: "", left: "-99999em", paddingTop: "", paddingBottom: "", position: "absolute" }).show();
      var visibleHeight = $el.height();
      var pt = parseInt($el.css("padding-top"), 10);
      var pb = parseInt($el.css("padding-bottom"), 10);
      $el.css({ height: 0, left: 0, paddingBottom: 0, paddingTop: 0, position: "relative" });

      $el.animate({ height: visibleHeight, paddingTop: pt, paddingBottom: pb }, speed != null ? speed : 200, 'linear', function() {
        $el.height("");
        if (callback) {
          callback.call(this);
        }
      });
    });
  };


  $.fn.flashSlideUp = function(speed, callback) {
    return $(this).each(function() {
      var $el = $(this);
      $el.animate({ height: 0, paddingTop: 0, paddingBottom: 0 }, speed != null ? speed : 200, 'linear', function() {
        $el.css({ left: "-99999em", position: "absolute" });
        if (callback) {
          callback.call(this);
        }
      });
    });
  };

  $.fn.jamjar = function(options) {

    options = $.extend({
      afterClose: function() {},
      afterOpen: function() {},
      beforeClose: function() {},
      beforeOpen: function() {},
      help: null,
      helpOptions: {},
      openOnHover: false,
      subhead: null,
      title: "",
      userCanControl: true
    }, options);

    return $(this).each(function() {
      var $jamjar,
        $head,
        $help,
        $title,
        $subhead,
        $body,
        $foot,
        bubbleSelector,
        $subheadContents,
        titleContents,
        animateSubhead,
        embeddedSubhead;
      $jamjar = $(this);

      // Figure out some defaults for this instance.
      if (options.help) {
        bubbleSelector = $(options.help);
      } else if ($jamjar.find(".help")) {
        bubbleSelector = $jamjar.find(".help");
      }
      if (options.subhead) {
        $subheadContents = $(options.subhead);
      } else if ($jamjar.find(".subhead").length) {
        $subheadContents = $jamjar.find(".subhead");
      }
      if (options.title) {
        titleContents = options.title;
      } else {
        titleContents = $jamjar.attr("title") || "";
      }
      animateSubhead = true;

      // Build jamjar elements.
      $body = $jamjar.find(".jamjar_body").length ? $jamjar.find(".jamjar_body") : $("<div class='jamjar_body'></div>");
      $head = $jamjar.find(".jamjar_head").length ? $jamjar.find(".jamjar_head") : $("<div class='jamjar_head'></div>");
      $title = $jamjar.find(".jamjar_title").length ? $jamjar.find(".jamjar_title") : $("<div class='jamjar_title'></div>");
      $subhead = $jamjar.find(".jamjar_subhead").length ? $jamjar.find(".jamjar_subhead") : $("<div class='jamjar_subsubhead'></div>");
      $help = $jamjar.find(".jamjar_help").length ? $jamjar.find(".jamjar_help") : $("<div class='jamjar_help' style='display:none;'></div>");
      $foot = $jamjar.find(".jamjar_foot").length ? $jamjar.find(".jamjar_foot") : $("<div class='jamjar_foot'>&nbsp;</div>");
      if ($jamjar.find(".jamjar_subhead")) {
        embeddedSubhead = true;
      }
      if (!$jamjar.find(".jamjar_body")) {
        $body.append($jamjar.contents());
      }
      $head.append($title).append($help).append($subhead);
      $jamjar.append($head).append($body).append($foot).addClass("jamjar");

      // Setup title
      $title.html(titleContents);

      // Setup help bubble
      if (bubbleSelector.length && $.fn.mrBubble) {
        $help.show().mrBubble(bubbleSelector, $.extend({
          title: titleContents
        }, options.helpOptions));
      }

      // Setup subhead
      if ($subheadContents) {
        $subhead.append($subheadContents.show());
      } else if (!$jamjar.find(".jamjar_subhead")) {
        $subhead.hide();
      }

      // Define jamjar behavior.
      function isOpen() {
        return !$jamjar.hasClass("jamjar_closed");
      }
      function animatedElems() {
        if (animateSubhead && ($subheadContents || embeddedSubhead)) {
          return $body.add($subhead);
        } else {
          return $body;
        }
      }
      function animatedElemsToOpen() {
        return animatedElems().not(function() {
          if (this === $subhead[0] && parseInt($subhead.css("left"), 10) >= 0) {
            return true;
          }
        });
      }
      function animatedElemsToClose() {
        return animatedElems().not(function() {
          if (this === $subhead[0] && parseInt($subhead.css("left"), 10) < 0) {
            return true;
          }
        });
      }
      function open(event, speed) {
        if ($jamjar.is('.disabled')) {
          return;
        }

        if (options.beforeOpen() !== false) {
          animatedElemsToOpen().stop(true, true).flashSlideDown(speed != null ? speed : 200, function() {
            $jamjar.removeClass("jamjar_closed");
            $jamjar.trigger("opened-jamjar");

            // IE7 and below fails to redraw for some reason.
            // So we just force it.
            if ($.browser.msie && animateSubhead && ($subheadContents || embeddedSubhead)) {
              $subhead.hide();
              $subhead[0].offsetTop;
              $subhead.show();
            }

            options.afterOpen();
          });
        }
      }
      function close(event, speed) {
        if (options.beforeClose() !== false) {
          animatedElemsToClose().stop(true, true).flashSlideUp(speed != null ? speed : 200, function() {
            $jamjar.addClass("jamjar_closed");
            $jamjar.trigger("closed-jamjar");
            options.afterClose();
          });
        }
      }
      function showSubhead() {
        $subhead.flashSlideDown(200);
      }
      function animateSubheadFunc(event, state) {
        animateSubhead = state;
      }
      function clickHead(event) {
        event.preventDefault();
        if (isOpen()) {
          close();
        } else {
          open();
        }
      }

      // Bind jamjar behavior to events.
      $jamjar.bind("open-jamjar", open);
      $jamjar.bind("close-jamjar", close);
      $jamjar.bind("showsubhead-jamjar", showSubhead);
      $jamjar.bind("freezesubhead.jamjar", animateSubheadFunc);
      if (options.userCanControl) {
        var debounceOpenTimeout, debounceCloseTimeout;
        if (options.openOnHover && !/iphone|ipad|ipod|android/i.test(navigator.userAgent)) {
          $title.mouseover(function() {
            clearTimeout(debounceOpenTimeout);
            clearTimeout(debounceOpenTimeout);
            debounceOpenTimeout = setTimeout(function() { open(null, 0); }, 50);
          });
          if ($.browser.msie && $.browser.version < 8) {
            $(document).on('click', function(event) {
              var $elem = $(event.srcElement || event.target);
              if ($elem.closest($title[0]).length === 0 && $elem.closest($jamjar[0]).length === 0) {
                clearTimeout(debounceOpenTimeout);
                clearTimeout(debounceCloseTimeout);
                debounceCloseTimeout = setTimeout(function() { close(null, 0); }, 50);
              }
            });
          } else {
            $jamjar.mouseout(function(event) {
              var $to = $(event.relatedTarget);
              if ($to.closest(".jamjar").length === 0 ) {
                clearTimeout(debounceOpenTimeout);
                clearTimeout(debounceCloseTimeout);
                debounceCloseTimeout = setTimeout(function() { close(null, 0); }, 50);
              }
            });
          }
        } else {
          $head.click(clickHead);
        }
      } else {
        $jamjar.addClass("jamjar_no_control");
      }
    });
  };

  window.actionMenuCookie = function(name) {
    var cookieStr = $.cookie("action_menu_cookies");
    if (window.JSON && cookieStr) {
      return JSON.parse(cookieStr)[name];
    } else {
      return null;
    }
  };

  window.setActionMenuCookie = function(name, val, options) {
    if (!window.JSON) {
      return;
    }
    var cookieStr = $.cookie("action_menu_cookies");
    var cookie = cookieStr ? JSON.parse(cookieStr) : {};
    cookie[name] = val;
    $.cookie("action_menu_cookies", JSON.stringify(cookie), options);
  };

  $.fn.jamjarActionMenu = function(options) {

    options = $.extend({
      name: window.location.pathname.replace(/\//, "_"),
      title: $(this).find(".jamjar_title").html() || "Actions",
      helpOptions: { orientation: "left" },
      openOnHover: true
    }, options);

    $(this).each(function() {
      var $jamjar = $(this);
      $jamjar.jamjar({
        title: options.title,
        helpOptions: options.helpOptions,
        openOnHover: options.openOnHover
      });
      $jamjar.find("ul").each(function() {
        $(this).children(":first").addClass("first");
        $(this).children(":last").addClass("last");
      });
    });
  }

}(jQuery));
