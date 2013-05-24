(function() {
	
	var ns = Namespace("org.aksw.ssb.facets");

	ns.ConceptType = {
			'Unknown': 0,
			'Extensional': 1,
			'Intensional': 2
	};

	ns.Concept = function(conceptType) {
		this.conceptType = conceptType ? conceptType : ns.ConceptType.Unknown;
	};
	
	ns.Concept.prototype = {
		constructor: ns.Concept,

		getConceptType: function() {
			return this.conceptType;
		},

		isIntensional: function() {
			return this.conceptType == ns.ConceptType.Intensional;
		},
		
		isExtensional: function() {
			return this.conceptType == ns.ConceptType.Extensional;
		}
	};
	

	
	ns.ConceptInt = function(element, variable) {
		ns.Concept.call(this, ns.ConceptType.Intensional);
		this.element = element;
		this.variable = variable;
	};
	
	ns.ConceptInt.prototype = new ns.Concept();
	_.extend(ns.ConceptInt.prototype, {
			constructor: ns.ConceptInt,
			
			getElement: function() {
				return this.element;
			},
			
			getVariable: function() {
				return this.variable;
			},
			
			toString: function() {
				return "" + this.element + "; " +  this.variable;
			},
			
			/**
			 * Remove unnecessary triple patterns from the element:
			 * Example:
			 * ?s ?p ?o
			 * ?s a :Person
			 *  
			 *  We can remove ?s ?p ?o, as it does not constraint the concepts extension.
			 */
			getOptimizedElement: function() {

				/* */
				
				
			},
	});

	
	/**
	 * Extensional concept, expressed as a list of resources (sparql.Node objects)
	 * 
	 * An extensional concept may have a reference to the intensional concept it was created from.
	 * 
	 */
	ns.ConceptExt = function(resources, conceptInt) {
		ns.Concept.call(this, ns.ConceptType.Extensional);
		this.resources = resources;
		this.conceptInt = conceptInt;
	};
	
	
	ns.ConceptExt.prototype = new ns.Concept();
	_.extend(ns.ConceptExt.prototype, {
			constructor: ns.ConceptExt,

			getResources: function() {
				return this.resources;
			},
			
			getIntensionalConcept: function() {
				return conceptInt;
			}
	});

})();

