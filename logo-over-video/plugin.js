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
  var logo_link = options.logoLink || "javascript: void(0)";
  var logo_link_title = options.logoTitle || null;
  var grid_pos = options.pos || 'right_inside';
  var x_off = options.xOffset ? (options.xOffset + 'px') : '10px';
  var y_off = options.yOffset ? (options.yOffset + 'px') : '10px';
  var w_logo = options.w || '100%';
  var h_logo = options.h || 'auto';

  // Three element handles, used in the logic below.
  var root_elem, logo_elem, link_elem;

  // Create the elements.
  link_elem = document.createElement('a');
  logo_elem = document.createElement('img');

  // Set classes.
  link_elem.className = 'wistia-video-logo';
  logo_elem.className = 'wistia-video-logo';

  // A handle at the base of the tree.
  link_elem.appendChild(logo_elem);
  root_elem = link_elem;

  // Load and configure the logo image.
  function loadLogoImage(src) {
    log("setting logo src");
    logo_elem.src = src;
  }

  // Helper setting logo opacity.
  function setOpacity(value) {
    if (((value = parseFloat(value)) >= 0) && (value <= 1)) {
      log("Setting logo opacity:", value);
      logo_elem.style.opacity = value;
      // For old IE and other things that are terrible.
      logo_elem.style.filter = "alpha(opacity=" + Math.round(100*value) + ")";
    }
  };

  // Bind hover events
  function bindHoverEvents(){
    log("Adding mouse over/out events.");
    logo_elem.addEventListener("mouseover", function(event) {
      setOpacity(logo_hover_opacity);
    });
    logo_elem.addEventListener("mouseout", function(event) {
      setOpacity(logo_opacity);
    });
  }

  // Set the logo position.
  function positionLogo(xo, yo, grid){
    xo = parseInt(xo);
    yo = parseInt(yo);

    log("Positioning the logo element.", [xo, yo], grid);
    logo_elem.style.position = "absolute";


    // Unset positioning styles.
    logo_elem.style.removeProperty('right');
    logo_elem.style.removeProperty('left');
    logo_elem.style.removeProperty('top');
    logo_elem.style.removeProperty('bottom');

    // Use the correct offset coordinates based on the grid position.
    switch(grid){
      case 'top_inside':
        logo_elem.style.left = xo + 'px';
        logo_elem.style.top = yo + 'px';
        break;
      case 'right_inside':
        logo_elem.style.right = xo + 'px';
        logo_elem.style.top = yo + 'px';
        break;
      case 'bottom_inside':
        logo_elem.style.right = xo + 'px';
        logo_elem.style.bottom = yo + 'px';
        break;
      case 'left_inside':
        logo_elem.style.left = xo + 'px';
        logo_elem.style.bottom = yo + 'px';
        break;
    };

    // Try to update the element position and grid.
    try {
      // Remove if attached the previous grid element.
      if (root_elem.parentNode == video.grid[grid_pos]) {
        video.grid[grid_pos].removeChild(root_elem);
      }
      // Update the grid position and append the logo.
      grid_pos = grid;
      video.grid[grid_pos].appendChild(root_elem);
    } catch(err){
      log(err);
    }
  }

  // Append the logo element to the video grid.
  function injectLogo(){
    if (root_elem.parentNode == video.grid[grid_pos]) {
      log("logo element already present in grid.");
      video.grid[grid_pos].removeChild(root_elem);
    } else {
      log("injecting logo element into video grid.", grid_pos);
      video.grid[grid_pos].appendChild(root_elem);
    }
  }

  function defaultOpacity(a){
    log("changing opacity", a);
    logo_opacity = parseFloat(a);
    setOpacity(a)
  }

  function hoverOpacity(a){
    log("changing hover opacity", a);
    logo_hover_opacity = parseFloat(a);
  }

  function setLogo(new_logo_url, new_link_url, new_link_title) {
    log("setting the logo url.", new_logo_url);
    if (new_logo_url) {
      logo_elem.src = new_logo_url;
    }
    setLink(new_link_url, new_link_title);
  }

  function setLink(new_link_url, new_link_title) {
    log("setting the logo link.", new_link_url, new_link_title);
    if (new_link_url) {
      link_elem.href = new_link_url;
      link_elem.target = '_blank';
    }
    if (new_link_title) {
      link_elem.title = new_link_title;
    }
  }

  // Initialize....
  loadLogoImage(logo_url);
  bindHoverEvents();
  positionLogo(x_off, y_off, grid_pos);
  setLink(logo_link, logo_link_title);
  injectLogo();
  setOpacity(logo_opacity);

  // Return public interface.
  return {
    // logo position
    pos: positionLogo, // (x, y, grid)

    // logo opacity.
    opacity:        setOpacity,     // non-persistent
    defaultOpacity: defaultOpacity, // persistent
    hoverOpacity:   hoverOpacity,   // persistent

    // logo URL, link URL, link title.
    setLogo: setLogo, // (url, [link, [title]])
    setLink: setLink  // (link, [title])
  };
});
