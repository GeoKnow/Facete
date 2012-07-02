/**
 * 
 * Open design decision:
 * Should it be possible to invoke methods on facets, or should it work only via the manager?
 * 
 * Solution:
 * - There needs to be a FacetDao
 * - There need to be FacetDtos
 * - Maybe also another layer which is built upon the Dtos. 
 * 
 * 
 * geoFacet.setConstraint(ConstraintFactory.rect('x', 'y', area).count();
 * 
 * 
 * versus
 * 
 * facetManager.setConstraint('geoFacet', ConstraintFactory.rec());
 * facetManager.count('geoFacet');
 * 
 * 
 * 
 * facetManager.listFacets();
 * 
 * facetManager.getFacet("id").listValues();
 * 
 * 
 * 
 * 
 */

(function($) {
	ssb = $.ssb;
	
	var ns = {};
	$.ssb.facets = ns;

	
	ns.ValueState = function(id, count) {
		this.id = id;
		this.count = count;
		this.enabled = false;
	};
	
	ns.FacetState = function(facetManager) {
		this.manager = facetManager;
		this.enabled = false;
		this.valueStates = null; // No values loaded yet TODO Order by name/count
		
		// subFacets???
		//this.constraints = {};
	};
	
	/**
	 * Constraints added to a facet are disjunctive (OR)
	 * 
	 * Issue: At least the GUI needs ids for referencing
	 * constraints; so checking a checkbox will add/remove a constraint
	 */
	ns.FacetState.prototype.addConstraint = function(id, constraint) {
		
	};
	
	ns.FacetState.prototype.toElement = function() {
		
	};
	
	
	// The thing is, facet values are themselves entities that can be constrained
	ns.FacetState.getValueManager = function() {
		
	};
	
	
	ns.FacetValue = function(manager, path) {
		this.path;
		this.manager = manager;
	};
	
	
	/**
	 * Whether the facet-value is used explicitly in an equals constrained.
	 * 
	 */
	ns.FacetValue.prototype.isEnabled = function() {
		
	};
	
	
	/**
	 * The driving query fragment; e.g. { ?s a Subvention } .
	 * new ElementGroup([new Triple(Node.v("s"), RDF.type, Node.uri("http://.../Subvention")]);
	 * 
	 * The driver may already constrain the data alot:
	 * The driver could filter by the visibla area, or by a concrete set of resources obtained from a search.
	 * Facets are then computed on the fly in respect to the driver.
	 * 
	 * In the general case, you can set the driver to ?s ?p ?o.
	 */
	ns.FacetManager = function(driverVar, driver) {
		this.driverVar = driverVar;
		this.driver = driver;
		this.idToFacet = {};
		
		this.constraints = [];		
	};


	ns.FacetManager.prototype.createQueryLoadDefaults = function() {
		// The maximum number of instances to scan for collecting properties
		var instanceScanCount = 10001;
		
		
		var q = new ssb.Query();
		
		q.distinct = true;
		
		var p = ssb.Node.v("__p");
		var o = ssb.Node.v("__o");
		var c = ssb.Node.v("__c");
		
		q.projection[p.value] = null;
		q.projection[c.value] = new ssb.E_Count(new ssb.ExprVar(p));
		
		var tmp = q;
		if(true) { // limit instances to check for properties
		    var subQuery = new ssb.Query();
		    subQuery.isResultStar = true;
		    subQuery.limit = instanceScanCount;
		    q.elements.push(new ssb.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		
		console.log("Driver", this.driver);
		
		tmp.elements.push(this.driver);
		tmp.elements.push(new ssb.ElementTriplesBlock([new ssb.Triple(this.driverVar, p, o)]));
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new ssb.Query();
			result.projection[]
		}
		*/
		
		// TODO Order by ?o ?p
		q.order.push(new ssb.Order(new ssb.ExprVar(c), ssb.OrderDir.Desc));
		
		console.log("Created query: " + q);
		return q;
	};
	
	ns.FacetManager.getFacet = function(id) {
		
	};
	
	/*
	ns.FacetManager.prototype.loadDefaults = function() {
		var query = this.createQueryLoadDefaults();
		
		backend.executeConstruct(query.toString(), {
			failure: function() {
				console.err("Error");
			},
			success: function(jsonRdf) {
				
			}
		});
	};
	*/
	
	ns.FacetDesc = function(id, inputVar, queryElement) {
		this.id = id;
		this.inputVar = inputVar;
		this.queryElement = queryElement;
	};
	
	
	/**
	 * A facet must have an id, a resource var, an query-element, and set of variables it provides
	 * 
	 * geoRelated('geoRelated', 's', ['c', 'x', 'y'],  
	 * 
	 * 
	 */
	ns.FacetManager.registerFacet = function(id, facetDesc) {
		var facetState = new FacetState(facetDesc);
		
		this.idToFacet[id] = facet;
	};
	
	/**
	 * Returns a model about the facets of the current configuration
	 * 
	 * 
	 * 
	 * 
	 */
	ns.FacetManager.getFacets = function() {
		
	};
	
	/**
	 * Create a new FacetManager 
	 * 
	 * 
	 */
	/*
	ns.FacetManager.getDriverForFacet = function() {
		
	}
	*/
	
	/**
	 * Based on the driver query, fetch 
	 * 
	 */
	ns.FacetManager.getFacets = function() {
		
	};
	
	
	
	ns.FacetManager.setConstraint = function() {
		
	};
	
	ns.Facet = function() {
		
	};

	/**
	 * Counts number of instances for this facet.
	 * 
	 * Optional argument max: Sets a limit on how many instances may be counted.
	 * 
	 */
	ns.Facet.count = function(max) {
	};
	
	
	
	/**
	 * Returns the values + their counts for the facet.
	 * 
	 * Select Distinct ?l Count(?l) From {
	 *     ?s rdfs:label ?l // Facet in question
	 * 
	 *     { Select Distinct ?s {  // The subquery collects all resources in question 
	 *     	    ?s a Subvention . // Driver     
	 *     	    {
	 *             ?s rdfs:label ?l .
	 *             ?l bif:contains "foo" . // Facet Constraint 
	 *     	   }
	 *		   {
	 *             ?s geoRelated [ long ?x ; lat ?y ] . // Facet Constraint         
	 *     	   }
	 *     } }
	 *     
	 * }
	 * 
	 * 
	 */
	ns.Facet.values = function(max) {
		
		
		
	};
	
})(jQuery);


