window.jsFileName = 'plugin.js';
window.jsProductionPath = 'fast.wistia.com/labs/logo-over-video';

var debug = true;

test_logos = [
  'http://argo/white-on-transparent.png',
  'http://embed.wistia.com/deliveries/83d5e93e57ae5287ebc227cd84f17ec2584eb99f.png?image_crop_resized=144x75'
];

// A reasonably safe log function.
function log(){
  if (debug && (console !== undefined)) { console.log.apply(console, arguments); }
};

// Given a base element and a wistia embed object, create a scaled placement
// grid. Objects added to this grid will be draggable, and their relative
// position on the video itself is calculated using scale factors.
//
// The width of the container element should be defined via css, the height
// will be generated automatically using the aspect ratio of the embed object.
//
// Usage:
//
//   // Create a new minimap.
//   var mini_map = new MiniMap(container_element, wistia_embed_object);
//
//   // Scale and add a draggable item at the specified offset.
//   mini_map.addItem('foo', foo_elem, [offset_x, offset_y]);
//
function MiniMap(elem, embed){
  var self = this;
  this._objects = {};
  this._elem = elem;
  this._embed = embed;

  // TODO: There has to be a better way.
  try {
    // An ApiEmbedCode will return a string suffixed by 'px'.
    this._embed_width = parseInt(this._embed.width().slice(0,-2));
    this._embed_height = parseInt(this._embed.height().slice(0,-2));
  } catch (err) {
    // An IframeEmbedCode will return an integer.
    this._embed_width = parseInt(this._embed.width());
    this._embed_height = parseInt(this._embed.height());
  }

  this._base_width = $(this._elem).width();
  this._base_height = Math.round(this._base_width * this._embed_height / this._embed_width);

  // Set the container height.
  $(this._elem).addClass('minimap').css('height', this._base_height);

  // Determine scaling factors.
  this._x_scale = this._base_width / this._embed_width;
  this._y_scale = this._base_height / this._embed_height;

  // Calculate snap-to grid dimensions.
  this._grid_dimensions = [Math.round(6 * this._x_scale), Math.round(4 * this._y_scale)];

  // Remove all draggable items from the grid.
  this.clear = function(){
    $(this).unbind();
    $(this._elem).find('.minimap-object').remove();
    this._objects = {};
  };

  // Check to see if the specified element is in the set of objects being
  // tracked by this minimap.
  this.hasItem = function(name){
    if (this._objects[name]) {
      return true;
    } else {
      return false;
    }
  };

  // Add a draggable element to the grid. The dimensions of this element will
  // be scaled using the relative size difference between the grid and embed.
  // The offset coordinates will also be re-scaled appropriately.
  this.addItem = function(name, elem, offset_coord){
    var self = this;
    this._objects[name] = elem;

    $(elem).addClass('minimap-object').css({
      'width': Math.round(parseFloat(elem.width) * this._x_scale) + 'px',
      'height': 'auto',
      'cursor': 'move',
    });

    // Position the element according to an offset, if specified.
    if (offset_coord !== undefined) {
      // Fix the offset x coordinate.
      offset_coord[0] = this._base_width - ((offset_coord[0] * this._x_scale) + $(elem).width());
      $(elem).css({
        'left': Math.round(offset_coord[0]) + 'px',
        'top': Math.round(offset_coord[1] * this._y_scale) + 'px',
      });
    } else {
      $(elem).css({
        'left': '0px',
        'top': '0px',
      });
    }

    $(this._elem).append(elem);

    // Add draggable functionality and events.
    $(elem).draggable({
      containment: 'parent',
      scroll: false,
      start:  function(e){ $(self).trigger(name + '-' + 'start', self.posFor(name)); },
      stop:   function(e){ $(self).trigger(name + '-' + 'stop',  self.posFor(name)); }
    });
  };

  // Retrieve the video grid corner to use for this object.
  this.videoGrid = function(name) {
    // Find the coordinate offset of the center.
    var c_off = this.centerOf(name);

    var xo = c_off[0];
    var yo = c_off[1];

    var x0 = this._base_width / 2;
    var y0 = this._base_height / 2;

    // Find the right quadrant.
    var quadrant = null;
    if ( (xo <= x0) && (yo <= y0) ){
      quadrant = 'top_inside';
    } else if ( (xo > x0) && (yo <= y0) ){
      quadrant = 'right_inside';
    } else if ( (xo > x0) && (yo > y0) ){
      quadrant = 'bottom_inside';
    } else if ( (xo <= x0) && (yo > y0) ){
      quadrant = 'left_inside';
    }

    return quadrant;
  };

  // Retrieve the centroid coordinate for a minimap object.
  this.centerOf = function(name) {
    log("Finding center coordinate:", name);
    var off_xy = [$(this._objects[name]).css('left'), $(this._objects[name]).css('top')].map(function(x){ return parseInt(x.slice(0, -2)); });
    var size_xy = [$(this._objects[name]).css('width'), $(this._objects[name]).css('height')].map(function(x){ return parseInt(x.slice(0, -2)); });
    log(off_xy, size_xy);

    // Return the offset of the object's center.
    return [off_xy[0] + (size_xy[0] / 2), off_xy[1] + (size_xy[1] / 2)];
  };

  // TODO: refactor me!
  // Retrieve the embed position mapping for the item.
  this.posFor = function(name) {
    var base_coord = [$(this._objects[name]).css('left'), $(this._objects[name]).css('top')].map(function(x){ return parseInt(x.slice(0, -2)); });
    //base_coord[0] = this._base_width - (base_coord[0] + $(this._objects[name]).width());

    var grid_pos = this.videoGrid(name);
    var off_c = [];

    // Transform offsets based on grid position.
    switch(grid_pos){
      case 'top_inside':
        //base_coord[0] = this._base_width - (base_coord[0] + $(this._objects[name]).width());
        off_c = [ Math.round(base_coord[0] / this._x_scale), Math.round(base_coord[1] / this._y_scale)];
        break;
      case 'right_inside':
        base_coord[0] = this._base_width - (base_coord[0] + $(this._objects[name]).width());
        off_c = [ Math.round(base_coord[0] / this._x_scale), Math.round(base_coord[1] / this._y_scale)];
        break;
      case 'bottom_inside':
        base_coord[0] = this._base_width - (base_coord[0] + $(this._objects[name]).width());
        base_coord[1] = this._base_height - base_coord[1] - $(this._objects[name]).height();
        off_c = [ Math.round(base_coord[0] / this._x_scale), Math.round(base_coord[1] / this._y_scale)];
        break;
      case 'left_inside':
        //base_coord[0] = -1 * (base_coord[0] + $(this._objects[name]).width());
        base_coord[1] = this._base_height - base_coord[1] - $(this._objects[name]).height();
        off_c = [ Math.round(base_coord[0] / this._x_scale), Math.round(base_coord[1] / this._y_scale)];
        break;
    };

    // Return the video grid position and the properly transformed offset coordinates.
    return { grid: grid_pos, offset: off_c };
  };

  // Add event handlers for movement.
  this.on = function(event_name, callback) {
    $(this).bind(event_name, callback);
  };
}

