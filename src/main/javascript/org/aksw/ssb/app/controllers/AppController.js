(function($) {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");
		
	var qt = Namespace("org.aksw.ssb.collections.QuadTree");
	var qtm = Namespace("org.aksw.ssb.collections.QuadTreeModel");
	var qtc = Namespace("org.aksw.ssb.collections.QuadTreeCache");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	var geovocab = Namespace("org.aksw.ssb.vocabs.geovocab");
	var rdf = Namespace("org.aksw.ssb.vocabs.rdf");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");

	
	var collections = Namespace("org.aksw.ssb.collections");
	
	var ns = Namespace("org.aksw.ssb.app.controllers");


	/**
	 * A view state consists of the visible bounds, the corresponding
	 * (quad tree) nodes TODO: and the cache?
	 * 
	 * @param cache
	 * @returns {ns.ViewState}
	 */
	ns.ViewState = function(nodes, bounds) {
		this.nodes = nodes;
		this.bounds = bounds; //null; //new qt.Bounds(-9999, -9998, -9999, -9998);
	};
	
	
	/*
	ns.QueryCacheGeo = function(sparqlService, baseQuery, geoConstraint) {
		this.sparqlService = sparqlService;
		this.baseQuery = baseQuery;
		this.geoConstraint = geoConstraint;
		
		this.quadTreeModel = new collections.QuadTreeModel();
	};
	
	ns.QueryCacheGeo.prototype.execute = function(bounds, callback) {
		
	};
	*/
	
	
	/**
	 * The main class for the Spatial Semantic Browsing Widgets.
	 * Holds references to model classes, and can initialize the controller.
	 * 
	 * 
	 * @returns {AppController}
	 */
	ns.AppController = function(options) {
		this.sparqlService = null;
		this.queryGenerator = new ns.QueryGenerator(options.queryGenerator);
		
		this.queryFactory = null;
	
		this.selection = new collections.Set();
	
		// The currently selected feature
		// FIXME Change to something like "selectedResource", so we can track
		// the active feature between mapEvents (features get destroyed on map events)
		//this.selectedFeature = undefined;
			
		// The active language
		this.activeLanguage = "fr";
	

		//this.quadTreeModel = null;
	
		this.nodeToLabel = new collections.Map();
		this.nodeToTypes  = new collections.MultiMap();
		this.nodeToFeature = new collections.Map();
		this.schemaIcons = new MapCollection();	

		
		// Reference to the OpenLayers map
		this.mapWidget = null;
		this.map = null;
		this.instanceWidget = null;
		
		// Maps prefixes to DescribeService's that provide additional information about
		// resources
		this.prefixToService = {};
		
		
		// query cache; maps a base query to a quad tree model
		this.hashToCache = {};
		
		this.viewState = new ns.ViewState();
	};
	
	
	
	
	ns.AppController.prototype.init = function() {
		var self = this;
		
		this.initWidgets();
		this.initEvents();		
	};
	
		
	ns.AppController.prototype.initWidgets = function() {
		
		// Initialize the widgets
		$("#map").ssb_map({
			nodeToPos: this.nodeToPos,
			nodeToFeature: this.nodeToFeature,
			wayToFeature: this.wayToFeature,
			instanceToLabel: this.nodeToLabel,
			nodeToTypes: this.nodeToTypes,
			schemaIcons: this.schemaIcons
		});

		$("#instances").ssb_instances({
			instanceToLabel: this.nodeToLabel,
			instanceToType: this.nodeToTypes,
			schemaIcons: this.schemaIcons
		});
		this.instanceWidget = $("#instances").data("ssb_instances");
		
		/*
		$("#facets").ssb_facets({
			schemaIcons: this.schemaIcons,
			schemaLabels: this.schemaLabels,
			classHierarchy: this.classHierarchy,
			selection: this.selection
		});
		*/

		$("#facts").ssb_facts({});

		//$("#browsebox").ssb_browsebox({});
		
		this.mapWidget = $("#map").data("ssb_map");
		this.map = this.mapWidget.map;
		this.facts = $("#facts").data("ssb_facts");

		// TODO: Do not depend directly on map, but on a "visible area"
		$("#searchResults").ssb_search({map: this.map});		
	};
	
	
	ns.AppController.prototype.initEvents = function() {
		var self = this;
		
		/*
		$("#facets").bind("ssb_facetschanged", function(event, ui) {
			//var sel = $("#facets").data;
			//console.log("Selection is:");
			//console.log(self.selection);
			//self.queryFactory.setClassFilter(self.selection);
			
			
			self.mapEvent();
		});*/
		
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
		
		
		Dispatcher.register("selection", null, function(ev, uri) {
			// Fetch 
		});
		
		Dispatcher.register("selection", null, function(ev, uri) {
			
			// TODO FFS Why did I use select rather than construct here?
			fetchStatementsBySubject(self.sparqlService, [uri], {				
				failure: function() { Console.err("Error executing Sparql query"); },
				success: function(jsonRdf) {
				
					self.facts.setData(uri, [jsonRdf]);
					$("#facts").slideDown("slow");
					
					
					
					// If there are any same as links, try to fetch something from
					// additional sources (e.g. DBpedia)
					console.log(jsonRdf);
					//var objects = JsonRdfExtractionUtils.extractObjects(jsonRdf, uri, "http://www.w3.org/2002/07/owl#sameAs");
					var tags = extractTags(jsonRdf);
					
					objects = "owl:sameAs" in tags ? tags["owl:sameAs"] : [];
					
					for(prefix in self.prefixToService) {
						var service = self.prefixToService[prefix];
					
						for(var i = 0; i < objects.length; ++i) {
							
							var object = objects[i]; //.value;
							if(object.startsWith(prefix)) {
								fetchStatementsBySubject(service, [object], function(jsonRdf2) {
									self.facts.setData(uri, [jsonRdf, jsonRdf2]);
								});
							}
							
						}
					}
				}
			});
		});

	};


	ns.AppController.prototype.refresh = function(olBounds, delay) {
		var self = this;
		
		// We are dealing with quad-tree-bounds here
		var bounds = toQuadTreeBounds(olBounds);

		// TODO Check if another refresh request is running.
		// If so, make this request wait for the other running one, thereby
		// replacing any other already pending request

		var geoQueryFactory = this.queryGenerator.createQueryFactory();
		
		var query = geoQueryFactory.create(bounds);
		
		//console.warn("BaseQuery", queryFactory.baseQuery.toString());
		//console.warn("BBoxQuery", query.toString());
		
		
		var baseQuery = geoQueryFactory.baseQuery; //queryFactory.create(bounds);
		 
		var hash = baseQuery.toString();
		console.debug("Query hash (including facets): ", hash);
		
		
		var cacheEntry = this.hashToCache[hash];
		if(!cacheEntry) {
			// TODO (Maybe) this should not be the driver variable, but the geometry variable
			// (As each geometry will get its own marker on the map)
			var backend = new qtc.Backend(this.sparqlService, geoQueryFactory, this.queryGenerator.driver.variable);
			
			cacheEntry = new qtc.QuadTreeCache(backend);
			//cacheEntry = new qt.QuadTree(maxBounds, 18, 0);
			this.hashToCache[hash] = cacheEntry;
		}
		
		cacheEntry.load(bounds, {
			success: function(nodes, bounds) {
				console.log("Loaded " + nodes.length + " nodes");

				// TODO Fix qtc.diff so we can use it here to optimize the update
				
				self.updateViews(new ns.ViewState(nodes, bounds));
			}
		});
	};
		
	ns.AppController.prototype.mapEvent = function() {

		var map = this.map;
		var bounds = map.getExtent().transform(map.projection, map.displayProjection);

		/*
		var minZoom = 15;
		
		if(zoom < minZoom) {
			self.notificationScheduler.schedule(function() { notify("Info", "Disabled fetching data because current zoom level " + zoom + " is less than the minimum " + minZoom + ".");});
			return;
		}*/
		
		this.refresh(bounds, true);
	};
		
	ns.AppController.prototype.addFactSources = function(prefixToService) {
		var self = this;

		for(key in prefixToService) {
			self.prefixToService[key] = prefixToService[key];
		}
	};
		
	ns.AppController.prototype.setQueryFactory = function(queryFactory) {
		this.queryFactory = queryFactory;
	};
	
	ns.AppController.prototype.setFacetConfig = function(facetConfig) {
		this.facetConfig = facetConfig;
	};
	
	
	ns.AppController.extract = function(jsonRdf) {
		//for(var i = 0; i < jsonRdfs.result.bindings)
	};
	
	ns.AppController.prototype.updateViews = function(newState) {

		this.mapWidget.markerLayer.clearMarkers();
		
		console.log("Updating views");
		
		var o = this.viewState;
		var n = newState;
		
		var change = qtc.diff(o.nodes, n.nodes, o.bounds, n.bounds);
		console.log("Change: ", change, newState);
		
		

		var idToGeom = new facets.MultiMap();
		var geomToId = new facets.MultiMap();

		var geomToPoint = {};
		var idToLabel = {}; new collections.Map();
		var visible = {};
		for(var i = 0; i < change.nodes.length; ++i) {
			var node = change.nodes[i];
			var state = change.states[i];

			if(!node.isLoaded) {
				continue;
			}

			
			var graph = node.data.graph;
			//console.debug("Graph size: ", graph);
			var rdf = $.rdf({databank: graph});
			
			var geomToX = {};
			var geomToY = {};

			
			rdf.where("?geom " + geo.long + " ?x .").each(function() {
				geomToX[this.geom] = this.x.value;
			});
			
			rdf.where("?geom " + geo.lat + " ?y").each(function() {
				geomToY[this.geom] = this.y.value;
			});

			var nodeGeomToPoint = {};
			for(var geom in geomToX) {
				if(geom in geomToY) {
					var point = new qt.Point(geomToX[geom], geomToY[geom]);
					//var ll = new OpenLayers.LonLat(point.x, point.y);
					nodeGeomToPoint[geom] = point;
				}
			}

			_.extend(geomToPoint, nodeGeomToPoint);
			

			var nodeIdToGeom = {};
			rdf.where("?id " + geovocab.geometry + " ?geom").each(function() {
				nodeIdToGeom[this.id] = this.geom;
				
				idToGeom.put(this.id, this.geom);
				geomToId.put(this.geom, this.id);
			});
			
			rdf.where("?id " + rdfs.label + " ?label").each(function() {
				idToLabel[this.id] = this.label.value;
				//idToLabel.put(this.id, this.label);
			});
			
			
			switch(state) {
			case qtc.NOTHING: break;
			case qtc.ADDED:
				
				break;
			case qtc.REMOVED:
				
				break;
			case qtc.SHIFTED:
				break;
			default:
				console.error("Should not happen.");
				break;				
			}

			var idToP = {};
			for(var id in nodeIdToGeom) {//idToGeom.entries) {
				//console.log("nodeIdToGeom", nodeIdToGeom);
				var geoms = [nodeIdToGeom[id]];
				//var geoms = idToGeom.entries[id];
				for(var j = 0; j < geoms.length; ++j) {
					var geom = geoms[j];
					
					if(geom && geom in nodeGeomToPoint) {
						var point = nodeGeomToPoint[geom];
						
						idToP[id] = point;
			
						if(newState.bounds.containsPoint(point)) {
							visible[id] = true;
						}

					}
				}
			}

			node.idToPos = idToP;
			//console.log("idToP", idToP);			
		}
		
		
		//continue;		
		// Absolute approach
		this.nodeToLabel.clear();

		for(var id in visible) {
			var label = id in idToLabel ? idToLabel[id] : "(no label)";
			
			this.nodeToLabel.put(id, label);
		}
		//console.log("NodeToLabel", this.nodeToLabel);
		//console.log("IdToLabel", idToLabel);
		//console.log("visible", visible);
			
					
		// Remove markers of removed nodes
		for(var i in change.removedNodes) {
			var node = change.removedNodes[i];
			
			if(node.isLoaded) {
				var ids = _.keys(node.idToPos);					
				this.mapWidget.removeItems(ids);
			} else {
				this.mapWidget.removeBox(node.getBounds().toString());
			}
		}
	
	
		// Add markers of new nodes
		for(var i in change.addedNodes) {
			var node = change.addedNodes[i];
			
			//if(node.infMinItemCount && node.idToPos.length != 0) {
			if(node.isLoaded) {
				for(var id in node.idToPos) {
					var pos = node.idToPos[id];
					var lonlat = new OpenLayers.LonLat(pos.x, pos.y);
					//console.debug("Adding marker", id, pos, lonlat);
					
					this.mapWidget.addItem(id, lonlat, true);
				}
			} else {
				this.mapWidget.addBox(node.getBounds().toString(), toOpenLayersBounds(node.getBounds()));
			}
		}
		
		this.instanceWidget.refresh();		
	};
	
	ns.AppController.prototype.setSparqlService = function(sparqlService) {
		this.sparqlService = sparqlService;
	};
		
	ns.AppController.prototype.updateClasses = function(uris) {
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
		
		//$("#facets").data("ssb_facets").setFacets(uris);
	};
			
		
	ns.AppController.prototype.updateLabels = function(uris, map) {					
		var self = this;
		//var uris = labelsToLoad;
		
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
		//for(uri in uris) {
			var label = uri in map ? map[uri] : "(missing label)";
			
			self.schemaLabels.put(uri, self.activeLanguage, label);
		}
		//console.log(self.schemaLabels);
	};
			
	ns.AppController.prototype.updateIcons = function(uris, map) {

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
	};
		
		
	ns.AppController.prototype.updateNodeTypes = function(nodeToTypes) {
		for(var id in nodeToTypes) {
			this.nodeToTypes.putAll(id, nodeToTypes[id]);
		}		
	};
		
		
	ns.AppController.prototype.updateNodeLabels = function(nodeToLabel) {
		this.nodeToLabel.clear();
		
		for(var id in nodeToLabel) {
			//self.nodeToLabels.putAll(id, nodeToLabels[id]);
			this.nodeToLabel.put(id, nodeToLabel[id]);
		}				
	};
		
	ns.AppController.prototype.updateNodePositions = function(nodeToPoint) {
		console.log("updateNodes");
		var self = this;

		//self.markerLayer.clearMarkers();
		
		// Remove all types and labels
		//self.nodeToTypes.removeAll(getKeys(self.nodeToPos));
		//self.nodeToLabel.clear(); //removeAll(getKeys(self.nodeToPos));
		//self.nodeToPos.clear();
		
		for(var s in nodeToPoint) {

			//self.nodeToTypes.put(s, o.nodeToType[s]);
			//self.nodeToLabels.put(s, this.activeLanguage, o.nodeToLabels[s]);
			//self.nodeToLabel.put(s, o.nodeToLabel[s]);
			self.nodeToPos.put(s, nodeToPoint[s]);
			

			/*
			var point = o.nodeToPoint[s];
			if(point) {
				addMarker(point, s);
			}*/			
		}
		
		this.mapWidget.setNodeToPos(self.nodeToPos.entries);
	};
	
		
		
		
		
	
	ns.AppController.prototype.updateGeometries = function(data) {
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
	};
		
	ns.AppController.prototype.enableHighlight = function(feature) {
		var icon = feature.marker.icon;
		
		// FIXME Update the position when changing the size
		// FIXME Make the handling of the icons nicer
		if(icon.url === "src/main/resources/icons/markers/marker.png") {
			icon.setUrl("src/main/resources/icons/markers/marker-gold.png");
		}
		
		var size = new OpenLayers.Size(icon.size.w + 15, icon.size.h + 15);
        icon.setSize(size);  
	};
		
	ns.AppController.prototype.disableHighlight = function(feature) {
		var icon = feature.marker.icon;
		var size = new OpenLayers.Size(icon.size.w - 15, icon.size.h - 15);
		icon.setSize(size);
		icon.setUrl("src/main/resources/icons/markers/marker.png");		
	};
		
		
	ns.AppController.prototype.onInstanceClicked = function(uri) {
		Dispatcher.fireEvent("selection", uri);
		
		console.log("Clicked: " + uri);
		var self = this;

		if(this.selectedFeature) {
			this.disableHighlight(this.selectedFeature);
		}
		
		var feature = self.nodeToFeature.get(uri);
		

		this.selectedFeature = feature;

		if(feature) {
			this.enableHighlight(feature);
		}
	};
	
	
	
	
	ns.AppController.doSearch = function() {
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
	};
	
})(jQuery);

