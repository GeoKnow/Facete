(function() {
	
	var ns = Namespace("org.aksw.ssb.facets");
	
	/**
	 * Intensional concept, expressed as a SPARQL graph pattern (aka element)
	 * 
	 */
	ns.ConceptInt = function(element, variable) {
		this.element = element;
		this.variable = variable;
	};
	
	ns.ConceptInt.prototype = {
			getElement: function() {
				return this.element;
			},
			
			getVariable: function() {
				return this.variable;
			}
	};

	
	/**
	 * Extensional concept, expressed as a list of resources
	 * 
	 */
	ns.ConceptExt = function(uris) {
		this.uris = uris;
	};
	
	
	ns.ConceptExt.prototype = {
			getUris: function() {
				return this.uris;
			}
	};
	
	
});