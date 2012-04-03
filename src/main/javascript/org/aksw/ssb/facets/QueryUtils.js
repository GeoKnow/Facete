/**
 * This file contains functions for constructing queries for
 * fetching information about sets of resources
 * indirectly specified by query elements.
 *
 * The purpose is to enable facetted browsing.
 */
(function($) {

	var ns = Namespace("org.aksw.ssb.facets.QueryUtils");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	/**
	 * 
	 * 
	 */
	ns.loadDefaultFacets = function(sparqlService, config, callback) {
		var autoFacetVar = 1;
		
		var s = config.driverVar;
		
		q = ns.FacetUtils.createQueryLoadDefaults(config);
		
		if(!callback) {
			callback = ns.DummyCallback;
		}
		
		console.log("Fetching facets: " + q);
		
		sparqlService.executeSelect(q.toString(), {
			failue: function() { callback.failure(); },
			success: function(jsonRs) {
				// Update the model (and thereby the view)
				var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");

				for(var propertyName in map) {
					//var count = map[propertyName];
					var propertyNode = sparql.Node.uri(propertyName);
					var objectNode = sparql.Node.v("var" + autoFacetVar);
					
					
					/*
					var facetDesc = new sparql.facets.FacetDesc
					(
							propertyName,
							propertyNode,
							new sparql.ElementTriplesBlock([new sparql.Triple(self.config.driverVar, propertyNode, objectNode)])
					);
					*/
					
					var element = new sparql.ElementTriplesBlock([new sparql.Triple(s, propertyNode, objectNode)]);
					
					var newFacet = new ns.Facet(config.getRoot(), propertyNode.value, element, s.value);
					
					config.addFacet(newFacet);
					
					//self.knownFacets.push(facetDesc);
					//var facets = config.getRoot().getSubFacets();					
				}
				callback.success();
			}
		});
	};

	/**
	 * Create a query for fetching the values and their counts of a facet
	 * 
	 * Example:
	 * If the facet corresponds to { ?s rdfs:label ?o }, then the query is
	 * 
	 * Select Distinct ?o Count(?s) { { Select Distinct ?s { ?s driver ... constraints . } Limit 10001 } . ?s rdfs:label ?o .
	 * 
	 * 
	 * 
	 * @param config
	 * @param facet
	 */
	ns.createValuesQuery = function(config, facet) {
		// The maximum number of instances to scan for collecting properties
		//var config = facet.getConfig();
		var instanceScanCount = 10001;

		var element = facet.getElement();
		var outputVars = _.difference(facet.getElement().getVarsMentioned(), [facet.getInputVar()]);
		console.log("Outputvars=", facet.getElement().getVarsMentioned(), facet.getInputVar());

		var result = new sparql.Query();
		for(var i in outputVars) {
			var outputVar = outputVars[i];
			
			//var varNode = sparql.Node.v(outputVar);
			result.projection[outputVar] = null; //varNode;
		}
		
		
		result.distinct = true;
		
		//var p = sparql.Node.v("__p");
		//var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		//result.projection[p] = null;
		result.projection[c.value] = new sparql.E_Count();


		var subQuery = result;
		if(instanceScanCount) { // limit instances to check for properties
		    subQuery = new sparql.Query();
		    subQuery.isResultStar = true;
		    subQuery.limit = instanceScanCount;
		    result.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		subQuery.elements.push(config.driver);
		subQuery.elements.push(element);

		result.elements.push(element);
		
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new sparql.Query();
			result.projection[]
		}
		*/
		
		// TODO Order by ?o ?p
		result.order.push(new sparql.Order(new sparql.ExprVar(c), sparql.OrderDir.Desc));
		
		for(var i in outputVars) {
			var outputVar = outputVars[i];			
			result.order.push(new sparql.Order(new sparql.ExprVar(ssb.Node.v(outputVar)), sparql.OrderDir.Asc));
		}

		
		console.log("Created query: " + result);
		return {query: result, outputVars: outputVars };
		
	};
	
	
	ns.createStatusQuery = function(config) {
		// For each facet get its count by taking the status of the other facets into account.
		//
		var maxCount = 1001;

		var knownFacets = config.getRoot().getSubFacets().asArray();
		
		if(!knownFacets) {
			console.log("No facets to load");
			return;
		}
		
		//console.log("Reloading facets:" , knownFacets);
		/*
		for(var i in open) {
			var facet = 
		}
		*/
		
		//var self = this;

		
		var unionElements = [];
		var p = sparql.Node.v("__p");
		var count = sparql.Node.v("__c");
		for(var i in knownFacets) {
			
			var facet = knownFacets[i];
			
			//console.log("Known facet: ", facet);
			
			var q = new sparql.Query();

			var s = config.driverVar;
			q.projection[p.value] = null;
			q.projection[count.value] = new sparql.E_Count(s);


			var subQuery = new sparql.Query();
			subQuery.limit = maxCount;
			subQuery.elements.push(config.driver);
			subQuery.elements.push(facet.queryElement); //.copySubstitute(facet.mainVar, facetManager.driverVar);
			subQuery.distinct = true;
			subQuery.projection[p.value] = new sparql.NodeValue(ssb.Node.uri(facet.id));
			subQuery.projection[s.value] = null;
			//subQuery.projection[count] = new sparql.E_Count(subExpr);
			//subQuery.projection[count] = new sparql.E_Count(new sparql.ExprVar(s));
			//q.elements.push(new sparql.ElementSubQuery(subQuery));

			
			var countWrapper = new sparql.Query();
			countWrapper.projection[p.value] = null;
			countWrapper.projection[count.value] = new sparql.E_Count(new sparql.ExprVar(s));
			
			countWrapper.elements.push(new sparql.ElementSubQuery(subQuery));
			

			unionElements.push(new sparql.ElementSubQuery(countWrapper));
			//batchQuery.
			//this.facetManager. somehow get the configuration as a query
			
			
			// TODO: For each facet we need to get its query element.
			// facet.getQueryElement();
			
			
			// Select Distinct ?p ?c { { Select ?p { <driver> ?driver_var ?p ?o . Filter(?p = <facet>) . } Limit 1001 } }
			
			//this.sparqlService.
		}
		
		//var union = FacetController.balance(ssb.ElementUnion, unionElements);
		

		var batchQuery = new sparql.Query();
		//batchQuery.isResultStar = true;
		batchQuery.projection[p.value] = null;
		batchQuery.projection[count.value] = null;
		batchQuery.elements.push(new sparql.ElementUnion(unionElements));

		console.log("Facet query: " + batchQuery);
		
		return batchQuery;
	};
	
	ns.createQueryLoadDefaults = function(driverVar, driver) {
		// The maximum number of instances to scan for collecting properties
		var instanceScanCount = 10001;
		
		
		var q = new ssb.Query();
		
		q.distinct = true;
		
		var p = ssb.Node.v("__p");
		var o = ssb.Node.v("__o");
		var c = ssb.Node.v("__c");
		
		q.projection[p.value] = null;
		q.projection[c.value] = new ssb.E_Count(new ssb.ExprVar(p));
		
		var tmp = q;
		if(true) { // limit instances to check for properties
		    var subQuery = new ssb.Query();
		    subQuery.isResultStar = true;
		    subQuery.limit = instanceScanCount;
		    q.elements.push(new ssb.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		
		console.log("Driver", driver);
		
		tmp.elements.push(driver);
		tmp.elements.push(new ssb.ElementTriplesBlock([new ssb.Triple(driverVar, p, o)]));
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new ssb.Query();
			result.projection[]
		}
		*/
		
		// TODO Order by ?o ?p
		q.order.push(new ssb.Order(new ssb.ExprVar(c), ssb.OrderDir.Desc));
		
		console.log("Created query: " + q);
		return q;
	};

})(jQuery);
