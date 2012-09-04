(function($) {
	
	var ns = Namespace("org.aksw.ssb.widgets");

	
	/**
	 * The specification of a paginator widget
	 * 
	 * 
	 * [<] [1] [2] [...] [5] [-6-] [7] [...] [9] [10] [>] [>>>]
	 * 
	 * 
	 */
	ns.PaginatorModel = Backbone.Model.extend({
		defaults: {
			maxSlotCount: 6,
			currentPage: 1,
			pageCount: 1,
			
			maxContextCount: 5, // Number of boxes around the current location
		
			facingForward: true, // Whether our last page select moved to a higher (true) or a lower (false) one; only needed for even context counts 
			
			quickJump: true, // have quick jump buttons between first-context and contex-last
			//minStartCount: 1,
			//minEndCount: 1,
			
			hasMorePages: false,
			prev: true,
			next:true
		}
	});
	
	
	
	ns.distribute = function(numSlots, maxNumFirstSlots, maxNumLastSlots, facingForward) {
		
		var displace = 0.25 * (!facingForward ? 1 : -1);
		
		var numFirstSlots =  Math.round(numSlots / 2 + displace);
		var numLastSlots  = numSlots - numFirstSlots;

		//console.log("First and last slots:" + numFirstSlots, numLastSlots);
		//console.log("Max num First and last slots:" + maxNumFirstSlots, maxNumLastSlots);
		
		var carryToLast = Math.max(numFirstSlots - maxNumFirstSlots, 0);
		//console.log("carryToLast" + carryToLast);
		
		numLastSlots += carryToLast;
		numFirstSlots -= carryToLast;
		
		var carryToFirst = Math.max(numLastSlots - maxNumLastSlots, 0);
		numLastSlots -= carryToFirst;
		numFirstSlots += carryToFirst;

		numFirstSlots = Math.min(numFirstSlots, maxNumFirstSlots);
		
		return [numFirstSlots, numLastSlots];
	};


	/**
	 * Based on the specification of a paginator,
	 * create specifications for the slots of a paginator.
	 * 
	 * @param spec A json object with the specification (use model.attributes when using backbone)
	 */
	ns.createSlotSpecs = function(spec) {
		
		var currentPage = spec.currentPage;
		
		// Compute, how many slots we need for non-context stuff
		var numNonContextSlots = 0;
		
		if(spec.next) {
			numNonContextSlots++;
		}

		if(spec.prev) {
			numNonContextSlots++;
		}

		if(spec.hasMorePages) {
			numNonContextSlots++;
		}
		var numRequiredSlots = Math.max(Math.min(spec.maxContextCount, spec.pageCount), 1);
	
		var maxNumContextFirstSlots = Math.max(currentPage - 1, 0);
		//console.log("Current page - last page", currentPage, spec.pageCount);
		var maxNumContextLastSlots = Math.max(spec.pageCount - currentPage, 0);
		
		var d = ns.distribute(numRequiredSlots - 1, maxNumContextFirstSlots, maxNumContextLastSlots);
		
		var contextStartPage = currentPage - d[0];
		var contextEndPage = currentPage + d[1];


		//console.log("Required slots", numRequiredSlots);
		//console.log("Max pages, Required slots", spec.pageCount, numRequiredSlots);
		//console.log("Paginator", "Current page: " + currentPage, "ContextStartPage: " + contextStartPage, "ContextEndPage: " + contextEndPage);
		
		
		var numRemainingSlots = spec.maxSlotCount - numRequiredSlots - numNonContextSlots;
		//console.log("Remaining:" + numRemainingSlots);
		
		var maxNumFirstSlots = contextStartPage - 1;
		var maxNumLastSlots = spec.pageCount - contextEndPage;
		
		var dist = ns.distribute(numRemainingSlots, maxNumFirstSlots, maxNumLastSlots);
	
		var numFirstSlots = dist[0];
		var numLastSlots = dist[1];
		
		
		//console.log("aaaa ", numLastSlots, contextEndPage);
		
		var showFirstQuickJump = false;
		var showLastQuickJump = false;
		if(spec.quickJump) {
			if(numFirstSlots > 1 && (numFirstSlots + 1 != contextStartPage)) {
				--numFirstSlots;
				showFirstQuickJump = true;
			}
			
			if(numLastSlots > 1 && (spec.pageCount - contextEndPage != numLastSlots)) { // && (numLastSlots + 1 != )
				--numLastSlots;
				showLastQuickJump = true;
			}			
		}
		
				
		
		var lastStartPage = contextEndPage;
		
		var pageSlots = [];
		
		
		// Prev button
		if(spec.prev) {
			pageSlots.push({
				label: "<",
				isEnabled: currentPage > 1,
				page: currentPage -1			
			});
		}
		
		for(var i = 0; i < numFirstSlots; ++i) {
			var page = i + 1;

			pageSlots.push({
				label: "" + page,
				isEnabled: page != currentPage,
				isActive: page == currentPage,
				page: page
			});
		}
		
		if(showFirstQuickJump) {
			pageSlots.push({
				label: "...",
				isEnabled: true,
				isActive: false,
				page: -1
			});
		}
	
		//var firstPage = contextStartPage;

		// First page button (only applies if there is more than two pages)		
		for(var i = 0; i < numRequiredSlots; ++i) {
			var page = contextStartPage + i;
			
			pageSlots.push({
					label: "" + page,
					isEnabled: page != currentPage,
					isActive: page == currentPage,
					page: page
			});
		}

		if(showLastQuickJump) {
			pageSlots.push({
				label: "...",
				isEnabled: true,
				isActive: false,
				page: -1
			});
		}

		for(var i = 0; i < numLastSlots; ++i) {
			var page = spec.pageCount - numLastSlots + i + 1;

			pageSlots.push({
				label: "" + page,
				isEnabled: page != currentPage,
				isActive: page == currentPage,
				page: page
			});
		}
		

		if(spec.next) {
			pageSlots.push({
				label: ">",
				isEnabled: currentPage < spec.pageCount,
				page: currentPage + 1
			});
		}

		if(spec.hasMorePages) {
			pageSlots.push({
				label: "Load more...",
				isEnabled: true,
				page: -2
			});
		}
		
		
		
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
			
			//console.log("Got ", this.model.attributes);
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
	    //attributes: {style: 'float: left'},
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