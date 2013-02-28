(function() {

	var backend = Namespace("org.aksw.ssb.backend");
	var facets = Namespace("org.aksw.ssb.facets");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var widgets = Namespace("org.aksw.ssb.widgets");

	var ns = facets;

	var foobarI18N;
	
	widgets.ModelFactoryNodeLabel = function(labelSyncer) {
		this.labelSyncer = labelSyncer;
	};

	widgets.ModelFactoryNodeLabel.prototype = {
		createModels : function(uriStrs) {

		}
	};

	widgets.ModelNodeLabel = Backbone.Model.extend({
		defaults : {
			// id should be sparql.Node.toString()
			label : "(no label set)"
		}
	});

	widgets.CollectionNodeLabel = Backbone.Collection.extend({
		model : widgets.ModelNodeLabel
	});

	widgets.ViewItemNodeLabel = Backbone.View.extend({
		tagName : 'span',
		initialize : function() {
			_.bindAll(this, 'render', 'unrender', 'remove'); // every
																// function that
																// uses 'this'
																// as the
																// current
																// object should
																// be in here

			var labelSync = this.options.labelSync;
			checkNotNull(labelSync);

		},
		render : function() {
			var label = model.get("label");
			this.$el.text(label);
		},
		unrender : function() {
			this.$el.remove();
		}
	});

	
	facets.SpanI18N = function(labelFetcher) {
		this.labelFetcher = labelFetcher;
	};
	
	facets.SpanI18N.prototype = {
		update: function(parentEl) {
			var uriToEls = {};
			var attrName = 'data-uri';
			$(parentEl).find('span[' + attrName + ']').each(function(index, el) {
			    var uri = $(el).attr(attrName);
			    
			    var arr = uriToEls[uri];
			    if(!arr) {
			    	arr = [];
			    	uriToEls[uri] = arr;
			    }
			    arr.push(el);
			    
			});	
			
			uris = _.keys(uriToEls);
			//console.log("URIS", uriToEls);

			
			this.labelFetcher.fetch(uris).done(function(labelInfo) {
				var uris = labelInfo.uris;
				var uriToLabel = labelInfo.uriToLabel;

				//console.log("URI", uris);

				_.each(uris, function(uri) { 
					var uriStr = uri.value;
					
					var label = uriToLabel[uriStr];
					var text = null;
					if(label) {
						text = label.value;						
					}
					
					if(!text || text === "") {
						text = "foo";
					}
					
					var els = uriToEls[uriStr];					
					_.each(els, function(el) {
						$(el).text(text);
					});
				});				
			}).fail(function(data) {
				console.log("Failed to fetch labels");
			});
		}
	};
	
	
	/**
	 * Updates the labels of all registered models. Note: This class should only
	 * be used for UPDATING the labels; not for fetching the initial ones.
	 * 
	 * 
	 * @param labelFetcher
	 * @param collection
	 * @returns {widgets.ConstrollerLabelSync}
	 */
	widgets.ConstrollerLabelSync = function(labelFetcher, collection) {
		this.labelFetcher = labelFetcher;
		this.collection = collection ? collection
				: new widgets.CollectionNodeLabel();
	};

	widgets.ConstrollerLabelSync.prototype = {
		getCollection : function() {
			return this.collection;
		},

		/**
		 * Returns a promise yielding an array of models
		 * 
		 * @param uriStrs
		 */
		getModels : function(uriStrs) {
			var self = this;
			var promise = this.labelFetcher.fetchUris(uriStrs).pipe(
					function(labelInfo) {
						var uriToLabel = labelInfo.uriToLabel;

						var collection = self.collection;

						// var uris = labelInfo.uris;
						_.each(uriToLabel, function(label, uri) {
							var entry = {
								id : uri,
								label : label
							};

							// TODO: Make sure existing models are updated and
							// not destroyed
							collection.add(entry);
						});
					});

			return promise;
		},

		sync : function() {

			var uriStrs = this.collection.chain().map(function(model) { // Get
																		// the
																		// nodes
				var node = model.get("node");
				return node;
			}).filter(function(node) { // Only retain URIs
				var result = node && node.isUri();
				return result;
			}).map(function(node) { // Get the URI strings
				return node.value;
			}).value();

			var result = this.getModels(uriStrs);
			return result;
		}
	};

	ns.ModelFacetNode = Backbone.Model.extend({
		defaults : {
			// baseQueryFactory: null, // Query factory for the instances (can
			// be seen as facet values)
			// facetsQueryFactory: null, // Query factory for the facets (of the
			// instances)
			// constraints: [], // contraints applying to this node
			isExpanded : false, // when changing to true, the controller will
								// start loading the children
			isLoading : false,
			/*
			 * children: new Backbone.Collection({ //model: ns.ModelFacetNode
			 * }), // subFacets - NOT facet values!
			 */
			facetFacadeNode : null, // Reference to a (non-model)
									// FacetFacadeNode
		},

		initialize : function() {
			// console.log("Initializing ModelFacetNode", this);

			this.set({
				children : new ns.CollectionFacetNode()
			});
		},
	});

	ns.CollectionFacetNode = Backbone.Collection.extend({
		model : ns.ModelFacetNode
	});

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
	 * A facet provider for ingoing/outgoing properties
	 * 
	 */
	ns.FacetProviderSimple = function(sparqlService, isInverse) {
		this.sparqlService = sparqlService;
		this.isInverse = isInverse ? isInverse : false;
	};

	ns.FacetProviderSimple.prototype = {
		fetchFacets : function(concept) {
			var self = this;

			var sampleSize = null; // 50000;
			var facetVar = sparql.Node.v("__p");
			var countVar = sparql.Node.v("__c");

			var query = queryUtils.createQueryFacetCount(concept, facetVar,
					countVar, this.isInverse, sampleSize);

			var myDataTemplate = function(binding) {

				// TODO Create a copy of the facet manager excluding the
				// constraints on this path.

				// var element = concept.getElement();

				var prefix = self.isInverse ? "<" : "";

				var result = {
					id : "simple_" + prefix + binding.facetName.value,
					type : "property",
					facetUri : binding.facetName.value,
					facetCount : binding.facetCount.value,
					isInverse : self.isInverse,
				// concept: null
				};

				// console.log("Binding:", result);
				return result;
			};

			var myDataBinding = {
				facetName : facetVar.value,
				facetCount : countVar.value
			};

			// console.log("Query: " + query);

			var dataProviderFactory = new facets.DataProviderFactoryQuery(
					this.sparqlService, function(x) {
						return x;
					});

			var dataProviderTmp = dataProviderFactory.createDataProvider(query);

			var postProcessor = DataTemplate.Sparql.createPostProcessor(
					myDataTemplate, myDataBinding);
			var dataProvider = new facets.DataProvider.Pipe(dataProviderTmp,
					postProcessor);

			var promise = dataProvider.fetchData();

			// dataProviderTmp.fetchData().done(function(x) {
			// console.log("YEAH", JSON.stringify(x)); });
			// promise.done(function(x) { console.log("YEAH",
			// JSON.stringify(x)); });

			return promise;
		}
	};

	var foobarTableModel;

	// A fact provider returns a promise that yields the name of the facet plus
	// a concept for its values.
	// { type: name: concept: }

	ns.ModelFacetUpdater = function(facetProviders, baseConcept) {
		this.facetProviders = facetProviders;
		this.baseConcept = baseConcept;
	};

	ns.ModelFacetUpdater.prototype = {
		updateFacets : function(model, facetFacadeNode) {

			var tmpConcept = facetFacadeNode.createConcept();
			
			var tmpElement = new sparql.ElementGroup([this.baseConcept.getElement(), tmpConcept.getElement()]);
			
			//concept.getElement().push(this.baseConcept.getElement());
			var concept = new facets.ConceptInt(tmpElement, tmpConcept.getVariable());
			
			
			// console.log("Loading facets for concept:" + concept);
			// console.log("The model is: ", model);

			// If the node is not expanded, we omit it
			var isExpanded = model.get("isExpanded");
			if (!isExpanded) {
				return;
			}

			var children = model.get("children");
			var syncer = new backboneUtils.CollectionCombine(children);

			// Get the facets of the concept
			var promises = _.map(this.facetProviders, function(facetProvider) {
				var tmp = facetProvider.fetchFacets(concept);

				var promise = tmp.pipe(function(items) {

					var mapped = _.map(items, function(item) {

						var facetUri = item.facetUri;
						var isInverse = item.isInverse;

						var subNode = facetFacadeNode.forProperty(facetUri,
								isInverse);
						item.facetFacadeNode = subNode;

						// console.log("Mapped model:", item);

						return item;
					});

					return mapped;
				});

				return promise;
			});

			model.set({
				isLoading : true
			});
			$.when(promises, function() {
				model.set({
					isLoading : false
				});
			});

			syncer.sync(promises);
		}

	};

	ns.ViewFacetItem = Backbone.View
			.extend({
				tagName : 'li',
				// attributes: {style: 'float: left'},
				initialize : function() {
					_.bindAll(this, 'render', 'unrender', 'remove'); // every
																		// function
																		// that
																		// uses
																		// 'this'
																		// as
																		// the
																		// current
																		// object
																		// should
																		// be in
																		// here

					var options = this.options;
					// console.log("Created view for facet item", options);
					// this.parent = this.model.get("parent");

					var parent = options.parent;
					var parentOptions = parent.options;
					this.modelFacetUpdater = parentOptions.modelFacetUpdater;

					var model = this.model;
					var children = model.get("children");

					this.subFacetWidget = new widgets.ViewFacetTree({
						collection : children,
						modelFacetUpdater : this.modelFacetUpdater
					});

					// console.log("ModelFacetUpdater ",
					// this.modelFacetUpdater);

					// model.bind('change', this.render, this);
					model.bind('remove', this.unrender, this);
					model.on('change:isExpanded', this.changeIsExpanded, this);
					// model.bind('change:isExpanded', function())

					// var children = model.get("children");

					// children.bind('add', this.add)

					if (this.el) {
						this.render();
					}

					this.facetValuesView = null;

				},

				changeIsExpanded : function() {
					var model = this.model;
					var isExpanded = model.get('isExpanded');

					// var subFacetWidget = this.subFacetWidget;
					// if(!subFacetWidget) {
					// return;
					// }

					var subEl = this.subFacetWidget.$el;
					if (isExpanded) {
						subEl.show();
					} else {
						subEl.hide();
					}
				},

				events : {
					'click a.expandable' : function(ev) {
						ev.preventDefault();
						
						// Workaround for backbone not supporting relative paths for event target selector
						var expectedTarget = this.$el.find("> a.expandable")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}

						var model = this.model;
						var isExpanded = model.get('isExpanded');
						if (isExpanded) {
							model.set({
								'isExpanded' : false
							});
						} else {
							var facetFacadeNode = model.get("facetFacadeNode");

							model.set({
								'isExpanded' : true
							});
							this.modelFacetUpdater.updateFacets(model,
									facetFacadeNode);
						}
					},
					'click .activate' : function(ev) {
						ev.preventDefault();
						
						// Workaround for backbone not supporting relative paths for event target selector
						var expectedTarget = this.$el.find("> a.activate")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}

						var model = this.model;
						// Show the facet values in the preconfigured area
						var facetFacadeNode = model.get("facetFacadeNode");
						//var path = facetFacadeNodep.getPath();
						
						var concept = facetFacadeNode.createConcept();

						var queryGenerator = new facets.QueryGenerator(concept);
						var queryFactory = new facets.QueryFactoryQueryGenerator(
								queryGenerator, {
									distinct : true
								});
						
						// TODO Combine the concept for the facet selection with the initial concept

						// var models = createQueryBrowser(sparqlService,
						// labelFetcher);

						// var tableModel =
						// models.browseConfig.config.tableModel;
						foobarTableModel.set({
							queryFactory : queryFactory,
							facetFacadeNode: facetFacadeNode // FIXME: Not sure if this should go here
						});

					}
				},
				render : function() {
					
					var text = this.model.get("facetUri");

					var html
						= '<a class="expandable" href="#">'
						+ '    <img src="src/main/resources/osm-logo-small.png" />'
						+ '</a>'
						+ '<a class="activate" href="#">'
						+ '    <span data-uri="' + text + '"></span>'
						+ '</a>'
						;
					
					this.$el.html(html);

					// TODO: This is not the best place to do the update, is it fires one query per element
					foobarI18N.update(this.$el);
					/*
					 * var model = this.model; var isExpanded =
					 * model.get("isExpanded"); if(!isExpanded) { return this; }
					 */

					var subFacetWidgetEl = this.subFacetWidget.render().$el;
					this.$el.append(subFacetWidgetEl);

					return this;
				},
				unrender : function() {
					this.$el.remove();
				},
				remove : function() {
					this.model.destroy();
				}
			});

	widgets.facetItemRenderer = new widgets.RendererItemView({}, null,
			facets.ViewFacetItem, {
				label : "simpleLabel"
			});

	widgets.ViewFacetTree = widgets.ListView.extend({
		attributes: {
			'class': 'facet'
		},
		itemRenderer : widgets.facetItemRenderer
	});

	

	/**
	 * ModelConstraints should be treated immutable!
	 * 
	 * TODO: I think we should use the complex model here too:
	 * a constraint has a type and then some extra fields depending on it
	 * e.g. {type: 'equals', path: somePath, value: node}
	 */
	facets.ModelConstraint = Backbone.Model.extend({
		defaults : {
			//type: null,
			//path : null, // The path the contraint applies to
			
			// TODO: Not sure if the constraint should be a sub-object
			constraint : null
		}
	});

	
	/**
	 * A collection for contraints.
	 * 
	 * For simplicity this is a flat collection. TODO Explain how to update a
	 * query factory from it
	 * 
	 */
	facets.ConstraintCollection2 = Backbone.Collection.extend({
		model: facets.ModelConstraint,
		
		existsEquals: function(path, node) {
			var result = this.some(function(model) {
				
				//console.log("Comparing path and node to model:", path, node, model);
				
				var constraint = model.get('constraint');
				//var constraint = model;

				/*
				console.log("Comparing path and node to model:", path, node, model);
				console.log(constraint.type === 'equals');
				console.log(path.equals(constraint.path));
				console.log(node.equals(constraint.node));
				*/
				
				var test
					= constraint.type === 'equals'
					&& path.equals(constraint.path)
					&& node.equals(constraint.node);
			
				
				return test;
			});
			
			return result;
		},
		
		createConstraintManager: function(rootFacetNode) {
			
			var constraintManager = new facets.ConstraintManager();
			var facetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);

			this.each(function(model) {
				var constraint = model.get('constraint');

				var path = constraint.path;
				var node = constraint.node; 

				
				checkNotNull(constraint);
				
				if(constraint.type !== 'equals') {
					logger.log("Only equals supported right now");
					return
				}
				
				facetFacadeNode.forPath(path).addConstraint({type: 'equals', node: node});
			});

			return constraintManager;
//			var nodeValue = sparql.NodeValue.makeNode(sparql.Node
//					.uri("http://dbpedia.org/resource/year/2008"));
//			var constraint = facets.ConstraintUtils.createEquals(yearPath,
//					nodeValue);			
		}
	});

	

	
	ns.createFacetNodes = function(constraintCollection, rootFacetNode) {

		constraintCollection.each(function(model) {
			var path = model.get("path");
			var constraint = model.get("constraint");

			var node = rootFaceNode.forPath(path);
			node.addConstraint(constraint);
		});

	};


	ns.facetTest = function() {

		var sparqlService = new backend.SparqlServiceHttp(
				"http://localhost:8810/sparql",
				[ "http://fp7-pp.publicdata.eu/" ],
				"lib/SparqlProxyPHP/current/sparql-proxy.php", "service-uri");

		var v = sparql.Node.v("s");
		var element = new sparql.ElementString(
				"?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [ v ]);

		var concept = new facets.ConceptInt(element, v);
		var queryGenerator = new facets.QueryGenerator(concept);
		var queryFactoryConcept = new facets.QueryFactoryQueryGenerator(
				queryGenerator);

		var queryFactoryFacets = facets.QueryFactoryFacets.create(
				queryFactoryConcept, v.value);

		var constraintManager = queryFactoryFacets.getConstraintManager();
		var rootFacetNode = queryFactoryFacets.getRootFacetNode();

		var facetFacade = new facets.SimpleFacetFacade(constraintManager,
				rootFacetNode);

		
		
		// The backbone collection for constraints
		var constraintCollection = new facets.ConstraintCollection2();
		
		// var amountPath =
		// facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project
		// http://example.org/beneficiary http://ex.org/amount");
		// var cityPath =
		// facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project
		// http://example.org/beneficiary http://ex.org/city");

		if (false) {
			var yearPath = facets.Path
					.fromString("http://fp7-pp.publicdata.eu/ontology/year");

			{
				var nodeValue = sparql.NodeValue.makeNode(sparql.Node
						.uri("http://dbpedia.org/resource/year/2008"));
				var constraint = facets.ConstraintUtils.createEquals(yearPath,
						nodeValue);
				constraintManager.addConstraint(constraint);
			}
		}

		if (false) {
			facetFacade
					.forPathStr("http://fp7-pp.publicdata.eu/ontology/year")
					.addConstraint(
							{
								type : "equals",
								node : sparql.Node
										.uri("http://dbpedia.org/resource/year/2008")
							});
		}

		/*
		 * { var nodeValue =
		 * sparql.NodeValue.makeNode(sparql.Node.forValue(1000)); var constraint =
		 * facets.ConstraintUtils.createEquals(amountPath, nodeValue);
		 * constraintManager.addConstraint(constraint); }
		 *  { var nodeValue =
		 * sparql.NodeValue.makeNode(sparql.Node.uri("http://ex.org/Leipzig"));
		 * var constraint = facets.ConstraintUtils.createEquals(cityPath,
		 * nodeValue); constraintManager.addConstraint(constraint); }
		 */

		// TODO Maybe concepts should really be used at the level of the
		// DataFetcher rather than the QueryFactory level:
		// Note: (Concept)DataFetcher is then in the workflow between
		// DataProvider and QueryFactory:
		// The DataProvider wraps the whole configuration, and calls the
		// dataFetcher which makes use of the QueryFactories.
		// dataFetcher.fetchDataFor(concept);
		// If we have an external concept, we may have to chunk the items;
		// rather than directly creating a query from them.

		var tableModel = new facets.TableModelQueryFactory(queryFactoryFacets);
		tableModel.setLimit(10);

		var queryFactoryKeyword = new facets.QueryFactoryKeyword(tableModel,
				[ v ]);

		// var executor = new facets.ExecutorQueryFactory(sparqlService,
		// queryFactoryKeyword);
		// var dataProviderTmp = new facets.DataProvider.Executor(executor);

		// var postProcessor =
		// DataTemplate.Sparql.createPostProcessor(myDataTemplate,
		// myDataBinding);
		// var searchDataProvider = new
		// facets.DataProvider.Pipe(dataProviderTmp, postProcessor);

		// The idea is to have views on the ModelFacetNode objects.
		// These views can then wrap the node's corresponding queryFactory to
		// add limit/offset/search

		var modelFacetNode = new facets.ModelFacetNode({
			baseQueryFactory : tableModel,
		// facetManager: new
		});

		var facetProviders = [ new facets.FacetProviderSimple(sparqlService,
				false) ];

		var modelFacetUpdater = new facets.ModelFacetUpdater(facetProviders, concept);

		var rootModel = new facets.ModelFacetNode();

		var rootCollection = rootModel.get("children");
		// console.log("Root Collection: ", rootCollection);

		this.facetWidget = new widgets.ViewFacetTree({
			el : $("#facets"),
			collection : rootCollection,
			// options: {
			modelFacetUpdater : modelFacetUpdater
		// }
		});

		/*
		 * this.facetWidget = new widgets.ListView({ el: $("#facets"),
		 * collection: rootCollection, itemRenderer: facetItemRenderer });
		 */

		rootModel.set("isExpanded", true);

		/*
		 * 
		 *  /* SimpleFacetFacade sff = new SimpleFacetFacade(baseConcept);
		 * sff.forPathStr(...).
		 *  /
		 * 
		 * 
		 * console.log("Concept:", conc);
		 */
		// var es = constraintManager.createElements(rootFacetNode);
		// var es = facetFacade.createElements();
		
		
		/*
		var es = facetFacade.forPathStr(
				"http://fp7-pp.publicdata.eu/ontology/year").createElements();
		*/
		var es = facetFacade.forPathStr("").createElements();
		
		
		// console.log("es", es);

		var conceptElement = concept.getElement();
		es.push(conceptElement);
		// console.log("plu concept element", conceptElement);

		var e = new sparql.ElementGroup(es);

		// console.log("Final element: " + e);

		// var v =
		// rootFacetNode.forPath(facets.Path.fromString("")).getVariable();
		var v = rootFacetNode
				.forPath(
						facets.Path
								.fromString("")) //"http://fp7-pp.publicdata.eu/ontology/year"))
				.getVariable();
		var conc = new facets.ConceptInt(e, v);

		modelFacetUpdater.updateFacets(rootModel, facetFacade);

		/**
		 * Based on the constraint collection, we infer the check model
		 * 
		 * 
		 */

		var CollectionConstraintChecked = Backbone.Collection.extend({

		});

		CollectionConstraintChecked.create = function(constraintCollection)
		{

			constraints.on("add", function(model) {

			});

		};

		var ViewItemCheck = Backbone.View.extend({
			subView : null,

			tagName : 'input',
			attributes: {type: 'checkbox'}, //;style: 'float: left'},
			initialize : function() {
				_.bindAll(this); //, 'render', 'unrender', 'remove', 'setCheckState'); // every
					
				//this.model.on('change:isChecked', 'setCheckState');
				this.model.on('change:isChecked', this.updateCheckState);
		    	this.model.bind('remove', this.unrender, this);
		    	
		    	this.updateCheckState();
			},
			updateCheckState: function() {
				var isChecked = this.model.get("isChecked");
				this.$el.attr('checked', isChecked);
				console.log("setCheckState", isChecked, this.$el);
			},
			
			render : function() {

				var subView = this.subView;
				//var inputEl = $('<input type="checkbox"></input>');

				if(subView) {
					var subViewEl = subView.render().$el;
					this.$el.append(subViewEl);
				}
				

				//this.$el.append(inputEl);

				return this;
			},

			unrender : function() {
				this.$el.remove();
			}
		});
		
		
		/**
		 * These models are created 
		 * 
		 */
		var ModelItemCheckConstraint = Backbone.Model.extend({
			defaults: {
				isChecked: false
				//path: null,
				//node: null
			}
		});
		
		
		
		/**
		 * This collection is
		 * 
		 */
		var CollectionItemCheckConstraint = Backbone.Collection.extend({
			model: ModelItemCheckConstraint
		});
		
		
		
		var ViewItemCheckConstraint = ViewItemCheck.extend({
			//tagName: 'li',
			attributes: {type: 'checkbox', 'class': 'checkConstraint'},
			events: {
				//'click .checkConstraint':
				'click': function(ev) {
					
					//console.log("check model is", this.model);
					
					// Prevent the checkbox from getting checked
					// The check occurs as a reaction to adding the constraint to the constraint collection
					//ev.stopPropagation();
					//ev.preventDefault();
					
					var model = this.model;
					
					var constraint = model.get("constraint");
					if(!constraint) {
						console.log("Constraint not set - should not happen");
						return;
					}
					
					var path = constraint.path;
					var node = constraint.node;
					//var path = model.get("path");
					//var node = model.get("node");
					
					if(!path) {
						console.log("Path is null - should not happen");
						return;
					}
					//var nodeValue = sparql.NodeValue.makeNode(node);
					
					var constraint = {
						constraint: {
							type : "equals",
							path : path,
							node : node
						}
					};
					
					var id = JSON.stringify(constraint);
					constraint.id = id;
					
					
					// TODO: toggle the constraint
					if(constraintCollection.get(id)) {
						constraintCollection.remove(id)
					} else {
						constraintCollection.add(constraint);
					}
					
					
					//console.log("Added a constraint", constraintCollection);
				}
			}
		});
				
		

		var labelFetcher = new labelUtils.LabelFetcher(sparqlService, ['de', 'en', '']);

		
		var models;
		{
			var queryGenerator = new facets.QueryGenerator(conc);
			var queryFactory = new facets.QueryFactoryQueryGenerator(
					queryGenerator, {
						distinct : true
					});

			models = createQueryBrowser(sparqlService, labelFetcher);

			var tableModel = models.browseConfig.config.tableModel;
			tableModel.set({
				queryFactory : queryFactory
			});

			foobarTableModel = tableModel;

			var container = $('#facetValues');
			container.children().remove();

			
			//var facetViewModels = _.clone(models);
			
			// Replace the original collection; we will sync it
			var sourceCollection = models.browseConfig.collection;
			models.browseConfig.collection = new CollectionItemCheckConstraint();
			
			createView(container, models, function(options) {

				var result = new widgets.TableView2({
					collection : options.collection,
					rowItemRenderer: function(model) {
						var c1 = new ViewItemCheckConstraint({
							model: model
						});
						
						var constraint = model.get('constraint');
						var node = constraint.node;
						var c2;
						if(node.isUri()) {
							c2 = $('<span>' + node.value + '</span>');
						}
						
						
						
						var result = [c1.render().$el, c2];
						
						return result;
					}
				});
				return result;
				
				/*
				var facetValueItemRenderer = new widgets.RendererItemView({}, null,
						ViewItemCheckConstraint, {
							label : "simpleLabel"
						});

				var ViewFacetValues = widgets.ListView.extend({
					itemRenderer : facetValueItemRenderer
				});
				 */
				
				/*
				var tableView = new TableView(
						{
							el : $("#table"),
							// attributes: {style: {'list-style': 'none'}},
							collection : viewCollection,
							itemRenderer : new widgets.ItemRendererBackbone(
									widgets.ItemViewProject)
						});
				*/

				
				
				
				//var result = new ViewFacetValues(options);
				//return result;
			});
		}

		console.log("Models:", models);
		
		var rsCollection = models.browseConfig.collection;
		

		/**
		 * This class can transform models according to the constraint collection state.
		 * 
		 * But what if the constraintCollection changes?
		 * Then we need to know the original collection so that we can update it
		 * 
		 */
		var ControllerFacetValueEnricher = function(constraintCollection, checkCollection, facetFacadeNode) {
			_.bindAll(this);
			
			this.constraintCollection = constraintCollection;
			this.facetFacadeNode = facetFacadeNode;
			this.checkCollection = checkCollection;
			
			this.bind();
		};
		
		ControllerFacetValueEnricher.prototype = {
			
			bind: function() {
				this.constraintCollection.on('add', this.onAddConstraint);
				this.constraintCollection.on('remove', this.onRemoveConstraint);
				this.constraintCollection.on('reset', this.onReset);
			},
			
			onAddConstraint: function(model) {
				console.log("Adding constraint: ", model, constraintCollection);
				
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
				var isChecked = constraintCollection.existsEquals(path, node);
				
				var id = path + "@" + node;
				console.log("Check state is " + isChecked + " for " + id);
				console.log("ConstraintCollection", constraintCollection);
				
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


		var controllerFacetValueEnricher = new ControllerFacetValueEnricher(constraintCollection, rsCollection);
		
		foobarTableModel.on('change:facetFacadeNode', function(model) {
			var facetFacadeNode = model.get('facetFacadeNode');
			controllerFacetValueEnricher.setFacetFacadeNode(facetFacadeNode);
		});

		/**
		 * TODO: The result set of the facet-values query must be enriched with the following
		 * information:
		 *
		 * - the path for which the facet-value is obtained
		 * 
		 */
		var facetValueSync = new backboneUtils.ControllerSlaveCollection(
			sourceCollection,
			rsCollection,
			function(model) {
				var result = controllerFacetValueEnricher.process(model);
				return result;
			}
		);

		

//		controllerFacetValueEnricher.bind(rsCollection);
		
		
		/*
		rsCollection.on('reset', function(collection, options) {

			var node = sparql.Node
					.uri("http://dbpedia.org/resource/year/2008");

			console.log("EQUALS TEST", constraintCollection.existsEquals(facets.Path.fromString(''), node));			
		});
		*/

		
		

		
		

		/*
		 * Initialize the result table list
		 * 
		 */
		{
			//var queryGenerator = new facets.QueryGenerator(tableModel);
			//var queryGenerator = tableModel;
			var queryFactory = new facets.QueryFactoryQueryGenerator(
					queryGenerator);
			/*
			var queryFactory = new facets.QueryFactoryQueryGenerator(
					queryGenerator, {
						distinct : true
					});
			 */
			models = createQueryBrowser(sparqlService, labelFetcher);

			
			var tableModel = models.browseConfig.config.tableModel;
			tableModel.set({
				queryFactory : queryFactory
			});

			var container = $('#instances');
			container.children().remove();

			
			createView(container, models);
		
		
			// Whenever the constraint collection changes, the view might
			// have to be updated.
			var ControllerInstanceListSyncer = function(subQueryFactory, facetNode, constraintCollection, modelQueryFactory) {
				_.bindAll(this);
				
				this.subQueryFactory = subQueryFactory;
				this.facetNode = facetNode;
				this.constraintCollection = constraintCollection;
				
				// The model on which to set the new queryFactory
				this.modelQueryFactory = modelQueryFactory;
				this.bind();
			};
			
			ControllerInstanceListSyncer.prototype = {
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
			
			
			var ctrlInstaceListSyncer = new ControllerInstanceListSyncer(
					queryFactory,
					rootFacetNode,
					constraintCollection,
					tableModel
			);

			
			
			
		}
			
		
		
		
		
		
		
		
		foobarI18N = new facets.SpanI18N(labelFetcher);
		var tmpEl = $(document);
		foobarI18N.update(tmpEl);
	};

	/*
	 * var FacetMasterView = Backbone.View.extand({ tagName: 'li', attributes:
	 * {style: 'float: left'}, initialize: function(){ _.bindAll(this, 'render',
	 * 'unrender', 'remove'); // every function that uses 'this' as the current
	 * object should be in here
	 * 
	 * this.model.bind('change', this.render, this); this.model.bind('remove',
	 * this.unrender, this); }, render: function() { var children =
	 * model.get("children");
	 * 
	 * 
	 * 
	 * var html = JSON.stringify(this.model.attributes); $(this.el).html(html);
	 * return this; }, unrender: function() { $(this.el).remove(); }, remove:
	 * function(){ this.model.destroy(); } });
	 */

})();