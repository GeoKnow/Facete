
/* Disable console for browsers without console object, such as IE7 */
if(!window.console) {
	window.console = {
			log: function() { }
	}
}



/**
 * TODO Move this to backboneUtils.
 * 
 */
Backbone.linkModels = function(sourceModel, targetModel, fireNow, properties) {
	
	// Link the life of the target model to that of the source model
	sourceModel.on('remove', function() {
		targetModel.destroy();
	});

	
	if(fireNow) {
		var data = {};
		for(var i = 0; i < properties.length; ++i) {
			var property = properties[i];

			var val = sourceModel.get(property);
			data[property] = val;
		}
		targetModel.set(data);
	}

	
	var fnCopy = function(property) {
		var val = this.get(property);
		
		var data = {};
		data[property] = val;
		
		targetModel.set(data);
	};

	for(var i = 0; i < properties.length; ++i) {
		var property = properties[i];
	
		//fnCopy.call(sourceModel, property);
		(function(property) {
			sourceModel.on('change:' + property, function() {
				fnCopy.call(this, property);
			})
		})(property);
	}	
};




/*
var SparqlBrowseModel = Backbone.Model.extend({
	defaults: {
		sparqlServiceIri: config.sparqlServiceIri,
		sparqlDefaultGraphIris: config.sparqlDefaultGraphIris,
		
	}
});
*/


