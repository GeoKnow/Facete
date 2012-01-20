/**
 * The main class for the Spatial Semantic Browsing Widgets.
 * Holds references to model classes, and can initialize the controller.
 * 
 * 
 * @returns {SpatialSemanticBrowsing}
 */
function SpatialSemanticBrowsing() {
	this.backend = null;
	this.sparqlService = null;

	// TODO Actually multi selection would be cool
	this.selection = new Set();

	// The currently selected feature
	// FIXME Change to something like "selectedResource", so we can track
	// the active feature between mapEvents (features get destroyed on map events)
	//this.selectedFeature = undefined;

	
	// The active language
	this.activeLanguage = "en";

	
	// Model classes for the instances
	// TODO Consider combining these maps into a single one...
	// TODO I think I reinvented a bit of backbone here, so I should use backbone directly
	this.nodeToLabel = new Map();
	this.nodeToType  = new Map();
	this.nodeToPos   = new Map();
	this.nodeToFeature = new Map();
	
	
	/*
	this.wayToLabel   = new Map();
	this.wayToType    = new Map();
	this.wayToGeo     = new Map();
	*/
	this.wayToFeature = new Map();

	
	// Model classes for the facets
	this.schemaIcons = new MapCollection();	
	this.schemaLabels = new LabelCollection();
	this.classHierarchy = new BidiMultiMap();

	// Reference to the OpenLayers map
	this.map = null;
	
	//this.propertyHierarchy = new PropertyHierarchy();

} 

