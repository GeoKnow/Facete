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

	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	var collections = Namespace("org.aksw.ssb.collections");
	var facets = Namespace("org.aksw.ssb.facets");

	var ns = Namespace("org.aksw.ssb.facets");


	/**
	 * TODO Get rid of this class, I do not think there is much point in it, because the sparql syntax classes could do the same.
	 * 
	 * 
	 * @param triples
	 * @param expr
	 * @returns {ns.ConstraintElement}
	 */
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
	
	ns.ConstraintCollection.prototype.clear = function() {
		this.idToConstraints.clear();
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
				console.log("Constraint", c);

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
			
			filterElement = new sparql.ElementFilter([finalFilter]);
		}
		 
		
		var result = new sparql.ElementGroup();
		result.elements.push(triplesElement);
		
		if(filterElement) {
			result.elements.push(filterElement);
		}
		
		
		console.log("element", result);
		
		return result;
		//console.warn("Triples:", triplesElement.triples);
		//console.warn("Final filter:", finalFilter);
	}; 
	
	
	/*
	 * VariableConstraint
	 * 
	 * TODO Refactor the constraint classes to make them
	 */
	ns.VariableConstraint = function(variable, constraint) {
		this.variable = variable;
		this.constraint = constraint;
	};

	ns.VariableConstraint.prototype.getVariable = function() {
		return this.variable;
	};

	ns.VariableConstraint.prototype.getConstraint = function() {
		return this.constraint;
	};

	
	/*
	 * PathConstraint
	 *
	 * Associates a path with a certain constraint
	 *  
	 */
	ns.PathConstraint = function(path, constraint) {
		this.path = path;
		this.constraint = constraint;
	};
	
	ns.PathConstraint.prototype = {
		getPath: function() {
			return this.path;
		},

		getConstraint: function() {
			return this.constraint;
		},
		
		createConstraintElement: function(pathManager) {
		
			var breadcrumb = new facets.Breadcrumb(pathManager, this.path);
			var expr = this.constraint.createExpr(breadcrumb);
	
			var triples = breadcrumb.getTriples();
			
			var result = new ns.ConstraintElement(triples, expr);
			
			return result;
		},
	
		toString: function() {
			return "" + this.path + " " + this.constraint;
		},
		
		toJson: function() {
			var result = {
					path: this.path.toJson(),
					constraint: this.constraint.toJson()
			};
			
			return result;
			/*
			this.path = path;
			this.constraint = constraint;
			*/
		}
	};
	
	
	/*
	 * Exists
	 * 
	 * A constraint that requires some path to exist
	 */
	ns.ConstraintExists = function() {
	};

	ns.ConstraintExists.prototype.toString = function() {
		return "exists";
	};
	
	ns.ConstraintExists.prototype.createExpr = function(breadcrumb) {
		return null;
		//return sparql.Constants.TRUE;
	};
	
	/*
	ns.ConstraintExists.prototype.createConstraintElement = function(pathManager) {
		var expr = null;
		
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path);
		var triples = breadcrumb.getTriples();
		
		var result = new ns.ConstraintElement(triples, expr);
		
		return result;
	};
	*/
	
	
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

	ns.ConstraintRegex = function(regexStr, flags) {
		this.regexStr = regexStr;
		this.flags = flags;
	};
	
	ns.ConstraintRegex.prototype = {
			toString: function() {
				return "regex(" + this.regexStr + ", " + this.flags + ")";
			},
	
			/**
			 * TODO: This should become the new createExpr function
			 * 
			 * @param v
			 * @returns {sparql.E_Regex}
			 */
			createExprVar: function(v) {
				var varExpr = new sparql.ExprVar(variable); 		
				var result = new sparql.E_Regex(varExpr, this.regexStr, this.flags);

				return result;				
			},
			
			createExpr: function(breadcrumb) {
		
				var variable = breadcrumb.getTargetVariable();
				
				var result = createExprVar(variable);
				
				return result;
			}
	};
	
	/*
	ns.ConstraintRegex.prototype.createConstraintElement = function(pathManager) {
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path); 
		
		var triples = breadcrumb.getTriples();
		
		var varExpr = new sparql.ExprVar(breadcrumb.getTargetVariable()); 		
		var expr = new sparql.E_Regex(varExpr, this.regexStr, this.flags);
		
		
		
		var result = new ns.ConstraintElement(triples, expr);
		return result;
	};
	*/

	
	/*
	 * Equals
	 * 
	 * FIXME Maybe the nodeValue should be generalized to expr
	 */
	
	ns.ConstraintEquals = function(nodeValue) {
		//this.path = path;
		this.nodeValue = nodeValue;
	};
	
	/*
	ns.ConstraintEquals.prototype.getPath = function() {
		return this.path;
	};
	*/
	
	ns.ConstraintEquals.prototype.getNodeValue = function() {
		return this.nodeValue;
	};
	
	ns.ConstraintEquals.prototype.toString = function() {
		return " = " + this.nodeValue;
	};
	
	
	// TODO Move to appropriate location
	ns.numericDatatypes = {'http://www.w3.org/2001/XMLSchema#float': true, 'http://www.w3.org/2001/XMLSchema#double': true};
	
	ns.isNumericDatatype = function(datatype) {
		return ns.numericDatatypes[datatype];
	};
	
	
	/**
	 * 
	 * 
	 * 
	 * @param breadcrumb
	 * @returns {sparql.E_Equals}
	 */
	ns.ConstraintEquals.prototype.createExpr = function(breadcrumb) {
		
		var variable = breadcrumb.getTargetVariable();
		
		var result = this.createExprByVar(variable);
		return result;
	},

	/*
	ns.ConstraintEquals.prototype.createElement = function(variable) {
		var result = new facets.ElementGroup(
				[
        ]);
		
	},
	*/

	
	ns.ConstraintEquals.prototype.createExprByVar = function(variable) {
		
		
		var varExpr = new sparql.ExprVar(variable); 		

		//if(this.nodeValue.datatype)
		var result;
		
		var node = this.nodeValue.node;
		var datatype = node.datatype;
		//console.log("Datatype is ", datatype, this.nodeValue.node);
		
		if(ns.isNumericDatatype(datatype)) { 
			var v = parseFloat(node.value);
			var eps = 0.00001;
			var min = v - eps;
			var max = v + eps;
			
			var result =
				new sparql.E_LogicalAnd(
						new sparql.E_GreaterThan(
								varExpr,
								new sparql.NodeValue(sparql.Node.typedLit(min, datatype))
						),
						new sparql.E_LessThan(
								varExpr,
								new sparql.NodeValue(sparql.Node.typedLit(max, datatype))
						)
				);
		} else {
			result = new sparql.E_Equals(varExpr, this.nodeValue);
		}
		

		return result;
	};
	
	/*
	ns.ConstraintEquals.prototype.createConstraintElement = function(pathManager) {
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path); 
		
		var triples = breadcrumb.getTriples();
		
		var varExpr = new sparql.ExprVar(breadcrumb.getTargetVariable()); 		
		var expr = new sparql.E_Equals(varExpr, this.nodeValue);
		
		
		
		var result = new ns.ConstraintElement(triples, expr);
		return result;
	};
	*/

	/*
	ns.ConstraintEquals.prototype.getExpr = function(pathManager) {
		
		
	};
	
	ns.ConstraintEquals.prototype.getTriples = function(pathManager, generator) {
		var result = this.breadcrumb.getTriples();
		
		return result;
		//var result = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
	};
	*/

	
	
	ns.ConstraintOgc = function(path, bounds) {
		this.path = path;
		this.bounds = bounds;
	};
	
	ns.ConstraintOgc.createExpr = function(breadcrumb) {
		var variable = breadcrumb.getTargetVariable();
		var varExpr = new sparql.ExprVar(variable);
	};

	
	ns.ConstraintOgcFactory = function(path) {
		this.path = path ? path : new facets.Path();
	};
	
	ns.ConstraintOgcFactory.getPath = function() {
		return this.path;
	};
	
	ns.ConstraintOgcFactory.prototype.create = function(bounds) {
		return new ns.PathConstraint(this.path, ns.ConstraintWkt(bounds));
	};
	
	
	
	
	
	/*
	 * Wgs84 
	 */
		
	// TODO Should there be only a breadcrumb to the resource that carries lat/long
	// Or should there be two breadcrumbs to lat/long directly???
	ns.PathConstraintWgs84 = function(pathX, pathY, bounds) {
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
	ns.PathConstraintWgs84.Factory = function(path, pathX, pathY) {
		this.path = path;
		this.pathX = pathX;
		this.pathY = pathY;
	};
	
	ns.PathConstraintWgs84.Factory.create = function(path) {
		path = path ? path : new facets.Path();
		
		var pathX = path.copyAppendStep(new facets.Step(geo.lon.value)); //new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.long.value);
		var pathY = path.copyAppendStep(new facets.Step(geo.lat.value)); ///new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.lat.value);

		var result = new ns.PathConstraintWgs84.Factory(path, pathX, pathY);
		return result;
	};
	
	ns.PathConstraintWgs84.Factory.prototype = {
		getPath: function() {
			return this.path;
		},
	
		/**
		 * Note: bounds may be null
		 */
		createConstraint: function(bounds) {
			return new ns.PathConstraintWgs84(this.pathX, this.pathY, bounds);
		}
	

//		getTriples: function(pathManager) {
//			var breadcrumbX = new facets.Breadcrumb(pathManager, this.pathX); 
//			var breadcrumbY = new facets.Breadcrumb(pathManager, this.pathY);
//			
//			var triplesX = breadcrumbX.getTriples();		
//			var triplesY = breadcrumbY.getTriples();
//			
//			var result = sparql.mergeTriples(triplesX, triplesY);
//			
//			return result;		
//		}
	};

	
	ns.PathConstraintWgs84.prototype = {
		createConstraintElementNewButNotUsedYet: function(breadcrumb) {
			var path = breadcrumb.getPath();
			
			var pathX = path.copyAppendStep(new facets.Step(geo.lon.value));
			var pathY = path.copyAppendStep(new facets.Step(geo.lat.value));
	
			// Create breadcrumbs
			var breadcrumbX = new facets.Breadcrumb(pathManager, pathX); 
			var breadcrumbY = new facets.Breadcrumb(pathManager, pathY);
	
			// Create the graph pattern
			var triplesX = breadcrumbX.getTriples();		
			var triplesY = breadcrumbY.getTriples();
			
			var triples = sparql.mergeTriples(triplesX, triplesY);
			
			//var element = new sparql.ElementTriplesBlock(triples);
			
			// Create the filter
			var vX = breadcrumbX.getTargetVariable();
			var vY = breadcrumbY.getTargetVariable();
			
			var expr = ns.createWgsFilter(vX, vY, this.bounds, xsd.xdouble);
	
			// Create the result
			var result = new ns.ConstraintElement(triples, expr);
	
			return result;
		},

		getPath: function() {
			return this.path;
		},
		
		createElements: function(facetNode) {
			var result = [];

			// Create breadcrumbs
			var facetNodeX = facetNode.forPath(this.pathX); 
			var facetNodeY = facetNode.forPath(this.pathY);
	
			// Create the graph pattern
			var triplesX = facetNodeX.getTriples();		
			var triplesY = facetNodeY.getTriples();
			
			var triples = sparql.mergeTriples(triplesX, triplesY);

			result.push(new sparql.ElementTriplesBlock(triples));
			
			if(!this.bounds) {
				return result;
			}
			
			//var element = new sparql.ElementTriplesBlock(triples);
			
			// Create the filter
			var vX = facetNodeX.getVar();
			var vY = facetNodeY.getVar();
			
			var expr = ns.createWgsFilter(vX, vY, this.bounds, xsd.xdouble);
	
			result.push(new sparql.ElementFilter([expr]));
			
			// Create the result
			//var result = new ns.ConstraintElement(triples, expr);
			return result;
		}

//		createConstraintElement: function(pathManager) {
//			// Create breadcrumbs
//			var breadcrumbX = new facets.Breadcrumb(pathManager, this.pathX); 
//			var breadcrumbY = new facets.Breadcrumb(pathManager, this.pathY);
//	
//			// Create the graph pattern
//			var triplesX = breadcrumbX.getTriples();		
//			var triplesY = breadcrumbY.getTriples();
//			
//			var triples = sparql.mergeTriples(triplesX, triplesY);
//			
//			//var element = new sparql.ElementTriplesBlock(triples);
//			
//			// Create the filter
//			var vX = breadcrumbX.getTargetVariable();
//			var vY = breadcrumbY.getTargetVariable();
//			
//			var expr = ns.createWgsFilter(vX, vY, this.bounds, xsd.xdouble);
//	
//			// Create the result
//			var result = new ns.ConstraintElement(triples, expr);
//			return result;
//		}
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

	
//	ns.ElementFactoryConcept = function(concept) {
//		this.concept = concept;
//	}
//	
//	ns.ElementFactoryElements.prototype = {
//		createElements: function() {
//			return this.concept.getElements();
//		}
//	};
//
	
	ns.GeoConceptFactoryCombine = function(featureConcept, geoConceptFactory) {
		this.featureConcept = featureConcept;
		this.geoConceptFactory = geoConceptFactory;
	};

	ns.GeoConceptFactoryCombine.prototype = {
			getGeomVar: function() {
				return this.geoConceptFactory.getVar();
			},
			
			getFeatureVar: function() {
				return this.featureConcept.getVar();
			},
			
			getFeatureConcept: function() {
				return this.featureConcept;
			},
			
			getGeoConceptFactory: function() {
				return this.geoConceptFactory;
			},
			
			combineConcepts: function(geoConcept) {
				var geoVar = geoConcept.getVar();
				
				var tmpConcept = facets.createCombinedConcept(this.featureConcept, geoConcept);
				
				var element = tmpConcept.getElement();
				var result = new facets.ConceptInt(element, geoVar);
								
				return result;
			},
			
			createConcept: function(bounds) {
				var geoConcept = this.geoConceptFactory.createConcept(bounds);
				
				var result = this.combineConcepts(geoConcept);
				
				//console.log('Create the combinedConcept with bounds: ', this.geoConceptFactory);
				
				return result;
			}
	};
	
	ns.GeoConceptFactory = function(facetNode, pathConstraintFactory) {
		this.facetNode = facetNode;
		this.pathConstraint = pathConstraintFactory;
	};
	
	ns.GeoConceptFactory.prototype = {
			createConstraint: function(bounds) {
				var result = this.pathConstraint.createConstraint(bounds);
				return result;
			},
			
			createElements: function(bounds) {
				var constraint = this.createConstraint(bounds);
				var result = constraint.createElements(this.facetNode);
				
				return result;
			},
			
			getVar: function() {
				var node = this.facetNode.forPath(this.pathConstraint.getPath());
				var result = node.getVar();

				return result;
			},
			
			createConcept: function(bounds) {
				var v = this.getVar();
				
				var elements = this.createElements(bounds);
				
				var result = facets.ConceptInt.createFromElements(elements, v);
				
				return result;
			}
	};
	
	
	/**
	 * @param varX The SPARQL variable that corresponds to the longitude
	 * @param varY The SPARQL variable that corresponds to the longitude
	 * @param bounds The bounding box to use for filtering
	 * @param castNode An optional SPAQRL node used for casting, e.g. xsd.xdouble
	 */
	ns.createWgsFilter = function(varX, varY, bounds, castNode) {
		var lon = new sparql.ExprVar(varX);
		var lat = new sparql.ExprVar(varY);
		
		// Cast the variables if requested
		if(castNode) {
			lon = new sparql.E_Cast(lon, castNode);
			lat = new sparql.E_Cast(lat, castNode);
		}
		
		var xMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.left));
		var xMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.right));
		var yMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.bottom));
		var yMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.top));

		var result = //new sparql.ElementFilter(
		  new sparql.E_LogicalAnd(
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lon, xMin), new sparql.E_LessThan(lon, xMax)),
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lat, yMin), new sparql.E_LessThan(lat, yMax))
		  );
		//);

		return result;		
	};
	
	
	ns.createFilterOgcIntersects = function(v, bounds) {
		var ogc = "http://www.opengis.net/rdf#";
		
		var exprVar = new sparql.ExprVar(v);
		var wktStr = ns.boundsToWkt(bounds);
		
		// FIXME: Better use typeLit with xsd:string
		var nodeValue = new sparql.NodeValue(sparql.Node.plainLit(wktStr));
		
		var result =
			new sparql.E_Function(
				ogc + "intersects",
				exprVar,
				new sparql.E_Function(
						ogc + "geomFromText",
						wktStr
				)
			);

		return result;
	};
	
	ns.boundsToWkt = function(bounds) {
		var ax = bounds.left;
		var ay = bounds.bottom;
		var bx = bounds.right;
		var by = bounds.top;
		
		var result = "POLYGON((" + ax + " " + ay + "," + bx + " " + ay
				+ "," + bx + " " + by + "," + ax + " " + by + "," + ax
				+ " " + ay + "))";

		return result;
	};
	
	
})(jQuery);
