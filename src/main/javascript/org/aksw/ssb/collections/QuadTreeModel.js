
(function() {

	var qt = Namespace("org.aksw.ssb.collections.QuadTree");

	var ns = Namespace("org.aksw.ssb.collections.QuadTreeModel");
	
	/**
	 * A class that wraps a QuadTree and fires events about the state-change when
	 * setting the visible bounds
	 * 
	 * Based on: backend.fetchNodeCount, backend.fetchBasicData
	 * 
	 * @param backend
	 * @returns {QuadTreeModel}
	 */
	ns.QuadTreeModel = function(backend) { // TODO Refactor into a framework: countCallback, threshold, fetchCallback, mergeCallback
		this.currentNodes = [];
		this.currentBounds = null;
		
		this.idToPosition = new Map();
	
		var maxBounds = new qt.Bounds(-180.0, 180.0, -90.0, 90.0);
		this.quadTree = new qt.QuadTree(maxBounds, 18, 0);
	
		this.backend = backend;
	};
	
	
	// TODO We can differ between the limit used in the count query, and the
	// acceptable limit for displaying
	ns.maxItemCount = 300;
	
	/**
	 * Sets the (visible) nodes of the quad tree.
	 * Requires all data for the nodes to be loaded.
	 * 
	 * Checks the given nodes against the current ones, and triggers an event on the changes.
	 * 
	 * 
	 * 
	 * 
	 * @param nodes
	 */
	ns.QuadTreeModel._isVisible = function(id, pos, bounds, nodes) {
		if(!bounds.containsPoint(pos)) {
			return false;
		}
		
		for(var i in nodes) {
			var node = nodes[i];
			
			if(node.idToPos && id in node.idToPos) {
				return true;
			}
		}
		
		return false;
	};
	
	ns.QuadTreeModel.prototype._setNodes = function(newNodes, newBounds) {
	
		var oldNodes = this.currentNodes; 
		
		var involvedNodes = _.union(oldNodes, newNodes);
	
		var addedNodes    = _.difference(newNodes, this.currentNodes);
		var removedNodes  = _.difference(this.currentNodes, newNodes);
		var retainedNodes = _.intersection(newNodes, oldNodes);
			
		var oldBounds = this.currentBounds;
		this.currentBounds = newBounds;
		
		this.currentNodes = newNodes;
	
		// The changes for each of the newNodes that occured to partially covers
		// Does not contain changes 
		var removedItemsPerNode = [];
		var addedItemsPerNode = [];
	
		
		var isLocked = false;
		
		/*
	
		var addedNodes = [];
		var removedNodes = [];
		var retainedNodes = [];
		
		
		for(var i in involvedNodes) {
			
		}
	*/
		
		/*
		
		// If a node went out of sight, then all items can be removed
		/*
		for(var i in removedNodes) {
			var removedNode = removedNodes[i];
			mergeMapsInPlace(removedItems, removedNode.idToPos);
		}*/
	
		var RETAINED = 0;
		var ADDED = 1;
		var REMOVED = 2;
		
		var involvedNodeStatus = [];
		
		// Filter existing markers by the new bounds
		//$.each(this.currentNodes, function(i, node) {
		for(var i in involvedNodes) {
			var node = involvedNodes[i];
			
			var addedItems = {};
			var removedItems = {};
			
			addedItemsPerNode[i] = addedItems;
			removedItemsPerNode[i] = removedItems;
	
	
			if(!node.idToPos) {
				return true;
			}
			
			var status = -1;
			if(_.contains(retainedNodes, node)) {
				status = RETAINED;
			} else if(_.contains(addedNodes, node)) {
				status = ADDED;
			} else if(_.contains(removedNodes, node)) {
				status = REMOVED;
			} else {
				console.error("Should not happen");
			}
			
			involvedNodeStatus[i] = status;
			
			//console.log("Status: ", status, " for " + node);
	
			/*
			if(status === RETAINED) {
				if(newBounds.contains(node.getBounds()) && oldBounds && oldBounds.contains(node.getBounds())) {			
					continue;
				}
			}*/
			
			// If the node was - and still is fully contained in the view rect - , we can skip a check
			// as all items must be within the new bounds
			// TODO For some reason the commented out code below is not working as expected, determine why
			if(status === RETAINED) {
				if(newBounds.contains(node.getBounds()) && oldBounds && oldBounds.contains(node.getBounds())) {			
					continue;
				}
	
				if(!node.idToPos) {
					continue;
				}
				
				for(id in node.idToPos) {
					var pos = node.idToPos[id];
	
					if((!oldBounds || !QuadTreeModel._isVisible(id, pos, oldBounds, oldNodes)) && newBounds.containsPoint(pos)) {
						addedItems[id] = pos;
					} else if(oldBounds && QuadTreeModel._isVisible(id, pos, oldBounds, oldNodes) && !newBounds.containsPoint(pos)) {
						removedItems[id] = pos;
					}
					/*
					if((!oldBounds || !oldBounds.containsPoint(pos)) && newBounds.containsPoint(pos)) {
						addedItems[id] = pos;
					} else if(oldBounds && oldBounds.containsPoint(pos) && !newBounds.containsPoint(pos)) {
						removedItems[id] = pos;
					}
					*/
				}
			} else if(status === ADDED) {
				for(id in node.idToPos) {
					var pos = node.idToPos[id];
					// Check if the id was visible before (due to some other node)
					if((!oldBounds || !QuadTreeModel._isVisible(id, pos, oldBounds, oldNodes)) && newBounds.containsPoint(pos)) {
						addedItems[id] = pos;
					}			
				}
			} else if(status === REMOVED) {
				for(id in node.idToPos) {
					var pos = node.idToPos[id];
					if(oldBounds && QuadTreeModel._isVisible(id, pos, oldBounds, oldNodes)) {
						removedItems[id] = pos;
					}
				}
			}
			
	
			/*
			for(id in node.idToPos) {
				var pos = node.idToPos[id];
	
				// TODO This does not work when zooming in: a point the becomes visible may
				// have been within the old bounds, but due to too many items it was not loaded
				if(!oldBounds || !oldBounds.containsPoint(pos) && newBounds.containsPoint(pos)) {
					addedItems[id] = pos;
				} else if(oldBounds && oldBounds.containsPoint(pos) && !newBounds.containsPoint(pos)) {
					removedItems[id] = pos;
				}
			}*/
	
			
			/*
			for(id in node.idToPos) {
				var pos = node.idToPos[id];
	
				if((!oldBounds || !QuadTreeModel._isVisible(id, pos, oldBounds, oldNodes)) && newBounds.containsPoint(pos)) {
					addedItems[id] = pos;
				} else if(oldBounds && QuadTreeModel._isVisible(id, pos, oldBounds, oldNodes) && !newBounds.containsPoint(pos)) {
					removedItems[id] = pos;
				}
			}*/
		}
	
		//if(!(added.length == 0 && removed.length == 0)) {
		$(this).trigger("changed", {
			oldBounds    : oldBounds,
			newBounds    : newBounds,
			oldNodes     : oldNodes,
			newNodes     : newNodes,
			addedNodes   : addedNodes,
			removedNodes : removedNodes,
			
			involvedNodes: involvedNodes,
			involvedNodeStatus: involvedNodeStatus,
			addedItemsPerNode   : addedItemsPerNode,
			removedItemsPerNode : removedItemsPerNode
		});
		//}
		
		//console.log("added: " + added);
		//console.log("removed: " + removed);
		//console.log(added);
		//console.log(removed);
	};
	
	
	ns.QuadTreeModel.prototype.setBounds = function(bounds) {
			
		var self = this;
		
		// Prevent the bounds being set too frequently
		// TODO This is probably not the best place for doing that
		if(self.isLocked) {
			return;
		}
		self.isLocked = true;
	
		
		console.log("Aquiring nodes for " + bounds);
		var nodes = this.quadTree.aquireNodes(bounds, 2);
		
		
		
		
		// Uncomment for output of aquired nodes
		/*
		console.log("Found some nodes: " + nodes.length);
		$.each(nodes, function(index, node) {
			console.log(index + ": " + node.getBounds());
		});
		*/
		
		
		// Retrieve the minimum number of items per node
		var countTasks = [];
		$.each(nodes, function(index, node) {
			
			var node = nodes[index];
	
			// Check if the minimumItemCount is available
			if(node.getMinItemCount() === null && (node.infMinItemCount === null || node.infMinItemCount < ns.maxItemCount)) {
				//console.log("" + node.getBounds());
				
				countTasks.push(
					self.backend.fetchNodeCount(node.getBounds()).pipe(function(value) {
	
						node.setMinItemCount(value); 
						if(value < ns.maxItemCount) {
							node.data.itemCount = value;
						}				
					})
				);
			}
		});
	
	
		// Once all counts have been computed, request the data for applicable nodes
		// TODO Seems that I misunderstood something about deferred execution:
		// The 'then'-callback is invoked after all ajax requests have finished,
		// however, their callbacks did not neccessarily finish - therefore
		// there is a chance that we encounter race conditions here
		$.when.apply(window, countTasks).then(function() {
	
			var loadTasks = [];
			
			
			$.each(nodes, function(index, node) {		
				
				//console.log("Inferred minimum item count: %d", node.infMinItemCount);
				
				if(node.infMinItemCount < ns.maxItemCount) {
	
					if(node.isLoaded) {
						return true;
					}
	
					
					loadTasks.push(
						self.backend.fetchBasicData(node.getBounds()).pipe(function(data) {
							node.isLoaded = true;
	
							var idToLonlat = data.idToPos;
							for(var id in idToLonlat) {
								var lonlat = idToLonlat[id];
								var pos = new qt.Point(lonlat.lon, lonlat.lat);
	
								node.addItem(id, pos);
							}
							
							node.data.idToTypes  = data.idToTypes;
							node.data.idToLabels = data.idToLabels;						
						})
					);
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
		
						var didMerge = ns.tryMergeNode(p);
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
				
				//console.log("All done");
				self._setNodes(nodes, bounds);
				self.isLocked = false;
			});
		});
	};
	
	
	ns.QuadTreeModel.checkLoaded = function(node) {
		if(node.idToPos && node.data.idToTypes && node.data.idToLabels) {
			$(this).trigger("node-loaded", node);
		}
	};
	
	ns.QuadTreeModel.prototype.clear = function() {
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
	ns.tryMergeNode = function(parent) {
		return;
		
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
		
		if(itemCount >= ns.maxItemCount) {
			return false;
		}
		
		parent.isLoaded = true;
	
		for(var i in parent.children) {
			var child = parent.children[i];
			
			mergeMapsInPlace(parent.idToPos, child.idToPos);
			
			mergeMapsInPlace(parent.data.idToLabels, child.data.idToLabels);
			mergeMapsInPlace(parent.data.idToTypes, child.data.idToTypes);
			
			//parent.data.ids.addAll(child.data.ids);
			//parent.data.addAll(child.data);
		}
		
		
		// Unlink children
		parent.children = null;
		
		console.log("Merged a node");
		
		return true;
	};

})();


