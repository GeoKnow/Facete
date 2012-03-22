/**
 * SPARQL caching system.
 *  
 * This class enables the caching of SPARQL queries:
 * 
 * It is possible to register SPARQL construct queries together with a ResultSetTable.
 * 
 * 
 * Pose queries against the system will do a simple Query subsumption against the registered views.
 * If a suitable candidate is found, a corresponding ResultSet object is created [see below]
 * 
 * 
 * 
 * Query Subsumption
 * -----------------
 * The 
 * 
 * 
 */
(function($) {
	var ns = {};
	
	
	/**
	 * A partition 
	 * 
	 * 
	 * ISSUE: Should we separate the partition id from the corresponding sparql filter criterion - or is it the same?
	 * 
	 */
	ns.Partition() {
		this.id = null;
		this.bindings = []; // The variables for building the partition 		
	}
	
	ns.CacheView = function(query) {		
		this.query = query; // Construct query
		
	};
	
	
	ns.CachingSystem = function() {
		this.views = [];
	};
	
	ns.CachingSystem.addView = function(view) {
		this.views.push(view);
	};
	
	ns.CachingSystem.index(view) {
		
	};
	
	ns.CachingSystem.findApplicableViews = function(query) {
		
	};

	
})(jQuery);