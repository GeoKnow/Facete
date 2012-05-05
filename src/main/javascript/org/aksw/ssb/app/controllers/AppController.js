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

	
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	var facetbox = Namespace("org.aksw.ssb.widgets.facetbox");
	var widgets = Namespace("org.aksw.ssb.widgets"); 

	
	var collections = Namespace("org.aksw.ssb.collections");
	
	var ns = Namespace("org.aksw.ssb.app.controllers");


	/**
	 * A view state consists of the visible bounds, the corresponding
	 * (quad tree) nodes TODO: and the cache?
	 * 
	 * @param cache
	 * @returns {ns.ViewState}
	 */
	ns.ViewState = function(nodes, bounds, visibleGeoms) {
		this.nodes = nodes;
		this.bounds = bounds; //null; //new qt.Bounds(-9999, -9998, -9999, -9998);
		this.visibleGeoms = visibleGeoms ? visibleGeoms : [];
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
		
		//this.geomToId = new facets.MultiMap(); 
		
		this.hoveredItems = [];
		
		// Maps prefixes to DescribeService's that provide additional information about
		// resources
		this.prefixToService = {};
		
		
		// query cache; maps a base query to a quad tree model
		this.hashToCache = {};
		
		this.viewState = new ns.ViewState();
		
		// A wrapper for a rdfquery databank which keeps track of how often a triple was added
		this.multiGraph = new collections.MultiGraph();
		
		
		this.labelFetcher = null;		
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

		//$("#facts").ssb_facts({});

		//var describer = new widgets.Describer(this.sparqlService);
		this.factBox = widgets.createResourceWidget(this.sparqlService);
		$$.document.append(this.factBox, "#box-facts");
		
		//this.factBox.controller.setNodes([sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/beneficiary")]);
		
		//$("#facts").append(this.factBox.view());
		
		
		//$("#browsebox").ssb_browsebox({});
		
		this.mapWidget = $("#map").data("ssb_map");
		this.map = this.mapWidget.map;
		//this.facts = $("#facts").data("ssb_facts");

		// TODO: Do not depend directly on map, but on a "visible area"
		$("#searchResults").ssb_search({map: this.map});
		
		
		// Facet box
		var queryGenerator = this.queryGenerator;
		var constraints = queryGenerator.constraints;
		
		//var facetConfig = new facetbox.FacetConfig(1001, 10001);
		var facetConfig = new facetbox.FacetConfig(1001, null);
		
		this.facetState = new facetbox.FacetState(facetConfig, queryGenerator.driver, queryGenerator.pathManager);
				
		
		var facetBoxBackend = new facetbox.FacetValueBackendSparql(this.sparqlService, this.labelFetcher);
		
		this.facetbox = facetbox.createFacetBox(this.facetState, constraints, facetBoxBackend);
		$$.document.append(this.facetbox, "#facets-tab");
	};
	
	ns.AppController.prototype.showDescription = function(nodes) {
		this.factBox.controller.setNodes(nodes);
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

		$("#instances").bind("ssb_instanceshover", function(event, ui) {
			self.onInstanceHover(ui.key);
		});
		
		$("#instances").bind("ssb_instancesunhover", function(event, ui) {
			self.onInstanceUnhover(ui.key);
		});

		
		$("#map").bind("ssb_maponmarkerclick", function(event, ui) {
			self.onInstanceClicked(ui.nodeId);
		});
		
		
		
		$("#map").bind("ssb_maponmapevent", function(event, ui) {
		
			self.repaint();
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
				
					//self.facts.setData(uri, [jsonRdf]);
					//$("#facts").slideDown("slow");
					
					
					
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
									//self.facts.setData(uri, [jsonRdf, jsonRdf2]);
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
		//console.log("Refresh bounds", bounds);

		// TODO Check if another refresh request is running.
		// If so, make this request wait for the other running one, thereby
		// replacing any other already pending request

		var disableConstraints = true;
		
		var geoQueryFactory = this.queryGenerator.createQueryFactory({disableConstraints: disableConstraints});
		
		//var query = geoQueryFactory.create(bounds);
		
		//console.warn("BaseQuery", queryFactory.baseQuery.toString());
		//console.warn("BBoxQuery", query.toString());
		
		
		console.log("Constraints", this.queryGenerator.constraints);
		var baseQuery = geoQueryFactory.baseQuery; //queryFactory.create(bounds);
		 
		var hash = baseQuery.toString();
		console.debug("Query hash (including facets): ", hash);
		
		
		var cacheEntry = this.hashToCache[hash];
		if(!cacheEntry) {
			// TODO (Maybe) this should not be the driver variable, but the geometry variable
			// (As each geometry will get its own marker on the map)
			var countGeoQueryFactory = this.queryGenerator.createQueryFactory({disableConstraints: true});
			
			var backend = new qtc.Backend(this.sparqlService, geoQueryFactory, this.queryGenerator.driver.variable, countGeoQueryFactory);
			
			cacheEntry = new qtc.QuadTreeCache(backend);
			//cacheEntry = new qt.QuadTree(maxBounds, 18, 0);
			this.hashToCache[hash] = cacheEntry;
		}
		
		cacheEntry.load(bounds, {
			success: function(nodes, bounds) {
				//console.debug("Loaded " + nodes.length + " nodes");

				// TODO Fix QuadTreeCache.diff so we can use it here to optimize the update
				
				self.updateViews(new ns.ViewState(nodes, bounds));
			}
		});
	};
		
	ns.AppController.prototype.repaint = function() {

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

	/*
	ns.createMap = function(databank, pattern, keyVar, valVar) {
		var result = {};

		rdf.where("?" + keyVar + " " + geo.long + " ?" + valVar).each(function() {
			result[this[keyVar] = this..value;
		});
	};*/
	

	/**
	 * Indexes geometries in the given datastore
	 * 
	 * NOTE Assumes that geometries only have a single lon/lat pair.
	 * If there are multiple ones, an arbitrary pair is chosen.
	 * If there is a lat but no long, or vice versa, the resource does not appear in the output
	 * 
	 * @returns
	 */
	ns.extractGeomsWgs84 = function(databank) {
		var rdf = $.rdf({databank: databank});
		
		var result = {};
		
		var geomToX = {};
		var geomToY = {};
		
		rdf.where("?geom " + geo.long + " ?x .").each(function() {
			geomToX[this.geom.value] = this.x.value;
		});
		
		rdf.where("?geom " + geo.lat + " ?y").each(function() {
			geomToY[this.geom.value] = this.y.value;
		});
		
		for(var geom in geomToX) {
			if(geom in geomToY) {
				var point = new qt.Point(geomToX[geom], geomToY[geom]);
				result[geom] = point;
			}
		}
		
		return result;		
	};

	/**
	 * OPTIMIZE Actually we could cache the counts for nodes that are
	 *     completely contained in the visible area and thereby
	 *     avoid further queries.
	 * 
	 * @param bounds
	 * @param nodes
	 * 
	 */
	/*
	ns.AppController.prototype.updateFacetCounts = function(bounds, nodes) {
		var query = this.createFacetQueryCountVisible(bounds, nodes);
		
		//console.log("Facet Query - Visible", this.viewState.visibleGeoms.length);
		//console.log("Facet Query", query);
		
		this.sparqlService.executeSelect(query.toString(), {
			success: function() {
				//alert("Wee");
			}
		});
	};
	*/
	
	/**
	 * Updates the facet counts based considering all constraints.
	 * This deviates from the usual facet behaviour:
	 * Usally the count of a specific facet is based on an exclusion of all of its constraints.
	 * 
	 * @param uris
	 */
	ns.AppController.prototype.updateFacetCountsGeom = function(uris) {
		var self = this;
		var driver = queryUtils.createFacetQueryCountVisibleGeomNested(this.queryGenerator, uris);
		
		
		// Set the driver of the facet state to the new query element
		this.facetState.driver = driver;
		
		//console.log("Facet Query - Visible", this.viewState.visibleGeoms.length);
		//console.log("Facet Query", query.toString());

		
		// clear the pathManager
		//var propertyToNode = this.facetState.pathManager.getRoot().outgoing;
		this.facetState.clearCounts();
		
		if(!uris.length) {
			//self.facetbox.controller.setState(null);
			self.facetbox.controller.refresh();
			return;
		}

		var state = this.facetState;
		var node = state.pathManager.getRoot();

		//var breadcrumbs = this.facetbox.controller.getVisibleBreadcrumbsValues();
		var propertyNameToItem = this.facetbox.controller.getVisiblePropertiesValues();
		
		// Once all facet counts have been obtained, update the view
		$.when(queryUtils.fetchFacetCountsGeomRec(this.sparqlService, this.labelFetcher, state, node, propertyNameToItem)).then(function(facetState) {
			
			//console.log("facetstate", facetState);
			//self.facetbox.controller.setState(state);
			self.facetbox.controller.refresh();
		});
		
	};

	
	ns.AppController.getLoadedNodes = function(nodes) {
		var result = [];
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			if(!node.data.tooManyItems || node.isLoaded) {
				result.push(node);
			}
		}
		
		return result;
	};
	
	

	
	ns.AppController.prototype.updateViews = function(newState) {

		// TODO Somehow make this work (by magic is would be fine)
		// TODO Facet counts are updated as a reaction to fetching the new state
		//this.updateFacetCounts(newState.bounds, newState.nodes);
		
		
		
		// node       1      2
		// change  
		// instances (only applicable for partially visible nodes)
		
		//console.log("Updating views");
		
		var oldVisibleGeoms = this.viewState.visibleGeoms;
		
		var nodes = newState.nodes; 
		var bounds = newState.bounds;
		
		this.viewState = newState;
		
		var visibleGeoms = [];
		var globalGeomToPoint = {};
		
		this.viewState.visibleGeoms = visibleGeoms;
		
		// Get all geometries from the databanks
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			var nodeBounds = node.getBounds();
			
			var databank = node.data.graph;
			var geomToPoint = node.data.geomToPoint ? node.data.geomToPoint : ns.extractGeomsWgs84(databank);

			// Attach the info to the node, so we reuse it the next time
			node.data.geomToPoint = geomToPoint;
			
			_.extend(globalGeomToPoint, geomToPoint);
			
			var geoms = _.keys(geomToPoint);
			
			
			// If the node is completely in the bounds, we can skip the boundary check
			if(bounds.contains(nodeBounds)) {
				
				visibleGeoms.push.apply(visibleGeoms, geoms);
				
			} else if(bounds.isOverlap(nodeBounds)) {
			
				//for(var geom in geoms) {
				for(var j = 0; j < geoms.length; ++j) {
					var geom = geoms[j];
					var point = geomToPoint[geom];
					
					//console.log("point is: ", geomToPoint);
					
					if(bounds.containsPoint(point)) {
						visibleGeoms.push(geom);
					}
				}
				
			}
		}
		
		//console.log("Number of visible geoms", visibleGeoms.length);

		// Combine the datastores
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			
			var databank = node.data.graph;

			// TODO Rather adding the datastore directly
			// invoke a method that activates the node in the cache
			this.multiGraph.addDatabank(databank);
		}		

		/*
		 * Load:
		 * 1) relations between geometries and features
		 * 2) labels of the features 
		 */
		var geomToFeatures = collections.BidiMultiMap.createWithSet();
		var idToLabel = {}; // TODO I don't think there is much point in having the labels here already; they should be fetched separately using the LabelFetcher
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];

			if(!node.isLoaded) {
				continue;
			}

			var databank = node.data.graph;
			var rdf = $.rdf({databank: databank});
			
			rdf.where("?id " + geovocab.geometry + " ?geom").each(function() {
				//console.log("entry", this.geom, this.id);
				geomToFeatures.put(this.geom.value, this.id.value);
			});

			
			rdf.where("?id " + rdfs.label + " ?label").each(function() {
				idToLabel[this.id.value] = this.label.value;
			});			
		}
		
		//console.log("idToLabel", idToLabel);
		
		// TODO Separate the following part into a new method
		// (First part does the data fetching/preparation,
		// second part applies it)
		
		
		var addedGeoms    = _.difference(visibleGeoms, oldVisibleGeoms);
		var removedGeoms  = _.difference(oldVisibleGeoms, visibleGeoms);

		this.mapWidget.removeItems(removedGeoms);
		/*
		for(var i = 0; i < removedGeoms.length; ++i) {
			//var geom = removedGeoms[i];
			
			
		}*/
		
		
		for(var i = 0; i < addedGeoms.length; ++i) {
			var geom = addedGeoms[i];

			var point = globalGeomToPoint[geom];
			var lonlat = new OpenLayers.LonLat(point.x, point.y);
			
			this.mapWidget.addItem(geom, lonlat, true);
		}
		
		var boxIds = _.keys(this.mapWidget.idToBox);
		for(var i = 0; i < boxIds.length; ++i) {
			var boxId = boxIds[i];
			this.mapWidget.removeBox(boxId);
		}
		
		// If true, shows the box of each node
		var alwaysShowBoxes = false;
		
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			
			if(!node.isLoaded || alwaysShowBoxes) {
				this.mapWidget.addBox(node.getBounds().toString(), toOpenLayersBounds(node.getBounds()));
			}
		}
		
		
		//this.geomToId.clear();
		//this.geomToId.addMultiMap(geomToId);

		//console.debug("Number of visible geoms", visibleGeoms.length);

		//console.log("label:", this.nodeToLabel);
		// HACK Find a better way to deal with the instances
		this.viewState.geomToFeatures = geomToFeatures;

		// TODO: idToLabel should be the replaced by a LabelFetcher
		this.viewState.idToLabel = idToLabel;
		this.setInstances(visibleGeoms, geomToFeatures, idToLabel);
		
		
		
		/*
		for(id in idToLabel) {
			var label = idToLabel[id];
			this.nodeToLabel.put(id, label);
		}
		*/

		// TODO HACK If nothing is selected, update the instance list
		if(!this.selectedFeature) {
			this.instanceWidget.refresh();
		}
		
		
		//var visibleGeomNodes = visibleGeoms.map(function(x) { return sparql.Node.parse(x); });
		var visibleGeomNodes = visibleGeoms.map(function(x) { return sparql.Node.uri(x); });
		
		this.updateFacetCountsGeom(visibleGeomNodes);
	};

	ns.AppController.prototype.setInstances = function(geoms, geomToFeatures, idToLabel) {
		this.nodeToLabel.clear();
		for(var i = 0; i < geoms.length; ++i) {
			var geom = geoms[i];

			var features = geomToFeatures.get(geom);
			if(!features) {
				continue;
			}
			
			for(var j = 0; j < features.length; ++j) {
				var feature = features[j];
				
				var label = idToLabel[feature];
				this.nodeToLabel.put(feature, label);				
			}
		}		
	};
	
	
	ns.AppController.prototype.setSparqlService = function(sparqlService) {
		this.sparqlService = sparqlService;
		this.labelFetcher = new labelUtils.LabelFetcher(this.sparqlService);
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
        //console.debug("Icon", icon);
	};
		
	ns.AppController.prototype.disableHighlight = function(feature) {
		var icon = feature.marker.icon;
		var size = new OpenLayers.Size(icon.size.w - 15, icon.size.h - 15);
		icon.setSize(size);
		icon.setUrl("src/main/resources/icons/markers/marker.png");		
	};
		
	ns.AppController.prototype.onInstanceUnhover = function(uriStr) {
		this.clearHighlight();
	};

	ns.AppController.prototype.clearHighlight = function() {
		var hoveredItems = this.hoveredItems;
		for(var i = 0; i < hoveredItems.length; ++i) {
			var item = hoveredItems[i];

			var olFeature = this.nodeToFeature.get(item);

			if(olFeature) {
				this.disableHighlight(olFeature);
			}
		}
		
		this.hoveredItems = [];		
	};
	
	ns.AppController.prototype.onInstanceHover = function(uriStr) {
		if(!this.viewState.geomToFeatures) {
			console.warn("No geom to feature mapping; viewState is", viewState);
			return;
		}
		var featureToGeoms = this.viewState.geomToFeatures.inverse.entries;
		
		var obj = featureToGeoms[uriStr];
		if(!obj) {
			console.warn("No geometries for feature", uriStr, featureToGeoms);
			return;
		}
		
		var geoms = _.keys(obj);
		//console.debug("Geometries for uri", uriStr, geoms);

		this.clearHighlight();
		
		for(var i = 0; i < geoms.length; ++i) {
			var geom = geoms[i];
			
			//console.debug("Geom & olFeature", geom, olFeature);
			this.hoveredItems.push(geom);
			
			var olFeature = this.nodeToFeature.get(geom);
			if(olFeature) {
				this.enableHighlight(olFeature);
			}

		}		
	};
		
	ns.AppController.prototype.onInstanceClicked = function(uriStr) {
		Dispatcher.fireEvent("selection", uriStr);
		
		console.log("Clicked: " + uriStr);

 
		//var node = sparql.Node.parse(uriStr);
		node = sparql.Node.uri(uriStr);
		this.showDescription([node]);
		
		
		var self = this;

		if(this.selectedFeature) {
			this.disableHighlight(this.selectedFeature);
		}
		
		var feature = self.nodeToFeature.get(uriStr);
		
		// If we click the same marker again, we de-select it
		if(this.selectedFeature === feature) {
			this.selectedFeature = null;
			
			this.setInstances(this.viewState.visibleGeoms, this.viewState.geomToFeatures, this.viewState.idToLabel)
			this.instanceWidget.refresh();

			return;
		}
		
		if(this.selectedFeature) {
			this.setInstances([uriStr], this.viewState.geomToFeatures, this.viewState.idToLabel)
		}
		this.instanceWidget.refresh();

		
		this.selectedFeature = feature;

		if(feature) {
			this.enableHighlight(feature);
		}
        
        // Show fact box
        $("#box-facts").show ();
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

