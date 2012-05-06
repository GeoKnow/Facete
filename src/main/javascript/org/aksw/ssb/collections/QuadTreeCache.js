(function($) {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var qt = Namespace("org.aksw.ssb.collections.QuadTree");

	var rdfQueryUtils = Namespace("org.aksw.ssb.utils.rdfquery");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	
	var ns = Namespace("org.aksw.ssb.collections.QuadTreeCache");

	
	/*
	 * Some thoughts on the revised process:
	 * First we count the number of geoms in the area.
	 * For each tile where the count is below the threshold, count the number of features
	 * for each geom
	 * 
	 */
	

	ns.Backend = function(sparqlService, geoQueryFactory, variable, countGeoQueryFactory) {
		this.sparqlService = sparqlService;
		
		// Query factory which creates queries for counting
		this.countGeoQueryFactory = countGeoQueryFactory ? countGeoQueryFactory : geoQueryFactory;
		this.geoQueryFactory = geoQueryFactory;
		this.variable = variable;

		//this.xyExtractor;
		// TODO Some method that extracts the geo locations from the query
		
		// Alternatively: The app controller can for a query result add those entries to the quad tree, from
		// which it knows that they carry geo-coordinates -
		// In this case they QuadTree would be more like an index (position->resource)
	};
	
	ns.Backend.prototype.fetchGeomCount = function(bounds, maxCount) {
		var baseQuery = this.countGeoQueryFactory.create(bounds);
		var geomVariable = sparql.Node.v(this.geoQueryFactory.geoConstraintFactory.breadcrumb.targetNode.variable);

		var query = queryUtils.createCountQuery(baseQuery, maxCount, geomVariable);
		return queryUtils.fetchInt(this.sparqlService, query);		
	};
	
	ns.Backend.prototype.fetchFeatureCount = function(bounds, maxCount) {
		var baseQuery = this.countGeoQueryFactory.create(bounds);
		var featureVariable = sparql.Node.v(this.geoQueryFactory.geoConstraintFactory.breadcrumb.sourceNode.variable);
		
		var query = queryUtils.createCountQuery(baseQuery, maxCount, featureVariable);
		return queryUtils.fetchInt(this.sparqlService, query);				
	};
	

	ns.Backend.prototype.fetchFeatureCountPerGeom = function(bounds) {
		/*
		var baseQuery = this.countGeoQueryFactory.create(bounds);
		var geomVariable = sparql.Node.v(this.geoQueryFactory.geoConstraintFactory.breadcrumb.targetNode.variable);
		var featureVariable = sparql.Node.v(this.geoQueryFactory.geoConstraintFactory.breadcrumb.sourceNode.variable);
		
		var query = queryUtils.createCountQuery(baseQuery, maxCount, featureVariable, [geomVariable]);
		return queryUtils.fetchInt(this.sparqlService, query);
		*/
	};
	
	
	ns.Backend.prototype.fetchData = function(bounds) {
		var query = this.geoQueryFactory.create(bounds);
		
		return this.sparqlService.executeAny(query.toString());		
	};

	
	ns.NOTHING = 0;
	ns.ADDED = 1;
	ns.REMOVED = 2;
	ns.SHIFTED = 3;
	
	/**
	 * Compare two states of the quad tree, and for each involved node assign one
	 * of the following actions:
     *
     * 0: Nothing (no state change - node is completely visible in both states) 
	 * 1: AddAll  (invisible in old, completely visible in new)
	 * 2: RemoveAll (completely visible in old, invisible in new) 
	 * 3: Shift (partial overlap in old and/or new)
	 *
	 * 
	 * 
	 * 
	 */
	ns.diff = function(oldNodes, newNodes, oldBounds, newBounds) {
		var involvedNodes = oldNodes ? _.union(oldNodes, newNodes) : newNodes;
		
		var addedNodes    = _.difference(newNodes, oldNodes);
		var removedNodes  = _.difference(oldNodes, newNodes);
		var retainedNodes = _.intersection(newNodes, oldNodes);

		var states = [];

		// Filter existing markers by the new bounds
		//$.each(this.currentNodes, function(i, node) {
		for(var i in involvedNodes) {
			var node = involvedNodes[i];			
			var nb = node.getBounds();
			
			// TODO Take added/removed node sets into account
			if(newBounds.contains(nb)) {
				if(oldBounds && oldBounds.contains(nb) && _.contains(oldNodes, node)) {
					states[i] = ns.NOTHING;
				} else if(!oldBounds || !oldBounds.isOverlap(nb) || !_.contains(oldNodes, node)) {
					states[i] = ns.ADDED;
				} else {
					states[i] = ns.SHIFTED;
				}
			} else if(oldBounds && oldBounds.contains(nb) && !newBounds.isOverlap(nb)) {
				states[i] = ns.REMOVED;
			} else if (newBounds.isOverlap(nb)) {
				states[i] = ns.SHIFTED;
			} else {
				console.error("Should not happen");
			}
		}

		return {nodes: involvedNodes, states: states, addedNodes: addedNodes, removedNodes: removedNodes };
	};
	
	
	/**
	 * Given a geoQueryFactory (i.e. a factory object, that can create queries for given bounds),
	 * this class caches results for bounds.
	 * 
	 * The process is as follows:
	 * The orginial bounds are extended to the size of tiles in a quad tree.
	 * Then the data is fetched.
	 * A callback with the data and the original bounds is invoked.
	 * IMPORTANT! The callback has to make sure how to filter the data against the original bounds (if needed)
	 * 
	 * TODO This class is not aware of postprocessing by filtering against original bounds - should it be?
	 * 
	 * @param backend
	 * @returns {ns.QuadTreeCache}
	 */
	ns.QuadTreeCache = function(backend) {	
		var maxBounds = new qt.Bounds(-180.0, 180.0, -90.0, 90.0);
		this.quadTree = new qt.QuadTree(maxBounds, 18, 0);
	
		this.backend = backend;

		this.maxItemCount = 300;
	};

	
	/**
	 * Load data for the specified area
	 * 
	 * @param bounds
	 */
	ns.QuadTreeCache.prototype.load = function(bounds, callback) {
		
		var self = this;
		
		// Prevent the bounds being set too frequently
		// TODO This is probably not the best place for doing that 
		if(self.isLocked) {
			return;
		}
		self.isLocked = true;
	
		
		//console.debug("Aquiring nodes for " + bounds);
		var nodes = this.quadTree.aquireNodes(bounds, 2);
		
		//console.debug("Aquired " + nodes.length + " nodes for " + bounds);

		// Uncomment for output of aquired nodes
		/*
		console.log("Found some nodes: " + nodes.length);
		$.each(nodes, function(index, node) {
			console.log(index + ": " + node.getBounds());
		});
		*/
		
		
		// Retrieve the minimum number of items per node
		var countTasks = [];
		$.each(nodes, function(i, node) {
	
			// Check if the minimumItemCount is available
			if(node.getMinItemCount() === null && (node.infMinItemCount === null || node.infMinItemCount < self.maxItemCount)) {
				//console.log("" + node.getBounds());
				
				countTasks.push(
					self.backend.fetchGeomCount(node.getBounds(), self.maxItemCount).pipe(function(value) {
	
						node.setMinItemCount(value); 
						if(value < self.maxItemCount) {
							node.data.itemCount = value;
						} else {
							node.data.tooManyItems = true;
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
				//console.debug("Inferred minimum item count: ", node.infMinItemCount);

				if(node.isLoaded) {
					return true;
				}
			
				if(node.infMinItemCount < self.maxItemCount) {
		
					loadTasks.push(
						self.backend.fetchData(node.getBounds()).pipe(function(data) {
							node.isLoaded = true;
	
							if(!node.data) {
								node.data = {};
							}
							
							// TODO Make data transformations configurable
							// (Should this be part of the backend???)
							node.data.graph = rdfQueryUtils.rdfQueryFromTalisJson(data); //ns.triplesFromTalisJson(data); //data;//ns.rdfQueryFromTalisJson(data);
							//node.data = data;

							/*
							var idToLonlat = data.idToPos;
							for(var id in idToLonlat) {
								var lonlat = idToLonlat[id];
								var pos = new qt.Point(lonlat.lon, lonlat.lat);
	
								node.addItem(id, pos);
							}
							
							node.data.idToTypes  = data.idToTypes;
							node.data.idToLabels = data.idToLabels;
							*/						
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
				//self._setNodes(nodes, bounds);
				callback.success(nodes, bounds);
				self.isLocked = false;
				
			});
		});
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

	
	
})(jQuery);
