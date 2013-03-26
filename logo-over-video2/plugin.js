Wistia.plugin("logoOverVideo", function(video, options) {
  var self = this;

  var debug = options.debug || false;
  function log(){
    if (debug && (console !== undefined)) { console.log.apply(console, arguments); }
  };

  log("Debug:", video, options);

  var logo_url = options.logoUrl || null;
  var logo_opacity = options.opacity || 0.33;
  var logo_hover_opacity = options.hoverOpacity || 0.9;
  var logo_link = options.logoLink || null;
  var logo_link_title = options.logoTitle || null;
  var grid_pos = options.pos || 'right_inside';
  var x_off = options.xOffset ? (options.xOffset + 'px') : '10px';
  var y_off = options.yOffset ? (options.yOffset + 'px') : '10px';
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
      logo_img_elem.className = 'wistia-video-logo';
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
  function positionLogo(xo, yo, grid){
    log("Positioning the logo element.", [xo, yo], grid);
    logo_elem.style.position = "absolute";
    //logo_elem.style.right = parseInt(xo) + 'px';
    //logo_elem.style.top = parseInt(yo) + 'px';

    // Unset positioning styles.
    logo_elem.style.removeProperty('right');
    logo_elem.style.removeProperty('left');
    logo_elem.style.removeProperty('top');
    logo_elem.style.removeProperty('bottom');

    // XXX: Verify coordinate mappings.
    // Use the correct offset coordinates based on the grid position.
    switch(grid){
      case 'top_inside':
        logo_elem.style.left = parseInt(xo) + 'px';
        logo_elem.style.top = parseInt(yo) + 'px';
        break;
      case 'right_inside':
        logo_elem.style.right = parseInt(xo) + 'px';
        logo_elem.style.top = parseInt(yo) + 'px';
        break;
      case 'bottom_inside':
        logo_elem.style.right = parseInt(xo) + 'px';
        logo_elem.style.bottom = parseInt(yo) + 'px';
        break;
      case 'left_inside':
        logo_elem.style.left = parseInt(xo) + 'px';
        logo_elem.style.bottom = parseInt(yo) + 'px';
        break;
    };

    // XXX: Refactor.
    // Re-inject if a grid position is specified.
    if (grid !== undefined) {
      log("Updating video grid position.");
      // TODO: Handle unlinked elements.
      try {
        if (link_elem.parentNode == video.grid[grid_pos]) {
          video.grid[grid_pos].removeChild(link_elem);
        }
        grid_pos = grid;
        video.grid[grid_pos].appendChild(link_elem);
      } catch(err){ log(err); }
    }
  }

  // XXX: Changing the link to url via the interface will break due to nested element wrapping.
  // Wrap the logo with an anchor, if a link was specified.
  function linkLogo(){
    if (logo_link !== null) {
      log('Wrapping img with link:', logo_link);
      link_elem = document.createElement('a');
      link_elem.href = logo_link;
      link_elem.target = '_blank';
      link_elem.className = 'wistia-video-logo';

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
  positionLogo(x_off, y_off, grid_pos);

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
