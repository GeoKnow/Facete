

$(document).ready(function() {

	// http://wiki.jqueryui.com/w/page/12138135/Widget%20factory
	// http://docs.jquery.com/UI_Developer_Guide
	// http://www.carpe-hora.com/2011/07/working-with-jquery-ui-events/ <-- finally i got events working with that
	/**
	 * Initialize the models:
	 * 
	 * - A bidi-multimap for the ontology hiararchy (forward direction is: child to parents)
	 * - A map from uris to labels
	 * - A map from uris to icons
     *
     * Global Ontology metadata
     * 	(Corresponding queries might give timeout)
     * - A map from dataype-property-uri to its global value range
     * - A map from object-property-uri
     * 
     * Local Ontology metadata
     * - A map from datatype-property-uri to the range of values that has been encountered
     * - A map from object-property-uri to the set of values that has been encountered 
     * 
     * - (Maybe markers and such - or even the layer)
     *
	 * Filter configuration 
	 * - For classes: A map from class-uri to whether it is enabled or disabled -> ISSUE 1
	 * - For object properties: Enabled/Disabled, Optionally the set of values
	 * - For datatype properties: If enabled, the range for its value.
	 * 
	 * Issues
	 * 
	 * ISSUE 1: If a class is checked, then all child classes should be checked too.
	 * So we need to retrieve all children.
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */
	

	var self = this;
	// TODO Allow configuration of multiple sparql endpoint services per map layer
	// Layer description -> list of sparql endpoints
	this.sparqlService = new VirtuosoSparqlService("http://linkedgeodata.org/sparql", ["http://linkedgeodata.org"]);
	
	this.selection = new Set();
	
	var queryFactory = new LinkedGeoDataQueryFactory({classFilter: this.selection});
	
	this.backend = new DelayBackend(new VirtuosoBackend(this.sparqlService, queryFactory));

	
	
	//var nodeToLabel = new Map();
	//var visibleArea =
	

	// The active language
	this.activeLanguage = "en";

	
	// Model classes for the instances
	// TODO Combine these maps into a single one...
	//this.nodeToLabels = new LabelCollection();
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
	
	
	
	this.notificationScheduler = new Scheduler();
	
	// Initialize the widgets

	$("#results").ssb_instances({
		instanceToLabel: this.nodeToLabel,
		instanceToType: this.nodeToType,
		schemaIcons: this.schemaIcons
	});
	
	$("#map").ssb_map({
		nodeToPos: this.nodeToPos,
		nodeToFeature: this.nodeToFeature,
		wayToFeature: this.wayToFeature,
		instanceToLabel: this.nodeToLabel,
		nodeToType: this.nodeToType,
		schemaIcons: this.schemaIcons
	});

	$("#facets").ssb_facets({
		schemaIcons: this.schemaIcons,
		schemaLabels: this.schemaLabels,
		classHierarchy: this.classHierarchy,
		selection: this.selection
	});

	$("#map").bind("ssb_maponmarkerclick", function(event, ui) {
		notify("AEOU", "EU");
	});
	
	$("#map").bind("ssb_maponmapevent", function(event, ui) {
		//notify("MapEvent", "weee");
		
		
		
		//var self = this;

		var map = ui.map;
		console.log(event);
		console.log(ui);
		
		var zoom = map.getZoom();
		var bounds = map.getExtent().transform(map.projection, map.displayProjection);

		var minZoom = 15;
		
		if(zoom < minZoom) {
			self.notificationScheduler.schedule(function() { notify("Info", "Current zoom level " + zoom + " is less than minimum " + minZoom);});
			return;
		}
		
		
		//$("#facets").data("ssb_facets").onMapEvent(event, bounds);

		
		//var onMapEvent = function(event, facets) 
		//{
			self.backend.fetchClasses(bounds, function(uris) {
			
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
				
				self.backend.fetchLabels(labelsToLoad, self.activeLanguage, function(map) {					
					var uris = labelsToLoad;
					
					for(var i = 0; i < uris.length; ++i) {
						var uri = uris[i];
					//for(uri in uris) {
						var label = uri in map ? map[uri] : "(missing label)";
						
						self.schemaLabels.put(uri, self.activeLanguage, label);
					}
					console.log(self.schemaLabels);
				});
				
				self.backend.fetchIcons(iconsToLoad, function(map) {
					var uris = iconsToLoad;
					
					for(var i = 0; i < uris.length; ++i) {
						var uri = uris[i];
					//for(uri in uris) {
						var icon = uri in map ? map[uri] : "(missing icon)";
						
						self.schemaIcons.put(uri, icon);
					}
				});
				//this.fetchSuperClasses(superClassesToLoad);
				
				fetchTransitiveSuperClasses(self.sparqlService, superClassesToFetch, self.classHierarchy);
				removeReflexivity(self.classHierarchy);
				
				$("#facets").data("ssb_facets").setFacets(uris);
			});
		//}		
		

		// Fetch basic node information (position, label, type)
		self.backend.fetchNodes(bounds, function(o) {
			//self.markerLayer.clearMarkers();
			
			// Remove all types and labels
			self.nodeToType.removeAll(getKeys(self.nodeToPos));
			self.nodeToLabel.clear(); //removeAll(getKeys(self.nodeToPos));
			self.nodeToPos.clear();
			
			console.log(o);
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
		});


		// Fetch basic way information
		self.backend.fetchWayGeometries(bounds, function(data) {
			self.wayToFeature.clear();
			
			for(var key in data) {
				var tmpPoints = data[key];
			
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

		});
		
	})
	
	
	//Dispatcher.register2("mapEvent", function(event, arg, b) { notify("yay", "weee" + JSON.stringify(event) + " aoeu " + arg + " eu" + b); })

	//var facetController = new FacetController("#facets");
	//facetController.onInit();

	//$("#map").html("hello world");

	
	
	//var backend = new SparqlInstanceBackend();
	//var backend = createLinkedGeoDataBackend();
	//var controller = new MyController(map, backend, markerLayer, vectorLayer);
	
	//mapWidget.onMapEvent("test");
	//mapWidget.test();
	
	//Dispatcher.register("mapEvent", mapWidget, "onMapEvent");
	
	//Dispatcher.register("mapEvent", mapWidget, "onMapEvent");
	

	
	//notify("Info", "Test");
	//$("#console").html("Here I am!");
	
});





function notify(title, text)
{
	$.gritter.add({
		title: title,
		text: text,
//		image: image,
//		sticky: false,
	});
}






function LinkedGeoDataQueryFactory(options) {
	this.options = options;
}

LinkedGeoDataQueryFactory.prototype = {
		
	createClassFilter: function(varName) {
		var uris = this.options.classFilter.toArray();

		return uris.length == 0 ? "" : "Filter(?" + varName + " In (<" + uris.join(">,<") + ">)) . ";
	},
		
	/**
	 * Must return columns ?w ?g
	 */
	createWayGeometriesQuery: function(bounds) {
		
		
		
		var result = "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?w ?g { ?w ?p ?g ; lgdo:hasNodes ?wn . ?wn ?x ?n . Filter(?p = georss:polygon || ?p = georss:linestring) . { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } }";
		
		//console.log(result);
		//return "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?w ?g { ?w ?p ?g . ?w lgdo:hasNodes ?wn . Filter(?p = georss:polygon || ?p = georss:linestring) . { Select ?wn { ?wn ?x ?n . { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } } } }";
		//return "Select * { ?w <http://www.georss.org/georss/polygon> ?g . } Limit 1";		
		//return "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?w ?g { ?w ?p ?g ; lgdo:hasNodes ?wn . ?wn ?x ?n . Filter(?p = georss:polygon || ?p = georss:linestring) . ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "}";
	
		return result;
	},
	
	

	createNodesQuery: function(bounds) {
		return "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?n ?g ?t ?l { ?n a lgdo:Node . ?n rdfs:label ?l . ?n lgdo:directType ?t . ?n geo:geometry ?g . ?n rdf:type ?t . { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } " + this.createClassFilter("n") + "}";
	}
}



function VirtuosoBackend(sparqlService, queryFactory) {
	this.sparqlService = sparqlService; // new VirtuosoSparqlService("http://linkedgeodata.org/sparql"); //new LinkedGeoDataQueryFactory();
	this.queryFactory = queryFactory; //new LinkedGeoDataQueryFactory();		
}


/**
 * The other backend classes suck - here we redo it
 */
VirtuosoBackend.prototype = {
	
	
	fetchNodes: function(bounds, callback) {
		var queryString = this.queryFactory.createNodesQuery(bounds);
		
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) { 

				var data = $.parseJSON(response);

				var nodeToPoint = jsonRdfResultSetToMap(data, "n", "g");
				for(var s in nodeToPoint) {
					nodeToPoint[s] = JsonRdfExtractionUtils.parsePoint(nodeToPoint[s]);
				}
				
				var nodeToType = jsonRdfResultSetToMap(data, "n", "t");
				var nodeToLabel = jsonRdfResultSetToMap(data, "n", "l");
				
				callback({"nodeToType": nodeToType, "nodeToLabel": nodeToLabel, "nodeToPoint": nodeToPoint});
			}
		});
	},
	
	// TODO Filter configuration as attribute or parameter? -> Would go for first option
	fetchWayGeometries: function(bounds, callback) {
		var queryString = this.queryFactory.createWayGeometriesQuery(bounds);

		console.log(queryString);

		/*
		sparqlQueryTest("http://linkedgeodata.org/sparql", queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) { notify("Way", "to go"); }});
		
		return;
		*/

		//notify("classes", queryString);
		
		
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) { 

				//var json = $.parseJSON(response);
				//console.log("wweee");
				//console.log(json);
				
				var map = jsonRdfResultSetToMap($.parseJSON(response), "w", "g");

				
				var tmp = {};
				for(var key in map) {
					var value = map[key];
					
					tmp[key] = JsonRdfExtractionUtils.extractPoints(value);
				}
				
				callback(tmp);
			}
		});
	},
	
	
	
	
	fetchClasses: function(bound, callback) {
		var queryString = "Select distinct ?o, count(?o) As ?c { ?s a ?o . ?s geo:geometry ?geo . " + createSparqlFilter("geo", bound) + "}"; 
		//notify("classes", queryString);
		
		
		var self = this;
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {
				
				var map = jsonRdfResultSetToMap($.parseJSON(response), "o", "c");
				
				//Dispatcher.fireEvent("facetsLoaded", map);
				
				//notify("Debug - wee", JSON.stringify(map));
				//self.onFacetsLoaded("facetsLoaded", map);
				callback(map);
			}	
		});
		
	},
		
			

	fetchLabels: function(uris, language, callback) {		
		if(uris.length == 0) {
			return;
		}
		
		console.log("Fetching labels for (<" + uris.join('> , <') + ">)");

		
		var queryString = "Select ?u ?l { ?u rdfs:label ?l . Filter(langMatches(lang(?l), '" + language + "')) . Filter(?u In (<" + uris.join(">,<") + ">)) . }";

		//var self = this;
		//alert(queryString);
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {
				
				var map = jsonRdfResultSetToMap($.parseJSON(response), "u", "l");

				callback(map);				
			}	
		});	
	},

	
	fetchIcons: function(uris, callback) {		
		if(uris.length == 0) {
			return;
		}
		
		console.log("Fetching icons for (<" + uris.join('> , <') + ">)");	
		var queryString = "Select ?u ?i { ?u <http://linkedgeodata.org/ontology/schemaIcon> ?i . Filter(?u In (<" + uris.join(">,<") + ">)) . }";

		//var self = this;
		//alert(queryString);
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {
				
				var map = jsonRdfResultSetToMap($.parseJSON(response), "u", "i");
				
				callback(map);
			}	
		});	
	},

}


