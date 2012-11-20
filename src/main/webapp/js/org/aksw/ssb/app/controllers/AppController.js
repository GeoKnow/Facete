(function($) {
	
	
	
	
	/*
	 * Disable Backbone sync
	 */
	Backbone.sync = function(method, model, options) { 
		options.success();
	};
	

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");
		
	var qt = Namespace("org.aksw.ssb.collections.QuadTree");
	var qtm = Namespace("org.aksw.ssb.collections.QuadTreeModel");
	var qtc = Namespace("org.aksw.ssb.collections.QuadTreeCache");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	var geovocab = Namespace("org.aksw.ssb.vocabs.geovocab");
	var appvocab = Namespace("org.aksw.ssb.vocabs.appvocab");
	var rdf = Namespace("org.aksw.ssb.vocabs.rdf");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");

	var utils = Namespace("org.aksw.ssb.utils");
	
	// FIXME get rid of labelUtils references and replace with utils
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	var facetbox = Namespace("org.aksw.ssb.widgets.facetbox");
	var widgets = Namespace("org.aksw.ssb.widgets"); 

	
	var collections = Namespace("org.aksw.ssb.collections");

	
	var config = Namespace("org.aksw.ssb.config");
	
	var ns = Namespace("org.aksw.ssb.app.controllers");

	
	/**
	 * A model and corresponding collection for the instances shown on the map.
	 * 
	 */
	ns.ModelInstance = Backbone.Model.extend({
		id: "",
		label: ""		
	});
	
	
	ns.CollectionInstance = Backbone.Collection.extend({
		model: ns.ModelInstance
	});
	
	
	
	
	ns.ConstraintModel = Backbone.Model.extend({
		defaults: {
			value: null
			/*label: "" // FIXME As there could be many ways for crafting constraint labels, 
				//associating a label only makes sense for view-models;*/  
	    }
	});
	
	ns.ConstraintCollection = Backbone.Collection.extend({
		model: ns.ConstraintModel
	});
	


	/**
	 * A view state consists of the visible bounds, the corresponding
	 * (quad tree) nodes TODO: and the cache?
	 * 
	 * @param cache
	 * @returns {ns.ViewState}
	 */
	ns.ViewState = function(nodes, bounds, visibleGeoms) {
		this.nodes = nodes;
		this.bounds = bounds; //null; //new qt.Bounds(-9999, -9998, -9999, -9998);
		this.visibleGeoms = visibleGeoms ? visibleGeoms : [];
	};
	
	
	/*
	ns.QueryCacheGeo = function(sparqlService, baseQuery, geoConstraint) {
		this.sparqlService = sparqlService;
		this.baseQuery = baseQuery;
		this.geoConstraint = geoConstraint;
		
		this.quadTreeModel = new collections.QuadTreeModel();
	};
	
	ns.QueryCacheGeo.prototype.execute = function(bounds, callback) {
		
	};
	*/
	
	
	/**
	 * The main class for the Spatial Semantic Browsing Widgets.
	 * Holds references to model classes, and can initialize the controller.
	 * 
	 * 
	 * @returns {AppController}
	 */
	ns.AppController = function(options) {
		this.sparqlService = null;

		
		this.options = options;
		
		/*
		 * Backend configuration
		 */
		
		// The label for referring to the base of navigation.
		this.rootNavigationLabel = "home";
		
				
		
		var conf = options.queryGenerator;
		
		var queryGenerator = new widgets.QueryGenerator(conf.concept, conf.navigationPath, null, conf.constraints, conf.pathManager);
		
		this.queryGeneratorGeo = new ns.QueryGeneratorGeo(queryGenerator, conf.geoConstraintFactory);
		
		
		//this.queryGenerator = new ns.QueryGenerator(options.queryGenerator);
		
		this.queryFactory = null;
	
		this.selection = new collections.Set();
	
		// The currently selected feature
		// FIXME Change to something like "selectedResource", so we can track
		// the active feature between mapEvents (features get destroyed on map events)
		//this.selectedFeature = undefined;
			
		// The active language
		// TODO Make sure this can be removed.
		this.activeLanguage = "fr";
	

		//this.quadTreeModel = null;
	
		this.nodeToLabel = new collections.Map();
		this.nodeToTypes  = new collections.MultiMap();
		this.nodeToFeature = new collections.Map();
		this.schemaIcons = new MapCollection();	

		
		// Reference to the OpenLayers map
		this.mapWidget = null;
		this.map = null;
		this.instanceWidget = null;
		
		//this.geomToId = new facets.MultiMap(); 
		
		this.hoveredItems = [];
		
		// Maps prefixes to DescribeService's that provide additional information about
		// resources
		this.prefixToService = {};
		
		
		// query cache; maps a base query to a quad tree model
		this.hashToCache = {};
		
		this.viewState = new ns.ViewState();
		
		// A wrapper for a rdfquery databank which keeps track of how often a triple was added
		this.multiGraph = new collections.MultiGraph();
		
		
		this.labelFetcher = null;
		
		this.queryCacheFactory = null;
		
		
		this.abbreviator = new utils.Abbreviator();
		

		// Map resources to stuff like selected, or hovered, so we can
		// style markers in corresponding colors and sizes
		this.resourceState = {};
	};
	
	
	/**
	 * Save the current application state to a JSON object
	 * 
	 */
	ns.AppController.prototype.saveState = function() {
		var result = {
			map: this.mapWidget.saveState()
		};
		
		return result;
	};
	
	
	/**
	 * Load an application state from an JSON object
	 * 
	 */
	ns.AppController.prototype.loadState = function(state) {
		this.mapWidget.loadState(state.map);
		
		
		//this.doLayout();
		//this.repaint();
	};
	
	ns.AppController.prototype.doLayout = function() {
		$(window).resize();
	};

	
	
	ns.AppController.prototype.init = function() {
		//var self = this;
		
		this.initWidgets();
		this.initEvents();		
		
		var self = this;
		// DEBUG/TESTING
		var test = $$({}, "<div style='position: absolute; left: 60px; top: 5px; z-index: 1000;'><button>PermaLink</button></div>", {
			'click button': function() {
				var baseUrl = location.href;
				
				// cut off any hash string
				var hashString = "";
				var hashStringStart = baseUrl.indexOf("#");
				if(hashStringStart >= 0) {
					hashString = baseUrl.substring(hashStringStart);
					baseUrl = baseUrl.substring(0, hashStringStart);
				}
				
				// cut off the query string
				var queryStringStart = baseUrl.indexOf("?");
				if(queryStringStart >= 0) {
					baseUrl = baseUrl.substring(0, queryStringStart);
				}
				
				//var stateArg = $.param(self.saveState());
				var stateStr = JSON.stringify(self.saveState());
				var stateArg = encodeURIComponent(stateStr); 
				
				var url = baseUrl + "?state=" + stateArg + hashString;
				//alert("State: " + url + "?state=" + stateArg);
				window.prompt("Copy to clipboard", url);
			}
		});
		
		$$.document.append(test, "#map");
		
		var homePath = new facets.Path(); //new facets.Breadcrumb.fromString(this.queryGenerator.pathManager, "");
		this.setNavigationPath(homePath);

	};
	
	
	ns.AppController.prototype.updateConstraints = function() {
		var self = this;
		
		var cs = this.queryGeneratorGeo.getConstraints();
		cs.clear();
		
		this.constraints.each(function(item) {
			
			var c = item.get("value");
			
			//alert("" + typeof(item) + " " + JSON.stringify(item));
			//alert("" + item.value);
			//console.log("dammit", item);
			cs.add(c);
		});

		
		
		//self.constraintWidget.refresh();
		self.repaint();
	};

	
	ns.AppController.prototype.initWidgets = function() {

		
		// Initialize the widgets
		$("#map").ssb_map({
			nodeToPos: this.nodeToPos,
			nodeToFeature: this.nodeToFeature,
			wayToFeature: this.wayToFeature,
			instanceToLabel: this.nodeToLabel,
			nodeToTypes: this.nodeToTypes,
			schemaIcons: this.schemaIcons
		});

		/*
		$("#instances").ssb_instances({
			instanceToLabel: this.nodeToLabel,
			instanceToType: this.nodeToTypes,
			schemaIcons: this.schemaIcons
		});
		this.instanceWidget = $("#instances").data("ssb_instances");
		*/
		
		/*
		$("#facets").ssb_facets({
			schemaIcons: this.schemaIcons,
			schemaLabels: this.schemaLabels,
			classHierarchy: this.classHierarchy,
			selection: this.selection
		});
		*/

		//$("#facts").ssb_facts({});

		//var describer = new widgets.Describer(this.sparqlService);
		this.factBox = widgets.createResourceWidget(this.sparqlService);
		$$.document.append(this.factBox, "#box-facts");
		
		//this.factBox.controller.setNodes([sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/beneficiary")]);
		
		//$("#facts").append(this.factBox.view());
		
		
		//$("#browsebox").ssb_browsebox({});
		
		this.mapWidget = $("#map").data("ssb_map");
		this.map = this.mapWidget.map;
		
		/*
		var self = this;
		$(window).resize(function() {
			var container = $("#map");
			
			self.map.size(container.width(), container.height());
		});
		*/
		
		//this.facts = $("#facts").data("ssb_facts");

		// TODO: Do not depend directly on map, but on a "visible area"
		$("#searchResults").ssb_search({map: this.map});
		
		
		// Facet box
		var queryGeneratorGeo = this.queryGeneratorGeo;
		var constraints = queryGeneratorGeo.getConstraints();
		
		//var facetConfig = new facetbox.FacetConfig(1001, 10001);
		this.facetConfig = new facetbox.FacetConfig(1001, null);
		
		//var baseBreadcrumb = new facets.Breadcrumb(queryGenerator.pathManager);
		
		//this.facetState = new facetbox.FacetState(this.facetConfig, queryGenerator.getInferredDriver(), basePath);
		var basePath = new facets.Path();
		//this.facetState = new facetbox.FacetState(this.queryGenerator, basePath);
				
		
		//var facetBoxBackend = new facetbox.FacetValueBackendSparql(this.sparqlService, this.facetConfig, this.queryGenerator); //this.labelFetcher);

		var self = this;

		$(config.EventBus).on("resourcesModified", function(resources) {
			
			//setTimeout((function() {
				//self.mapWidget.redraw();
				self.factBox.controller.redraw();
				self.repaint();
			//}), 500);
		});

		
		
		this.breadcrumbWidget = widgets.createBreadcrumbWidget({
			onNavigate: function(path) {
				self.setNavigationPath(path);
			}
		});
		
		$$.document.append(this.breadcrumbWidget, "#ssb-breadcrumb");
		
		var callbacks = {
			onMoveTo: function(path) {
				self.setNavigationPath(path);
			}
		};
		
		
		/*
		
		var listWidget = widgets.createExecutorList(executorModel, widgets.checkItemFactory, this.labelFetcher);
					
		listWidget.getListWidget().bind("click", function(ev, payload) {
			alert(payload.checked + " " + payload.item.model.get("label"));
		});

		$$.document.append(listWidget, $("#ssb-graph-selection"));
		
		listWidget.getListWidget().refresh();
		 */
		
		
		//config, queryGenerator, basePath, backend, callbacks
		//this.facetBox = $$(facetbox.FacetBox); //widgets.createListWidget2(ns.FacetSwitcherItemFactory, ns.hackId);

		
		/*
		 * Instances
		 */
		
		this.visibleInstances = new ns.CollectionInstance();
		
		this.visibleInstances.bind("add", function(model) {
			//alert("yay");
		});
				
		
		var InstanceListItemView = widgets.ItemViewLabel.extend({
			events: {
				'click span': function(event) {
					self.showFeatureDetails(this.model.get("id"));
				}
			}
		});

		
		var instanceListView = new widgets.ListView({
			el: $("#tabs-content-instances"),
			attributes: {style: {'list-style': 'none'}},
			collection: this.visibleInstances,
			itemRenderer: new widgets.ItemRendererBackbone(InstanceListItemView)
		});

		
		var mapSyncView = new widgets.ItemViewMapMarker({
			//el: $("#tabs-content-instances"),
			//attributes: {style: {'list-style': 'none'}},
			mapWidget: self.mapWidget,
			collection: this.visibleInstances
			//itemRenderer: new widgets.ItemRendererBackbone(InstanceListItemView)		
		});


		
		
		
		/*
		 * Constraints 
		 */
		
		
		this.constraintSelections = new widgets.SelectionCollection();		
		
		this.constraints = new ns.ConstraintCollection();

		
		// Fetch labels
		var constraintTextBuilder = new widgets.ConstraintTextBuilder(this.labelFetcher);

		
		// TODO: The constraint text builder should operate on the collection, not individual models
		this.constraints.bind("add", function(model) {
			
			constraint = model.get("value");
			var task = constraintTextBuilder.fetchSimpleText(constraint);
			$.when(task).then(function(labelStr) {
				
				model.set({simpleLabel: labelStr});
				
			}).fail(function() {
				console.error("Error fetching label for model: ", model);
				//alert("Error fetching label for " + model.get("id"));
			});
			
			
		});
		
		
		this.constraints.bind("add", function(model) {
			var id = model.id;

			self.constraintSelections.add(new widgets.SelectionModel({id: id, isSelected: true}));
			
			self.updateConstraints();
		});
		
		this.constraints.bind("remove", function(model) {
			var id = model.id;
			
			var model = self.constraintSelections.get(id);
			if(model) {
				model.destroy();
			}
			
			self.updateConstraints();
		});
		
		
		/*
		//this.col = new SelectionModel();
		
		this.col.bind("add", function(item) {
			alert("" + item);
		});
		
		console.log("Sigh", this.col);
		
		this.col.add(new SelectionItem({isSelected: true}));
		this.col.add(new SelectionItem());
		*/
		
		
		
		
		
		
		
		
		
		//var tmpSelMod = {};

		this.facetBox = facetbox.createFacetBox(this.constraintSelections); //tmpSelMod); //this.constraintSelections);
		
		this.facetBox.view.$().autoHeight();
		
		this.facetBox.bind("clickFacetValues", function(ev, payload) {
			
			//console.log("PAYLOAD", payload.model);
			
			var path = payload.model.get("path");
			
			//var relativePath = payload.model.get("path");			
			//var basePath = self.queryGeneratorGeo.getNavigationPath();
			//var path = basePath.concat(relativePath);
			
			
			
			var widget = payload;
			
			
			var queryGeneratorGeoTmp = self.queryGeneratorGeo.navigateToPath(path);
			var queryGeneratorGeo = queryGeneratorGeoTmp.copyExcludeConstraint(path);

			var task = self.fetchGeoms(queryGeneratorGeo, self.viewState.bounds);
			$.when(task).then(function(geomIndex) {

				var uriStrs = geomIndex.visibleGeoms;
				var uris = _.map(uriStrs, function(str) { return sparql.Node.uri(str); });

				console.log("GeomUris", uris);

//				alert("uris are:" + uris.length);

				var queryGenerator = queryGeneratorGeo.forGeoms(uris);		
				var executor = new widgets.QueryExecutor(self.sparqlService, queryGenerator);

				widget = payload.getFacetValues();
				//console.log("Widget is", widget);
			
				//var viewModel = new widgets.ListModelExecutor(executor, 50);

				widget.setLabelFetcher(self.labelFetcher);
				widget.getModel().limit = 10;
				widget.getModel().setExecutor(executor);
				//widget.setModel(viewModel);
			
			
				// Note: Binding of the clickConstraint event is done in the facetbox widget
				/*
				widget.getView().getListWidget().bind("selected", function(ev, item) {
					/ *
					console.log("item", item);
				
					var parent = item.item.getParent();
					var path = parent.model.get("path");
					console.log("path", path);* /
				
				
				
				
					//var path = item.item.model.get("path");
					//alert("boo");
					//console.log("boo", path);
				});*/
			
				//widget.setModel(executorModel);
				widget.refresh();
			});


		});
		
		this.facetBox.bind("clickConstraint", function(ev, payload) {

			var path = payload.path;

			//console.log("payload", payload.item);
			var item = payload.item;
			
			var facetValue = item.model.get("data").data;

			//console.log("facetValue", facetValue);
			
			var constraints = self.queryGeneratorGeo.getConstraints();

			//var constraints = self.constraints;
			console.log("path is", path);
			
			
			var constraint =
				new facets.PathConstraint(path,
						new facets.ConstraintEquals(new sparql.NodeValue(facetValue)));

			var id = "" + constraint;
			var model = new ns.ConstraintModel({id: id, value: constraint});
			
			//console.log("Setting constraint", constraint);
			
			//var isEnabled = !this.model.get("isEnabled");
			// console.log("Enabled:", isEnabled, id);
			if (item.isSelected()) {
				//alert("boo");
				//constraints.add(constraint);
				self.constraints.add(model);
			} else {
				self.constraints.remove(id);
				//constraints.remove(constraint);
			}			
			
			//alert("Constraints", self.constraints);
		});
		

		this.facetBox.bind("pivot", function(ev, payload) {
			//console.log(payload.model.get("data"));
			var path = payload.model.get("data").path;
			
			var currentPath = self.executor.getNavigationPath();
			//this.queryGeneratorGeo.setNavigationPath(path);
			if(!currentPath) {
				currentPath = new facets.Path();
			}
			
			var concat = currentPath.concat(path);
			
			//alert("" + path);
			self.setNavigationPath(concat);
			//alert("Pivot");
		});
		
		
		//facetbox.createFacetBox(); 
		//this.facetbox = facetbox.createFacetBox(this.facetConfig, queryGenerator, basePath, facetBoxBackend, callbacks);
    	//$('#tabs a:eq(3)').tab('show');

		$$.document.append(this.facetBox, "#tabs-content-facets");
		
//    	$('#tabs a:first').tab('show');

		// TODO [HACK] Not sure why we need this hack of switching tabs
		// But without it, the facets do not show from the start; only after switching the incoming/outgoing tabs
		this.facetBox.view.$('a:eq(1)').tab('show');
		this.facetBox.view.$('a:first').tab('show');
		
		//$(window).resize();
		
		
		//this.constraintWidget = facetbox.createConstraintList(this.constraintSelections); //constraints);
		
		

		/*
		var ListModelBackbone = function(backboneCollection) {
			this.backboneCollection = backboneCollection;
		};
		
		ListModelBackbone.prototype.fetchData = function() {
			return this.backboneCollection;
		};
		*/
		
		
		
		var ListModelConstraints = function(constraints) {
			this.constraints = constraints;
		};
		
		ListModelConstraints.prototype.fetchData = function() {
			var result = _.map(constraints.idToConstraints.entries, function(constraints, id) {
				var tmp = {data: constraints, id: id, label: id};
				
				console.log("Constraint Entry", tmp);
				
				return tmp;
			});
			
			return result;
		};
		
				
		
		var ItemViewConstraint = widgets.ItemViewLabel.extend({
			events: {
				'click span': function(ev, payload) {
					
					var id = this.model.get("id");
					self.constraints.remove(id);
				}
			}
		});
		
		
		var constraintItemRenderer = new widgets.RendererItemView(this.constraintSelections, null, ItemViewConstraint, {
			label: "simpleLabel"
			/*
			label: function(model) {
				//console.log("AOEU", model); return "" + model.id;
				
				constraint = model.get("value");
				var result = constraintTextBuilder.fetchSimpleText(constraint);
				
				return result;
			}*/
		});
		
		this.constraintWidget = new widgets.ListView({
			el: $("#ssb-constraints"),
			collection: this.constraints,
			itemRenderer: constraintItemRenderer
		});
		
		
		/*
		$(this.constraintWidget).bind("click", function(ev, payload) {
			
			var id = payload.model.get("id");
			self.constraints.remove(id);
			//self.constraintSelections.remove(id);
			
			//payload.model.destroy();
			//console.log("moooo", payload);
			//alert("got it" + JSON.stringify(payload));
		});
		*/
		
		//$$.document.append(self.constraintWidget, $("#ssb-constraints"));
		
		
		// React to changes of the constraints
		/*
		$(constraints).bind("change", function(ev, data) {
			
			self.repaint();
			
			console.log("change-event", data);
			
			
			_.each(data.added, function(entry) {
				self.constraintWidget.controller.addItem(entry.key, entry.value);
				$(window).resize();
			});
			
			_.each(data.removed, function(entry) {
				self.constraintWidget.controller.removeItem(entry);
				$(window).resize();
			});
			
			
		});
		*/
		
		
		// Do layout
		$(window).resize();
		
		
		this.loadStartTab();
	};
	
	
	/**
	 * The start tab contains elements for selecting a starting point for
	 * filtering and navigation.
	 * 
	 * There are different starting points:
	 * - Everything
	 *     Initially, all resources are selected.
	 * - Class
	 *     The instances of a class serve as starting points for navigation
	 * - Geo
	 *     Geo resources are selected by default
	 * 
	 * For each selection there is a small controller that configures the app accordingly:
	 * If geo is chosen, special logic is required to create the polygon view:
	 * - A lat/long constraint is set as the geo-constraint factory
	 * - A projection path "isMemberOfWay georss" is declared
	 * - The projection path is bound to the WKT-source of the view
	 * 
	 * 
	 *             
	 * Note that in general the app distinguishes between selection and projection/view binding.
	 * 
	 * 
	 */
	ns.AppController.prototype.updateGraphs = function() {
		
		
		console.log("data is", this.graphSelectionModel);
		
		var nodes = _.map(this.graphSelectionModel, function(item) {
			// Pitfall: Attaching jQuery events to an object adds new keys
			// So if we do it that way, our code must be able to deal with it.
			return item && item.data ? item.data.data : null;
		});

		var uris = _.filter(nodes, function(node) { return sparql.Node.isUri(node); });
		
		var defaultGraphs = _.map(uris, function(uri) { return uri.value; });
		
		// Flush the caches
		// FIXME Add support for caching when graphs (or other state properties) change
		this.hashToCache = {};
		
		console.log("New defaultGraphs", defaultGraphs);
		this.sparqlService.setDefaultGraphs(defaultGraphs);
		this.repaint();
	};
	
	
	ns.AppController.prototype.updateStartingPoint = function() {
		// The twist here is, that the label of the starting point depends on the selected language.
		
		
		
	};
	
	
	ns.AppController.prototype.loadStartTab = function() {

		
		this.classSelectionModel = {};
		this.graphSelectionModel = {};

		
		var self = this;

		var isWriteEnabled = false;
		$(this.graphSelectionModel).bind("change", function() {

			//alert("test");
			console.log("self.graphSelectionModel", self.graphSelectionModel);
			self.updateGraphs();
			
			
			// TODO Hack set the write graph if there is only only graph selected
			// TODO Hack the graph selection should be sent to the event bus, and the RDFauthor adapter should listen.
			
			var selected = null;
			$.each(self.graphSelectionModel, function(key, value) {
				if(value.isSelected) {
					//console.log("The selected value is", value);
					if(!selected) {
						selected = value.data.data.value;
					} else {
						selected = null;
						return false;
					}
				}
			});
	
			if(isWriteEnabled) {
				
				if(selected) {
					alert("Writes will go to graph: " + selected);
				} else {
					alert("Writes disabled because there is no longer a selected graph");
				}
			
				if(selected) {
					RDFAUTHOR_DEFAULT_GRAPH=selected;
					//console.log("Checking:", $('link[rel="update:sourceGraph"]'));
					$('link[rel="update:queryEndpoint"]').attr({about: selected});
					$('link[rel="update:updateEndpoint"]').attr({about: selected});
					$('link[rel="update:sourceGraph"]').attr({about: selected, href: selected});
					$('link[rel="update:defaultGraph"]').attr({about: selected, href: selected});
				}
				
			}
			
		});
		


		{
	    	var conceptVar = sparql.Node.v("c");
	    	//var conceptElement = queryUtils.createElementGetNamedGraphsFallback(conceptVar);
	    	var conceptElement = queryUtils.createElementGetNamedGraphs(conceptVar);
	    	var concept = new facets.ConceptInt(conceptElement, conceptVar);
	
	    	var queryGenerator = new widgets.QueryGenerator(concept);
	    	
			var executor = new widgets.QueryExecutor(this.sparqlService, queryGenerator);

			var viewModel = new widgets.ListModelExecutor(executor, 50);
			var renderer = new widgets.RendererCheckItem(this.graphSelectionModel, function(data) { return "" + data.data; });
			var executorWidget = new widgets.ExecutorListWidget(viewModel, renderer, this.labelFetcher);
				
			/*
			executorWidget.getView().getListWidget().bind("selected", function(ev, payload) {

				/*
				var data = payload.item.model.get("data").data;
				if(payload.checked) {
					self.graphSelectionModel[data] = {data: data, isSelected: true};
				} else {
					delete self.graphSelectionModel[data];
				}
				 				
				$(self.graphSelectionModel).trigger("change", self.graphSelectionModel);
				* /
				// FIXME This is hacky: We should depend on a model/collection event - not on a view one. 
			})*/;
	
			$$.document.append(executorWidget.getView(), $("#ssb-graph-selection"));
			
			//executorWidget.getView().getListWidget().refresh();
			executorWidget.refresh();
		}


		
		{
	    	var conceptVar = sparql.Node.v("c");
	    	var conceptElement = queryUtils.createElementGetClasses(conceptVar);
	    	var concept = new facets.ConceptInt(conceptElement, conceptVar);
	
	    	var queryGenerator = new widgets.QueryGenerator(concept);
			var executor = new widgets.QueryExecutor(this.sparqlService, queryGenerator);

			
			var viewModel = new widgets.ListModelExecutor(executor, 50);
			var renderer = new widgets.RendererCheckItem(this.classSelectionModel, function(data) { return "" + data.data; });
			var executorWidget = new widgets.ExecutorListWidget(viewModel, renderer, this.labelFetcher);
				
			executorWidget.getView().getListWidget().bind("selected", function(ev, payload) {

				var data = payload.item.model.get("data").data;
				if(payload.checked) {
					self.classSelectionModel[data] = {data: data, isSelected: true};
				} else {
					delete self.classSelectionModel[data];
				}
				 
				console.log("classSelection:" , self.classSelectionModel);
				
				
			});
	
			$$.document.append(executorWidget.getView(), $("#ssb-class-selection"));
			
			//executorWidget.getView().getListWidget().refresh();
			executorWidget.refresh();
		}

		// Resource search
		{
	    	var conceptVar = sparql.Node.v("c");
	    	var conceptElement = queryUtils.createElementAnyResource(conceptVar);
	    	var concept = new facets.ConceptInt(conceptElement, conceptVar);
	
	    	var queryGenerator = new widgets.QueryGenerator(concept);
			var executor = new widgets.QueryExecutor(this.sparqlService, queryGenerator);

			
			var viewModel = new widgets.ListModelExecutor(executor, 10);
			var renderer = new widgets.RendererString(function(data) { return "" + data.data.value; }, {label: function(data) { return "" + data.label; }});

			
			var executorWidget = new widgets.ExecutorListWidget(viewModel, renderer, this.labelFetcher);
				
			executorWidget.getView().getListWidget().bind("click", function(ev, payload) {
				
				var node = payload.data.data;
				
				self.showDescription([node]);
				$("#box-facts").show();
				//console.log("payload", payload);
				/*
				alert("yay");
				var data = payload.item.model.get("data").data;
				if(payload.checked) {
					self.classSelectionModel[data] = {data: data, isSelected: true};
				} else {
					delete self.classSelectionModel[data];
				}
				 
				console.log("classSelection:" , self.classSelectionModel);
				*/
				
				
			});
	
			$$.document.append(executorWidget.getView(), $("#ssb-resource-search"));
			
			//executorWidget.getView().getListWidget().refresh();
			executorWidget.refresh();
		}
		
		/*
		setTimeout(function() {
			this.doLayout();
		}, 1000);
		*/


		/*
		{
	    	var conceptVar = sparql.Node.v("c");
	    	var conceptElement = queryUtils.createElementGetClasses(conceptVar);
	    	var concept = new facets.ConceptInt(conceptElement, conceptVar);
	
	    	var queryGenerator = new widgets.QueryGenerator(concept);
	    	
			var model = widgets.createListModelLabels(this.sparqlService, queryGenerator, {distinct: true}, this.labelFetcher);
			var listWidget = widgets.createListWidget(model, widgets.checkItemFactory);
			listWidget.sort();
			
			
			listWidget.bind("click", function(ev, payload) {
				alert(payload.checked + " " + payload.item.model.get("label"));
			});
	
			$$.document.append(listWidget, $("#ssb-class-selection"));
		}
		*/

		/*
		console.log("PaginatorX", widgets.Paginator);
		var paginator = widgets.createPaginator();//$$(widgets.Paginator); //widgets.createPaginatorWidget(5);

		paginator.setMaxSlotCount(5);
		paginator.setPageCount(10);
		paginator.setCurrentPage(5);
		paginator.refresh();
		
		
		paginator.bind("click", function(ev, payload) {
			alert("click" + payload.getTargetPage());
		});
		
		//paginatorWidget.trimToSize(0);
		
		$$.document.append(paginator, $("#ssb-class-selection"));
		*/

		
		//var sparqlListWidget = $$(widgets.ListWidgetSparql);
		/*
		var sparqlListWidget = widgets.createListWidgetSparql();
	
		
		$$.document.append(sparqlListWidget, $("#ssb-class-selection"));
		
		sparqlListWidget.refresh();
		*/
    	//var conceptElement = queryUtils.createElementGetNamedGraphsFallback(conceptVar);

	};
	
	ns.AppController.prototype.setNavigationPath = function(path) {
		
		
		console.log("NavigationPath", path);
		//var concat = this.queryGenerator.navigationBreadcrumb.concat(breadcrumb);
		var concat = path;
		
		this.queryGeneratorGeo.setNavigationPath(path);
		//this.queryGenerator.navigationBreadcrumb = concat;

		//this.facetState = new facetbox.FacetState(this.facetConfig, this.queryGenerator.getInferredDriver(), concat);
		//this.facetState = new facetbox.FacetState(this.facetConfig, this.queryGenerator.concept, concat);
		//this.facetbox.controller.setState(this.facetState);
		//this.facebox.controller.setState(queryGenerator);
		console.log("TODO - Set the FacetSate");
		
		//this.facetbox.controller.refresh();
		//this.updateFacetsRec(this.executor, this.facetBox);
		this.updateFacets();

		
		var uris = _.map(path.getSteps(), function(step) {
			return step.propertyName;
		});
		
		var self = this;
		
		this.labelFetcher.fetch(uris).pipe(function(data) {

			self.breadcrumbWidget.controller.setPath(path, data.uriToLabel);
			self.repaint();

		});

	};

	
	ns.AppController.prototype.centerOnResource = function(node) {
		
	};
	
	ns.AppController.prototype.showDescriptionOld = function(nodes) {		
		this.factBox.controller.setNodes(nodes);
	};
	
	ns.AppController.prototype.initEvents = function() {
		var self = this;
		
		/*
		$("#facets").bind("ssb_facetschanged", function(event, ui) {
			//var sel = $("#facets").data;
			//console.log("Selection is:");
			//console.log(self.selection);
			//self.queryFactory.setClassFilter(self.selection);
			
			
			self.mapEvent();
		});*/
		
		$("#instances").bind("ssb_instancesclick", function(event, ui) {
			self.onInstanceClicked(ui.key);		
		});

		$("#instances").bind("ssb_instanceshover", function(event, ui) {
			self.onInstanceHover(ui.key);
		});
		
		$("#instances").bind("ssb_instancesunhover", function(event, ui) {
			self.onInstanceUnhover(ui.key);
		});

		
		$("#map").bind("ssb_maponmarkerclick", function(event, ui) {
			self.onInstanceClicked(ui.nodeId);
		});
		
		
		
		$("#map").bind("ssb_maponmapevent", function(event, ui) {
		
			self.repaint();
			// Bind the map-event to the updateXXXXX
			// If everytihng is done, fire an event updateView
			// Refresh the view whenever it is sent
		});
		
		
		Dispatcher.register("selection", null, function(ev, uri) {
			// Fetch 
		});
		
		Dispatcher.register("selection", null, function(ev, uri) {
			
			// TODO FFS Why did I use select rather than construct here?
			$.when(queryUtils.fetchStatementsBySubjects(self.sparqlService, [uri]))
				.then(function(jsonRdf) {													
						// If there are any same as links, try to fetch something from
						// additional sources (e.g. DBpedia)
						console.log(jsonRdf);
						//var objects = JsonRdfExtractionUtils.extractObjects(jsonRdf, uri, "http://www.w3.org/2002/07/owl#sameAs");
						var tags = extractTags(jsonRdf);
						
						objects = "owl:sameAs" in tags ? tags["owl:sameAs"] : [];
						
						for(prefix in self.prefixToService) {
							var service = self.prefixToService[prefix];
						
							for(var i = 0; i < objects.length; ++i) {
								
								var object = objects[i]; //.value;
								if(object.startsWith(prefix)) {
									fetchStatementsBySubject(service, [object], function(jsonRdf2) {
										//self.facts.setData(uri, [jsonRdf, jsonRdf2]);
									});
								}
								
							}
						}
				});
		});

	};

	
	/**
	 * Flushes the given resources from all caches that are known by the controller.
	 * Specifically:
	 * - label cache
	 * - geometry cache
	 * - quad tree cache (nodes containing flush resources are reset to "not loaded")
	 * 
	 */
	ns.AppController.flushCacheResources = function(nodes) {

		// TODO Implement me
		
	};



	/**
	 * Fetch geometries within the given bounds
	 * 
	 * @param queryGeneratorGeo
	 * @param bounds
	 * @returns
	 */
	ns.AppController.prototype.fetchGeoms = function(queryGeneratorGeo, bounds) {
		var task = this.fetchNodesGeo(queryGeneratorGeo, bounds);

		var result = $.Deferred();

		var self = this;
		$.when(task).then(function(nodes) {
			
			var geomIndex = ns.indexGeoms(nodes, bounds);

			var tmp = {
				bounds: bounds,
				nodes: nodes,
				visibleGeoms: geomIndex.visibleGeoms,
				geomToPoint: geomIndex.geomToPoint};

			result.resolve(tmp);

		}).fail(function() {
			result.fail();
		});

		return result.promise();
	};
	
	
	/**
	 * TODO Factor out into a separate object
	 * 
	 */
	ns.AppController.prototype.fetchNodesGeo = function(queryGeneratorGeo, bounds) {
		//console.log("Refresh bounds", bounds);

		// TODO Check if another refresh request is running.
		// If so, make this request wait for the other running one, thereby
		// replacing any other already pending request

		var disableConstraints = true;


		console.log("Constraints", queryGeneratorGeo.getConstraints());
		var queryGenerator = queryGeneratorGeo.forGlobal({disableConstraints: disableConstraints});
		
		console.log("The queryGenerator is: ", queryGeneratorGeo);
		
		var baseElement = queryGenerator.createDriverValues().getElement();
		//var baseElement = this.queryGenerator.forGlobal(); //elementFactoryGeo.concept.element;
		 
		var hash = baseElement.toString();
		console.log("Query hash (including facets): ", hash);
		
		
		var cacheEntry = this.hashToCache[hash];
		if(!cacheEntry) {
			var backendFactory = new qtc.BackendFactory(this.sparqlService, queryGeneratorGeo);
			cacheEntry = new qtc.QuadTreeCache(backendFactory, this.labelFetcher, this.geomPointFetcher, this.options.config.quadTree);
			//cacheEntry = new qt.QuadTree(maxBounds, 18, 0);
			this.hashToCache[hash] = cacheEntry;
		}
		
		var result = cacheEntry.load(bounds);
		return result;
	};
	

    /**
     * Given bounds and a set of quat tree nodes, this method
     * Creates a map resource->geometry and also determines which resources are visible
     */
	ns.indexGeoms = function(nodes, bounds) {

		if(!nodes) {
			// FIXME undefined 'nodes' happens, if there was an empty set of geometries or
			// a query failed. this should be trapped at a different location than here
			console.log("No nodes to index, should not happen; using workaround");
			
			nodes = [];
		}

		
		var globalGeomToPoint = {};
		var visibleGeoms = [];

		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];

			var nodeBounds = node.getBounds();
			
			var databank = node.data.graph;
			var geomToPoint = node.data.geomToPoint ? node.data.geomToPoint : ns.extractGeomsWgs84(databank);

			
			//console.debug("geomToPoint", geomToPoint);
			//console.debug("Databank for node ", i, databank);
			
			// Attach the info to the node, so we reuse it the next time
			node.data.geomToPoint = geomToPoint;
			
			_.extend(globalGeomToPoint, geomToPoint);

			var geoms = _.keys(geomToPoint);
		
		
			// If the node is completely in the bounds, we can skip the boundary check
			if(bounds.contains(nodeBounds)) {
			
				visibleGeoms.push.apply(visibleGeoms, geoms);
			
			} else if(bounds.isOverlap(nodeBounds)) {
		
				//for(var geom in geoms) {
				for(var j = 0; j < geoms.length; ++j) {
					var geom = geoms[j];
					var point = geomToPoint[geom];
				
					//console.log("point is: ", geomToPoint);
				
					if(bounds.containsPoint(point)) {
						visibleGeoms.push(geom);
					}
				}
			
			}
		}

		return {geomToPoint: globalGeomToPoint, visibleGeoms: visibleGeoms};
    };

	
	
	ns.AppController.prototype.refresh = function(olBounds) {		
		var self = this;
		
		// We are dealing with quad-tree-bounds here
		var bounds = toQuadTreeBounds(olBounds);
		//console.log("Refresh bounds", bounds);

		var promise = this.fetchNodesGeo(this.queryGeneratorGeo, bounds);
		
		$.when(promise).then(function(nodes) {
			
			// TODO Properly check if an old request is running
			// and schedule the next request
			if(!nodes) {
				console.log("Skipping refresh because as update is in progress");
				return;
			}
			
			//console.debug("Loaded " + nodes.length + " nodes");
			//console.debug("Nodes are:", nodes);
			self.updateViews(new ns.ViewState(nodes, bounds));
		});
	};
		
	ns.AppController.prototype.repaint = function() {

		var map = this.map;
		var bounds = map.getExtent().transform(map.projection, map.displayProjection);

		/*
		var minZoom = 15;
		
		if(zoom < minZoom) {
			self.notificationScheduler.schedule(function() { notify("Info", "Disabled fetching data because current zoom level " + zoom + " is less than the minimum " + minZoom + ".");});
			return;
		}*/
		
		this.refresh(bounds, true);
	};
		
	ns.AppController.prototype.addFactSources = function(prefixToService) {
		var self = this;

		for(key in prefixToService) {
			self.prefixToService[key] = prefixToService[key];
		}
	};
		
	ns.AppController.prototype.setQueryFactory = function(queryFactory) {
		this.queryFactory = queryFactory;
	};
	
	ns.AppController.prototype.setFacetConfig = function(facetConfig) {
		this.facetConfig = facetConfig;
	};
	
	
	ns.AppController.extract = function(jsonRdf) {
		//for(var i = 0; i < jsonRdfs.result.bindings)
	};

	/*
	ns.createMap = function(databank, pattern, keyVar, valVar) {
		var result = {};

		rdf.where("?" + keyVar + " " + geo.long + " ?" + valVar).each(function() {
			result[this[keyVar] = this..value;
		});
	};*/
	

	/**
	 * Indexes geometries in the given datastore
	 * 
	 * NOTE Assumes that geometries only have a single lon/lat pair.
	 * If there are multiple ones, an arbitrary pair is chosen.
	 * If there is a lat but no long, or vice versa, the resource does not appear in the output
	 * 
	 * @returns
	 */
	ns.extractGeomsWgs84 = function(databank) {
		var rdf = $.rdf({databank: databank});
		
		var result = {};
		
		var geomToX = {};
		var geomToY = {};
		
		rdf.where("?geom " + geo.lon + " ?x .").each(function() {
			geomToX[this.geom.value] = this.x.value;
		});
		
		rdf.where("?geom " + geo.lat + " ?y").each(function() {
			geomToY[this.geom.value] = this.y.value;
		});
		
		for(var geom in geomToX) {
			if(geom in geomToY) {
				var point = new qt.Point(geomToX[geom], geomToY[geom]);
				result[geom] = point;
			}
		}
		
		return result;		
	};

	/**
	 * OPTIMIZE Actually we could cache the counts for nodes that are
	 *     completely contained in the visible area and thereby
	 *     avoid further queries.
	 * 
	 * @param bounds
	 * @param nodes
	 * 
	 */
	/*
	ns.AppController.prototype.updateFacetCounts = function(bounds, nodes) {
		var query = this.createFacetQueryCountVisible(bounds, nodes);
		
		//console.log("Facet Query - Visible", this.viewState.visibleGeoms.length);
		//console.log("Facet Query", query);
		
		this.sparqlService.executeSelect(query.toString(), {
			success: function() {
				//alert("Wee");
			}
		});
	};
	*/
	
	

	/**
	 * Create the model for the facet box
	 * 
	 */
	ns.postProcessFacets = function(facets, pivotFacets, labelFetcher) {
		// Index pivot facets
		var pivotStrs = {};
		_.each(pivotFacets.facets, function(item) {
			
			if(item.isUri()) {
				pivotStrs[item.value] = true;
			}
		});

		// Check pivot state
		//var collection = [];
		_.each(facets, function(item) {
			// Note: Facets must all be URIs, but better check
			var isPivotable = true;
			//var isPivotable = false;

			if(item.node.isUri()) {
				var str = item.node.value;
				
				if(str in pivotStrs) {
					isPivotable = true;
				}
			}

			item.countStr = "" + item.count;			
			item.isPivotable = isPivotable;
		});

		
		// Fetch labels
		var uriStrs = [];
		
		_.each(facets, function(item) {
			if(item.node.isUri()) {
				uriStrs.push(item.node.value);
			}
		});
		
		var promise = labelFetcher.fetch(uriStrs).pipe(function(labels) {

			_.each(facets, function(item) {
				var label = labels.uriToLabel[item.node.value];
				
				item.label = label ? label.value : "" + item.node;
			});
			
			return facets;
		});			
			
		return promise;
	};

	
	
	ns.AppController.prototype.updateFacetsRecDir = function(executor, view, isInverse, path) {
		
		var self = this;
		
		//var pivotFacets = executor.fetchPivotFacets();
		var pivotFacetsTask = $.Deferred();
		pivotFacetsTask.resolve({});
		
		
		var facetCountTask = executor.fetchCountDistinctFacets(isInverse); 
		
		
		// Fetches the count of distinct objects per property
		//$.when(executor.fetchValuesCounted(), pivotFacetsTask).then(function(facetCollection, pivotFacets) {
		$.when(facetCountTask, pivotFacetsTask).then(function(facetCollection, pivotFacets) {
			
			//console.log("FacetCollection: ", facetCollection);
			
			var promise = ns.postProcessFacets(facetCollection, pivotFacets, self.labelFetcher);
			
			$.when(promise).then(function(facetCollection) {
				
				_.each(facetCollection, function(item) {
					var propertyName = item.node.value;
					var step = new facets.Step(propertyName, isInverse);
					item.path = path.copyAppendStep(step);
				});
				
				//console.log("FacetSatus", facetCollection);
				//view.setCollection(facetCollection);
				view.getModel().setData(facetCollection);
				
				view.refresh();
			});
			
		});		
	};
	
	ns.AppController.prototype.updateFacetsRec = function(executor, view) {
		
		var path = new facets.Path(); //executor.getNavigationPath();
		
		this.updateFacetsRecDir(executor, view.getOutgoing(), false, path);
		this.updateFacetsRecDir(executor, view.getIncoming(), true, path);

		/*
		executorIncoming = executor.navigateToFacets(-1);
		executorOutgoing = executor.navigateToFacets(1);
		
		this.updateFacetsRecDir(executorOutgoing, view.getOutgoing(), false, path);
		this.updateFacetsRecDir(executorIncoming, view.getIncoming(), true, path);
		*/
	};
	
	
	ns.AppController.prototype.updateFacets = function() {
		if(!this.executor) {
			console.log("No executor set (yet)");
			return;
		}
		
		this.updateFacetsRec(this.executor, this.facetBox);
	};
	
	/**
	 * Updates the facet counts considering all constraints.
	 * This deviates from the usual facet behaviour:
	 * Usally the count of a specific facet is based on an exclusion of all of its constraints.
	 * 
	 * @param uris
	 */
	ns.AppController.prototype.updateFacetCountsGeom = function(uris) {
		
		if(uris.length === 0) {

			this.facetBox.getIncoming().getModel().setData([]);
			this.facetBox.getOutgoing().getModel().setData([]);
			
			this.facetBox.getIncoming().refresh();
			this.facetBox.getOutgoing().refresh();
			
			return;
		}
		
		var queryGenerator = this.queryGeneratorGeo.forGeoms(uris);		
		this.executor = new widgets.QueryExecutor(this.sparqlService, queryGenerator);
		
		
		this.updateFacets();
		
		
			/*
		executor.fetchValues().pipe(function(data) {
			alert(data);
		});
		*/
		
		//var generator = widgets.QueryGenerator(concept, );
		
		
		if(true) {
			//console.warn("Facets disabled", uris);
			return;
		}
		
		// TODO Remove below
		/*
		var self = this;
		var concept = queryUtils.createFacetQueryCountVisibleGeomNested(this.queryGenerator, uris);
		
		
		// Set the concept of the facet state to the new query element
		//this.facetState.concept = concept;
		
		//console.log("Facet Query - Visible", this.viewState.visibleGeoms.length);
		//console.log("Facet Query", concept);

		
		// clear the pathManager
		//var propertyToNode = this.facetState.pathManager.getRoot().outgoing;
		//this.facetState.clearCounts();
		
		if(!uris.length) {
			//self.facetbox.controller.setState(null);
			self.facetbox.controller.refresh();
			return;
		}

		var state = this.facetState;
		//var node = state.pathManager.getRoot();
		
		//this.queryGenerator.getNavigationTarget();
		
		var node = this.queryGenerator.navigationBreadcrumb.targetNode;
		

		//var breadcrumbs = this.facetbox.controller.getVisibleBreadcrumbsValues();
		// TODO: The method should return a pure json object such as an array holding information about the
		// steps and sub-steps
		// [ {step: foo, page: 2, facetValues: [baaaar], children: [ ] ]  
		var stepStrToItem = this.facetbox.controller.getVisiblePropertiesValues();

		
		var self = this;
		
		// Once all facet counts have been obtained, and the pivoting abilities have been checked, update the view
		var facetCountTask = queryUtils.fetchFacetCountsGeomRec(this.sparqlService, this.labelFetcher, state, node, stepStrToItem);
		var pivotCheckTask = queryUtils.fetchPivotFacets(this.sparqlService, state.concept);
		
		$.when(facetCountTask, pivotCheckTask).then(function(facetState, pivotFacets) {
			
			var steps = _.map(pivotFacets, function(item) { return new facets.Step(item.value); });
			
			//alert("Pivoting enabled facets:" + pivotFacets);
			
			//console.log("facetstate", facetState);
			//self.facetbox.controller.setState(state);
			self.facetbox.controller.refresh();
			self.facetbox.controller.setPivotFacets(steps);

		})
		*/
		
	};

	
	ns.AppController.getLoadedNodes = function(nodes) {
		var result = [];
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			if(!node.data.tooManyItems || node.isLoaded) {
				result.push(node);
			}
		}
		
		return result;
	};
	


	
	ns.AppController.prototype.updateViews = function(newState) {

		// TODO Somehow make this work (by magic is would be fine)
		// TODO Facet counts are updated as a reaction to fetching the new state
		//this.updateFacetCounts(newState.bounds, newState.nodes);
		
		// node       1      2
		// change  
		// instances (only applicable for partially visible nodes)
		
		console.log("Updating views");
		
		var oldVisibleGeoms = this.viewState.visibleGeoms;
		
		var nodes = newState.nodes;
		var bounds = newState.bounds;
		
		this.viewState = newState;
		
		var nodeIndex = ns.indexGeoms(nodes, bounds);
		var globalGeomToPoint = nodeIndex.geomToPoint;
		var visibleGeoms = nodeIndex.visibleGeoms;
		
		this.viewState.visibleGeoms = visibleGeoms;
		
/*
		// Get all geometries from the databanks
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			var nodeBounds = node.getBounds();
			
			var databank = node.data.graph;
			var geomToPoint = node.data.geomToPoint ? node.data.geomToPoint : ns.extractGeomsWgs84(databank);

			
			//console.debug("geomToPoint", geomToPoint);
			//console.debug("Databank for node ", i, databank);
			
			// Attach the info to the node, so we reuse it the next time
			node.data.geomToPoint = geomToPoint;
			
			_.extend(globalGeomToPoint, geomToPoint);
			
			var geoms = _.keys(geomToPoint);
			
			
			// If the node is completely in the bounds, we can skip the boundary check
			if(bounds.contains(nodeBounds)) {
				
				visibleGeoms.push.apply(visibleGeoms, geoms);
				
			} else if(bounds.isOverlap(nodeBounds)) {
			
				//for(var geom in geoms) {
				for(var j = 0; j < geoms.length; ++j) {
					var geom = geoms[j];
					var point = geomToPoint[geom];
					
					//console.log("point is: ", geomToPoint);
					
					if(bounds.containsPoint(point)) {
						visibleGeoms.push(geom);
					}
				}
				
			}
		}
*/
		
		//console.debug("Number of visible geoms", visibleGeoms.length);

		// Combine the datastores
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			
			var databank = node.data.graph;

			// TODO Rather adding the datastore directly
			// invoke a method that activates the node in the cache
			this.multiGraph.addDatabank(databank);
		}		

		/*
		 * Load:
		 * 1) relations between geometries and features
		 * 2) labels of the features 
		 */
		var geomToFeatures = collections.BidiMultiMap.createWithSet();
		var geomToFeatureCount = {};
		
		var idToLabel = {}; // TODO I don't think there is much point in having the labels here already; they should be fetched separately using the LabelFetcher
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];

			if(!node.isLoaded) {
				continue;
			}

			var databank = node.data.graph;
			var rdf = $.rdf({databank: databank});
			
			rdf.where("?id " + geovocab.geometry + " ?geom").each(function() {
				//console.log("entry", this.geom, this.id);
				geomToFeatures.put(this.geom.value, this.id.value);
			});

			rdf.where("?geom " + appvocab.featureCount + " ?featureCount").each(function() {
				
				//geomToFeatureCount.put(this.geom.value, this.featureCount.value);
				geomToFeatureCount[this.geom.value] = this.featureCount.value;
			});


			rdf.where("?id " + rdfs.label + " ?label").each(function() {
				idToLabel[this.id.value] = this.label.value;
			});			
		}
		
		//console.debug("View refresh status", geomToFeatureCount, idToLabel);
		//console.debug("Visible geoms", visibleGeoms);
		//console.log("idToLabel", idToLabel);
		
		// TODO Separate the following part into a new method
		// (First part does the data fetching/preparation,
		// second part applies it)
		
		
		var addedGeoms    = _.difference(visibleGeoms, oldVisibleGeoms);
		var removedGeoms  = _.difference(oldVisibleGeoms, visibleGeoms);

		
		/*
		 * Updates of views below
		 * 
		 */

		var useOldMethod = false;
		if(useOldMethod) {

			this.mapWidget.removeItems(removedGeoms);
		/*
		for(var i = 0; i < removedGeoms.length; ++i) {
			//var geom = removedGeoms[i];
			
			
		}*/
				
		
			for(var i = 0; i < addedGeoms.length; ++i) {
				var geom = addedGeoms[i];
	
				var point = globalGeomToPoint[geom];
				var lonlat = new OpenLayers.LonLat(point.x, point.y);
				
				//console.debug("Adding map item", geom, point, lonlat);
				this.mapWidget.addItem(geom, lonlat, true);
			}
		}

		var boxIds = _.keys(this.mapWidget.idToBox);
		for(var i = 0; i < boxIds.length; ++i) {
			var boxId = boxIds[i];
			this.mapWidget.removeBox(boxId);
		}
		
		
		// If true, shows the box of each node
		var alwaysShowBoxes = false;
		
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			
			if(!node.isLoaded || alwaysShowBoxes) {
				
				//console.log("adding a box for", node);
				this.mapWidget.addBox(node.getBounds().toString(), toOpenLayersBounds(node.getBounds()));
			}
		}
		
		
		//this.geomToId.clear();
		//this.geomToId.addMultiMap(geomToId);

		//console.debug("Number of visible geoms", visibleGeoms.length);

		//console.log("label:", this.nodeToLabel);
		// HACK Find a better way to deal with the instances
		this.viewState.geomToFeatures = geomToFeatures;

		// TODO: idToLabel should be the replaced by a LabelFetcher
		this.viewState.idToLabel = idToLabel;
		
		
		
		this.setVisibleInstances(visibleGeoms, geomToFeatureCount, globalGeomToPoint);
		
		
		//this.setInstances(visibleGeoms, geomToFeatures, idToLabel);
		
		
		
		/*
		for(id in idToLabel) {
			var label = idToLabel[id];
			this.nodeToLabel.put(id, label);
		}
		*/

		// TODO HACK If nothing is selected, update the instance list
		/*
		if(!this.selectedFeature) {
			this.instanceWidget.refresh();
		}
		*/

		//this.updateInstanceList(visibleGeoms, geomToFeatureCount);
		
		
		//var visibleGeomNodes = visibleGeoms.map(function(x) { return sparql.Node.parse(x); });
		var visibleGeomNodes = _.map(visibleGeoms, function(x) { return sparql.Node.uri(x); });
		
		
		
		// HACK for testing the browser with Sparqlify
		var facetsEnabled = true;
		
		if(facetsEnabled) {
			this.updateFacetCountsGeom(visibleGeomNodes);
		}
		
	};

	/**
	 * This is the new version for setting the visible instances
	 * 
	 * @param geoms
	 * @param geomToFeatures
	 * @param idToLabel
	 */
	ns.AppController.prototype.setVisibleInstances = function(geoms, geomToFeatureCount, geomToPoint) {

		var self = this;
		
		
		this.labelFetcher.fetch(geoms).pipe(function(labelInfo) {

			
			var geomToAbbr = self.abbreviator.allocAll(geoms);
			
			self.visibleInstances.reset();

			// Prepare the abbreviator for future abbr-assignments
			self.abbreviator.nextContext();

			var models = _.map(geoms, function(geomStr) {
				var uriToLabel = labelInfo.uriToLabel;

				var geom = sparql.Node.uri(geomStr);
				var label = geomStr in uriToLabel ? uriToLabel[geomStr].value : geomStr;
				var point = geomToPoint[geomStr];
				var lonlat = new OpenLayers.LonLat(point.x, point.y);
				var abbr = geomToAbbr[geomStr];
				
				var model = new ns.ModelInstance({
					id: geom,
					uri: geom,
					count: geomToFeatureCount[geomStr],
					abbr: abbr,
					label: abbr + ": " + label,
					lonlat: lonlat
					// Required legacy attributes... get rid of them soon
					//point: lonlat,
					//nodeId: geom
				});
			
				return model;
			});

			models.sort(function(a, b) { return a.get("abbr") - b.get("abbr"); });
			
			self.visibleInstances.add(models);
		});
		
	};
	
	
	
	ns.AppController.prototype.setInstances = function(geoms, geomToFeatures, idToLabel) {
		
		
		this.nodeToLabel.clear();
		for(var i = 0; i < geoms.length; ++i) {
			var geom = geoms[i];

			
			var features = geomToFeatures.get(geom);
			if(!features) {
				continue;
			}
			
			for(var j = 0; j < features.length; ++j) {
				var feature = features[j];
				
				
				var label = idToLabel[feature];
				this.nodeToLabel.put(feature, label);				
			}
		}		
	};
	
	
	ns.AppController.prototype.setSparqlService = function(sparqlService) {
		this.sparqlService = sparqlService;
		this.labelFetcher = new labelUtils.LabelFetcher(this.sparqlService);
		
		this.queryCacheFactory = new labelUtils.QueryCacheFactory(this.sparqlService);
		this.geomPointFetcher = new labelUtils.GeomPointFetcher(this.queryCacheFactory);
	};
		
	ns.AppController.prototype.updateClasses = function(uris) {
		var self = this;
		
		var facets = uris;
		
		// Check for which facets we need to load the labels
		var labelsToLoad = [];
		var iconsToLoad = [];
		var superClassesToFetch = [];
		for(var uri in facets) {
			var label = self.schemaLabels.get(uri, self.activeLanguage);
			if(!label) {
				labelsToLoad.push(uri);
			}
			
			var icon = self.schemaIcons.get(uri);
			if(!icon) {
				iconsToLoad.push(uri);
			}

			if(!(uri in self.classHierarchy.forward.entries)) {
				superClassesToFetch.push(uri);
			}
		}

		// TODO Update Icons and Labels
		this.backend.fetchLabels(labelsToLoad, self.activeLanguage, function(map) {self.updateLabels(labelsToLoad, map); });
		this.backend.fetchIcons(iconsToLoad, function(map) {self.updateIcons(iconsToLoad, map); } );
		
		//this.fetchSuperClasses(superClassesToLoad);
		
		//this.backend.fetchTransitiveSuperClasses(superClassesToFetch, self.classHierarchy);
		fetchTransitiveSuperClasses(self.sparqlService, superClassesToFetch, self.classHierarchy);
		removeReflexivity(self.classHierarchy);
		
		//$("#facets").data("ssb_facets").setFacets(uris);		
	};
			


	/* Replaced with backbone
	ns.AppController.prototype.updateInstanceList = function(visibleGeoms, geomToFeatureCount) {
		
		var self = this;
		var columnCount = 3;

		//var self = this;
		var dataDictionary = {};
		dataDictionary.items = [];
		
		
		//var uriStrs = _.keys(geomToFeatureCount);
		this.labelFetcher.fetch(visibleGeoms).pipe(function(labelInfo) {

			var uriToLabel = labelInfo.uriToLabel;
			
			
			var list = $$({}, "<div><ul></ul></div>", '& span { cursor:pointer; }', {});
			
			//var template = "{.section items}<ol class='ssb-container'>{.repeated section @}<li>{label} ({count})</li>{.end}</ol>{.or}<p>(No matching instances)</p>{.end}";
			
			_.each(visibleGeoms, function(geomStr) {

				var geom = sparql.Node.uri(geomStr);

				var label = geomStr in uriToLabel ? uriToLabel[geomStr].value : geomStr;
				var count = geomToFeatureCount[geomStr];
				
				
				var model = {uri: geom, count: count, label: label};
				//dataDictionary.items.push({uri: geom, count: count, label: label});			

				var item = $$(model, "<li><span data-bind='label' /> (<span data-bind='count' />)</li>", {
					'click span': function() { self.showFeatureDetails(geom); } 
				});
				
				list.append(item, "ul:first");
			});

			//var htmlStr = jsontemplate.expand(template, dataDictionary);

			//var targetElement = $("#instances-tab-content");
			var targetElement = $("#tabs-content-instances");

			
			// TODO [Hack] Not sure if this is safe, as we do not destroy the agility object!
			$(targetElement).children().remove();

			
			//console.log("TEST target", targetElement);
			
			var agility = $.data(targetElement, "agility");
			//console.log("TEST set", agility);
			if(agility) {
				console.log("Destroying");
				agility.destroy();
			}

			$$.document.append(list, targetElement);
			$.data(targetElement, "agility", list);
			
			var verify = $.data(targetElement, "agility");
			//console.log("TEST Verify", verify);
			
			//targetElement.html(htmlStr);
		});
		
	};
	*/
	
	
	ns.AppController.prototype.updateLabels = function(uris, map) {					
		var self = this;
		//var uris = labelsToLoad;
		
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
		//for(uri in uris) {
			var label = uri in map ? map[uri] : "(missing label)";
			
			self.schemaLabels.put(uri, self.activeLanguage, label);
		}
		//console.log(self.schemaLabels);
	};
			
	ns.AppController.prototype.updateIcons = function(uris, map) {

		var self = this;

		//var uris = iconsToLoad;
		
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
		//for(uri in uris) {
			var icon = uri in map ? map[uri] : "(missing icon)";
			
			self.schemaIcons.put(uri, icon);
		}


		/*
		var self = this;

		for(var i = 0; i < map.lenght; ++i) {
			var uri = uris[i];
			var icon = uri in map ? map[uri] : null;
			
			self.schemaIcons.put(uri, icon);
		}*/
	};
		
		
	ns.AppController.prototype.updateNodeTypes = function(nodeToTypes) {
		for(var id in nodeToTypes) {
			this.nodeToTypes.putAll(id, nodeToTypes[id]);
		}
	};
		
		
	ns.AppController.prototype.updateNodeLabels = function(nodeToLabel) {
		this.nodeToLabel.clear();
		
		for(var id in nodeToLabel) {
			//self.nodeToLabels.putAll(id, nodeToLabels[id]);
			this.nodeToLabel.put(id, nodeToLabel[id]);
		}				
	};
		
	ns.AppController.prototype.updateNodePositions = function(nodeToPoint) {
		console.log("updateNodes");
		var self = this;

		//self.markerLayer.clearMarkers();
		
		// Remove all types and labels
		//self.nodeToTypes.removeAll(getKeys(self.nodeToPos));
		//self.nodeToLabel.clear(); //removeAll(getKeys(self.nodeToPos));
		//self.nodeToPos.clear();
		
		for(var s in nodeToPoint) {

			//self.nodeToTypes.put(s, o.nodeToType[s]);
			//self.nodeToLabels.put(s, this.activeLanguage, o.nodeToLabels[s]);
			//self.nodeToLabel.put(s, o.nodeToLabel[s]);
			self.nodeToPos.put(s, nodeToPoint[s]);
			

			/*
			var point = o.nodeToPoint[s];
			if(point) {
				addMarker(point, s);
			}*/			
		}
		
		this.mapWidget.setNodeToPos(self.nodeToPos.entries);
	};
	
		
		
		
		
	
	ns.AppController.prototype.updateGeometries = function(data) {
		var self = this;
		var map = this.map;
		
		this.wayToFeature.clear();
		
		for(var key in data) {
			var tmpPoints = data[key];

			// Transform all of the points into screen(?)-space
			var points = [];
			for(var i = 0; i < tmpPoints.length; ++i) {
			 	var point = tmpPoints[i];

			 	points.push(point.transform(map.displayProjection, map.projection));
			}
		
			//console.log(map);
			
		    // create a polygon feature from a list of points
		    var linearRing = new OpenLayers.Geometry.LinearRing(points);
		    var style_green =
		    {
		        strokeColor: "#00AA00",
		        strokeOpacity: 0.7,
		        strokeWidth: 2,
		        fillColor: "#00FF00",
		        fillOpacity: 0.2
		    };

		    var polygonFeature = new OpenLayers.Feature.Vector(linearRing, null, style_green);
			
		    // TODO: Add the polygon to the model
		    self.wayToFeature.put(key, polygonFeature);
		    //self.vectorLayer.addFeatures([polygonFeature]);
		}
	};
	
	ns.AppController.prototype.enableHighlight = function(feature) {
		//alert("highlight");
	};
	
	ns.AppController.prototype.disableHighlight = function(feature) {
	};
	
	/*
	ns.AppController.prototype.enableHighlight = function(feature) {
		var icon = feature.marker.icon;
		
		// FIXME Update the position when changing the size
		// FIXME Make the handling of the icons nicer
		if(icon.url === config.markerUrlDefault) {
			icon.setUrl(config.markerUrlSelected);
		}
		
		var size = new OpenLayers.Size(icon.size.w + 15, icon.size.h + 15);
        icon.setSize(size);  
        //console.debug("Icon", icon);
	};
		
	ns.AppController.prototype.disableHighlight = function(feature) {
		var icon = feature.marker.icon;
		var size = new OpenLayers.Size(icon.size.w - 15, icon.size.h - 15);
		icon.setSize(size);
		icon.setUrl(config.markerUrlDefault);		
	};
	*/
		
	ns.AppController.prototype.onInstanceUnhover = function(uriStr) {
		this.clearHighlight();
	};

	ns.AppController.prototype.clearHighlight = function() {
		var hoveredItems = this.hoveredItems;
		for(var i = 0; i < hoveredItems.length; ++i) {
			var item = hoveredItems[i];

			var olFeature = this.nodeToFeature.get(item);

			if(olFeature) {
				this.disableHighlight(olFeature);
			}
		}
		
		this.hoveredItems = [];		
	};
	
	ns.AppController.prototype.onInstanceHover = function(uriStr) {
		if(!this.viewState.geomToFeatures) {
			console.log("No geom to feature mapping; viewState is", viewState);
			return;
		}
		var featureToGeoms = this.viewState.geomToFeatures.inverse.entries;
		
		var obj = featureToGeoms[uriStr];
		if(!obj) {
			console.log("No geometries for feature", uriStr, featureToGeoms);
			return;
		}
		
		var geoms = _.keys(obj);
		//console.debug("Geometries for uri", uriStr, geoms);

		this.clearHighlight();
		
		for(var i = 0; i < geoms.length; ++i) {
			var geom = geoms[i];
			
			//console.debug("Geom & olFeature", geom, olFeature);
			this.hoveredItems.push(geom);
			
			var olFeature = this.nodeToFeature.get(geom);
			if(olFeature) {
				this.enableHighlight(olFeature);
			}

		}		
	};
		
	
	ns.AppController.prototype.showFeatureDetails = function(geom) {
		var el = $('#box-resources');
		
		el.empty();
		

		var listQf = createListQueryFactory(geom);

		
		var list = createList(sparqlService, listQf, el);
		var infobox = createInfobox(sparqlService, el);

		
		list.model.on("change:selected", function() {
			
			var node = list.model.get("selected");
			
			//console.log("boo", arguments);
			
			//var geom = sparql.Node.uri("http://linkedgeodata.org/triplify/node1681920624");
			
			//var queryGenerator = queryGeneratorGeo.forGeoms([geom]);			
			//var concept = queryGenerator.createDriverValues();

			var query = widgets.createPartnerQuery(node);
			var queryFactory = new QueryFactoryQuery(query);
			
			console.log("Query is now: ", queryFactory.createQuery());
			
			//var queryFactory = new QueryFactoryQueryGenerator(queryGenerator);
			
			/*
			var tableConfig = createExecutorConcept(sparqlService, concept);
			*/
			var tableModel = infobox.browseConfig.config.tableModel;
			tableModel.set({queryFactory: queryFactory});
			
			//console.log("Table model: ", tableModel);//.browseConfig.tableModel);
		});
		
		el.show();
	};
	

	ns.AppController.prototype.onInstanceClicked = function(uriStr) {
		node = sparql.Node.uri(uriStr);
	};
	
	ns.AppController.prototype.showDescription = function(nodes) {		
		this.factBox.controller.setNodes(nodes);
	};

	
	
	
	/**
	 * @deprecated
	 * @param uriStr
	 */
	ns.AppController.prototype.onInstanceClicked = function(uriStr) {
		Dispatcher.fireEvent("selection", uriStr);
		
		console.log("Clicked: " + uriStr);
 
		//var node = sparql.Node.parse(uriStr);
		node = sparql.Node.uri(uriStr);
		this.showDescription([node]);
		
		
		var self = this;

		if(this.selectedFeature) {
			this.disableHighlight(this.selectedFeature);
		}
		
		var feature = self.nodeToFeature.get(uriStr);
		
		// If we click the same marker again, we de-select it
		if(this.selectedFeature === feature) {
			this.selectedFeature = null;
			
			this.setInstances(this.viewState.visibleGeoms, this.viewState.geomToFeatures, this.viewState.idToLabel);
			//this.instanceWidget.refresh();

			return;
		}
		
		if(this.selectedFeature) {
			this.setInstances([uriStr], this.viewState.geomToFeatures, this.viewState.idToLabel);
		}
		//this.instanceWidget.refresh();

		
		this.selectedFeature = feature;

		if(feature) {
			this.enableHighlight(feature);
		}
        
        // Show fact box
        $("#box-facts").show();
	};
	
	
	
	

	/**
	 * @deprecated
	 * 
	 * 
	 * @param geom
	 */
	ns.AppController.prototype.showFeatureDetailsOld = function(geom) {
		
		var self = this;
		
		// Create the resource query element
		console.log("QueryGenerator", self.queryGeneratorGeo);
		var queryGenerator = self.queryGeneratorGeo.forGeoms([geom]);

		
		//var element = s

		//var featureVar = sparql.Node.v(self.queryGenerator.geoConstraintFactory.breadcrumb.sourceNode.variable);
		//var featureVar = self.queryGenerator.getInferredDriver().variable;
		//var concept = new facets.ConceptInt(element, featureVar);
		var concept = queryGenerator.createDriverValues();
		
		//var element = this.queryGenerator.ForGeoms(geomUriNodes);
		//var queryFactory = new ns.QueryFactory(element, this.featureVar, this.geomVar);

		console.log("Driver", geom, concept);
		
		
		// TODO We need the query element and the geom variable
		var backend = new widgets.ResourceListBackendSparql(self.sparqlService, concept, self.labelFetcher);
		
		// HACK Removes all hacks.
		$("#box-resources .hack").remove();

		var widget = widgets.createResourceListWidget(backend, {
			onClick: function(uri) {
												
				
				self.showDescription([uri]);
				$("#box-facts").show();
				
				
				var collection = widgets.createPartnerCollection(uri, self.sparqlService, self.labelFetcher);
				
				// HACK Removes all hacks.
				$("#box-resources .hack").remove();
				

				
				//$("#box-resources").append('<hr class="hack"/>');

				var el = $('<table class="table hack"/>');
				$("#box-resources").append(el);

				
				//console.log("Element", el);
				
				var view = new widgets.PartnerView({
					el: el,
					collection: collection
				});
				
				collection.sync();
				
			}
		});
		
		if(self.prevResWidget) {
			self.prevResWidget.destroy();
		}
		
		self.prevResWidget = widget;
		
		
		var resourceListBox = $("#box-resources");
		$$.document.append(widget, resourceListBox);
		resourceListBox.show();
		//widget.view.$().show();
		
		/*
		var targetElement = $("#box-test");
		targetElement.show();
		
		// TODO [Hack] Not sure if this is safe, as we do not destroy the agility object!
		$(targetElement).children().remove();

		$$.document.append(widget, targetElement);
		*/
		
		/*
		widgets.createResourceTable([geom], self.labelFetcher, columnCount).pipe(function(ag) {
			$$.document.append(ag, "#box-test");
		});*/
		
		
		
		
		//alert(this.model.get("uri"));
	};

	
	
	ns.AppController.doSearch = function() {
		//notify("Info", "Search");
		//$("#searchResults").html("searching");
		$("#searchResults").slideUp("slow");
		
		
		var searchValue = encodeURI($('#search-field').val());
	
		//var url = "src/main/php/search_proxy.php?query=" + searchValue;
		
		var url = "http://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(searchValue);
		
		var promise = $.ajax({url: url, crossDomain: true, dataType: 'json', type: "GET"});
		promise.done(function(response) {				
			var json = response;
			
			//console.log("displayName", json);

			
			var items = [];
			for(var i = 0; i < json.length; ++i) {
				
				var item = json[i];				
									
				
				var nameParts = item.display_name.split(",");
								
				var tmp = {
						name: nameParts[0],
						description: nameParts[1],
						lonlat: new OpenLayers.LonLat(item.lon, item.lat)
				};
				
				
				items.push(tmp);
			}
			
			$("#searchResults").data("ssb_search").setItems(items);
			$("#searchResults").slideDown("slow");
		}).fail(function() {
			alert("Error communicating with the place name search service");
		});
	};
	
})(jQuery);

