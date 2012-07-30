(function() {

	
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	
	// TODO Change namespace
	var ns = Namespace("org.aksw.ssb.widgets");

	

	/**
	 * TODO: Do we need the pathManager dependency here?
//	 * Or should it become passed as an argument when actually creating queries? 
	 * 
	 * Note: If a focusPath is specified, it is treated as an exists-constraint.
	 * If there is no focusPath, then an empty path is used; which means that it points to the driver var.
	 * 
	 * @param driver
	 * @param targetPath The path for which to fetch values
	 * @param focusPath The path for which to compute the counts. If unspecified, same as driver.variable.  
	 * @param constraints
	 * @param pathManager
	 * @returns {ns.QueryGenerator}
	 */
	ns.QueryGenerator = function(driver, navigationPath, focusPath, constraints, pathManager) {
		// The parent query generator (if it exists)
		//this.parent = parent;
		
		this.driver = driver;
		
		var driverVariableName = (this.driver && this.driver.variable) ? driver.variable.value : "s"; 
		
		this.navigationPath = navigationPath ? navigationPath : new facets.Path();
		this.focusPath = focusPath ? focusPath : new facets.Path();
		this.constraints = constraints ? constraints : new facets.ConstraintCollection();
		this.pathManager = pathManager ? pathManager : new facets.PathManager(driverVariableName);
		
		//this.fixedConstraints = fixedConstraints ? fixedConstraints : ne
		
		// TODO: Should multiple paths be allowed? e.g. projectionPaths? But this could be solved with exists-constraints.
	};
	
	/**
	 * Create a shallow copy of this object.
	 * 
	 * @returns {ns.QueryGenerator}
	 */
	ns.QueryGenerator.prototype.clone = function() {
			return new ns.QueryGenerator(
				this.driver,
				this.navigationPath,
				this.focusPath,
				this.constraints.clone(),
				this.pathManager);
	};
	
	ns.QueryGenerator.prototype.copy = function(overrides) {
		var result = this.clone();
		
		_.extend(result, overrides);
		
		/*
				//this.driverProvider, // TODO Either the driver is an element or it is a sub-query-generator
				this.driver,
				this.navigationPath,
				this.focusPath,
				this.constraints.copyExclude(path),
				this.pathManager);
		*/;
		
		
		return result;
	};
	

	
	ns.QueryGenerator.prototype.getPathManager = function() {
		return this.pathManager;
	};

	ns.QueryGenerator.prototype.getFocusPath = function() {
		return this.focusPath;
	};
	
	ns.QueryGenerator.prototype.getNavigationPath = function() {
		return this.navigationPath;
	};
	
	ns.QueryGenerator.prototype.setNavigationPath = function(path) {
		return this.navigationPath = path;
	};
	
	ns.QueryGenerator.prototype.getConstraints = function() {
		return this.constraints;
	};
	
	/**
	 * Create a new QueryGenerator, where constraints on a specific path have been excluded
	 * 
	 */
	ns.QueryGenerator.prototype.copyExcludeConstraints = function(paths) {
		var result = this.copy({constraints: this.constraints.copyExcludes(paths)});
		
		return result;
/*
		var result = new ns.QueryGenerator(
				//this.driverProvider, // TODO Either the driver is an element or it is a sub-query-generator
				this.driver,
				this.navigationPath,
				this.focusPath,
				this.constraints.copyExclude(path),
				this.pathManager);
*/
	};

	ns.QueryGenerator.prototype.copyExcludeConstraint = function(path) {
		var result = this.copy({constraints: this.constraints.copyExclude(path)});
		
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
		
		var result = this.copy({navigationPath: navigationPath});
		//console.log("result", result);

		return result;
		/*
		var result = new ns.QueryGenerator(
				//this.driverProvider,
				this.driver,
				this.navigationPath,
				this.focusPath,
				this.constraints,
				this.pathManager);
				
		return result;
		*/
	};
	
	
	
	ns.QueryGenerator.prototype.getNavigationBreadcrumb = function() {
		var result = new facets.Breadcrumb(this.pathManager, this.navigationPath);
		return result;
	};
	
	ns.QueryGenerator.prototype.getFocusBreadcrumb = function() {
		var result = new facets.Breadcrumb(this.pathManager, this.focusPath);
		return result;		
	};


	ns.QueryGenerator.prototype.getInferredDriver = function() {
		var element = null;
		
		var navigationBreadcrumb = this.getNavigationBreadcrumb();
		
		var navigationTriples = navigationBreadcrumb.getTriples();
		if(navigationTriples.length > 0) {
			var elements = [];

			// Add base driver element
			if(this.driver && this.driver.element) {
				elements.push(this.driver.element);
			}
			
			
			elements.push(new sparql.ElementTriplesBlock(navigationTriples));
			
			element = new sparql.ElementGroup(elements);
		} else {
			element = (this.driver && this.driver.element) ? this.driver.element : null;
		}

		if(!element) {
			return null;
		}
		
		var variable = navigationBreadcrumb.getTargetVariable(); //sparql.Node.v(navigationBreadcrumb.targetNode.variable);				
		var result = new facets.Driver(element, variable);

		//console.debug("Inferred Driver", variable);
		
		return result;
	};

	
	/**
	 * Returns a new Query Generator, where the constraints have been fixed;
	 * i.e. encoded into the driver.
	 * 
	 */
	ns.QueryGenerator.prototype.fixConstraints = function() {
		// TODO If this method seems useful, implement it.
	};
	
	
	ns.QueryGenerator.prototype.navigateToFacets = function(direction) {
		// A step that navigates to the set of (incomining/outgoing) properties.
		var step = new facets.StepFacet(direction);
		
		var result = this.copyNavigate(this.navigationPath.copyAppendStep(step));
		
		return result;		
	};
	
	/**
	 * 
	 * @param direction
	 */
	ns.QueryGenerator.prototype.navigateToFacetValues = function(propertyName, isInverse) {
		var step = new facets.Step(propertyName, isInverse);
		
		var result = this.copyNavigate(this.navigationPath.copyAppendStep(step));
		
		return result;
	};
	
	ns.QueryGenerator.prototype.navigateToPath = function(path) {
		var result = this.copyNavigate(this.navigationPath.concat(path));
		
		return result;		
	};
	
	
	//ns.QueryGenerator.prototype.navigatioTo
	
	
	
	ns.QueryGenerator.prototype.createDriverFacetValues = function(path) {
		
		var constraints = this.constraints.copyExclude(path);
		
		// Make the navigationPath an exists constraints
		var constraint = new facets.ConstraintExists(path);
		
		constraints.put(constraint.toString(), constraint);
		
		
	};

	
	
	/**
	 * Returns an actual query
	 * 
	 * @returns {sparql.ElementGroup}
	 */
	ns.QueryGenerator.prototype.createElement = function(options) {
		var generator = new facets.GenSym("w");
		
		var elements = [];

		// Add driver element
		if(this.driver && this.driver.element) {
			elements.push(this.driver.element);
		}
		
		// Add facet constraints
		this._appendConstraintElement(elements, options);
		
		// Add the navigation breadcrumb
		{
			var breadcrumb = this.getNavigationBreadcrumb();		
			var triples = breadcrumb.getTriples(generator);
			if(triples.length > 0) {
				elements.push(new sparql.ElementTriplesBlock(triples));
			}
		}
		
		// Add the focus breadcrumb
		{
			var breadcrumb = this.getFocusBreadcrumb();		
			var triples = breadcrumb.getTriples(generator);
			if(triples.length > 0) {
				elements.push(new sparql.ElementTriplesBlock(triples));
			}
		}
		
		var result = new sparql.ElementGroup(elements); 
		
		//console.log("NavigationTriples", navigationTriples);
		//console.log("Created elements", elements);
		
		return result;
	};
	
	ns.QueryGenerator.prototype.getFocusVariable = function() {
		var breadcrumb = new facets.Breadcrumb(this.pathManager, this.focusPath);
		
		var result = breadcrumb.getTargetVariable();
		
		return result;
	};
	
	ns.QueryGenerator.prototype.getNavigationVariable = function() {
		var breadcrumb = new facets.Breadcrumb(this.pathManager, this.navigationPath);
		
		var result = breadcrumb.getTargetVariable();
		
		return result;		
	};
	
	/**
	 * Count the number of focused objects per resource in the navigation.
	 * 
	 * ns.createCountQuery = function(element, limit, variable, outputVar, groupVars)
	 */
	ns.QueryGenerator.prototype.createQueryCountNavigation = function(countVar, sampleLimit, options) {
		var element = this.createElement();
		
		var focusVar = this.getFocusVariable();
		var navigationVar = this.getNavigationVariable();
		
		countVar = countVar ? countVar : sparql.Node.v("__c");
		var result = queryUtils.createCountQuery(element, sampleLimit, focusVar, countVar, [navigationVar], options);
		
		return result;
	};
	
	ns.QueryGenerator.prototype.createDriverValues = function(options) {
		var element = this.createElement();
		
		//console.log("var", variableName);
		var variable = this.getNavigationVariable();
		
		var result = new facets.Driver(element, variable);
		
		return result;
	};
	
	ns.QueryGenerator.prototype.createQueryCountValues = function(countVar, sampleLimit, options) {
		var driver = this.createDriverValues();

		countVar = countVar ? countVar : sparql.Node.v("__c");
		var result = queryUtils.createCountQuery(driver.getElement(), sampleLimit, driver.getVariable(), countVar);

		return result;
	};
	
	ns.QueryGenerator.prototype.createQueryValues = function(options) {
		var driver = this.createDriverValues();
		
		var result = queryUtils.createQuerySelect(driver, options);
		return result;
	};

	ns.QueryGenerator.prototype.filterRegex = function(regexStr, flags, relativePath) {
		if(!relativePath) {
			relativePath = new facets.Path([new facets.Step(rdfs.label.value)]);
		}
		
		var basePath = this.getNavigationPath();
		var absolutePath = basePath.concat(relativePath);
		
		
		var constraint = new facets.ConstraintRegex(absolutePath, regexStr, flags);
		
		var result = this.clone();
		
		result.constraints.add(constraint);
		
		return result;
	};

	/*
	ns.QueryGenerator.prototype.createQueryValuesFiltered = function(searchString, property, options) {
		var driver = this.createDriverValues();
		
		var labelVar = sparql.Node.v("__l");
		var element = queryUtils.createElementLabelRegex(driver.getVariable(), searchString, labelVar, property);
		
		var newElement = element ? new sparql.ElementGroup([driver.getElement(), element]) : driver.getElement();
		
		var newDriver = new facets.Driver(newElement, driver.getVariable());
		
		var result = queryUtils.createQuerySelect(newDriver, options);
		
		return result;
	};*/
	
	ns.QueryGenerator.prototype._appendConstraintElement = function(destElements, options) {
		if(!(options && options.disableConstraints)) {
			var element = this.constraints.getSparqlElement(this.pathManager);
			if(element) {
				destElements.push(element);
			}
		}
	};
	
})();
