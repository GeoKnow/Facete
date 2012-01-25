

// backbonejs tutorial: http://arturadib.com/hello-backbonejs/docs/1.html

/* The map widget depends on the idToPosition map
*/ 
function QuadTreeModel(backend) { // TODO Refactor into a framework: countCallback, threshold, fetchCallback, mergeCallback
	this.currentNodes = [];
	
	this.idToPosition = new Map();

	var maxBounds = new Bounds(-180.0, 180.0, -90.0, 90.0);
	this.quadTree = new QuadTree(maxBounds, 10, 0);

	this.backend = backend;
}

var maxItemCount = 1000;

/**
 * Sets the (visible) nodes of the quad tree.
 * All nodes must be loaded.
 * 
 * Checks the given nodes against the current ones, and triggers an event on the changes.
 * 
 * 
 * 
 * 
 * @param nodes
 */
QuadTreeModel.prototype._setNodes = function(newNodes) {

	console.log(newNodes);

	var added = _.difference(newNodes, this.currentNodes);
	var removed = _.difference(this.currentNodes, newNodes);
	
	this.currentNodes = newNodes;

	
	//console.log("added: " + added);
	//console.log("removed: " + removed);
	//console.log(added);
	//console.log(removed);
	
	if(!(added.length == 0 && removed.length == 0)) {
		$(this).trigger("changed", {added:added, removed:removed });
	}
};

QuadTreeModel.prototype.setBounds = function(bounds) {
	var self = this;
	//var nodes = this.quadTree.query(bounds, 1);
	var nodes = this.quadTree.aquireNodes(bounds, 0.5);

	/*
	var nodes = {};
	$.each(tmp, function(index, node) {
		nodes[node] = 1;
	});*/
	
	
	console.log("Found some nodes: " + nodes.length);
	var countTasks = []; 
	
	$.each(nodes, function(index, node) {
	
		// Check if the minimumItemCount is available
		if(node.data.minItemCount == undefined) {
			console.log("" + node.getBounds());
			
			//node.data = {};
			
			var deferred = self.backend.fetchNodeCount(node.getBounds(), function(value) {
				
				node.data.minItemCount = value; 
				if(value < maxItemCount) {
					node.data.ItemCount = value;
				}				
			});
			
			countTasks.push(deferred);
		}
	});

	/*
	for(var i in loadTasks) {
		var task = loadTasks[i];
		task();
	}*/
	

	// Once all counts have been computed, request the data for applicable nodes
	$.when.apply(window, countTasks).then(function() {

		var loadTasks = [];
		
		$.each(nodes, function(index, node) {
		
			if(node.data.idToPos == undefined && node.data.minItemCount < maxItemCount) {
			
				var deferred = self.backend.fetchNodes(node.getBounds(), function(idToPos) {
					node.data.idToPos = idToPos;
				});
				
				loadTasks.push(deferred);
			}
		});
			
		
		$.when.apply(window, loadTasks).then(function() {

			// Restructure all nodes that have been completely loaded, 
			var parents = [];
			
			$.each(nodes, function(index, node) {
				if(node.parent) {
					parents.push(node.parent);
				}
			});

			parents = _.uniq(parents);
			
			var change = false;			
			do {
				change = false;
				for(var i in parents) {
					var p = parents[i];

					var children = p.children;
	
					var didMerge = tryMergeNode(p);
					if(!didMerge) {
						continue;
					}
					
					change = true;
	
					$.each(children, function(i, child) {
						var indexOf = _.indexOf(nodes, child);
						if(indexOf >= 0) {
							nodes[indexOf] = undefined;
						}
					});
					
					nodes.push(p);
					
					if(p.parent) {
						parents.push(p.parent);
					}
					
					break;
				}
			} while(change == true);
			
			_.compact(nodes);
			
			console.log("All done");
			self._setNodes(nodes);
		});
	});				
};


/**
 * 
 * 
 * @param parent
 * @returns {Boolean} true if the node was merged, false otherwise
 */
function tryMergeNode(parent) {
	if(!parent) {
		return;
	}

	// If all children are loaded, and the total number
	var itemCount = 0;
	for(var i in parent.children) {
		var child = parent.children[i];
		
		if(!child.isLoaded) {
			return false;
		}
		
		itemCount += child.itemCount;
	}
	
	if(itemCount >= maxItemCount) {
		return false;
	}
	
	parent.isLoaded = true;

	for(var i in parent.children) {
		var child = parent.children[i];
		
		parent.data.ids.addAll(child.data.ids); 
	}
	
	
	// Unlink children
	parent.children = null;
	
	return true;
}


$(document).ready(function() {
	
	//console.log("" + _.difference([], [2]));

	var sparqlService = new VirtuosoSparqlService("sparql", ["http://climbing.org"]);
	var queryFactory = new QueryFactoryWgs84();
	var backend = new BackendWgs84(sparqlService, queryFactory);
	//backend = new BackendQuadTree(backend, queryFactory);		 
	//backend = new DelayBackend(backend);

	
	var model = new QuadTreeModel(backend);

	this.idToPos = new Map();

	$(model).bind("changed", function(event, change) {
		$.each(change.removed, function(i, node) {
			this.idToPos.removeAll(getKeys(node.data.idToPos));
		});

		//console.log("Something changed");
		$.each(change.added, function(i, node) {
			this.idToPos.addAll(node.data.idToPos);
		});
	});
	
	
	
	var ssb = new SpatialSemanticBrowsing();
	ssb.setBackend(backend);
	ssb.setSparqlService(sparqlService);
	ssb.setQueryFactory(queryFactory);

	var prefixToService = {};
	ssb.addFactSources(prefixToService);
	
	ssb.init();

	
	
	
	/*
	
	var bounds = new Bounds(10.0, 20.0, 10.0, 15.0);
	

	var s = new Scheduler();
	
	s.schedule(function() {
		model.setBounds(bounds);
	});

	setTimeout(function() {
		model.setBounds(bounds);
	}, 2000);
	
	*/

	//var nodes = quadTree.aquireNodes(bounds, 1);

	
	/*
	var maxBounds = new Bounds(-180.0, 180.0, -90.0, 90.0);
	var quadTree = new QuadTree(maxBounds, 0.0);
	var a = new Range(0, 10);
	var b = new Range(-10, 5);
	console.log(a.getOverlap(b));
	*/

	//var bounds = new Bounds(1.0, 1.0, 4.0, 4.0);
	/*
	var bounds = new Bounds(10.0, 20.0, 10.0, 20.0);
	var nodes = quadTree.aquireNodes(bounds, 1);
	
	for(i in nodes) {
		var node = nodes[i];
		//console.log(node.depth);
		console.log(node._bounds);
	}
	
	console.log(nodes.length);
	
	//console.log(nodes);

	
	/*
	var sparqlService = new VirtuosoSparqlService("src/main/php/sparql-proxy-local.php", ["http://climbing.org"]);

	
	var maxBounds = new QuadTree.Bounds(-180.0, 180.0, -90.0, 90.0);
	var quadTree = new QuadTree(maxBounds);
	
	
	
	var bounds = new QuadTree.Bounds(-5.0, -4, 53, 54);
	
	var nodes = quadTree.query(bounds);
	*/
	
});
