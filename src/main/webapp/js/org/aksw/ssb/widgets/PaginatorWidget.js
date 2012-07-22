(function($) {
	
	var ns = Namespace("org.aksw.ssb.widgets");


	ns.createItemFactory = function(agilityObject) {
		return function(parent) {
			return $$(agilityObject, {parent: parent});
		};
	};
	
	
	
	ns.calcPageCount = function(items, itemsPerPage) {
		return Math.floor(item / itemsPerPage);
	};
	/*
	ns.caleItemOffset = function(index, itemsPerPage) {
		
	};
	*/
	
	ns.PaginatorItemRenderer = function() {	
	};
	
	ns.PaginatorItemRenderer.prototype.create = function(parent, data) {
	
		var result = $$(ns.PaginatorItem, {parent: parent});
		
		result.setEnabled(data.isEnabled);
		result.setActive(data.isActive);
		result.setPage(data.page);
		result.setLabel(data.label);
		
		
		return result;
	};
	
	ns.PaginatorItem =
		$$({
			view: {
				format: '<li><a href="#" /></li>' 
			},
			controller: {
				'click a': function() {
					if(!this.isEnabled()) {
						return;
					}
					
					this.getParent().trigger("change-page", this.getPage());
				}
			},
			isEnabled: function() {
				return !this.view.$().hasClass("disabled");
			},
			setEnabled: function(value) {
				if(value) {
					this.view.$().removeClass("disabled");
				} else {
					this.view.$().addClass("disabled");
				}
			},
			isActive: function(value) {
				return  this.view.$().hasClass("active");
			},
			setActive: function(value) {
				if(value) {
					this.view.$().addClass("active");
				} else {
					this.view.$().removeClass("active");
				}
			}, 
			setPage: function(index) {
				this.model.set({page: index});
			},
			getPage: function() {
				return this.model.get("page");
			},
			setLabel: function(label) {
				this.view.$("a").text(label);//html($.escapeHTML(label));
				//this.model.set({label: label});
			},
			getLabel: function() {
				return this.view.$("a").text();
				//return this.model.get("label");
			},
			getParent: function() {
				return this.model.get("parent");
			}
		});
	

	/*
	var PaginatorItemNext = 
	*/
	
	/* TODO Eventually it seems backbone is the better choice
	 * - although agility seemed simple at first, I find myself
	 * re-implenting features that backbone already offers in
	 * order to increase reusability
	 */
/*
	ns.PaginatorModel = Backbone.Model.extend({
		defaults: {
			label: "not set",
			page: -1
		}
	});
	
	
	ns.PaginatorCollection = Backbone.Collection.extend({
	    model: ns.PaginatorModel
	});
*/
	
	
	
		
	ns.PaginatorModel = function(options) {
		this.maxSlotCount = 6;
		this.currentPage = 1;
		this.pageCount = 1;
		
		this.maxContextCount = 5; // Number of boxes around the current location
		this.minStartCount = 1;
		this.minEndCount = 1;
		
		this.hasMorePages = false;
		
		
		
		_.extend(this, options);
	};
	
	ns.PaginatorModel.prototype.setCurrentPage = function(page) {
		this.currentPage = Math.min(this.pageCount, page);
	};
	
	ns.PaginatorModel.prototype.getCurrentPage = function() {
		return this.currentPage;
	};
	
	ns.PaginatorModel.prototype.setPageCount = function(pageCount) {
		this.pageCount = pageCount;
	};
	
	ns.PaginatorModel.prototype.getPageCount = function() {
		return this.getPageCount;
	};
	
	ns.PaginatorModel.prototype.getMaxSlotCount = function() {
		return this.maxSlotCount;
	};
	
	//ns.PageModel.prototype.
	
	ns.PaginatorModel.prototype.fetchData = function() {
		
		var currentPage = this.currentPage;
		
		// page indexes are zero based in here
		var numSlots = this.maxSlotCount - 2;			
		var maxNumHeadSlots = currentPage - 1; // If we are on page 1, then there is 0 head pages
		var maxNumTailSlots = this.pageCount - currentPage; // If we are one page 10 of 10, there is 0 tail pages

		var numTailSlots = Math.min(maxNumTailSlots, Math.floor((numSlots - 1) / 2));
		var numHeadSlots = Math.min(maxNumHeadSlots, numSlots - numTailSlots - 1); // All slots that are neither tail nor current may be head

		var numRequiredSlots = Math.min(numSlots, this.pageCount);//numHeadSlots + numTailSlots + 1;

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
			isEnabled: currentPage < this.pageCount,
			page: currentPage + 1
		});

		//return pageSlots;
		
		var result = $.Deferred();
		
		result.resolve(pageSlots);
		
		return result.promise();
	};
			
		
	
	ns.createPaginator = function(model) {
		//return $$(ns.Paginator, {itemFactory: ns.createItemFactory(ns.PaginatorItem)});
		//return ns.createListWidget(model, ns.createItemFactory(ns.PaginatorItem));
		var result = $$(ns.Paginator);
		result.getListWidget().setModel(model);
		//result.getListWidget().setItemFactory(ns.PaginatorItemRenderer);
		return result;
	};
	

	/**
	 * A paginator widget (based on twitter bootstrap).
	 * 
	 * 
	 * hasMorePages: Whether more pages than those are known exist
	 * 
	 */
	 ns.Paginator = $$({
		//model: {maxSlotCount: 5, currentPage: 0, pageCount: 0, hasMorePages: false, slots: []},
		view: {
			format: '<div class="pagination pagination-centered"></div>'
		},
		controller: {
			create: function() {
				var listWidget = ns.createListWidget(null, new ns.PaginatorItemRenderer());
				this.setListWidget(listWidget);				
				this.append(listWidget);
				
				var self = this;
				listWidget.bind("change-page", function(ev, item) {
					self.trigger("change-page", item);
				});
			}
		},
		setModel: function(model) {
			this.getListWidget().setModel(model);
		},
		getModel: function() {
			return this.getListWidget().getModel();
		},
		getListWidget: function() {
			return this.model.get("listWidget");
		},
		setListWidget: function(listWidget) {
			this.model.set({listWidget: listWidget});
		},
		refresh: function() {
			this.getListWidget().refresh();
		}

		/*
		setCurrentPage: function(index) {
			this.model.set({currentPage: index});
		},
		
		getCurrentPage: function(index) {
			return this.model.get("currentPage");
		},
		getPageCount: function() {
			return this.model.get("pageCount");
		},
		setPageCount: function(pageCount) { //}, hasMorePages) {
			this.model.set({pageCount: pageCount});
		},
		
		/**
		 * The number of pages shown in the list;
		 * excluding buttons for forward and backward.
		 * 
		 * @param size
		 */
		/*
		setSlots: function(size) {
			
			var listWidget = this.getListWidget();
			
			var n = size + 2;

			
			// Remove superfluous items
			listWidget.trimToSize(n);
			
			var slots = this.getSlots();

			// Create new items as neccessary
			var m = n - slots.length; 
			for(var i = 0; i < m; ++i) {
				var item = listWidget.getItemFactory()(this);
				//item.setLabel("" + (pages.length + i));
				listWidget.addItem(item);
			}			 
			
			//this.refresh();
		},
		*/
		/**
		 * [<<] [<] [10] [*11*] [12] [...] [>] [>>]
		 *  
		 * At end
		 * [<<] [<]... [49] [50] [>] [>>]
		 * 
		 * At beginning
		 * [<<] [<] [1] [2] [...] [>] [>>]
		 * 
		 * In middle 
		 * [<<] [<] [...] [30] [31] [32] [...] [>] [>>]
		 * 
		 */
		/*
		refresh: function() {
			var currentPage = this.getCurrentPage();
			var pageCount = this.getPageCount();			
			
			// page indexes are zero based in here
			var numSlots = this.getMaxSlotCount() - 1; // We need one slot for the current page			
			var maxNumHeadSlots = currentPage - 1;
			var maxNumTailSlots = pageCount - currentPage - 1;

			var numTailSlots = Math.min(maxNumTailSlots, Math.round(numSlots / 2));
			var numHeadSlots = Math.min(maxNumHeadSlots, numTailSlots - numTailSlots);

			var numRequiredSlots = numHeadSlots + numTailSlots + 1;

			var activeSlotIndex = numHeadSlots + 1;
			
			// Update the slots
			this.setSlots(numRequiredSlots);
			var slots = this.getSlots();
			
			console.log("Slots are", numRequiredSlots, slots);
			
			var firstPage = currentPage - numHeadSlots;
			
			for(var i = 0; i < numRequiredSlots; ++i) {
				var slot = slots[i];
				var page = firstPage + i;
				slot.setLabel("" + page);
				slot.setActive(false);
				slot.setTargetPage(page);
			}
			
			slots[activeSlotIndex].setActive(true);
			
			{
				var slot = this.getJumpToPrev();
				slot.setLabel("<");
				if(currentPage > 0) {
					slot.setTargetPage(currentPage - 1);
					slot.setEnabled(true);
				} else {
					slot.setEnabled(false);				
				}
			}
			
			{
				var slot = this.getJumpToNext();
				slot.setLabel(">");
				if(currentPage < pageCount - 1) {
					slot.setTargetPage(currentPage + 1);
					slot.setEnabled(true);
				} else {
					slot.setEnabled(false);				
				}
			}
			
			
		},
		getMaxSlotCount: function() {
			return this.model.get("maxSlotCount");
		},
		setMaxSlotCount: function(maxSlotCount) {
			this.model.set({maxSlotCount: maxSlotCount});
		},
		/**
		 * Return the number of pages that are displayed
		 * /
		getMaxSlotCount: function() {
			return this.model.get("maxSlotCount");
		},
		
		getAllSlots: function() {
			return this.getListWidget().getItems();
		},
		
		getSlots: function() {
			var slots = this.getAllSlots();
			return slots.slice(1, slots.length - 1);
		},
		
		getJumpToPrev: function() {
			return this.getAllSlots()[0];
		},
		
		getJumpToNext: function() {
			var slots = this.getAllSlots();
			return slots[slots.length - 1];
		},
		
		getJumpToCustom: function() {
			
		},
		
		getJumpToFirst: function() {
			var pages = this.getAllPages();
			return pages[0];
		},
		
		getJumpToLast: function() {
			var pages = this.getAllPages();
			return pages[pages.length - 1];			
		},
		
		getPage: function() {
			
		},
								*/
	});
	 
	
})(jQuery);