(function($) {
	ssb = $.ssb;
	
	var ns = {};
	$.ssb.facets = ns;
	
	
	ns.ConstraintCompare = function(comparisonType, nodeValue) {
		this.comparisonType = comparisonType;
		this.nodeValue = nodeValue;
	};
	
	ns.ConstraintRange = function(min, max, minInclusive, maxInclusive) {
		this.min = min;
		this.max = max;
		this.minInclusive = minInclusive ? minInclusive : true;
		this.maxInclusive = maxInclusive ? maxInclusive : true;
	};
	
	ns.ConstraintRect = function(minX, maxX, minY, maxY) {
		this.minX = minX;
		this.maxX = maxX;
		this.minY = minY;
		this.maxY = maxY;
	};
	
})(jQuery);