// Updating is kind of a heavy operation; we don't want to 
// do it on every single keystroke.
var updateOutputTimeout;
function debounceUpdateOutput() {
  clearTimeout(updateOutputTimeout);
  updateOutputTimeout = setTimeout(updateOutput, 500);
}

// Update a single embed code option.
function updateOutputEmbedOption(option, value) {
  var outputEmbedCode = Wistia.EmbedCode.parse($("#output_embed_code").val());
  if (outputEmbedCode && outputEmbedCode.isValid()) {
    log("Updating output embed option:", option, value);
    outputEmbedCode.setOption(option, value);
    $("#output_embed_code").val(outputEmbedCode.toString());
  }
};

// Bulk update of embed code options and textarea.
function updateOutputEmbedOptions(options) {
  var outputEmbedCode = Wistia.EmbedCode.parse($("#output_embed_code").val());
  if (outputEmbedCode && outputEmbedCode.isValid()) {
    log("Updating output embed options:", options);
    for (k in options) {
      outputEmbedCode.setOption(k, options[k]);
    }
    $("#output_embed_code").val(outputEmbedCode.toString());
  }
};

// Reload the output embed and re-initialize the plugin.
function reloadOutputEmbed() {
  log(" >>> Reloading output embed from source embed code.")
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (outputEmbedCode && outputEmbedCode.isValid()) {

    // Set the base options.
    outputEmbedCode.setOption('plugin.logoOverVideo.src',       pluginSrc(outputEmbedCode));
    outputEmbedCode.setOption('plugin.logoOverVideo.debug',     true);

    // TODO: Migrate these options.
    outputEmbedCode.setOption('plugin.logoOverVideo.logoUrl',   $('#logo_url').val());
    outputEmbedCode.setOption('plugin.logoOverVideo.logoLink',  $('#logo_link').val());
    outputEmbedCode.setOption('plugin.logoOverVideo.logoTitle', $('#logo_title').val());

    // update the MiniMap.
    var $grid = $('#wlov-grid')[0];
    if (!$grid.minimap) {
      log(" --- Initializing the MiniMap.");
      $grid.minimap = new MiniMap($grid, outputEmbedCode);
    }
    replaceGridLogo();

    // Create preview embed.
    $("#output_embed_code").val(outputEmbedCode.toString());
    outputEmbedCode.previewInElem('preview', {type: 'api'}, function(){
      // Set the initial logo position.
      if (wistiaEmbed) {
        var init_mapping = $grid.minimap.posFor('logo');
        wistiaEmbed.plugin.logoOverVideo.pos(init_mapping.offset[0], init_mapping.offset[1], init_mapping.grid);
      }
    });

  } else {
    log(" !!! Error reloading from source embed!");
  }
}