function DelayBackend(decoratee) {
	this.decoratee = decoratee;

	this.fetchWayGeometriesScheduler = new Scheduler();
	this.fetchNodesScheduler = new Scheduler();

	this.fetchClassesScheduler = new Scheduler();
	this.fetchLabelsScheduler = new Scheduler();
	this.fetchIconsScheduler = new Scheduler();
}


// TODO There is probably a way to generate these methods on access in js...?
DelayBackend.prototype = {
	
	fetchWayGeometries: function(bounds, callback) {
		var self = this;
		this.fetchWayGeometriesScheduler.schedule(function() {self.decoratee.fetchWayGeometries(bounds, callback);});
	},

	fetchNodes: function(bounds, callback) {
		var self = this;
		this.fetchNodesScheduler.schedule(function() {self.decoratee.fetchNodes(bounds, callback);});		
	},
	
	fetchClasses: function(bounds, callback) {
		var self = this;
		this.fetchClassesScheduler.schedule(function() {self.decoratee.fetchClasses(bounds, callback);});		
	},
	fetchLabels: function(uris, language, callback) {
		var self = this;
		this.fetchLabelsScheduler.schedule(function() {self.decoratee.fetchLabels(uris, language, callback);});		
	},
	fetchIcons: function(uris, callback) {
		var self = this;
		this.fetchIconsScheduler.schedule(function() {self.decoratee.fetchIcons(uris, callback);});		
	},
	
	
}


