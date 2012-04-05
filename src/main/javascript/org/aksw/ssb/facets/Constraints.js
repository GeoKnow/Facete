/**
 * Constraint classes for the facet system.
 * Essentially they support the generation of SPARQL predicate expressions
 * based on facet path expressions. 
 * 
 * 
 */
(function($) {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");

	var ns = Namespace("org.aksw.ssb.facets");

	/*
	 * Equals 
	 */
	
	ns.ConstraintEquals = function(breadcrumb, nodeValue) {
		this.breadcrumb = breadcrumb;
		this.nodeValue = nodeValue;
	};
	
	ns.ConstraintEquals.prototype.getExpr = function() {
		var sparqlVar = this.breadcrumb.targetNode.variable;
		
		var result = new sparql.E_Equals(sparqlVar, this.nodeValue);
		
		return result;
	};
	
	ns.ConstraintEquals.prototype.getElement = function() {
		var result = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
	};
	
	/*
	 * Wgs84 
	 */
		
	// TODO Should there be only a breadcrumb to the resource that carries lat/long
	// Or should there be two breadcrumbs to lat/long directly???
	ns.ConstraintWgs84 = function(breadcrumbX, breadcrumbY, bounds) {
		this.breadcrumbX = breadcrumbX;
		this.breadcrumbY = breadcrumbY;
		this.bounds = bounds;

		//this.long = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
		//this.lat = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
	};
	
	ns.ConstraintWgs84.Factory = function(breadcrumb) {
		this.breadcrumb = breadcrumb;
		this.breadcrumbX = new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.long.value);
		this.breadcrumbY = new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.lat.value);
		
		//this.breadcrumbY = breadcrumbY;
	};	
	
	ns.ConstraintWgs84.Factory.prototype.create = function(bounds) {
		return new ns.ConstraintWgs84(this.breadcrumbX, this.breadcrumbY, bounds);
	};
	
	ns.ConstraintWgs84.Factory.prototype.getTriples = function() {
		var triplesX = this.breadcrumbX.getTriples();		
		var triplesY = this.breadcrumbY.getTriples();
		
		var result = sparql.mergeTriples(triplesX, triplesY);
		
		return result;		
	};
	
	
	ns.ConstraintWgs84.prototype.getExpr = function() {
		//var node = this.breadcrumb.targetNode; //this.pathManager.getNode(this.pathStr);
		
		//var nodeX = node.getOrCreate(this.long);
		//var nodeY = node.getOrCreate(this.lat);
		
		var vX = sparql.Node.v(this.breadcrumbX.targetNode.variable);
		var vY = sparql.Node.v(this.breadcrumbY.targetNode.variable);
		
		var result = ns.createWgsFilter(vX, vY, this.bounds);
		
		return result;
	};
	
	ns.ConstraintWgs84.prototype.getElement = function() {
		//var pathStrX = this.pathStr + " " + this.long;
		//var pathStrY = this.pathStr + " " + this.lat;
		
		//var triplesX = this.breadcrumb.pathManager.toTriples(pathStrX);		
		//var triplesY = this.breadcrumb.pathManager.toTriples(pathStrY);
		var triplesX = this.breadcrumbX.getTriples();		
		var triplesY = this.breadcrumbY.getTriples();
		
		var result = sparql.mergeTriples(triplesX, triplesY);
		
		return result;
	};

	
	
	ns.createWgsFilter = function(varX, varY, bounds) {
		var long = new sparql.ExprVar(varX);
		var lat = new sparql.ExprVar(varY);
		
		var xMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.left));
		var xMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.right));
		var yMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.bottom));
		var yMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.top));

		var result = //new sparql.ElementFilter(
		  new sparql.E_LogicalAnd(
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(long, xMin), new sparql.E_LessThan(long, xMax)),
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lat, yMin), new sparql.E_LessThan(lat, yMax))
		  )
		//);

		return result;		
	};
	
	
	
	
	
})(jQuery);
