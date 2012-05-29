/**
 * This file contains functions for constructing queries for
 * fetching information about sets of resources
 * indirectly specified by query elements.
 *
 * The purpose is to enable facetted browsing.
 */
(function($) {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	
	var ns = Namespace("org.aksw.ssb.facets.QueryUtils");

	
	/**
	 * Creates a Select-Query from a driver.
	 * 
	 * Select ?driverVar { driverElement }
	 * 
	 * options:
	 *     distinct
	 *     limit
	 *     offset
	 * 
	 */
	ns.createQuerySelect = function(driver, options) {
		var result = new sparql.Query();
		
		result.projectVars.add(driver.variable);
		result.elements.push(driver.element);
		
		if(options) {
			result.distinct = options.distinct ? true : false;
		
			result.limit  = options.limit ? options.limit : null;
			result.offset = options.offset ? options.offset : null;
		}
		
		return result;
	};
	

	/**
	 * Creates a query that fetches plain facets (i.e. no counts)
	 * Select Distinct ?p {
	 *     [driver] (optional)
	 *     ?driverVar ?p ?o .
	 * }
	 */
	ns.createFacetQueryPlain = function(driver, driverVar) {
		var result = new sparql.Query();
		
		if(driver) {
			result.elements.push(driver);
		}
		
 
		var p = sparql.Node.v("__p");
		var triple = new sparql.Triple(driver, p, sparql.Node.v("__o"));		
		result.elements.push(new sparql.ElementTriplesBlock(triple));
		
		result.projectVars.add(p);
		///result.projection[p.value] = null;
		
		return result;
	};


	ns.createDescribeQueryNodes = function(nodes) {		
		var s = sparql.Node.v("__s");
		var element = new sparql.ElementFilter(new sparql.E_In(s, nodes));
		var result = ns.createDescribeQuery(element, s);
		return result;
	};
	
	ns.createDescribeQuery = function(driver, driverVar) {
		var result = new sparql.Query();
		result.type = sparql.QueryType.Construct;
		
		result.elements.push(driver);
		
		var p = sparql.Node.v("__p");
		var o = sparql.Node.v("__o");
		
		var triple = new sparql.Triple(driverVar, p, o);

		result.constructTemplate = new sparql.Template(new sparql.BasicPattern([triple]));
		
		result.elements.push(new sparql.ElementTriplesBlock([triple]));
		
		return result;
	};
	

	/**
	 * Counts the number of unique subjects per property.
	 * 
	 * The generated query has the form:
	 * Select Distinct ?p (Count(?p) As ?c) {
	 *   { Select Distinct ?s ?p { driver . ?s ?p ?o . } }
	 * }
	 * 
	 * NOTE Variables are __s, __p, __o. Beware of name clashes.
	 * 
	 */
	ns.createFacetQueryCount = function(driver, driverVar, sampleSize) {
		// The maximum number of instances to scan for collecting properties		
		
		var q = new sparql.Query();
		
		q.distinct = true;
		
		var p = sparql.Node.v("__p");
		var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		q.projectVars.add(p);
		q.projectVars.add(c, new sparql.E_Count(new sparql.ExprVar(p)));
		///q.projection[p.value] = null;
		///q.projection[c.value] = new sparql.E_Count(new sparql.ExprVar(p));

		//q.projection[c.value] = new sparql.E_Count(new sparql.ExprVar(driverVar));
		
		var tmp = q;
		if(true) { // limit instances to check for properties
		    var subQuery = new sparql.Query();
		    
		    if(false) {
		    	subQuery.isResultStar = true;
		    } else {
		    	//console.error(driverVar);
		    	subQuery.projectVars.add(driverVar);
		    	subQuery.projectVars.add(p);
		    	///subQuery.projection[driverVar.value] = null;
		    	///subQuery.projection[p.value] = null;
		    	subQuery.distinct = true;
		    }
		    
		    
		    subQuery.limit = sampleSize;
		    q.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		
		//console.log("Driver", driver);
		
		tmp.elements.push(driver);
		tmp.elements.push(new sparql.ElementTriplesBlock([new sparql.Triple(driverVar, p, o)]));
		
		
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
		q.order.push(new sparql.Order(new sparql.ExprVar(c), sparql.OrderDir.Desc));
		
		//console.log("Created query: " + q);
		return q;
	};

	ns.createQueryFacetValuesCountedFiltered = function(baseElement, breadcrumb, sampleSize, searchString) {
		var element = ns.createElementFacetValues(baseElement, breadcrumb, searchString);
		var result = ns.createQueryFacetValuesCounted(element, breadcrumb, sampleSize);		
		return result;
	};

	ns.createQueryCountFacetValues = function(baseElement, breadcrumb, searchString, sampleSize, outputVar) {
		var element = ns.createElementFacetValues(baseElement, breadcrumb, searchString);		
		var facetVar = sparql.Node.v(breadcrumb.targetNode.variable);
		var result = ns.createCountQuery(element, sampleSize, facetVar, outputVar);		
		return result;
	};
	

	
	ns.createElementLabelRegex = function(driverVar, searchString, labelVar, property) {
		property = property ? property : rdfs.label;
		labelVar = labelVar ? labelVar : sparql.Node.v("__l");
		
		var filterExpr = new sparql.E_LogicalOr(
				new sparql.E_Regex(new sparql.E_Str(new sparql.ExprVar(driverVar)), searchString, "i"),
				new sparql.E_Regex(new sparql.ExprVar(labelVar), searchString, "i"));
		
		var optionalElement = new sparql.ElementTriplesBlock([new sparql.Triple(driverVar, property, labelVar)]);
		var optional = new sparql.ElementOptional(optionalElement);		

		element = new sparql.ElementGroup();		
		element.elements.push(optional);
		element.elements.push(new sparql.ElementFilter(filterExpr));

		return element;
	};
	

	/**
	 * Filters an element
	 * 
	 * element
	 *   Optional {
	 *     ?facetVar label ?labelVar .
	 *   }
	 *   Filter(regex(str(?facetVar), ...) || Filter(regex(?labelVar, ...)))
	 *     
	 *  
	 */
	ns.createElementFiltered = function(breadcrumb, searchString, property) {
		if(!searchString) {
			return null;
		}	
		
		// Get or create the variable for the label
		var facetVar = sparql.Node.v(breadcrumb.targetNode.variable);
		var labelVar = sparql.Node.v(breadcrumb.targetNode.getOrCreate(rdfs.label.value).variable);

		var result = ns.createElementLabelRegex(facetVar, searchString, labelVar, property);
		return result;
		
		/*
		var filterExpr = new sparql.E_LogicalOr(
				new sparql.E_Regex(new sparql.E_Str(new sparql.ExprVar(facetVar)), searchString, "i"),
				new sparql.E_Regex(new sparql.ExprVar(labelVar), searchString, "i"));
		
		var optionalElement = new sparql.ElementTriplesBlock([new sparql.Triple(facetVar, rdfs.label, labelVar)]);
		var optional = new sparql.ElementOptional(optionalElement);		

		element = new sparql.ElementGroup();		
		element.elements.push(optional);
		element.elements.push(new sparql.ElementFilter(filterExpr));
		
		return element;
		*/
	};
	

	ns.createElementFacetValues = function(baseElement, breadcrumb, searchString) {
		var result = new sparql.ElementGroup();
		
		if(baseElement) {
			result.elements.push(baseElement);
		}
		
		var breadcrumbElement = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
		result.elements.push(breadcrumbElement);
		
		var searchElement = ns.createElementFiltered(breadcrumb, searchString);

		if(searchElement) {
			result.elements.push(searchElement);
		}
		
		return result;
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
	 * @param sampleSize Puts a limit on the number of resources to consider
	 */
	ns.createQueryFacetValuesCounted = function(baseElement, breadcrumb, sampleSize) {
		// The maximum number of instances to scan for collecting properties
		//var config = facet.getConfig();

		var element = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
		
		//console.warn("baseElement/breadcrumb", baseElement, breadcrumb);
		
		//var element = baseElement; //breadcrumb.getTriples();
		//var inputVar = sparql.Node.v(breadcrumb.sourceNode.variable);
		var inputVar = sparql.Node.v(breadcrumb.sourceNode.variable);
		var outputVars = [sparql.Node.v(breadcrumb.targetNode.variable)];
		
		//var element = facet.getElement();
		//var outputVars = _.difference(facet.getElement().getVarsMentioned(), [inputVar]);
		//console.log("Outputvars=", facet.getElement().getVarsMentioned(), inputVar);

		var result = new sparql.Query();
		for(var i in outputVars) {
			var outputVar = outputVars[i];
			
			//var varNode = sparql.Node.v(outputVar);
			result.projectVars.add(outputVar);
			//result.projection[outputVar] = null; //varNode;
		}
		
		
		result.distinct = true;
		
		//var p = sparql.Node.v("__p");
		//var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		//result.projection[p] = null;
		///result.projection[c.value] = new sparql.E_Count();
		result.projectVars.add(c, new sparql.E_Count());


		var subQuery = result;
		if(sampleSize) { // limit instances to check for properties
		    subQuery = new sparql.Query();
		    subQuery.isResultStar = true;
		    subQuery.limit = sampleSize;
		    result.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}

		//subQuery.elements.push(config.driver);
		subQuery.elements.push(baseElement);
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
			result.order.push(new sparql.Order(new sparql.ExprVar(outputVar), sparql.OrderDir.Asc));
		}

		
		//console.debug("Created query: " + result);
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
			q.projection.projectVars.add(p);
			q.projection.porjectVars.add(count, new sparql.E_Count(s));
			///q.projection[p.value] = null;
			///q.projection[count.value] = new sparql.E_Count(s);


			var subQuery = new sparql.Query();
			subQuery.limit = maxCount;
			subQuery.elements.push(config.driver);
			subQuery.elements.push(facet.queryElement); //.copySubstitute(facet.mainVar, facetManager.driverVar);
			subQuery.distinct = true;
			subQuery.projectVars.add(p, new sparql.NodeValue(sparql.Node.uri(facet.id)));
			subQuery.projectVars.add(s);
			///subQuery.projection[p.value] = new sparql.NodeValue(sparql.Node.uri(facet.id));
			///subQuery.projection[s.value] = null;
			//subQuery.projection[count] = new sparql.E_Count(subExpr);
			//subQuery.projection[count] = new sparql.E_Count(new sparql.ExprVar(s));
			//q.elements.push(new sparql.ElementSubQuery(subQuery));

			
			var countWrapper = new sparql.Query();
			countWrapper.projectVars.add(p);
			countWrapper.projectVars.add(count, new sparql.E_Count(new sparql.ExprVar(s)));
			///countWrapper.projection[p.value] = null;
			///countWrapper.projection[count.value] = new sparql.E_Count(new sparql.ExprVar(s));
			
			countWrapper.elements.push(new sparql.ElementSubQuery(subQuery));
			

			unionElements.push(new sparql.ElementSubQuery(countWrapper));
			//batchQuery.
			//this.facetManager. somehow get the configuration as a query
			
			
			// TODO: For each facet we need to get its query element.
			// facet.getQueryElement();
			
			
			// Select Distinct ?p ?c { { Select ?p { <driver> ?driver_var ?p ?o . Filter(?p = <facet>) . } Limit 1001 } }
			
			//this.sparqlService.
		}
		
		//var union = FacetController.balance(sparql.ElementUnion, unionElements);
		

		var batchQuery = new sparql.Query();
		//batchQuery.isResultStar = true;
		batchQuery.projectVars.add(p);
		batchQuery.projectVars.add(count);
		///batchQuery.projection[p.value] = null;
		///batchQuery.projection[count.value] = null;
		batchQuery.elements.push(new sparql.ElementUnion(unionElements));

		console.log("Facet query: " + batchQuery);
		
		return batchQuery;
	};

	
	/**
	 * Wraps an element for counting (possibly using group by)
	 * 
	 * If one of the groupVars equals variable, it is omitted
	 * 
	 */
	ns.createCountQuery = function(element, limit, variable, outputVar, groupVars) {
		
		
		var subQuery = new sparql.Query();
		
		subQuery.elements.push(element); //element.copySubstitute(function(x) { return x; }));
		
		subQuery.projectVars.add(variable);

		///subQuery.projection[variable.value] = null;
		subQuery.distinct = true;
		
		if(limit) {
			subQuery.limit = limit;
		}
		
		var result = new sparql.Query();
		
		if(groupVars) {
			for(var i = 0; i < groupVars.length; ++i) {
				
				var groupVar = groupVars[i];
				
				if(groupVar.value !== variable.value) {
					subQuery.projectVars.add(groupVar);
				}
				
				// FIXME Only works with virtuoso that way
				result.projectVars.add(groupVar);
			}
		}
		
		result.projectVars.add(outputVar, new sparql.E_Count(new sparql.ExprVar(variable)));
		///result.projection["c"] = new sparql.E_Count(new sparql.ExprVar(variable));
		result.elements.push(new sparql.ElementSubQuery(subQuery));

		//console.error(limit);
		//console.error(result.toString());
		
		return result;
	};
	
	/**
	 * @deprecated
	 * 
	 * Creates a query that - based on another query - counts the number of
	 * distinct values for a given variable.
	 * 
	 * TODO Move to some utils package
	 * DONE Change it so it doesn't take a query as arg, but an element - 
	 * 
	 * @param baseQuery
	 * @param limit
	 * @param variable
	 * @param groupVars Optional an array of variables to group by
	 *     TODO Now I finally have to change to projection to a list rather than a map...
	 * @returns {sparql.Query}
	 */
	ns.createCountQueryFromQuery = function(baseQuery, limit, variable, groupVars) {
		//return "Select Count(*) As ?c { { Select Distinct ?n { ?n a ?t ; geo:long ?x ; geo:lat ?y . " +  createBBoxFilterWgs84("x", "y", bounds) + this.createClassFilter("t", uris) + " } Limit 1000 } }";
		
		// Create a new query with its elemets set to copies of that of the baseQuery
		var subQuery = new sparql.Query();
		
		for(var i = 0; i < baseQuery.elements.length; ++i) {
			var element = baseQuery.elements[i];
			var copy = element.copySubstitute(function(x) { return x; });
			
			subQuery.elements.push(copy);
		}
		
		subQuery.projectVars.add(variable);
		///subQuery.projection[variable.value] = null;
		subQuery.distinct = true;
		
		if(limit) {
			subQuery.limit = limit;
		}
		
		var result = new sparql.Query();
		result.projectVars.add(sparql.Node.v("c"), new sparql.E_Count(new sparql.ExprVar(variable)));
		///result.projection["c"] = new sparql.E_Count(new sparql.ExprVar(variable));
		result.elements.push(new sparql.ElementSubQuery(subQuery));

		//console.error(limit);
		//console.error(result.toString());
		
		return result;
	};
	
	
	/**
	 * Select Distinct ?p (Count(?p) As ?c) {
	 *   Select Distinct ?s ?p {
	 *     driver
	 *     {
	 *       Select Distinct ?s { geomElement . Filter(geom In ...) } 
	 *     }   
	 *   }
	 * }
	 * 
	 * If this does not work, I think all we can do is either drop
	 * facet counting (sucks) or fetch all data (might suck)
	 * 
	 * @param uris
	 * @returns A Driver object (element, var)
	 */
	ns.createFacetQueryCountVisibleGeomNested = function(queryGenerator, uris) {

		var driver = queryGenerator.driver;
		//var geoQueryFactory = this.queryGenerator.createQueryFactory();


		//console.log("queryFactory", queryFactory);

		var subQuery = new sparql.Query();
		var triplesBlock = new sparql.ElementTriplesBlock();
		triplesBlock.addTriples(queryGenerator.geoConstraintFactory.getTriples());
		subQuery.elements.push(triplesBlock);
		
		var geomVarStr = queryGenerator.geoConstraintFactory.breadcrumb.targetNode.variable; //geoQueryFactory.geoConstraintFactory.breadcrumb.targetNode.variable;
		var geomVarExpr = new sparql.ExprVar(sparql.Node.v(geomVarStr));
		//console.log("geomVar", geomVar);
		var filterExpr = (uris.length === 0) ? sparql.NodeValue.False : new sparql.E_In(geomVarExpr, uris);
		var filterElement = new sparql.ElementFilter(filterExpr);

		subQuery.elements.push(filterElement);
		subQuery.projectVars.add(driver.variable);
		///subQuery.projection[driver.variable.value] = null;
		subQuery.distinct = true;
		
		var elements = [driver.element, new sparql.ElementSubQuery(subQuery)];
		
		// Add facet constraints
		var facetElement = queryGenerator.constraints.getSparqlElement();
		if(facetElement) {
			elements.push(facetElement);
		}

		
		var element = new sparql.ElementGroup(elements);		
		
		//var result = queryUtils.createFacetQueryCount(element, this.queryGenerator.driver.variable);
		var result = new facets.Driver(element, queryGenerator.driver.variable);

		return result;
	};
	

	ns.createQueryGeomLonLat = function(geomVar, lonVar, latVar) {
		var element = ns.createElementGeomLonLat(geomVar, lonVar, latVar);
		var result = ns.createQueryGeomLonLatElement(element, geomVar, lonVar, latVar);
		return result;
	};

	ns.createElementGeomLonLat = function(geomVar, lonVar, latVar) {
		var triples = [];
		
		triples.push(new sparql.Triple(geomVar, geo.long, lonVar));
		triples.push(new sparql.Triple(geomVar, geo.lat, latVar));
		
		var result = new sparql.ElementTriplesBlock(triples);
		return result;			

	};
	

	/**
	 * Select ?geomVar ?lonVar ?latVar { element . }
	 * 
	 * Assumes that the geo-triples (geo:{long,lat}) are present.
	 */
	ns.createQueryGeomLonLatElement = function(element, geomVar, lonVar, latVar) {
		var result = new sparql.Query();
		result.projectVars.add(geomVar);
		result.projectVars.add(lonVar);
		result.projectVars.add(latVar);

		result.elements.push(element);

		return result;		
	};
	
	/**
	 * This method generates the facet query based on explicely given geometries.
	 * 
	 * @param uris
	 * @returns
	 */
	ns.createFacetQueryCountVisibleGeomSimple = function(queryGenerator, uris) {

		var geoQueryFactory = queryGenerator.createQueryFactory();

		var baseQuery = geoQueryFactory.baseQuery;
		//var baseElement = new sparql.ElementGroup(baseQuery.elements.slice(0)); // create a copy of the original elements
		var elements = baseQuery.elements.slice(0);

		var geomVarStr = geoQueryFactory.geoConstraintFactory.breadcrumb.targetNode.variable;
		var geomVarExpr = new sparql.ExprVar(sparql.Node.v(geomVarStr));
		//console.log("geomVar", geomVar);
		var filterExpr = (uris.length === 0) ? sparql.NodeValue.False : new sparql.E_In(geomVarExpr, uris);
		var filterElement = new sparql.ElementFilter(filterExpr);
		
		elements.push(filterElement);

		var element = new sparql.ElementGroup(elements);
		
		var result = queryUtils.createFacetQueryCount(element, this.queryGenerator.driver.variable);

		return result;
	};

	
	/**
	 * Creates a query that counts the facets for the given visible area:
	 * Nodes that contain too many items are excluded.
	 * 
	 * The structure is:
	 * 
	 * Select Distinct ?p (Count(?p) As ?c) {
	 *   Select Distinct ?s ?p {
	 *       { fragment . Filter(area1) . ?s ?p ?o }
	 *     Union
	 *       { fragment . Filter(area2) . ?s ?p ?o }
	 *     Union
	 *       { ... }
	 *   }
	 * }
	 * 
	 * 
	 * @param bounds
	 * @param nodes
	 * @returns
	 */
	/*
	ns.createFacetQueryCountVisible = function(bounds, nodes) {

		var loadedNodes = ns.AppController.getLoadedNodes(nodes);
		
		
		var geoQueryFactory = this.queryGenerator.createQueryFactory();
		
		// We can either create multiple queries with different bounds ...
		// var query = geoQueryFactory.create(bounds);
		
		// .. or we use the geoConstraintFactory to create multiple geo-constraints
		// and 'or' them together
		//var baseQuery = geoQueryFactory.baseQuery.copySubstitute(function(x) { return x; });
		//baseQuery.type = sparql.QueryType.Select;
		var baseQuery = geoQueryFactory.baseQuery;
		//var baseElement = new sparql.ElementGroup(baseQuery.elements.slice(0)); // create a copy of the original elements
		var baseElements = baseQuery.elements;
		
		var unionElement = new sparql.ElementUnion();
		
		//console.error(baseElement.toString());
		
		var geoConstraintFactory = geoQueryFactory.geoConstraintFactory;

		///var constraintExprs = [];
		
		
		for(var i = 0; i < loadedNodes.length; ++i) {
			var node = loadedNodes[i];

			var nodeBounds = node.getBounds();
			var intersectBounds = nodeBounds.overlap(bounds);
			if(intersectBounds) {
				var geoConstraint = geoConstraintFactory.create(intersectBounds);
				///constraintExprs.push(geoConstraint.getExpr());
				
				var elements = baseElements.slice(0);
				elements.push(new sparql.ElementFilter(geoConstraint.getExpr()));
				
				var unionMember = new sparql.ElementGroup(elements);
				
				
				unionElement.elements.push(unionMember);
			}
		}
		

		// One large filter expression does not work efficiently
		// We create a union instead
		/ *
		var expr = sparql.opify(constraintExprs, sparql.E_LogicalOr);
		var filterElement = new sparql.ElementFilter(expr);
		baseElement.elements.push(filterElement);
		var result = queryUtils.createFacetQueryCount(baseElement, this.queryGenerator.driver.variable);
		* /
		
		var result = queryUtils.createFacetQueryCount(unionElement, this.queryGenerator.driver.variable);
		
		//console.debug("FacetCounts", result.toString());
		return result;
	};
	*/
	
})(jQuery);