//Prefix lgd:<http://linkedgeodata.org/> Prefix lgdo:<http://linkedgeodata.org/ontology/> Select distinct ?o count(?o) From <http://linkedgeodata.org> { ?s lgdo:seats ?o .}

function createSparqlFilter(varName, bound) {
	var cx = (bound.left + bound.right) * 0.5;
	var cy = (bound.bottom + bound.top) * 0.5;
	
	var d = getOuterRadiusDeg(bound);

	return "Filter(bif:st_intersects(?" + varName + ", bif:st_point(" + cx + ", " + cy + "), " + d + ")) . Filter(bif:st_x(?geo) > " + bound.left + " && bif:st_x(?geo) < " + bound.right + " && bif:st_y(?geo) > " + bound.bottom + " && bif:st_y(?geo) < " + bound.top + ") . ";
}


function degToRad(value)
{
	return value * (Math.PI / 180.0);
}


function getOuterRadiusDeg(bound)
{
	var d1 = getDistanceDeg(bound.left, bound.bottom, bound.right, bound.top);
	var d2 = getDistanceDeg(bound.left, bound.top, bound.right, bound.bottom);
	var d = Math.max(d1, d2);

	return d * 0.5;
}

function getDistanceDeg(x1, y1, x2, y2) {
	return getDistanceRad(
			degToRad(x1),
			degToRad(y1),
			degToRad(x2),
			degToRad(y2));
}

