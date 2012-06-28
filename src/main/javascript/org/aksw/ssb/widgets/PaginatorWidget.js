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
	
	
	ns.PaginatorItem =
		$$({
			view: {
				format: '<li><a href="#" /></li>' 
			},
			controller: {
				'click a': function() { this.getParent().trigger("click", this); }
			},
			isEnabled: function() {
				return this.view.$().hasClass("disabled");
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
			setTargetPage: function(index) {
				this.model.set({targetPage: index});
			},
			getTargetPage: function() {
				return this.model.get("targetPage");
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
			
		
	
	ns.createPaginator = function() {
		return $$(ns.Paginator, {itemFactory: ns.createItemFactory(ns.PaginatorItem)});
	};
	

	/**
	 * A paginator widget (based on twitter bootstrap).
	 * 
	 * 
	 * hasMorePages: Whether more pages than those are known exist
	 * 
	 */
	 ns.Paginator = $$({
		model: {maxSlotCount: 5, currentPage: 0, pageCount: 0, hasMorePages: false, slots: []},
		view: {
			format: '<div class="pagination pagination-centered"></div>'
		},
		controller: {
			create: function() {
				var listWidget = ns.createListWidget(null, ns.createItemFactory(ns.PaginatorItem));
				
				this.setListWidget(listWidget);
				
				this.append(listWidget);
				
				/*
				var item = $$(ns.PaginatorItem);
				item.setLabel("test");				
				this.addItem(item);
				*/
			}
		},
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
		 */
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
		
		getListWidget: function() {
			return this.model.get("listWidget");
		},
		
		setListWidget: function(listWidget) {
			this.model.set({listWidget: listWidget});
		} 
	});
	 
	
})(jQuery);