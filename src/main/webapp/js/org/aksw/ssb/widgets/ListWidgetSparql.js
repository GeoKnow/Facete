(function($) {
	
	var backboneUtils = Namespace("org.aksw.ssb.utils.backbone");
	var stringUtils = Namespace("org.aksw.ssb.utils.strings");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	
	var ns = Namespace("org.aksw.ssb.widgets");

	

	ns.CheckboxList = $$(ns.ListWidget, {
		model: { selected: {}},
		controller: {

			create: function() {
				//setSelectionModel([]);
			},
			'selected': function(ev, item) {
				//var model = this.model.get("selected");
				alert("test");
			}
		},
		
	});
	
	
	ns.CheckItem = $$({
		view: { format: '<li>'
					//+ '<form action="">'
					+ '<input type="checkbox" data-bind="isEnabled"/><span data-bind="label"/>'
					//+ '<span data-bind="label"/>'
					//+ '</form>'
					+ '</li>'
		},
		controller: {
			create: function() {
				if(this.model.get("isSelected")) {
					this.view.$("> input").attr("checked", true);
				}
			},
			'click input': function() {							
				var checked = this.isSelected();
				// Trigger event on this
				this.trigger("selected", {isChild: true, item: this, checked: checked});

				// Then trigger on the parent
				var parent = this.model.get("parent");
				parent.trigger("selected", {isChild: true, item: this, checked: checked});
			}
		},
		getParent: function() {
			return this.model.get("parent");
		},
		setSelected: function(value) {			
			this.view.$("> input").attr("checked", value);
		},
		isSelected: function() {
			return this.view.$(":checked").length == 1;
		},
		setSelectionModel: function(newModel) {
			
			// Unbind from old model (if it exists)
			var oldModel = this.getSelectionModel();
			if(oldModel) {
				oldModel.unbind("change:isSelected", this.setSelected, this);
			}
			
			// Bind to new model
			if(newModel) {
				this.setSelected(newModel.get("isSelected"));
				
				newModel.bind("change:isSelected", this.setSelected, this);
				// TODO: We have to bind on the destroy event too

			} else {
				// If there is no model, uncheck
				this.setSelected(false);
			}
			
			//newModel.bind();
		},
		getSelectionModel: function() {
			return this.model.get("selectionModel");
		},
	});
	
	

	

	ns.ItemViewCheckbox = Backbone.View.extend({
		tagName: 'li',
		
		events: {
			'click span': function() {
				$(this.parent).trigger("click", {isChild: true, item: this, model: this.model});				
			}
		},
		
		initialize: function() {
			this.parent = this.options.parent;
			
			if(!parent) {
				console.error("No parent container provided");
			}
			
			
			this.model.bind('change', this.render, this);
			this.model.bind('remove', this.unrender, this);
		},
	
	    render: function() {
	    	var label = this.model.get("label");
	    	var state = this.model.get("isSelected");
	
	    	var stateStr = state ? "checked" : "";
	    	
	        $(this.el).html('<input type="checkbox" checked="' + stateStr + '"/><span>' + label + '</span>');
	        return this;
	    },
	    
	    unrender: function() {
	    	$(this.el).remove();
	    },
	    
	    destroy: function() {
	    	this.unrender();
	    }
	});


	ns.ItemViewLabel = Backbone.View.extend({
		tagName: 'li',
		
		events: {
			'click span': function() {
				$(this.parent).trigger("click", {isChild: true, item: this, model: this.model});				
			}
		},
		
		initialize: function() {
			this.parent = this.options.parent;
			
			if(!parent) {
				console.error("No parent container provided");
			}
			
			
			this.model.bind('change', this.render, this);
			this.model.bind('remove', this.unrender, this);
		},
	
	    render: function() {
	    	var label = backboneUtils.getModelValue(this.model, "label", this.options.binding);
	    	
	    	
	        $(this.el).html('<span style="cursor: pointer;">' + stringUtils.escapeHTML(label) + '</span>');
	        // $(this.el).html('<span style="cursor: pointer;">' + "Label " + this.model.get("label") + '</span>');
	        
	        return this; // for chainable calls, like .render().el
	    },
	    
	    unrender: function() {
	    	$(this.el).remove();
	    },
	});
	

	/**
	 * A Renderer for selectable items, such as Checkbox-items
	 * 
	 * @param selectionModel
	 * @param fnId
	 * @param ctor
	 * @param binding
	 * @returns {ns.RendererItemView}
	 */
	ns.RendererItemView = function(selectionModel, fnId, ctor, binding) {
		this.selectionModel = selectionModel;
		this.fnId = fnId ? fnId : function(x) { return x.id; };
		this.ctor = ctor;
		this.binding = binding; // A mapping form model attributes to render attributes
	};
	
	ns.RendererItemView.prototype.create = function(parent, model) {
		var id = this.fnId(model);
		
		var result = new this.ctor({parent: parent, model: model, binding: this.binding});
		
		return result;
	};
		/*
		var key = this.fnId(data);
		var isSelected = this.selectionModel[key];

		console.log("key", key);
		
		var result;
		if(isSelected) {
			result = new this.ctor({model: model});
		} else {
			result = $$(this.agilityItem, {parent: parent, data:data, label: data.label});
		}
	
		var self = this;
		result.bind("selected", function(ev, payload) {
			//alert("boox");
			//var data = payload.item.model.get("data").data;
			id = self.fnId(data);
			if(payload.checked) {
				self.selectionModel[id] = {data: data, isSelected: true};
			} else {
				delete self.selectionModel[id];
			}

			// We need to bind on the selection model as to update the view if it changes
			// TODO Don't bind to the model directly but use a set of functions to accomplish that
			$(self.selectionModel).trigger("change", self.selectionModel);
		});
		
		return result;
		*/
	
	
	
	/**
	 * TODO Actually this is not a pure renderer, but more of a widget factory.
	 * (widget = model+view+controller stack): Clicking the checkbox automatically
	 * updates the selection model.
	 * 
	 * TODO On the other hand, the selectionModel is being listened so that the checkbox state can be updated accordingly on change 
	 * 
	 * 
	 * @param selectionModel
	 * @param fnId
	 * @returns {ns.RendererCheckItem}
	 */
	ns.RendererCheckItem = function(selectionModel, fnId, agilityItem) {
		this.selectionModel = selectionModel;
		this.fnId = fnId;
		this.agilityItem = agilityItem ? agilityItem : ns.CheckItem;
		
	};
	
	ns.RendererCheckItem.prototype.create = function(parent, data) {
		var key = this.fnId(data);

		var isSelected = this.selectionModel[key];

		//console.log("key", key);
		
		var result;
		if(isSelected) {
			result = $$(this.agilityItem, {parent: parent, data:data, label: data.label, isSelected: isSelected});
		} else {
			result = $$(this.agilityItem, {parent: parent, data:data, label: data.label});
		}
		
	
		var self = this;
		result.bind("selected", function(ev, payload) {
			//alert("boox");
			//var data = payload.item.model.get("data").data;
			id = self.fnId(data);
			if(payload.checked) {
				self.selectionModel[id] = {data: data, isSelected: true};
			} else {
				delete self.selectionModel[id];
			}	

			// We need to bind on the selection model as to update the view if it changes
			// TODO Don't bind to the model directly but use a set of functions to accomplish that
			$(self.selectionModel).trigger("change", self.selectionModel);
		});
		
		return result;
	};

	
	
	
	
	ns.RendererCheckItemBackbone = function(selectionCollection, fnId, agilityItem) {
		this.selectionCollection = selectionCollection;
		this.fnId = fnId ? fnId : function(x) { return x.id; }; // Return the id attribute by default
		this.agilityItem = agilityItem ? agilityItem : ns.CheckItem;

		this.idToView = {};
		
		
		var self = this;
		this.selectionCollection.bind("add", this.addSelectionModel, this);
		this.selectionCollection.bind("remove", this.removeSelectionModel, this);
		
		
		/*
		this.selectionCollection.bind("change:isSelected", function(model) {

			alert("Got event");
			
			var id = self.fnId(model);
			
			var view = self.idToView[id];
			if(view) {
				view.setSelected(model.get("isSelected"));
			}
		});
		*/

	};
	
	ns.RendererCheckItemBackbone.prototype.addSelectionModel = function(model) {
		var id = model.id;
		
		//alert("SelectionModel added: " + id);
		

		var view = this.idToView[id];
		
		if(view) {
			view.setSelectionModel(model);
		}
	};
	
	ns.RendererCheckItemBackbone.prototype.removeSelectionModel = function(model) {
		var id = model.id;
		//alert("SelectionModel removed: " + id);

		
		var view = this.idToView[id];
		
		if(view) {
			//alert("got a view");
			view.setSelectionModel(null);
		}		
		
	};
	
	
	
	/**
	 * TODO Clarify on whether the id must be part of the model or whether it may be derived with a function
	 * 
	 * 
	 * @param parent
	 * @param model
	 * @returns
	 */
	ns.RendererCheckItemBackbone.prototype.create = function(parent, model) {
		var id = "" + this.fnId(model);

		if(typeof(id) === 'undefined' || id === null) {
			console.error("Model without id");
		}
		
		var path = model;
		//console.warn("Model is: ", model);
		
		//console.log("RendererCheckItemBackbone id: ", id);
		
		var selectionModel = this.selectionCollection.get(id);
		var isSelected = selectionModel && selectionModel.get("isSelected") ? true : false;
		
		if(!selectionModel && isSelected) {
			var modelData = {id: id, data: data, isSelected: true};
			selectionModel = new ns.SelectionModel(modelData);
		}
		
		// OnAdd -> setSelected(true); OnRemove -> setSelected(false)

		var data = model;
		var agilityModel = {parent: parent, data:model, label: data.label, isSelected: isSelected};
		
		
		var result = this.idToView[id];
		
		
		//console.debug("Selection state: ", "" + id, result, isSelected, _.keys(this.idToView).length, selectionModel);
		
		if(!result) {
			result = $$(this.agilityItem);// {parent: parent, data:model, label: data.label, isSelected: isSelected});
			

			result.setSelectionModel(selectionModel);

			this.idToView[id] = result;
		}


		result.model.set(agilityModel);

		if(selectionModel) {
			selectionModel.set({isSelected: isSelected});
		}

		
		/*
		var result;
		if(isSelected) {
			result = $$(this.agilityItem, {parent: parent, data:model, label: data.label, isSelected: isSelected});
		} else {
			result = $$(this.agilityItem, {parent: parent, data:model, label: data.label});
		}
		*/
		
		
		var self = this;
		result.bind("selected", function(ev, payload) {
			//alert("boox");
			//var data = payload.item.model.get("data").data;
			//id = self.fnId(data);

			var model = self.selectionCollection.get(id);

			if(payload.checked) {
				var modelData = {id: id, data: data, isSelected: true};
				
				if(model) {
					model.set(modelData);
				} else {
					model = new ns.SelectionModel(modelData);					
					self.selectionCollection.add(model);
				}
			} else {
				//delete self.selectionModel[id];
				if(model) {
					model.destroy();
				}
			}

			// We need to bind on the selection model as to update the view if it changes
			// TODO Don't bind to the model directly but use a set of functions to accomplish that
			//$(self.selectionModel).trigger("change", self.selectionModel);
		});
		
		return result;
	};
	

	
	
	
	
	
	
	
	/*
	ns.checkItemFactory = function(parent, data, selectionModel) {
		
		
		return $$(ns.CheckItem, {parent: parent, data:data, label: data.label, selectionModel});
	};*/					

	
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
	
	/**
	 * Return the wrapped model
	 */
	ns.PostProcessorModel.prototype.getModel = function() {
		return this.model;
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
		var rawUriStrs = _.map(collection, function(item) { return sparql.Node.isUri(item.data) ? item.data.value : null; });
		var uriStrs = _.filter(rawUriStrs, function(x) { return !(!x); });
		
		var labelTask = this.labelFetcher.fetch(uriStrs);
		
		_.each(collection, function(item) {
			if(!item.label && sparql.Node.isNode(item.data) && !item.data.isUri()) {
				item.label = "" + item.data.value;
			}
		});
		
		
		$.when(labelTask).then(function(response) {
			
			_.each(collection, function(item) {
				if(!sparql.Node.isUri(item.data) || !item || item.label) {
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
		},
		refresh: function() {
			this.getListWidget().refresh();
			this.getPaginator().refresh();
		}
	});
	
	

	ns.ListModelExecutor = function(executor, limit, offset, searchString) {
		this.executor = executor;
		this.limit = limit;
		this.offset = offset;
		this.searchString = searchString;
	};
	
	ns.ListModelExecutor.prototype.fetchData = function() {
		if(!this.executor) {
			var result = $.Deferred();
			result.resolve([]);
			return result.promise();
		}
		
		
		var options = {limit: this.limit, offset: this.offset, distinct: true};
		//console.log("Options", options);
		
		var subExecutor = this.executor.filterRegex(this.searchString, "i");
		
		var promise = subExecutor.fetchValues(options);
		return promise;
		//return $.Deferred();
	};
	
	ns.ListModelExecutor.prototype.getExecutor = function() {
		return this.executor;
	};
	
	ns.ListModelExecutor.prototype.setExecutor = function(executor) {
		this.executor = executor;
	};
	
	ns.updatePageCount = function(paginator, subExecutor, limit) {
		
		$.when(subExecutor.fetchCountValues(null, {distinct: true})).then(function(info) {
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
	
	
	/**
	 * A widget for browsing data based on an executor
	 * 
	 */
	ns.ExecutorListWidget = function(model, itemRenderer, labelFetcher) {
		this.itemRenderer = itemRenderer;
		this.labelFetcher = labelFetcher;
		
		//this.model = new ListModelExecutor(model, limit);
		this.listView = ns.createListWidgetSparql(null, itemRenderer);
		//this.listWidget = listWidget;

		this.setModel(model);
		
		
		this.bindEvents();
	};
	
	ns.ExecutorListWidget.prototype.bindEvents = function() {

		var result = this.listView;
				
		
		//var result = ns.createListWidgetSparql(postModel, itemRenderer);

					
	
		var paginatorModel = result.getPaginator().getModel(); 

		
		var self = this;
		
		result.getTextWidget().bind("change-text", function(ev, text) {
			var model = self.getModel();
			
			model.searchString = text;

			self.refresh();
		});
		
		result.getPaginator().bind("change-page", function(ev, page) {
			var model = self.getModel();
			var paginatorModel = self.getView().getPaginator().getModel();

			
			var limit = model.limit;
			
			var offset = limit ? (page - 1) * limit : 0;
			
			model.offset = offset;
			paginatorModel.setCurrentPage(page);
			
			//alert("offest" + offset);
			//paginatorModel.setCurrentPage(page);
			
			result.getPaginator().refresh();
			result.getListWidget().refresh();
		});
	};

	ns.ExecutorListWidget.prototype.refresh = function() {
		var model = this.getModel();
		var executor = model.getExecutor();
		var view = this.getView();
		
		var subExecutor = executor.filterRegex(model.searchString, "i");
		
		ns.updatePageCount(view.getPaginator(), subExecutor, model.limit);
		
		view.getListWidget().refresh();		
	};
	
	ns.ExecutorListWidget.prototype.getView = function() {
		return this.listView;
	};

	
	ns.ExecutorListWidget.prototype.getModel = function() {
		return this.model;
	};

	ns.ExecutorListWidget.prototype.setModel = function(model) {
		if(!model) {
			model =  new ns.ListModelExecutor(null, 50);
		}
		
		this.model = model;
		var m = this.wrapModel(model);

		this.listView.getListWidget().setModel(m);
	};
	

	/* Use .getModel().setExecutor(model) instead
	ns.ExecutorListWidget.prototype.setExecutor = function(executor) {
		return this.model.setExecutor(executor);
	};

	ns.ExecutorListWidget.prototype.getExecutor = function() {
		return this.model.getExecutor();
	};
	*/
	
	ns.ExecutorListWidget.prototype.setLabelFetcher = function(labelFetcher) {
		this.labelFetcher = labelFetcher;
		
		var m = this.wrapModel(this.model);
		this.listView.getListWidget().setModel(m);
	};
	
	ns.ExecutorListWidget.prototype.wrapModel = function(model) {
		//var executor = model.getExecutor();
		var postProcessor = new ns.PostProcessorLabels(this.labelFetcher);
		var result = new ns.PostProcessorModel(model, postProcessor);

		return result;
	};
	
	/*
	ns.ExecutorListWidget.prototype.refresh = function() {

		this.getView().refresh();
		
	};*/
	
	/*
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
		* /
		
		ns.updatePageCount(result.getPaginator(), executor, model.limit);

		
		
		
		return result;
	};
	*/
	
	
	ns.createListWidgetSparql = function(model, itemRenderer) {
		var listWidget = ns.createListWidget(model, itemRenderer);

		var result = $$(ns.ListWidgetSparql);
		result.setListWidget(listWidget);
		result.init(listWidget);
		
		
		
		
		
		
		return result;
	};

		
	
})(jQuery);
