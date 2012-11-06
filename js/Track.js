Genoverse.Track = Base.extend({

  // Defaults
  height         : 12,
  dataType       : 'json',
  color          : '#000000',
  fontSize       : 10,
  fontFamily     : 'sans-serif',
  fontWeight     : 'normal',
  fontColor      : '#000000',
  bump           : false,
  bumpSpacing    : 2,
  featureSpacing : 1,
  inherit        : [],
  xhrFields      : {},
  featuresById   : {},
  featurePositions : {},

  constructor: function (config) {
    // Deep clone all [..] and {..} objects in this to prevent sharing between instances
    var deepCopy = {};
    for (var key in this) {
      if (typeof this[key] === 'object') deepCopy[key] = this[key];
    }
    this.extend($.extend(true, {}, deepCopy));

    // Use Base.extend to make any funciton in config have this.base
    this.extend(config);
    var track = this;
    
    for (var i = 0; i < this.inherit.length; i++) {
      if (Genoverse.Track[this.inherit[i]]) {
        this.extend(Genoverse.Track[this.inherit[i]]);
      }
    }
    
    if (typeof this.inheritedConstructor === 'function') {
      this.inheritedConstructor(config);
    }
    
    for (var key in this) {
      if (typeof this[key] === 'function' && !key.match(/^(base|extend|constructor|functionWrap|debugWrap)$/)) {
        this.browser.functionWrap(key, this);
      }
    }
    
    this.addDomElements(config);
    this.addUserEventHandlers();
    this.init();
    this.setScale();
  },


  addDomElements: function (config) {
    var track = this;

    this.order          = typeof this.order          !== 'undefined' ? this.order          : this.index;
    this.separateLabels = typeof this.separateLabels !== 'undefined' ? this.separateLabels : !!this.depth;
    this.spacing        = typeof this.spacing        !== 'undefined' ? this.spacing        : this.browser.trackSpacing;
    this.featureHeight  = typeof this.featureHeight  !== 'undefined' ? this.featureHeight  : this.height;
    this.fixedHeight    = typeof this.fixedHeight    !== 'undefined' ? this.fixedHeight    : this.featureHeight === this.height && !(this.bump || this.bumpLabels);
    this.autoHeight     = typeof this.autoHeight     !== 'undefined' ? this.autoHeight     : !this.fixedHeight && !config.height ? this.browser.autoHeight : false;
    this.resizable      = typeof this.resizable      !== 'undefined' ? this.resizable      : !this.fixedHeight;
    this.height        += this.spacing;
    this.initialHeight  = this.height;
    this.minLabelHeight = 0;
    this.canvas         = $('<canvas>').appendTo(this.browser.wrapper);
    this.container      = $('<div class="track_container">').appendTo(this.browser.wrapper);
    this.imgContainer   = $('<div class="image_container">');
    this.label          = $('<li>').appendTo(this.browser.labelContainer).height(this.height).data('index', this.index);
    this.menus          = $();
    this.context        = this.canvas[0].getContext('2d');
    this.font           = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
    this.context.font   = this.font;
    this.fontHeight     = this.fontSize;
    this.labelUnits     = [ 'bp', 'Kb', 'Mb', 'Gb', 'Tb' ];

    if (this.hidden) {
      this.height  = 0;
    }
    
    if (this.autoHeight === 'force') {
      this.autoHeight  = true;
      this.fixedHeight = false;
      this.resizable   = false;
    } else if (this.threshold) {
      this.thresholdMessage = this.browser.setTracks([{ type: 'Threshold', track: this }], this.browser.tracks.length)[0];
    }
    
   
    if (this.name) {
      if (this.unsortable) {
        this.label.addClass('unsortable');
      } else {
        $('<div class="handle"></div>').appendTo(this.label);
      }
      
      this.minLabelHeight = $('<span class="name">' + this.name + '</span>').appendTo(this.label).outerHeight(true);
      this.label.height(this.hidden ? 0 : Math.max(this.height, this.minLabelHeight));
    } else {
      this.label.addClass('unsortable');
    }
    
    this.container.height(this.hidden ? 0 : Math.max(this.height, this.minLabelHeight));
    
    if (!this.fixedHeight && this.resizable !== false) {
      this.heightToggler = $('<div class="height_toggler"><div class="auto">Set track to auto-adjust height</div><div class="fixed">Set track to fixed height</div></div>').on({
        mouseover : function () { $(this).children(track.autoHeight ? '.fixed' : '.auto').show(); },
        mouseout  : function () { $(this).children().hide(); },
        click     : function () {
          var height;
          
          if (track.autoHeight = !track.autoHeight) {
            track.heightBeforeToggle = track.height;
            height = track.fullVisibleHeight;
          } else {
            height = track.heightBeforeToggle || track.initialHeight;
          }
          
          $(this).toggleClass('auto_height').children(':visible').hide().siblings().show();
          
          track.resize(height, true);
        }
      }).addClass(this.autoHeight ? 'auto_height' : '').appendTo(this.label);
    }
  },


  init: function () {
    this.features = new RTree();
    
    this.dataRegion    = { start: 9e99, end: -9e99 };
    this.scaleSettings = {};
  },


  reset: function () {
    this.container.children('.image_container').remove();
    
    if (this.url !== false) {
      this.init();
    }
  },


  addUserEventHandlers: function () {
    var track   = this;
    var browser = this.browser;
    
    this.container.on('mouseup', '.image_container', function (e) {
      if ((e.which && e.which !== 1) || (browser.prev.left !== browser.left) || (browser.dragAction === 'select' && browser.selector.outerWidth(true) > 2)) {
        return; // Only show menus on left click when not dragging and not selecting
      }

      track.click(e);
    });
  },


  click: function (e) {
    var x = e.pageX - this.container.parent().offset().left + this.browser.scaledStart;
    var y = e.pageY - $(e.target).offset().top;
    var feature = this[e.target.className === 'labels' ? 'labelPositions' : 'featurePositions'].search({ x: x, y: y, w: 1, h: 1 }).sort(function (a, b) { return a.sort - b.sort; })[0];
    
    if (feature) {
      this.browser.makeMenu(feature, { left: e.pageX, top: e.pageY }, this);
    }
  },


  checkSize: function () {
    if (this.threshold && this.browser.length > this.threshold) {
      this.fullVisibleHeight = 0;
      return;
    }
    
    var bounds = { x: this.browser.scaledStart, w: this.width, y: 0, h: this.heights.max };
    var scale  = this.scale;
    var height = Math.max.apply(Math, $.map(this.featurePositions.search(bounds), function (feature) { return feature.bottom[scale]; }).concat(0));
    
    if (this.separateLabels) {
      this.labelTop = height;
      height += Math.max.apply(Math, $.map(this.labelPositions.search(bounds), function (feature) { return feature.labelBottom[scale]; }).concat(0));
    }
    
    if (!height && this.errorMessage) {
      height = this.errorMessage.height;
    }
    
    this.fullVisibleHeight = height;
  },


  resize: function (height) {
    if (arguments[1] !== true && height < this.featureHeight) {
      height = 0;
    } else {
      height = this.hidden ? 0 : Math.max(height, this.minLabelHeight);
    }
    
    this.height = height;
    
    if (typeof arguments[1] === 'number') {
      $(this.imgContainers).children('.labels').css('top', arguments[1]);
    }
    
    this.container.height(height);
    this.label.height(height);//[height ? 'show' : 'hide']();
    this.toggleExpander();
  },


  toggleExpander: function () {
    if (!this.resizable) {
      return;
    }
    
    var track = this;
    
    // Note: this.fullVisibleHeight - this.bumpSpacing is not actually the correct value to test against, but it's the easiest best guess to obtain.
    // this.fullVisibleHeight is the maximum bottom position of the track's features in the region, which includes spacing at the bottom of each feature and label
    // Therefore this.fullVisibleHeight includes this spacing for the bottom-most feature.
    // The correct value (for a track using the default positionFeatures code) is:
    // this.fullVisibleHeight - ([there are labels in this region] ? (this.separateLabels ? 0 : this.bumpSpacing + 1) + 2 : this.bumpSpacing)
    //                                                                ^ padding on label y-position                     ^ margin on label height
    if (this.fullVisibleHeight - this.bumpSpacing > this.height) {
      this.expander = (this.expander || $('<div class="expander">').width(this.width).appendTo(this.container).on('click', function () {
        track.resize(track.fullVisibleHeight);
      })).css('left', -this.browser.left)[this.height === 0 ? 'hide' : 'show']();
    } else if (this.expander) {
      this.expander.hide();
    }    
  },


  remove: function () {
    var thresholdMessage = this.thresholdMessage;
    
    if (thresholdMessage) {
      delete this.thresholdMessage;
      return this.browser.removeTracks([ this, thresholdMessage ]);
    }
    
    this.container.add(this.label).add(this.menus).remove();
    this.browser.tracks.splice(this.index, 1);
  },


  setScale: function () {
    var track = this;
    var featurePositions, labelPositions;
    
    this.scale = this.browser.scale;
    
    // Reset scaleSettings if the user has zoomed back to a previously existent zoom level, but has scrolled to a new region.
    // This is needed to get the newly created images in the right place.
    // Sadly we have to throw away all other images generated at this zoom level for it to work, 
    // since the new image probably won't fit exactly with the positioning of the old images,
    // and there would probably be a gap between this image and the old ones.
    if (this.scaleSettings[this.scale] && !this.browser.history[this.browser.start + '-' + this.browser.end]) {
      featurePositions = this.scaleSettings[this.scale].featurePositions;
      labelPositions   = this.scaleSettings[this.scale].labelPositions;
      
      this.container.children('.' + this.browser.scrollStart).remove();
      
      delete this.scaleSettings[this.scale];
    }
    
    if (!this.scaleSettings[this.scale]) {
      featurePositions = featurePositions || new RTree();
      
      this.scaleSettings[this.scale] = {
        imgContainers    : [],
        heights          : { max: this.height, maxFeatures: 0 },
        featurePositions : featurePositions,
        labelPositions   : this.separateLabels ? labelPositions || new RTree() : featurePositions
      };
    }
    
    var scaleSettings = this.scaleSettings[this.scale];
    
    $.each([ 'featurePositions', 'labelPositions', 'imgContainers', 'heights' ], function () {
      track[this] = scaleSettings[this];
    });
    
    if (this.renderer) {
      var renderer = this.getRenderer();
      
      if (renderer !== this.urlParams.renderer) {
        this.setRenderer(renderer);
      }
    }
    
    this.container.css('left', this.browser.left).children('.image_container').hide();
  },


  /**
  * parseData(data) - parse raw data from the data source (e.g. online web service)
  * extract features and insert it into the internal features storage (RTree)
  *
  * >> data - raw data from the data source (e.g. ajax response)
  * << nothing
  *
  * every feature extracted this routine must construct a hash with at least 3 values:
  *  {
  *    id    : [unique feature id, string],
  *    start : [chromosomal start position, integer],
  *    end   : [chromosomal end position, integer],
  *    [other optional key/value pairs]
  *  }
  *
  * and call this.insertFeature(feature)
  */
  parseData: function (data) {
    // Example of parseData function when data is an array of hashes like {start:..., end...}
    for (var i=0; i<data.length; i++) {
      var feature = data[i];

      // Make sure we have a unique ID, this method is not efficient, 
      // so better suppy your own id
      if (!feature.id) {
        feature.id = JSON.stringify(feature).hashCode();
      }
      feature.width = feature.end - feature.start + 1;
      if (feature.width > 0) {
        this.insertFeature(feature);
      }
    }
  },


  insertFeature: function (feature) {
    if (!this.featuresById[feature.id]) {
      if (!feature.width) feature.width = feature.end - feature.start + 1;

      // RTree stuff
      this.features.insert({ x: feature.start, y: 0, w: feature.width, h: 1 }, feature);
      this.featuresById[feature.id] = feature;
    }
  },


  makeImage: function (start, end, width, moved, cls) {
    var div  = this.imgContainer.clone().width(width).addClass(cls);
    var prev = $(this.imgContainers).filter('.' + this.browser.scrollStart + ':' + (moved < 0 ? 'first' : 'last'));

    var data = { 
      start : start, 
      end   : end, 
      width : width, 
      scale : this.scale,
      scaledStart : start * this.scale
    };

    var image = $('<img />').width(width).data(data).appendTo(div);

    div.css('left', prev.length ? prev.position().left + (moved < 0 ? -this.width : prev.width()) : -this.browser.offsets.right);
    
    this.imgContainers[moved < 0 ? 'unshift' : 'push'](div[0]);
    this.container.append(this.imgContainers);

    var bufferedStart = Math.max(start - (this.labelOverlay ? 0 : this.browser.labelBuffer), 1);
    var bounds = { x: bufferedStart, y: 0, w: end - bufferedStart, h: 1 };
    var features = !this.url || (start >= this.dataRegion.start && end <= this.dataRegion.end) ? this.features.search(bounds) : false;
    if (features) {
      this.render(features, image);
    }

    var track = this;

    $.when(this.getData(bufferedStart, end))
    .done(function (data) {
      track.dataRegion.start = Math.min(start, track.dataRegion.start);
      track.dataRegion.end   = Math.max(end,   track.dataRegion.end);
      try {
        track.parseData(data);
        track.render(track.features.search(bounds), image);
      } catch (e) {
        track.showError(e);
      }
      
      if (track.allData) {
        track.url = false;
      }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      track.showError(jqXHR, textStatus, errorThrown);
    });

    var bgImage = $('<img class="bg" />').width(width).data(data).prependTo(div);
    this.renderBackground(bgImage);
    
    div = prev = null;
  },
  

  getData: function (start, end) {
    return $.ajax({
      url      : this.parseUrl(start, end),
      dataType : this.dataType,
      context  : this,
      xhrFields: this.xhrFields,
    });
  },

  
  scaleFeatures: function (features, scale) {
    for (var i=0; i<features.length; i++) {
      var feature = features[i];
      if (!feature.position) feature.position = {};

      if (!feature.position[scale]) {
        feature.position[scale] = {};
        feature.position[scale].x = feature.start * scale;
        feature.position[scale].w = feature.width * scale;
        feature.position[scale].h = this.featureHeight;

        if (feature.position[scale].w < scale) feature.position[scale].w = scale;
      }
    }
  },

  
  toShowLabels: function (scale) {
    return this.showLabels;
  },


  positionFeatures: function (features, img) {
    var imgScaledStart = img.data('scaledStart');
    var scale  = img.data('scale');
    var height = 0;
    var showLabels = this.toShowLabels(scale);

    for (var i=0; i<features.length; i++) {
      var feature = features[i];
      feature.position[scale].x += - imgScaledStart;
      feature.position[scale].y = feature.y || this.featureSpacing;

      feature.position[scale].H = feature.position[scale].h + this.featureSpacing;
      feature.position[scale].W = feature.position[scale].w + this.featureSpacing;

      if (showLabels && feature.label) {
        feature.position[scale].labelY = feature.position[scale].H;
        feature.position[scale].H += this.fontHeight + this.featureSpacing;
        var labelWidth = feature.label ? Math.ceil(this.context.measureText(feature.label).width) + 1 : 0;
        if (labelWidth > feature.position[scale].W) feature.position[scale].W = labelWidth;
      }
    }

    if (this.bump) {
      height = this.bumpFeatures(scale);
    } else {
      height = this.featureHeight + this.featureSpacing + (showLabels ? this.fontHeight + this.featureSpacing : 0);
    }

    img.data({height : height});
    return height;
  },


  bumpFeatures: function (features, scale) {
    var scale = scale > 1 ? scale : 1;
    var height = 0;
    var seen = {};

    for (var i = 0; i < features.length; i++) {
      var feature = features[i];
      
      if (seen[feature.id]) continue;
      seen[feature.id] = 1;

      var bounds = { 
        x: feature.position[scale].x, 
        w: feature.position[scale].W, 
        y: feature.position[scale].y, 
        h: feature.position[scale].H
      };
        
      do {
        bump = false;

        if (this.featurePositions.search(bounds).length) {
          bounds.y += bounds.h;
          bump = true;
        }
      } while (bump);

      this.featurePositions.insert(bounds, feature.id);
      feature.position[scale].y = bounds.y;
      
      height = Math.max(height, feature.position[scale].y + feature.position[scale].H);
    }

    return height;
  },


  render: function (features, img) {
    var scale = img.data('scale');

    this.scaleFeatures(features, scale);
    this.positionFeatures(features, img);

    var canvas = $('<canvas />').attr({ width: img.data('width'), height: img.data('height') })[0];

    this.draw(features, canvas.getContext('2d'), scale);

    img.attr('src', canvas.toDataURL());
    $(canvas).remove();
  },


  draw: function(features, context, scale) {
    context.fillStyle = this.color;
    debugger;
    for (var i=0; i<features.length; i++) {
      var feature = features[i];
      if (feature.color && feature.color != context.fillStyle) {
        context.fillStyle = feature.color;
      }

      context.fillRect(feature.position[scale].x, feature.position[scale].y, feature.position[scale].w, feature.position[scale].h);
      if (this.toShowLabels(scale)) {
        if (feature.labelColor && feature.labelColor != context.fillStyle) {
          context.fillStyle = feature.labelColor;
          context.fillText(feature.label, feature.position[scale].x, feature.position[scale].labelY);
        }
      }
    }
  },


  showError: function () {
    console.log(arguments);
    // if (!this.errorMessage) {
    //   this.errorMessage = this.browser.setTracks([{ type: 'Error', track: this }], this.browser.tracks.length)[0];
    // }
    
    // this.errorMessage.draw(this.imgContainers[0], error);
    // deferred.resolve({ target: image.images, img: image }); 
  },
  

  parseUrl: function (start, end) {
    var chr = this.browser.chr;
    var url = this.url;

    return url.replace(/__CHR__/, chr).replace(/__START__/, start).replace(/__END__/, end);
  },


  renderBackground: function (img) {
    var canvas  = $('<canvas />').attr({ width: img.data('width'), height: 1 })[0];
    this.drawBackground(img.data(), canvas.getContext('2d'));
    img.attr('src', canvas.toDataURL());
    $(canvas).remove();
  },


  drawBackground: function (data, context) {
    // Draw background color
    context.fillStyle = this.background || this.browser.colors.background;
    context.fillRect(0, 0, context.canvas.width, 1);

    // Draw guidelines
    var guideLines  = { major: [ this.browser.colors.majorGuideLine, this.browser.majorUnit ], minor: [ this.browser.colors.minorGuideLine, this.browser.minorUnit ] };
    var scaledStart = Math.round(data.scaledStart);
    var x;
    
    for (var c in guideLines) {
      context.fillStyle = guideLines[c][0];
      
      for (x = Math.max(data.start - (data.start % guideLines[c][1]), 0); x < data.end + this.browser.minorUnit; x += guideLines[c][1]) {
        context.fillRect((this.browser.guideLines[c][x] || 0) - scaledStart, 0, 1, context.canvas.height);
      }
    }
  },


  formatLabel: function (label) {
    var str = label.toString();
    
    if (this.minorUnit < 1000) {
      return str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    } else {
      var power = Math.floor((str.length - 1) / 3);
      var unit  = this.labelUnits[power];
      
      label /= Math.pow(10, power * 3);
      
      return Math.floor(label) + (unit === 'bp' ? '' : '.' + (label.toString().split('.')[1] || '').concat('00').substring(0, 2)) + ' ' + unit;
    }
  },


  populateMenu: function (feature) {
    return feature;
  },


  show: function () {
    this.hidden = false; 
    this.resize(this.initialHeight);
  },


  hide: function () {
    this.hidden = true; 
    this.resize(0);
  },


  beforeDraw          : $.noop, // decoration for the track, drawn before the features
  decorateFeatures    : $.noop, // decoration for the features
  afterDraw           : $.noop, // decoration for the track, drawn after the features
  systemEventHandlers : {}

}, {
  on: function (events, handler) {
    $.each(events.split(' '), function () {
      if (typeof Genoverse.Track.prototype.systemEventHandlers[this] === 'undefined') {
        Genoverse.Track.prototype.systemEventHandlers[this] = [];
      }
      
      Genoverse.Track.prototype.systemEventHandlers[this].push(handler);
    });
  }
});


String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return ""+hash;
};