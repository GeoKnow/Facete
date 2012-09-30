/**
 * An auto-height plugin, that assigns the remaining space to an element
 * based on its parent and siblings (i.e. the parent's children)
 * 
 * Note: Currently does not update on non-window resize events.
 * E.g. if only a sibling is resized, the 
 */
(function($) {
	var ns = Namespace("org.aksw.utils.layout");

	/**
	 * Returns the actual height of an element; considering margins of child elements 
	 * 
	 */
	/*
	$.fn.actualHeight = function() {
		var element = $(this[0]);
		
		var children = element.children();
		
		
	};
	*/

	
	/**
	 * Returns the sibling of an element excluding the element.
	 * 
	 */
	$.fn.otherSiblings = function() {
		var element = $(this[0]);
		
		var parent = element.parent();
		var children = parent.children();

		var result = children.filter(function(i) {
			var child = $(this);
			return !element.is(child);
		});
		
		return result;
	};
	
	
	var ns = {};
	
	ns.innerHeight = function(element) {
		return element.innerHeight(); 
	};
	
	ns.outerHeight = function(element) {
		return element.outerHeight(true);
	};
	
	ns.innerWidth = function(element) {
		return element.innerWidth();
	};
	
	ns.outerWidth = function(element) {
		return element.outerWidth(true);
	};
	
	ns.calcDim = function(element, innerDim, outerDim, doLogging) {
		var parent = element.parent();
		var children = parent.children();
	
		var parentDim = outerDim(parent);
		var childrenDim = 0;
		
		var otherSiblings = $(element).otherSiblings();
				
		otherSiblings.each(function(i) {
			var child = $(this);
			
			var childDim = child.is(":visible") ? outerDim(child) : 0;
			
			if(doLogging) {
				console.log("  Other siblings: " + childDim, child);
			}

			/*
			var childDim = outerDim(child);
			
			if(childDim < 0) {
				childDim = 0;
			}*/
			
			//console.log("childHeight: " + childHeight, child);
			childrenDim += childDim;
		});

		var space = outerDim(element) - innerDim(element);
				
		var elementDim = parentDim - childrenDim - space;
		//console.log("ParentDim: ", parentDim, "ChildDim ", childrenDim, "Space: ", space, "Result: ", elementDim);

		if(elementDim < 0) {
			elementDim = 0;
		}
		
		//element.css("height", elementHeight + "px");
		return elementDim;
	};


	
	/**
	 * Resizes an element to take the remaining space by substracting the height from all children from that of the parent.
	 * 
	 * 
	 * 
	 */
	$.fn.autoHeight = function(doLogging) {			
		var element = $(this[0]);
		
		$(window).resize(function() {
			var height = ns.calcDim(element, ns.innerHeight, ns.outerHeight, doLogging);
			
			if(doLogging) {
				console.log("AutoHeight: " + height, element);
			}
			
			element.css("height", height + "px");
		});		
	};

	$.fn.parentHeight = function(doLogging) {			
		var element = $(this[0]);
		
		// Immediately changing styles on resize-events causes firebug to
		// become very sluggish; hence this delay 
		var scheduler = new Scheduler(500);
		
		var action = function() {
			var parent = element.parent();
			if(!parent) {
				return;
			}
			
			var height = parent.height();
			
			if(doLogging) {
				console.log("ParentHeight: " + height, element);
			}
			
			element.css("height", height + "px");
		};
		
		$(window).resize(function() {
			scheduler.schedule(action);
		});
	};

	
	
	$.fn.autoWidth = function() {
		var element = $(this[0]);

		// Immediately changing styles on resize-events causes firebug to
		// become very sluggish; hence this delay
		var scheduler = new Scheduler(500);

		var action = function() {
			var width = ns.calcDim(element, ns.innerWidth, ns.outerWidth);
			element.css("width", width + "px");
		};
		
		$(window).resize(function() {
			scheduler.schedule(action);
		});
		
	};

	

	/*
	var result = function() {
		var parent = element.parent();
		var children = parent.children();
	
		var parentHeight = parent.outerHeight(true);
		var childrenHeight = 0;
		
		var otherSiblings = $(element).otherSiblings();
		
		otherSiblings.each(function(i) {
			var child = $(this);
			
			var childHeight = child.is(":visible") ? child.outerHeight(true) : 0;
			//console.log("childHeight: " + childHeight, child);
			childrenHeight += childHeight;
		});

		var space = element.outerHeight(true) - element.innerHeight();
		
		var elementHeight = parentHeight - childrenHeight - space;
		if(elementHeight < 0) {
			elementHeight = 0;
		}
		
		element.css("height", elementHeight + "px");
	};*/
})(jQuery);
