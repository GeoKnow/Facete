/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>,
 *         Clemens Hoffmann <cannelony@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this.datatype = "http://www.w3.org/2001/XMLSchema#float";
        this._predicateLat = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
        this._predicateLong = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
        this._openLayersLoaded = false;
        this._domRdy = false;
        this._osmLoaded = false;
        this._bingLoaded = false;
        this._googleLoaded = false;

        var self = this;
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.geo.css');

        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/openlayers/OpenLayers.js', function(){
            // load OpenLayer Stylesheet
            RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/openlayers/theme/default/style.css');
            self._openLayersLoaded = true;
            self._initGeo();
            // load OpenStreetMap
            RDFauthor.loadScript('http://openstreetmap.org/openlayers/OpenStreetMap.js', function() {
                self._osmLoaded = true;
                self._initGeo();
            });
/* TODO THIS APPROACH TOTALLY SUCKS - IT BREAKS AT RANDOM WITH "YOU NEED ANOTHER GOOGLE MAP KEY YADA YADA" rant done. ~Claus
TODO Make the map key configurable. Document that google maps will only be loaded, if a key is provided is some config.js file.
            // load Google Maps
            RDFauthor.loadScript('http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAjpkAC'
                                 +'9ePGem0lIq5XcMiuhR_wWLPFku8Ix9i2SXYRVK3e45q1BQUd_beF8dtzKET_EteAjPdGDwqpQ', function() {
                self._googleLoaded = true;
                self._initGeo();
            });
*/
            // load Bing Maps
            RDFauthor.loadScript('http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2&mkt=en-us', function() {
                self._bingLoaded = true;
                self._initGeo();
            });

        });

        Array.prototype.last = function() {
          var length = this.length-1;
          return this[length];
        }
    },

    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        this._domRdy = true
        this.element().data('id',this.ID);
        this._initGeo();
    },

    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#geo-edit-' + this.ID);
    },

    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the
    // return value of element().
    focus: function () {},
    */

    // return your widget's markup code here
    markup: function () {
        var predicateLabel;
        switch(this.statement.predicateURI()) {
          case this._predicateLat : predicateLabel = "lat"
              break;
          case this._predicateLong: predicateLabel = "long"
              break;
        }

        var markup =
            '<div class="rdfauthor-container" style="width:100%">\
              <input type="text" style="width:50%" class="text globe-icon geo" id="geo-edit-' + this.ID + '" value="'
                  + (this.statement.hasObject() ? this.statement.objectValue() : '') + '" name="'
                  + predicateLabel + '"/>\
             </div>\
            ';

        var geowidget =
            '<div id="geo-widget" class="window" style="display: none;">\
               <h1 class="title">Geo Widget</h1>\
               <div class="window-buttons">\
                 <div class="window-buttons-left"></div>\
                 <div class="window-buttons-right">\
                   <span class="button button-windowclose"><span>\
                 </div>\
               </div>\
               <div class="content">\
                 <form>\
                 <p class="width98">\
                   <label class="display-block onlyAural" for="geo-widget-search">Locate</label>\
                   <input type="text" style="width:65%" class="text inner-label width99" value="Locate"\
                    name="geo-widget-search" id="geo-widget-search">\
                 </p>\
                 </form>\
                 <div id="geo-widget-map" class="smallmap width99" style="height:200px;border:1px solid #ccc;">\
                 </div>\
              </div>\
             </div>\
            ';

        if( $('#geo-widget').length == 0 ) {
            $('body').append(geowidget);
        }

        return markup;
    },

    // commit changes here (add/remove/change)
    submit: function () {
        if (this.shouldProcessSubmit()) {
            //console.log(this.value());
            // get databank
            var databank = RDFauthor.databankForGraph(this.statement.graphURI());

            var somethingChanged = (
                this.statement.hasObject() &&
                    this.statement.objectValue() !== this.value()
            );

            var isNew = !this.statement.hasObject() && (null !== this.value());

            if (somethingChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(rdfqTriple);
                }
            }

            if ((null !== this.value()) && !this.removeOnSubmit && (somethingChanged || isNew)) {
                try {
                    var newStatement = this.statement.copyWithObject({
                        value: this.value(),
                        options: {datatype: this.datatype},
                        type: 'literal'
                    });
                    databank.add(newStatement.asRdfQueryTriple());
                } catch (e) {
                    var msg = e.message ? e.message : e;
                    alert('Could not save literal for the following reason: \n' + msg);
                    return false;
                }
            }
        }
        $('#geo-widget').remove();
        return true;
    },

    shouldProcessSubmit: function () {
        var t1 = !this.statement.hasObject();
        var t2 = null === this.value();
        var t3 = this.removeOnSubmit;

        return (!(t1 && t2) || t3);
    },

    value: function () {
        var value = this.element().val();
        if (String(value).length > 0) {
            return value;
        }

        return null;
    },

    _initOpenLayers: function (lon, lat) {
        var self = this;
        var map, markers, clickOverlay, searchOverlay, inputOverlay;
        var zoom = 6;
        $('#geo-widget-map').data('clickMarkers',[]);
        $('#geo-widget-map').data('searchMarkers',[]);

        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 0,
                'stopSingle': false,
                'stopDouble': false
            },

            initialize: function(options) {
                this.handlerOptions = OpenLayers.Util.extend(
                    {}, this.defaultHandlerOptions
                );
                OpenLayers.Control.prototype.initialize.apply(
                    this, arguments
                );
                this.handler = new OpenLayers.Handler.Click(
                    this, {
                        'click': this.trigger
                    }, this.handlerOptions
                );
            },

            trigger: function(e) {
                // set visibility
                searchOverlay.setVisibility(false);
                clickOverlay.setVisibility(true);
                inputOverlay.setVisibility(false);

                // set opacity of init marker to 0.5
                $('#geo-widget-map').data('initMarker').setOpacity(0.5);

                var lastMarker = $('#geo-widget-map').data('clickMarkers').last();
                if ( lastMarker != undefined ) {
                    clickOverlay.removeMarker(lastMarker);
                }

                var lonlat = map.getLonLatFromViewPortPx(e.xy).transform(
                   new OpenLayers.Projection("EPSG:900913"),
                   new OpenLayers.Projection("EPSG:4326")
                );

                self._setLonLat(lonlat.lon, lonlat.lat);

                var size = new OpenLayers.Size(21,25);
                var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                var icon2 = new OpenLayers.Icon(RDFAUTHOR_BASE +
                                                'libraries/openlayers/img/marker-blue.png',
                                                size,offset);
                var clickedMarker = new OpenLayers.Marker(new OpenLayers.LonLat(lonlat.lon,lonlat.lat)
                                                                        .transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    map.getProjectionObject()
                ),icon2);
                clickOverlay.addMarker(clickedMarker);
                $('#geo-widget-map').data('clickMarkers').push(clickedMarker);
            }

        });

        map = new OpenLayers.Map('geo-widget-map', {
            displayProjection: new OpenLayers.Projection("EPSG:4326")
        });

        // var satellite = new OpenLayers.Layer.Google(
          // "Google Satellite" , {type: G_SATELLITE_MAP}
        // );

        var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                      "http://vmap0.tiles.osgeo.org/wms/vmap0",
                      {layers: 'basic'} );

        var shared = new OpenLayers.Layer.VirtualEarth("Bing", {
            type: VEMapStyle.Shaded
        });

        var layer_mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik");

        var layer_cyclemap = new OpenLayers.Layer.OSM.CycleMap("Cyle");

        var gmap = new OpenLayers.Layer.Google(
            "Google Streets", // the default
            {numZoomLevels: 20}
        );

        map.addLayers([layer_mapnik, layer_cyclemap]);
        markers = new OpenLayers.Layer.Markers( "Init" );
        clickOverlay = new OpenLayers.Layer.Markers ( "Click" );
        searchOverlay = new OpenLayers.Layer.Markers ( "Search" );
        inputOverlay = new OpenLayers.Layer.Markers ( "Input" );
        map.addLayers([markers, clickOverlay, searchOverlay, inputOverlay]);

        var size = new OpenLayers.Size(21,25);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon(RDFAUTHOR_BASE + 'libraries/openlayers/img/marker.png',
                                       size,offset);
        var initMarker = new OpenLayers.Marker(new OpenLayers.LonLat(lon,lat).transform(
            new OpenLayers.Projection("EPSG:4326"),
            map.getProjectionObject()
        ),icon);
        $('#geo-widget-map').data('initMarker',initMarker);
        markers.addMarker(initMarker);

        // map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
            // new OpenLayers.Projection("EPSG:4326"),
            // map.getProjectionObject()
        // ), zoom);

        var bounds = markers.getDataExtent();
        map.zoomToExtent(bounds);

        map.addControl( new OpenLayers.Control.LayerSwitcher() );
        map.addControl( new OpenLayers.Control.MousePosition() );

        var click = new OpenLayers.Control.Click();
        map.addControl(click);
        click.activate();

        $('input[name="lat"],input[name="long"]').live('change keyup cut input',function() {
            // set visibility
            searchOverlay.setVisibility(false);
            clickOverlay.setVisibility(false);
            inputOverlay.setVisibility(true);
            $('#geo-widget-map').data('initMarker').setOpacity(0.5);
            var lonlat = self._getLonLat();
            var inputMarker = self._createMarker(lonlat.lon,lonlat.lat,icon,map);
            inputOverlay.clearMarkers();
            inputOverlay.addMarker(inputMarker);
            var bounds = inputOverlay.getDataExtent();
            bounds.extend(markers.getDataExtent());
            map.zoomToExtent(bounds);
        });

        $('#geo-widget-search').keydown(function(event) {
            var KEY = {
                BACKSPACE   : 8,
                RETURN      : 13,
                DEL         : 46,
                COMMA       : 188,
                TAB         : 9,
                UP          : 38,
                DOWN        : 40,
                LEFT        : 37,
                RIGHT       : 39,
                ESC         : 27,
                PAGEUP      : 33,
                PAGEDOWN    : 34,
                ALT         : 18,
                CTRL        : 17
            };

            if(event.which == KEY.RETURN) {
                event.preventDefault();
                // set visibility
                searchOverlay.setVisibility(true);
                clickOverlay.setVisibility(false);
                inputOverlay.setVisibility(false);

                var searchTerm = $('#geo-widget-search').val();
                $.ajax({
                    url: "http://nominatim.openstreetmap.org/search?",
                    dataType: "jsonp",
                    jsonp: "json_callback",
                    cache: false,
                    data: { 
                        "q" : searchTerm,
                        "format":"json"
                    },
                    success: function(data){
                        if ( data.length != 0 ) {
                            searchOverlay.clearMarkers();
                            $('#geo-widget-map').data('searchMarkers',[]);
                            $(data).each(function(i) {
                                var glon = data[i].lon;
                                var glat = data[i].lat;
                                var icon3;
                                if ( data.length == 1) {
                                    self._setLonLat(glon, glat);
                                    $('#geo-widget-map').data('initMarker').setOpacity(0.5);
                                    icon3 = new OpenLayers.Icon(RDFAUTHOR_BASE +
                                                                'libraries/openlayers/img/marker.png',
                                                                size,offset);
                                } else {
                                    $('#geo-widget-map').data('initMarker').setOpacity(1);
                                    icon3 = new OpenLayers.Icon(RDFAUTHOR_BASE +
                                                                'libraries/openlayers/img/marker-green.png',
                                                                size,offset);
                                };
                                var searchMarker = new OpenLayers.Marker(new OpenLayers.LonLat(glon,glat)
                                                                                       .transform(
                                    new OpenLayers.Projection("EPSG:4326"),
                                    map.getProjectionObject()
                                ),icon3);
                                $('#geo-widget-map').data('searchMarkers').push({
                                    "marker" : searchMarker,
                                    "lon" : glon,
                                    "lat" : glat,
                                    "click" : false
                                });
                                searchMarker.events.register('mousedown', searchMarker, function(evt) {
                                    // set opacity to original marker
                                    $('#geo-widget-map').data('initMarker').setOpacity(0.5);
                                    // get last modified marker
                                    var lastModified = $('#geo-widget-map').data('searchMarkers').last();
                                    if ( lastModified.click ) {
                                        lastModified.marker.erase();
                                        lastModified.marker.icon = icon3.clone();
                                        searchOverlay.redraw();
                                    }
                                    this.erase();
                                    this.icon = icon.clone();
                                    searchOverlay.redraw();
                                    $('#geo-widget-map').data('searchMarkers').push({
                                        "marker" : searchMarker,
                                        "lon" : glon,
                                        "lat" : glat,
                                        "click" : true
                                    });
                                    self._setLonLat(glon, glat);
                                    OpenLayers.Event.stop(evt);
                                });
                                searchOverlay.addMarker(searchMarker);
                            });
                            //fit map
                            var bounds = searchOverlay.getDataExtent();
                            bounds.extend(markers.getDataExtent());
                            map.zoomToExtent(bounds);
                        }else{
                            searchOverlay.clearMarkers();
                            $('#geo-widget-map').data('initMarker').setOpacity(1);
                            alert('no results - try again');
                        }
                    }
                });
            } // end if return
        });

    },

    _initGeo: function () {
        var self = this;
        var focus;

        if (this._openLayersLoaded && this._googleLoaded &&
            this._osmLoaded && this._bingLoaded && this._domRdy) {
            self.element().click(function() {
                focus = true;
                // positioning
                var left = self._getPosition().left;
                var top = self._getPosition().top;
                var lonlat = self._getLonLat()

                $('#geo-widget').data('input',$(this))
                                .show()
                                .offset({ left: left, top: top})
                                .resizable({
                                    minHeight: 200,
                                    minWidth: 200,
                                    alsoResize: $('#geo-widget-map')
                                 });

                if( $('#geo-widget-map').children().length == 0 ) {
                    self._initOpenLayers(lonlat.lon,lonlat.lat);
                }

                var value = $('#geo-widget-search').val();
                if ( value.length == 0 ) {
                    var prevValue = $('#geo-widget-search').data('value');
                    $('#geo-widget-search').val(prevValue);
                } else {
                    $('#geo-widget-search').data('value',value).live('click', function() {
                        $(this).val('');
                    });
                }

            });

            $("html").click(function(){
                if ($('#geo-widget').css("display") != "none" && focus == false) {
                    $('#geo-widget').fadeOut();
                }else if (focus == true){
                    $('#geo-widget').fadeIn();
                }
            });
            $('#geo-widget,input[name="long"],input[name="lat"]').mouseover(function(){
                focus = true;
            });
            $('#geo-widget,input[name="long"],input[name="lat"]').mouseout(function(){
                focus = false;
            });
        }

        $('.rdfauthor-view-content,html').scroll(function() {
            var left = self._getPosition().left + 'px !important;';
            var top = self._getPosition().top + 'px !important';

            $('#geo-widget').css('left',left)
                            .css('top',top);
            $('#geo-widget').fadeOut();
        });

        $('#geo-widget .button-windowclose').live('click', function() {
            $('#geo-widget').fadeOut();
        });

    },

    _getPosition: function() {
        var pos = {
            'top' : this.element().offset().top + this.element().outerHeight(),
            'left': this.element().offset().left
        };
        return pos;
    },

    _setLonLat: function(lon, lat) {
        $('input[name]').each(function(i) {
            switch($(this).attr('name')){
                case 'long' : lon = $(this).val(lon);
                    break;
                case 'lat'  : lat = $(this).val(lat);
                    break;
            }
        });
    },

    _getLonLat: function() {
        var lon, lat;
        $('input[name]').each(function(i) {
            switch($(this).attr('name')){
                case 'long' : lon = $(this).val();
                    break;
                case 'lat'  : lat = $(this).val();
                    break;
            }
        });
        return { "lon" : lon, "lat" : lat };
    },

    _createMarker: function(lon, lat, icon, map) {
        return new OpenLayers.Marker(new OpenLayers.LonLat(lon,lat).transform(
                       new OpenLayers.Projection("EPSG:4326"),
                       map.getProjectionObject()
                   ),icon.clone());
    }


},  //load hook settings from rdfauthor.config.js
    __config['widgets']['geo']['hook']
);