SpatialSemanticBrowsing.prototype = {
	init: function() {
		var self = this;
		
		this.initWidgets();
		this.initEvents();
		
		// Hacky: classes, labels and icons are fetched in separate requests. The rendering renders as much as what's there.
		// Do proper events so that we can guarantee that all information is available
		setTimeout(function() { self.mapEvent(); }, 1000);
		setTimeout(function() { self.mapEvent(); }, 4000);		
	},

	initWidgets: function() {
		
		this.notificationScheduler = new Scheduler();
		
		// Initialize the widgets
		$("#map").ssb_map({
			nodeToPos: this.nodeToPos,
			nodeToFeature: this.nodeToFeature,
			wayToFeature: this.wayToFeature,
			instanceToLabel: this.nodeToLabel,
			nodeToType: this.nodeToType,
			schemaIcons: this.schemaIcons
		});

		$("#instances").ssb_instances({
			instanceToLabel: this.nodeToLabel,
			instanceToType: this.nodeToType,
			schemaIcons: this.schemaIcons
		});
		
		$("#facets").ssb_facets({
			schemaIcons: this.schemaIcons,
			schemaLabels: this.schemaLabels,
			classHierarchy: this.classHierarchy,
			selection: this.selection
		});

		$("#facts").ssb_facts({});

		
		this.map = $("#map").data("ssb_map").map;
		this.facts = $("#facts").data("ssb_facts");

		// TODO: Do not depend directly on map, but on a "visible area"
		$("#searchResults").ssb_search({map: this.map});
	},
	
	initEvents: function() {
		var self = this;
		
		$("#facets").bind("ssb_facetschanged", function(event, ui) {
			self.mapEvent();
		});
		
		$("#instances").bind("ssb_instancesclick", function(event, ui) {
			self.onInstanceClicked(ui.key);		
		});
		
		$("#map").bind("ssb_maponmarkerclick", function(event, ui) {
			self.onInstanceClicked(ui.nodeId);
		});
		
		$("#map").bind("ssb_maponmapevent", function(event, ui) {
		
			self.mapEvent();
			// Bind the map-event to the updateXXXXX
			// If everytihng is done, fire an event updateView
			// Refresh the view whenever it is sent
		});
	},
	
	refresh: function(bounds) {
		var self = this;

		this.backend.fetchClasses(bounds, function(uris) { self.updateClasses(uris); });
		this.backend.fetchNodes(bounds, function(o) { self.updateNodes(o); });
		this.backend.fetchWayGeometries(bounds, function(data) {self.updateGeometries(data); });
	},
	
	mapEvent: function() {
		var map = this.map;
		//var map = ui.map;
		//console.log(event);
		//console.log(ui);
		
		var zoom = map.getZoom();
		var bounds = map.getExtent().transform(map.projection, map.displayProjection);

		var minZoom = 15;
		
		if(zoom < minZoom) {
			self.notificationScheduler.schedule(function() { notify("Info", "Disabled fetching data because current zoom level " + zoom + " is less than the minimum " + minZoom + ".");});
			return;
		}
		
		this.refresh(bounds);
	},
	
	/*
	autoconfigureSparqlEndpoint: function(serviceUrl, defaultGraphs) {
		var service = new VirtuosoSparqlService(serviceUrl, defaultGraphs); //"src/main/php/sparql-proxy-dbpedia.php", ["http://dbpedia.org"]);
		
		setSparqlEndpoint(service);
	},*/
	
	setBackend: function(backend) {
		this.backend = backend;
	},

	setSparqlService: function(sparqlService) {
		this.sparqlService = sparqlService;
	},
	
	updateClasses: function(uris) {
		var self = this;
		
		var facets = uris;
		
		// Check for which facets we need to load the labels
		var labelsToLoad = [];
		var iconsToLoad = [];
		var superClassesToFetch = [];
		for(var uri in facets) {
			var label = self.schemaLabels.get(uri, self.activeLanguage);
			if(!label) {
				labelsToLoad.push(uri);
			}
			
			var icon = self.schemaIcons.get(uri);
			if(!icon) {
				iconsToLoad.push(uri);
			}

			if(!(uri in self.classHierarchy.forward.entries)) {
				superClassesToFetch.push(uri);
			}
		}

		// TODO Update Icons and Labels
		this.backend.fetchLabels(labelsToLoad, self.activeLanguage, function(map) {self.updateLabels(labelsToLoad, map); });
		this.backend.fetchIcons(iconsToLoad, function(map) {self.updateIcons(iconsToLoad, map); } );
		
		//this.fetchSuperClasses(superClassesToLoad);
		
		//this.backend.fetchTransitiveSuperClasses(superClassesToFetch, self.classHierarchy);
		fetchTransitiveSuperClasses(self.sparqlService, superClassesToFetch, self.classHierarchy);
		removeReflexivity(self.classHierarchy);
		
		$("#facets").data("ssb_facets").setFacets(uris);
	},
		
	
	updateLabels: function(uris, map) {					
		var self = this;
		//var uris = labelsToLoad;
		
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
		//for(uri in uris) {
			var label = uri in map ? map[uri] : "(missing label)";
			
			self.schemaLabels.put(uri, self.activeLanguage, label);
		}
		//console.log(self.schemaLabels);
	},
		
	updateIcons: function(uris, map) {

		var self = this;

		//var uris = iconsToLoad;
		
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
		//for(uri in uris) {
			var icon = uri in map ? map[uri] : "(missing icon)";
			
			self.schemaIcons.put(uri, icon);
		}


		/*
		var self = this;

		for(var i = 0; i < map.lenght; ++i) {
			var uri = uris[i];
			var icon = uri in map ? map[uri] : null;
			
			self.schemaIcons.put(uri, icon);
		}*/
	},
	
	
	updateNodes: function(o) {
		var self = this;

		//self.markerLayer.clearMarkers();
		
		// Remove all types and labels
		self.nodeToType.removeAll(getKeys(self.nodeToPos));
		self.nodeToLabel.clear(); //removeAll(getKeys(self.nodeToPos));
		self.nodeToPos.clear();
		
		//console.log(o);
		for(var s in o.nodeToPoint) {

			self.nodeToType.put(s, o.nodeToType[s]);
			//self.nodeToLabels.put(s, this.activeLanguage, o.nodeToLabels[s]);
			self.nodeToLabel.put(s, o.nodeToLabel[s]);
			self.nodeToPos.put(s, o.nodeToPoint[s]);
			
			/*
			var point = o.nodeToPoint[s];
			if(point) {
				addMarker(point, s);
			}*/			
		}			
	},
	
	updateGeometries: function(data) {
		var self = this;
		var map = this.map;
		
		this.wayToFeature.clear();
		
		for(var key in data) {
			var tmpPoints = data[key];

			// Transform all of the points into screen(?)-space
			var points = [];
			for(var i = 0; i < tmpPoints.length; ++i) {
			 	var point = tmpPoints[i];

			 	points.push(point.transform(map.displayProjection, map.projection));
			}
		
			//console.log(map);
			
		    // create a polygon feature from a list of points
		    var linearRing = new OpenLayers.Geometry.LinearRing(points);
		    var style_green =
		    {
		        strokeColor: "#00AA00",
		        strokeOpacity: 0.7,
		        strokeWidth: 2,
		        fillColor: "#00FF00",
		        fillOpacity: 0.2
		    };

		    var polygonFeature = new OpenLayers.Feature.Vector(linearRing, null, style_green);
			
		    // TODO: Add the polygon to the model
		    self.wayToFeature.put(key, polygonFeature);
		    //self.vectorLayer.addFeatures([polygonFeature]);
		}
	},
	
	onInstanceClicked: function(uri) {
		var self = this;
		
		if(this.selectedFeature) {
			var icon = this.selectedFeature.marker.icon;
			var size = new OpenLayers.Size(icon.size.w - 15, icon.size.h - 15);
			icon.setSize(size);
			icon.setUrl("http://www.openlayers.org/dev/img/marker.png");
		}
		
		
		var feature = self.nodeToFeature.get(uri);

		this.selectedFeature = feature;

		if(feature) {
			// TODO FFS Why did I use select rather than construct here?
			self.backend.fetchStatementsBySubject([uri], function(jsonRdf) {
				
				var point = feature.lonlat.clone().transform(self.map.projection, self.map.displayProjection);
				
				var icon = feature.marker.icon;
				
				// FIXME Update the position when changing the size
				// FIXME Make the handling of the icons nicer
				var size = new OpenLayers.Size(icon.size.w + 15, icon.size.h + 15);
				if(icon.url == "http://www.openlayers.org/dev/img/marker.png") {
					icon.setUrl("http://www.openlayers.org/dev/img/marker-gold.png");
				}
				
	            icon.setSize(size);  
				
				//console.log(point);
				
				
				//console.log(feature);
				//console.log(jsonRdf);
				//var tags = extractTags(jsonRdf);			
				
				self.facts.setData(uri, [jsonRdf]);
				$("#facts").slideDown("slow");
				
				
				
				// If there are any same as links, try to fetch something from DBpedia
				console.log(jsonRdf);
				//var objects = JsonRdfExtractionUtils.extractObjects(jsonRdf, uri, "http://www.w3.org/2002/07/owl#sameAs");
				var tags = extractTags(jsonRdf);
				
				objects = "owl:sameAs" in tags ? tags["owl:sameAs"] : [];
				
				
				for(var i = 0; i < objects.length; ++i) {
					
					var object = objects[i]; //.value;
					if(object.startsWith("http://dbpedia.org/resource/")) {
						
						self.backendDBpedia.fetchStatementsBySubject([object], function(jsonRdf2) {
							self.facts.setData(uri, [jsonRdf, jsonRdf2]);
						});
						
					}
					
				}
			});
		}
	}
};




