(function($) {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var qt = Namespace("org.aksw.ssb.collections.QuadTree");

	var rdfQueryUtils = Namespace("org.aksw.ssb.utils.rdfquery");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	
	var ns = Namespace("org.aksw.ssb.collections.QuadTreeCache");

	/*
	 * Query factory for counting geoms, features and features per geom
	 * 
	 *  TODO extend with the full breadcrumb
	 */
	ns.QueryFactory = function(element, featureVar, geomVar, countVar) {
		this.element = element;
		this.featureVar = featureVar;
		this.geomVar = geomVar;
		
		if(!countVar) {
			this.countVar = sparql.Node.v("__c");	
		}		
	};
	
	ns.QueryFactory.prototype.createQueryGeomCount = function(maxCount) {		
		var result = queryUtils.createCountQuery(this.element, maxCount, this.geomVar, this.countVar);
		return result;
	};

	ns.QueryFactory.prototype.createQueryFeatureCount = function(maxCount) {
		var result = queryUtils.createCountQuery(this.element, maxCount, this.featureVar, this.countVar);
		return result;		
	};
	
	ns.QueryFactory.prototype.createQueryGeomToFeatureCount = function() {
		var result = queryUtils.createCountQuery(this.element, null, this.featureVar, this.countVar, [this.geomVar]);
		return result;
	};

	
	/*
	 * BackendFactory 
	 *
	 * Can create query execution objects for either bounds or explicit geom uris.
	 * Also, options can be specified, of how the queries should be constructed -
	 * i.e. enabled/disabled facets, boundaries as sub-query
	 * 
	 * options:
	 * 	subQuery = {none, bounds, bounds+facets}
	 * 
	 */
	ns.BackendFactory = function(sparqlService, queryGenerator) {
		this.sparqlService = sparqlService;
		this.queryGenerator = queryGenerator;
		
		this.geomVar = sparql.Node.v(this.queryGenerator.geoConstraintFactory.breadcrumb.targetNode.variable);
		this.featureVar = sparql.Node.v(this.queryGenerator.geoConstraintFactory.breadcrumb.sourceNode.variable);
	};
	
	ns.BackendFactory.prototype.forBounds = function(bounds, options) {
		var element = this.queryGenerator.forBounds(bounds, options);
		var queryFactory = new ns.QueryFactory(element, this.featureVar, this.geomVar);

		return new ns.Backend(this.sparqlService, queryFactory);
	};

	ns.BackendFactory.prototype.forGeoms = function(geomUriNodes, options) {
		var element = this.queryGenerator.ForGeoms(geomUriNodes);
		var queryFactory = new ns.QueryFactory(element, this.featureVar, this.geomVar);
		
		return new ns.Backend(this.sparqlService, queryFactory);
	};

	
	/*
	 * Some thoughts on the revised process:
	 * First we count the number of geoms in the area.
	 * For each tile where the count is below the threshold,
	 * send a query that counts the number of features for each geom
	 * 
	 * for each geom
	 * 
	 */
	ns.Backend = function(sparqlService, queryFactory) {
		this.sparqlService = sparqlService;
		this.queryFactory = queryFactory;
	};
	
	
	ns.Backend.prototype.fetchGeomCount = function(maxCount) {
		var query = this.queryFactory.createQueryGeomCount(maxCount);
		var result = queryUtils.fetchInt(this.sparqlService, query.toString(), this.queryFactory.countVar);
		return result;
	};
	

	// TODO: I want to be able to generate these queries without having to pass in bounds
	ns.Backend.prototype.fetchFeatureCount = function(element, featureVariable, maxCount) {
		var query = this.queryFactory.createQueryGeomCount(maxCount);
		var result = queryUtils.fetchInt(this.sparqlService, query.toString(), this.queryFactory.countVar);
		return result;
	};
	

	ns.Backend.prototype.fetchGeomToFeatureCount = function() {
		var query = this.queryFactory.createQueryGeomToFeatureCount();

		var self = this;
		var result = this.sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {
			var map = jsonRdfResultSetToMap(jsonRs, self.queryFactory.geomVar.value, self.queryFactory.countVar.value);
			return map;
		});
		return result;		
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
	ns.QuadTreeCache = function(backendFactory, labelFetcher, geomPosFetcher) {	
		var maxBounds = new qt.Bounds(-180.0, 180.0, -90.0, 90.0);
		this.quadTree = new qt.QuadTree(maxBounds, 18, 0);
	
		this.backendFactory = backendFactory;

		this.maxItemCount = 300;
		
		this.labelFetcher = labelFetcher;
		this.geomPosFetcher = geomPosFetcher;
	};

	
	ns.QuadTreeCache.prototype.createCountTask = function(node) {

		var result =
			this.backendFactory.forBounds(node.getBounds()).fetchGeomCount(self.maxItemCount).pipe(function(value) {

				node.setMinItemCount(value); 
				if(value < self.maxItemCount) {
					node.data.itemCount = value;
				} else {
					node.data.tooManyItems = true;
				}
			});
		
		return result;
	};
	
	
	
	ns.QuadTreeCache.isNotCounted = function(node) {
		var result = node.getMinItemCount() === null && (node.infMinItemCount === null || node.infMinItemCount < self.maxItemCount);
		return result;
	};
	
	
	
	ns.QuadTreeCache.isTooManyGeoms = function(node) {
		if(node.isLoaded) {
			return false;
		}
	
		if(node.infMinItemCount < self.maxItemCount) {
			return false;
		}

		return true;		
	};
	
	
	
	ns.QuadTreeCache.prototype.createCountTasks = function(nodes) {
		var self = this;
		var result = _.compact(_.map(nodes, function(node) { return self.createCountTask(node); }));
		
		/*
		var result = [];
		$.each(nodes, function(i, node) {
			var task = self.createCountTask(node);
			if(task) {
				result.push(task);
			}
		});
		*/

		return result;
	};
	
	
	/**
	 * 
	 * @param node
	 * @returns
	 */
	ns.QuadTreeCache.prototype.createTaskGeomToFeatureCount = function(node) {
		var result = this.backend.fetchGeomToFeatureCount().pipe(function(geomToFeatureCount) {
			node.data.geomToFeatureCount = geomToFeatureCount;
		});
		
		return result;
	};
	
	
	ns.QuadTreeCache.prototype.createLoadTasks = function(nodes) {
		var self = this;
		var result = [];
					
		//$.each(nodes, function(index, node) {
		_.each(nodes, function(node) {
			//console.debug("Inferred minimum item count: ", node.infMinItemCount);

			//if(node.data.absoluteGeomToFeatureCount)

			var loadTask = self.backendFactory.forBounds(node.getBounds()).fetchGeomToFeatureCount().pipe(function(geomToFeatureCount) {
				
				if(!node.data) {
					node.data = {};
				}

				console.log("GeomToFeatureCount", geomToFeatureCount);
				
				node.data.geomToFeatureCount = geomToFeatureCount;
				
				// We need to load all positions of the geometries
				
				
				// Determine for which geoms we can load the features
				
				node.isLoaded = true;
				//node.data.graph = rdfQueryUtils.rdfQueryFromTalisJson(data); //ns.triplesFromTalisJson(data); //data;//ns.rdfQueryFromTalisJson(data);
			});

			result.push(loadTask);
		});
		
		return result;
	};
	
	ns.QuadTreeCache.prototype.postProcess = function(nodes) {
		var self = this;
		
		// Here we create an rdfQuery databank object with the information we gathered
		_.each(nodes, function(node) {

			if(!node.data || !node.data.geomToFeatureCount) {
				return;
			}
			

			
			node.data.graph = $.rdf.databank();
			
			var uriStrs = _.keys(node.data.geomToFeatureCount);
			var uris = _.map(uriStrs, function(uriStr) { return sparql.Node.uri(uriStr); });
			
			
			//console.debug("Post processing uris", uris);
			
			var p1 = self.labelFetcher.fetch(uriStrs).pipe(function(data) {
				//console.log("Labels", data);
				node.data.uriToLabel = data;
			});
			
			var p2 = self.geomPosFetcher.fetch(uris).pipe(function(data) {
				//console.log("Positions", data);
				node.data.uriToPos = data;
			});
			
			
			$.when(p1, p2).then(function() {
				node.data.graph eueue 
			});
			
		});
	};
	
	
	/**
	 * This method implements the primary workflow for fetching data.
	 * 
	 * globalGeomCount = number of geoms - facets enabled, bounds disabled.
	 * if(globalGeomCount > threshold) {
	 * 
	 * 
	 *    nodes = aquire nodes.
	 *    foreach(node in nodes) {
	 *        fetchGeomCount in the node - facets TODO enabled or disabled?
	 *        
	 *        nonFullNodes = nodes where geomCount < threshold
	 *        foreach(node in nonFullNodes) {
	 *            fetch geomToFeatureCount - facets enabled
	 *            
	 *            fetch all positions of geometries in that area
	 *            -- Optionally: fetchGeomToFeatureCount - facets disabled - this can be cached per type of interest!!
	 *        }
	 *    }
	 * } 
	 * 
	 */
	ns.QuadTreeCache.prototype.load = function(bounds) {
		var self = this;
		
		// Prevent the bounds being set too frequently
		// TODO This is probably not the best place for doing that 
		if(self.isLocked) {
			return;
		}
		self.isLocked = true;
	
		
		//console.debug("Aquiring nodes for " + bounds);
		var nodes = this.quadTree.aquireNodes(bounds, 2);

		var uncountedNodes = _.filter(nodes, ns.QuadTreeCache.isNotCounted);
		console.log("# uncounted nodes", uncountedNodes.length);

		// The deferred is only resolved once the whole workflow completed
		var result = $.Deferred();

		
		var countTasks = this.createCountTasks(uncountedNodes);
		
		$.when.apply(window, countTasks).then(function() {
			nonFullNodes = _.filter(uncountedNodes, ns.QuadTreeCache.isTooManyGeoms);
			console.log("# non full nodes", nonFullNodes.length);

			
			var loadTasks = self.createLoadTasks(nonFullNodes);
			$.when.apply(window, loadTasks).then(function() {
				ns.QuadTreeCache.finalizeLoading(nodes);
				
				$.when(self.postProcess(nodes)).then(function() {
					console.debug("Workflow completed. Resolving deferred.");
					result.resolve(nodes);					
				});
			});
		});
		
		return result;
	};

	
	ns.QuadTreeCache.finalizeLoading = function(nodes) {
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
		//callback.success(nodes, bounds);
		self.isLocked = false;		
	};


	
	/**
	 * Load data for the specified area
	 * 
	 * @param bounds
	 */
	ns.QuadTreeCache.prototype.loadOld = function(bounds, callback) {
		
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
		
		
		/*
		 * Retrieve the minimum number of items per node
		 * This can happen either with or without facets being taken into account 
		 */
		var countTasks = this.createCountTasks(nodes);
			
	
		// Once all counts have been computed, request the data for applicable nodes
		$.when.apply(window, countTasks).then(function() {
	
			var loadTasks = [];
			
			
			$.each(nodes, function(index, node) {
				//console.debug("Inferred minimum item count: ", node.infMinItemCount);

				if(node.isLoaded) {
					return true;
				}
			
				if(!node.infMinItemCount < self.maxItemCount) {
					return true;
				}
		
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
