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

	
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	var facetbox = Namespace("org.aksw.ssb.widgets.facetbox");
	var widgets = Namespace("org.aksw.ssb.widgets"); 

	
	var collections = Namespace("org.aksw.ssb.collections");

	
	var config = Namespace("org.aksw.ssb.config");
	
	var ns = Namespace("org.aksw.qa-dashboard.app.controllers");

	ns.AppController = function(options) {
		this.sparqlService = options.sparqlService;
		this.labelFetcher = new labelUtils.LabelFetcher(this.sparqlService);
		
		
	};
	
	ns.AppController.prototype.run = function() {

		this.loadDatasetWidget();
		
	};
	
	
	
	ns.AppController.prototype.loadDatasetWidget = function() {

		// Resource search
		{
	    	var driverVar = sparql.Node.v("c");
	    	var driverElement = queryUtils.createElementAnyResource(driverVar);
	    	var driver = new facets.Driver(driverElement, driverVar);
	
	    	var queryGenerator = new widgets.QueryGenerator(driver);
	    	var queryProjector = new widgets.QueryProjector(queryGenerator);
	    	
	    	
			var executor = new widgets.TabelQueryExecutor(this.sparqlService, queryProjector);

			
			var viewModel = new widgets.ListModelExecutor(executor, 10);
			var renderer = new widgets.RendererString(function(data) { return "test" + data.data.value; }, {label: function(data) { return "" + data.label; }});

			
			var executorWidget = new widgets.ExecutorListWidget(viewModel, renderer, this.labelFetcher);
				
			executorWidget.getView().getListWidget().bind("click", function(ev, payload) {
				/*
				var node = payload.data.data;
				
				self.showDescription([node]);
				*/
				//$("#box-facts").show();
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
	

			$$.document.append(executorWidget.getView(), $("#datasets"));
			
			//executorWidget.getView().getListWidget().refresh();
			executorWidget.refresh();
		}
		
		
	};
	
	
})(jQuery);