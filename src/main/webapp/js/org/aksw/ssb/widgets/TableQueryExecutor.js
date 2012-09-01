(function() {

	
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	
	// TODO Change namespace
	var ns = Namespace("org.aksw.ssb.widgets");

	
	// TODO I think we do not need this class! Use TableModelExecutor instead
	
	/**
	 * A class that supports executing the queries of a queryGenerator.
	 * 
	 * @param sparqlService
	 * @param queryGenerator
	 * @returns {ns.QueryExecutor}
	 */
	ns.TableQueryExecutor = function(sparqlService, queryProjector) {
		this.sparqlService = sparqlService;
		this.queryProjector = queryProjector;
	};

	ns.TableQueryExecutor.getColumnNames = function() {
		
	};
	
	/**
	 * FIXME Decide on options; they may e.g. include: limit, offset, order
	 * 
	 * @param options
	 * @returns
	 */
	ns.TableQueryExecutor.prototype.fetchRows = function(options) {
		var query = this.queryProjector.createQueryRows(options);
		
		var promise = this.sparqlService.executeSelect(query).pipe(function(rs) {
			return rs.result.bindings;
		});

		return promise;
	};

	ns.TableQueryExecutor.prototype.fetchCountRows = function(sampleLimit, options) {
		var countVar = sparql.Node.v("__c");
		var query = this.queryGenerator.createQueryCountValues(countVar, sampleLimit, options);
		
		var promise = queryUtils.fetchInt(this.sparqlService, query, countVar);

		var result = promise.pipe(function(value) {
			
			return {count: value, isCutOff: (value >= sampleLimit) };
		});
		
		return result;
	};
		
})();