// Update the minimap with a new logo.
function replaceGridLogo(logo_url) {
  // Update the preview and output embed.
  //wistiaEmbed.plugin.logoOverVideo.setLogo($('#logo_url').val());
  //updateOutputEmbedOption('plugin.logoOverVideo.logoUrl', $('#logo_url').val());

  // Update the minimap grid.
  var $grid = $('#wlov-grid')[0];
  $grid.minimap.clear();
  // XXX: Move this!
  // Create the logo image element.
  var $logo = $('<img/>');

  // Bind a handler to the load event.
  $logo.load(function(e){
    log(" *** Logo image loaded.");
    try {
      $grid.minimap.addItem('logo', e.target, [parseInt($('#logo_x_offset').val()), parseInt($('#logo_y_offset').val())]);

      // Update the output embed code.
      var init_mapping = $grid.minimap.posFor('logo');
      updateOutputEmbedOptions({
        'plugin.logoOverVideo.pos':     init_mapping.grid,
        'plugin.logoOverVideo.xOffset': init_mapping.offset[0],
        'plugin.logoOverVideo.yOffset': init_mapping.offset[1]
      });

      $grid.minimap.on('logo-stop', function(e, mapping){
        // XXX: Deprecated.
        $('#logo_x_offset').val(mapping.offset[0]);
        $('#logo_y_offset').val(mapping.offset[1]);

        // Update the output embed code.
        updateOutputEmbedOptions({
          'plugin.logoOverVideo.pos':     mapping.grid,
          'plugin.logoOverVideo.xOffset': mapping.offset[0],
          'plugin.logoOverVideo.yOffset': mapping.offset[1]
        });

        if (wistiaEmbed !== undefined) {
          wistiaEmbed.plugin.logoOverVideo.pos(mapping.offset[0], mapping.offset[1], mapping.grid);
        }
      });

    } catch (err) {
      log("Minimap logo add error.", err);
    }
  });

  // Set the src to trigger image loading.
  $logo.attr('src', $('#logo_url').val());

}

// Assign all DOM bindings on doc-ready in here. We can also 
// run whatever initialization code we might need.
window.setupLabInterface = function($) {
  $(function() {

    /////////////////////
    // Source embed code.
    // TODO: Only trigger if the keyup coincides with a change.
    $("#source_embed_code").on("keyup", function(){
      log(" --- Source embed code altered, refreshing.");
      reloadOutputEmbed();
    });

    /////////////////////
    // Logo placement.

    /////////////////////
    // Logo settings.

    // Logo image url.
    $("#logo_url").on("blur", function(){
      log(" --- Logo image URL altered, updating.");
      replaceGridLogo();
      wistiaEmbed.plugin.logoOverVideo.setLogo($('#logo_url').val());
      updateOutputEmbedOption('plugin.logoOverVideo.logoUrl', $('#logo_url').val());
    });

    // Logo link url and title.
    $("#logo_link, #logo_title").on("blur", function(){
      log(" --- Logo link URL altered, updating.");
      wistiaEmbed.plugin.logoOverVideo.setLink($('#logo_link').val(), $('#logo_title').val());
      updateOutputEmbedOptions({
        'plugin.logoOverVideo.logoLink':  $('#logo_link').val(),
        'plugin.logoOverVideo.logoTitle': $('#logo_title').val()
      });
    });

    // Logo opacity sliders
    $( "#logo_opacity_slider" ).slider({
      range: "min",
      min: 0.0,
      max: 100.0,
      value: 33.0,
      slide: function( event, ui ) {
        $( "#logo_opacity" ).val( ui.value + '%' );
      },
      stop: function( event, ui ) {
        if (wistiaEmbed !== undefined) {
          wistiaEmbed.plugin.logoOverVideo.defaultOpacity(parseFloat(ui.value) / 100.0);
          updateOutputEmbedOption('plugin.logoOverVideo.opacity', parseFloat(ui.value) / 100.0);
        }
      }
    });
    $( "#logo_opacity" ).val( $( "#logo_opacity_slider" ).slider( "value" ) + '%' );

    $( "#logo_hover_opacity_slider" ).slider({
      range: "min",
      min: 0.0,
      max: 100.0,
      value: 90.0,
      slide: function( event, ui ) {
        $( "#logo_hover_opacity" ).val( ui.value + '%' );
      },
      stop: function( event, ui ) {
        if (wistiaEmbed !== undefined) {
          wistiaEmbed.plugin.logoOverVideo.hoverOpacity(parseFloat(ui.value) / 100.0);
          updateOutputEmbedOption('plugin.logoOverVideo.hoverOpacity', parseFloat(ui.value) / 100.0);
        }
      }
    });
    $( "#logo_hover_opacity" ).val( $( "#logo_hover_opacity_slider" ).slider( "value" ) + '%' );
  });

};
