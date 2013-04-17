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


	
    ns.nodesToAutocomplete = function(nodes) {
		var result = [];
        for(var i = 0; i < nodes.length; ++i) {

            var node = nodes[i];
            var uri = node.value;

            var item = {
                id: uri,
                text: uri
            };
            result.push(item);
        }
        return result;
    };



	ns.facetTest = function(options) {
		
		/*
		 * Toggle button for the config section 
		 */
		$("#btn-open-settings").click(function(ev) {
			$("#div-settings").slideToggle();
			ev.preventDefault();
		});
		
		
/*
		var sparqlServiceUri = options.sparqlServiceUri;
		var defaultGraphUris = options.defaultGraphsUris;
		var concept = options.concept;
		var state = options.state; // State is a generic object holding the application state
*/

		// Maybe we want such global model?
		var appContext = new Backbone.Model({
			defaults: {
				
			}
		});
		
		var configModel = new Backbone.Model({
			defaults : {
				sparqlServiceIri: "",
				defaultGraphIris: []
			}
		});
		
		var sparqlService;

		configModel.on('change', function() {
			var sparqlServiceIri = this.get('sparqlServiceIri');
			var defaultGraphIris = this.get('defaultGraphIris');
			
			sparqlService = new backend.SparqlServiceHttp(
						sparqlServiceIri,
						defaultGraphIris,
						"lib/SparqlProxyPHP/current/sparql-proxy.php",
						"service-uri");
			
		});
		
		
        var $elDefaultGraphSelector = $('#default-graph-selector');

        var defaultGraphCollection = new Backbone.Collection();

		
		configModel.on('change:sparqlServiceIri', function() {
			var sparqlServiceIri = this.get('sparqlServiceIri');
			//var sparqlService = new backend.SparqlServiceHttp(sparqlServiceIri);
			var sparqlService = new backend.SparqlServiceHttp(
					sparqlServiceIri,
					[],
					'lib/SparqlProxyPHP/current/sparql-proxy.php',
					'service-uri'
			);
			
			var qe = queryUtils.fetchDefaultGraphs(sparqlService);
			qe.pipe(ns.nodesToAutocomplete).done(function(list) {
				defaultGraphCollection.reset(list);
			});
		});

		defaultGraphCollection.on('add remove reset', function() {
			var tags = this.toJSON();
			console.log("tags: ", tags);
            $elDefaultGraphSelector.select2({tags: tags});
		});
		
		
		$elDefaultGraphSelector.on('change', function(ev) {
			var data = $elDefaultGraphSelector.select2('data');
			var defaultGraphIris = [];
			for(var i = 0; i < data.length; ++i) {
				var item = data[i];
				var graphIri = item.id;

				defaultGraphIris.push(graphIri);
			}
			
			//defaultGraphCollection.reset(data);
			configModel.set({defaultGraphIris: defaultGraphIris});
		});
		
		
		/*
		 * TODO Initialize a collection with the master catalog service IRIs
		 */
		//SELECT Distinct ?o WHERE {?s <http://www.w3.org/ns/dcat#accessURL> ?o . Filter(regex(?o, '/sparql', 'i')) . }
		var catalogServiceConfig = {
			serviceUri: 'http://semantic.ckan.net/sparql',
			defaultGraphUris: ['http://datahub.io']
		};
		
		var catalogSparqlService = new backend.SparqlServiceHttp(
				catalogServiceConfig.serviceUri,
				catalogServiceConfig.defaultGraphUris,
				'lib/SparqlProxyPHP/current/sparql-proxy.php', 'service-uri');
		

		//var sparqlServiceUri = "http://localhost:5522/sparql-analytics/api/sparql";
		//var sparqlServiceUri = "http://fp7-pp.publicdata.eu/sparql-analytics/api/sparql";
		
		/*
		var sparqlService = new backend.SparqlServiceHttp(
//				"http://fp7-pp.publicdata.eu/sparql",
				sparqlServiceUri,
				[ "http://fp7-pp.publicdata.eu/" ],
				"lib/SparqlProxyPHP/current/sparql-proxy.php", "service-uri");
		*/
		
		configModel.set({
			sparqlServiceIri: "http://localhost:8810/sparql",
			defaultGraphIris: []
		});


		//var catalogSparqlService =
		var collectionMasterCatalogServiceIris = ['http://semantic.ckan.net/sparql'];

		/*
		 * GUI controls for SPARQL service selection 
		 * 
		 */
                var scheduler = new Scheduler(1000);

        var $elSparqlServiceSelector = $("#sparql-service-selector");
        $elSparqlServiceSelector.select2({
	        minimumInputLength: 1,
	        query: function (query) {
	        	var term = query.term;
	        
			var sparqlQueryString = "Select Distinct ?o WHERE {?s <http://www.w3.org/ns/dcat#accessURL> ?o . Filter(Regex(?o, '" + term + "', 'i')) . Filter(IsUri(?o)) . } Limit 10";

			scheduler.schedule(function() {
				var qe = catalogSparqlService.executeSelect(sparqlQueryString);

		        qe.done(function(jsonRs) {
			        var bindings = jsonRs.results.bindings;
	
	                var data = {
	                    results: []
	                };
	
	                // Add the current input as an option
	                data.results.push({
	                    id: 0,
	                    text: term
	                });
	
	
	                for(var i = 0; i < bindings.length; ++i) {
	                    var binding = bindings[i];
	                    var iri = binding.o.value;
	                    var item = {
	                        id: iri,
	                        text: iri
	                    };
	                    data.results.push(item);
	                }
	                query.callback(data);
	            });
            });
	        }
	    });
        
        $elSparqlServiceSelector.on('change', function(ev) {
        	var sparqlServiceIri = ev.val;
        	configModel.set({sparqlServiceIri: sparqlServiceIri});
        });



    var handlers = [1, 8, 12, 14];
    var colors = ["#ff0000", "#00ff00", "#0000ff", "#00ffff"];
    //updateColors(handlers);

    var $elLodSlider = $('.lod-slider');
    $elLodSlider.slider({
        range: true,
        animate: true,
        step: 1,
        min: 0,
        max: 18,
        values: handlers,
        slide: function(event, ui) {
            console.log(ui);
/*            if ( (ui.values[0] + 20) >= ui.values[1] ) {
                return false;
            }*/
        }
/*        slide: function (evt, ui) {
alert("foobar");
            //updateColors(ui.values);
        }*/
    });



		var v = sparql.Node.v("s");

		var geoPathStr = "http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/city http://www.w3.org/2002/07/owl#sameAs";

		var element = new sparql.ElementString(
				"?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [ v ]);
		
		element = new sparql.ElementString("?s ?p ?o", [v]);
		//element = null;

/*
		var sparqlService = new backend.SparqlServiceHttp(
//				"http://fp7-pp.publicdata.eu/sparql",
				"http://localhost:8810/sparql",
				[ "http://localhost/wkdgeo" ],
				"lib/SparqlProxyPHP/current/sparql-proxy.php", "service-uri");
		var geoPathStr = "";

		var element = new sparql.ElementString("?s a <http://geovocab.org/spatial#Feature>", [ v ]);
		//var element = new sparql.ElementString("?s a <http://www.w3.org/2004/02/skos/core#Concept>", [ v ]);
*/
		
//		var sparqlService = new backend.SparqlServiceHttp(
//				"http://fts.publicdata.eu/sparql",
//				[ "http://fts.publicdata.eu/" ],
//				"lib/SparqlProxyPHP/current/sparql-proxy.php", "service-uri");

		
		
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
		var rootFacetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);

		
		
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
		    new facets.FacetProviderSimple(sparqlService, false)
		    //new facets.FacetProviderSimple(sparqlService, true)
		];

		// The update actually updates model objects
		// TODO: This won't work like that

		// Paramaters to add:
		// constraintCollection | or at least a constraintCollectionProvider
		// 
		var modelFacetUpdater = new facets.ModelFacetUpdater(facetProviders, concept, constraintCollection, sparqlService);

		
		var metaFacetCollection = new ns.CollectionFacetNode();
		
		console.log("FacetFacadeNode: ", rootFacetFacadeNode);
		var rootModel = new facets.ModelFacetNode({
			facetFacadeNode: rootFacetFacadeNode
		});
		
		//var rootCollection = rootModel.get("children");
		var rootCollection = metaFacetCollection;
		// console.log("Root Collection: ", rootCollection);

                /*
                 * Model for which facets are mapped to table columns
                 */
		var collectionColumns = new facets.CollectionColumns(); 		
		collectionColumns.addPath(facets.Path.fromString(""));

		
		/*
		this.facetWidget = new widget.ViewItemFacet({
			el : $("#facets"),
		});
		*/
		
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
		var es = rootFacetFacadeNode.forPathStr("").createElements();
		
		
		// console.log("es", es);

		var conceptElement = concept.getElement();
		es.push(conceptElement);
		// console.log("plu concept element", conceptElement);

		var e = new sparql.ElementGroup(es);

		// console.log("Final element: " + e);

		// var v =
		// rootFacetNode.forPath(facets.Path.fromString("")).getVariable();
		var v = rootFacetFacadeNode
				.forPath(
						facets.Path
								.fromString("")) //"http://fp7-pp.publicdata.eu/ontology/year"))
				.getVariable();
		var conc = new facets.ConceptInt(e, v);		
		
		
		//modelFacetUpdater.updateFacets(rootModel, facetFacade);

		var fnUpdateFacets = function() {
			var constraintManager = constraintCollection.createConstraintManager(rootFacetNode);
			var facetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);
			
			modelFacetUpdater.updateFacets(rootModel, facetFacadeNode);
		};

		fnUpdateFacets();
		
		constraintCollection.on('add remove reset', fnUpdateFacets);
		
		
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
			
			
			var hack = rootFacetFacadeNode.forPath(geoPath);
			hack.constraintManager = constraintManager; 
			
			var concept = hack.createConcept();
			var varName = concept.getVariable().value;
			var query = queryUtils.createQuerySelect(concept, {distinct: true});
			
			console.log("GEO QUERY" + query);
			
			var promise = sparqlServicePaginated.executeSelect(query).pipe(function(jsonRs) {

				//console.log("jsonRs", jsonRs);
				
				var uris = _
					.chain(jsonRs.results.bindings)
					.filter(function(binding) {
						return varName in binding && binding[varName] && binding[varName].type === 'uri';
					})
					.map(function(binding) {
						//console.log("Binding: ", binding);
						return sparql.Node.uri(binding[varName].value);
					})
					.value();
				
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


		metaFacetCollection.add(rootModel);
		rootModel.set("isExpanded", true);


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

		
		/* CSV export */

		var semmapServiceUri = "http://localhost/semmap/service";
		
		var btnExportCsv = $('#exportCsv'); 
		rsTableModel.on('change:queryFactory', function(model) {
			var queryFactory = model.get('queryFactory');
			
			var query = queryFactory.createQuery();
			var queryString;
			if(query) {
				queryString = "" + query;
			} else {
				queryString = "Select * { ?s ?p ?o . Filter(FALSE) }";
			}
			
			var data = {
				'service-uri': sparqlServiceUri,
				'query': queryString
			};
			var qs = $.param(data);

			var href = semmapServiceUri + "/exportCsv?" + qs;
			
			
			btnExportCsv.attr('href', href);
		});

		
		var btnExportRdf = $('#exportRdf'); 
		rsTableModel.on('change:queryFactory', function(model) {
			var queryFactory = model.get('queryFactory');
			
			var query = queryFactory.createQuery();
			var queryString;
			if(query) {
				queryString = "" + query;
			} else {
				queryString = "Select * { ?s ?p ?o . Filter(FALSE) }";
			}
			
			var data = {
				'service-uri': sparqlServiceUri,
				'query': queryString
			};
			var qs = $.param(data);

			var href = semmapServiceUri + "/exportRdf?" + qs;
			
			
			btnExportRdf.attr('href', href);
		});
		
		
		/*
		var btnPrepareExportCsv = $('#prepareExportCsv');
		var btnExportCsv = $('#exportCsv'); 
		btnPrepareExportCsv.click(function() {
			//alert("test");
			//btnExportCsv.attr('href', 'data:text/csv;base64,'+Base64.encode("3;2;1"));
			btnExportCsv.attr('href', 'data:text/csv;utf8,3;2;1');
		});
		 */
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

