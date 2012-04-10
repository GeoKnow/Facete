
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

		this.maxItemCount = 300;
	};
	
	
	// TODO We can differ between the limit used in the count query, and the
	// acceptable limit for displaying
	//ns.maxItemCount = 300;
	
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
		var oldBounds = this.currentBounds;
		this.currentBounds = newBounds;		
		this.currentNodes = newNodes;
	
		var diffResult = ns.diff(oldNodes, newNodes, oldBounds, newBounds);
	
		//if(!(added.length == 0 && removed.length == 0)) {
		$(this).trigger("changed", diffResult);
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
		for(var i = 0; i < nodes.length; ++i) {
		//$.each(nodes, function(index, node) {
			
			var node = nodes[i];
	
			// Check if the minimumItemCount is available
			if(node.getMinItemCount() === null && (node.infMinItemCount === null || node.infMinItemCount < self.maxItemCount)) {
				//console.log("" + node.getBounds());
				
				countTasks.push(
					self.backend.fetchNodeCount(node.getBounds()).pipe(function(value) {
	
						node.setMinItemCount(value); 
						if(value < self.maxItemCount) {
							node.data.itemCount = value;
						}				
					})
				);
			}
		}
	
	
		// Once all counts have been computed, request the data for applicable nodes
		// TODO Seems that I misunderstood something about deferred execution:
		// The 'then'-callback is invoked after all ajax requests have finished,
		// however, their callbacks did not neccessarily finish - therefore
		// there is a chance that we encounter race conditions here
		$.when.apply(window, countTasks).then(function() {
	
			var loadTasks = [];
			
			
			//$.each(nodes, function(index, node) {
			for(var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				//console.log("Inferred minimum item count: %d", node.infMinItemCount);
				
				if(node.infMinItemCount < self.maxItemCount) {
	
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
			}
		
	
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
		
		if(itemCount >= self.maxItemCount) {
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


