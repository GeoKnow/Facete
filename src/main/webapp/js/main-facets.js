	//TODO: Get rid of these global variables
	var foobarI18N;
	var foobarTableModel;

	
Backbone.linkModels = function(sourceModel, targetModel, properties) {
		
	var fnCopy = function(property) {
		var val = this.get(property);
		
		var data = {};
		data[property] = val;
		
		targetModel.set(data);
	};

	for(var i = 0; i < properties.length; ++i) {
		var property = properties[i];
	
		fnCopy.call(sourceModel, property);
		
		sourceModel.on('change:' + property, function() {
			fnCopy.call(this, property);
		});
	}
};
	
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


	/**
	 * Initialize the user interface
	 * TODO This is domain specific, so this routine should be part of a framework.
	 * 
	 */
    ns.initUi = function(configModel) {

    	/*
		 * Toggle button for the config section 
		 */
		$("#btn-open-settings").click(function(ev) {
			$("#div-settings").slideToggle();
			ev.preventDefault();
		});
    	
		

        var $elDefaultGraphSelector = $('#default-graph-selector');

        var defaultGraphCollection = new Backbone.Collection();

		
		configModel.on('change:sparqlService', function() {
			var sparqlService = this.get('sparqlService');
			/*
			var sparqlServiceIri = this.get('sparqlServiceIri');
			//var sparqlService = new backend.SparqlServiceHttp(sparqlServiceIri);
			var sparqlService = new backend.SparqlServiceHttp(
					sparqlServiceIri,
					[],
					'lib/SparqlProxyPHP/current/sparql-proxy.php',
					'service-uri'
			);
			*/
			
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
	

    };

    
	ns.facetTest = function(options) {
		
    	var v = sparql.Node.v("s");
		var element = new sparql.ElementString(
				"?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [ v ]);
		
		element = new sparql.ElementString("?s ?p ?o", [v]);
		var concept = new facets.ConceptInt(element, v);

		

		
		
		
		var ModelConfigSparqlService = Backbone.Model.extend({
			defaults: {
				sparqlServiceIri: "http://localhost:8010/sparql",
				defaultGraphIris: [],
				preferredLanguages: ['de', 'en', ''],
			
				/*
				 * Services based on above properties
				 */
				sparqlService: null,
				labelFetcher: null,
			}
		});

		
		var ModelConfigConcept = ModelConfigSparqlService.extend({
			defaults: {
				concept: concept,
				constraintCollection: new facets.ConstraintCollection2()				
			}
		});

		/*
		var ModelConfigFacetValue = ModelConfigConcept.extend({
			defaults: {
				facetProviders: null,
			}
		});
		*/


		var ModelConfigFacetValues = ModelConfigConcept.extend({
			defaults: {
				facetNode: null
			}
		});
		
		var ModelConfigDataTable = ModelConfigConcept.extend({
			defaults: {
				collectionColumns: new facets.CollectionColumns() 		
			},
			
			initialize: function() {
				this.get('collectionColumns').addPath(facets.Path.fromString(""));
			}
		});
		
		
		/*
		 * This model should hold all information required to instanciate the browsing
		 * component
		 */
		var ConfigModel = Backbone.Model.extend({
			defaults: {
				sparqlServiceIri: "http://localhost:8810/sparql",
				defaultGraphIris: [],
				facetProviders: [],
				concept: concept,
				rootFacetNode: facets.FacetNode.createRoot(concept.getVariable().getValue()),
				constraintCollection: new facets.ConstraintCollection2(),
				preferredLanguages: ['de', 'en', ''],
				
				collectionColumns: new facets.CollectionColumns(),
		
				/*
				 * Services based on above properties
				 */
				sparqlService: null,
				labelFetcher: null,
				facetUpdater: null,
				i18n: null
			}
		});

		
		
		var configModel = new ConfigModel();

    	var geoPathStr = "http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/city http://www.w3.org/2002/07/owl#sameAs";
		var geoPath = facets.Path.fromString(geoPathStr);

		
		// Initialize the user interface
		// TODO Move to a different place
		ns.initUi(configModel);
		
		
		ns.initServices(configModel);

		// Init model by triggering a change event
		configModel.trigger('change');		

		
		var facetTree = ns.createFacetTreeView(configModel);
		
		
		ns.createDataTableView(configModel);

		
		//ns.createMapView(configModel, geoPath);

		// Get the models for the facet tree and the data table 
		//var facetedBrowsingModels = ns.createAppInstance(configModel);
		
		//ns.createExportServices(configModel);
		
		//ns.createCenterOnPosition();
		
		
		/*
		 * Wire up the individual components
		 */
		
		var facetValuesConfigModel = new ModelConfigFacetValues({
			defaults: {
				tableModel: null,
			}
		});

		Backbone.linkModels(configModel, facetValuesConfigModel, ['sparqlService', 'labelFetcher', 'concept', 'constraintCollection', 'rootFacetNode', 'i18n']);

		console.log("Linked model: ", facetValuesConfigModel.attributes);
		var facetValues = ns.createFacetValuesView(facetValuesConfigModel);
		
		facetTree.facetWidget.on('facetSelected', function(ev) {
			var facetNode = ev.facetNode;
			
			facetValuesConfigModel.set({
				facetNode: facetNode
			});

			console.log("Select facet: ", facetNode);			
		});
		
	};

    
    ns.initServices = function(configModel) {
    
    	
		/*
		 * Reset services if the configuration changes
		 * 
		 */
		var resetServices = function() {
			var attrs = this.attributes;
			
			console.log("Resetting services - attributes are: ", attrs);
			
			var sparqlService = new backend.SparqlServiceHttp(
					attrs.sparqlServiceIri,
					attrs.defaultGraphIris,
					"lib/SparqlProxyPHP/current/sparql-proxy.php",
					"service-uri");
			
			var labelFetcher = new utils.LabelFetcher(sparqlService, attrs.preferredLanguages);
			
			this.set({
				sparqlService: sparqlService,
				labelFetcher: labelFetcher,
				modelFacetUpdater: new facets.ModelFacetUpdater(attrs.facetProviders, attrs.concept, attrs.constraintCollection, attrs.sparqlService),
				facetProviders: [
				    new facets.FacetProviderSimple(sparqlService, false)
			        //new facets.FacetProviderSimple(sparqlService, true)
			    ],
			    i18n: new utils.SpanI18n(labelFetcher)
			});
		};
		
		configModel.on('change', resetServices);

    };

    
    ns.createDataTableView = function(configModel) {

    	var sparqlService = configModel.get('sparqlService');
    	var labelFetcher = configModel.get('labelFetcher');

    	var concept = configModel.get('concept');
    	var constraintCollection = configModel.get('constraintCollection');
    	
    	var rootFacetNode = configModel.get('rootFacetNode');
    	
    	var collectionColumns = configModel.get('collectionColumns');
    	

		var queryGenerator = new facets.QueryGenerator(concept);
		/*
		var queryFactoryConcept = new facets.QueryFactoryQueryGenerator(
				queryGenerator);

		var queryFactoryFacets = facets.QueryFactoryFacets.create(queryFactoryConcept, concept.getVariable().getValue()); //v.value);

		var constraintManager = queryFactoryFacets.getConstraintManager();
*/
    	
    	
		collectionColumns.addPath(facets.Path.fromString(""));


		/*
		 * This controller injects the projection into a query:
		 * First, based on collectionColumns, a pair is returned, containing:
		 * 
		 * - the element
		 * - the list of variables
		 * - a mapping from varName To path 
		 */		
		var controllerColumnSelection = new facets.ControllerColumnSelection(collectionColumns);

		/*
		var es = rootFacetFacadeNode.forPathStr("").createElements();
		

		var conceptElement = concept.getElement();
		es.push(conceptElement);
		var e = new sparql.ElementGroup(es);

		var v = rootFacetFacadeNode.forPath(facets.Path.fromString("")).getVariable();
		var conc = new facets.ConceptInt(e, v);		
		*/
		


		/*
		 * Initialize the result table list
		 * 
		 */
		var queryFactory = new facets.QueryFactoryQueryGenerator(queryGenerator);
		dataTabelModel = createQueryBrowser(sparqlService, labelFetcher);
		
		var tableModel = dataTabelModel.browseConfig.config.tableModel;
		tableModel.set({
			queryFactory : queryFactory
		});

		var container = $('#instances');
		container.children().remove();

		
		createView(container, dataTabelModel);
	
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

		
    };


    ns.createFacetTreeView = function(configModel) {

		//var rootFacetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);

		// The initial facet collection only has a single model for the empty facet path
		var rootFacetNode = configModel.get('rootFacetNode');
    	var constraintCollection = configModel.get('constraintCollection');
    	var modelFacetUpdater = configModel.get('modelFacetUpdater');
    	var collectionColumns = configModel.get('collectionColumns');

		//var rootFacetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);

    	/**
    	 * 
    	 * @returns A promise that becomes resolved once updating the facets completes. 
    	 */
		var fnUpdateFacets = function(model) {
			var facetNode = model.get('facetNode');
			var modelFacetUpdater = configModel.get('modelFacetUpdater');
			
			var constraintManager = constraintCollection.createConstraintManager(facetNode);
			var facetFacadeNode = new facets.SimpleFacetFacade(constraintManager, facetNode);
			
			var promise = modelFacetUpdater.updateFacets(model, facetFacadeNode);
			return promise;
		};

    	

    	var rootFacetCollection = new ns.CollectionFacetNode({
    		fnUpdateFacets: fnUpdateFacets
    	});
    	
    	var superFacetModel = new facets.ModelFacetNode({
			facetNode: null,
			children: rootFacetCollection
		});
    	//metaFacetModel.get('children').add(rootFacetModel);
    	//fnUpdateFacets(metaFacetModel);


    	
    	//console.log("TEST", modelFacetUpdater);
    	
		console.log("FacetFacadeNode: ", rootFacetNode);
		var rootFacetModel = new facets.ModelFacetNode({
			facetNode: rootFacetNode
		});
		
		// Controller for syncing the number of selected facets in the facet tree
		var selectionCountSync = new facets.ControllerSelectionCountSync(constraintCollection, rootFacetModel);

		

		//fnUpdateFacets(rootFacetNode);
		
		
		// Whenever the constraints change, the facets and facet counts must be updated
		constraintCollection.on('add remove reset', function() {
			fnUpdateFacets(rootFacetModel);
			//fnUpdateFacets(superFacetModel);
		});

		
		/*
		 * View for the facet tree
		 * 
		 * TODO Maybe the view should use a model, and listen for changes in the config
		 */		
		var facetWidget = new widgets.ViewFacetTree({
			el : $("#facets"),
			collection: rootFacetCollection,
			// options: {
			// TODO Add indirection: don't point to a modelFacetUpdate directly, but introduce a function that returns one
			//modelFacetUpdater: modelFacetUpdater,
			fnUpdateFacets: fnUpdateFacets,
			
			// TODO Indirection plus this should be part of a separate controller
			collectionColumns: collectionColumns
			// }
		});
    	
		var self = this;
		facetWidget.on('facetUpdate', function(promise) {
			promise.done(function() {
				var i18n = configModel.get('i18n');
				i18n.update(facetWidget.$el);
			});
		});
		
		
    	rootFacetCollection.add(rootFacetModel);
    	
    	
    	
    	
    	fnUpdateFacets(rootFacetModel);
    	
		var result = {
			facetWidget: facetWidget
		};
			
		return result;
    };

    
    
    ns.createFacetValuesView = function(configModel) {
    	
    	var sparqlService = configModel.get('sparqlService');
    	var labelFetcher = configModel.get('labelFetcher');
    	var concept = configModel.get('concept');
    	var constraintCollection = configModel.get('constraintCollection');
    	
    	var rootFacetNode = configModel.get('rootFacetNode');
    	
    	// This is a hack :/
    	var i18n = configModel.get('i18n');
    	
    	
		// TODO service must be configurable

		var models = createQueryBrowser(sparqlService, labelFetcher);

    	// We need to replace the model for the query result set
		// with our own version that gets special handling because
		// we need to set the 'checked' state for selected facets 
		var sourceCollection = models.browseConfig.collection;
		var targetCollection = new Backbone.Collection();
		models.browseConfig.collection = targetCollection;

		
		var controllerFacetValueEnricher = new facets.ControllerFacetValueEnricher(constraintCollection, targetCollection);

		// FIXME Some configuration - should be done elsewhere
		models.browseConfig.config.paginatorModel.set('maxSlotCount', 5);
		var tableModel = models.browseConfig.config.tableModel;

		
		
		var fnUpdateFacetValues = function() {
			var facetNode = this.facetNode;
			var constraintCollection = this.constraintCollection;
						
			
			// TODO Make a 1-line helper for these three lines
			var constraintManager = constraintCollection.createConstraintManager(rootFacetNode);
			var facetFacadeNode = new facets.SimpleFacetFacade(constraintManager, facetNode);
			var concept = facetFacadeNode.createConcept();
			
			//console.log("FacetValue concept: ", concept);
			
			var queryGenerator = new facets.QueryGenerator(concept);
			var queryFactory = new facets.QueryFactoryQueryGenerator(
					queryGenerator, {
						distinct : true
					}
			);
			
			//console.log("FacetValue Query Factory: ", queryFactory);

			controllerFacetValueEnricher.setFacetNode(facetNode);

			tableModel.set({
				queryFactory : queryFactory
			});			
		};
		
		
		/*
		 * When a facet is selected, create the corresponding concept
		 * and update the facetValue widget
		 * 
		 */
		configModel.on('change', function() {
			var model = this;
			fnUpdateFacetValues.call({
				facetNode: model.get('facetNode'),
				constraintCollection: configModel.get('constraintCollection')
			});			
		});
		
		constraintCollection.on('change', function() {
			fnUpdateFacetValues.call({
				facetNode: configModel.get('facetNode'),
				constraintCollection: configModel.get('constraintCollection')
			});
		});

		
		
		/*
		 * TODO: The result set of the facet-values query must be enriched with the following
		 * information:
		 *
		 * - the path for which the facet-value is obtained
		 * 
		 */
		var facetValueSync = new backboneUtils.ControllerSlaveCollection(
			sourceCollection,
			targetCollection,
			function(model) {
				var result = controllerFacetValueEnricher.process(model);
				return result;
			}
		);
		
		
		
		
    	var container = $('#facetValues');
		container.children().remove();

		
		var facetValuesWidget = createView(container, models, function(options) {

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
						//foobarI18N.update(c2);
						//this.trigger("test");
						i18n.update(c2);

					} else {
						c2 = $('<span>' + node.value + '</span>');
					}
					
					
					
					var result = [c1.render().$el, c2];
					
					return result;
				}
			});
			
			result.on('test', function() {
				alert("yay");
			});
			
			return result;
		});
		
		var result = {
				facetValuesWidget: facetValuesWidget,
				tableModel: tableModel,
		};

		return result;
    };
    
    
    
    // @deprecated - do not use
    ns.createAppInstance = function(configModel) {
		
    	var concept = configModel.get('concept');

		var queryGenerator = new facets.QueryGenerator(concept);
		var queryFactoryConcept = new facets.QueryFactoryQueryGenerator(
				queryGenerator);

		var queryFactoryFacets = facets.QueryFactoryFacets.create(queryFactoryConcept, concept.getVariable().getValue()); //v.value);

		var constraintManager = queryFactoryFacets.getConstraintManager();

		var rootFacetNode = queryFactoryFacets.getRootFacetNode();
		var rootFacetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);

		
		

		/* 
		 * The "table model" is a query factory, but provides functions
		 * for setting limit/offset and additional elements on the created query
		 */
		var tableModel = new facets.TableModelQueryFactory(queryFactoryFacets);
		tableModel.setLimit(10);


						

		

		
		
		

	
		var facetValueModel = ns.createFacetValuesModel();
		var foobarTableModel = facetValueModel.browseConfig.config.tableModel;

		

    };
    
    
    ns.createMapView = function(configModel, geoPath) {		
		
    	
    	var sparqlService = configModel.get('sparqlService');
    	
    	
//		TODO Do we want a marker model? I guess eventually yes.		
//		var MarkerModel = Backbone.Model.extend({
//			id: "http://example.org/defaultid",
//			data: {}
//		});

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
		
		
		
		
		/*
		foobarI18N = new utils.SpanI18n(labelFetcher);


		metaFacetCollection.add(rootModel);
		rootModel.set("isExpanded", true);


		var tmpEl = $(document);
		foobarI18N.update(tmpEl);
		*/

		
		
		

		
	};

	
	
	ns.createCenterOnPosition = function() {
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
	
	
	ns.createExportServices = function() {
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

    


})();

