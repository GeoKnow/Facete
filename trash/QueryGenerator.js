	ns.QueryFactoryGeo = function(baseQuery, bindings, geoConstraintFactory) {
		this.baseQuery = baseQuery;
		this.bindings = bindings;
		
		// Note: the geo constraint factory supports filtering by bounds
		// It is also assumed that there is a variable for the geo-resources
		this.geoConstraintFactory = geoConstraintFactory;
	};
	
	ns.QueryFactoryGeo.prototype.create = function(bounds) {
		// Create a deep copy of the query (substitute with identity mappinp)
		
		//console.warn("[Query] Original", this.baseQuery.toString());
		var copy = this.baseQuery.copySubstitute(function(x) { return x; });
		//console.warn("[Query] Copy", copy.toString());		
		
		var geoConstraint = this.geoConstraintFactory.create(bounds);
		
		//var geoConstraint = this.geoConstraintFactory.create(bounds);
		var filter = new sparql.ElementFilter(geoConstraint.getExpr());
		copy.elements.push(filter);
		
		return copy;
	};

	ns.QueryFactoryGeo.prototype.toString = function() {
		return this.baseQuery.toString();
	};

	
	

	/*
	ns.QueryGenerator.prototype.initFacets = function() {
		
	};
	*/
	
	ns.ElementFactoryGeo = function(driver, geoConstraintFactory) {
		this.driver = driver;
		this.geoConstraintFactory = geoConstraintFactory;
		//this.elements = elements;
		//this.driverVar = driverVar;
		/*
		this.geo
		this.geomVar = geomVar;
		this.latVar = latVar;
		this.longVar = longVar;
		*/
	};
	
	ns.ElementFactoryGeo.prototype.createForBounds = function(bounds) {
		// FIXME We assume the element to be an ElementGroup
		var copy = this.driver.element.copySubstitute(function(x) { return x; }); //this.baseQuery.copySubstitute(function(x) { return x; });
		//console.warn("[Query] Copy", copy.toString());		
		
		var geoConstraint = this.geoConstraintFactory.create(bounds);
		
		//var geoConstraint = this.geoConstraintFactory.create(bounds);
		var filter = new sparql.ElementFilter(geoConstraint.getExpr());
		copy.elements.push(filter);

		return copy;
		//var result = new facets.Driver(copy, this.driver.variable);
		//return result;		
	};
	
	ns.ElementFactoryGeo.prototype.createForGeoms = function(geomUriNodes) {
		var copy = this.driver.element.copySubstitute(function(x) { return x; });
		var filter = new sparql.ElementFilter(new sparql.E_In(this.geoConstraintFactory.geomVar, geomUriNodes));
		
		copy.elements.push(filter);

		return copy;
		//var result = new facets.Driver(copy, this.driver.variable);
		//return result;
	};
	
	

	/**
	 * Creates a factory for creating query elements from bboxes.
	 *
	 * options:
	 *     disableConstraints = {false(default), true} Whether to enable constraints for the query
	 *     geoSubQueryType = {none, geo, geo+} 
	 *
	 * ISSUE: I would like to have some reasonable treatment of the cases:
	 * latlongFactory.create(bbox)
	 * geomLitFactory.create(bbox)
	 * explicitFactory.create(geomUris)
	 * 
	 */
	ns.QueryGenerator.prototype.createElementFactory = function(options) {
		var elements = [];
		
		elements.push(this.driver.element);
		
		
		var triplesBlock = new sparql.ElementTriplesBlock();
		
		elements.push(triplesBlock);
		triplesBlock.addTriples(this.geoConstraintFactory.getTriples());
		
	
		//var geoConstraint = this.geoConstraintFactory.create(bounds);
		//query.elements.push(new sparql.ElementFilter(geoConstraint.getExpr()));
				
		

		//this.geoConstraintFactory

		var driverVar = this.driver.variable;
		
		// TODO breadcrumbs should also use Node objects for variables
		/*
		var geomVar = sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
		var xVar = sparql.Node.v(this.geoConstraintFactory.breadcrumbX.targetNode.variable);
		var yVar = sparql.Node.v(this.geoConstraintFactory.breadcrumbY.targetNode.variable);
		*/


		// Add facet constraints
		if(!(options && options.disableConstraints)) {
			var element = this.constraints.getSparqlElement();
			if(element) {
				elements.push(element);
			}
		}
		
		triplesBlock.uniq();
		
		
		var newDriver = new facets.Driver(new sparql.ElementGroup(elements), driverVar);
		var result = new ns.ElementFactoryGeo(newDriver, this.geoConstraintFactory);
		
		return result;
	};
	
	
	
	/**
	 * @Deprecated
	 * 
	 * Creates a SPARQL query for fetching resources, geo-coordinates, labels (and possibly more)
	 * based on all available constraints.
	 *
	 * Returns an object with the query object, and a set of semantic mappings of the queryies
	 * variable (e.g. {label: v_1}
	 * 
	 * Options:
	 *     disableConstraints
	 *
	 * 
	 * @returns A QueryFactoryGeo object that contains the base query and supports adding bbox constraints
	 */
	ns.QueryGenerator.prototype.createQueryFactory = function(options) {
		
		var query = new sparql.Query();
		
		query.elements.push(this.driver.element);
		
		for(var i = 0; i < this.constraints.length; ++i) {
			// Create query element and filter expression
		}
		
		
		var triplesBlock = new sparql.ElementTriplesBlock();
		
		query.elements.push(triplesBlock);
		triplesBlock.addTriples(this.geoConstraintFactory.getTriples());
		
	
		//var geoConstraint = this.geoConstraintFactory.create(bounds);
		//query.elements.push(new sparql.ElementFilter(geoConstraint.getExpr()));
				
		

		//this.geoConstraintFactory

		var driverVar = this.driver.variable;
		
		// TODO breadcrumbs should also use Node objects for variables
		var geomVar = sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
		var xVar = sparql.Node.v(this.geoConstraintFactory.breadcrumbX.targetNode.variable);
		var yVar = sparql.Node.v(this.geoConstraintFactory.breadcrumbY.targetNode.variable);


		// Add facet constraints
		if(!(options && options.disableConstraints)) {
			var element = this.constraints.getSparqlElement();
			if(element) {
				query.elements.push(element);
			}
		}
		
		// TODO We need to find out the variables which should be fetched.
		var labelBc = new facets.Breadcrumb.fromString(this.pathManager, rdfs.label.value);
		var typeBc = new facets.Breadcrumb.fromString(this.pathManager, rdf.type.value);
		
		triplesBlock.addTriples(labelBc.getTriples());
		triplesBlock.addTriples(typeBc.getTriples());
		
		
		var labelVar = sparql.Node.v(labelBc.targetNode.variable);
		
		triplesBlock.uniq();
		
		// TODO I think construct is a better choice than select
		// So eventually remove the select part.
		// Bindings also are not required anymore (replaced by the predicates of the construct template)
		var useConstruct = true;
		if(!useConstruct) {
			query.projection[geomVar] = null;
			query.projection[xVar] = null;
			query.projection[yVar] = null;
			query.projection[labelBc.targetNode.variable] = null;
			
			// TODO: Maybe use Construct query instead
			var bindings = {geom: geomVar, x: xVar, y: yVar, subject: this.driver.variable.value};
		}
		
		
		if(useConstruct) {
			query.type = sparql.QueryType.Construct;
			
			var triples = [];
			
			triples.push(new sparql.Triple(driverVar, rdfs.label, labelVar));
			triples.push(new sparql.Triple(driverVar, geovocab.geometry, geomVar));
			triples.push(new sparql.Triple(geomVar, geo.long, xVar));
			triples.push(new sparql.Triple(geomVar, geo.lat, yVar));
			
			var bgp = new sparql.BasicPattern(triples);
			query.constructTemplate = new sparql.Template(bgp);			
		}
		
		
		
		//var boundQuery = {query: query, bindings: bindings};
		
		//console.log("Created query and bindings:", result);
		//console.log("Query string:", query.toString());

		
		var result = new ns.QueryFactoryGeo(query, bindings, this.geoConstraintFactory);
		
		return result;
		
		//alert("Creating query");
		//BreadCrumb.getTargetVariable
		//BreadCrumb.getVariables()
	};

	
	
	/**
	 * Create a query that fetches resources only based on the constraints - i.e.
	 * not based on a bbox- constraint.
	 * 
	 * The idea is, if counting the result returns few instances,
	 * it we can fetch all data without bothering about geo-constraints.
	 * 
	 * This can be useful for constraints such as: (label = 'foo').
	 * In this case there query should return quickly with only at most a handful of instances.
	 * 
	 * 
	 */
	ns.QueryGenerator.prototype.createGlobalQuery = function() {
				
		var elements = [];
		
		elements.push(this.driver.element);
		
		var triplesBlock = new sparql.ElementTriplesBlock();
		
		elements.push(triplesBlock);
		triplesBlock.addTriples(this.geoConstraintFactory.getTriples());

		// Add facet constraints
		var element = this.constraints.getSparqlElement();
		if(element) {
			elements.push(element);
		}
		
		triplesBlock.uniq();
		
		var elementGroup = new sparql.ElementGroup(elements);

		return new facets.Driver(elementGroup, this.driver.variable);
	};
	

	ns.QueryGenerator.prototype.setDriver = function(driver) {
		this.driver = driver;
	};
	
	ns.QueryGenerator.prototype.setGeoConstraintFactory = function(geoConstraintFactory) {
		this.geoConstraintFactory = geoConstraintFactory;
	};
	
	/*
	ns.QueryGenerator.prototype.refresh = function(bounds) {
		var query = this.createQuery(bounds);
		
		console.log(query.toString());
		
		/ *
		this.sparqlService.executeSelect(query.toString(), function(jsonRdf) {
			// TODO Process the result
		});
		* /
	};*/
	

	
	/*
	 * Utility methods that create a query factory either based on bounds or on geom uris
	 * 
	 */	
	/*
	ns.createQueryFactoryBounds = function(elementFactoryGeo, bounds) {
		var geomVar = sparql.Node.v(elementFactoryGeo.geoConstraintFactory.breadcrumb.targetNode.variable);
		var featureVar = sparql.Node.v(elementFactoryGeo.geoConstraintFactory.breadcrumb.sourceNode.variable);
		
		var element = elementFactoryGeo.createForBounds(bounds);
		
		return new ns.QueryFactory(element, featureVar, geomVar);
	};
	
	ns.createQueryFactoryGeoms = function(elementFactoryGeo, geomUriNodes) {
		var geomVar = sparql.Node.v(elementFactoryGeo.geoConstraintFactory.breadcrumb.targetNode.variable);
		var featureVar = sparql.Node.v(elementFactoryGeo.geoConstraintFactory.breadcrumb.sourceNode.variable);
		
		var element = elementFactoryGeo.createForGeoms(geomUriNodes);
		
		return new ns.QueryFactory(element, featureVar, geomVar);
	};
	*/
	
	
	/*
	ns.Backend.prototype.fetchData = function(bounds) {
		var query = this.geoQueryFactory.create(bounds);
		
		return this.sparqlService.executeAny(query.toString());		
	};*/
	
	
	
	/* NOT NEEDED: fetchFeatureCountPerGeom already returns all geoms
	ns.fetchGeoms = function(bounds) {
		var element = this.geoElementFactory.create(bounds);
		
		// Create a query that retrieves the geoms
		
		
		var query = this.geoQueryFactory.create(bounds);
		
		return this.sparqlService.executeAny(query.toString());				
	}
	*/
	
