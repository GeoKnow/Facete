/**
 * Sparql Algebra classes (based on Jena)
 * 
 * 
 */
(function($) {
	var ns = {};

		
	/**
	 * Introduces new variables for each encountered constant.
	 * { ?s a ?o } -> { ?s ?v1 ?o . Filter(?v1 = rdf:type) }
	 * 
	 * TODO: We could wrap the call with something like Jena's OpExtend
	 */
	ns.constantsToFilters = function(op) {
		
		
		//return
	};
	
	
	/**
	 * Moves filters to the top:
	 * Join(Filter(...), ...) -> Filter(Join... 
	 * 
	 */
	//ns.
	
})(jQuery);