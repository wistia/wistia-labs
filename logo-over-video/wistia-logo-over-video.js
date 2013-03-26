Wistia.plugin("logoOverVideo", function(video, options) {
  var self = this;

  var debug = options.debug || false;
  function log(){
    if (debug && (console !== undefined)) { console.log.apply(console, arguments); }
  };

  log("Debug:", video, options);

  var logo_url = options.logoUrl || null;
  var logo_opacity = options.opacity || null;
  var logo_hover_opacity = options.hoverOpacity || null;
  var logo_link = options.logoLink || null;
  var logo_link_title = options.logoTitle || null;
  var grid_pos = options.pos || 'right_inside';
  var x_off = options.xOffset + 'px' || '10px';
  var y_off = options.yOffset + 'px' || '10px';
  var w_logo = options.w || '100%';
  var h_logo = options.h || 'auto';

  var logo_elem, logo_img_elem, link_elem;

  // Load and configure the logo image.
  function loadLogoImage() {
    logo_elem = document.createElement('img');
    logo_img_elem = logo_elem;
    logo_elem.src = logo_url;
  }

  // Helper setting logo opacity.
  function setOpacity(value) {
    log("Setting logo opacity:", value);
    if (value !== null) {
      logo_img_elem.style.opacity = value;
      // For old IE and other things that are terrible.
      logo_img_elem.style.filter = "alpha(opacity=" + Math.round(100*value) + ")";
    }
  };

  // Bind hover events
  function bindHoverEvents(){
    if (logo_hover_opacity !== null) {
      log("Adding mouse over events.");
      logo_elem.addEventListener("mouseover", function(event) {
        setOpacity(logo_hover_opacity);
        return false;
      });
      logo_elem.addEventListener("mouseout", function(event) {
        setOpacity(logo_opacity);
        return false;
      });
    }
  }

  // Set the logo position.
  function positionLogo(xo, yo){
    log("Positioning the logo element.", [xo, yo]);
    logo_elem.style.position = "absolute";
    logo_elem.style.right = parseInt(xo) + 'px';
    logo_elem.style.top = parseInt(yo) + 'px';
  }

  // XXX: Changing the link to url via the interface will break due to nested element wrapping.
  // Wrap the logo with an anchor, if a link was specified.
  function linkLogo(){
    if (logo_link !== null) {
      log('Wrapping img with link:', logo_link);
      link_elem = document.createElement('a');
      link_elem.href = logo_link;
      link_elem.target = '_blank';

      // Set the title, if one is supplied.
      if (logo_link_title !== null) {
        link_elem.title = logo_link_title;
      }

      //link_elem.appendChild(logo_elem);
      //logo_elem = a_elem;
    }
  }

  // Append the logo element via the API.
  function injectLogo(){
    if (video.grid[grid_pos] !== undefined){
      log("Injecting the logo image into the Wistia embed.");
      if (link_elem) {
        link_elem.appendChild(logo_elem);
        video.grid[grid_pos].appendChild(link_elem);
      } else {
        video.grid[grid_pos].appendChild(logo_elem);
      }
    }
  }

  function testFunc(x){
    console.log("Testing function!", x);
    console.log(options);
  }

  function defaultOpacity(a){
    log("changing opacity", a);
    logo_opacity = parseFloat(a);
    setOpacity(a)
  }

  // TODO: Adjust if mouse if over?
  function hoverOpacity(a){
    log("changing hover opacity", a);
    logo_hover_opacity = parseFloat(a);
  }


  // Load the logo image.
  loadLogoImage();

  // Bind logo hover events.
  bindHoverEvents();

  // Set the position of the logo element.
  positionLogo(x_off, y_off);

  // Set the logo link, if specified.
  linkLogo();

  // Inject the logo into the wistia embed.
  injectLogo();

  // Set the opacity of the logo.
  setOpacity(logo_opacity);

  // Return an object with a public interface 
  // for the plugin, if you want.
  return {
    testfunc: testFunc,

    // Position
    pos: positionLogo,

    // Opacity.
    opacity: setOpacity,
    defaultOpacity: defaultOpacity,
    hoverOpacity: hoverOpacity,
  };
});
