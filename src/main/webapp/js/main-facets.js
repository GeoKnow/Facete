	//TODO: Get rid of these global variables
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
//				"http://fp7-pp.publicdata.eu/sparql",
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
		// FIXME Rename to rootFacetFacadeNode
		var rootFacetNode = queryFactoryFacets.getRootFacetNode();

		var facetFacade = new facets.SimpleFacetFacade(constraintManager,
				rootFacetNode);

		
		
		// The backbone collection for constraints
		var constraintCollection = new facets.ConstraintCollection2();
		

		/* 
		 * The "table model" is a query factory, but provides functions
		 * for setting limit/offset and additional elements on the created query
		 */
		var tableModel = new facets.TableModelQueryFactory(queryFactoryFacets);
		tableModel.setLimit(10);




		// A facet provider enables fetching the facets for a specific concept
		var facetProviders = [
		    new facets.FacetProviderSimple(sparqlService, false),
		    //new facets.FacetProviderSimple(sparqlService, true)
		];

		// The update actually updates model objects
		// TODO: This won't work like that

		// Paramaters to add:
		// constraintCollection | or at least a constraintCollectionProvider
		// 
		var modelFacetUpdater = new facets.ModelFacetUpdater(facetProviders, concept, constraintCollection);

		var rootModel = new facets.ModelFacetNode({
			facetFacadeNode: rootFacetNode
		});

		var rootCollection = rootModel.get("children");
		// console.log("Root Collection: ", rootCollection);

		var collectionColumns = new facets.CollectionColumns(); 		
		collectionColumns.addPath(facets.Path.fromString(""));

		
		this.facetWidget = new widgets.ViewFacetTree({
			el : $("#facets"),
			collection: rootCollection,
			// options: {
			modelFacetUpdater: modelFacetUpdater,
			collectionColumns: collectionColumns
		// }
		});
		
		
		
		// Add the path to the collectionColumns
//		this.facetWidget.on('addToTable', function(ev, view) {
//			var path = view.model.get('facetFacadeNode').getPath();			
//			collectionColumns.addPath(path); 
//		});

		// FIXME: We need to set the state for the facets
		// of whether it was already added as a column to the table
		
		

		//collectionColumns.on('add', funct)
		

		// This controller injects the projection into a query:
		// First, based on collectionColumns, a pair is returned,
		// containing
		// - the element
		// - the list of variables
		// - a mapping from varName To path 
		//
		var controllerColumnSelection = new facets.ControllerColumnSelection(collectionColumns);
		
		

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

		var selectionCountSync = new facets.ControllerSelectionCountSync(constraintCollection, rootModel);

		
		
		
		/**
		 * Based on the constraint collection, we infer the check model
		 * 
		 * 
		 */
/*
		var CollectionConstraintChecked = Backbone.Collection.extend({

		});

		CollectionConstraintChecked.create = function(constraintCollection)
		{

			constraints.on("add", function(model) {

			});

		};
*/
		
		
		
		
		
		
		
				
		

		var labelFetcher = new utils.LabelFetcher(sparqlService, ['de', 'en', '']);

		
		var models;
		{
			var queryGenerator = new facets.QueryGenerator(conc);
			var queryFactory = new facets.QueryFactoryQueryGenerator(
					queryGenerator, {
						distinct : true
					});

			models = createQueryBrowser(sparqlService, labelFetcher);
			//console.log("models:", models);
			
			models.browseConfig.config.paginatorModel.set('maxSlotCount', 5);
			
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
							// TODO Make sure that this does not fail
							//console.log("No constraint available - should not happen");
							return [];
						}
						
						var node = constraint.node;
						var c2;
						if(node.isUri()) {
							c2 = $('<span data-uri="' + node.value + '" />');
							foobarI18N.update(c2);

						} else {
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
		
			//console.log("INIT VIEWS", models);
		
			
			// FIXME: This syncher updates the tableModel based on changes in the constraint collection
			// However, we also need to update the list based on collectionColumns.
			var ctrlInstaceListSyncer = new facets.ControllerInstanceListSyncer(
					queryFactory,
					rootFacetNode,
					constraintCollection,
					collectionColumns,
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
		
			if(true) {
				// FIXME Fetching of markers disabled
				//return;
			}
			
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
		

		
		
		
		var $elCenterOnMap = $('#centerMapOnPosition');
		
		$elCenterOnMap.on('click', function(ev) {
			ev.preventDefault();
			
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					var map = mapView.getMap();

					var coords = position.coords;
					var center = new OpenLayers.LonLat(coords.longitude, coords.latitude);
				
					center.transform(map.displayProjection, map.projection);

					 
					map.setCenter(center, 10);
				}, function() {
					  
				});
			} else {
				// TODO Disable the button and indicate that the functionality is not available
				// e.g. Grey out the button and add a tooltip
				//$elCenterOnMap
			}
			
		});


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

