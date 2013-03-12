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
			
			var id = path + "@" + node;
			console.log("Check state is " + isChecked + " for " + id);
			console.log("ConstraintCollection", this.constraintCollection);
			
			// TODO Update in place or sync a collection?
			result = {
				id: id,
				isChecked: isChecked,
				
				constraint: {
					type: 'equals',
					path: path,
					node: node
				}
			};
			
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
	ns.ControllerInstanceListSyncer = function(subQueryFactory, facetNode, constraintCollection, modelQueryFactory) {
		_.bindAll(this);
		
		this.subQueryFactory = subQueryFactory;
		this.facetNode = facetNode;
		this.constraintCollection = constraintCollection;
		
		// The model on which to set the new queryFactory
		this.modelQueryFactory = modelQueryFactory;
		this.bind();
	};
	
	ns.ControllerInstanceListSyncer.prototype = {
		bind: function() {
			this.constraintCollection.on('add', this.onAnyChange);
			this.constraintCollection.on('remove', this.onAnyChange);
			this.constraintCollection.on('reset', this.onAnyChange);
		},
		
		onAnyChange: function() {
		
			console.log("ANY CHANGE");
			
			var constraintManager = this.constraintCollection.createConstraintManager(this.facetNode);
			var queryFactory = new facets.QueryFactoryFacets(this.subQueryFactory, this.facetNode, constraintManager); //queryFactoryFacets.getConstraintManager();

			console.log("QueryFACTORY IS", queryFactory);
			
			this.modelQueryFactory.set({queryFactory: queryFactory});
		}
	};

})();