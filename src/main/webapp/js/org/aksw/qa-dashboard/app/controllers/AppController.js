(function($) {
		
	
	/**
	 * TODO: Create sliders for numeric values:
	 * rangeDefinition = {
	 *     defined: {min: 0, max: 1}, // The defined range for the property
	 *     dataset: {min: 0.1, max: 0.5}, // The range for the current dataset
	 *     context: {min: 0.5, max: 0.6}, // The range considering the context of the current facet constraints
	 * }
	 *
	 * TODO: We have the focus and the navigation path, but we need to separate: the resources to return, and the facets to filter
	 * 
	 */
	
	
	
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


	
	/**
	 * A view which supports changing the renderer of a collection,
	 * such as switching between a thumbnail and list view.
	 * 
	 * TODO Switching between views may change the "itemsPerPage" constant.
	 * 
	 * NOT WORKING YET
	 * 
	 */
	ns.MetaView = Backbone.View.extend({
	    tagName: 'li',
	    attributes: {style: 'float: left'},
	    events: { 
//	      'click span.swap':  'swap',
//	      'click span.delete': 'remove'
	    },    
	    initialize: function() {
	      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	      this.model.bind('change', this.render, this);
	      this.model.bind('remove', this.unrender, this);
	    },
	    render: function(){

		       //html = '<span style="color:black;">' + JSON.stringify(this.model.attributes) + '</span>';

	    	
//	    	var precision = parseFloat(this.model.get("precision").value);
//	    	var recall = parseFloat(this.model.get("recall").value);
	    
	    	
	    	var data = {
	    		name: this.model.get("projectName"),
	    		author: this.model.get("authorName"),
	    		precision: parseFloat(this.model.get("precision").value),
	    		recall: parseFloat(this.model.get("recall").value)
	    	};

			var chartSpec = charts.createLinksetChartSpec(data);

	        var imgUrl = chartUtils.chartToImage(chartSpec, 300, 200);
	        
	        var html =
	        	'<div style="float: left; margin: 5px">' +
	        	'    <a href="#">' +
	        	'        <img src="' + imgUrl + '" /><br />' +
	        	'        <div class="warning-icon-tiny" /> x 4' + //'<div style="clear:both; float:left;" />' +
	        	'        <div class="error-icon-tiny" /> x 5' +
	        	'    </a>' +
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

		
		
		
		
		
		
		
		
	
		
	/**
	 * 
	 * @param fnPromise A function that returns a promise that upon completion return the new state
	 */
	/*
	ns.slaveCollection = function(masterCollection, slaveCollection, fnPromise) {
		masterCollection.on("add", function(model) {
			
			var clone = jQuery.extend(true, {}, model.attributes);

			
			var promise = fnPromise(clone);
			$.when(promise).done(function(newState) {
				// TODO Treat request order properly
				slaveCollection.add(newState);
				//var newState = fn(model.attributes);
			});
		});
		
		masterCollection.on("remove", function(model) {
			// TODO Delete by id AND/OR cid
			slaveCollection.remove(model.id);			
		});
	};
	*/
	
	
	/* Now in ListWidgetBase
	ns.ItemRendererBackbone = function(viewCtor) {
		this.viewCtor = viewCtor;
	};
	
	ns.ItemRendererBackbone.prototype.create = function(model, parent) {
		var view = new this.viewCtor({model: model});
		
		return view.render().el;
	};
	*/
	
	
	ns.ConstraintModel = Backbone.Model.extend({
		defaults: {
			value: null,
			/*label: "" // FIXME As there could be many ways for crafting constraint labels, 
				//associating a label only makes sense for view-models;*/  
	    }
	});
	
	ns.ConstraintCollection = Backbone.Collection.extend({
		model: ns.ConstraintModel
	});

	
	
	ns.ItemViewLinksetThumbnail = Backbone.View.extend({
		    tagName: 'li',
		    attributes: {style: 'float: left'},
		    events: { 
//		        'click a':
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
		    		name: this.model.get("projectName"),
		    		author: this.model.get("authorName"),
		    		precision: parseFloat(this.model.get("precision").value),
		    		recall: parseFloat(this.model.get("recall").value)
		    	};

				var chartSpec = charts.createLinksetChartSpec(data);

		        var imgUrl = chartUtils.chartToImage(chartSpec, 300, 200);
		        
		        var html =
		        	'<div style="float: left; margin: 5px">' +
		        	'    <a href="#">' +
		        	'        <img src="' + imgUrl + '" /><br />' +
		        	'        <div class="warning-icon-tiny" /> x 4' + //'<div style="clear:both; float:left;" />' +
		        	'        <div class="error-icon-tiny" /> x 5' +
		        	'    </a>' +
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
	
/*	
	ns.getLabel = function(uri, labelInfo) {
		var label = labelInfo.uriToLabel[uri.value];
		
		var result = label ? label.value : "" + uri;
		
		return result;
	};
*/
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

		var self = this;

		
		
		this.itemsPerPage = 8;


		// Resource search
		{
	    	var conceptVar = sparql.Node.v("c");
	    	var conceptElement = new sparql.ElementTriplesBlock([new sparql.Triple(conceptVar, rdf.type, sparql.Node.uri("http://qa.linkeddata.org/ontology/LinkingProject"))]);
	    	//var conceptElement = queryUtils.createElementAnyResource(conceptVar);
	    	var concept = new facets.ConceptInt(conceptElement, conceptVar);
	
	    	this.queryGenerator = new widgets.QueryGenerator(concept);
	    	var queryProjector = new widgets.QueryProjector(this.queryGenerator);
	    	
	    	
	    	
	    	this.queryGeneratorFacets = new widgets.QueryGenerator(concept);
	    	this.queryGeneratorFacets.setNavigationPath(facets.Path.fromString("http://qa.linkeddata.org/ontology/assessment"));
	    	
	    	var q = this.queryGeneratorFacets.createQueryValues();
	    	console.log("Query " + q);
	    	
	    	
	    	queryProjector.addPath(new facets.Path(), sparql.Node.v('project'));
	    	queryProjector.addPath(new facets.Path.fromString("http://qa.linkeddata.org/ontology/assessment http://qa.linkeddata.org/ontology/posEstPrecLow"), sparql.Node.v('precision'));
	    	queryProjector.addPath(new facets.Path.fromString("http://qa.linkeddata.org/ontology/assessment http://qa.linkeddata.org/ontology/posRec"), sparql.Node.v('recall'));

	    	queryProjector.addPath(new facets.Path.fromString("http://qa.linkeddata.org/ontology/linkset http://purl.org/dc/terms/creator"), sparql.Node.v('author'));

	    	
	    	$("#search").on("change", function(event, value) {
	    		var text = $("#search").val();
	    		
	    		//console.log(event);
	    		//alert("text " + value);
	    	});
	    	
	    	
	    	var q = queryProjector.createQueryRows();
	    	//alert(q.toString());
	    	
			this.executor = new widgets.TableQueryExecutor(this.sparqlService, queryProjector);

			
			this.paginatorModel = new widgets.PaginatorModel({maxSlotCount: 15});

			var viewModel = new widgets.TableModelExecutor(this.executor, this.itemsPerPage);
			
			
			
			this.syncer = new widgets.TableModelBackboneSync(viewModel);
			var collection = this.syncer.getCollection();
			
			
			var viewCollection = new Backbone.Collection();
			
			// Bind the viewCollection so that author and project uri are resolved
			ns.slaveCollection(collection, viewCollection, function(data) {
	    		
				//console.log("Slave data", data);
				var projectUri = data["project"];
	    		var authorUri = data["author"];

	    		var uriStrs = [projectUri.value, authorUri.value];
	    		
	    		var promise = self.labelFetcher.fetch(uriStrs).pipe(function(labelInfo) {

	    			data.projectName = ns.getLabel(projectUri, labelInfo);
	    			data.authorName = ns.getLabel(authorUri, labelInfo);
	    			
	    			return data;
	    		});
				
	    		return promise;
			});
			
			
			
			/**
			 * Clicking a thumbnail shows the detail page.
			 * 
			 */
			var CustomLinksetThumbnail = ns.ItemViewLinksetThumbnail.extend({
				events: {
					'click a': function(event) {
						//event.preventDefault();
						
						var projectUri = this.model.get("project");
						self.showDetailPage(projectUri.value);
					}
				}
			});
			
			var listView = new widgets.ListView({
				el: $("#list"),
				attributes: {style: {'list-style': 'none'}},
				collection: viewCollection,
				itemRenderer: new ns.ItemRendererBackbone(CustomLinksetThumbnail)
			});
	
			

			$.when(this.executor.fetchCountRows()).then(function(countInfo) {
				var pageCount = parseInt(countInfo.count / self.itemsPerPage + 0.5);
				self.paginatorModel.set({pageCount: pageCount});
			});
			
			this.paginatorModel.bind('change', function(model) {
				var currentPage = model.get("currentPage");
				var offset = self.itemsPerPage * (currentPage - 1);
				console.log("Set offset", offset, self.itemsPerPage, model);
				viewModel.setOffset(offset);
				self.syncer.sync();
				
				
				var executor = new widgets.QueryExecutor(self.sparqlService, self.queryGeneratorFacets);
				self.updateFacets(executor, self.facetBox);
			});
						

//			self.executor = new widgets.QueryExecutor(self.sparqlService, queryGenerator);
//			self.updateFacets();
			
			
			
			var paginator = new widgets.ViewPaginator({el: null, model: this.paginatorModel});//$$(widgets.Paginator); //widgets.createPaginatorWidget(5);
			
			$(paginator).bind('change-page', function(event, pageRequest) {
				
				if(pageRequest == -1) {
					var userInput = window.prompt("Jump to page:", "");
					
					pageRequest = parseInt(userInput);
				}
				
				console.log('changeRequest', pageRequest);
				self.paginatorModel.set({currentPage: pageRequest});
			});

			
			$("#list-paginator").append(paginator.render().el);
			

			
			/*
			 * Facets 
			 */
			this.constraintSelections = new widgets.SelectionCollection();
			
			

			/**
			 * TODO Make this constraint collection an extension of a backbone collection with some convenience methods
			 * 
			 */
			this.constraints = new ns.ConstraintCollection();

			
			var constraintItemRenderer = new widgets.RendererItemView(
					this.constraintSelections,
					null,
					widgets.ItemViewLabel, {
						label: "simpleLabel"
					}
			);
			
			this.constraintWidget = new widgets.ListView({
				el: $("#ssb-constraints"), 
				collection: this.constraints, 
				itemRenderer: constraintItemRenderer
			});

			this.constraintWidget.render();
			
			$(this.constraintWidget).bind("click", function(ev, payload) {
				
				var id = payload.model.get("id");
				self.constraints.remove(id);
			});

			
			
			//$("#ssb-constraints").append(this.constraintWidget.render().el);

			
			
			// Fetch labels
			var constraintTextBuilder = new widgets.ConstraintTextBuilder(this.labelFetcher);

			
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
			

			
			this.facetBox = facetbox.createFacetBox(this.constraintSelections); //tmpSelMod); //this.constraintSelections);
			
			this.facetBox.view.$().autoHeight();
			

			/**
			 * This is the callback when the values of a facet should be displayed. 
			 * 
			 */
			this.facetBox.bind("clickFacetValues", function(ev, payload) {
				
				//console.log("PAYLOAD", payload.model);
				
				var path = payload.model.get("path");
				var queryGeneratorTmp = self.queryGeneratorFacets.navigateToPath(path);
				var queryGenerator = queryGeneratorTmp.copyExcludeConstraint(path);

				
				//var relativePath = payload.model.get("path");			
				//var basePath = self.queryGeneratorGeo.getNavigationPath();
				//var path = basePath.concat(relativePath);
								
				var widget = payload;
				
				var executor = new widgets.QueryExecutor(self.sparqlService, queryGenerator);

				/*
				$.when(executor.fetchValues()).then(function(r) {
					console.log("Fetched someting", r);
				});
				*/
				
				widget = payload.getFacetValues();
				//console.log("Widget is", widget);
			
				//var viewModel = new widgets.ListModelExecutor(executor, 50);

				widget.setLabelFetcher(self.labelFetcher);
				widget.getModel().limit = self.itemsPerPage;
				widget.getModel().setExecutor(executor);
			
				widget.refresh();
			});


			
			this.facetBox.bind("clickConstraint", function(ev, payload) {

				/* What exactly should this method do?
				 * a) Return a specification on what do display as the facet values
				 * { type: checklist, executor: executor } or { type:dualslider, executor: executor }
				 * 
				 * b) A widget to use as in the facet value area
				 *    payload.area.set(new SparqlListWidget(executor)))
				 */
				
				
				var path = payload.path;

				//console.log("payload", payload.item);
				var item = payload.item;
				
				var facetValue = item.model.get("data").data;

				//console.log("facetValue", facetValue);
				
				var constraints = self.queryGeneratorFacets.getConstraints();

				//var constraints = self.constraints;
				//console.log("path is", path);
				
				
				var constraint =
					new facets.PathConstraint(path,
							new facets.ConstraintEquals(new sparql.NodeValue(facetValue)));

				//var xxxx = constraint.createConstraintElement(self.queryGenerator.pathManager);
				//alert(xxxx.getExpr());
				
				var id = "" + constraint;
				//console.log("ConstraintID" + id);
				
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

			$$.document.append(this.facetBox, "#facets");

			


			
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

		
		
		// TODO [HACK] Not sure why we need this hack of switching tabs
		// But without it, the facets do not show from the start; only after switching the incoming/outgoing tabs
		this.facetBox.view.$('a:eq(1)').tab('show');
		this.facetBox.view.$('a:first').tab('show');

		
	};
	
	
	ns.AppController.prototype.updateFacets = function(executor, facetBox) {
		if(!executor) {
			console.log("No executor set (yet)");
			return;
		}
		
		this.updateFacetsRec(executor, facetBox);
	};
	
	ns.AppController.prototype.updateFacetsRec = function(executor, view) {
		
		var path = new facets.Path(); //executor.getNavigationPath();
		
		executorIncoming = executor.navigateToFacets(-1);
		executorOutgoing = executor.navigateToFacets(1);
		
		this.updateFacetsRecDir(executorOutgoing, view.getOutgoing(), false, path);
		this.updateFacetsRecDir(executorIncoming, view.getIncoming(), true, path);
	};

	ns.AppController.prototype.updateFacetsRecDir = function(executor, view, isInverse, path) {
		
		var self = this;
		
		//var pivotFacets = executor.fetchPivotFacets();
		var pivotFacetsTask = $.Deferred();
		pivotFacetsTask.resolve({});
		
		$.when(executor.fetchValuesCounted(), pivotFacetsTask).then(function(facetCollection, pivotFacets) {
			
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

	
	/* TODO Such high level function might make sense; but not sure how to realize that yet.
	ns.AppController.prototype.updateFacets = function() {
		if(!this.executor) {
			console.warn("No executor set (yet)");
			return;
		}
		
		this.updateFacetsRec(this.executor, this.facetBox);
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

	ns.AppController.prototype.updateConstraints = function() {
		var self = this;
		
		var csR = this.queryGenerator.getConstraints();
		var csF = this.queryGeneratorFacets.getConstraints();
		csF.clear();
		csR.clear();
		
		
		var assessmentPath = facets.Path.fromString("http://qa.linkeddata.org/ontology/assessment");
		
		this.constraints.each(function(item) {
			
			var c = item.get("value");
			
			
			
			//alert("" + typeof(item) + " " + JSON.stringify(item));
			//console.log("dammit", item);
			var tmp = new facets.PathConstraint(assessmentPath.concat(c.getPath()), c.getConstraint());
			console.log("Path is now " + tmp);
			csR.add(tmp);
			
			//console.log("Tmp: ", tmp);
			
			csF.add(tmp);
		});

		
		
		//self.constraintWidget.refresh();
		//self.repaint();
		this.refresh();
	};

	
	ns.AppController.prototype.refresh = function() {
		
		var self = this;
		
		$.when(this.executor.fetchCountRows()).then(function(countInfo) {
			var pageCount = parseInt(countInfo.count / self.itemsPerPage + 0.5);
			self.paginatorModel.set({pageCount: pageCount});
		});
		
		this.syncer.sync();

	};
	
	
	ns.AppController.prototype.showDetailPage = function(uriStr) {
		
		app.renderDetailPage();
		
		//var element = 
		
	};
	
})(jQuery);