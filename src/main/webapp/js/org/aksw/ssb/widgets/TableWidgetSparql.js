(function() {
	
	var ns = Namespace("org.aksw.ssb.widgets");
	
	
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