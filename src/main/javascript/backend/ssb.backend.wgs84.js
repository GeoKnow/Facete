
function BackendWgs84(sparqlService, queryFactory) {
	this.sparqlService = sparqlService;
	this.queryFactory = queryFactory;
}


/**
 * The other backend classes suck - here we redo it
 */
BackendWgs84.prototype = {
	
	/**
	 * Fetches positions, types, and labels of features within the give bounds
	 * 
	 * @param bounds
	 */
	fetchBasicData: function(bounds) {
		var nodesTask = this.fetchNodes(bounds);
		var typesTask = this.fetchNodeTypes(bounds);
		var labelsTask = this.fetchNodeLabels(bounds);
		
		/*
		$.when(typesTask).done(function(idToTypes) {
			console.log("Got:");
			console.log(idToTypes);			
		});*/
		
		var result = $.when(nodesTask, typesTask, labelsTask).pipe(function(idToPos, idToTypes, idToLabels) { return {idToPos: idToPos, idToTypes: idToTypes, idToLabels: idToLabels }; });
		
		return result;
		
		/*
		$.when(nodesTask, typesTask, labelsTask).done(function(idToPos, idToTypes, idToLabels) {
			console.log("Got:");
			console.log(idToPos);
			console.log(idToTypes);
			console.log(idToLabels);
		});*/
	},

	fetchNodeCount: function(bounds, callback) {
		var queryString = this.queryFactory.createNodeCountQuery(bounds);
		var result = this.sparqlService.executeSelect(queryString).pipe(function(data) {
			var count = parseInt(data.results.bindings[0].c.value);
			
			if(callback) {
				callback(count);
			}
			
			return count;
		});
		
		return result;
	},
		
	fetchNodes: function(bounds, callback) {
		var queryString = this.queryFactory.createNodesQuery(bounds);
		
		var result = this.sparqlService.executeSelect(queryString).pipe(function(data) {
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
				if(callback) {
					callback(nodeToPoint);
				}
				
				return nodeToPoint;
			});
		
		return result;
	},
	
	fetchNodeLabels: function(bounds, callback) {
		var queryString = this.queryFactory.createNodeLabelsQuery(bounds);
		
		var result = this.sparqlService.executeSelect(queryString).pipe(function(data) { 
			// TODO Make that a multimap
			var nodeToLabels = jsonRdfResultSetToMap(data, "n", "l");
			if(callback) {
				callback(nodeToLabels);
			}
			
			return nodeToLabels;
		});
		
		return result;
	},
	
 
	/**
	 * Fetches all instances with a given class
	 * 
	 * This is a different dimension of access - TODO implement it
	 * 
	 * @param callback
	 * /
	fetchAllInstances: function(callback) {
		var queryString = this.queryFactory.createInstanceQuery();
		this.sparqlService.executeSelect(queryString, {
			
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(data) { 
				var nodeToLabel = jsonRdfResultSetToMap(data, "n", "l");
				callback(nodeToLabel);
			}
		});		
	},
	*/
	
	fetchNodeTypes: function(bounds, callback) {
		var queryString = this.queryFactory.createNodeTypesQuery(bounds);
		var result = this.sparqlService.executeSelect(queryString).pipe(function(data) {
			var nodeToTypes = jsonRdfResultSetToMultiMap(data, "n", "t");
			if(callback) {
				callback(nodeToTypes);
			}
			
			return nodeToTypes;
		});
		
		return result;
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
