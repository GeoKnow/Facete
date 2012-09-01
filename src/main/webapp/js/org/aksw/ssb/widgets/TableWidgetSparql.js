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
	
	ns.TableFacade.prototype.setDriver = function(driver) {
		
	};
	
	ns.TableFacade.prototype.addProjectionPath = function(path) {
		
	};
	
	ns.TableFacade
	
	
	ns.TableFacade.prototype.createQuery = function() {
		
	};
	*/
	
	
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
	ns.TableModelExecutor = function(sparqlService, queryProjector, limit, offset) {
		this.sparqlService = sparqlService;
		this.queryProjector = queryProjector;
		this.limit = limit;
		this.offset = offset;
	};

	ns.TableModelExecutor.prototype.fetchData = function() {
		/*
		if(!this.executor) {
			var result = $.Deferred();
			result.resolve([]);
			return result.promise();
		}*/
		
		var query = queryProjector.createQuerySelect();
		
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
	 * Not done yet.
	 */
	ns.TableView = Backbone.View.extend({
		el: $('body'), // el attaches to existing element
		tagName: 'table',
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
			var renderer = this.getItemRenderer();	
			
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
	    getItemRenderer: function() {
	    	return this.options.itemRenderer;
	    },
	    clear: function() {
	    	
	    }
	});	
})();