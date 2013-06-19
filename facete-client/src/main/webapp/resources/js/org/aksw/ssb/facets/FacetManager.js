(function() {
	
	var ns = Namespace("org.aksw.ssb.facets");

	

	ns.QueryFactoryFacets = function(subQueryFactory, rootFacetNode, constraintManager) {
		this.subQueryFactory = subQueryFactory;
		this.rootFacetNode = rootFacetNode;
		this.constraintManager = constraintManager ? constraintManager : new ns.ConstraintManager();
	};
	
	ns.QueryFactoryFacets.create = function(subQueryFactory, rootVarName, generator) {
		generator = generator ? generator : new facets.GenSym("fv");
		var rootFacetNode = facets.FacetNode.createRoot(rootVarName, generator);
		
		var result = new ns.QueryFactoryFacets(subQueryFactory, rootFacetNode);

		return result;
	};

	ns.QueryFactoryFacets.prototype = {
		getRootFacetNode: function() {
			return this.rootFacetNode;
		},
			
		getConstraintManager: function() {
			return this.constraintManager;
		},
			
		createQuery: function() {
			var query = this.subQueryFactory.createQuery();

			//var varsMentioned = query.getVarsMentioned();
			var varsMentioned = query.getProjectVars().getVarList();
			

			var varNames = _.map(varsMentioned, function(v) {
				return v.value;
			});
			
			
			var elements = this.constraintManager.createElements(this.rootFacetNode);
			query.elements.push.apply(query.elements, elements);
			
			return query;
		}	
	};
	
	
	ns.ArrayAdapterArray = {
		
	};
	
	
	/*
	ns.Breadcrumb = function(facetManager, path) {
		this.facetManager = facetManager;
		this.path = path;
	}
	*/
	
	ns.ConstraintNode = function(facetNode, parent) {
		this.facetNode = facetNode;
		this.parent = parent;
		
		this.idToConstraint = {};
	};

	
	/**
	 * A class for generating variables for step-ids.
	 * So this class does not care about the concrete step taken.
	 * 
	 * @param variableName
	 * @param generator
	 * @param parent
	 * @param root
	 * @returns {ns.VarNode}
	 */
	ns.VarNode = function(variableName, generator, stepId, parent, root) {
		this.variableName = variableName;
		this.generator = generator;
		this.stepId = stepId; // Null for root
		this.parent = parent;
		this.root = root;
		
		
		//console.log("VarNode status" , this);
		if(!this.root) {
			if(this.parent) {
				this.root = parent.root;
			}
			else {
				this.root = this;
			}
		}

		
		this.idToChild = {};
	};
	
	
	ns.VarNode.prototype = {
			isRoot: function() {
				var result = this.parent ? false : true;
				return result;
			},

			/*
			getSourceVarName: function() {
				var result = this.root.variableName;
				return result;
			},
			*/
			
			getVariableName: function() {
				return this.variableName;
			},
			
			/*
			forPath: function(path) {
				var steps = path.getSteps();
				
				var result;
				if(steps.length === 0) {
					result = this;
				} else {
					var step = steps[0];
					
					// TODO Allow steps back
					
					result = forStep(step);
				}
				
				return result;
			},
			*/

			getIdStr: function() {
				var tmp = this.parent ? this.parent.getIdStr() : "";
				
				var result = tmp + this.variableName;
				return result;
			},

			getStepId: function(step) {
				return "" + JSON.stringify(step);
			},
			
			getSteps: function() {
				return this.steps;
			},
				
			/**
			 * Convenience method, uses forStep
			 * 
			 * @param propertyUri
			 * @param isInverse
			 * @returns
			 */
			forProperty: function(propertyUri, isInverse) {
				var step = new ns.Step(propertyUri, isInverse);
				
				var result = this.forStep(step);

				return result;
			},

			forStepId: function(stepId) {
				var child = this.idToChild[stepId];
				
				if(!child) {
					
					var subName = this.generator.next();
					child = new ns.VarNode(subName, this.generator, stepId, this);
					
					//Unless we change something
					// we do not add the node to the parent
					this.idToChild[stepId] = child;				
				}
				
				return child;
			}
	};
	
	
	ns.SparqlDataflow = function(query, fnPostProcessor) {
		this.query = query;
		this.fnPostProcessor = fnPostProcessor;
	};
	
	ns.SparqlDataflow.prototype = {
		createDataProvider: function(sparqlServer) {

			var executor = new facets.ExecutorQuery(sparqlService, query);
			var result = new DataProvider(executor);
			
			// TODO Attach the postProcessing workflow
			
			return result;
		}
	};	
	
	ns.ElementDesc = function(element, focusVar, facetVar) {
		this.element = element;
		this.focusVar = focusVar;
		this.facetVar = facetVar;
	};
	

	ns.ElementDesc.prototype = {
			createConcept: function() {
				var result = new facets.ConceptInt(this.element, this.facetVar);
				return result;
			},
			
			createQueryFacetValueCounts: function() {
				var element = this.element;
				
				var focusVar = this.focusVar;
				var facetVar = this.facetVar;

				var sampleLimit = null;
								
				countVar = countVar ? countVar : sparql.Node.v("__c");
				var result = queryUtils.createQueryCount(element, sampleLimit, focusVar, countVar, [facetVar], options);
				
				return result;
			},
			
			createQueryFacetValues: function() {
				var element = this.element;
								
				var focusVar = this.focusVar;
				var facetVar = this.facetVar;

				var sampleLimit = null;
				
				countVar = countVar ? countVar : sparql.Node.v("__c");
				var result = queryUtils.createQueryCountDistinct(element, sampleLimit, focusVar, countVar, [facetVar], options);

				return result;
			}
	};
	
	
	/**
	 * Utility functions for creating constraints on paths.
	 * 
	 * TODO: What about an E_Range(givenExpr, minExpr, maxExpr)?
	 * This one does not exist in the SPARQL standard,
	 * but the effective expression would be
	 * givenExpr > minExpr && givenEXpr < maxExpr
	 * 
	 * So it would be a useful abstraction.
	 * The fundamental question is, whether this abstraction
	 * should be done with the SPARQL classes in the first place.
	 * 
	 */
	ns.ConstraintUtils = {
		createEquals: function(path, expr) {
			var v = sparql.Node.v("e");
			var ev = new sparql.ExprVar(v);
			
			var ex = new sparql.E_Equals(ev, expr);			
			var varToPath = {e: path};
			
			var result = new ns.ConstraintExpr(ex, varToPath);
			return result;
		}
	};
	
	
	
	/**
	 * An expressions whose variables are expressed in terms
	 * of paths.
	 * 
	 * TODO What if we constrained a geo resource to a bounding box?
	 * If the instance function accepted a facet node,
	 * then a constraint could use it to create new triples (e.g. geoResource lat/long ?var)
	 * 
	 * On the other hand, as this essentially places constraints at
	 * different paths (i.e. range constraints on lat/long paths),
	 * so actually, we could expand this constraints to sub-constraints,
	 * resulting in a hierarchy of constraints, and also resulting
	 * in another layer of complexity...
	 * 
	 * 
	 * 
	 * 
	 * Constraint.intstanciate(facetNode
	 * 
	 * 
	 * @param expr
	 * @param varToPath
	 * @returns {ns.Constraint}
	 */
	ns.ConstraintExpr = function(expr, varToPath)  {
		this.expr = expr;
		this.varToPath = varToPath;
	},
	
	ns.ConstraintExpr.prototype = {
		/*
		 * Get the paths used by this expression
		 */
		getPaths: function() {
			var result = _.values(this.varToPath);
			return result;
		},
			
		getId: function() {
			
		},
		
		toString: function() {
			return this.getId();
		},
		
		/**
		 * Returns an array of elements.
		 * 
		 * Change: It now returns an element and a set of expressions.
		 * The expressions get ORed when on the same path
		 * 
		 * Replaces the variables in the expressions
		 * with those for the paths.
		 * 
		 * 
		 * Usually the facetNode should be the root node.
		 * 
		 * @param varNode
		 */
		instanciate: function(facetNode) {
			var varMap = {};
			
			_.each(this.varToPath, function(path, varName) {
				var targetFacetNode = facetNode.forPath(path);
				var v = targetFacetNode.getVariable();
				varMap[varName] = v;
			});
			
			var fnSubstitute = function(node) {
				//console.log("Node is", node);
				if(node.isVar()) {
					var varName = node.getValue();
					var v = varMap[varName];
					if(v) {
						return v;
					}
				}
				return node;
			};
			
			//console.log("Substituting in ", this.expr);
			var tmpExpr = this.expr.copySubstitute(fnSubstitute);
			
			var result = {
					elements: [], //element],
					exprs: [tmpExpr]
			};
			
			/*
			var result = [element];
			*/
			
			return result;
			//substitute
		}
	};

	
	/**
	 * Are constraints connected to paths?
	 * Actually we could do this:
	 * E_GreaterThan(?a, 1000)
	 * 
	 * ?a = new Path(new Step("http://.../amount"));
	 * 
	 * This way we could reuse all expr classes, and just replace
	 * the variables. 
	 * 
	 * @returns {ns.ConstraintManager}
	 */
	ns.ConstraintManager = function() {
		this.constraints = [];
		
		//var pathIdToConstraints = {};
	};
	
	ns.ConstraintManager.prototype = {
		
		/**
		 * Yields all constraints having at least one
		 * variable bound to the exact path
		 * 
		 * Note: In general, a constraint may make use of multiple paths
		 */
		getConstraintsByPath: function(path) {
			var result = [];
			
			var constraints = this.constraints;
			
			for(var i = 0; i < constraints.length; ++i) {
				var constraint = constraints[i];
				
				var paths = constraint.getPaths();
				
				var isPath = _.some(paths, function(p) {
					var tmp = p.equals(path);
					return tmp;
				});
				
				if(isPath) {
					result.push(constraint);
				}
			}
			
			return result;
		},
		

		getConstrainedSteps: function(path) {
			//console.log("getConstrainedSteps: ", path);
			checkNotNull(path);
			
			var tmp = [];
			
			var steps = path.getSteps();
			var constraints = this.constraints;
			
			for(var i = 0; i < constraints.length; ++i) {
				var constraint = constraints[i];
				//console.log("  Constraint: " + constraint);

				var paths = constraint.getPaths();
				//console.log("    Paths: " + paths.length + " - " + paths);
				
				for(var j = 0; j < paths.length; ++j) {
					var p = paths[j];
					var pSteps = p.getSteps();
					var delta = pSteps.length - steps.length; 
					
					//console.log("      Compare: " + delta, p, path);
					
					var startsWith = p.startsWith(path);
					//console.log("      Startswith: " + startsWith);
					if(delta == 1 && startsWith) {
						var step = pSteps[pSteps.length - 1];
						tmp.push(step);
					}
				}
			}
			
			var result = _.uniq(tmp, function(step) { return "" + step; });
			
			//console.log("Constraint result", constraints.length, result.length);
			
			return result;
		},
			
		addConstraint: function(constraint) {
			this.constraints.push(constraint);
		},
		
		removeConstraint: function() {
			// TODO implement
		},
		
		createElement: function(facetNode, excludePath) {
			console.log("Should not be invoked");
			
			var elements = this.createElements(facetNode, excludePath);
			var result;
			if(elements.length === 1) {
				result = elements[0];
			} else {
				result = new sparql.ElementGroup(elements);
			}
			
			return result;
		},
		
		createElements: function(facetNode, excludePath) {
			//var triples = [];
			var elements = [];
			
			
			var pathToExprs = {};
			
			_.each(this.constraints, function(constraint) {
				var paths = constraint.getPaths();
				
				var pathId = _.reduce(
						paths,
						function(memo, path) {
							return memo + " " + path;
						},
						""
				);

				// Check if any of the paths is excluded
				if(excludePath) {
					var skip = _.some(paths, function(path) {
						//console.log("Path.equals", excludePath, path);
						
						var tmp = excludePath.equals(path);
						return tmp;
					});

					if(skip) {
						return;
					}
				}
				
				
				_.each(paths, function(path) {
					
					//if(path.equals(excludePath)) {
						// TODO Exclude only works if there is only a single path
						// Or more generally, if all paths were excluded...
						// At least that somehow seems to make sense
					//}
					
					var fn = facetNode.forPath(path);
					
					//console.log("FNSTATE", fn);
					
					var tmpElements = fn.getElements();
					elements.push.apply(elements, tmpElements);
				});
				
				var ci = constraint.instanciate(facetNode);
				var ciElements = ci.elements;
				var ciExprs = ci.exprs;
				
				if(ciElements)
				{
					elements.push.apply(elements, ciElements);
				}				
				
				if(ciExprs && ciExprs.length > 0) {
				
					var exprs = pathToExprs[pathId];
					if(!exprs) {
						exprs = [];
						pathToExprs[pathId] = exprs;
					}
					
					var andExpr = sparql.andify(ciExprs);
					exprs.push(andExpr);
				}				
			});

			_.each(pathToExprs, function(exprs) {
				var orExpr = sparql.orify(exprs);
				var element = new sparql.ElementFilter([orExpr]);

				console.log("andExprs" +  element);

				elements.push(element);
			});

			//console.log("pathToExprs", pathToExprs);

			//console.log("[ConstraintManager::createElements]", elements);
			
			return elements;
		}
		
	};
	
	/**
	 * This class only has the purpose of allocating variables
	 * and generating elements.
	 * 
	 * The purpose is NOT TO DECIDE on which elements should be created.
	 * 
	 * 
	 * @param parent
	 * @param root
	 * @param generator
	 * @returns {ns.FacetNode}
	 */
	ns.FacetNode = function(varNode, step, parent, root) {
		this.parent = parent;
		this.root = root;
		if(!this.root) {
			if(this.parent) {
				this.root = parent.root;
			}
			else {
				this.root = this;
			}
		}

		
		this.varNode = varNode;
		
		/**
		 * The step for how this node can be  reached from the parent
		 * Null for the root 
		 */
		this.step = step;


		this._isActive = true; // Nodes can be disabled; in this case no triples/constraints will be generated
		
		this.idToChild = {};
		
		//this.idToConstraint = {};
	};
	
	/**
	 * Use this instead of the constructor
	 * 
	 */
	ns.FacetNode.createRoot = function(varName, generator) {

		generator = generator ? generator : new facets.GenSym("fv");
		
		var varNode = new ns.VarNode(varName, generator);		
		result = new ns.FacetNode(varNode);
		return result;
	};

	
	ns.FacetNode.prototype = {
		
		getRootNode: function() {
			return this.root;
		},
			
		isRoot: function() {
			var result = this.parent ? false : true;
			return result;
		},
		
		/*
		getVariableName: function() {
			return this.varNode.getVariableName();
		},*/
		
		getVariable: function() {
			var varName = this.varNode.getVariableName();
			var result = sparql.Node.v(varName);
			return result;
		},
		
		getStep: function() {
			return this.step;
		},
		
		getParent: function() {
			return this.parent;
		},
		
		getPath: function() {
			var steps = [];
			
			var tmp = this;
			while(tmp != this.root) {
				steps.push(tmp.getStep());
				tmp = tmp.getParent();
			}
			
			steps.reverse();
			
			var result = new facets.Path(steps);
			
			return result;
		},
		
		forPath: function(path) {
			var steps = path.getSteps();
			
			var result = this;
			_.each(steps, function(step) {
				// TODO Allow steps back
				result = result.forStep(step);
			});
			
			return result;
		},		

		getIdStr: function() {
			// TODO concat this id with those of all parents
		},
		
		getSteps: function() {
			return this.steps;
		},
		
		getConstraints: function() {
			return this.constraints;
		},
		
		isActiveDirect: function() {
			return this._isActive;
		},
				
		
		getElements: function() {
			var result = [];
			
			var triples = this.getTriples();
			if(triples.length > 0) {
				var element = new sparql.ElementTriplesBlock(triples);
				result.push(element);				
			}
			
			
			return result;
		},
		
		/**
		 * Get triples for the path starting from the root node until this node
		 * 
		 * @returns {Array}
		 */
		getTriples: function() {
			var result = [];			
			this.getTriples2(result);
			return result;
		},
		
		getTriples2: function(result) {
			this.createDirectTriples2(result);
			
			if(this.parent) {
				this.parent.getTriples2(result);
			}
			return result;			
		},

		/*
		createTriples2: function(result) {
			
		},*/
		
		createDirectTriples: function() {
			var result = [];
			this.createDirectTriples2(result);
			return result;
		},
				
		
		
		/**
		 * Create the element for moving from the parent to this node
		 * 
		 * TODO Cache the element, as the generator might allocate new vars on the next call
		 */
		createDirectTriples2: function(result) {
			if(this.step) {
				var sourceVar = this.parent.getVariable();
				var targetVar = this.getVariable();
				
				var tmp = this.step.createElement(sourceVar, targetVar, this.generator);
				
				// FIXME
				var triples = tmp.getTriples();
				
				result.push.apply(result, triples);
				
				//console.log("Created element", result);
			}
			
			return result;
			
			/*
			if(step instanceof ns.Step) {
				result = ns.FacetUtils.createTriplesStepProperty(step, startVar, endVar);
			} else if(step instanceof ns.StepFacet) {
				result = ns.FacetUtils.createTriplesStepFacets(generator, step, startVar, endVar);
			} else {
				console.error("Should not happen: Step is ", step);
			}
			*/
		},
		
		isActive: function() {
			if(!this._isActive) {
				return false;
			}
			
			if(this.parent) {
				return this.parent.isActive();
			}
			
			return true;
		},
		
		attachToParent: function() {
			if(!this.parent) {
				return
			}
			
			this.parent[this.id] = this;			
			this.parent.attachToParent();
		},
		
		/*
		hasConstraints: function() {
			var result = _.isEmpty(idToConstraint);
			return result;
		},
		
		// Whether neither this nor any child have constraints
		isEmpty: function() {
			if(this.hasConstraints()) {
				return false;
			}
			
			var result = _.every(this.idConstraint, function(subNode) {
				var subItem = subNode;
				var result = subItem.isEmpty();
				return result;
			});
			
			return result;
		},
		*/
			
		/**
		 * Convenience method, uses forStep
		 * 
		 * @param propertyUri
		 * @param isInverse
		 * @returns
		 */
		forProperty: function(propertyUri, isInverse) {
			var step = new ns.Step(propertyUri, isInverse);
			
			var result = this.forStep(step);

			return result;
		},
			
		forStep: function(step) {
			//console.log("Step is", step);
			
			var stepId = "" + JSON.stringify(step);
			
			var child = this.idToChild[stepId];
			
			if(!child) {
				
				var subVarNode = this.varNode.forStepId(stepId);
				
				child = new ns.FacetNode(subVarNode, step, this, this.root);
				
				/*
				child = {
						step: step,
						child: facet
				};*/
				
				//Unless we change something
				// we do not add the node to the parent
				this.idToChild[stepId] = child;				
			}

			return child;
		},
		
		/**
		 * Remove the step that is equal to the given one
		 * 
		 * @param step
		 */
		/*
		removeConstraint: function(constraint) {
			this.constraints = _.reject(this.constraints, function(c) {
				_.equals(c, step);
			});
		},
		
		addConstraint: function(constraint) {
			this.attachToParent();
			
			var id = JSON.stringify(constraint); //"" + constraint;

			// TODO Exception if the id is object
			//if(id == "[object]")
			
			this.idToConstraint[id] = constraint;
		},
		*/
		
		/**
		 * Copy the state of this node to another one
		 * 
		 * @param targetNode
		 */
		copyTo: function(targetNode) {
			//targetNode.variableName = this.variableName;
			
			_.each(this.getConstraints(), function(c) {
				targetNode.addConstraint(c);
			});			
		},
		
		
		/**
		 * 
		 * 
		 * @returns the new root node.
		 */
		copyExclude: function() {
			// Result is a new root node
			var result = new ns.FacetNode();
			console.log("Now root:" , result);
			
			this.root.copyExcludeRec(result, this);
			
			return result;
		},
			
		copyExcludeRec: function(targetNode, excludeNode) {
			
			console.log("Copy:", this, targetNode);
			
			if(this === excludeNode) {
				return;
			}
			
			this.copyTo(targetNode);
			
			_.each(this.getSteps(), function(s) {
				var childStep = s.step;
				var childNode = s.child;
				
				console.log("child:", childStep, childNode);
				
				if(childNode === excludeNode) {
					return;
				}
				
				
				
				var newChildNode = targetNode.forStep(childStep);
				console.log("New child:", newChildNode);
				
				childNode.copyExcludeRec(newChildNode, excludeNode);
			});			

			
			//return result;
		}
	};
	
	
	/**
	 * The idea of this class is to have a singe object
	 * for all this currently rather distributed facet stuff
	 * 
	 * 
	 * 
	 */
	ns.FacetManager = function(varName, generator) { //rootNode, generator) {
		
		var varNode = new ns.VarNode(varName, generator);
		
		this.rootNode = new ns.FacetNode(varNode);

		//this.rootNode = rootNode;
		this.generator = generator;
	};
	
	ns.FacetManager.prototype = {
			/*
			create: function(varName, generator) {
				var v = checkNotNull(varName);
				var g = checkNotNull(generator);
				
				var rootNode = new ns.FacetNode(this, v);
				
				var result = new ns.FacetManager(rootNode, g);
				
				return result;
			},*/
			
			getRootNode: function() {
				return this.rootNode;
			},
			
			getGenerator: function() {
				return this.generator;
			}
	};
	
	
	/**
	 * Ties together a facetNode (only responsible for paths) and a constraint collection.
	 * Constraints can be declaratively set on the facade and are converted to
	 * appropriate constraints for the constraint collection.
	 * 
	 * e.g. from
	 * var constraint = {
	 * 	type: equals,
	 * 	path: ...,
	 * 	node: ...}
	 * 
	 * a constraint object is compiled.
	 * 
	 * 
	 * @param constraintManager
	 * @param facetNode
	 * @returns {ns.SimpleFacetFacade}
	 */
	ns.SimpleFacetFacade = function(constraintManager, facetNode) {
		this.constraintManager = constraintManager;
		this.facetNode = checkNotNull(facetNode);
	};

	ns.SimpleFacetFacade.prototype = {
			getFacetNode: function() {
				return this.facetNode;
			},
			
			getVariable: function() {
				var result = this.facetNode.getVariable();
				return result;
			},
			
			getPath: function() {
				return this.facetNode.getPath();
			},
			
			forProperty: function(propertyName, isInverse) {
				var fn = this.facetNode.forProperty(propertyName, isInverse);
				var result = this.wrap(fn);
				return result;								
			},
			
			forStep: function(step) {
				var fn = this.facetNode.forStep(step);
				var result = this.wrap(fn);
				return result;				
			},
			
			wrap: function(facetNode) {
				var result = new ns.SimpleFacetFacade(this.constraintManager, facetNode);
				return result;
			},
			
			forPathStr: function(pathStr) {
				var path = facets.Path.fromString(pathStr);
				var result = this.forPath(path);
				
				//console.log("path result is", result);
				
				return result;
			},
			
			forPath: function(path) {
				var fn = this.facetNode.forPath(path);
				var result = this.wrap(fn);
				return result;
			},
			
			forProperty: function(propertyName, isInverse) {
				var fn = this.facetNode.forProperty(propertyName, isInverse);
				var result = this.wrap(fn);
				return result;				
			},

			createConstraint: function(json) {
				if(json.type != "equals") {
					throw "Only equals supported";
				}
				
				var node = json.node;

				checkNotNull(node);
				
				var nodeValue = sparql.NodeValue.makeNode(node);
				var result = facets.ConstraintUtils.createEquals(this.facetNode.getPath(), nodeValue);
				
				return result;
			},
			
			/**
			 * 
			 * Support:
			 * { type: equals, value: }
			 * 
			 * 
			 * @param json
			 */
			addConstraint: function(json) {
				var constraint = this.createConstraint(json);				
				this.constraintManager.addConstraint(constraint);
			},
			
			removeConstraint: function(json) {
				var constraint = this.createConstraint(json);
				this.constraintManager.moveConstraint(constraint);				
			},
			
			// Returns the set of constraint that reference a path matching this one
			getConstraints: function() {
				var path = this.facetNode.getPath();
				var constraints = this.constraintManager.getConstraintsByPath(path);
				
				return constraints;
			},
			
			/**
			 * TODO: Should the result include the path triples even if there is no constraint? Currently it includes them.
			 * 
			 * Returns a concept for the values at this node.
			 * This concept can wrapped for getting the distinct value count
			 * 
			 * Also, the element can be extended with further elements
			 */
			createElements: function(includeSelfConstraints) {
				var rootNode = this.facetNode.getRootNode();
				var excludePath = includeSelfConstraints ? null : this.facetNode.getPath();
				
				// Create the constraint elements
				var elements = this.constraintManager.createElements(rootNode, excludePath);
				//console.log("___Constraint Elements:", elements);
				
				// Create the element for this path (if not exists)
				var pathElements = this.facetNode.getElements();
				//console.log("___Path Elements:", elements);
				
				elements.push.apply(elements, pathElements);
				
				var result = sparql.ElementUtils.flatten(elements);
				//console.log("Flattened: ", result);
				
				// Remove duplicates
				
				return result;
			},
			
			
			/**
			 * Creates the corresponding concept for the given node.
			 * 
			 * @param includeSelfConstraints Whether the created concept should
			 *         include constraints that affect the variable
			 *         corresponding to this node 
			 * 
			 */
			createConcept: function(includeSelfConstraints) {
				var elements = this.createElements(includeSelfConstraints);
				var element = new sparql.ElementGroup(elements);
				var v = this.getVariable();
				
				var result = new facets.ConceptInt(element, v);
				return result;
			},
			
			
			/**
			 * Returns a list of steps of _this_ node for which constraints exist
			 * 
			 * Use the filter to only select steps that e.g. correspond to outgoing properties
			 */
			getConstrainedSteps: function() {
				var path = this.getPath();
				var result = this.constraintManager.getConstrainedSteps(path);
				return result;
			}
			
			
			/**
			 * Returns a list of steps for _this_ node for which constraints exists
			 * 
			 */
			
			
			
			
			/**
			 * Creates a util class for common facet needs:
			 * - Create a concept for sub-facets
			 * - Create a concept for the facet values
			 * - ? more?
			 */
			/*
			createUtils: function() {
				
			}
			*/
	};
	
	
	
	
})();
