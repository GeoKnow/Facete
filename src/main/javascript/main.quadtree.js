

/*
function FilterConfig() {
	this.classUris = [];
	this.language = null;
}

FilterConfig.prototype.hashCode() {
	ssb.hashCode(classUris) * 3
}


function MultiQuadTreeModel(backend) {
	
}
*/

// backbonejs tutorial: http://arturadib.com/hello-backbonejs/docs/1.html

/* The map widget depends on the idToPosition map
*/ 
function QuadTreeModel(backend) { // TODO Refactor into a framework: countCallback, threshold, fetchCallback, mergeCallback
	this.currentNodes = [];
	this.currentBounds = null;
	
	this.idToPosition = new Map();

	var maxBounds = new Bounds(-180.0, 180.0, -90.0, 90.0);
	this.quadTree = new QuadTree(maxBounds, 18, 0);

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
QuadTreeModel.prototype._setNodes = function(newNodes, newBounds) {

	console.log(newNodes);

	var oldNodes = this.currentNodes; 
	
	var addedNodes = _.difference(newNodes, this.currentNodes);
	var removedNodes = _.difference(this.currentNodes, newNodes);
	
	//var retainedNodes = _.intersection(newNodes, oldNodes);
	
	var oldBounds = this.currentBounds;
	this.currentBounds = newBounds;
	
	this.currentNodes = newNodes;

	// The changes for each of the newNodes that occured to partially covers
	// Does not contain changes 
	var removedItemsPerNode = [];
	var addedItemsPerNode = [];
	
	// If a node went out of sight, then all items can be removed
	/*
	for(var i in removedNodes) {
		var removedNode = removedNodes[i];
		mergeMapsInPlace(removedItems, removedNode.idToPos);
	}*/

	
	// Filter existing markers by the new bounds
	for(var i in this.currentNodes) {
		var node = this.currentNodes[i];

		var addedItems = {};
		var removedItems = {};
		
		addedItemsPerNode[i] = addedItems;
		removedItemsPerNode[i] = removedItems;
		
		// If the node was and still is fully contained in the view rect, we can skip a check
		// as all items must be within the new bounds
		if(newBounds.contains(node.getBounds()) && oldBounds && oldBounds.contains(node.getBounds()) || !node.idToPos) {			
			continue;
		}

		for(id in node.idToPos) {
			var pos = node.idToPos[id];

			// TODO This does not work when zooming in: a point the becomes visible may
			// have been within the old bounds, but due to too many items it was not loaded
			if(!oldBounds || !oldBounds.containsPoint(pos) && newBounds.containsPoint(pos)) {
				addedItems[id] = pos;
			} else if(oldBounds && oldBounds.containsPoint(pos) && !newBounds.containsPoint(pos)) {
				removedItems[id] = pos;
			}
		}		
	}

	//if(!(added.length == 0 && removed.length == 0)) {
	$(this).trigger("changed", {
		oldBounds    : oldBounds,
		newBounds    : newBounds,
		oldNodes     : oldNodes,
		newNodes     : newNodes,
		addedNodes   : addedNodes,
		removedNodes : removedNodes,
		addedItemsPerNode   : addedItemsPerNode,
		removedItemsPerNode : removedItemsPerNode
	});
	//}
	
	//console.log("added: " + added);
	//console.log("removed: " + removed);
	//console.log(added);
	//console.log(removed);
};


QuadTreeModel.prototype.setBounds = function(bounds) {
	var self = this;
	//var nodes = this.quadTree.query(bounds, 1);
	console.log("Aquiring nodes for " + bounds);
	var nodes = this.quadTree.aquireNodes(bounds, 2);

	/*
	var nodes = {};
	$.each(tmp, function(index, node) {
		nodes[node] = 1;
	});*/
	
	console.log("Found some nodes: " + nodes.length);
	$.each(nodes, function(index, node) {
		console.log(index + ": " + node.getBounds());
	});
	
	var countTasks = []; 
	
	$.each(nodes, function(index, node) {
	
		// Check if the minimumItemCount is available
		if(node.getMinItemCount() === null && (node.infMinItemCount === null || node.infMinItemCount < maxItemCount)) {
			console.log("" + node.getBounds());
			
			//node.data = {};
			
			var deferred = self.backend.fetchNodeCount(node.getBounds(), function(value) {
				
				node.setMinItemCount(value); 
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
		
			if(node.infMinItemCount < maxItemCount) {

				if(node.isLoaded) {
					return true;;
				}

				loadTasks.push(
					self.backend.fetchNodes(node.getBounds(), function(idToLonlat) {
						for(var id in idToLonlat) {
							var lonlat = idToLonlat[id];
							var pos = new Point(lonlat.lon, lonlat.lat);

							node.addItem(id, pos);
							
						}
						//node.data.idToPos = idToPos;
						node.isLoaded = true;
					})
				);
				
				
				if(node.data.idToTypes === undefined) {
					loadTasks.push(
						self.backend.fetchNodeTypes(node.getBounds(), function(idToTypes) {
							node.data.idToTypes = idToTypes;
						})
					);
				}

				if(node.data.idToLabels === undefined) {
					loadTasks.push(
						self.backend.fetchNodeLabels(node.getBounds(), function(idToLabels) {
							node.data.idToLabels = idToLabels;
						})
					
					);

				}
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
			
			/*
			$.each(nodes, function(i, node) {
				node.isLoaded = true;
			});
			*/
			
			console.log("All done");
			self._setNodes(nodes, bounds);
		});
	});				
};


QuadTreeModel.prototype.clear = function() {
	var removed = this.currentNodes;
	this.currentNodes = [];

	
	//console.log("added: " + added);
	//console.log("removed: " + removed);
	//console.log(added);
	//console.log(removed);
	
	if(removed.length != 0) {
		$(this).trigger("changed", {added:[], removed:removed });
	}
};

/**
 * 
 * 
 * @param parent
 * @returns {Boolean} true if the node was merged, false otherwise
 */
function tryMergeNode(parent) {
	return; // Need to figure out how to merge the node data first - probably the data object should have a addAll method
	
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
		
		//parent.data.ids.addAll(child.data.ids);
		//parent.data.addAll(child.data);
	}
	
	
	// Unlink children
	parent.children = null;
	
	console.log("Merged a node");
	
	return true;
}


$(document).ready(function() {
	
	//console.log("" + _.difference([], [2]));

	//var sparqlService = new VirtuosoSparqlService("sparql", ["http://climbing.org"]);
	var sparqlService = new VirtuosoSparqlService(ssbconf.endpoint, ssbconf.models);
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
