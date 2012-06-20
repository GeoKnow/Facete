/**
 * This file is right now just for collecting my thoughts and a bit of source code/architecture.
 * 
 * A module for binding facets to view parameters, such as size and color.
 * 
 * 
 */
(function() {
	var ns = {};
	ns.MapBindingModule = function() {
		//this.paths = [];
		this.path = null;
	};
	
	/** 
	 * Binds a given path to the size attribute
	 * 
	 */
	ns.MapBindingModule.prototype.bindToSize = function(path) {
		this.path = path;
	};
	
})();
