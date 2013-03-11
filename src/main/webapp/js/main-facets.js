	var foobarI18N;
	var foobarTableModel;

(function() {

	var backend = Namespace("org.aksw.ssb.backend");
	var facets = Namespace("org.aksw.ssb.facets");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var utils = Namespace("org.aksw.ssb.utils");
	var widgets = Namespace("org.aksw.ssb.widgets");

	var ns = facets;




	ns.facetTest = function() {

		var sparqlService = new backend.SparqlServiceHttp(
				"http://localhost:8810/sparql",
				[ "http://fp7-pp.publicdata.eu/" ],
				"lib/SparqlProxyPHP/current/sparql-proxy.php", "service-uri");

//		var sparqlService = new backend.SparqlServiceHttp(
//				"http://fts.publicdata.eu/sparql",
//				[ "http://fts.publicdata.eu/" ],
//				"lib/SparqlProxyPHP/current/sparql-proxy.php", "service-uri");

		var v = sparql.Node.v("s");
		var element = new sparql.ElementString(
				"?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [ v ]);
//		var element = new sparql.ElementString(
//				"?s a <http://fts.publicdata.eu/ontology/Commitment>", [ v ]);

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

		var facetProviders = [
		    new facets.FacetProviderSimple(sparqlService, false),
		    //new facets.FacetProviderSimple(sparqlService, true)
		];

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

		
		
		
		
		
		
		
				
		

		var labelFetcher = new utils.LabelFetcher(sparqlService, ['de', 'en', '']);

		
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
			models.browseConfig.collection = new facets.CollectionItemCheckConstraint();
			
			createView(container, models, function(options) {

				var result = new widgets.TableView2({
					collection : options.collection,
					rowItemRenderer: function(model) {
						var c1 = new widgets.ViewItemCheckConstraint({
							model: model,
							constraintCollection: constraintCollection
						});
						
						var constraint = model.get('constraint');
						if(!constraint) {
							console.log("No constraint available - should not happen");
							return [];
						}
						
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
		



		var controllerFacetValueEnricher = new facets.ControllerFacetValueEnricher(constraintCollection, rsCollection);
		
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
		var rsTableModel;
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
			rsTableModel = tableModel;
			tableModel.set({
				queryFactory : queryFactory
			});

			var container = $('#instances');
			container.children().remove();

			
			createView(container, models);
		
		
			
			
			var ctrlInstaceListSyncer = new facets.ControllerInstanceListSyncer(
					queryFactory,
					rootFacetNode,
					constraintCollection,
					tableModel
			);

			
			
			
		}
			
		
		
		
		/*
		 * Add the map view
		 * 
		 * 
		 */
		
		/*		
		var MarkerModel = Backbone.Model.extend({
			id: "http://example.org/defaultid",
			data: {}
		});
		*/
		
		
		
		var mapModel = new facets.MapModel();
		
		var mapView = new widgets.MapView({
			el: $("#map"),
			model: mapModel
		});

		mapView.on("mapevent", function() {
			console.log("mapevent");
		});
		
		mapView.on("markerclick", function(ev, data) {
			//console.log("click", ev, data);
			var id = data.id;
			var json = data.json;
			
			alert("Clicked " + id + " with data " + JSON.stringify(json));
		});
		
		mapView.render();
		
		
		
		var geoPathStr = "http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/city http://www.w3.org/2002/07/owl#sameAs";
		var geoPath = facets.Path.fromString(geoPathStr);
		

		
		var sparqlServicePaginated = new backend.SparqlServicePaginator(sparqlService, 1000);
		var queryCacheFactory = new utils.QueryCacheFactory(sparqlServicePaginated);
		var geomPointFetcher = new utils.GeomPointFetcher(queryCacheFactory);

		
		
		rsTableModel.on('change:queryFactory', function(model) {
			
			var constraintManager = constraintCollection.createConstraintManager(rootFacetNode);
			//var queryFactory = new facets.QueryFactoryFacets(this.subQueryFactory, this.facetNode, constraintManager); //queryFactoryFacets.getConstraintManager();
			
			
			var hack = facetFacade.forPath(geoPath);
			hack.constraintManager = constraintManager; 
			
			var concept = hack.createConcept();
			var varName = concept.getVariable().value;
			var query = queryUtils.createQuerySelect(concept, {distinct: true});
			
			console.log("GEO QUERY" + query);
			
			var promise = sparqlServicePaginated.executeSelect(query).pipe(function(jsonRs) {

				var uris = _.map(jsonRs.results.bindings, function(binding) {
					return sparql.Node.uri(binding[varName].value);
				});
				
				//console.log("Related geomtery uris: ", uris.length, uris);
				
				var promise = geomPointFetcher.fetch(uris).pipe(function(uriToPoint) {

					var rdfGraph = {};
					
					_.each(uriToPoint, function(point, uri) {
						rdfGraph[uri] = {
								'http://www.w3.org/2003/01/geo/wgs84_pos#long': [{value: point.x}],
								'http://www.w3.org/2003/01/geo/wgs84_pos#lat': [{value: point.y}],
								//'http://www.w3.org/2000/01/rdf-schema#label': ['value: unnamed']
						};
					});

					return rdfGraph;
				});
				
				return promise;
			});
			
			promise.done(function(rdfGraph) {
				
				//console.log("RDF GRAPH:", rdfGraph);
				
				var uris = _.keys(rdfGraph);
				
				mapModel.set({uris: uris, json: rdfGraph});
			});
			
		
			
		});
		
		rsCollection.on('reset', function(collection) {
			//Highlight the markers on the map
			
			// FIXME Get the query (factory) for the result set.
			//queryFactory
		});
		
		
		

		/* Does not work; Open Layers needs a non-zero size area to init
		var $mapEl = mapView.render().$el;
		$('#map').append($mapEl);
		*/
		
		
		
		
		
		foobarI18N = new utils.SpanI18n(labelFetcher);
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

