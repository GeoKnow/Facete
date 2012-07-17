(function() {

	
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	
	// TODO Change namespace
	var ns = Namespace("org.aksw.ssb.widgets");

	
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
	 * Creates a new executor with constraints on the given paths excluded
	 * 
	 */
	ns.QueryExecutor.prototype.copyExcludeConstraints = function(paths) {
		var tmp = this.queryGenerator.copyExcludeConstraints(paths);
		
		var result = new ns.QueryExecutor(this.sparqlService, tmp);
		
		return result;
	};
	
	/**
	 * Convenience method for filtering the current set of resources by a label
	 * 
	 * @param regexStr
	 * @param path
	 * @param flags
	 * @returns {ns.QueryExecutor}
	 */
	ns.QueryExecutor.prototype.filterRegex = function(regexStr, flags, path) {
		if(!regexStr || $.trim("" + regexStr).length === 0) {
			return this;
		} 

		var subGenerator = this.queryGenerator.filterRegex(regexStr, flags, path);
		
		return new ns.QueryExecutor(this.sparqlService, subGenerator);
	};
	
	/**
	 * @Deprecated
	 * 
	 * 
	 * @param searchString
	 * @param property
	 * @param options
	 * @returns
	 */
	ns.QueryExecutor.prototype.fetchValuesFiltered = function(searchString, property, options) {
		if(!searchString || $.trim("" + searchString).length === 0) {
			return this.fetchValues(options);
		} 
		
		var variable = this.queryGenerator.getNavigationVariable();
		var query = this.queryGenerator.createQueryValuesFiltered(searchString, property, options);
		var promise = queryUtils.fetchList(this.sparqlService, query, variable);
		
		return promise;
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
	
})();
