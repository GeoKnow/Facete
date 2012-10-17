(function() {
	
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var widgets = Namespace("org.aksw.ssb.widgets");

	/*
	var facets = Namespace("org.aksw.ssb.facets");

	var rdf = Namespace("org.aksw.ssb.vocabs.rdf");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");

	var geovocab = Namespace("org.aksw.ssb.vocabs.geovocab");
	*/

	var ns = Namespace("org.aksw.ssb.app.controllers");
	
	
	
	/**
	 * New approach: A GeoQueryFactory is an extension of a QueryFactory. 
	 * 
	 * @param queryGenerator
	 * @param geoConstraintFactory
	 * @param options
	 * @returns {ns.QueryGeneratorGeo}
	 */
	ns.QueryGeneratorGeo = function(queryGenerator, geoConstraintFactory, options) {
		this.queryGenerator = queryGenerator;
		this.geoConstraintFactory = geoConstraintFactory;
		this.options = options;
	};
	
	ns.QueryGeneratorGeo.prototype.getVariable = function() {
		return sparql.Node.v(this.queryGenerator.pathManager.getRoot().variable);
	};
			
	ns.QueryGeneratorGeo.prototype.copyExcludeConstraint = function(path) {
		return new ns.QueryGeneratorGeo(
			this.queryGenerator.copyExcludeConstraint(path),
			this.geoConstraintFactory,
			this.options
		);
	};
	
	ns.QueryGeneratorGeo.prototype.navigateToPath = function(path) {
		return new ns.QueryGeneratorGeo(
			this.queryGenerator.navigateToPath(path),
			this.geoConstraintFactory,
			this.options
		);
	};

	/**
	 * Create a shallow copy of this object.
	 * 
	 * @returns {ns.QueryGenerator}
	 */
/*
	ns.QueryGeneratorGeo.prototype.clone = function() {
			return new ns.QueryGeneratorGeo(
				this.queryGenerator.clone(),
				this.geoConstraintFactory.clone(),
				this.options); // TODO Clone options
	};
*/
	
	ns.QueryGeneratorGeo.prototype.copy = function(overrides) {
			return new ns.QueryGeneratorGeo(
				this.queryGenerator.copy(overrides),
				this.geoConstraintFactory,
				this.options); // TODO Clone options
	};
	

	
	/*
	 * Pass-Through methods
	 * 
	 * Maybe it makes sense to switch to some inheritance scheme:
	 * The question is, whether a QueryGeneratorGeo should be a subclass of QueryGenerator, or whether composition is better.
	 * Actually, composition seems fine for now.
	 */
	ns.QueryGeneratorGeo.prototype.setNavigationPath = function(path) {
		this.queryGenerator.setNavigationPath(path);
	};

	
	ns.QueryGeneratorGeo.prototype.getInferredDriver = function() {
		return this.queryGenerator.getInferredDriver();
	};
	
	ns.QueryGeneratorGeo.prototype.getConstraints = function() {
		return this.queryGenerator.getConstraints();
	};

	ns.QueryGeneratorGeo.prototype.getFocusPath = function() {
		return this.queryGenerator.getFocusPath();
	};

	ns.QueryGeneratorGeo.prototype.getNavigationPath = function() {
		return this.queryGenerator.getNavigationPath();
	};

	ns.QueryGeneratorGeo.prototype.getPathManager = function() {
		return this.queryGenerator.getPathManager();
	};
	
	ns.QueryGeneratorGeo.prototype.getNavigationBreadcrumb = function() {
		return this.queryGenerator.getNavigationBreadcrumb();
	};

	ns.QueryGeneratorGeo.prototype.getGeoBreadcrumb = function() {
		var result = new facets.Breadcrumb(this.getPathManager(), this.geoConstraintFactory.getPath());
		
		return result;
	};
	
	ns.QueryGeneratorGeo.prototype.clone = function() {
		return new ns.QueryGeneratorGeo(this.queryGenerator.clone(), this.geoConstraintFactory, this.options);
	};
	
	ns.QueryGeneratorGeo.prototype.createDriverValues = function() {
		return this.queryGenerator.createDriverValues();
	};
	
	
	
	/**
	 * Returns an element without constraints on the geoms.
	 * Note that the geo-related triples will still be there by default.
	 * 
	 * FIXME: Should there be an option to disable that?
	 * 
	 * @param options
	 */
	ns.QueryGeneratorGeo.prototype.forGlobal = function(options) {

		var oldDriver = this.createDriverValues();
		
		var group = new sparql.ElementGroup();
		
		if(oldDriver && oldDriver.getElement()) {
			group.elements.push(oldDriver.getElement());
		}
		
		var geoElement = this._createGeoElement();
		if(geoElement.triples.length > 0) {
			group.elements.push(geoElement);
		}
		
		
		var newDriver = new facets.ConceptInt(group, oldDriver.getVariable());
		
		var result = new widgets.QueryGenerator(
				newDriver,
				this.getNavigationPath(),
				this.getFocusPath(),
				this.getConstraints(),
				this.getPathManager());
		
		//alert("RESULT " + result.createDriverValues());
		
		return result;
	};

	ns.QueryGeneratorGeo.prototype.forBounds = function(bounds, options) {
		var filter = this._createGeoElementBounds(bounds);
		var result = this._forFilter(filter);
		return result;
	};
	
	ns.QueryGeneratorGeo.prototype.forGeoms = function(geomUriNodes, options) {

		
		//var geomVar = this.geoConstraintFactory.geomVar;
		var geomVar = this.getGeoBreadcrumb().getTargetVariable(); //sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
		
		var geoElement = this._createGeoElement();
		var filter = new sparql.ElementFilter(new sparql.E_In(geomVar, geomUriNodes));
		
		var element = new sparql.ElementGroup([geoElement, filter]);
		
		
		var result = this._forFilter(element);
		return result;		
	};
	
	
	/**
	 * Common code for forBounds and forGeoms.
	 */
	ns.QueryGeneratorGeo.prototype._forFilter = function(filter, options) {
		var inferredDriver = this.getInferredDriver();
		
		var tmpElement = new sparql.ElementGroup();
		
		if(inferredDriver && inferredDriver.element) {
			tmpElement.elements.push(inferredDriver.element);
		}
		
		tmpElement.elements.push(filter);
				
		var newElement;
		if(options && options.geoSubQuery) {
			var subQuery = new sparql.ElementSubQuery();
			
			//var geomVar = this.geoConstraintFactory.geomVar;
			var geomVar = sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
			
			subQuery.projectVars.add(geomVar);
			subQuery.elements.push(tmpElement);
			
			newElement = new sparql.ElementGroup();
			newElement.elemements.push(subQuery);
			
			
		} else {
			newElement = tmpElement; 
		}
		
		var resultDriver = null;
		
		//if(inferredDriver) {
		resultDriver = new facets.ConceptInt(newElement, this.getVariable());// inferredDriver.getVariable());
		//} 
		
		var result = new widgets.QueryGenerator(
				resultDriver, 
				this.getNavigationPath(),
				this.getFocusPath(),
				this.getConstraints(),
				this.getPathManager()
				);
		
		
		
		//this._appendConstraintElement(result.elements, options);

		return result;
	};

	
	ns.QueryGeneratorGeo.prototype._createGeoElement = function() {
		var result = new sparql.ElementTriplesBlock();
		result.addTriples(this.geoConstraintFactory.getTriples(this.getPathManager()));
		result.uniq();		
		
		return result;
	};
	
	ns.QueryGeneratorGeo.prototype._createGeoElementBounds = function(bounds) {
		var result = new sparql.ElementGroup();

		
		// Add geo triples
		//this._appendGeoElement(result.elements);
		//result.elements.push(this._createGeoElement());
		
		
		// Add the filter statement
		var geoConstraint = this.geoConstraintFactory.create(bounds);
		
		var ce = geoConstraint.createConstraintElement(this.getPathManager());
		
		var element = new sparql.ElementTriplesBlock(ce.getTriples());		
		var filter = new sparql.ElementFilter(ce.getExpr());
		
		result.elements.push(element);
		result.elements.push(filter);

		return result;		
	};
	
	
	/*
	 * Utility methods
	 */
/*	
	ns.QueryGeneratorGeo.prototype._appendGeoElement = function(destElements) {
		var geoElement = this._createGeoElement();
		destElements.push(geoElement);
	};
	*/
	/*
	ns.QueryGeneratorGeo.prototype._appendGeoElementBounds = function(destElements, bounds, options) {
		var element = this._cerateGeoElementBounds();
		destElements.push(element);
	};
	*/
	
	
	
	
	
	
	
	
	
	
	
	
	/***
	 * OLD APPROACH BELOW
	 */
	
	
	
	
	
	
	
	
	
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
		
		// The concept is a query element which specifies which resources to fetch
		// (e.g. ?s a Subvention)
		// The conceptVar is a variable of the concept element (e.g. ?s) 
		this.concept = options.concept;
		//this.conceptVar = options.conceptVar;
		
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
		//this.navigationBreadcrumb = options.navigationBreadcrumb;
		
		this.navigationPath = options.navigationPath;

		
		
		// A list of paths for which to fetch data
		// TODO Not sure how components should declare that
	};
	
	ns.QueryGenerator.prototype.getConstraints = function() {
		return this.constraints;
	};
	
	ns.QueryGenerator.prototype.setNavigationPath = function(path) {
		this.navigationPath = path;
	};
	
	ns.QueryGenerator.prototype.getTargetNode = function() {
		var result = this.pathManager.getNode(this.navigationPath);
		
		return result;
	};
	
	
	ns.QueryGenerator.prototype.getTargetVariable = function() {
		var node = this.getTargetNode();
		return sparql.Node.v(node.variable);
	};
	
	/**
	 * Create a new QueryGenerator, where constraints on a specific path have been excluded
	 * 
	 */
	ns.QueryGenerator.prototype.copyExcludeConstraints = function(path) {
		var result = new ns.QueryGenerator(
				this.options,
				this.concept,
				this.pathManager,
				this.geoConstraintFactory,
				this.constraints.copyExclude(path),
				this.navigationPath);
		
		return result;
	};
	
	
	/**
	 * TODO What to do with the current navigationBreadcrumb?
	 * Simply replace it?
	 * 
	 * 
	 * @param path
	 */
	ns.QueryGenerator.prototype.copyNavigate = function(navigationPath) {
		var result = new ns.QueryGenerator(
				this.options,
				this.concept,
				this.pathManager,
				this.geoConstraintFactory,
				this.constraints,
				this.navigationPath);
				
	};
	
	
	ns.QueryGenerator.prototype.getNavigationBreadcrumb = function() {
		var result = new facets.Breadcrumb(this.pathManager, this.navigationPath);
		return result;
	};
	
	
	/*
	ns.QueryGenerator.prototype.excludeConstraint(paths) {
		return new ns.QueryGene
	};*/

	ns.QueryGenerator.prototype.getInferredDriver = function() {
		//var element = this.forGlobal();
		
		var element = null;
		
		var navigationBreadcrumb = this.getNavigationBreadcrumb();
		
		var navigationTriples = navigationBreadcrumb.getTriples();
		if(navigationTriples.length > 0) {
			var elements = [];

			// Add base concept element
			elements.push(this.concept.element);
			elements.push(new sparql.ElementTriplesBlock(navigationTriples));
			
			element = new sparql.ElementGroup(elements);;
		} else {
			element = this.concept.element;
		}

		
		var variable = sparql.Node.v(navigationBreadcrumb.targetNode.variable);				
		var result = new facets.ConceptInt(element, variable);

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

		// Add concept element
		//elements.push(this.concept.element);
		var inferredDriver = this.getInferredDriver();
		elements.push(inferredDriver.element);

		// Add geo triples (no filter condition)
		this._appendGeoElement(elements, options);
		
		// Add facet constraints
		this._appendConstraintElement(elements, options);
		
		
		
		// Add the navigation breadcrumb
		var navigationBreadcrumb = this.getNavigationBreadcrumb();
		var navigationTriples = navigationBreadcrumb.getTriples();
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
	 * 
	 * Supported options:
	 * var options = {
	 *     subQuery: true // Make the geos-constraints a subquery, and place the concept in the outer query
	 * }
	 * 
	 */
	ns.QueryGenerator.prototype._forFilter = function(filter, options) {
		var inferredDriver = this.getInferredDriver();
		
		/*
		if(!inferredDriver) {
			inferredDriver = queryUtils.createDriverFallback(this.pathManager.getRoot().variable);
		}
			
		console.log("InferredDriver " + inferredDriver);
		*/
		
		var tmpElement = new sparql.ElementGroup();
		if(inferredDriver) {
			tmpElement.elements.push(inferredDriver.element);
		}
		
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
		result.addTriples(this.geoConstraintFactory.getTriples(this.pathManager));
		result.uniq();		
		
		return result;
	};
	
	ns.QueryGenerator.prototype._createGeoElementBounds = function(bounds) {
		var result = new sparql.ElementGroup();

		// Add geo triples
		this._appendGeoElement(result.elements);
		
		// Add the filter statement
		var geoConstraint = this.geoConstraintFactory.create(bounds);		
		var filter = new sparql.ElementFilter(geoConstraint.createConstraintElement(this.pathManager).getExpr());
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
	
	/*
	ns.QueryGenerator.prototype._appendGeoElementBounds = function(destElements, bounds, options) {
		var element = this._cerateGeoElementBounds();
		destElements.push(element);
	};
	*/
	
	
	ns.QueryGenerator.prototype._appendConstraintElement = function(destElements, options) {
		if(!(options && options.disableConstraints)) {
			var element = this.constraints.getSparqlElement();
			if(element) {
				destElements.push(element);
			}
		}
	};

})();

