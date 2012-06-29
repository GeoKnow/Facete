/**
 * Constraint classes for the facet system.
 * Essentially they support the generation of SPARQL predicate expressions
 * based on facet path expressions. 
 * 
 * 
 * TODO In general, constraints are more complex than just being compiled to SPARQL predicates:
 * The new model should be as follows:
 * - A constraint is always associated with a specific path or set of paths.
 * - This means, that a constraint affects a set of SPARQL variables.
 * - A constraint may be compiled to SPARQL, but - and here comes the clue:
 * - A constraint may perform post processing on the query result!
 * 
 * constraint.getSparqlElement();
 * constraint.getPostProcessor();
 *  
 * Note that post processors are evaluated on the client.
 * The workflow is as follows: First the SPARQL query is generated based on all constraints.
 * Then, for each focus resource, the corresponding path elements are fetched.
 * 
 *    TODO: Does a post processor only work on the end-nodes of a path? 
 *    We may have to extend the path language to allow aliases:
 *    "memberOfWay georrs{polygon}"
 *    getPostProcessor(
 *  
 */
(function($) {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	var collections = Namespace("org.aksw.ssb.collections");
	var facets = Namespace("org.aksw.ssb.facets");

	var ns = Namespace("org.aksw.ssb.facets");

	
	ns.ConstraintElement = function(triples, expr) {
		this.triples = triples;
		this.expr = expr;
	};
	
	/*
	ns.ConstraintElement.prototype.getElement = function() {
		return this.element;
	};*/
	
	ns.ConstraintElement.prototype.getTriples = function() {
		return this.triples;
	};
	
	ns.ConstraintElement.prototype.getExpr = function() {
		return this.expr;
	};
	
	
	
	
	ns.ConstraintCollection = function(multimap) {
		if(!multimap) {
			multimap = new collections.MultiMap();
		}
		
		this.idToConstraints = multimap; 
	};
	
	ns.ConstraintCollection.prototype.clone = function() {
		//return this.idToConstraints.clone();
		return new ns.ConstraintCollection(this.idToConstraints.clone());
	};
	
	// TODO Is an add method more useful than put?
	ns.ConstraintCollection.prototype.add = function(constraint) {
		this.put("" + constraint, constraint);
	};
	
	
	// TODO Multiple constraints with the same id might not be the best choice...
	ns.ConstraintCollection.prototype.put = function(id, constraint) {
		this.idToConstraints.put(id, constraint);
		
		$(this).trigger("change", {added:[{key: id, value: constraint}], removed:[] });
	};
	
	ns.ConstraintCollection.prototype.remove = function(id) {
		// FIXME This is somewhat hacky as we rely on string equivalence
		id = "" +id;
		
		this.idToConstraints.removeKey(id);
		$(this).trigger("change", {added:[], removed:[id] });
	};

	
	/**
	 * Excludes a single path
	 */
	ns.ConstraintCollection.prototype.copyExclude = function(excludePath) {
		var result = this.copyExcludes([excludePath]);
		return result;
	};
	
	/**
	 * 
	 * @param excludes An array of paths
	 * 
	 * TODO Depends on unique string representations of paths.
	 */
	ns.ConstraintCollection.prototype.copyExcludes = function(excludePaths) {
		var tmp = {};
		if(excludePaths) {
			for(var i = 0; i < excludePaths.length; ++i) {
				var exclude = excludePaths[i];
				tmp[exclude.toString()] = exclude;
			}
		}

		//console.log("Excludes:", tmp);
		
		var result = new ns.ConstraintCollection();
		
		var entries = this.idToConstraints.entries;
		
		for(var key in entries) {
			var cs = entries[key];
			
			for(var i = 0; i < cs.length; ++i) {
				var c = cs[i];
 
				// TODO Assumes that every constraint has a path.
				// Is this really always true?
				var groupId = c.path.toString();

				if(groupId in tmp) {
					continue;
				}
				
				result.put(groupId, c);
			}
		}

		return result;
	};
	
	ns.ConstraintCollection.prototype.getSparqlElement = function(pathManager) {
		
		var triplesElement = new sparql.ElementTriplesBlock();

		var idToGroups = new collections.MultiMap();

		var entries = this.idToConstraints.entries;
		
		for(var key in entries) {
			var cs = entries[key];
			
			for(var i = 0; i < cs.length; ++i) {
				var c = cs[i];
				
				// TODO 
				var groupId = c.path.toString();
				
				idToGroups.put(groupId, c);
			}
		}
		
		var ands = [];
		for(var id in idToGroups.entries) {
			var groups = idToGroups.entries[id];
		
			var ors = [];
			for(var i = 0; i < groups.length; ++i) {
				var c = groups[i];
				
				var ce = c.createConstraintElement(pathManager);
								
				triplesElement.addTriples(ce.getTriples());
				
				var expr = ce.getExpr();
				if(expr) {
					ors.push(expr);
				}
			}
			
			if(ors.length > 0) {
				var expr = sparql.opify(ors, sparql.E_LogicalOr);
				ands.push(expr);
			}			
		}

		if(triplesElement.triples.length == 0) {
			return null;
		}
		
		var finalFilter = null;
		var filterElement = null;
		if(ands.length > 0) {
			finalFilter = sparql.opify(ands, sparql.E_LogicalAnd);
			
			filterElement = new sparql.ElementFilter(finalFilter);
		}
		 
		
		var result = new sparql.ElementGroup();
		result.elements.push(triplesElement);
		
		if(filterElement) {
			result.elements.push(filterElement);
		}
		
		return result;
		//console.warn("Triples:", triplesElement.triples);
		//console.warn("Final filter:", finalFilter);
	}; 
	
	
	/*
	 * Exists
	 * 
	 * A constraint that requires some path to exist
	 */
	ns.ConstraintExists = function(path) {
		this.path = path;
	};

	ns.ConstraintExists.prototype.toString = function() {
		return "exists " + this.path;
	};
	
	
	ns.ConstraintExists.prototype.createConstraintElement = function(pathManager) {
		var expr = null;
		
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path);
		var triples = breadcrumb.getTriples();
		
		var result = new ns.ConstraintElement(triples, expr);
		
		return result;
	};
	
	/*
	ns.ConstraintExists.prototype.getExpr = function(pathManager) {
		return null;
	};
	
	ns.ConstraintExists.prototype.getTriples = function(pathManager) {
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path);
		
		var result = breadcrumb.getTriples();
		
		return result;
	};
	*/
	
	/*
	 * Regex
	 */

	ns.ConstraintRegex = function(path, regexStr, flags) {
		this.path = path;
		this.regexStr = regexStr;
		this.flags = flags;
	};
	
	ns.ConstraintRegex.prototype.toString = function() {
		return "regex(" + this.path + ", " + this.regexStr + ", " + this.flags + ")";
	};
	
	ns.ConstraintRegex.prototype.createConstraintElement = function(pathManager) {
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path); 
		
		var triples = breadcrumb.getTriples();
		
		var varExpr = new sparql.ExprVar(breadcrumb.getTargetVariable()); 		
		var expr = new sparql.E_Regex(varExpr, this.regexStr);
		
		
		
		var result = new ns.ConstraintElement(triples, expr, this.flags);
		return result;
	};

	
	/*
	 * Equals 
	 */
	
	ns.ConstraintEquals = function(path, nodeValue) {
		this.path = path;
		this.nodeValue = nodeValue;
	};
	
	ns.ConstraintEquals.prototype.toString = function() {
		return "" + this.path+ " = " + this.nodeValue;
	};
	
	ns.ConstraintEquals.prototype.createConstraintElement = function(pathManager) {
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path); 
		
		var triples = breadcrumb.getTriples();
		
		var varExpr = new sparql.ExprVar(breadcrumb.getTargetVariable()); 		
		var expr = new sparql.E_Equals(varExpr, this.nodeValue);
		
		
		
		var result = new ns.ConstraintElement(triples, expr);
		return result;
	};

	/*
	ns.ConstraintEquals.prototype.getExpr = function(pathManager) {
		
		
	};
	
	ns.ConstraintEquals.prototype.getTriples = function(pathManager, generator) {
		var result = this.breadcrumb.getTriples();
		
		return result;
		//var result = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
	};
	*/

	/*
	 * Wgs84 
	 */
		
	// TODO Should there be only a breadcrumb to the resource that carries lat/long
	// Or should there be two breadcrumbs to lat/long directly???
	ns.ConstraintWgs84 = function(pathX, pathY, bounds) {
		this.pathX = pathX;
		this.pathY = pathY;
		this.bounds = bounds;

		//this.long = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
		//this.lat = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
	};
	
	
	/**
	 * This is a factory for arbitrary bbox constraints at a preset path.
	 * 
	 * @param path
	 * @returns {ns.ConstraintWgs84.Factory}
	 */
	ns.ConstraintWgs84.Factory = function(path) {
		this.path = path ? path : new facets.Path();
		this.pathX = path.copyAppendStep(new facets.Step(geo.long.value)); //new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.long.value);
		this.pathY = path.copyAppendStep(new facets.Step(geo.lat.value)); ///new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.lat.value);
		
		//this.breadcrumbY = breadcrumbY;
	};	
	
	ns.ConstraintWgs84.Factory.prototype.getPath = function() {
		return this.path;
	};
	
	ns.ConstraintWgs84.Factory.prototype.create = function(bounds) {
		return new ns.ConstraintWgs84(this.pathX, this.pathY, bounds);
	};
	

	ns.ConstraintWgs84.Factory.prototype.getTriples = function(pathManager) {
		var breadcrumbX = new facets.Breadcrumb(pathManager, this.pathX); 
		var breadcrumbY = new facets.Breadcrumb(pathManager, this.pathY);
		
		var triplesX = breadcrumbX.getTriples();		
		var triplesY = breadcrumbY.getTriples();
		
		var result = sparql.mergeTriples(triplesX, triplesY);
		
		return result;		
	};

	
	ns.ConstraintWgs84.prototype.createConstraintElement = function(pathManager, generator) {
		// Create breadcrumbs
		var breadcrumbX = new facets.Breadcrumb(pathManager, this.pathX); 
		var breadcrumbY = new facets.Breadcrumb(pathManager, this.pathY);

		// Create the graph pattern
		var triplesX = breadcrumbX.getTriples();		
		var triplesY = breadcrumbY.getTriples();
		
		var triples = sparql.mergeTriples(triplesX, triplesY);
		
		//var element = new sparql.ElementTriplesBlock(triples);
		
		// Create the filter
		var vX = breadcrumbX.getTargetVariable();
		var vY = breadcrumbY.getTargetVariable();
		
		var expr = ns.createWgsFilter(vX, vY, this.bounds);

		// Create the result
		var result = new ns.ConstraintElement(triples, expr);
		return result;
	};
	
	/*
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
	*/

	
	
	ns.createWgsFilter = function(varX, varY, bounds, castNode) {
		var long = new sparql.ExprVar(varX);
		var lat = new sparql.ExprVar(varY);
		
		// Cast the variables if requested
		if(castNode) {
			long = new sparql.E_Cast(long, castNode);
			lat = new sparql.E_Cast(lat, castNode);
		}
		
		var xMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.left));
		var xMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.right));
		var yMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.bottom));
		var yMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.top));

		var result = //new sparql.ElementFilter(
		  new sparql.E_LogicalAnd(
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(long, xMin), new sparql.E_LessThan(long, xMax)),
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lat, yMin), new sparql.E_LessThan(lat, yMax))
		  );
		//);

		return result;		
	};
	
	
	
	
	
})(jQuery);
