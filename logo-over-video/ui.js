Math.PHI = 1.6180339887505;
var debug = true;

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
  // Internal variables.
  this._grid_map = {
    'minimap-object-ti': 'top_inside',
    'minimap-object-ri': 'right_inside',
    'minimap-object-bi': 'bottom_inside',
    'minimap-object-li': 'left_inside',
  };
  this._objects = {};
  this._elem = elem;
  this._embed = embed;

  // Resolve width of container for scaling.
  this._base_width = $(this._elem).width();
  this._base_height = Math.round(this._base_width * this._embed.options().videoHeight / this._embed.options().videoWidth);

  // Set the container height.
  $(this._elem).addClass('minimap').css('height', this._base_height);

  // Determine scaling factors.
  this._x_scale = this._base_width / this._embed.options().videoWidth;
  this._y_scale = this._base_height / this._embed.options().videoHeight;

  // Calculate snap-to grid dimensions.
  this._grid_dimensions = [Math.round(6 * this._x_scale), Math.round(4 * this._y_scale)];

  // Remove all draggable items from the grid.
  this.clear = function(){
    $(this._elem).find('.minimap-object').remove();
    this._objects = {};
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
      containment: 'parent', //this._elem, //'.wlov-contain',
      scroll: false,
      //grid:   this._grid_dimensions,
      //drag: function(e){ $(self).trigger(name + '-' + 'drag',  self.posFor(name));

      //  var pos = self.posFor(name);
      //  log("DRAG:", pos.offset);
      //  var px = pos.offset[0];
      //  var py = pos.offset[1];
      //  var bx = self._base_width;
      //  var by = self._base_height;

      //  var mxf = Math.pow(Math.PHI, 1);
      //  var myf = Math.pow(Math.PHI, 2);

      //  var xl1 = bx / mxf;
      //  var xl2 = bx - (bx / mxf);
      //  var yl1 = by / myf;
      //  var yl2 = by - (by / myf);
      //  console.log("LIMITS:", Math.round(xl1), Math.round(xl2), Math.round(yl1), Math.round(yl2));

      //  $('#wlov-inner-containment').css({
      //    'top':    Math.round(yl2/2) + 'px',
      //    'left':   Math.round(xl2/2) + 'px',
      //    'width':  Math.round(xl1) + 'px',
      //    'height': Math.round(yl1) + 'px',
      //  });



      //},
      start:  function(e){ $(self).trigger(name + '-' + 'start', self.posFor(name)); },
      stop:   function(e){ $(self).trigger(name + '-' + 'stop',  self.posFor(name)); }
    });
  };

  // TODO: refactor me!
  // Retrieve the embed position mapping for the item.
  this.posFor = function(name) {
    var base_coord = [$(this._objects[name]).css('left'), $(this._objects[name]).css('top')].map(function(x){ return parseInt(x.slice(0, -2)); });
    base_coord[0] = this._base_width - (base_coord[0] + $(this._objects[name]).width());
    return { grid: 'right_inside', offset: [ Math.round(base_coord[0] / this._x_scale), Math.round(base_coord[1] / this._y_scale)] };
  };

  // Add event handlers for movement.
  this.on = function(event_name, callback) {
    $(this).bind(event_name, callback);
  };
}

// TODO: Refactor!
var logo_minimap;

// ---- Initialize UI grid for logo placement.
function updateLogoGrid(oembed, callback){
  // Initialize the video grid, if necessary.
  if (logo_minimap === undefined) {
    logo_minimap = new MiniMap($('#wlov-grid')[0], oembed);

    // Add an event handler to update the input fields.
    logo_minimap.on('logo-stop', function(e, mapping){
      $('#logo_x_offset').val(mapping.offset[0]);
      $('#logo_y_offset').val(mapping.offset[1]);
      updateOutput();
    });
  } else {
    logo_minimap.clear();
  }

  // Create the logo image element.
  var $logo = $('<img/>');

  // Bind a handler to the load event.
  $logo.load(function(e){
    // Set the logo dimension text fields.
    $('#logo_height').val(e.target.height);
    $('#logo_width').val(e.target.width);

    // Execute the callback to finish loading behavior.
    callback();

    // Add the logo element to the draggable grid.
    logo_minimap.addItem('logo', e.target, [parseInt($('#logo_x_offset').val()), parseInt($('#logo_y_offset').val())]);
  });

  // Set the src to trigger image loading.
  $logo.attr('src', $('#logo_url').val());
}

