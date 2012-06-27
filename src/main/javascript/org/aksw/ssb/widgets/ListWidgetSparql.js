(function($) {
	

	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var ns = Namespace("org.aksw.ssb.widgets");
	
	ns.CheckItem = $$({}, '<li>'
					//+ '<form action="">'
					+ '<input type="checkbox" data-bind="isEnabled"/><span data-bind="label"/>'
					//+ '<span data-bind="label"/>'
					//+ '</form>'
					+ '</li>',
					{
						'click input': function() {
							var parent = this.model.get("parent");
							
							var checked = this.view.$(":checked").length == 1;
							
							parent.trigger("click", {isChild: true, item: this, checked: checked});
						}
					}	
					);

	ns.checkItemFactory = function(parent, data) {
		return $$(ns.CheckItem, {parent: parent, data:data, label: data.label});
	};					

	
	/*
	 * Not sure if below is needed
	 */
	/*
	ns.DriverProviderSimple = function(driver) {
		this.driver = driver;
	};
	
	ns.DriverProviderSimple.prototype.provideDriver = function() {
		return this.driver;
	};
	
	ns.DriverProviderGenerated = function(queryGenerator) {
		this.queryGenerator = queryGenerator;
	};
	
	ns.DriverProviderGenerated.prototype.provideDriver = function() {
		var result = this.queryGenerator.getDriverValues();
		return result;
	};
	*/
	
	
	/*
	ns.TableSparql = function(sparqlService, query) {
		this.sparqlService = sparqlService;
		this.query = query;
	};
	
	ns.TableSparql.prototype.fetch = function() {
		
	};*/
	
	
	/**
	 * A class that supports executing the queries of a queryGenerator.
	 * 
	 * @param sparqlService
	 * @param queryGenerator
	 * @returns {ns.QueryExecutor}
	 */
	ns.QueryExecutor = function(sparqlService, queryGenerator) {
		this.sparqlService = sparqlService;
		this.queryGenerator = queryGenerator;
	};
	
	ns.QueryExecutor.prototype.getNavigationPath = function() {
		this.queryGenerator.getNavigationPath();
	};
	
	/**
	 * FIXME Decide on options; they may e.g. include: limit, offset, order
	 * 
	 * @param options
	 * @returns
	 */
	ns.QueryExecutor.prototype.fetchValues = function(options) {
		//var driver = this.queryGenerator.getDriverValues();
		
		var query = this.queryGenerator.createQueryValues(options);
		var variable = this.queryGenerator.getNavigationVariable();
		
		var promise = queryUtils.fetchList(this.sparqlService, query, variable);
		
		//var promise = this.sparqlService.executeSelect(query);
		
		return promise;
	};

	ns.QueryExecutor.prototype.fetchCountValues = function(sampleLimit, options) {
		var countVar = sparql.Node.v("__c");
		var query = this.queryGenerator.createQueryCountValues(countVar, sampleLimit, options);
		
		var promise = queryUtils.fetchInt(this.sparqlService, query, countVar);

		var result = promise.pipe(function(value) {
			
			return {count: value, isCutOff: (value >= sampleLimit) };
		});
		
		return result;
	};
	
	/**
	 * Fetches the resources at the navigation path, thereby counting the focus resources for each of them.
	 * 
	 * 
	 * @param options
	 * @returns
	 */
	ns.QueryExecutor.prototype.fetchValuesCounted = function(sampleLimit, options) {
		
		var navigationVar = this.queryGenerator.getNavigationVariable();
		//var focusVar = this.queryGenerator.getFocusVariable();

		var countVar = sparql.Node.v("__c");
		var query = this.queryGenerator.createQueryCountNavigation(countVar, sampleLimit, options);
		
		var promise = this.sparqlService.executeSelect(query).pipe(function(jsonRs) {
			var result = _.map(jsonRs.results.bindings, function(item) {
				
				var node = sparql.Node.fromJson(item[navigationVar.value]);
				var countStr = item[countVar.value].value;
				var count = parseInt(countStr);
				
				return {node: node, count: count};
			});
			
			return result;
		});

		return promise;
	};


	/**
	 * Fetches the set of facets that can be pivoted to.
	 * TODO: This can not be expressed with paths - is that a problem?
	 * 
	 * @param isInverse
	 * @returns
	 */
	ns.QueryExecutor.prototype.fetchPivotFacets = function(isInverse) {
		var driver = this.queryGenerator.createDriverValues();
		
		var promise = queryUtils.fetchPivotFacets(this.sparqlService, driver, isInverse).pipe(function(nodes) {
			return {isInverse: isInverse, facets: nodes };// _.map(nodes, function(item) { return sparql.Node.fromJson(item); }) };
		});
		
		return promise;
	};
	
	/**
	 * Returs a new QueryExecutor for the facets.
	 * 
	 * @param direction
	 */
	ns.QueryExecutor.prototype.navigateToFacets = function(direction) {
		var subGenerator = this.queryGenerator.navigateToFacets(direction);
		
		return new ns.QueryExecutor(this.sparqlService, subGenerator);
	};
	
	/**
	 * Return a new QueryExecutor set to the facetValues
	 * 
	 * @return {jQuery.Promise}
	 */
	ns.QueryExecutor.prototype.navigateToFacetValues = function(propertyName, isInverse) {
		
		if(!propertyName) {
			throw new "propertyName must be specified";
		}
		
		var subGenerator = this.queryGenerator.navigateToFacetValues(propertyName, isInverse);
		
		return new ns.QueryExecutor(this.sparqlService, subGenerator);
	};
	
	ns.QueryExecutor.prototype.navigateToPath = function(path) {
		var subGenerator = this.queryGenerator.navigateToPath(path);
		
		return new ns.QueryExecutor(this.sparqlService, subGenerator);
	};
	

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
		this.navigationPath = navigationPath ? navigationPath : new facets.Path();
		this.focusPath = focusPath ? focusPath : new facets.Path();
		this.constraints = constraints ? constraints : new facets.ConstraintCollection();
		this.pathManager = pathManager ? pathManager : new facets.PathManager(driver.variable.value);
		
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
				this.constraints,
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
			elements.push(this.driver.element);
			elements.push(new sparql.ElementTriplesBlock(navigationTriples));
			
			element = new sparql.ElementGroup(elements);
		} else {
			element = this.driver.element;
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
		elements.push(this.driver.element);
		
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
		console.log("elements", elements);
		
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
	
	
	ns.QueryGenerator.prototype._appendConstraintElement = function(destElements, options) {
		if(!(options && options.disableConstraints)) {
			var element = this.constraints.getSparqlElement(this.pathManager);
			if(element) {
				destElements.push(element);
			}
		}
	};

	
	
	
	ns.createListModelLabels = function(sparqlService, queryGenerator, options, labelFetcher) {
		var postProcessor = new ns.PostProcessorLabels(labelFetcher);

		return new ns.ListModelSparql(sparqlService, queryGenerator, options, postProcessor);
	};
	
	
	//ns.refreshList(list, )

	ns.ListModelSparql = function(sparqlService, queryGenerator, options, postProcessor) {
		this.sparqlService = sparqlService;
		this.queryGenerator = queryGenerator;
		this.options = options;
		this.postProcessor = postProcessor;
	};
	
	
	ns.ListModelSparql.prototype.fetchData = function() {
		var driver = this.queryGenerator.createDriverValues();

		console.log("Driver: ", driver);
		
		var query = queryUtils.createQuerySelect(driver, this.options);						
		var task = queryUtils.fetchList(this.sparqlService, query, driver.variable);

		var result = $.Deferred();
		
		var self = this;
		$.when(task).then(function(resources) {

			var processed = _.map(resources, function(item) {
				return {data: item};
			});
			
			self.postProcessor.process(result, processed);
			
		}).fail(function() {
			result.fail();
		});

		return result;
	};


	ns.isNode = function(candidate) {
		return candidate && (candidate instanceof sparql.Node);
	};
	
	ns.isUri = function(candidate) {
		return ns.isNode(candidate) && candidate.isUri();		
	};
	
	
	/**
	 * A post processor that attaches a label attribute to all objects for which
	 * the label fetcher provides labels.
	 * 
	 * @param labelFetcher
	 * @returns {ns.PostProcessorLabels}
	 */
	ns.PostProcessorLabels = function(labelFetcher) {
		this.labelFetcher = labelFetcher;
	};
	
	
	ns.PostProcessorLabels.prototype.process = function(deferred, collection) {
		var rawUriStrs = _.map(collection, function(item) { return ns.isUri(item.data) ? item.data.value : null; });
		var uriStrs = _.filter(rawUriStrs, function(x) { return !(!x); });
		
		var labelTask = this.labelFetcher.fetch(uriStrs);
		
		_.each(collection, function(item) {
			if(!item.label && ns.isNode(item.data) && !item.data.isUri()) {
				item.label = "" + item.data.value;
			}
		});
		
		
		$.when(labelTask).then(function(response) {
			
			_.each(collection, function(item) {
				if(!ns.isUri(item.data) || !item || item.label) {
					return;
				}
					
				
				var uri = item.data.value;
				var label = (uri in response.uriToLabel) ? response.uriToLabel[uri].value : uri;
				
				item.label = label;  
			});
						
			deferred.resolve(collection);
			
		}).fail(function() {
			deferred.fail();
		});

	};
	
	
	/**
	 * 
	 * @param backend
	 * @param transformer A function that takes a data item of the backend, and returns a new one.
	 * @returns {ns.TableModelBacked}
	 */
	ns.TableModelBackend = function(backend, transformer) {
		this.backend = backend;
		this.transformer = transformer;
	};
	
	ns.TableModelBackend.prototype.fetchBackendData = function(limit, offset) {
		
	};
	
	
	

	/**
	 * A class for generic SELECT result sets.
	 * 
	 * @param sparqlService
	 * @param queryGenerator
	 * @param projectVars
	 * @param options
	 * @returns {ns.TableModelSparql}
	 */
	ns.TableModelSparql = function(sparqlService, queryGenerator, projectVars, options) {
		this.sparqlService = sparqlService;
		this.queryGenerator = queryGenerator;
		this.projectVars = projectVars;
		this.options = options;
	};
	
	ns.TableModelSparql.prototype.count = function(threshold) {
		
	};
	
	/**
	 * If no arguments is given, everything is fetched.
	 * 
	 * @param limit
	 * @param offset
	 */
	ns.TableModelSparql.prototype.fetchData = function(limit, offset) {
		
	};

	
	ns.TableModelSparql.prototype.addConstraint = function(constraint) {
		this.queryGenerator.addConstraint(constraint);
	};
	
	
	
})(jQuery);
