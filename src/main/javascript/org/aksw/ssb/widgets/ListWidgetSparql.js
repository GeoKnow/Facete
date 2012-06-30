(function($) {
	

	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	
	var ns = Namespace("org.aksw.ssb.widgets");
	
	ns.CheckItem = $$({}, '<li>'
					//+ '<form action="">'
					+ '<input type="checkbox" data-bind="isEnabled"/><span data-bind="label"/>'
					//+ '<span data-bind="label"/>'
					//+ '</form>'
					+ '</li>',
					{
						'click input': function() {
							var parent = this.model.get("parent");
							
							var checked = this.view.$(":checked").length == 1;
							
							parent.trigger("click", {isChild: true, item: this, checked: checked});
						}
					}	
					);

	ns.checkItemFactory = function(parent, data) {
		return $$(ns.CheckItem, {parent: parent, data:data, label: data.label});
	};					

	
	/*
	 * Not sure if below is needed
	 */
	/*
	ns.DriverProviderSimple = function(driver) {
		this.driver = driver;
	};
	
	ns.DriverProviderSimple.prototype.provideDriver = function() {
		return this.driver;
	};
	
	ns.DriverProviderGenerated = function(queryGenerator) {
		this.queryGenerator = queryGenerator;
	};
	
	ns.DriverProviderGenerated.prototype.provideDriver = function() {
		var result = this.queryGenerator.getDriverValues();
		return result;
	};
	*/
	
	
	/*
	ns.TableSparql = function(sparqlService, query) {
		this.sparqlService = sparqlService;
		this.query = query;
	};
	
	ns.TableSparql.prototype.fetch = function() {
		
	};*/
	


	
	ns.ListModelCollection = function(data) {
		this.data = data ? data : [];
	};
	
	ns.ListModelCollection.prototype.setData = function(data) {
		this.data = data;
	};
	
	ns.ListModelCollection.prototype.fetchData = function() {
		return this.data;
	};
	
	
	ns.createListModelLabels = function(sparqlService, queryGenerator, options, labelFetcher) {
		var postProcessor = new ns.PostProcessorLabels(labelFetcher);

		return new ns.ListModelSparql(sparqlService, queryGenerator, options, postProcessor);
	};
	
	
	//ns.refreshList(list, )

	ns.ListModelSparql = function(sparqlService, queryGenerator, options, postProcessor) {
		this.sparqlService = sparqlService;
		this.queryGenerator = queryGenerator;
		this.options = options;
		this.postProcessor = postProcessor;
	};
	
	
	ns.ListModelSparql.prototype.fetchData = function() {
		var driver = this.queryGenerator.createDriverValues();

		console.log("Driver: ", driver);
		
		var query = queryUtils.createQuerySelect(driver, this.options);						
		var task = queryUtils.fetchList(this.sparqlService, query, driver.variable);

		var result = $.Deferred();
		
		var self = this;
		$.when(task).then(function(resources) {

			var processed = _.map(resources, function(item) {
				return {data: item};
			});
			
			self.postProcessor.process(result, processed);
			
		}).fail(function() {
			result.fail();
		});

		return result;
	};

	
	ns.PostProcessorModel = function(model, postProcessor) {
		this.model = model;
		this.postProcessor = postProcessor;
	};
	
	ns.PostProcessorModel.prototype.fetchData = function() {
			
		var result = $.Deferred();
		var self = this;
		var task = this.model.fetchData();
		$.when(task).then(function(resources) {

			var processed = _.map(resources, function(item) {
				return {data: item};
			});
			
			self.postProcessor.process(result, processed);
			
		}).fail(function() {
			result.fail();
		});

		return result;
	};
	

	ns.isNode = function(candidate) {
		return candidate && (candidate instanceof sparql.Node);
	};
	
	ns.isUri = function(candidate) {
		return ns.isNode(candidate) && candidate.isUri();		
	};
	
	
	/**
	 * A post processor that attaches a label attribute to all objects for which
	 * the label fetcher provides labels.
	 * 
	 * @param labelFetcher
	 * @returns {ns.PostProcessorLabels}
	 */
	ns.PostProcessorLabels = function(labelFetcher) {
		this.labelFetcher = labelFetcher;
	};
	
	
	ns.PostProcessorLabels.prototype.process = function(deferred, collection) {
		var rawUriStrs = _.map(collection, function(item) { return ns.isUri(item.data) ? item.data.value : null; });
		var uriStrs = _.filter(rawUriStrs, function(x) { return !(!x); });
		
		var labelTask = this.labelFetcher.fetch(uriStrs);
		
		_.each(collection, function(item) {
			if(!item.label && ns.isNode(item.data) && !item.data.isUri()) {
				item.label = "" + item.data.value;
			}
		});
		
		
		$.when(labelTask).then(function(response) {
			
			_.each(collection, function(item) {
				if(!ns.isUri(item.data) || !item || item.label) {
					return;
				}
					
				
				var uri = item.data.value;
				var label = (uri in response.uriToLabel) ? response.uriToLabel[uri].value : uri;
				
				item.label = label;  
			});
						
			deferred.resolve(collection);
			
		}).fail(function() {
			deferred.fail();
		});

	};
	
	
	/**
	 * 
	 * @param backend
	 * @param transformer A function that takes a data item of the backend, and returns a new one.
	 * @returns {ns.TableModelBacked}
	 */
	ns.TableModelBackend = function(backend, transformer) {
		this.backend = backend;
		this.transformer = transformer;
	};
	
	ns.TableModelBackend.prototype.fetchBackendData = function(limit, offset) {
		
	};
	
	
	

	/**
	 * A class for generic SELECT result sets.
	 * 
	 * @param sparqlService
	 * @param queryGenerator
	 * @param projectVars
	 * @param options
	 * @returns {ns.TableModelSparql}
	 */
	ns.TableModelSparql = function(sparqlService, queryGenerator, projectVars, options) {
		this.sparqlService = sparqlService;
		this.queryGenerator = queryGenerator;
		this.projectVars = projectVars;
		this.options = options;
	};
	
	ns.TableModelSparql.prototype.count = function(threshold) {
		
	};
	
	/**
	 * If no arguments is given, everything is fetched.
	 * 
	 * @param limit
	 * @param offset
	 */
	ns.TableModelSparql.prototype.fetchData = function(limit, offset) {
		
	};

	
	ns.TableModelSparql.prototype.addConstraint = function(constraint) {
		this.queryGenerator.addConstraint(constraint);
	};
	
	
	
	ns.TextBox = $$({
		model: {text: "" },
		view: {
			format: '<input type="text" data-bind="text" />'
		},
		controller: {
			'change' : function() {
				var text = this.view.$().val();
				
				this.trigger("change-text", text);
			}
		}
	});

	
	ns.Div = $$({view: {format: '<div />'}});
	
	/**
	 * A list widget that provides a text box for searches and pagination.
	 * TODO Maybe a table model is yet the better option....
	 * 
	 * The table model would have a set of physical (i.e. backend backed) columns
	 * and a set of columns that are computed on the client.
	 * 
	 * So the features should be:
	 * global:
	 * - setSampleSize
	 * - setPaceSize (setItemsPerPage)
	 * - order([[name, 'asc'], [name2, 'desc']]
	 * columns:
	 * -
	 * 
	 * 
	 * model.addColumn(name, expr);
	 * 
	 * model.compileExpr....
	 * 
	 * model.addColumn(name, function(row) { });
	 * 
	 */
	ns.ListWidgetSparql = $$({
		view: {
			format: '<div></div>'
		},
		controller: {
		},
		init: function() {
			var widgets = ns;
			
			var div = $$(ns.Div, {view: {style: "& {text-align: center}"}});

			this.append(div);
			var searchBox = $$(ns.TextBox);
			div.append(searchBox);
			
			this.setTextWidget(searchBox);
						
			//this.model.set({containerElement: listWidget});

			var listWidget = this.getListWidget(); 
			this.append(listWidget);
			
			this.setListWidget(listWidget);
			
			//var self = this;
			
			var paginatorModel = new widgets.PaginatorModel();
			
			var paginator = widgets.createPaginator(paginatorModel);//$$(widgets.Paginator); //widgets.createPaginatorWidget(5);
			this.setPaginator(paginator);

			this.append(paginator);
			
			paginator.refresh();
			
			this.setPaginator(paginator);
			
/*
			var self = this;
			searchBox.bind("change-text", function(ev, text) {
				//this.view.$().val();
				alert(text);
				/*
				var executor = self.getExecutor();
				$.when(executor.fetchValuesFiltered(text)).then(function(data) {
					alert("data");
				});* /
			});
			
			// Bind to the paginator
			paginator.getListWidget().bind("click", function(ev, payload) {
				alert("click" + payload.getPage());
			});
	*/		
			
			//var listWidget = this.model.getListWidget();
			//this.append(listWidget);
			
			
		},
		getTextWidget: function() {
			return this.model.get("textWidget");
		},
		setTextWidget: function(textWidget) {
			this.model.set({textWidget: textWidget});
		},
		setListWidget: function(listWidget) {
			this.model.set({listWidget: listWidget});
		},
		getListWidget: function() {
			return this.model.get("listWidget");
		},
		setPaginator: function(paginator) {
			this.model.set({paginator: paginator});
		},
		getPaginator: function() {
			return this.model.get("paginator");
		},
		getModel: function() {
			return this.getListWidget().getModel();
		}
	});
	
	
	ns.ListModelExecutor = function(executor, limit, offset, searchString) {
		this.executor = executor;
		this.limit = limit;
		this.offset = offset;
		this.searchString = searchString;
	};
	
	ns.ListModelExecutor.prototype.fetchData = function() {
		var options = {limit: this.limit, offset: this.offset, distinct: true};
		console.log("Options", options);
		
		var subExecutor = this.executor.filterRegex(this.searchString, "i");
		
		var promise = subExecutor.fetchValues(options);
		return promise;
		//return $.Deferred();
	};
	
	ns.ListModelExecutor.prototype.getExecutor = function() {
		return this.executor;
	};
	
	ns.updatePageCount = function(paginator, subExecutor, limit) {
		
		$.when(subExecutor.fetchCountValues()).then(function(info) {
			var itemCount = info.count;
			//var limit = model.limit;
			
			var pageCount = limit ? Math.ceil(itemCount / limit) : 1;
			if(itemCount === 0) {
				pageCount = 1;
			}
			
			paginator.getModel().setPageCount(pageCount);
			paginator.refresh();

		});		
	};
	
	ns.createExecutorList = function(model, itemRenderer, labelFetcher) {

		var executor = model.getExecutor();
		var postProcessor = new ns.PostProcessorLabels(labelFetcher);
		var postModel = new ns.PostProcessorModel(model, postProcessor);
			
		var result = ns.createListWidgetSparql(postModel, itemRenderer);
	
		var paginatorModel = result.getPaginator().getModel(); 

		
		
		var self = this;
		result.getTextWidget().bind("change-text", function(ev, text) {
			model.searchString = text;
			
			var subExecutor = executor.filterRegex(model.searchString, "i");
			
			ns.updatePageCount(result.getPaginator(), subExecutor, model.limit);
			
			result.getListWidget().refresh();
		});
		
		result.getPaginator().bind("change-page", function(ev, page) {
			var limit = model.limit;
			
			var offset = limit ? (page - 1) * limit : 0;
			
			model.offset = offset;
			//alert("offest" + offset);
			paginatorModel.setCurrentPage(page);
			
			result.getPaginator().refresh();
			result.getListWidget().refresh();
		});
		
		/*
		result.getListWidget().bind("click", function(ev, payload) {
			alert("bar");
		});
		*/
		
		ns.updatePageCount(result.getPaginator(), executor, model.limit);

		
		
		
		return result;
	};
	
	
	ns.createListWidgetSparql = function(model, itemFactory) {
		var listWidget = ns.createListWidget(model, itemFactory);

		var result = $$(ns.ListWidgetSparql);
		result.setListWidget(listWidget);
		result.init(listWidget);
		
		
		
		
		
		
		return result;
	};

		
	
})(jQuery);
