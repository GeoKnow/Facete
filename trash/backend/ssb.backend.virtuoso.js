/**
 * Backend for virtuoso sparql endpoints
 * 
 * @param sparqlService
 * @param queryFactory
 * @returns {VirtuosoBackend}
 */


function VirtuosoBackend(sparqlService, queryFactory) {
	this.sparqlService = sparqlService;
	this.queryFactory = queryFactory;		
}


/**
 * The other backend classes suck - here we redo it
 */
VirtuosoBackend.prototype = {
	
	
	fetchNodes: function(bounds, callback) {
		var queryString = this.queryFactory.createNodesQuery(bounds);
		console.log("NodesQuery: " + queryString);
		if(!queryString) {
			return;
		}

		
		
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(data) { 

				//var data = $.parseJSON(response);

				var nodeToPoint = jsonRdfResultSetToMapList(data, "n", "x", "y");
				for(var s in nodeToPoint) {
					nodeToPoint[s] = JsonRdfExtractionUtils.parsePoint(nodeToPoint[s]);
				}
				
				var nodeToType = jsonRdfResultSetToMap(data, "n", "t");
				var nodeToLabel = jsonRdfResultSetToMap(data, "n", "l");
				
				callback({"nodeToType": nodeToType, "nodeToLabel": nodeToLabel, "nodeToPoint": nodeToPoint});
			}
		});
		
		
		/*
		this.sparqlService.executeSelectOld(queryString, {
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
		*/
	},
	
	// TODO Filter configuration as attribute or parameter? -> Would go for first option
	fetchWayGeometries: function(bounds, callback) {
		var queryString = this.queryFactory.createWayGeometriesQuery(bounds);
		console.log(queryString);
		if(!queryString) {
			return;
		}
		

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
		
		uris = filterUrisValidate(uris);
		
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
		
		uris = filterUrisValidate(uris);
		
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
	
	// TODO I think this method does not belong here
	fetchStatementsBySubject: function(uris, callback) {		
		
		uris = filterUrisValidate(uris);
		
		if(uris.length == 0) {
			return;
		}
		
		console.log("Fetching statements for (<" + uris.join('> , <') + ">)");	
		var queryString = "Select ?s ?p ?o { ?s ?p ?o . Filter(?s In (<" + uris.join(">,<") + ">)) . }";

		//var self = this;
		//alert(queryString);
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {

				
				callback($.parseJSON(response));
			}	
		});	
	},
 
};


// Note: lower-left is inclusive, upper-right exclusive
function createBBoxFilterWgs84(lon, lat, bounds) {
	return "Filter(?" + lon + " >= " + bounds.left + " && ?" + lon +  " < " + bounds.right + " && ?"  + lat + " >= " + bounds.bottom + " && ?" + lat + " < " + bounds.top + ") . ";	
}

/**
 * Creates a SPARQL filter statement for the given bounding box
 * 
 * @param varName
 * @param bound
 * @returns {String}
 */
function createSparqlFilter(varName, bound) {
	var cx = (bound.left + bound.right) * 0.5;
	var cy = (bound.bottom + bound.top) * 0.5;
	
	var d = getOuterRadiusDeg(bound);

	return "Filter(bif:st_intersects(?" + varName + ", bif:st_point(" + cx + ", " + cy + "), " + d + ")) . Filter(bif:st_x(?geo) > " + bound.left + " && bif:st_x(?geo) < " + bound.right + " && bif:st_y(?geo) > " + bound.bottom + " && bif:st_y(?geo) < " + bound.top + ") . ";
}