function updateOutput() {
  var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());
  var outputEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

  if (sourceEmbedCode && sourceEmbedCode.isValid()) {

    // TODO: refactor me
    function finishUpdate(output_embed) {
      // Set custom options on the embed code.
      output_embed.setOption("plugin.wistialogoovervideo", {
        debug:        true,
        src:          'http://argo/logo-over-video/wistia-logo-over-video.js',
        pos:          $('#logo_pos').val(),
        xOffset:      parseInt($('#logo_x_offset').val()),
        yOffset:      parseInt($('#logo_y_offset').val()),
        //w:            parseInt($('#logo_width').val()),
        //h:            parseInt($('#logo_height').val()),
        logoUrl:      $('#logo_url').val(),
        logoLink:     $('#logo_link').val(),
        logoTitle:    $('#logo_title').val(),
        opacity:      parseFloat($('#logo_opacity').val().slice(0,-1)) / 100.0,
        hoverOpacity: parseFloat($('#logo_hover_opacity').val().slice(0,-1)) / 100.0
      });

      // XXX: TESTING
      wemb = output_embed;

    }
    
    // Update the logo grid, then trigger a full refresh.
    updateLogoGrid(outputEmbedCode, function(){
      finishUpdate(outputEmbedCode);

      // Display the output.
      $("#output_embed_code").val(outputEmbedCode.toString());
      outputEmbedCode.previewInElem("preview");
    });

  } else {

    // Show an error if invalid. We can be more specific 
    // if we expect a certain problem.
    $("#output_embed_code").val("Please enter a valid Wistia embed code.");
    $("#preview").html('<div id="placeholder_preview">Your video here</div>');
  }
}


// Updating is kind of a heavy operation; we don't want to 
// do it on every single keystroke.
var updateOutputTimeout;
function debounceUpdateOutput() {
  clearTimeout(updateOutputTimeout);
  updateOutputTimeout = setTimeout(updateOutput, 500);
}


// Assign all DOM bindings on doc-ready in here. We can also 
// run whatever initialization code we might need.
window.setupLabInterface = function($) {
  $(function() {
    // Update the output whenever a configuration input changes.
    $("#configure")
      .on("keyup", "input[type=text], textarea", debounceUpdateOutput)
      .on("change", "select", debounceUpdateOutput)
      .on("click", ":radio,:checkbox", debounceUpdateOutput);
  });

  $(function() {
    // Logo UI interactions.
    $( "#logo_opacity_slider" ).slider({
      range: "min",
      min: 0.0,
      max: 100.0,
      value: 33.0,
      slide: function( event, ui ) {
        //$( "#logo_opacity" ).val( ui.value + '%' );
        $('#logo_opacity').focus().val(ui.value + '%').keyup().blur();
      }
    });
    $( "#logo_opacity" ).val( $( "#logo_opacity_slider" ).slider( "value" ) + '%' );

    $( "#logo_hover_opacity_slider" ).slider({
      range: "min",
      min: 0.0,
      max: 100.0,
      value: 90.0,
      slide: function( event, ui ) {
        //$( "#logo_hover_opacity" ).val( ui.value + '%' );
        $('#logo_hover_opacity').focus().val(ui.value + '%').keyup().blur();
      }
    });
    $( "#logo_hover_opacity" ).val( $( "#logo_hover_opacity_slider" ).slider( "value" ) + '%' );
  });

};
