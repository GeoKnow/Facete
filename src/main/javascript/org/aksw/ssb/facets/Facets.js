/**
 * Core classes of the facet system:
 * 
 * PathManager
 * PathNode
 * 
 * TODO Breadcrumb (encapsulates a path and supports generating a query element from it)
 * 
 */
(function($) {

	var ns = Namespace("org.aksw.ssb.facets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	ns.FacetValue = function(node, count) {
		this.node = node;
		this.count = count;
	};

	/**
	 * Object holding a query element and a variable (of the query element).
	 * 
	 * @param variable
	 * @param element
	 * @returns {ns.Driver}
	 */
	ns.Driver = function(element, variable) {
		this.element = element;
		this.variable = variable;
	};
	
	ns.PathNodeFactoryDefault = function() {
	};
	
	ns.PathNodeFactoryDefault.prototype.create = function(pathManager, variable) {
		return new ns.PathNode(pathManager, variable);
	};

	
	/**
	 * 
	 * @param variable A variable name (string)
	 * @param nodeFactory
	 * @returns {ns.PathManager}
	 */
	ns.PathManager = function(variable, nodeFactory) {
		this.nextVariableId = 1;
		
		if(!nodeFactory) {
			nodeFactory = new ns.PathNodeFactoryDefault();
		}
		
		this.nodeFactory = nodeFactory;
		
		this.root = nodeFactory.create(this, variable); //
	};
	
	ns.PathManager.prototype.newNode = function(variable) {
		if(!variable) {
			variable = this.nextVariable();
		}
		
		return this.nodeFactory.create(this, variable);
	};
	
	ns.PathManager.prototype.getRoot = function() {
		return this.root;
	};
	
	
	ns.PathManager.prototype.nextVariable = function() {
		return "v_" + (this.nextVariableId++);
	};
	
	/**
	 * Converts a path string to a list of path elements
	 * 
	 * Variables will be created as needed.
	 * 
	 * e.g.
	 * "fts:beneficiary fts:city owl:sameAs geo:long" 
	 * "fts:beneficiary fts:city owl:sameAs geo:lat"
	 * 
	 * { ?s fts:beneficiary ?v1 . ?v1 fts:city ?v2 . ?v3 owl:sameAs ?v4 . 
	 * Operators:
	 * 
	 * <: Inverse <fts:beneficiary
	 * ^: To property
	 * 
	 * 
	 * @param pathStr
	 */
	ns.PathManager.prototype.toTriples = function(pathStr) {
		var items = pathStr.split(" ");
		
		var result = this.toTriplesRec(this.root, items);
		
		return result;
	};
	
	ns.PathManager.prototype.getNode = function(pathStr) {
		var items = pathStr.split(" ");
		
		var result = this.getNodeRec(this.root, items);
		
		return result;
	};

	ns.PathManager.prototype.getNodeRec = function(pathStr, items) {
		var result = this.root;
		
		for(var i = 0; i < items.length; ++i) {
			var propertyName = items[i];
			
			var result = result.getOrCreate(propertyName);
		}
		
		return result;		
	};
	
	ns.PathManager.prototype.toTriplesRec = function(node, items) {
		var result = [];
		
		for(var i = 0; i < items.length; ++i) {
			var propertyName = items[i];
			
			var nextNode = node.getOrCreate(propertyName);
			var s = ssb.Node.v(node.variable);
			var p = ssb.Node.uri(propertyName);
			var o = ssb.Node.v(nextNode.variable);
			
			var triple = new ssb.Triple(s, p, o);
			result.push(triple);

			node = nextNode;
		}
		
		return result;
	};
	
	
	/**
	 * 
	 * Variable is a string
	 * 
	 * @param variable
	 * @returns {ns.PathNode}
	 */
	ns.PathNode = function(pathManager, variable) {
		this.pathManager = pathManager;
		if(!variable) {
			variable = pathManager.nextVariable();
		}
		this.variable = variable;
		
		// A map from property name to another path node
		this.outgoing = {};

		this.incoming = {};
	};
	

	/*
	ns.PathNode.prototype.toTriple = function(propertyName) {
		//var propertyName = items[offset];
		
		var nextNode = this.getOrCreate(propertyName);
		
		var s = ssb.Node.v(this.variable);
		var p = ssb.Node.uri(propertyName);
		var o = ssb.Node.v(nextNode.variable);
		
		return new ssb.Triple(s, p, o);
	};
	*/
	
	/**
	 * Gets or create a new outgoing node.
	 * 
	 * FIXME The "outgoing" refers to reachable successor via some label.
	 * The label can also indicate an inverse property step. 
	 */
	ns.PathNode.prototype.getOrCreate = function(propertyName) {
		var node = this.outgoing[propertyName];
		if(!node) {
			node = this.pathManager.newNode(); //new ns.PathNode(this.pathManager);

			this.outgoing[propertyName] = node;
			node.incoming[propertyName] = this;
		} else {
			// Nothing to do
		}
		
		return node;
	};

	
	/**
	 * 
	 * @param direction
	 * @param resource
	 * @returns {ns.Step}
	 */
	ns.Step = function(propertyName, isInverse) {
		this.type = "property";
		this.propertyName = propertyName;
		this.isInverse = isInverse;
	};
	
	ns.Step.prototype.toString = function() {
		if(this.isInverse) {
			return "<" + this.propertyName;
		} else {
			return this.propertyName;
		}
	};
	
	
	/**
	 * A breadcrumb encapsulates a path across RDF properties.
	 * A breadcrumb can be converted into a set of sparql.Triple objects.
	 * Additionally, it grants access to the source and target nodes
	 * (according to a PathManager), which correspond to sparql variables.
	 * TODO Improve description
	 * 
	 * @param pathManager
	 * @param step
	 * @param sourceNode
	 * @param targetNode
	 * @returns {ns.Breadcrumb}
	 */
	ns.Breadcrumb = function(pathManager, steps, sourceNode, targetNode) {
		this.pathManager = pathManager;
		//this.step = step;
		//this.items = step;
		this.steps = steps;
		this.sourceNode = sourceNode;
		this.targetNode = targetNode;
	};
	
	/**
	 * Returns a new breadcrumb that is the concatenation of the given two
	 * 
	 */
	ns.Breadcrumb.prototype.concat = function(other) {
		if(this.pathManager !== other.pathManager) {
			throw "Only breadcrumbs with the same path manager can be concatenated";
		};
		
		var steps = this.steps.concat(other.steps);
		
		var sourceNode = this.pathManager.root;
		var targetNode = ns.Breadcrumb.getTargetNode(this.pathManager, steps);
		
		var result = new ns.Breadcrumb(
				this.pathManager,
				steps,
				sourceNode,
				targetNode
				);
				
		return result;
	};
	
	ns.Breadcrumb.parseStep = function(str) {
		if(str.startsWith("<")) {
			return new ns.Step(str.substring(1), true);
		} else {
			return new ns.Step(str, false);
		}
	};
	
	ns.Breadcrumb.fromString = function(pathManager, pathStr) {
		pathStr = pathStr.trim();
		
		
		var items = pathStr.length !== 0 ? pathStr.split(" ") : [];
		
		var steps = _.map(items, function(item) { return ns.Breadcrumb.parseStep(item); });
		
		var result = ns.Breadcrumb.fromSteps(pathManager, steps);
		
		return result;
	}
	
	ns.Breadcrumb.fromSteps = function(pathManager, steps) {
		var sourceNode = pathManager.root;
		var targetNode = ns.Breadcrumb.getTargetNode(pathManager, steps);
		
		// TODO [HACK] step should be a real class, not just the item array
		var result = new ns.Breadcrumb(pathManager, steps, sourceNode, targetNode);
		return result;
	};
	
	ns.Breadcrumb.getTargetNode = function(pathManager, steps) {
		var result = pathManager.root;
		
		for(var i = 0; i < steps.length; ++i) {
			var step = steps[i];
			
			var stepStr = step.toString();
			//var propertyName = items[i];
			
			result = result.getOrCreate(stepStr);
		}
		
		return result;
	};
	
	/**
	 * Converts the breadcrumb into a set of triple patterns.
	 * Variables are assigned based on the underlying path manager.
	 * 
	 * 
	 * @returns {Array}
	 */
	ns.Breadcrumb.prototype.getTriples = function() {
		var result = [];
		
		var node = this.pathManager.root;
		
		for(var i = 0; i < this.steps.length; ++i) {
			var step = this.steps[i];
			
			var stepStr = step.toString();
			
			var nextNode = node.getOrCreate(stepStr);
			var s = sparql.Node.v(node.variable);
			var p = sparql.Node.uri(step.propertyName);
			var o = sparql.Node.v(nextNode.variable);
			
			// Swap subject-object if inverse step
			if(step.isInverse) {
				var tmp = s;
				s = o;
				o = tmp;
			}
			
			
			var triple = new sparql.Triple(s, p, o);
			result.push(triple);

			node = nextNode;
		}
		
		return result;		
	};
	
	/*
	ns.Breadcrumb.prototype.addStep = function(step) {
		
	}
	*/
	
	ns.Breadcrumb.prototype.toString = function() {
		return this.steps.join(" ");
	};
	
	

//		var step = ns.Step.fromString(pathManager, pathStr);
	
	

})(jQuery);
