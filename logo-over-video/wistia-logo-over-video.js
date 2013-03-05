Wistia.plugin("wistialogoovervideo", function(video, options) {
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

  // Load and configure the logo image.
  function loadLogoImage() {
    this.logo_elem = document.createElement('img');
    this.logo_img_elem = this.logo_elem;
    this.logo_elem.src = logo_url;
  }

  // Helper setting logo opacity.
  function setOpacity(value) {
    log("Setting logo opacity:", value);
    if (value !== null) {
      this.logo_img_elem.style.opacity = value;
      // For old IE and other things that are terrible.
      this.logo_img_elem.style.filter = "alpha(opacity=" + Math.round(100*value) + ")";
    }
  };

  // Bind hover events
  function bindHoverEvents(){
    if (logo_hover_opacity !== null) {
      log("Adding mouse over events.");
      this.logo_elem.addEventListener("mouseover", function(event) {
        setOpacity(logo_hover_opacity);
        return false;
      });
      this.logo_elem.addEventListener("mouseout", function(event) {
        setOpacity(logo_opacity);
        return false;
      });
    }
  }

  // Set the logo position.
  function positionLogo(){
    log("Positioning the logo element.");
    this.logo_elem.style.position = "absolute";
    this.logo_elem.style.right = x_off;
    this.logo_elem.style.top = y_off;
  }

  // Wrap the logo with an anchor, if a link was specified.
  function linkLogo(){
    if (logo_link !== null) {
      log('Wrapping img with link:', logo_link);
      var a_elem = document.createElement('a');
      a_elem.href = logo_link;
      a_elem.target = '_blank';

      // Set the title, if one is supplied.
      if (logo_link_title !== null) {
        a_elem.title = logo_link_title;
      }

      a_elem.appendChild(this.logo_elem);
      this.logo_elem = a_elem;
    }
  }

  // Append the logo element via the API.
  function injectLogo(){
    if (video.grid[grid_pos] !== undefined){
      log("Injecting the logo image into the Wistia embed.");
      video.grid[grid_pos].appendChild(this.logo_elem);
    }
  }

  // Load the logo image.
  loadLogoImage();

  // Bind logo hover events.
  bindHoverEvents();

  // Set the position of the logo element.
  positionLogo();

  // Set the logo link, if specified.
  linkLogo();

  // Inject the logo into the wistia embed.
  injectLogo();

  // Set the opacity of the logo.
  setOpacity(logo_opacity);

  // Return an object with a public interface 
  // for the plugin, if you want.
  return {};
});
