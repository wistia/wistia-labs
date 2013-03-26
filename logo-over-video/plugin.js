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

  var root_elem, logo_elem, link_elem;

  // Load and configure the logo image.
  function loadLogoImage(url) {
    var elem = document.createElement('img');
    elem.src = url;
    return elem;
  }

  //function replaceLogo(new_logo) {
  //  try {
  //    root_elem = link_elem ? link_elem : logo_elem;

  //    if (root_elem.parentNode == video.grid[grid_pos]) {
  //      video.grid[grid_pos].replaceChild(root_elem);
  //    }

  //    // Set the new grid position and append the logo element.
  //    grid_pos = grid;
  //    video.grid[grid_pos].appendChild(root_elem);

  //  } catch(err){
  //    log(err);
  //  }
  //}

  // TODO: Closure.
  // Helper setting logo opacity.
  function setOpacity(value) {
    log("Setting logo opacity:", value);
    if (value !== null) {
      logo_elem.style.opacity = value;
      // For old IE and other things that are terrible.
      logo_elem.style.filter = "alpha(opacity=" + Math.round(100*value) + ")";
      logo_elem.className = 'wistia-video-logo';
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

    // Try to update the element position.
    try {
      root_elem = link_elem ? link_elem : logo_elem;

      // Remove if attached the previous grid element.
      if (root_elem.parentNode == video.grid[grid_pos]) {
        video.grid[grid_pos].removeChild(root_elem);
      }

      // Set the new grid position and append the logo element.
      grid_pos = grid;
      video.grid[grid_pos].appendChild(root_elem);

    } catch(err){
      log(err);
    }
  }

  // XXX: Changing the link to url via the interface will break due to nested element wrapping.
  // Wrap the logo with an anchor, if a link was specified.
  function linkLogo(link_url, link_title){
    if (link_url) {
      log('Wrapping img with link:', link_url);
      elem = document.createElement('a');
      elem.href = link_url;
      elem.target = '_blank';
      elem.className = 'wistia-video-logo';

      // Set the title, if one is supplied.
      if (link_title) {
        elem.title = link_title;
      }

      //link_elem.appendChild(logo_elem);
      //logo_elem = a_elem;
      return elem;
    }
  }

  // XXX: Deprecate, we should only need one injection scheme for initial and replace.
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

  function replaceLogo(new_logo){
    // Replace the DOM node.
    logo_elem.parentNode.replaceChild(new_logo, logo_elem);
    logo_elem = new_logo;

    log("Old logo replaced");

    bindHoverEvents();

    log("Events bound.");

    // Trigger repositioning.
    positionLogo(x_off, y_off, grid_pos);
    log("New logo positioned");

    // Reset opacity.
    setOpacity(logo_opacity);

  };

  function setLogo(new_logo_url, new_link_url, new_link_title) {
    log("setting the logo url.", new_logo_url);

    // XXX: Refactor, deprecate old method.
    var new_logo_elem = loadLogoImage(new_logo_url);

    log("New logo created");

    // replace the logo image
    replaceLogo(new_logo_elem);

    // Update logo link
    if (new_link_url) {
      setLink(new_link_url, new_link_title);
    }
  }

  function setLink(new_link_url, new_link_title) {
    log("setting the logo link.", new_link_url, new_link_title);
    link_elem = linkLogo(logo_link, logo_link_title);
  }

  // Initialize....

  // Load the logo image.
  logo_elem = loadLogoImage(logo_url);

  // Bind logo hover events.
  bindHoverEvents();

  // Set the position of the logo element.
  positionLogo(x_off, y_off, grid_pos);

  // Set the logo link, if specified.
  link_elem = linkLogo(logo_link, logo_link_title);

  // Inject the logo into the wistia embed.
  injectLogo();

  // Set the opacity of the logo.
  setOpacity(logo_opacity);

  // Return an object with a public interface 
  // for the plugin, if you want.
  return {
    // Position
    pos: positionLogo,

    // Opacity.
    opacity: setOpacity,
    defaultOpacity: defaultOpacity,
    hoverOpacity: hoverOpacity,

    // Logo URL, link URL, link title.
    setLogo: setLogo,
    setLink: setLink
  };
});
