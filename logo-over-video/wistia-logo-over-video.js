Wistia.plugin("wistialogoovervideo", function(video, options) {
  var debug = options.debug || false;
  function log(){
    if (debug && (console !== undefined)) { console.log.apply(console, arguments); }
  };

  var logo_url = options.logoUrl || null;
  var grid_pos = options.pos || 'right_inside';
  var x_off = options.x_off || '10px';
  var y_off = options.y_off || '10px';
  var w_logo = options.w || '100%';
  var h_logo = options.h || 'auto';

  log("DEBUG");
  log(video);
  log(options);
  log("END DEBUG");

  // Configure the logo image element.
  var logo_elem = document.createElement("img");
  logo_elem.style.position = "absolute";
  logo_elem.style.right = x_off;
  logo_elem.style.top = y_off;
  logo_elem.src = logo_url;

  // TODO: Test cross browser scaling!
  logo_elem.style.width = w_logo;
  logo_elem.style.height = h_logo;

  // TODO: Check against array of api supported options.
  if (video.grid[grid_pos] === undefined){
    log("BAD GRID POSITION!", grid_pos);
  } else {
    video.grid[grid_pos].appendChild(logo_elem);
  }

  // Return an object with a public interface 
  // for the plugin, if you want.
  return {};
});
