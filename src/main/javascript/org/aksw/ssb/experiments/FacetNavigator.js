/**
 * 
 * 
 */
(function() {
	var ns = Namespace("org.aksw.ssb");

	ns.FacetNavigator = function() {
		
	};
	
	/**
	 * Sets the driver element
	 * Note that you have to take care to update the pathManager root variable as necessary.
	 * 
	 */
	ns.FacetNavigator.prototype.setDriver = function(driver) {
		this.driver = driver;
	};
	
	
	/**
	 * Focus on a pivoted set of objects
	 * 
	 */
	ns.FacetNavigator.prototype.pivot = function(propertyName, isInverseStep) {
		
	};
	
	/**
	 * Fetches the facets for the current location
	 * 
	 */
	ns.FacetNavigator.prototype.fetchFacets = function() {
		
	};
	
	/**
	 * Fetches the facet values at the given path.
	 * If the path is empty, the set of currently focused resources is returned; i.e. it becomes equivalent to fetchValues();
	 * 
	 */
	ns.FacetNavigator.prototype.fetchFacetValues = function(path) {
		
	};
	
	
	ns.FacetNavigator.prototype.fetchValues = function() {
		
	};
	
	
	/**
	 * Set the current location as the root location. All paths will be interpreted as being
	 * relative to this new location.
	 * 
	 */
	ns.FacetNavigator.prototype.makeRoot = function() {
		
	};
	
	
})();