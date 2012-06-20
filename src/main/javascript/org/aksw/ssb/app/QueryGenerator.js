(function() {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	/*
	var facets = Namespace("org.aksw.ssb.facets");

	var rdf = Namespace("org.aksw.ssb.vocabs.rdf");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");

	var geovocab = Namespace("org.aksw.ssb.vocabs.geovocab");
	*/

	var ns = Namespace("org.aksw.ssb.app.controllers");
	
	
	/**
	 * The query generator creates a SPARQL query
	 * for resources based on selected 
	 * .) type 
	 * .) facets and
	 * .) boundary
	 * 
	 * 
	 */
	ns.QueryGenerator = function(options) {
		this.options = options;
		
	
		/* Query generation */
		
		// The driver is a query element which specifies which resources to fetch
		// (e.g. ?s a Subvention)
		// The driverVar is a variable of the driver element (e.g. ?s) 
		this.driver = options.driver;
		//this.driverVar = options.driverVar;
		
		// The path manager can create query elements for property paths
		// such as (knows label) -> ?x knows ?y . ?y label ?z.
		// Common paths will have the same variables in the corresponding query element
		this.pathManager = options.pathManager;
		
		// A factory for creating query elements that
		// correspond to boundary constraints (e.g. whenever the map view changes) 
		this.geoConstraintFactory = options.geoConstraintFactory;
		
		// A list of constraint objects that need to be included in the final query
		// Such as generated by the facet view
		this.constraints = options.constraints;
		
		// A breadcrumb to the set of resources a user navigated to
		// TODO This should better be a path - i.e. no duplication of the pathManager
		this.navigationBreadcrumb = options.navigationBreadcrumb;

		
		
		// A list of paths for which to fetch data
		// TODO Not sure how components should declare that
	};
	
	/**
	 * Create a new QueryGenerator, where constraints on a specific path have been excluded
	 * 
	 */
	ns.QueryGenerator.prototype.copyExcludeConstraints = function(path) {
		var result = new ns.QueryGenerator(
				this.options,
				this.driver,
				this.pathManager,
				this.geoConstraintFactory,
				this.constraints.copyExclude(path),
				this.navigationBreadcrumb);
		
		return result;
	};
	
	/*
	ns.QueryGenerator.prototype.excludeConstraint(paths) {
		return new ns.QueryGene
	};*/

	ns.QueryGenerator.prototype.getInferredDriver = function() {
		//var element = this.forGlobal();
		
		var element = null;

		var navigationTriples = this.navigationBreadcrumb.getTriples();
		if(navigationTriples.length > 0) {
			var elements = [];

			// Add base driver element
			elements.push(this.driver.element);
			elements.push(new sparql.ElementTriplesBlock(navigationTriples));
			
			element = new sparql.ElementGroup(elements);;
		} else {
			element = this.driver.element;
		}

		
		var variable = sparql.Node.v(this.navigationBreadcrumb.targetNode.variable);				
		var result = new facets.Driver(element, variable);

		return result;
	};
	
	/**
	 * Returns an element without constraints on the geoms.
	 * Note that the geo-related triples will still be there by default.
	 * 
	 * FIXME: Should there be an option to disable that?
	 * 
	 * @param options
	 */
	ns.QueryGenerator.prototype.forGlobal = function(options) {
		var elements = [];

		// Add driver element
		//elements.push(this.driver.element);
		var inferredDriver = this.getInferredDriver();
		elements.push(inferredDriver.element);

		// Add geo triples (no filter condition)
		this._appendGeoElement(elements, options);
		
		// Add facet constraints
		this._appendConstraintElement(elements, options);
		
		
		// Add the navigation breadcrumb
		var navigationTriples = this.navigationBreadcrumb.getTriples();
		elements.push(new sparql.ElementTriplesBlock(navigationTriples));
		
		var result = new sparql.ElementGroup(elements); 
		
		return result;
	};

	ns.QueryGenerator.prototype.forBounds = function(bounds, options) {
		var filter = this._createGeoElementBounds(bounds);
		var result = this._forFilter(filter);
		return result;
	};
	
	ns.QueryGenerator.prototype.forGeoms = function(geomUriNodes, options) {

		
		//var geomVar = this.geoConstraintFactory.geomVar;
		var geomVar = sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
		
		var geoElement = this._createGeoElement();
		var filter = new sparql.ElementFilter(new sparql.E_In(geomVar, geomUriNodes));
		
		var element = new sparql.ElementGroup([geoElement, filter]);
		
		
		var result = this._forFilter(element);
		return result;		
	};
	
	
	// What the hack was I thinking when I wrote this? The geo-element is missing.
	ns.QueryGenerator.prototype.forGeomsOld = function(geomUriNodes, options) {
		//var geomVar = this.geoConstraintFactory.geomVar;
		var geomVar = sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
		
		var filter = new sparql.ElementFilter(new sparql.E_In(geomVar, geomUriNodes));
		var result = this._forFilter(filter);
		return result;		
	};

	
	/**
	 * Common code for forBounds and forGeoms.
	 */
	ns.QueryGenerator.prototype._forFilter = function(filter, options) {
		var inferredDriver = this.getInferredDriver();
		
		var tmpElement = new sparql.ElementGroup();
		tmpElement.elements.push(inferredDriver.element);
		tmpElement.elements.push(filter);
				
		var result;
		if(options && options.geoSubQuery) {
			var subQuery = new sparql.ElementSubQuery();
			
			//var geomVar = this.geoConstraintFactory.geomVar;
			var geomVar = sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
			
			subQuery.projectVars.add(geomVar);
			subQuery.elements.push(tmpElement);
			
			result = new sparql.ElementGroup();
			result.elemements.push(subQuery);
			
			
		} else {
			result = tmpElement; 
		}
		
		this._appendConstraintElement(result.elements, options);

		return result;
	};

	
	ns.QueryGenerator.prototype._createGeoElement = function() {
		var result = new sparql.ElementTriplesBlock();
		result.addTriples(this.geoConstraintFactory.getTriples());
		result.uniq();		
		
		return result;
	};
	
	ns.QueryGenerator.prototype._createGeoElementBounds = function(bounds) {
		var result = new sparql.ElementGroup();

		// Add geo triples
		this._appendGeoElement(result.elements);
		
		// Add the filter statement
		var geoConstraint = this.geoConstraintFactory.create(bounds);		
		var filter = new sparql.ElementFilter(geoConstraint.getExpr());
		result.elements.push(filter);

		return result;		
	};
	
	
	/*
	 * Utility methods
	 */
	
	ns.QueryGenerator.prototype._appendGeoElement = function(destElements) {
		var geoElement = this._createGeoElement();
		destElements.push(geoElement);
	};
	
	ns.QueryGenerator.prototype._appendGeoElementBounds = function(destElements, bounds, options) {
		var element = this._cerateGeoElementBounds();
		destElements.push(element);
	};
	
	ns.QueryGenerator.prototype._appendConstraintElement = function(destElements, options) {
		if(!(options && options.disableConstraints)) {
			var element = this.constraints.getSparqlElement();
			if(element) {
				destElements.push(element);
			}
		}
	};

})();

