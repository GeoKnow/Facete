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
	

	var charts = Namespace("org.aksw.qa-dashboard.charts");
	var chartUtils = Namespace("org.aksw.utils.charts"); 

	var ns = Namespace("org.aksw.qa-dashboard.app.controllers");

		
	
	ns.ItemRendererBackbone = function(viewCtor) {
		this.viewCtor = viewCtor;
	};
	
	ns.ItemRendererBackbone.prototype.create = function(model, parent) {
		var view = new this.viewCtor({model: model});
		
		return view.render().el;
	};
	
	
	ns.ItemViewLinksetThumbnail = Backbone.View.extend({
		    tagName: 'li',
		    attributes: {style: 'float: left'},
		    events: { 
//		      'click span.swap':  'swap',
//		      'click span.delete': 'remove'
		    },    
		    initialize: function(){
		      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

		      this.model.bind('change', this.render, this);
		      this.model.bind('remove', this.unrender, this);
		    },
		    render: function(){

			       //html = '<span style="color:black;">' + JSON.stringify(this.model.attributes) + '</span>';

		    	
//		    	var precision = parseFloat(this.model.get("precision").value);
//		    	var recall = parseFloat(this.model.get("recall").value);
		    
		    	
		    	var data = {
		    		name: this.model.get("id"),
		    		author: 'TODO',
		    		precision: parseFloat(this.model.get("precision").value),
		    		recall: parseFloat(this.model.get("recall").value)
		    	};

				var chartSpec = charts.createLinksetChartSpec(data);

		        var imgUrl = chartUtils.chartToImage(chartSpec, 300, 200);
		        
		        var html =
		        	'<div style="float: left; margin: 5px">' +
		        	'    <img src="' + imgUrl + '" /><br />' +
		        	'    <div class="warning-icon-tiny" /> x 4' + //'<div style="clear:both; float:left;" />' +
		        	'    <div class="error-icon-tiny" /> x 5'+
		        	'</div>'; 

		    	
			     //html = '<span style="color:black;">' + precision + "  " + recall + '</span>';

		    	
		    	
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
	
	ns.AppController = function(options) {
		this.sparqlService = options.sparqlService;
		this.labelFetcher = new labelUtils.LabelFetcher(this.sparqlService);
		
		
	};
	
	ns.AppController.prototype.run = function() {

		this.loadDatasetWidget();
		
	};
	
	
	/**
	 * 
	 */
	ns.LinksetPreviewRenderer = function() {
		
	};
	
	
	
	ns.instanciateJson = function(resultSet, template) {
		
	};
	
	
	ns.AppController.prototype.loadDatasetWidget = function() {

		/*
		Actually, sparql-json bindings would be nice
		var jsonTemplate {
			evaluations: [{}]
			posEstPrecLow: new facets.Path.fromString("http://qa.linkeddata.org/ontology/assessment http://qa.linkeddata.org/ontology/posEstPrecLow")
		
		}
		*/
		/*
		var jsonTemplate = {
			id: 'http://qa.linkeddata.org/ontology/assessment',
			precision: {
				collection: 'array',
				//types: 'double',
				value: 'http://qa.linkeddata.org/ontology/assessment http://qa.linkeddata.org/ontology/posEstPrecLow',
			},
			recall: 'http://qa.linkeddata.org/ontology/assessment http://qa.linkeddata.org/ontology/posRec'
		};
		*/
		
		// Resource search
		{
	    	var driverVar = sparql.Node.v("c");
	    	var driverElement = new sparql.ElementTriplesBlock([new sparql.Triple(driverVar, rdf.type, sparql.Node.uri("http://qa.linkeddata.org/ontology/LinkingProject"))]);
	    	//var driverElement = queryUtils.createElementAnyResource(driverVar);
	    	var driver = new facets.Driver(driverElement, driverVar);
	
	    	var queryGenerator = new widgets.QueryGenerator(driver);
	    	var queryProjector = new widgets.QueryProjector(queryGenerator);
	    	
	    	
	    	queryProjector.addPath(new facets.Path(), sparql.Node.v('id'));
	    	queryProjector.addPath(new facets.Path.fromString("http://qa.linkeddata.org/ontology/assessment http://qa.linkeddata.org/ontology/posEstPrecLow"), sparql.Node.v('precision'));
	    	queryProjector.addPath(new facets.Path.fromString("http://qa.linkeddata.org/ontology/assessment http://qa.linkeddata.org/ontology/posRec"), sparql.Node.v('recall'));
	    	
	    	
	    	
	    	var q = queryProjector.createQueryRows();
	    	//alert(q.toString());
	    	
			var executor = new widgets.TableQueryExecutor(this.sparqlService, queryProjector);

			
			var paginatorModel = new widgets.PaginatorModel();

			var viewModel = new widgets.TableModelExecutor(executor, 10);
			
			
			
			var syncer = new widgets.TableModelBackboneSync(viewModel);
			var collection = syncer.getCollection();
			
			
			
			var listView = new widgets.ListView({
				el: $("#list"),
				attributes: {style: {'list-style': 'none'}},
				collection: collection,
				itemRenderer: new ns.ItemRendererBackbone(ns.ItemViewLinksetThumbnail)
			});
	
			

			var itemsPerPage = 10;
			$.when(executor.fetchCountRows()).then(function(countInfo) {
				var pageCount = parseInt(countInfo.count / itemsPerPage + 0.5);
				paginatorModel.set({pageCount: pageCount});
			});
			
			paginatorModel.bind('change', function(model) {
				var currentPage = model.get("currentPage");
				var offset = itemsPerPage * (currentPage - 1);
				console.log("Set offset", offset, itemsPerPage, model);
				viewModel.setOffset(offset);
				syncer.sync();				
			});
						
			
			
			
			var paginator = new widgets.ViewPaginator({el: null, model: paginatorModel});//$$(widgets.Paginator); //widgets.createPaginatorWidget(5);
			
			$(paginator).bind('change-page', function(event, pageRequest) {
				console.log('changeRequest', pageRequest);
				paginatorModel.set({currentPage: pageRequest});
			});

			
			$("#list-paginator").append(paginator.render().el);
			//this.setPaginator(paginator);

			//$$.document.append(paginator, );
			
			//paginator.refresh();

			
			
			
			//console.log("List el", listView.el);
			
			
			
			
			//$('#list').append(listView.el);

			
			
			/*
			var task = viewModel.fetchData();
			
			$.when(task).then(function(data) {
				alert("yay:" + data);
			}).fail(function() {
				console.error("Fail!");
			});
			*/

			
			
			
			
			/*
			var renderer = new widgets.RendererString(function(binding, metadata) { return "test" + binding; }, {label: function(data) { return "" + data.label; }
			});

			
			var executorController = new widgets.TableExecutorController(renderer);
			*/
			
			
			/*
			var executorWidget = new widgets.ExecutorListWidget(viewModel, renderer, this.labelFetcher);
				
			executorWidget.getView().getListWidget().bind("click", function(ev, payload) {
				/*
				var node = payload.data.data;
				
				self.showDescription([node]);
				* /
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
				* /
				
				
			});
			*/
	
/*
			$$.document.append(executorWidget.getView(), $("#datasets"));
			
			//executorWidget.getView().getListWidget().refresh();
			executorWidget.refresh();
			*/
		}
		
		
	};
	
	
})(jQuery);