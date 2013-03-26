(function() {

	/*
	var backend = Namespace("org.aksw.ssb.backend");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var widgets = Namespace("org.aksw.ssb.widgets");
	 */
	
	var facets = Namespace("org.aksw.ssb.facets");
	var ns = facets;

	
	
	/**
	 * Syncs a constraint collection with a modelFacetNode:
	 * By this, we can show for each facets, how many values are selected.
	 * 
	 * 
	 */
	ns.ControllerSelectionCountSync = function(constraintCollection, rootFacetModel) { // {FacetNode) {
		_.bindAll(this);

		this.constraintCollection = constraintCollection;
		//this.rootFacetNode = rootFacetNode;
		this.rootFacetModel = rootFacetModel;
		
		this.bind();
	};
	
	ns.ControllerSelectionCountSync.prototype = {
		bind: function() {			
			this.constraintCollection.on('add', this.onAddConstraint);
			this.constraintCollection.on('remove', this.onRemoveConstraint);
			this.constraintCollection.on('reset', this.onResetConstraints);
		},
		
		updateByPath: function(path) {
			console.log("[ControllerSelectionCountSync] rootFacetModel: ", this.rootFacetModel);

			var facetFacadeNode = this.rootFacetModel.get('facetFacadeNode');
			console.log("[ControllerSelectionCountSync] rootFacetNode", facetFacadeNode);
			
			var targetModel = this.rootFacetModel.forPath(path);
			console.log("[ControllerSelectionCountSync] targetModel: ", targetModel);

			//var facetFacadeNode = targetModel.get('facetFacadeNode');			
			//console.log("[ControllerSelectionCountSync] FacetFacadeNode is: ", facetFacadeNode);
			
			// TODO facetFacade is WRONG here - should be facetNode
			var constraintManager = this.constraintCollection.createConstraintManager(facetFacadeNode);
			var constraints = constraintManager.getConstraintsByPath(path);
			
			//var constraints = facetFacadeNode.getConstraints();
			var n = constraints.length;
			
			
			targetModel.set({selectionCount: n});
			
			console.log("Set selection count for path: " + path + " to " + n);
		},
		
		updateByConstraintModel: function(model) {
			//this.updateByModel(model);
			var constraint = model.get("constraint");
			
			// FIXME We assume that the path exists
			var path = constraint.path;
			this.updateByPath(path);
		},
		
		onAddConstraint: function(model) {
			this.updateByConstraintModel(model);
		},
		
		onRemoveConstraint: function(model) {
			this.updateByConstraintModel(model);			
		},
		
		onResetConstraints: function(collection) {
			throw "Not implemented yet";
		}
	};
	

	ns.ControllerFacetNode = function(sparqlService, model, facetManager) {
		this.sparqlService = sparqlService;
		this.model = model;
		this.facetManager = facetManager ? facetManager
				: new facets.FacetManager();
	};

	ns.ControllerFacetNode.prototype = {
		bind : function() {
			var sparqlService = this.sparqlService;
			var model = this.model;
			var queryFactory = model.get("queryFactory");
			var query = queryFactory.createQuery();

			var handlers = {};

			var factoryChangeHandler = function() {
				model.set({
					isLoading : true
				});
				var collection = model.get("children");

				var queryFactory = model.get("queryFactory");
				var query = queryFactory.createQuery();

				var promise = dataFetcher.fetchData(query);
				promise
						.done(function(data) {
							collection.add(data);

							// For all remaining children, update the
							// queryFactory accordingly
							_.each(collection, function(model) {

							});

						})
						.fail(
								function() {
									console
											.log("Facet loading failed... TODO Handle this case?");
								});
			};

			var destroyHandler = function() {
				_.each(handlers, function(value, key) {
					model.off(key, value);
				});
			};

			_.each(handlers, function(value, key) {
				model.on(key, value);
			});

			_.extend(handlers, {
				"change:queryFactory" : factoryChangeHandler,
				"destroy" : destroyHandler
			});
		}
	};

	
	
	/**
	 * In a nutshell, this class add a 'isChecked' attribute the facet values
	 * based on the status of the constraint collection.
	 * This class can transform models according to the constraint collection state.
	 * 
	 * But what if the constraintCollection changes?
	 * Then we need to know the original collection so that we can update it
	 * 
	 */
	ns.ControllerFacetValueEnricher = function(constraintCollection, checkCollection, facetFacadeNode) {
		_.bindAll(this);
		
		this.constraintCollection = constraintCollection;
		this.facetFacadeNode = facetFacadeNode;
		this.checkCollection = checkCollection;
		
		this.bind();
	};
	
	ns.ControllerFacetValueEnricher.prototype = {
		
		bind: function() {
			this.constraintCollection.on('add', this.onAddConstraint);
			this.constraintCollection.on('remove', this.onRemoveConstraint);
			this.constraintCollection.on('reset', this.onReset);
		},
		
		onAddConstraint: function(model) {
			console.log("Adding constraint: ", model, this.constraintCollection);
			
			// Check the checkCollection of whether it contains such entry
			var constraint = model.get("constraint");
			
			this.checkCollection.each(function(model) {
				var c = model.get("constraint");
				
				//console.log("Comparision of constraint A:", c);
				//console.log("Comparision of constraint B:", constraint);
				
				if(_.isEqual(constraint, c)) {
					model.set({isChecked: true});
				}
			});
		},
		
		onRemoveConstraint: function(model) {
			// Check the checkCollection of whether it contains such entry
			var constraint = model.get("constraint");
			
			this.checkCollection.each(function(model) {
				var c = model.get("constraint");
				if(_.isEqual(constraint, c)) {
					model.set({isChecked: false});
				}
			});
		},
		
		onReset: function() {
			throw "Reset not supported yet";
		},

		setFacetFacadeNode: function(facetFacadeNode) {
			this.facetFacadeNode = facetFacadeNode;
		},
		
		/**
		 * The model is that of a result set.
		 * 
		 * model: {
		 *     varName1: node
		 *     ...
		 *     varNameN: node
		 * }
		 * 
		 * @param model
		 * @returns
		 */
		process: function(model) {
			var facetFacadeNode = this.facetFacadeNode;
			if(!facetFacadeNode) {
				console.log("FacetFacadeNode not set. Should not happen");
				return;
			}
			
			var path = facetFacadeNode.getPath();
			var varName = facetFacadeNode.getVariable().value; //Name();
			
			var facetVal = model.get(varName);
			var node = facetVal.node;
	
			// Check the constraint model for the state of this var
			var isChecked = this.constraintCollection.existsEquals(path, node);
			
			
//			console.log("[cc] cc", this.constraintCollection);
//			console.log("[cc] path --- node", path, node);
//			console.log("[cc] isChecked: ", isChecked);
			
			
			//var id = path + "@" + node;
			//console.log("Check state is " + isChecked + " for " + id);
			//console.log("ConstraintCollection", this.constraintCollection);
			
			// TODO Update in place or sync a collection?
			result = {
				//id: id,
				isChecked: isChecked,
				
				constraint: {
					type: 'equals',
					path: path,
					node: node
				}
			};
			
			//console.log("Processed: " + JSON.stringify(result));
			
			return result;
		}
		/*
		bind: function(collection) {
			
			var self = this;

			collection.on('reset', function(c, options) {
				
				
				collection.each(function(model) {
					
				});
				

			});
		
		}*/
	};

	
	
	
	// Whenever the constraint collection changes, the view might
	// have to be updated.
	ns.ControllerInstanceListSyncer = function(subQueryFactory, facetNode, constraintCollection, collectionColumns, modelQueryFactory) {
		_.bindAll(this);
		
		this.subQueryFactory = subQueryFactory;
		this.facetNode = facetNode;
		this.constraintCollection = constraintCollection;
		this.collectionColumns = collectionColumns;
		
		// The model on which to set the new queryFactory
		this.modelQueryFactory = modelQueryFactory;
		this.bind();
	};
	
	ns.ControllerInstanceListSyncer.prototype = {
		bind: function() {
			this.constraintCollection.on('add', this.onAnyChange);
			this.constraintCollection.on('remove', this.onAnyChange);
			this.constraintCollection.on('reset', this.onAnyChange);

			this.collectionColumns.on('add', this.onAnyChange);
			this.collectionColumns.on('remove', this.onAnyChange);
			this.collectionColumns.on('reset', this.onAnyChange);
		},
		
		onAnyChange: function() {
		
			//console.log("ANY CHANGE");
			
			var constraintManager = this.constraintCollection.createConstraintManager(this.facetNode);
			var qfFacets = new facets.QueryFactoryFacets(this.subQueryFactory, this.facetNode, constraintManager); //queryFactoryFacets.getConstraintManager();
			var qfProjection = new facets.TableModelQueryFactory(qfFacets);

			
			var projVars = this.collectionColumns.createProjection(this.facetNode);
			var projEles = this.collectionColumns.createElements(this.facetNode);
			qfProjection.setProjection(projVars);
			var tmp = qfProjection.getElements();
			tmp.push.apply(tmp, projEles);

			//console.log("Query IS", qfProjection.createQuery());
			//console.log("QueryFACTORY IS", qfProjection);
			
			this.modelQueryFactory.set({
				queryFactory: qfProjection,
			});
		}
	};

	
	ns.ControllerColumnSelection = function(collectionColumns) {
		_.bindAll(this);
		
		this.collectionColumns = collectionColumns;
		
		this.bind();
	};
	
	
	ns.ControllerColumnSelection.prototype = {
		bind: function() {
			this.collectionColumns.on('add', this.onColumnAdd);
			this.collectionColumns.on('remove', this.onColumnRemove);
		},
		
		onColumnAdd: function(model) {
			var path = model.get('path');
			console.log('add path', path);
		},
		
		onColumnRemove: function(model) {
			var path = model.get('path');
			console.log('remove path', path);			
		}
	};
	
})();
