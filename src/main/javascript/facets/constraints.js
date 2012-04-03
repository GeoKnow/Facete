(function($) {
	ssb = $.ssb;
	
	var ns = $.ssb.facets;
	
	ns.ConstraintWgs = function(id, wgsGeoFacet, bounds) {
		this.id = id;
		this.wgsGeoFacet = wgsGeoFacet;
		this.bounds = bounds;
	};
	
	/**
	 * Create a SPARQL filter element that constrains WGS84 lat/long variables
	 * to a given bbox. 
	 * 
	 * TODO Add support for inclusive/exclusive bounds (e.g. > vs >=)
	 * 
	 * @param varX A ssb.Node that corresponds to a variable
	 * @param varY A ssb.Node that corresponds to a variable
	 */
	ns.createWgsFilter = function(varX, varY, bounds) {
		var long = new ssb.ExprVar(varX);
		var lat = new ssb.ExprVar(varY);
		
		var xMin = ssb.NodeValue.makeNode(ssb.Node.forValue(bounds.left));
		var xMax = ssb.NodeValue.makeNode(ssb.Node.forValue(bounds.right));
		var yMin = ssb.NodeValue.makeNode(ssb.Node.forValue(bounds.bottom));
		var yMax = ssb.NodeValue.makeNode(ssb.Node.forValue(bounds.top));

		var result = new ssb.ElementFilter(
		  new ssb.E_LogicalAnd(
            new ssb.E_LogicalAnd(new ssb.E_GreaterThan(long, xMin), new ssb.E_LessThan(long, xMax)),
            new ssb.E_LogicalAnd(new ssb.E_GreaterThan(lat, yMin), new ssb.E_LessThan(lat, yMax))
		  )
		);

		return result;		
	};
	
	ns.ConstraintWgs.prototype.toElement = function() {
		var long = new ssb.ExprVar(this.wgsGeoFacet.longVar);
		var lat = new ssb.ExprVar(this.wgsGeoFacet.latVar);
		
		var xMin = ssb.NodeValue.makeNode(ssb.Node.forValue(this.bounds.left));
		var xMax = ssb.NodeValue.makeNode(ssb.Node.forValue(this.bounds.right));
		var yMin = ssb.NodeValue.makeNode(ssb.Node.forValue(this.bounds.bottom));
		var yMax = ssb.NodeValue.makeNode(ssb.Node.forValue(this.bounds.top));
		
		
		var filter = new ssb.ElementFilter(
		  new ssb.E_LogicalAnd(
            new ssb.E_LogicalAnd(new ssb.E_GreaterThan(long, xMin), new ssb.E_LessThan(long, xMax)),
            new ssb.E_LogicalAnd(new ssb.E_GreaterThan(lat, yMin), new ssb.E_LessThan(lat, yMax))
		  )
		);
		
		
		var result = new ssb.ElementGroup([this.wgsGeoFacet.element, filter]);
		return result;
	};
	
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