(function() {

	var backend = Namespace("org.aksw.ssb.backend");
	var facets = Namespace("org.aksw.ssb.facets");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var utils = Namespace("org.aksw.ssb.utils");
	var widgets = Namespace("org.aksw.ssb.widgets");
	var widgetNs = widgets;

	var configNs = Namespace("org.aksw.ssb.config");


	
	widgets.ViewItemConstraintBase = Backbone.View.extend({
		tagName: 'li',
		attributes: { style: 'background-color: #F0F0FF; margin: 5px 0px;'},
			
		initialize : function() {
			_.bindAll(this); //, 'render', 'unrender', 'remove', 'setCheckState'); // every
	    	this.model.on('remove', this.unrender);
	    	
		},		

		render : function() {
			var model = this.model;
			
			var constraint = model.get('constraint');
			
			// TODO Check constraint type - right now we assume equals
			var str = "" + constraint.path + " is " + constraint.node;

			var $elA = $('<a href="#" />');
			$elA.text(str);
			//this.$el.text(str);
			this.$el.append($elA);
			/*
			if(subView) {
				var subViewEl = subView.render().$el;
				this.$el.append(subViewEl);
			}
			*/
			

			//this.$el.append(inputEl);

			return this;
		},

		unrender : function() {
			this.$el.remove();
		}
	});
	
	widgets.ViewItemConstraint = widgets.ViewItemConstraintBase.extend({
		events: {
			click: function(ev) {
				ev.preventDefault();
				this.model.destroy();
			}
		}
	})
	
	
	widgets.constraintItemRenderer = new widgets.RendererItemView({}, null,
			widgets.ViewItemConstraint, {
				label : "simpleLabel"
			});

	widgets.ViewConstraints = widgets.ListView.extend({
		attributes: {
			//'class': 'facet'
		},
		itemRenderer : widgets.constraintItemRenderer
	});

	
	
	
	
	
	var ns = facets;

	
	
	var attachLabelFetcher = function(tableModel) {

		tableModel.on('change:sparqlService change:preferredLanguages', function() {

			var sparqlService = tableModel.get('sparqlService');
			var preferredLanguages = tableModel.get('preferredLanguages');
			
			var labelFetcher = new utils.LabelFetcher(sparqlService, preferredLanguages);
			var postProcessFn = backboneUtils.createDefaultPostProcessor(labelFetcher);
			
			this.set({postProcessFn: postProcessFn});
			
			//console.log('Set post process', this);
		});
	};


	
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

        
        
        $elDefaultGraphSelector.select2({
        	tags: [],
        	initSelection: function(element, callback) {
        		var data = [];
        		$(element.val().split(",")).each(function () {
        			data.push({id: this, text: this});
        		});
        		//console.log('dg data', data);
        		callback(data);
        	}
        });
        		
//	        initSelection : function (element, callback) {
//	            var data = [];
//	            
//	            var ids = element.val().split(" "); // Whitespaces must not occur in URIs, that's why its our separator
//	            for(var i = 0; i < ids.length; ++i) {
//	            	var id = ids[i];
//	            	data.push({id: id, text: id});
//	            }
//	
//	            console.log("Init data: ", data);
//	            callback(data);
//	        },
        

        
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
			//console.log("tags: ", tags);
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
			configModel.set({sparqlDefaultGraphIris: defaultGraphIris});
			
			//console.log('config model', configModel, defaultGraphIris);
		});
		
		
		// Update the config status summary on change
		configModel.on('change', function() {
			var sparqlServiceIri = this.get('sparqlServiceIri');
			var defaultGraphIris = this.get('sparqlDefaultGraphIris');
			
			
			var data = {
					sparqlServiceIri: sparqlServiceIri,
					defaultGraphIris: defaultGraphIris
			};
						
			var templateStr = 'Showing data from service <span style="color:gold">{{!it.sparqlServiceIri}}</span>{{?it.defaultGraphIris.length!=0}} with selected dataset{{?it.defaultGraphIris.length>1}}s{{?}} <span style="color:gold">{{=it.defaultGraphIris.join("</span>, <span style=\\\"color:gold\\\">")}}</span>{{?}}';
			
			var templateFn = doT.template(templateStr);
			var str = templateFn(data);
						
			var $el = $('#config-summary');
			$el.html(str);
		});
		

		
		/*
		 * Update the dataset selection
		 */
		configModel.on('change:sparqlServiceIri change:sparqlDefaultGraphIris', function() {
			{
				var sparqlServiceIri = this.get('sparqlServiceIri');
				var $elSelector = $("#sparql-service-selector");
				
				var data = [{id: sparqlServiceIri, text: sparqlServiceIri}];
				//console.log("Setting data:", data);
				//$elSelector.select2('data', data);				
				$elSelector.select2('val', sparqlServiceIri);
			}
			
			{
				var defaultGraphIris = this.get('sparqlDefaultGraphIris');
				var $elSelector = $elDefaultGraphSelector;//$('#default-graph-selector');
				
				//var tmp = defaultGraphIris.join(' ');
				$elSelector.select2('val', defaultGraphIris);
			}

			
			
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
				config.sparqlProxyServiceIri,
				config.sparqlProxyParamName);
		

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

	        initSelection: function(element, callback) {
	        	var id = element.val();
	        	//console.log('[DEBUG] SPARQL service id: ' + id);
	        	var data = {id: id, text: id};
	        	
	        	callback(data);
	        },

	        
//	        createSearchChoice: function(term, data) {
//	        	var result = {
//	        			id: term,
//	        			text: term
//	            };
//	        	return result;
//	        },
	        
//	        ajax: {
//	        	data: function(data, page) {
//	        		return {data: data, page: page};
//	        	},
//	        	
//	        	transport: function(opts) {
//	        		var term = opts.term;
//
//		        	var sparqlQueryString = "Select Distinct ?o WHERE {?s <http://www.w3.org/ns/dcat#accessURL> ?o . Filter(Regex(?o, '" + term + "', 'i')) . Filter(IsUri(?o)) . } Limit 10";
//					var qe = catalogSparqlService.executeSelect(sparqlQueryString);
//
//					return qe;
//	        	},
//	        	
//	        	results: function(data, page) {
//			        var bindings = data.results.bindings;
//					
//	                // Add the current input as an option
//			        var results = [];
//	
//	
//	                for(var i = 0; i < bindings.length; ++i) {
//	                    var binding = bindings[i];
//	                    var iri = binding.o.value;
//	                    var item = {
//	                        id: iri,
//	                        text: iri
//	                    };
//	                    results.push(item);
//	                }
//	                
//	                var data = { results: results };	        		
//
//	                return data;
//	        	}
//	        },
	        
	        
	        query: function (query) {
	        	
	        	var term = query.term;

	        	var self = this;
	        	
	        	var firstItem = {
	        			id: term,
	        			text: term
	        	};
	        	
	        	// A small hack
	        	this.firstItem = firstItem;
	        	
	        	var data = { results: [firstItem] };
	        	query.callback(data);

                //this.postprocessResults(data, false);

                //this.postRender();

	        	
	        	var sparqlQueryString = "Select Distinct ?o WHERE {?s <http://www.w3.org/ns/dcat#accessURL> ?o . Filter(Regex(?o, '" + term + "', 'i')) . Filter(IsUri(?o)) . } Limit 10";

				scheduler.schedule(function() {
					var qe = catalogSparqlService.executeSelect(sparqlQueryString);
	
			        qe.done(function(jsonRs) {
				        var bindings = jsonRs.results.bindings;
		
		                // Add the current input as an option
				        var firstItem = self.firstItem;
				        var results = [firstItem];
		
		
		                for(var i = 0; i < bindings.length; ++i) {
		                    var binding = bindings[i];
		                    var iri = binding.o.value;
		                    var item = {
		                        id: iri,
		                        text: iri
		                    };
		                    results.push(item);
		                }
		                
		                var data = { results: results };
		                query.callback(data);
		            });
	            });
		        }
	    });
        
        $elSparqlServiceSelector.on('change', function(ev) {
        	//var sparqlServiceIri = ev.val;
        	//var sparqlServiceIri = $elSparqlServiceSelector.val();
        	var sparqlServiceIri = $elSparqlServiceSelector.select2('data').text;

        	console.log('[DEBUG] Selection: ' + sparqlServiceIri, ev);
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
		//var element = new sparql.ElementString("?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [ v ]);
		
		//element = new sparql.ElementString("?s ?p ?o", [v]);
		//var concept = new facets.ConceptInt(element, v);
		var concept = queryUtils.createSubjectConcept(v);		
		
		var ModelConfigSparqlService = Backbone.Model.extend({
			defaults: {
				sparqlServiceIri: "http://localhost:8010/sparql",
				defaultGraphIris: [],
				preferredLanguages: ['de', 'en', ''],
			
				/*
				 * Services based on above properties
				 */
				sparqlService: null,
				labelFetcher: null
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
		
		
		
		var config = configNs;
		
		/*
		 * This model should hold all information required to instanciate the browsing
		 * component
		 */
		var ConfigModel = Backbone.Model.extend({
			defaults: {
				sparqlServiceIri: config.sparqlServiceIri,
				sparqlDefaultGraphIris: config.sparqlDefaultGraphIris,
				//sparqlServiceIri: null,
				//sparqlServiceIri: 'http://localhost:5522/sparql-analytics/api/sparql',
				//defaultGraphIris: ['http://fp7-pp.publicdata.eu/'],
                //defaultGraphIris: null,
				facetProviders: [],
				concept: concept,
				rootFacetNode: facets.FacetNode.createRoot(concept.getVariable().getValue()),
				constraintCollection: new facets.ConstraintCollection2(),
				preferredLanguages: config.preferredLanguages,
				
				collectionColumns: new facets.CollectionColumns(),
				
				// Map collection is the collection of paths added to the map
				mapCollection: new facets.CollectionColumns(),
		
				/*
				 * Services based on above properties
				 */
				sparqlService: null,
				labelFetcher: null,
				modelFacetUpdater: null,
				i18n: null
			}
		});

		
		
		var configModel = new ConfigModel();

		configModel.on('change:concept', function() {
			var concept = this.get('concept');			
			var rootFacetNode = facets.FacetNode.createRoot(concept.getVariable().getValue());
			
			this.set({rootFacetNode: rootFacetNode});
		});
		
		
    	var geoPathStr = "http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/city http://www.w3.org/2002/07/owl#sameAs";
		var geoPath = facets.Path.fromString(geoPathStr);

		
		// Initialize the user interface
		// TODO Move to a different place
		ns.initUi(configModel);
		

		/*
		configModel.set({
			sparqlServiceIri: config.sparqlServiceIri,
			defaultGraphIris: config.sparqlDefaultGraphIris
		});
		*/

		
		
		ns.initServices(configModel);

		// Init model by triggering a change event
		configModel.trigger('change:sparqlServiceIri');		

		
		var facetTree = ns.createFacetTreeView(configModel);
		
		var facetWidget = facetTree.facetWidget;
		
		
		
		ns.createConstraintView(configModel);
		
		/*
		facetWidget.on('itemAdded', function(ev) {
			console.log("[FacetTree] Item Added: ", ev);
		});
		
		facetWidget.on('itemsReset', function(ev) {
			console.log("[FacetTree] Items Reset: ", ev);
		});
		
		
		facetWidget.on('itemRemoved', function(ev) {
			console.log('[FacetTree] Item Removed', ev);
		});
		*/
		
		
		ns.createDataTableView(configModel);

		ns.createDetailView(configModel);
		
		ns.createMapView(configModel, geoPath);

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
				facetNode: null
			}
		});

		// Link the facetValuesConfigModel to the configModel on a specific set of properties.
		Backbone.linkModels(configModel, facetValuesConfigModel, true, ['sparqlService', 'concept', 'constraintCollection', 'rootFacetNode', 'i18n']);

		//console.log("Linked model: ", facetValuesConfigModel.attributes);
		var facetValues = ns.createFacetValuesView(facetValuesConfigModel);
		
		facetTree.facetWidget.on('facetSelected', function(ev) {
			var facetNode = ev.facetNode;
			
			facetValuesConfigModel.set({
				facetNode: facetNode
			});

			console.log("Select facet: ", facetNode);			
		});
		
	};

	
	ns.createConstraintView = function(configModel) {
		var constraintCollection = configModel.get('constraintCollection');
		
		console.log('ConstraintCollection', constraintCollection);
		
		var view = new widgets.ViewConstraints({
//			el: $el,
			collection: constraintCollection
		});
		
		var $elContainer = $('#constraints');
		var rendered = view.render().el
		$elContainer.append(rendered);
		
	};
    
    ns.initServices = function(configModel) {
    
    	
		/*
		 * Reset services if the configuration changes
		 * 
		 */
		var resetServices = function() {
			var attrs = this.attributes;
			
			
			
			//console.log("Resetting services - attributes are: ", JSON.stringify(attrs.sparqlDefaultGraphIris));
			
			var sparqlService = new backend.SparqlServiceHttp(
					attrs.sparqlServiceIri,
					attrs.sparqlDefaultGraphIris,
					config.sparqlProxyServiceIri,
					config.sparqlProxyParamName);
			
			var labelFetcher = new utils.LabelFetcher(sparqlService, attrs.preferredLanguages);

			var facetProviders =
				[
				 	new facets.FacetProviderSimple(sparqlService, false)
//				 	,new facets.FacetProviderSimple(sparqlService, true)
				];

			
			this.set({
				sparqlService: sparqlService,
				labelFetcher: labelFetcher,
				modelFacetUpdater: new facets.ModelFacetUpdater(facetProviders, attrs.concept, attrs.constraintCollection, sparqlService),
				facetProviders: facetProviders,
			    i18n: new utils.SpanI18n(labelFetcher)
			});
		};
		
		configModel.on('change:sparqlServiceIri change:sparqlDefaultGraphIris change:preferredLanguages', resetServices);

    };

    ns.createDataTableView = function(configModel) {
    	
    	var widget = ns.createDataTableModel(configModel);
    	
		var container = $('#instances');
		container.children().remove();

		
		widgetNs.createView(container, widget);
	
		//console.log("INIT VIEWS", models);
    };

    
    ns.createDetailView = function(configModel) {
    	
		var widget = widgetNs.createQueryBrowser();
		
		var tableModel = widget.models.tableModel;
		//tableModel.get('headerMap').add({id: 's', label: 'Item'});

		attachLabelFetcher(tableModel);
    	
    	/*
    	var widget = ns.createDataTableModel(configModel);
    	*/
		
		var container = $('#detailView');
		container.children().remove();

		
		widgetNs.createView(container, widget);
		
		
		configModel.on('change:detailViewQueryFactory', function(model) {
			var queryFactory = model.get('detailViewQueryFactory');
			
			//console.log('Dammit QueryFactory:' + queryFactory.createQuery());
			var sparqlService = model.get('sparqlService');
			
			tableModel.set({
				sparqlService: sparqlService,
				queryFactory: queryFactory
			});
			
			console.log('Dammit table model', tableModel);
		});
		
		return widget;
    };


    ns.createQueryFactoryConcept = function(concept) {

		var queryGenerator = new facets.QueryGenerator(concept);
		var queryFactory = new facets.QueryFactoryQueryGenerator(queryGenerator, {distinct:true});

		return queryFactory;
    };
    
    
    ns.createDataTableModel = function(configModel) {

    	var sparqlService = configModel.get('sparqlService');
    	var labelFetcher = configModel.get('labelFetcher');

		/*
		var queryFactoryConcept = new facets.QueryFactoryQueryGenerator(
				queryGenerator);

		var queryFactoryFacets = facets.QueryFactoryFacets.create(queryFactoryConcept, concept.getVariable().getValue()); //v.value);

		var constraintManager = queryFactoryFacets.getConstraintManager();
*/
    	
    	var concept = configModel.get('concept');
    	var constraintCollection = configModel.get('constraintCollection');
    	
    	var rootFacetNode = configModel.get('rootFacetNode');
    	
    	var collectionColumns = configModel.get('collectionColumns');
    	

		//var queryGenerator = new facets.QueryGenerator(concept);
		//var queryFactory = new facets.QueryFactoryQueryGenerator(queryGenerator, {distinct:true});
    	var queryFactory = ns.createQueryFactoryConcept(concept);
    	
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
		var widget = widgetNs.createQueryBrowser();
		
		
		/*
		var resultCollection = new Backbone.Collection();
		
		var syncer = new backboneUtils.SyncerRdfCollection(
				resultCollection
			//,backboneUtils.createDefaultPostProcessor(labelFetcher);
		);
		*/

		
		
		
		//console.log('dataTableModel', widget);
    	//console.log("Dammit", widget);

		var tableModel = widget.models.tableModel;
		tableModel.get('headerMap').add({id: 's', label: 'Item'});

		//tableModel.set({limit: 50});
		//console.log("Fuuuuuu", tableModel);
		
		/*
		 * Update table headings
		 */
		collectionColumns.on('add remove reset', function() {

	    	var rootFacetNode = configModel.get('rootFacetNode');

	    	var headerMap = tableModel.get('headerMap');
	    	
	    	headerMap.reset();
	    	headerMap.add({id: 's', label: 'Resource'});
	    	
			
			collectionColumns.each(function(model) {
				var path = model.get('path');
				
				var lastStep = path.getLastStep();
				
				if(!lastStep) { //path.getLength() === 0) {
					return;
				} 
				
				var facetNode = rootFacetNode.forPath(path);
				
				var v = facetNode.getVariable();
				
				var id = v.value;
				var label = lastStep.propertyName;
				headerMap.add({id: id, label: label});
				//headerMap.add({id: id, label: '<span data-uri="' + label + '" />'});
				
				
				
				//var rootVarNode = rootFacetNode.getVarNode();
				//rootVarNode.findNodeByVarName()
			});
		});
		
		widget.models.paginatorModel.set('maxSlotCount', 11);
		

		attachLabelFetcher(tableModel);
		Backbone.linkModels(configModel, tableModel, true, ['sparqlService', 'preferredLanguages']);
		
		
//		configModel.on('change:sparqlService', function() {
//			console.log('BAM thats a BAM');
//		});
//
//		tableModel.on('change:sparqlService', function() {
//			console.log('BAM thats another BAM');
//		});
		
		/*
		console.log('Table model before link', tableModel);
		eueue
		*/

		//console.log('Table Model after link', tableModel);
		
		
		tableModel.set({
			queryFactory : queryFactory
		});
		
		// FIXME: This syncher updates the tableModel based on changes in the constraint collection
		// However, we also need to update the list based on collectionColumns.
		var ctrlInstaceListSyncer = new facets.ControllerInstanceListSyncer(
				queryFactory,
				rootFacetNode,
				constraintCollection,
				collectionColumns,
				tableModel
		);


		return widget;
    }
    
    

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
		var fnUpdateFacetsCore = function(model) {
			//console.log('Updating facet tree with config model ', configModel);
			
			var facetNode = model.get('facetNode');
			var modelFacetUpdater = configModel.get('modelFacetUpdater');
			
			var constraintManager = constraintCollection.createConstraintManager(rootFacetNode);
			var facetFacadeNode = new facets.SimpleFacetFacade(constraintManager, facetNode);
			
			//console.log("Updating facetNode ", facetNode)
			
			
			var promise = modelFacetUpdater.updateFacets(model, facetFacadeNode);
			return promise;
		};

		
		var renderModel = new Backbone.Model({
			renderCount: 0
		});
		
		var fnUpdateFacets = function(model) {
			var promise = fnUpdateFacetsCore(model);
						
			
			var result = promise.pipe(function() {
				var renderCount = renderModel.get('renderCount');
				var val = renderCount + 1;
				
				//console.log('[DEBUG] Increasing render count to ' + val);
				renderModel.set({renderCount: val});
			});
			
			return result;
		};
    	

    	var superRootFacetCollection = new ns.CollectionFacetNode({
    		fnUpdateFacets: fnUpdateFacets
    	});
    	
    	
    	
    	var superFacetModel = new facets.ModelFacetNode({
			facetNode: facets.FacetNode.createRoot(rootFacetNode.getVariable().getValue()),
			children: superRootFacetCollection,
			isExpanded: true
		});
    	
    	
    	//superFacetModel.get('children').add(rootFacetModel);
    	superRootFacetCollection.add(rootFacetModel);
    	
    	
    	//fnUpdateFacets(metaFacetModel);


    	
    	//console.log("TEST", modelFacetUpdater);
    	
		//console.log("FacetFacadeNode: ", rootFacetNode);
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
			collection: superRootFacetCollection,
			// options: {
			// TODO Add indirection: don't point to a modelFacetUpdate directly, but introduce a function that returns one
			//modelFacetUpdater: modelFacetUpdater,
			fnUpdateFacets: fnUpdateFacets
			
			// TODO Indirection plus this should be part of a separate controller
			//collectionColumns: collectionColumns
			// }
		});
		
		
		
		var tablePlugin = new widgets.FacetTreeTablePlugin({
			facetWidget: facetWidget,
			collection: collectionColumns
		});

		
		var mapCollection =  configModel.get('mapCollection');
		var mapPlugin = new widgets.FacetTreeMapPlugin({
			facetWidget: facetWidget,
			collection: mapCollection
		});
		
