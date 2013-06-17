




/**
 * options = {
 * 	sparqlService
 *  queryGenerator
 *  
 * }
 * 
 */
var ResourceDetailsController = function(options) {
	//this.options = options;
	this.sparqlService = sparqlService;
	this.queryGeneratorGeo = queryGeneratorGeo;
};


ResourceDetailsController.prototype = {
		
		updateDescription: function(geom) {
		},

		updateRelatedResources: function(geom) {
			//console.log("QueryGenerator", self.queryGeneratorGeo);
			var queryGenerator = this.queryGeneratorGeo.forGeoms([geom]);			
			var concept = queryGenerator.createDriverValues();
			
			
			
			
			//var element = this.queryGenerator.ForGeoms(geomUriNodes);
			//var queryFactory = new ns.QueryFactory(element, this.featureVar, this.geomVar);

			//console.log("Driver", geom, concept);
			
			
			// TODO We need the query element and the geom variable
			//var backend = new widgets.ResourceListBackendSparql(self.sparqlService, concept, self.labelFetcher);

		}
		
	
};



/**
 * A widget for browsing data based on an executor
 * 
 */
ns.ExecutorListWidget = function(executor, conceptModel, paginatorModel) {
	
	this.executor = executor;
	this.conceptModel = conceptModel;
	//this.syncCollection
	
	this.paginatorModel = paginatorModel;
	
	this.bindEvents();
};

ns.ExecutorListWidget.prototype = {
		
		bindEvents: function() {

			var self = this;
			
			var model = this.conceptModel;

			
			model.on("change", function() {
				self.refresh();
			});
		},
		
		refreshPageCount: function() {
			var subExecutor = this.executor.filterRegex(model.searchString, "i");
			
			widgets.updatePageCount(this.paginatorModel, subExecutor, this.conceptModel.itemsPerPage);
		},
		
		changePage: function() {
			
			var page = this.conceptModel.get("currentPage");
			
			var m = self.getModel();

			var paginatorModel = self.getView().getPaginator().model;
			//var paginatorModel = self.getView().getPaginator().getModel();

			
			var limit = this.conceptModel.get("itemsPerPage");
			var offset = limit ? (page - 1) * limit : 0;
			
			m.offset = offset;

			paginatorModel.set({currentPage: page});
			
			//result.getListWidget().refresh();
			this.sync();
		},
		
		sync: function() {
			
		}
};

		
			/*
			model.on("change:searchText", function() {
				self.refresh();
			});
			
			model.on('change:currentPage', function(event, pageRequest) {
				self.refresh();
				
				//var paginatorModel = self.getView().getPaginator().model;
				//paginatorModel.set({currentPage: pageRequest});			
			});
			
			
			//var paginatorModel = result.getPaginator().model;
	
			
			result.getPaginator().model.on("change", function(model) {
				var page = model.get("currentPage");
				
				//alert(page);
				//var offset = itemsPerPage * (currentPage - 1);
	
				
				var m = self.getModel();
	
				var paginatorModel = self.getView().getPaginator().model;
				//var paginatorModel = self.getView().getPaginator().getModel();
	
				
				var limit = m.limit;
				
				var offset = limit ? (page - 1) * limit : 0;
				
				m.offset = offset;
				//paginatorModel.setCurrentPage(page);
				paginatorModel.set({currentPage: page});
				
				//alert("offest" + offset);
				//paginatorModel.setCurrentPage(page);
				
				//result.getPaginator().refresh();
				result.getListWidget().refresh();
			});
		},

		getView: function() {
			return this.listView;
		},


		getModel: function() {
			return this.model;
		},

		setModel: function(model) {
			if(!model) {
				model =  new ns.ListModelExecutor(null, 50);
			}
			
			this.model = model;
			var m = this.wrapModel(model);
	
			this.listView.getListWidget().setModel(m);
		},

		setLabelFetcher: function(labelFetcher) {
			this.labelFetcher = labelFetcher;
			
			var m = this.wrapModel(this.model);
			this.listView.getListWidget().setModel(m);
		},
		
		wrapModel:  function(model) {
			//var executor = model.getExecutor();
			var postProcessor = new ns.PostProcessorLabels(this.labelFetcher);
			var result = new ns.PostProcessorModel(model, postProcessor);

			return result;
		}
};






var MyInstanceView = Backbone.View.extend({
	// Inner view: Related resource list + domain specific list
	
});


ns.AppController.prototype.showDescription = function(nodes) {		
	this.factBox.controller.setNodes(nodes);
};



/**
 * This method performs hig
 * 
 */
var onInstanceClicked = function(appContext, geomStr) {

	
	
	// FIXME Make this part of the appContext, e.g. appContext.dom.resourceBox
	/*
	resourceListBox.removeChildren();
	var resourceListBox = $("#box-resources");
	*/

	var instanceViewModel = Backbone.Model.extend({
		defaults: {
			// resource, relatedResources, domainFP7 model
		}
	}) ;
	
	
	
};



var defaultInstanceClickHandler = function(appContext, uriStr) {
 
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
	
	
	
	
	var showFeatureDetails = function(geom) {
		
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