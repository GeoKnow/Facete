(function() {

	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	
	var ns = Namespace("org.aksw.ssb.widgets");



	/**
	 * A query generator that supports adding paths for projections.
	 * 
	 * 
	 * @param queryGenerator
	 * @returns {ns.QueryProjector}
	 */
	ns.QueryProjector = function(queryGenerator) {
		this.queryGenerator = queryGenerator;
		
		this.projection = new sparql.VarExprList();
		
		// A mapping from paths to variables
		this.varToBreadcrumb = {};
	};
	
	ns.QueryProjector.prototype = {
			getPathManager: function() {
				return this.queryGenerator.getPathManager();
			},
	
			/**
			 * Add a path that should become part of the projection.
			 * 
			 * 
			 * 
			 * @param path
			 * @param aliasVar
			 * @param isOptional
			 * @returns The variable associated with the path
			 */
			addPath: function(path, aliasVar, isOptional) {
				var breadcrumb = new facets.Breadcrumb(this.getPathManager(), path);
		
				//console.log("hmmmm ", breadcrumb);
		
				var variable = breadcrumb.getTargetVariable();
				//var exprVar = new sparql.ExprVar(variable);
	
				this.varToBreadcrumb[variable.value] = {
						breadcrumb: breadcrumb,
						isOptional: isOptional
				};
				
				//var aliasExprVar = aliasVar ? new sparql.ExprVar(aliasVar) : null;
				
				if(aliasVar) {
					this.projection.add(aliasVar, variable);
				} else {
					this.projection.add(variable);
				}
				//this.projection.add(variable, aliasExprVar);
			},

			addVariable: function(variable) {
		
			},
	
			removePath: function(path) {
				var breadcrumb = new facets.Breadcrumb(this.getPathManager(), path);
				
				var variable = breadcrumb.getTargetVariable();
		
				this.removeVariable();
			},
	
			removePath: function(path, aliasVar) {
		
			},
	
	
			createElement: function() {
		
				var elementGroup = this.queryGenerator.createElement();
		
				var entries = this.projection.entries();
		
			
			// Collect all used paths
			/*
			var paths = {};
			for(var i = 0; i < entries.length; ++i) {
				var entry = entries[i];
				var expr = entry.expr;
				
			
				ns.depthFirstTraverseExpr(expr, function(expr) {
					if(expr instanceof facets.ExprPath) {
						var path = expr.getPath();
						
						paths["" + path] = path;
					}
				});
			}
			
			var self = this;
			// Add the triples of every path to the element group
			_.each(paths, function(path) {
				
				var breadcrumb = new facets.Breadcrumb(self.pathManager, path);
				
				var triples = breadcrumb.getTriples();
				
				if(triples) {
					var element = new sparql.ElementTriplesBlock(triples);
					elementGroup.push(element);
				}
				
			});
			*/
	
			_.each(this.varToBreadcrumb, function(breadcrumbInfo) {
				
				var isOptional = breadcrumbInfo.isOptional;
				var breadcrumb = breadcrumbInfo.breadcrumb;
				
				var triples = breadcrumb.getTriples();
				
				if(triples) {
					var element = new sparql.ElementTriplesBlock(triples);
					elementGroup.elements.push(element);
				}
				
			});
	
			
			var result = elementGroup.flatten();
			
			return result;
		},
	
		createQueryCountRows: function(countVar, sampleLimit, options) {
			var element = this.createElement();

			countVar = countVar ? countVar : sparql.Node.v("__c");
			var result = queryUtils.createQueryCount(element, sampleLimit, null, countVar);

			return result;
		},
	
		createQueryRows: function(options) {
			var result = new sparql.Query();
		
			result.setOptions(options);
			
			
			var elementGroup = this.createElement();
			
			// Add all elements to the result query
			result.elements.push.apply(result.elements, elementGroup.elements);
			
			
			var varExprs = this.projection.entries();
			
			for(var i = 0; i < varExprs.length; ++i) {
				var entry = varExprs[i];
				
				result.projectVars.add(entry.v, entry.expr);
			}
			
			
			return result;
		},
	
	
		getQueryGenerator: function() {
			return this.queryGenerator; 
		}
	};
	

	/**
	 * A helper function for invoking a callback on a depth first traversal
	 * over an expression.
	 * 
	 */
	ns.depthFirstTraverseExpr = function(expr, callback) {
		if(!expr) {
			return;
		}
		
		callback(expr);
		
		var subExprs = expr.getArgs();
		for(var i = 0; i < subExprs.length; ++i) {
			var subExpr = subExprs[i];
			
			ns.depthFirstTraverseExpr(subExpr);
		}
	};
	
})();


