(function($) {
	
	var ns = Namespace("org.aksw.ssb.widgets");

	
	/**
	 * The specification of a paginator widget
	 */
	ns.PaginatorModel = Backbone.Model.extend({
		defaults: {
			maxSlotCount: 6,
			currentPage: 1,
			pageCount: 1,
			
			maxContextCount: 5, // Number of boxes around the current location
			minStartCount: 1,
			minEndCount: 1,
			
			hasMorePages: false 
		}
	});
	

	/**
	 * Based on the specification of a paginator,
	 * create specifications for the slots of a paginator.
	 * 
	 * @param spec A json object with the specification (use model.attributes when using backbone)
	 */
	ns.createSlotSpecs = function(spec) {
		
		var currentPage = spec.currentPage;
		
		// page indexes are zero based in here
		var numSlots = spec.maxSlotCount - 2;			
		var maxNumHeadSlots = currentPage - 1; // If we are on page 1, then there is 0 head pages
		var maxNumTailSlots = spec.pageCount - currentPage; // If we are one page 10 of 10, there is 0 tail pages

		var numTailSlots = Math.min(maxNumTailSlots, Math.floor((numSlots - 1) / 2));
		var numHeadSlots = Math.min(maxNumHeadSlots, numSlots - numTailSlots - 1); // All slots that are neither tail nor current may be head

		var numRequiredSlots = Math.min(numSlots, spec.pageCount);//numHeadSlots + numTailSlots + 1;

		//var activeSlotIndex = numHeadSlots + 1;
		
		
		var firstPage = currentPage - numHeadSlots;

		var pageSlots = [];
		
		// Prev button
		pageSlots.push({
			label: "<",
			isEnabled: currentPage > 1,
			page: currentPage -1			
		});
		
		// First page button (only applies if there is more than two pages)
		
		for(var i = 0; i < numRequiredSlots; ++i) {
			var page = firstPage + i;
			
			pageSlots.push({
					label: "" + page,
					isEnabled: page != currentPage,
					isActive: page == currentPage,
					page: page
			});
		}
		
		pageSlots.push({
			label: ">",
			isEnabled: currentPage < spec.pageCount,
			page: currentPage + 1
		});

		
		return pageSlots;
	};

	ns.PaginatorItemRenderer = function() {	
	};
	
	ns.PaginatorItemRenderer.prototype.create = function(data, parent) {
	
		var model = new Backbone.Model();
		model.set(data);
		
		//console.log("Parent is", parent);
		model.set({parent: parent});
		var result = new ns.ItemViewPaginator({model: model});//$$(ns.PaginatorItem, {parent: parent});
		
		result.setEnabled(data.isEnabled);
		result.setActive(data.isActive);
		result.setPage(data.page);
		//result.setLabel(data.label);
		
		
		return result.render().el;
	};


	
	ns.ItemViewDefault = Backbone.View.extend({
		tagName: 'li',
	    /*events: { 
	    },*/    
	    initialize: function() {
	      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	      this.model.bind('change', this.render);
	      this.model.bind('remove', this.unrender);
	    },
	    /*
	    render: function(){	    	
	   
	      $(this.el).html(html); 
	      return this;
	    },*/
	    unrender: function() {
	      $(this.el).remove();
	    },
	    remove: function() {
	      this.model.destroy();
	    }
	});
	
	
	
	ns.ItemViewPaginator = ns.ItemViewDefault.extend({
		events: {
			'click a': function(event) {
				event.preventDefault();
				
				if(!this.isEnabled()) {
					return;
				}
				
				//this.getParent().trigger("change-page", this.getPage());
				console.log(this.getParent());
				$(this.getParent()).trigger("change-page", this.getPage());
			}
		},
		render: function() {
			
			console.log("Got ", this.model.attributes);
			var html = '<a href="#">' + this.model.get("label") + '</a>';
			$(this.el).html(html);
			
			return this;
		},	
		isEnabled: function() {
			return !$(this.el).hasClass("disabled");
		},
		setEnabled: function(value) {
			if(value) {
				$(this.el).removeClass("disabled");
			} else {
				$(this.el).addClass("disabled");
			}
		},
		isActive: function(value) {
			return $(this.view).hasClass("active");
		},
		setActive: function(value) {
			if(value) {
				$(this.el).addClass("active");
			} else {
				$(this.el).removeClass("active");
			}
		}, 
		setPage: function(index) {
			this.model.set({page: index});
		},
		getPage: function() {
			return this.model.get("page");
		},
		/*
		setLabel: function(label) {
			this.model.set();
		},
		getLabel: function() {
			return $($(this.el), "a").text();
			//return this.model.get("label");
		},
		*/
		getParent: function() {
			//return this.parent;
			return this.model.get("parent");
		}
	});
	
	
	/* TODO Eventually it seems backbone is the better choice
	 * - although agility seemed simple at first, I find myself
	 * re-implenting features that backbone already offers in
	 * order to increase reusability
	 */
	ns.ViewPaginator = Backbone.View.extend({
	    tagName: 'ul',
	    className: 'pagination pagination-centered',
	    attributes: {style: 'float: left'},
	    events: {
	    },    
	    initialize: function(){
	    	_.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	    	this.model.bind('change', this.render);
	    	this.model.bind('remove', this.unrender);
	    },
	    render: function() {

	    	$(this.el).children().remove();
	    	
	    	var renderer = new ns.PaginatorItemRenderer();
	    	var slotSpecs = ns.createSlotSpecs(this.model.attributes);
	    	
	    	for(var i = 0; i < slotSpecs.length; ++i) {
	    		var slotSpec = slotSpecs[i];
	    		
	    		var slot = renderer.create(slotSpec, this);
	    		
	    		$(this.el).append(slot);
	    	}
	    	
	    	
	    	//$(this.el).html(html); 
	    	return this;
	    },
	    unrender: function(){
	      $(this.el).remove();
	    },
	    remove: function(){
	      this.model.destroy();
	    }
	});

	
	

	/**
	 * A paginator widget (based on twitter bootstrap).
	 * 
	 * 
	 * hasMorePages: Whether more pages than those are known exist
	 * 
	 */
	/*
			format: '<div class="pagination pagination-centered"></div>'
				listWidget.bind("change-page", function(ev, item) {
					self.trigger("change-page", item);
				});
			}
*/
	 
	
})(jQuery);