// Taken from http://www.movable-type.co.uk/scripts/latlong.html
// x -> lon, y -> lat
function getDistanceRad(x1, y1, x2, y2) {
	var R = 6371; // km
	var d = Math.acos(Math.sin(y1) * Math.sin(y2) + 
	                  Math.cos(y1) * Math.cos(y2) *
	                  Math.cos(x2 - x1)) * R;
	return d;
}


function extractTags(json)
{
	var result = {};
	for(var item in json.results.bindings) {
		var key = item.p.value;
		
		// Check if the key is prefixed with a known namespace
		// In that case replace it
		var namespacedKey = namespaceUri(key);
		if(namespacedKey != null)
			key = namespacedKey;
		
		if(item.o['xml:lang'] != null)
			key = key += "@" + item.o['xml:lang'];
		
		result[key] = item.o.value;
	}
	
	return result;
}


/*
function Point(lat, lon)
{
	this.lat = lat;
	this.lon = lon;
}

function Rectangle(minX, maxX, minY, maxY)
{
	this.lowerLeft  = new Point(minX, minY);
	this.lowerRight = new Point(minX, maxY);
	this.upperLeft  = new Point(minX, maxY);
	this.upperRight = new Point(maxX, maxY);
	this.center     = new Point((minX + maxX) / 2, (minY + maxY) / 2);
}
*/


//http://stackoverflow.com/questions/1219860/javascript-jquery-html-encoding
function htmlEncode(value){
	return $('<div/>').text(value).html();
}

function htmlDecode(value){
	return $('<div/>').html(value).text();
}


/**
 * Schedules callbacks for delayed invocation.
 * Only the latest set callback will be invoked after the delay, the others are discarded.
 * 
 * This class is useful for e.g. limitting the rate of ajax/sparql requests
 * 
 * TODO: If a request is taking too long, schedule new requests, but do not execute them
 * before the other requests returns. Hm, nah bad idea, that might get the app stuck.
 * 
 * @returns {Scheduler}
 */
function Scheduler() {
	this.lastRequestTime = 0;
	this.requestPeriod = 2000; // Minimum period between requests 
	
	this.schedule = function(callback) {
		var now = new Date().getTime();
		var delay = Math.max(0, this.requestPeriod - (now - this.lastRequestTime));

		clearTimeout(this.timeout);

		var outer = this;
		
		this.timeout = setTimeout(function() {
			outer.lastRequestTime = new Date().getTime();
			callback();
		}, delay);
	};
}


/**
 * Sparql endpoint class:
 * Allows execution of sparql queries against a preconfigured service
 * 
 * @param serviceUrl
 * @returns {VirtuosoSparqlService}
 */
function VirtuosoSparqlService(serviceUrl, defaultGraphUri)
{
	this.serviceUrl = serviceUrl;
	this.defaultGraphUri = defaultGraphUri;
	
	this.executeSelect = function(queryString, callback) {
		sparqlQuery(this.serviceUrl, this.defaultGraphUri, queryString, callback);
	};
}


