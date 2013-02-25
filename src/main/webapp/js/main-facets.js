(function() {

	var backend = Namespace("org.aksw.ssb.backend");
	var facets = Namespace("org.aksw.ssb.facets");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var labelUtils = Namespace("org.aksw.ssb.utils");

	
	var ns = facets;


	
	ns.ModelFacetNode = Backbone.Model.extend({
		defaults: {
			//baseQueryFactory: null, // Query factory for the instances (can be seen as facet values)
			//facetsQueryFactory: null, // Query factory for the facets (of the instances)
			//constraints: [], // contraints applying to this node
			isExpanded: false, // when changing to true, the controller will start loading the children 
			isLoading: false,
			children: new Backbone.Collection(), // subFacets - NOT facet values!
			facetNode: null, // Reference to a (non-model) FacetNode
		}
	});

	
	ns.ControllerFacetNode = function(sparqlService, model, facetManager) {
		this.sparqlService = sparqlService;
		this.model = model;
		this.facetManager = facetManager ? facetManager : new facets.FacetManager();
	};
	

	ns.ControllerFacetNode.prototype = {			
		bind: function() {
			var sparqlService = this.sparqlService;
			var model = this.model;
			var queryFactory = model.get("queryFactory");
			var query = queryFactory.createQuery();
		
			var handlers = {};
		
			var factoryChangeHandler = function() {
				model.set({isLoading: true});
				var collection = model.get("children");

				var queryFactory = model.get("queryFactory");
				var query = queryFactory.createQuery();
										
				var promise = dataFetcher.fetchData(query);
				promise.done(function(data) {
					collection.add(data);
					
					// For all remaining children, update the queryFactory accordingly
					_.each(collection, function(model) {
						
					
					});
					
					
				}).fail(function() {
					console.log("Facet loading failed... TODO Handle this case?");
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
				"change:queryFactory": factoryChangeHandler,
				"destroy": destroyHandler 
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
		fetchFacets: function(concept) {
			var self = this;
		
			var sampleSize = null; //50000;
			var facetVar = sparql.Node.v("__p");
			var countVar = sparql.Node.v("__c");
			
			var query = queryUtils.createQueryFacetCount(concept, facetVar, countVar, this.isInverse, sampleSize);

			var myDataTemplate = function(binding) {
				
				
				
				// TODO Create a copy of the facet manager excluding the constraints on this path.
				
				//var element = concept.getElement();
				
				var prefix = self.isInverse ? "<" : "";
			
				var result = {
					id: "simple_" + prefix + binding.facetName.value,
					type: "property",
					facetUri: binding.facetName.value,
					facetCount: binding.facetCount.value,
					isInverse: self.isInverse,
					concept: null
				};
				
				//console.log("Binding:", result);
				return result;
			};
			
			var myDataBinding = {
				facetName: facetVar.value,
				facetCount: countVar.value
			};
			
			
//				console.log("Query: " + query);
			
			var dataProviderFactory = new facets.DataProviderFactoryQuery(this.sparqlService, function(x) { return x; });
			
			var dataProviderTmp = dataProviderFactory.createDataProvider(query);


			var postProcessor = DataTemplate.Sparql.createPostProcessor(myDataTemplate, myDataBinding);
			var dataProvider = new facets.DataProvider.Pipe(dataProviderTmp, postProcessor);

			var promise = dataProvider.fetchData();			

//				dataProviderTmp.fetchData().done(function(x) { console.log("YEAH", JSON.stringify(x)); });
//				promise.done(function(x) { console.log("YEAH", JSON.stringify(x)); });
			
			return promise;
		}
	};
				

	// A fact provider returns a promise that yields the name of the facet plus a concept for its values.
	// { type: name: concept: } 
				
				
	ns.ModelFacetUpdater = function(facetProviders) {
		this.facetProviders = facetProviders;
	};


	ns.ModelFacetUpdater.prototype = {
		updateFacets: function(model, concept) {
		
			// If the node is not expanded, we omit it
			var isExpanded = model.get("isExpanded");
			if(!isExpanded) {
				return;
			}

			var children = model.get("children");		
			var syncer = new backboneUtils.CollectionCombine(children);
		
		
			// Get the facets of the concept
			var promises = _.map(this.facetProviders, function(facetProvider) {
				var promise = facetProvider.fetchFacets(concept);
				return promise;
			});
			
			model.set({isLoading : true});
			$.when(promises, function() {
				model.set({isLoading : false});
			});
			
			

			syncer.sync(promises);
		}

	};

	ns.ViewFacetItem = Backbone.View.extend({
	    tagName: 'li',
	    //attributes: {style: 'float: left'},
	    initialize: function(){
	      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	      this.model.bind('change', this.render, this);
	      this.model.bind('remove', this.unrender, this);
	      
	      
	      this.facetValuesView = null;
	      
	    },
	    events: {
	    	'click .expandable': function() {
	    		var model = this.model;
	    	
	    		model.set({isExpanded: true});
	    		
	    		
	    		//console.log("Facet Model: ", model.attributes);
	    		
	    		modelFacetUpdater.updateFacets(model, concept);
	    		
	    		
	    		var facetNode = model.get("facetNode");
	    		var facetManager = facetNode.copyExcludeThis();
	    		
	    		
	    		
	    		//var subFm = facetManager.copyExcludePath(model.id);
	    		
	    		var queryFactory = new QueryFactoryFacetManager(concept, subFm);
	    		
	    		var dataFetcher = dataFetcherFactory.create(queryFactory);
	    		
	    		
	    	} 
	    },
	    render: function() {
	    	var foo = JSON.stringify(this.model.attributes);
	    	var text = this.model.get("facetUri");
	    	var html = '<a class="expandable" href="#"><img src="src/main/resources/osm-logo-small.png" />' + text + '</a>';
	    
	    	
	      $(this.el).html(html); 
	      return this;
	    },
	    unrender: function() {
	      $(this.el).remove();
	    },
	    remove: function() {
	      this.model.destroy();
	    }
	});


	/**
	 * A collection for contraints.
	 *
	 * For simplicity this is a flat collection.
	 * TODO Explain how to update a query factory from it
	 *
	 */
	ns.ContraintCollection = Backbone.Collection.extend({
	});
	
	
	ns.createFacetNodes = function(constraintCollection, rootFacetNode) {
	
		constraintCollection.each(function(model) {
			var path = model.get("path");
			var constraint = model.get("constraint");
			
			var node = rootFaceNode.forPath(path);
			node.addConstraint(contraint);
		});
	
	};


	/**
	 * ModelConstraints should be treated immutable!
	 *
	 */
	ns.ModelConstraint = Backbone.Model.extend({
		defaults: {
			path: null, // The path the contraint applies to
			constraint: null // Constraint data
		}
	});


	ns.facetTest = function() {
	
		var sparqlService = new backend.SparqlServiceHttp(
			"http://localhost:8810/sparql",
			[],
			"lib/SparqlProxyPHP/current/sparql-proxy.php",
			"service-uri");
	
	
		var v = sparql.Node.v("s");
		var element = new sparql.ElementString("?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [v]);		

		var concept = new facets.ConceptInt(element, v);
		var queryGenerator = new facets.QueryGenerator(concept); 
		var queryFactoryConcept = new facets.QueryFactoryQueryGenerator(queryGenerator);

		var queryFactoryFacets = facets.QueryFactoryFacets.create(queryFactoryConcept, v.value);
		
		
		var constraintManager = queryFactoryFacets.getConstraintManager();
		var rootFacetNode = queryFactoryFacets.getRootFacetNode();

		var facetFacade = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);
		
		
		//var amountPath = facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project http://example.org/beneficiary http://ex.org/amount");
		//var cityPath = facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project http://example.org/beneficiary http://ex.org/city");
		
		if(false) {
			var yearPath = facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/year");
			
			{
				var nodeValue = sparql.NodeValue.makeNode(sparql.Node.uri("http://dbpedia.org/resource/year/2008"));
				var constraint = facets.ConstraintUtils.createEquals(yearPath, nodeValue);
				constraintManager.addConstraint(constraint);			
			}
		}

		facetFacade
			.forPathStr("http://fp7-pp.publicdata.eu/ontology/year")
			.addConstraint({
				type: "equals",
				node: sparql.Node.uri("http://dbpedia.org/resource/year/2008")
			});
		
		
		/*
		{
			var nodeValue = sparql.NodeValue.makeNode(sparql.Node.forValue(1000));
			var constraint = facets.ConstraintUtils.createEquals(amountPath, nodeValue);
			constraintManager.addConstraint(constraint);
		}

		{
			var nodeValue = sparql.NodeValue.makeNode(sparql.Node.uri("http://ex.org/Leipzig"));
			var constraint = facets.ConstraintUtils.createEquals(cityPath, nodeValue);
			constraintManager.addConstraint(constraint);
		}
		*/



		// TODO Maybe concepts should really be used at the level of the DataFetcher rather than the QueryFactory level:
		// Note: (Concept)DataFetcher is then in the workflow between DataProvider and QueryFactory:
		// The DataProvider wraps the whole configuration, and calls the dataFetcher which makes use of the QueryFactories.
		// dataFetcher.fetchDataFor(concept);
		// If we have an external concept, we may have to chunk the items; rather than directly creating a query from them. 


		var tableModel = new facets.TableModelQueryFactory(queryFactoryFacets);
		tableModel.setLimit(10);
				
		var queryFactoryKeyword = new facets.QueryFactoryKeyword(tableModel, [v]);			

		//var executor = new facets.ExecutorQueryFactory(sparqlService, queryFactoryKeyword);
		//var dataProviderTmp = new facets.DataProvider.Executor(executor);
		
		//var postProcessor = DataTemplate.Sparql.createPostProcessor(myDataTemplate, myDataBinding);
		//var searchDataProvider = new facets.DataProvider.Pipe(dataProviderTmp, postProcessor);
		
		
		// The idea is to have views on the ModelFacetNode objects.
		// These views can then wrap the node's corresponding queryFactory to add limit/offset/search


		
		
		
		
		var modelFacetNode = new facets.ModelFacetNode({
			baseQueryFactory: tableModel,
			//facetManager: new 
		});
		
		
		

	
		
		var facetProviders = [
			new facets.FacetProviderSimple(sparqlService, false)
		];
		
		
		
		var modelFacetUpdater = new facets.ModelFacetUpdater(facetProviders);
		
		var rootModel = new facets.ModelFacetNode();

		
	
	
	

		var facetItemRenderer = new widgets.RendererItemView(
				{},
				null,
				facets.ViewFacetItem,
				{
					label: "simpleLabel"
				}
		);

		var rootCollection = rootModel.get("children");

		this.facetWidget = new widgets.ListView({
			el: $("#facets"), 
			collection: rootCollection, 
			itemRenderer: facetItemRenderer
		});

		rootModel.set("isExpanded", true);
		
		/*
		
		
		/*
		 * SimpleFacetFacade sff = new SimpleFacetFacade(baseConcept);
		 * sff.forPathStr(...).
		 * 
		 * /
		
		
		console.log("Concept:", conc);
		*/
		//var es = constraintManager.createElements(rootFacetNode);
		//var es = facetFacade.createElements();
		var es = facetFacade.forPathStr("http://fp7-pp.publicdata.eu/ontology/year").createElements();
		
		es.push(concept.getElement());
		var e = new sparql.ElementGroup(es);
		
		var v = rootFacetNode.forPath(facets.Path.fromString("")).getVariable();
		var conc = new facets.ConceptInt(e, v);

		
		modelFacetUpdater.updateFacets(rootModel, conc);
	
		
		var labelFetcher = new labelUtils.LabelFetcher(sparqlService);

		{
			var queryGenerator = new facets.QueryGenerator(conc); 
			var queryFactory = new facets.QueryFactoryQueryGenerator(queryGenerator);
			
			
			
			var models = createQueryBrowser(sparqlService, labelFetcher);
			
			var tableModel = models.browseConfig.config.tableModel;
			tableModel.set({queryFactory: queryFactory});
		
			
			var container = $('#instances');
			container.children().remove();
			createView(container, models);
		}		
		
		

	};


	
	/*
	var FacetMasterView = Backbone.View.extand({
		    tagName: 'li',
		    attributes: {style: 'float: left'},
		    initialize: function(){
		      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

		      this.model.bind('change', this.render, this);
		      this.model.bind('remove', this.unrender, this);
		    },
		    render: function() {
				var children = model.get("children");
				
				
		    
		    	var html = JSON.stringify(this.model.attributes);
		      $(this.el).html(html); 
		      return this;
		    },
		    unrender: function() {
		      $(this.el).remove();
		    },
		    remove: function(){
		      this.model.destroy();
		    }	
	});
	 */


})();