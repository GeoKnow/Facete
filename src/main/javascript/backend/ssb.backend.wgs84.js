
function BackendWgs84(sparqlService, queryFactory) {
	this.sparqlService = sparqlService;
	this.queryFactory = queryFactory;
}


/**
 * The other backend classes suck - here we redo it
 */
BackendWgs84.prototype = {
	
	/*
	fetchNodesOld: function(bounds, callback) {
		var queryString = this.queryFactory.createNodesQuery(bounds);
		console.log("NodesQuery: " + queryString);
		if(!queryString) {
			return;
		}


		this.sparqlService.executeSelect(queryString, {
			
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(data) { 
				//var data = $.parseJSON(response);
				var nodeToPoint = {};
				
				var tmp = jsonRdfResultSetToMapList(data, "n", "x", "y");
				for(var s in tmp) {
					//nodeToPoint[s] = JsonRdfExtractionUtils.parsePoint(nodeToPoint[s]);
					var list = tmp[s];
					
					var x = parseFloat(list[0].value);
					var y = parseFloat(list[1].value);
					nodeToPoint[s] = new OpenLayers.LonLat(x, y); 
				}
				
				var nodeToType = jsonRdfResultSetToMap(data, "n", "t");
				var nodeToLabel = jsonRdfResultSetToMap(data, "n", "l");
				
				callback({"nodeToType": nodeToType, "nodeToLabel": nodeToLabel, "nodeToPoint": nodeToPoint});
			}
		});		
	},*/

	fetchNodeCount: function(bounds, callback) {
		var queryString = this.queryFactory.createNodeCountQuery(bounds);
		return this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(data) { callback(parseInt(data.results.bindings[0].c.value)); } 
		});
	},
		
	fetchNodes: function(bounds, callback) {
		var queryString = this.queryFactory.createNodesQuery(bounds);
		return this.sparqlService.executeSelect(queryString, {
			
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(data) { 
				//var data = $.parseJSON(response);
				var nodeToPoint = {};
				
				var tmp = jsonRdfResultSetToMapList(data, "n", "x", "y");
				for(var s in tmp) {
					//nodeToPoint[s] = JsonRdfExtractionUtils.parsePoint(nodeToPoint[s]);
					var list = tmp[s];
					
					var x = parseFloat(list[0].value);
					var y = parseFloat(list[1].value);
					nodeToPoint[s] = new OpenLayers.LonLat(x, y); 
				}

				//callback({"nodeToType": nodeToType, "nodeToLabel": nodeToLabel, "nodeToPoint": nodeToPoint});
				callback(nodeToPoint);
			}
		});		
	},
	
	fetchNodeLabels: function(bounds, callback) {
		var queryString = this.queryFactory.createNodeLabelsQuery(bounds);
		this.sparqlService.executeSelect(queryString, {
			
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(data) { 
				var nodeToLabel = jsonRdfResultSetToMap(data, "n", "l");
				callback(nodeToLabel);
			}
		});
	},
	
	fetchNodeTypes: function(bounds, callback) {
		var queryString = this.queryFactory.createNodeTypesQuery(bounds);
		this.sparqlService.executeSelect(queryString, {
			
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(data) { 
				var nodeToLabel = jsonRdfResultSetToMap(data, "n", "t");
				callback(nodeToLabel);
			}
		});
	},	
	
	
	fetchNodeLocations: function(bounds, callback) {
	
	},
	
	fetchWayGeometries: function(bounds, callback) {
		// Not supported
	},	
	
	fetchClasses: function(bounds, callback) {
		var queryString = "Select distinct ?o, count(?o) As ?c { ?s a ?o ; geo:long ?x ; geo:lat ?y . " + createBBoxFilterWgs84("x", "y", bounds) + "}"; 
		
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {				
				var map = jsonRdfResultSetToMap(response, "o", "c");				
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

		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {				
				var map = jsonRdfResultSetToMap(response, "u", "l");
				callback(map);				
			}	
		});	
	},

	
	fetchIcons: function(uris, callback) {
		// Not supported
	}
};
