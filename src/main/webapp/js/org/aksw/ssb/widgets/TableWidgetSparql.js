(function() {
	
	var ns = Namespace("org.aksw.ssb.widgets");
	
	
	/* Maybe it makes sense to have a single object that offers all methods for specifying a table based on SPARQL features
	ns.TableFacade = function() {
		this.queryGenerator = new widgets.QueryGenerator();
		this.queryProjector = new widgets.QueryProjector();
	};
	
	ns.TableFacade.prototype.setLimit = function(limit) {
		this.limit = limit;
	};
	
	ns.TableFacade.prototype.setOffset = function(offset) {
		
	};
	
	ns.TableFacade.prototype.setDriver = function(concept) {
		
	};
	
	ns.TableFacade.prototype.addProjectionPath = function(path) {
		
	};
	
	ns.TableFacade
	
	
	ns.TableFacade.prototype.createQuery = function() {
		
	};
	*/
	
	/**
	 * fnId(item, row, offset)
	 * 
	 */
	ns.TableModelBackboneSync = function(tableModelExecutor, collection, fnId) {
		this.tableModelExecutor = tableModelExecutor;
		this.collection = collection ? collection : new ns.DefaultCollection();
		this.fnId = fnId ? fnId : ns.fnDefaultId; // A function that returns the Id of items delivered by the tableModel
		
		this.taskCounter = 0;
	};
	
	ns.TableModelBackboneSync.prototype.getCollection = function() {
		return this.collection;
	};
	
	ns.TableModelBackboneSync.prototype.sync = function() {
		
		this.taskCounter++;
		
		var task = this.tableModelExecutor.fetchData();		
		var self = this;
		
		var tmp = self.taskCounter;
		
		$.when(task).then(function(result) {

			if(self.taskCounter != tmp) {
				// If there was a sync in the meantime, skip it
				return;
			}
			
			//console.log("Got data", result);
			
			var offset = result.offset ? result.offset : 0;
			var bindings = result.data;
			
			var destroyModels = [];
			
			self.collection.each(function(model) {
				destroyModels.push(model);
			});
			
			// The browsing experience is better, if first the new models are added
			// and then the old ones removed:
			// Removal of models may cause the page to shrink, and therefore change the location the user is viewing
			// before the new models are added
			
			//self.collection.reset();
			
			for(var i = 0; i < bindings.length; ++i) {
				var binding = bindings[i];
				
				var id = self.fnId(binding, i, offset);
				
				binding.id = id;

				self.collection.add(binding);
			}

			for(var i = 0; i < destroyModels.length; ++i) {
				var model = destroyModels[i];
				model.destroy();
			}
			
		});
		
	};
	
	
	/**
	 * Adds a layer onto a tabular data backend that enables
	 * adding limit and offset.
	 * 
	 * -> What about projections?
	 * 
	 * @param sparqlService
	 * @param elementProvider An object with a "ge
	 * @param limit
	 * @param offset
	 * @returns {ns.TableModelExecutor}
	 */
	ns.TableModelExecutor = function(executor, limit, offset) {
		this.executor = executor;
		this.limit = limit;
		this.offset = offset;
	};

	ns.TableModelExecutor.prototype.setLimit = function(limit) {
		this.limit = limit;
	};
	
	ns.TableModelExecutor.prototype.setOffset = function(offset) {
		this.offset = offset;
	};
	
	
	ns.TableModelExecutor.prototype.fetchData = function() {
		if(!this.executor) {
			var result = $.Deferred();
			result.resolve([]);
			return result.promise();
		}
		

		var options = {limit: this.limit, offset: this.offset, distinct: true};

		var promise = this.executor.fetchRows(options);
		
		//return promise;
		
		var result = promise.pipe(function(rs) {
			// Include the offset in the result - can be used to show row numbers, which may be used as ids
			return {data: rs, offset: options.offset};
		});
		
		return result;
	};
	
	ns.TableModelExecutor.prototype.fetchDataOld = function() {
		/*
		if(!this.executor) {
			var result = $.Deferred();
			result.resolve([]);
			return result.promise();
		}*/
		
		var query = this.queryProjector.createQuerySelect();
		
		// TODO Maybe treat the limit and offset relative to that of the query we get
		// This makes sense if we see this class as only providing a "window" to the data of the underyling query
		query.setLimit(this.limit);
		query.setOffset(this.offset);
				
		var promise = this.sparqlService.executeSelect(query);
		return promise;
	};
	
	ns.TableModelExecutor.prototype.getSparqlService = function() {
		return this.sparqlService;
	};	
	
	
	
	
	
	/**
	 * A widget for tables
	 * 
	 */
	ns.TableView = Backbone.View.extend({
		el: $('body'), // el attaches to existing element
		tagName: 'table',
	    events: {
	    },

	    /**
	     * options:
	     * colNames: [{id: "http://...", name: "age", cellRenderer:}] 
	     * 
	     */
	    initialize: function() {
	  
	    	
	    	// _.bindAll(this, 'render', 'addItem', 'appendItem'); // every function that uses 'this' as the current object should be in here
	      
	    	//this.collection = new List();
	    	//this.collection.bind('add', this.appendItem); // collection event binder

	    	this.collection.bind('add', this.addModel, this);
	    	//this.collection.remove('remove', this.addModel, this);
	    	
	    	
	    	
	    	this.render();
	    },
	    addModel: function(model) {
			var renderer = this.getRowRenderer();	
			
			//console.log("Options", this.options);
			itemView = renderer.create(this, model);
			this.appendItem(itemView);	    	
	    },
	    render: function() {
	    	var self = this;
	      
			this.clear();
			
			var self = this;

			this.collection.each(function(model) {
				self.addModel(model);
				/*
				var renderer = self.getItemRenderer();				
				itemView = renderer.create(self, item);
				self.appendItem(itemView);
				*/
			});
	    },
	    appendItem: function(itemView) {
	    	$(this.el).append(itemView.render().el);
	    },
	    /*
	    getRowRenderer: function() {
	    	return this.options.itemRenderer;
	    },*/
	    getCellRenderer: function(colId) {
	    	if(typeof(colId) === 'numeric') {
	    		return 
	    	}
	    },
	    clear: function() {
	    	
	    }
	});
	
	
	ns.RowView = Backbone.View.extend({
		el: null, // el attaches to existing element
		tagName: 'tr',
	    events: {
	    },
	    initialize: function(){
	    	// _.bindAll(this, 'render', 'addItem', 'appendItem'); // every function that uses 'this' as the current object should be in here
	      
	    	//this.collection = new List();
	    	//this.collection.bind('add', this.appendItem); // collection event binder

	    	this.collection.bind('add', this.addModel, this);
	    	//this.collection.remove('remove', this.addModel, this);
	    	
	    	
	    	
	    	this.render();
	    },
	    addModel: function(model) {
			var renderer = this.getRowRenderer();	
			
			//console.log("Options", this.options);
			itemView = renderer.create(this, model);
			this.appendItem(itemView);	    	
	    },
	    render: function() {
	    	var self = this;
	      
			this.clear();
			
			var self = this;

			this.collection.each(function(model) {
				self.addModel(model);
				/*
				var renderer = self.getItemRenderer();				
				itemView = renderer.create(self, item);
				self.appendItem(itemView);
				*/
			});
	    },
	    appendItem: function(itemView) {
	    	$(this.el).append(itemView.render().el);
	    },
	    getRowRenderer: function() {
	    	return this.options.itemRenderer;
	    },
	    clear: function() {
	    	
	    }
	});	
})();