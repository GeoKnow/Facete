
/**
 * A backend with a quad-tree cache.
 * 
 * Problem: In order for the cache to be (more) effective, we need to
 * figure out which quad-tree-nodes changed visibility.
 * 
 * @param delegate
 * @param queryFactory
 * @returns
 */
function BackendQuadTree(delegate, queryFactory) {
	this.delegate = delegate;
	//this.queryFactory = queryFactory;
	
	var maxBounds = new Bounds(-180.0, 180.0, -90.0, 90.0);
	this.quadTree = new QuadTree(maxBounds);
}


//http://www.erichynds.com/jquery/using-deferreds-in-jquery/
BackendQuadTree.prototype = {

	fetchNodeCount: function(bounds, callback) {
		var nodes = this.quadTree.query(bounds);
		
		
		var tasks = [];
		var result = [];
		
		

		for(var _i in nodes) {
			/*
			(function(i) {
				var node = nodes[i];
				
				if(node.isLoaded) {
					result.push(node);
				} else {
					tasks.push(function() {
						this.delegate.fetchNodeCount(node.bounds, function(value) {
							// If the value is small enough, fetch the actual data
							if(value >= 1000) {
								node.minimumItemCount = 1000;
								continue;
							} else {
								node.minimumItemCount = value;
							}		
						});
					});
				}
			})(_i);
			*/
		}
		
		for(var i in tasks) {
			var task = tasks[i];
			task();
		}
	},
		
	fetchNodes: function(bounds, callback) {
	},

	
	fetchNodeLabels: function(bounds, callback) {
		this.delegate.fetchNodeLabels(bounds, callback);	
	},
	
	fetchNodeTypes: function(bounds, callback) {
		this.delegate.fetchNodeTypes(bounds, callback);
	},	
	
	fetchWayGeometries: function(bounds, callback) {
		// Not supported
	},	
	
	fetchClasses: function(bounds, callback) {
		this.delegate.fetchClasses(bounds, callback);
	},
		
			

	fetchLabels: function(uris, language, callback) {
		this.delegate.fetchLabels(uris, language, callback);
	},

	
	fetchIcons: function(uris, callback) {
		// Not supported
	}
};
