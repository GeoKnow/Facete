

var qtm = Namespace("org.aksw.ssb.collections.QuadTreeModel");


/**
 * Determines the set of types that are not subsumed by another type
 * @param classHierarchy
 * @param types
 */
function getMostSpecificClasses(classHierarchy, types) {
	
}



function SelectionHighlighterController() {

}

SelectionHighlighterController.prototype.x = function() {
	
};


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
	this.queryFactory = null;

	// TODO Actually multi selection would be cool
	this.selection = new Set();

	// The currently selected feature
	// FIXME Change to something like "selectedResource", so we can track
	// the active feature between mapEvents (features get destroyed on map events)
	//this.selectedFeature = undefined;

	
	// The active language
	this.activeLanguage = "fr";

	
	// Model classes for the instances
	// TODO Consider combining these maps into a single one...
	// TODO I think I reinvented a bit of backbone here, so I should use backbone directly
	this.nodeToLabel = new Map();
	this.nodeToTypes  = new MultiMap();
	this.nodeToPos   = new Map();
	this.nodeToFeature = new Map();
	
	this.typeToCount = {};
	
	//this.idToTypes = new BidiMultiMap();
	
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

	this.quadTreeModel = null;

	
	// Reference to the OpenLayers map
	this.mapWidget = null;
	this.map = null;
	this.instanceWidget = null;
	
	this.test = 0.0;
	
	
	this.facetConfig = null;		

	
	//this.propertyHierarchy = new PropertyHierarchy();

	this.prefixToService = {};
	
	//this.refreshScheduler = new Scheduler();
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
	},

	initEvents: function() {
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

	},
	
	refresh: function(bounds, delay) {
		var self = this;

		
		// 
		//if()
		
		
		/*
		if(delay) {
			this.refreshScheduler.schedule(function() { self.refresh(bounds); });
			return;
		}*/
		

		// First: check the global cache of whether it can provide data for the selected filter criteria
		
		
		// Second: If that fails, use the location cache
		
		
		this.quadTreeModel.setBounds(toQuadTreeBounds(bounds));
		
		//this.backend.fetchClasses(bounds, function(uris) { self.updateClasses(uris); });
		
		//this.backend.fetchNodes(bounds, function(nodeToPos) { self.updateNodePositions(nodeToPos); });
		
		// NOTE OpenLayers bounds to QuadTree.Bounds
		
		//this.backend.fetchNodeTypes(bounds, function(nodeToTypes) { self.updateNodeTypes(nodeToTypes); });
		//this.backend.fetchNodeLabels(bounds, function(nodeToLabel) { self.updateNodeLabels(nodeToLabel); });
		
		//this.backend.fetchWayGeometries(bounds, function(data) {self.updateGeometries(data); });
	},
	
	mapEvent: function() {
		
		//return;
		
		this.test += 0.0005;
		//this.mapWidget.setNodeToPos({"http://test.org":  new OpenLayers.LonLat(-1.0 + this.test, 53.0)});

		var map = this.map;
		//var map = ui.map;
		//console.log(event);
		//console.log(ui);
		
		//var zoom = map.getZoom();
		var bounds = map.getExtent().transform(map.projection, map.displayProjection);

		/*
		var minZoom = 15;
		
		if(zoom < minZoom) {
			self.notificationScheduler.schedule(function() { notify("Info", "Disabled fetching data because current zoom level " + zoom + " is less than the minimum " + minZoom + ".");});
			return;
		}*/
		
		this.refresh(bounds, true);
	},
	
	addFactSources: function(prefixToService) {
		var self = this;

		for(key in prefixToService) {
			self.prefixToService[key] = prefixToService[key];
		}
	},
	
	/*
	autoconfigureSparqlEndpoint: function(serviceUrl, defaultGraphs) {
		var service = new VirtuosoSparqlService(serviceUrl, defaultGraphs); //"src/main/php/sparql-proxy-dbpedia.php", ["http://dbpedia.org"]);
		
		setSparqlEndpoint(service);
	},*/
	
	setQueryFactory: function(queryFactory) {
		this.queryFactory = queryFactory;
	},
	
	setFacetConfig: function(facetConfig) {
		this.facetConfig = facetConfig;
	},
	
	
	setBackend: function(backend) {
		var self = this;
		
		if(this.quadTreeModel) {
			$(this.quadTreeModel).unbind("changed");
		}
		
		this.backend = backend;

		this.quadTreeModel = new qtm.QuadTreeModel(backend);
		
		
		
		$(this.quadTreeModel).bind("changed", function(event, change) {
			
			// Relative method for determining visibility changes in the items 
			/*
			for(var i in change.involvedNodes) {
				var node = change.involvedNodes[i];
				
				var removedItems = change.removedItemsPerNode[i];
				var addedItems = change.addedItemsPerNode[i];

				for(var id in removedItems) {
					self.nodeToLabel.remove(id);

					var types = node.data.idToTypes[id];
					mergeDec(self.typeToCount, types);
				}
				
				for(var id in addedItems) {
					self.nodeToLabel.put(id, node.data.idToLabels[id]);
					
					var types = node.data.idToTypes[id];
					mergeInc(self.typeToCount, types);
				}				
			}*/
			
			
			// Absolute approach
			self.nodeToLabel.clear();
			self.typeToCount = {};
			for(var i in change.newNodes) {
				var node = change.newNodes[i];
				
				for(var id in node.idToPos) {
					var pos = node.idToPos[id];
					
					if(!change.newBounds.containsPoint(pos)) {
						continue;
					}
					
					//self.nodeToLabel.put(id, node.data.idToLabels[id]);
					
					var types = node.data.idToTypes[id];
					
					mergeInc(self.typeToCount, types);
				}
			}
			
			
			
			
			//console.log(self.typeToCount);
			self.updateClasses(self.typeToCount);
			
			//console.log(classUris);
			//console.log("Number of visible items is " + _.keys(self.nodeToLabel.entries).length);
						
						
			// Remove markers of removed nodes
			for(var i in change.removedNodes) {
				var node = change.removedNodes[i];
				
				if(node.isLoaded) {
					var ids = _.keys(node.idToPos);					
					self.mapWidget.removeItems(ids);
				} else {
					self.mapWidget.removeBox(node.getBounds().toString());
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
						self.mapWidget.addItem(id, lonlat);
					}
				} else {
					self.mapWidget.addBox(node.getBounds().toString(), toOpenLayersBounds(node.getBounds()));
				}
			}
			
			
			
			var classFilter = _.keys(self.selection.entries);
			
			// Perform the filtering
			for(var i in change.newNodes) {
				var node = change.newNodes[i];
				
				for(var id in node.idToPos) {
					var pos = node.idToPos[id];
					
					if(!change.newBounds.containsPoint(pos)) {
						continue;
					}
										
					var types = _.keys(node.data.idToTypes[id]);
					
					
					if(classFilter.length === 0 || _.intersection(classFilter, types).length !== 0) {
						self.mapWidget.setVisible(id, true);						
						self.nodeToLabel.put(id, node.data.idToLabels[id]);
					} else {
						self.mapWidget.setVisible(id, false);
					}
				}
			}
			
			self.instanceWidget.refresh();	
		});		
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
		
		//$("#facets").data("ssb_facets").setFacets(uris);
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
	
	
	updateNodeTypes: function(nodeToTypes) {
		for(var id in nodeToTypes) {
			this.nodeToTypes.putAll(id, nodeToTypes[id]);
		}		
	},
	
	
	updateNodeLabels: function(nodeToLabel) {
		this.nodeToLabel.clear();
		
		for(var id in nodeToLabel) {
			//self.nodeToLabels.putAll(id, nodeToLabels[id]);
			this.nodeToLabel.put(id, nodeToLabel[id]);
		}				
	},
	
	updateNodePositions: function(nodeToPoint) {
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
	
	enableHighlight: function(feature) {
		var icon = feature.marker.icon;
		
		// FIXME Update the position when changing the size
		// FIXME Make the handling of the icons nicer
		if(icon.url === "src/main/resources/icons/markers/marker.png") {
			icon.setUrl("src/main/resources/icons/markers/marker-gold.png");
		}
		
		var size = new OpenLayers.Size(icon.size.w + 15, icon.size.h + 15);
        icon.setSize(size);  
	},
	
	disableHighlight: function(feature) {
		var icon = feature.marker.icon;
		var size = new OpenLayers.Size(icon.size.w - 15, icon.size.h - 15);
		icon.setSize(size);
		icon.setUrl("src/main/resources/icons/markers/marker.png");		
	},
	
	
	onInstanceClicked: function(uri) {
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
			
			var json = response,
				items = [],
				len = json.length,
				item = 0,
				nameParts = 0,
				tmp = 0;
			
			for(var i = 0; i < len; ++i) {
				
				item = json[i];				
				
				nameParts = item.display_name.split(",");
				
				items.push({
					name: nameParts[0],
					description: nameParts[1],
					lonlat: new OpenLayers.LonLat(item.lon, item.lat)
				});
			}
			
			$("#searchResults").data("ssb_search").setItems(items);
			$("#searchResults").slideDown("slow");
		}
	});
}