/**
 * Adapted from http://www.openlinksw.com/blog/~kidehen/?id=1653
 * 
 * @param baseURL
 * @param query
 * @param callback
 * @param format
 */
function sparqlQuery(baseURL, defaultGraphUri, query, callback, format) {
	if(!format)
		format="application/json";
	
	/*
	var params={
		"default-graph": "", "should-sponge": "soft", "query": query,
		"debug": "on", "timeout": "", "format": format,
		"save": "display", "fname": ""
	};
	*/
	var params={
			"default-graph-uri": defaultGraphUri, "query": query,
			"format": format,
	};

	
	var querypart="";
	for(var k in params) {
		querypart+=k+"="+encodeURIComponent(params[k])+"&";
	}
	var queryURL=baseURL + '?' + querypart;
	
	
	$.ajax(queryURL, callback);	
}



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
	notify("search", "aoeu");
}


/*
for(var s in data) {
	

	var tp = data[s];
	
	for(var p in tp) {
		var to = tp[p];
		
		for(var i = 0; i < to.length; ++i) {
			var to = to[i];
			
			var o      = to["value"];
			var o_type = to["type"]; 
			var o_lang = to["lang"]
			var o_datatype = to["datatype"];
			
			++counter;
			if(counter > 10) {
				break;
			}

			notify("shd", "x: " + s + " " + p + " " + o);
			
			
			
		}
		
	}
}
	*/
	
/*
$("#map").ssb_map("test");
$("#map").data("ssb_map").test();
//console.log(mapWidget);
*/


/*
function createLinkedGeoDataBackend() {
	//return new SparqlInstanceBackend("http://linkedgeodata.org/sparql", new Array("http://linkedgeodata.org"), "Construct { ?ns ?np ?no .  ?ws ?wp ?wo . } { ?ns ?np ?no . ?ws <http://linkedgeodata.org/ontology/hasNodes> ?ns . ?ws ?wp wo .", " }", "ns");
	//return new SparqlInstanceBackend("http://linkedgeodata.org/sparql", new Array("http://linkedgeodata.org"), "Construct { ?ns ?np ?no . } { ?ns ?np ?no . ", " }", "ns");
	return new SparqlInstanceBackend("http://linkedgeodata.org/sparql", new Array("http://linkedgeodata.org"), "Construct { ?ns geo:geometry ?geo. } { ?ns a <http://linkedgeodata.org/ontology/Node> . ", " }", "ns");
}


/ **
 * Constructs query for a given rectangular area.
 * 
 * 
 * @param queryHeader
 * @param queryFooter
 * @returns
 * /
function SparqlInstanceBackend(service, defaultGraphs, queryHeader, queryFooter, nodeSubject)
{
	this.queryHeader = queryHeader;
	this.queryFooter = queryFooter;
	this.nodeSubject  = nodeSubject;
	this.sparqler = new SPARQL.Service(service);
	
	for (item in defaultGraphs) {
		this.sparqler.addDefaultGraph(item);
	}
	
	this.createQuery = function(bound) {
		
		//return this.queryHeader + "?" + nodeSubject + " geo:geometry ?geo ; geo:lat ?lat ; geo:long ?long. Filter(bif:st_intersects(?geo, bif:st_point(" + cx + ", " + cy + "), " + d + ")) . Filter(?lat > " + bound.bottom + " && ?lat  < " + bound.top + " && ?long > " + bound.left + " && ?long < " + bound.right + ") . " + this.queryFooter;
		return this.queryHeader + "?" + nodeSubject + " geo:geometry ?geo . " + createSparqlFilter("geo", bound) + this.queryFooter;
	};

	this.executeQuery = function(bound) {
		var queryString = this.createQuery(bound);

		//alert(queryString);
		
		this.sparqler.query(queryString, {
			failure: function() { notify("Error", queryString); },
			success: function(json) {
				
				console.html(extractTags(json));
				
				/*
				newTags = extractTags(json);
					for (key in newTags) { tags[key] = newTags[key]; }
					//var mergedTags = tags.merge(newTags);
					//mergedTags.loadedDBpedia = true;
					
					popup.setContentHTML(oldrenderNode(nodeId, popup.lonlat.lon, popup.lonlat.lat, tags));
					}	
				})
				* /;

			}
		});
	};	
}

*/