//		var cherryPickCollection = new facets.CollectionColumns(); //configModel.get('mapCollection');
//		var cherryPickPlugin = new widgets.FacetTreeCherryPickPlugin({
//			facetWidget: facetWidget,
//			collection: cherryPickCollection
//		});
		
		

		// TODO This is hacky: The status of whether a facet update is running should be part of the model and not the view!
		/*
		var self = this;
		facetWidget.on('facetUpdate', function(promise) {
			console.log("[DEBUG] Waiting for completion of facet loading task...");
			promise.done(function() {
				console.log("[DEBUG] Data loading task completed, updating labels of URIs in DOM");
				var i18n = configModel.get('i18n');
				i18n.update(facetWidget.$el);
			});
		});
		*/
		
		renderModel.on('change:renderCount', function() {
			console.log("[DEBUG] Data loading task completed, updating labels of URIs in DOM");
			var i18n = configModel.get('i18n');
			i18n.update(facetWidget.$el);
		});
		
		
    	superRootFacetCollection.add(rootFacetModel);
    	

    	configModel.on('change:sparqlService', function() {
    		fnUpdateFacets(rootFacetModel);
    	});

    	
    	// TODO Thiso line is necassary hack because of above hack
    	renderModel.trigger('change:renderCount');
		//var i18n = configModel.get('i18n');
		//i18n.update(facetWidget.$el);

    	
		var result = {
			facetWidget: facetWidget
		};
			
		return result;
    };

    
    
    ns.createFacetValuesView = function(configModel /* This is NOT the app config model */) {
    	
    	//var sparqlService = configModel.get('sparqlService');
    	//var labelFetcher = configModel.get('labelFetcher');
    	var concept = configModel.get('concept');
    	var constraintCollection = configModel.get('constraintCollection');
    	
    	var rootFacetNode = configModel.get('rootFacetNode');
    	
    	// This is a hack :/
    	var i18n = configModel.get('i18n');
    	
    	
		// TODO service must be configurable

		var widget = widgetNs.createQueryBrowser();//sparqlService, labelFetcher);

		
		var models = widget.models;
		var tableModel = models.tableModel;
		
		

		
    	// We need to replace the model for the query result set
		// with our own version that gets special handling because
		// we need to set the 'checked' state for selected facets 
		var sourceCollection = models.resultSet;//models.browseConfig.collection;
		
		
		var targetCollection = new Backbone.Collection();
		//models.browseConfig.collection = targetCollection;
		models.resultSet = targetCollection;

		attachLabelFetcher(tableModel);
		Backbone.linkModels(configModel, tableModel, true, ['sparqlService', 'preferredLanguages']);

		
		var controllerFacetValueEnricher = new facets.ControllerFacetValueEnricher(constraintCollection, targetCollection);

		// FIXME Some configuration - should be done elsewhere
		models.paginatorModel.set('maxSlotCount', 11);

		
		
		var fnUpdateFacetValues = function() {

			
			
			//console.log('fnUpdateFacetValues', this);
			
			var facetNode = this.facetNode;
			var constraintCollection = this.constraintCollection;
						
			
			if(!facetNode) {
				console.log('[WARN] FacetNode not set');
				return;
			}
			
			// TODO The root node should come from the facetNode!!!
			// TODO Make a 1-line helper for these three lines
			var constraintManager = constraintCollection.createConstraintManager(rootFacetNode);
			var facetFacadeNode = new facets.SimpleFacetFacade(constraintManager, facetNode);
			var concept = facetFacadeNode.createConcept();
			
			//console.log("FacetValue concept: ", concept);
			//var rootFacetNode = facetNode.getRootNode();
			var rootFacetVar = rootFacetNode.getVariable();
			//console.log('rootFacetNode', rootFacetNode);
			
			var conceptVar = concept.getVariable();			
			var countVar = sparql.Node.v("c");
			var conceptElement = concept.getElement();
			
			var query = queryUtils.createQueryCount(conceptElement, null, rootFacetVar, countVar, [ conceptVar ], true);

			
			//var queryGenerator = new facets.QueryGenerator(concept);
			
			
			/*
			var queryFactory = new facets.QueryFactoryQueryGenerator(
					queryGenerator, {
						distinct : true
					}
			);*/
			
			//console.log("FacetValue Query Factory: " + query);
			var queryFactory = new facets.QueryFactoryQuery(query);

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

		
		var facetValuesWidget = widgetNs.createView(container, widget, function(options) {

			var result = new widgets.TableView2({
				attributes: { 'class': 'table table-bordered table-striped table-condensed', style: 'margin: 0px' },
				collection : options.collection,
				rowItemRenderer: function(model) {
					
					//console.log("Row item", model);
					
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
						//i18n.update(c2);

					} else {
						c2 = $('<span>' + node.value + '</span>');
					}
					
					var count = model.get('count');
					c3 = $('<span>' + count + '</span>');
					
					var result = [c1.render().$el, c2, c3];
					
					return result;
				}
			});
			
			
			result.on('renderDone', function() {
				i18n = configModel.get('i18n');
				i18n.update(this.$el);				
			});
			
			/*
			result.on('test', function() {
				alert("yay");
			});
			*/
			
			return result;
		});
		
		var result = {
				facetValuesWidget: facetValuesWidget,
				tableModel: tableModel
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
		var foobarTableModel = facetValueModel.tableModel;

		

    };
    
    
    ns.createMapView = function(configModel) {		
		
    	/*
    	var mapCollection = configModel.get('mapCollection');    	
    	var sparqlService = configModel.get('sparqlService');
		var constraintCollection = configModel.get('constraintCollection');
		var rootFacetNode = configModel.get('rootFacetNode');
    	 */    	
    	
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

		
		
		
		/*
		var onChangeFeatureSelection = function(features) {
			
			var update
			for(var i = 0; i < features.length; ++i) {
				
				var feature = features[i];
				
				
			}
			
		}
		*/
		
		
		// Update the map view if the data changes in the model
		mapModel.on('change:uris change:rdfGraph', function() {
			mapView.zoomToFit();
		});

		
		mapView.render();

		
    	var dynamicMapModel = new widgetNs.DynamicMapModel();
    	var dynamicMapController = new widgetNs.DynamicMapController(dynamicMapModel);

    	
    	dynamicMapModel.on('change:state', function(model) {
    		console.log('this model is', model);
    		
    		//var model = this;
    		
    		var state = model.get('state');
    		
    		var globalItemData = model.get('globalItemData');
    		
    		var delta = state.delta;
    		var newState = state.newState;
    		

    		var mapItems = mapModel.get('items');
    		var mapBoxes = mapModel.get('boxes');
    		
    		var removedItems = delta.items.removed;
    		for(var i = 0; i < removedItems.length; ++i) {
    			var item = removedItems[i];

    			mapItems.remove(item);
    		}
    		
    		var addedItems = delta.items.added;
    		for(var i = 0; i < addedItems.length; ++i) {
    			var item = addedItems[i];
    			var geom = newState.geomToPoint[item];
    			
    			var lonlat = new OpenLayers.LonLat(geom.x, geom.y);
    			
    			var data = {
    					id: item,
    					geom: lonlat,
    					label: "",
    					globalItemData: globalItemData
    			};
    			
    			mapItems.add(data);
    		}
    		
    		
    		var addedBoxes = delta.boxes.added;
			mapBoxes.add(addedBoxes);
    		/*
    		for(var i = 0; i < addedBoxes.length; ++i) {
    			var box = addedBoxes[i];
    			
    		}*/
    		
    		
    		var removedBoxes = delta.boxes.removed;
    		mapBoxes.remove(removedBoxes);
    		/*
    		for(var i = 0; i < removedBoxes.length; ++i) {
    			var boxId = removedBoxes[i];
    			
    			mapBoxes.remove
    		}
    		*/
    		
    		
    		//console.log('BOOYA', state);
    	});
    	
		mapView.on('mapevent', function() {
			//console.log("mapevent");
			var map = mapView.getMap();

			var olBounds = map.getExtent().transform(map.projection, map.displayProjection);
			
	    	dynamicMapModel.set({
	    		bounds: olBounds
	    	});
		});

		mapView.trigger('mapevent');
    	

		

		/*
		var featureLayer = mapView.getLegacyWidget().getFeatureLayer();
		
		featureLayer.events.on({
            'featureselected': function(feature) {
                console.log("featureselected:", this.selectedFeatures);
            },
            'featureunselected': function(feature) {
            	console.log("featureunselected:", this.selectedFeatures);
            }
        });
        */

		mapView.on("featureSelect", function(ev, data) {
			//console.log("click", ev, data);			
			var id = data.id;
			
			var globalItemData = data.get('globalItemData');
			var geoPath = globalItemData.geoPath;
			//var json = data.json;

			
			console.log("clicked feature: ", data);
			
			//console.log("Select " + id + " with data " + JSON.stringify(json));
			//console.log("Select " + id);

			//var geoPath = json[id]['http://ha.ck/geoPath'][0].value;
			var node = sparql.Node.uri(id);
			
			//constraintCollection.setEqualsConstraint(geoPath, node, true);	
						
			
	    	var sparqlService = configModel.get('sparqlService');
	    	var labelFetcher = configModel.get('labelFetcher');

	    	var concept = configModel.get('concept');
	    	var constraintCollection = configModel.get('constraintCollection');
	    	
	    	var rootFacetNode = configModel.get('rootFacetNode');
	    	
	    	var collectionColumns = configModel.get('collectionColumns');
		
			var tmp = constraintCollection.clone();
			tmp.setEqualsConstraint(geoPath, node, true);

			
			
	    	var queryFactoryConcept = ns.createQueryFactoryConcept(concept);
			
			
			var queryFactory = facets.createQueryFactoryFacete(queryFactoryConcept, rootFacetNode, tmp, collectionColumns);
			
			//alert("Query is: " + queryFactory.createQuery());
			
			configModel.set({detailViewQueryFactory: queryFactory});
			//detailViewQueryFactory
			// Set the model of the detail widget
			
		});

		
		mapView.on("featureUnselect", function(ev, data) {
			var id = data.id;
			var globalItemData = data.get('globalItemData');
			var geoPath = globalItemData.geoPath;

			//var json = data.json;
			
			//var geoPath = json[id]['http://ha.ck/geoPath'][0].value;
			var node = sparql.Node.uri(id);
			
			console.log("Unselect " + id);

			// Add a short delay for the case that another node was selected
			// immediately after unselecting this one -
			// This way the unselect will happen after the new selection and thus
			// resulting for unsatisfiable constraints - which is better than
			// having no constraints at all for the blink of an eye, because
			// each change in state triggers the data fetching workflow

			// TODO Maybe there is a better solution to this? When a new feature is clicked, the old one first becomes de-selected
			// Upon deselection, however, we may already initiate a workflow for updating the facets
			setTimeout(function() {
				constraintCollection.setEqualsConstraint(geoPath, node, false);				
			}, 20);

			//			alert("Unselect " + id + " with data " + JSON.stringify(json));
			
		});

		

		
		
		// Whenever the facet selection changes (or the concept) update the map.
		
		
		var constraintCollection = configModel.get('constraintCollection');
    	var mapCollection = configModel.get('mapCollection');    	


    	
    	
    	
		var updateMap = function() {		
			if(true) {
				// FIXME Fetching of markers disabled
				//return;
			}
			
	    	var sparqlService = configModel.get('sparqlService');
			var rootFacetNode = configModel.get('rootFacetNode');

			var sparqlServicePaginated = new backend.SparqlServicePaginator(sparqlService, 1000);
			var queryCacheFactory = new utils.QueryCacheFactory(sparqlServicePaginated);
			var geomPosFetcher = new utils.GeomPointFetcher(queryCacheFactory);
	
			
			mapCollection.each(function(model) {
				var geoPath = model.get('path');

			
				var constraintManager = constraintCollection.createConstraintManager(rootFacetNode);
				//var queryFactory = new facets.QueryFactoryFacets(this.subQueryFactory, this.facetNode, constraintManager); //queryFactoryFacets.getConstraintManager();
		    	//var geoPathStr = "http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/city http://www.w3.org/2002/07/owl#sameAs";
				//var geoPath = facets.Path.fromString(geoPathStr);
	
	
				var rootFacetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);
				var hack = rootFacetFacadeNode.forPath(geoPath);
				hack.constraintManager = constraintManager; 
				
				var baseConcept = configModel.get('concept');				
				var tmpConcept = hack.createConcept();

				
				var concept = facets.createCombinedConcept(baseConcept, tmpConcept);

				var pathConstraintFactory = new facets.PathConstraintWgs84.Factory.create(geoPath);
				var geoConceptFactoryBase = new facets.GeoConceptFactory(rootFacetNode, pathConstraintFactory);
				
				
				var geoConceptFactory = new facets.GeoConceptFactoryCombine(concept, geoConceptFactoryBase);
				
				// The concept does not have any geo constraints added yet
				// Now mix in the constraints from the geoConstraintFactory
				
				//var map = mapView.getMap();
 
				//var olBounds = map.getExtent().transform(map.projection, map.displayProjection);
				

				dynamicMapModel.set({
					sparqlService: sparqlService,
					geomPosFetcher: geomPosFetcher,
					
					concept: concept,
					geoConceptFactory: geoConceptFactory,
					globalItemData: {geoPath: geoPath}
				});

				
				
				// FOOBAR
				
				
				
				
				
				
				
//				var varName = concept.getVariable().value;
//				var query = queryUtils.createQuerySelect(concept, {distinct: true});
//				
//				// TODO If the path is empty, we need to inject the triple pattern (conceptVar ?p ?o)
//				console.log("GEO QUERY" + query, concept);
//				
//				var promise = sparqlServicePaginated.executeSelect(query).pipe(function(jsonRs) {
//	
//					//console.log("jsonRs", jsonRs);
//					
//					var uris = _
//						.chain(jsonRs.results.bindings)
//						.filter(function(binding) {
//							return varName in binding && binding[varName] && binding[varName].type === 'uri';
//						})
//						.map(function(binding) {
//							//console.log("Binding: ", binding);
//							return sparql.Node.uri(binding[varName].value);
//						})
//						.value();
//					
//					//console.log("Related geomtery uris: ", uris.length, uris);
//					
//					var promise = geomPointFetcher.fetch(uris).pipe(function(uriToPoint) {
//	
//						var rdfGraph = {};
//						
//						_.each(uriToPoint, function(point, uri) {
//							rdfGraph[uri] = {
//									'http://www.w3.org/2003/01/geo/wgs84_pos#long': [{value: point.x}],
//									'http://www.w3.org/2003/01/geo/wgs84_pos#lat': [{value: point.y}]
//									//'http://www.w3.org/2000/01/rdf-schema#label': ['value: unnamed']
//							};
//							
//							rdfGraph[uri]['http://ha.ck/geoPath'] = [{value: geoPath}];
//						});
//	
//						return rdfGraph;
//					});
//					
//					return promise;
//				});
//				
//				promise.done(function(rdfGraph) {
//					
//					//console.log("RDF GRAPH:", rdfGraph);
//					
//					var uris = _.keys(rdfGraph);
//					
//					mapModel.set({uris: uris, json: rdfGraph});
//				});
//				
			});		
			
		};
		
		constraintCollection.on('add remove reset', updateMap);
		mapCollection.on('add remove reset', updateMap);

		

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
				console.log("Warning: got empty query string");
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

