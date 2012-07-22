/**
 * TODO This file does not contain any functional code yet.
 * 
 * Some classes which might be useful for creating custom filter predicates,
 * such as filtering by preferred languages.
 * By this we could reduce the complexity of the application logic.
 * 
 */
(function() {
	
	var ns = Namespace("org.aksw.ssb.backend");
	
	//ns.SparqlServiceExt
	
	/**
	 * Expression for preferred labels.
	 * 
	 * @param variable the variable corresponding to an RDF term
	 * @param langTags An array of language tags. Empty string for no tag.
	 */
	ns.E_PrefLabel = function(variable, langTags) {
		this.variable = variable;
		this.langTags = langTags;
	};
	

	ns.PrefLabelFilter = function(prefLabel) {
		this.prefLabel = prefLabel;
	};
	
	//ns.PrefLabelFilter.
	
	/**
	 * Query exection plan node for executing a query againts a remote backend
	 */
	ns.QepExecuteQuery = function(sparqlService, query) {
		this.sparqlService = sparqlService;
		this.query = query;
	};
	
	/**
	 * Query execution plan node for client side filtering
	 * a result set by an expression
	 * 
	 * @param qep
	 * @param expr
	 * @returns {ns.QepFilter}
	 */
	ns.QepFilter = function(qep, expr) {
		this.qep = qep;
		this.expr = expr;
	};


})();