function sparqlQueryTest(baseURL, query, callback, format) {
	if(!format)
		format="text";
	
	/*
	var params={
		"default-graph": "", "should-sponge": "soft", "query": query,
		"debug": "on", "timeout": "", "format": format,
		"save": "display", "fname": ""
	};
	*/
	var params={
			"default-graph": "http://linkedgeodata.org", "query": query,
			"format": format,
	};

	
	var querypart="";
	for(var k in params) {
		querypart+=k+"="+encodeURIComponent(params[k])+"&";
	}
	var queryURL=baseURL + '?' + querypart;
	
	
	$.ajax(queryURL, callback);	
}


function doSearch() {
	//notify("Info", "Search");
	//$("#searchResults").html("searching");
	$("#searchResults").slideUp("slow");
	
	
	var searchValue = encodeURI($('#search-field').val());

	var url = "src/main/php/search_proxy.php?query=" + searchValue;
	//console.log(url);
	$.ajax(url, {
		failure: function() {notify("Something went wrong"); },
		success: function(response) {
			
			var json = response;
			
			var items = [];
			for(var i = 0; i < json.length; ++i) {
				
				var item = json[i];				
				
				var nameParts = item.display_name.split(",");
								
				var tmp = {
						name: nameParts[0],
						description: nameParts[1],
						lonlat: new OpenLayers.LonLat(item.lon, item.lat)
				};
				
				
				items.push(tmp);
			}
			
			$("#searchResults").data("ssb_search").setItems(items);
			$("#searchResults").slideDown("slow");
		}
	});
}


