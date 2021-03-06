(function($) {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.facets");
	
	// TODO Find some mvc framework for managing the states of facets
	// http://agilityjs.com/
	
	ssb = $.ssb;

	//var ns = {};

	//ssb.facets = ns;

	
	ns.PartArray = function() {
		this.values = [];
		this.isComplete = false;
	};
	
	ns.PartArray.prototype.push = function(item) {
		this.values.push(item);
	};

	// TODO Inherit from Map
	ns.IndexMap = function() {
		this.items = [];
		this.idToIndex = {};

		this.isComplete = false;
	};

	ns.IndexMap.prototype.put = function(key, value) {
		var index = this.idToIndex[value];
		if (!index) {
			index = this.items.length;
			this.items.push(value);
			this.idToIndex[key] = index;
		} else {
			this.items[index] = value;
		}
	};

	ns.IndexMap.prototype.get = function(key) {
		var index = this.idToIndex[key];

		var result = (index != null) ? this.items[index] : null;
		return result;
	};

	ns.IndexMap.prototype.getByIndex = function(index) {
		var result = this.items[index];
		return result;
	};

	ns.IndexMap.prototype.asArray = function() {
		return this.items;
	};

	ns.IndexMap.prototype.size = function() {
		return items.length;
	};
	
	
	ns.FacetRegistry = function() {
		this.idToType = {};
	};
	

	
	/*
	ns.FacetConstraint = function(facet) {
		//this.config = config;
		this.facet = facet;
		
		
		var geoFacet = config.getFacet("geoFacet");
		//geoFacet.constrainRect({0,0,1,1});
		
		
	};
	
	ns.FacetConstraint.prototype.remove = function() {
		
	};
	
	
	ns.ConstraintGeoFacet = function() {

	};
	*/
	
	/**
	 * TODO We need to distinguish between value and label:
	 * If we are dealing with resources, we need to get their labels in the desired languages.
	 * 
	 * 
	 * 
	 * @param parentFacet
	 * @param node
	 *            the value of the facet
	 * @returns {ns.FacetValue}
	 */
	ns.FacetValue = function(parentFacet, variable, nodeValue) {
		this.parentFacet = parentFacet;
		this.variable = variable; // A facet may have multiple variables
		this.nodeValue = nodeValue;
		
		this.count = -1; 
	};

	ns.FacetValue.setCount = function(count) {
		this.count = count;
	};
		
	
	ns.FacetValue.prototype.getConfig = function() {
		return this.parentFacet.getConfig();
	};

	/**
	 * Add a constraint to the facet config.
	 * 
	 * TODO Should we distinguish between different facet types that support
	 * different types of constraints?
	 * 
	 */
	ns.FacetValue.prototype.enable = function() {
		var config = this.getConfig();

		// config.constraints.add
	};

	/**
	 * Check whether this facet value satisfies a constraint of the facet
	 * config.
	 * 
	 * The idea here is, that if there is a range constraint which implicitely
	 * affects this facet value, then it is counted as enabled.
	 * 
	 * So what we need is a method which returns the set of constraint that this
	 * value satisfies.
	 * 
	 */
	ns.FacetValue.prototype.isEnabled = function() {
		var config = this.getConfig();

		// config.getCo
	};

		
	ns.FacetWgs = function(id, element, inputVar, latVar, longVar) {
		this.id = id;
		this.element = element;
		
		this.inputVar = inputVar;
		this.latVar = latVar;
		this.longVar = longVar;
	};

	// Convenience factory function 
	ns.FacetWgs.create = function(id, inputVar, longVar, latVar) {
		var wgs84 = sparql.vocab.wgs84;
		
		var element = new sparql.ElementTriplesBlock([
		       new sparql.Triple(inputVar, wgs84.lat, latVar),
               new sparql.Triple(inputVar, wgs84.long, longVar)
               ]); 
		
		return new ns.FacetWgs(id, element, inputVar, latVar, longVar);
	};
	
	/**
	 * Creates a constraint that limits the facet to a rectangular area
	 * 
	 */
	ns.FacetWgs.prototype.constrainBBox = function(id, bounds) {
		return new sparql.facets.ConstraintWgs(id, this, bounds);
	};

	
	/**
	 * A facet corresponds to a SPARQL query element.
	 * 
	 * 
	 * @param inputVar:
	 *            The variable from which to connect the facet
	 */
	ns.Facet = function(parent, id, element, inputVar, varToLabelElement) {
		// Each facet must have (should have?) unique variables
		// Therefore we might have to rename vars.
		// this.original = ...

		this.parent = parent;
		this.id = id;
		this.element = element;
		this.inputVar = inputVar;

		
		// A query element which is responsible for fetching the labels, e.g.
		// {l: "Optional { ?s rdfs:label ?l . Filter(langMatches(lang(?l), 'de') || Filter(langMatches(lang(?l), 'en') }" }
		// TODO: Should this be modelled as a sub-facet?
		this.varToLabelElement = varToLabelElement;
		
		this.label = id; // By default, the label is set to the id
		this.count = -1; // Negative value indicates "not set"
		
		//this.values = new ns.PartArray(); // A set of facet Values
		this.values = new ns.IndexMap();

		this.varToValues = {};
		
		// 
		this.subFacets = new ns.IndexMap();

		this.metaFacets = new ns.PartArray();
	};
	
	/*
	ns.Facet = Backbone.Model.extend({
		defaults: {
			parent: null,
			id: 'autogen-',
			//name: 'hello',
			element: null,
			inputVar: null,
			count: '0',
			values: new ns.PartArray(),
			subFacets: new ns.IndexMap()//new ns.PartArray()
			//comment: 'world',
			//icon: null
		}
	});
	*/
	
	/*
	ns.Facet.prototype.getOrCreateValue(variable, nodeValue) {
		var values = this.varToValues[variable];
	};*/
	
	ns.Facet.prototype.getId = function() {
		return this.id;
	};
	
	ns.Facet.prototype.getInputVar = function() {
		return this.inputVar;
	};
	
	ns.Facet.prototype.addChild = function(subFacet) {
		subFacet.setParent(this);
		this.subFacets.push(subFacet);
	};

	ns.Facet.prototype.setParent = function(parent) {
		this.parent = parent;
		//this.set("parent", parent);
	};
	
	ns.Facet.prototype.getParent = function() {
		return this.parent;
		//return this.get("parent");
	};
	
	ns.Facet.prototype.setLabel = function(label) {
		this.label = label;
	};
	
	ns.Facet.prototype.getLabel = function() {
		return this.label;
	};
	
	ns.Facet.prototype.setCount = function(count) {
		this.count = count;
	};
	
	ns.Facet.prototype.getCount = function() {
		return this.count;
	};
	
	ns.Facet.prototype.getId = function() {
		return this.id;
	};

	ns.Facet.prototype.getElement = function() {
		return this.element;
	};

	ns.Facet.prototype.getSubFacets = function() {
		return this.subFacets;
	};
	
	ns.Facet.prototype.getPath = function() {
		var result = [];

		var current = this;
		while (current) {
			result.push(current.getId);
			current = this.getParent();
		}

		result.reverse();

		return result;
	};

	ns.Facet.prototype.getPathId = function() {
		var result = this.getPath().join("/");
		return result;
	};

	ns.Facet.prototype.getFacetByPathOffset = function(path, offset) {
		if (offset >= path.length) {
			return this;
		}

		var id = path[offset];
		

		var sub = this.subFacets.get(id);
		if (!sub) {
			return null;
		}

		var result = sub.getFacetByPathOffset(path, offset + 1);
		return result;
	};

  
	/**
	 * Returns a facet value object.
	 * If the same value is already present, the old facet value object is returned.
	 * 
	 * @param nodeValue
	 * @returns
	 */
	ns.Facet.addValue = function(nodeValue) {
		
	};
	
	/**
	 * outputVar: The variable of this facet which should connect to the
	 * inputVar of the subFacet.
	 * 
	 * TODO In general more complex connections are thinkable
	 * 
	 * 
	 * @param subFacet
	 */
	ns.Facet.prototype.addSubFacet = function(subFacet, outputVar) {
		this.subFacets.put(subFacet.getId(), subFacet);
	};

	/**
	 * Create a query that fetches values for this facet:
	 * 
	 * This means we have to create a query that respects all constraints on the
	 * facets, except the constraints on this facet.
	 * 
	 * 
	 */
	/*
	ns.Facet.prototype.createValueQuery = function() {
		var config = this.getConfig();

		// fac

	};*/

	
	
	ns.PathManager = function(variable) {
		this.nextVariableId = 1;
		this.root = new ns.PathNode(this, variable);
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
			var s = sparql.Node.v(node.variable);
			var p = sparql.Node.uri(propertyName);
			var o = sparql.Node.v(nextNode.variable);
			
			var triple = new sparql.Triple(s, p, o);
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
		
		var s = sparql.Node.v(this.variable);
		var p = sparql.Node.uri(propertyName);
		var o = sparql.Node.v(nextNode.variable);
		
		return new sparql.Triple(s, p, o);
	};
	*/
	
	/**
	 * Gets or create a new outgoing node.
	 * 
	 */
	ns.PathNode.prototype.getOrCreate = function(propertyName) {
		var node = this.outgoing[propertyName];
		if(!node) {
			//var this.pathManager.nextVariable()
			node = new ns.PathNode(this.pathManager);

			this.outgoing[propertyName] = node;
			node.incoming[propertyName] = this;
		} else {
			// Nothing to do
		}
		
		return node;
	};
	
	
	ns.PathElement = function(element, inputVar) {
		this.element = element;
		this.inputVar = inputVar;
	};


	ns.FacetValuePm = function(pathManager, pathStr) {
		this.pathManager = pathManager;
		this.pathStr = pathStr;		
	};
	
	ns.FacetValuePm.prototype.getElement = function() {
		var result = new sparql.ElementTriplesBlock(this.pathManager.toTriples(this.pathStr));
		return result;
	};
	
	ns.FacetValuePm.prototype.createFilter = function(constraint) {
		constraint.createFilter();
	};
	
	/**
	 * 
	 * 
	 * 
	 */
	ns.FacetWgsPm = function(pathManager, pathStr) {
		this.pathManager = pathManager;
		this.pathStr = pathStr;
		
		this.long = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
		this.lat = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
	};
	
	ns.FacetWgsPm.prototype.getPathManager = function() {
		return this.pathManager;
	};
	
	
	ns.FacetWgsPm.prototype.getElement = function() {
		var pathStrX = this.pathStr + " " + this.long;
		var pathStrY = this.pathStr + " " + this.lat;
		
		var triplesX = this.pathManager.toTriples(pathStrX);		
		var triplesY = this.pathManager.toTriples(pathStrY);
		
		var combined = triplesX.concat(triplesY);
		
		var resultTriples = _.uniq(combined, false, function(x) { return x.toString(); });
		
		var result = new sparql.ElementTriplesBlock(resultTriples);
		
		//console.log("Triples: ", result);
		return result;
		
	};
	
	ns.FacetWgsPm.prototype.createFilter = function(bounds) {
		var node = this.pathManager.getNode(this.pathStr);
		
		var nodeX = node.getOrCreate(this.long);
		var nodeY = node.getOrCreate(this.lat);
		
		var vX = sparql.Node.v(nodeX.variable);
		var vY = sparql.Node.v(nodeY.variable);
		
		var result = sparql.facets.createWgsFilter(vX, vY, bounds);
		
		return result;
	};
	
	
	
	
	ns.FacetConfig2 = function(pathManager) {
		this.pathManager = pathManager;
		
		// A list of facet constraints
		this.constraints = [];
		
		// The path config yields the facet field type (e.g. value or histogram)
		// for the given path
		this.facetFieldConfig = null;
	};
	
	/**
	 * Returns a query element reflecting the current constraints
	 * 
	 * 
	 */
	ns.FacetConfig2.prototype.toElement = function() {
		
	};
	
	
	/**
	 * 
	 * 
	 * 
	 * 
	 * @param pathStr
	 */
	ns.FacetConfig2.prototype.getFacet = function(pathStr) {
		
	};
	
	ns.Facet2 = function(facetConfig) {
		this.facetConfig = facetConfig;
	};
	
	/**
	 * Create a query that counts the number of instances of this facet,
	 * taking any set constraints into account 
	 * 
	 */
	ns.Facet2.prototype.createCountQuery = function() {
		
	};
	

	/**
	 * Maintains a list of facets, their states (i.e. labels and counts), and
	 * active constraints.
	 * 
	 * 
	 * @returns {ns.FacetConfig}
	 */
	ns.FacetConfig = function(driverVar, driver) {
		this.driverVar = driverVar;
		this.driver = driver;
		
		this.root = new ns.Facet(); // The root facet only has subFacets set
		this.constraints = [];
		
		this.facetCountThreshold = 1000;
	};

	
	
	/**
	 * Path is a sequence of facet ids. Hm, maybe we can manage facets using a
	 * dom? The advantage would be, that we could do XPath on them.
	 * 
	 * Examples: config.getFacet(["subventions"]);
	 * 
	 */
	ns.FacetConfig.prototype.getFacet = function(path) {
		return this.root.getFacetByPathOffset(path, 0);
	};

	ns.FacetConfig.prototype.getRoot = function() {
		return this.root;
	};

	ns.FacetConfig.prototype.addFacet = function(facet, outputVar) {
		this.getRoot().addSubFacet(facet, outputVar);
	};

	

	
	
	/**
	 * 
	 * 
	 * @param config
	 * @returns {ns.FacetController}
	 */
	ns.FacetController = function(sparqlService, config) {
		this.sparqlService = sparqlService;
		this.config = config;
		
		/*
		if(config) {
			this.config = config;
		} else {
			this.config = new ns.FacetConfig();
		}*/
		
		// TODO Get rid of this dependency		
		//this.facetManager = new sparql.facets.FacetManager();
	};
	

	ns.FacetUtils = {};
	
	ns.FacetUtils.createQueryLoadDefaults = function(config) {
		// The maximum number of instances to scan for collecting properties
		var instanceScanCount = 10001;
		
		
		var result = new sparql.Query();
		
		result.distinct = true;
		
		var p = sparql.Node.v("__p");
		var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		result.projection[p.value] = null;
		result.projection[c.value] = new sparql.E_Count(new sparql.ExprVar(p));


		var subQuery = result;
		if(instanceScanCount) { // limit instances to check for properties
		    subQuery = new sparql.Query();
		    subQuery.isResultStar = true;
		    subQuery.limit = instanceScanCount;
		    result.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		subQuery.elements.push(config.driver);
		result.elements.push(new sparql.ElementTriplesBlock([new sparql.Triple(config.driverVar, p, o)]));
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new sparql.Query();
			result.projection[]
		}
		*/
		
		// TODO Order by ?o ?p
		result.order.push(new sparql.Order(new sparql.ExprVar(c), sparql.OrderDir.Desc));
		
		console.log("Created query: " + result);
		return result;
	};
		
	
	ns.DummyCallback = {failure: function() {}, success: function() {} };
	
	ns.FacetUtils.loadDefaultFacets = function(sparqlService, config, callback) {
		var autoFacetVar = 1;
		
		var self = this;
		var s = config.driverVar;
		
		q = ns.FacetUtils.createQueryLoadDefaults(config);
		
		if(!callback) {
			callback = ns.DummyCallback;
		}
		
		console.log("Fetching facets: " + q);
		
		sparqlService.executeSelect(q.toString(), {
			failue: function() { callback.failure(); },
			success: function(jsonRs) {
				// Update the model (and thereby the view)
				var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");

				for(var propertyName in map) {
					//var count = map[propertyName];
					var propertyNode = sparql.Node.uri(propertyName);
					var objectNode = sparql.Node.v("var" + autoFacetVar);
					
					
					/*
					var facetDesc = new sparql.facets.FacetDesc
					(
							propertyName,
							propertyNode,
							new sparql.ElementTriplesBlock([new sparql.Triple(self.config.driverVar, propertyNode, objectNode)])
					);
					*/
					
					var element = new sparql.ElementTriplesBlock([new sparql.Triple(s, propertyNode, objectNode)]);
					
					var newFacet = new ns.Facet(config.getRoot(), propertyNode.value, element, s.value);
					
					config.addFacet(newFacet);
					
					//self.knownFacets.push(facetDesc);
					//var facets = config.getRoot().getSubFacets();					
				}
				callback.success();
			}
		});
	};

	/**
	 * Create a query for fetching the values and their counts of a facet
	 * 
	 * Example:
	 * If the facet corresponds to { ?s rdfs:label ?o }, then the query is
	 * 
	 * Select Distinct ?o Count(?s) { { Select Distinct ?s { ?s driver ... constraints . } Limit 10001 } . ?s rdfs:label ?o .
	 * 
	 * 
	 * 
	 * @param config
	 * @param facet
	 */
	ns.FacetUtils.createValuesQuery = function(config, facet) {
		// The maximum number of instances to scan for collecting properties
		//var config = facet.getConfig();
		var instanceScanCount = 10001;

		var element = facet.getElement();
		var outputVars = _.difference(facet.getElement().getVarsMentioned(), [facet.getInputVar()]);
		console.log("Outputvars=", facet.getElement().getVarsMentioned(), facet.getInputVar());

		var result = new sparql.Query();
		for(var i in outputVars) {
			var outputVar = outputVars[i];
			
			//var varNode = sparql.Node.v(outputVar);
			result.projection[outputVar] = null; //varNode;
		}
		
		
		result.distinct = true;
		
		//var p = sparql.Node.v("__p");
		//var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		//result.projection[p] = null;
		result.projection[c.value] = new sparql.E_Count();


		var subQuery = result;
		if(instanceScanCount) { // limit instances to check for properties
		    subQuery = new sparql.Query();
		    subQuery.isResultStar = true;
		    subQuery.limit = instanceScanCount;
		    result.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		subQuery.elements.push(config.driver);
		subQuery.elements.push(element);

		result.elements.push(element);
		
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new sparql.Query();
			result.projection[]
		}
		*/
		
		// TODO Order by ?o ?p
		result.order.push(new sparql.Order(new sparql.ExprVar(c), sparql.OrderDir.Desc));
		
		for(var i in outputVars) {
			var outputVar = outputVars[i];			
			result.order.push(new sparql.Order(new sparql.ExprVar(sparql.Node.v(outputVar)), sparql.OrderDir.Asc));
		}

		
		console.log("Created query: " + result);
		return {query: result, outputVars: outputVars };
		
	};
	
	ns.FacetUtils.createStatusQuery = function(config) {
		// For each facet get its count by taking the status of the other facets into account.
		//
		var maxCount = 1001;

		var knownFacets = config.getRoot().getSubFacets().asArray();
		
		if(!knownFacets) {
			console.log("No facets to load");
			return;
		}
		
		//console.log("Reloading facets:" , knownFacets);
		/*
		for(var i in open) {
			var facet = 
		}
		*/
		
		//var self = this;

		
		var unionElements = [];
		var p = sparql.Node.v("__p");
		var count = sparql.Node.v("__c");
		for(var i in knownFacets) {
			
			var facet = knownFacets[i];
			
			//console.log("Known facet: ", facet);
			
			var q = new sparql.Query();

			var s = config.driverVar;
			q.projection[p.value] = null;
			q.projection[count.value] = new sparql.E_Count(s);


			var subQuery = new sparql.Query();
			subQuery.limit = maxCount;
			subQuery.elements.push(config.driver);
			subQuery.elements.push(facet.queryElement); //.copySubstitute(facet.mainVar, facetManager.driverVar);
			subQuery.distinct = true;
			subQuery.projection[p.value] = new sparql.NodeValue(sparql.Node.uri(facet.id));
			subQuery.projection[s.value] = null;
			//subQuery.projection[count] = new sparql.E_Count(subExpr);
			//subQuery.projection[count] = new sparql.E_Count(new sparql.ExprVar(s));
			//q.elements.push(new sparql.ElementSubQuery(subQuery));

			
			var countWrapper = new sparql.Query();
			countWrapper.projection[p.value] = null;
			countWrapper.projection[count.value] = new sparql.E_Count(new sparql.ExprVar(s));
			
			countWrapper.elements.push(new sparql.ElementSubQuery(subQuery));
			

			unionElements.push(new sparql.ElementSubQuery(countWrapper));
			//batchQuery.
			//this.facetManager. somehow get the configuration as a query
			
			
			// TODO: For each facet we need to get its query element.
			// facet.getQueryElement();
			
			
			// Select Distinct ?p ?c { { Select ?p { <driver> ?driver_var ?p ?o . Filter(?p = <facet>) . } Limit 1001 } }
			
			//this.sparqlService.
		}
		
		//var union = FacetController.balance(ssb.ElementUnion, unionElements);
		

		var batchQuery = new sparql.Query();
		//batchQuery.isResultStar = true;
		batchQuery.projection[p.value] = null;
		batchQuery.projection[count.value] = null;
		batchQuery.elements.push(new sparql.ElementUnion(unionElements));

		console.log("Facet query: " + batchQuery);
		
		return batchQuery;
	};
	
	
	
	ns.test = function() {
		
		var facets = sparql.facets;

		var sparqlService = new VirtuosoSparqlService("http://localhost/sparql", ["http://fintrans.publicdata.eu/ec/"]);
		/*
		*/
		
		/*
		var s = sparql.Node.v("s");
		var p = sparql.Node.v("p");
		var o = sparql.Node.v("o");
		*/

		var a = sparql.Node.uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");		
		
		var subvention = sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/Subvention");
		var beneficiary = sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/beneficiary");
		var city = sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/city");
		var sameAs = sparql.Node.uri("http://www.w3.org/2002/07/owl#sameAs");
		
		var s = sparql.Node.v("s");
		var driver = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, subvention)]);

		
		//var element = new sparql.ElementTriplesBlock([new sparql.Triple(s, p, o)]);
		
		var config = new ns.FacetConfig(s, driver);		

		//config.addFacet()
		
		var s = sparql.Node.v("s");
		//var p = sparql.Node.uri("http://test.org");
		//var o = sparql.Node.v("o");

		
		/**
		 * 
		 * Facet list:
		 * Visually, a facet list consists of:
		 * - a search/filter field
		 * - a list of label-count pairs
		 * 
		 * Clicking any of the labels opens a facet item.
		 * 
		 * A facet item consists of a set of tabs:
		 * - one for the facet values
		 * - one for the sub facets
		 * 
		 * A facet value is a clickable constant.
		 * The sub-facet tab contains a facet list (which are the facets of a facet's values)
		 *  
		 * Issues I need to solve:
		 * 
		 * .) Deas a facet always only have a singe input variable?
		 *     At least for now: yes. Although it would be theoretically possible to allow a set of vars (and connect facets with
		 *     multiple input vars), I don't see a use case for this right now.
		 * 
		 * .) How to deal with multiple output vars?
		 *    Actually, facets should provide a layer of abstraction from the output variables.
		 *    TODO How?
		 *    
		 * 
		 * 
		 * 
		 */

		
		var facetItem = $$({}, '<li><form action=""><input type="checkbox" /><span data-bind="name"/> (<span data-bind="count"/>)</form><ol style="display:none;"></ol></li>', '& span { cursor:pointer; }', {

			'click input': function() {
				alert("click" + this.model.get("id"));
				
			},
			
			'click span:first': function() {


				  
				  
				  //ns.FacetUtils.getFacetValues
				  
				  //console.log("Fetching values for: ", this.model.get('id'));
				  
				  
				  /*
					var element = new sparql.ElementTriplesBlock([new sparql.Triple(s, propertyNode, objectNode)]);
					
					var newFacet = new ns.Facet(config.getRoot(), propertyNode.value, element, s);
					
					config.addFacet(newFacet);
					*/

				
				/*
			    var input = prompt('Edit to-do item:', this.model.get('content'));
			    if (!input) return;
			    this.model.set({content:input});
			    */
			},
			'click button': function() {
			this.destroy();
			}
		});

		var facetSwitcher = $$(
				{},
				'<li><span data-bind="name"/> (<span data-bind="countStr"/>)<div style="display:none;" class="widget"><ul class="tabnav"><li><a href="#t1">Values</a></li><li><a href="#t2">Sub-Facets</a></li></ul><div class="tabdiv" id="t1"><ol></ol></div><div class="tabdiv" id="t2">Facets not loaded</div></div>', '& span { cursor:pointer; }',
				{
					create: function() {
						// Turn the Html-view-string into tabs
						// TODO Should be an accordion
						this.view.$().tabs();
						//this.controller.loadValues();
					}, 
					
					loadValues: function() {
						var facetElement = this.view.$("div:first");
						//var isVisible = $(facetElement).is(":visible");
						//$(facetElement).toggle();

						//console.log("Visibility: ", isVisible, facetElement, this.view);
						
						//var facetElement = this.view.$("ol:first");
						//var isVisible = $(facetElement).is(":visible");
						//$(facetElement).toggle();

						//console.log("Visibility: ", isVisible, facetElement, this.view);
						$(facetElement).toggle();

						
						
						var isLoaded = this.model.get('isLoaded');
						
						if(isLoaded) {
							return;
						}
						
						//this.view.$("ol").html("");
						
						this.model.set({isLoaded: true});

						var facet = this.model.get('facet');
						var config = this.model.get('config');

					
						this.controller.loadValuesCore(facet, config);
					},
					
					loadValuesCore: function(facet, config) {
						var self = this;

						var queryData = ns.FacetUtils.createValuesQuery(config, facet);

						var query = queryData.query;
						query.limit = 10;
						
						console.log("Values query:", queryData);
						
						// Test query
						//query.elements.push(new sparql.ElementString("?s rdfs:label ?var1 . Filter(regex(?var1, '199')) ."));
						
						sparqlService.executeSelect(query.toString(), {
							success: function(jsonRs) {
								
									
								//var vars = jsonRs.head.vars;
								
								// TODO We need a discriminator column so we know which facet the values correspond to
								var map = jsonRdfResultSetToMap(jsonRs, "var1", "__c");
						
								var uris = [];
								for(var key in map) {
									if(key.toString().startsWith("http://")) {
										uris.push(key);
									}
								}
								
								console.log("Value URIs", uris, map);
								
								var labelFetcher = new $.ssb.utils.LabelFetcher(sparqlService);
								labelFetcher.fetch(uris, true, function(data) {

									var idToLabel = data.uriToLabel;
									console.log("Facet value uris", idToLabel);

								
									for(var propertyName in map) {
										
										var label = propertyName;
										if(propertyName in idToLabel) {
											label = idToLabel[propertyName].value;
										}

										
										var count = map[propertyName];
									
										//var facetValue = facet.getValue();
	
										//var facet = config.getFacet([propertyName]);
										
										//facet.setCount(count);
	
										
									
										//var facetItem = new FacetItem({id: propertyName, name: propertyName, count: count});
									
									
									//self.facetCollection.add(new FacetItem({id: propertyName, name: propertyName, count: count}));
										var newItem = $$(facetItem, {id: propertyName, name: label, count: count});
									
										//self.append(newItem, "ul.eq(1)");
										self.append(newItem, "ol");
									}
								});
							}
						});
					},
					
					'click span:first': function() {
						this.controller.loadValues();
					}
				}
		);
	
	
		// style="position:absolute; left:500px; top:100px";
		var facetList = $$({config: config, sparqlService: sparqlService}, '<div><form action=""><input type="text"/><input type="button" value="Search"/></form><ul></ul> </div>', {
	
			create: function() {
				var self = this;
				
				var loadDefaults = true;
				
				
				var config = this.model.get('config');
				var sparqlService = this.model.get('sparqlService');
				
				
				if(loadDefaults) {
					ns.FacetUtils.loadDefaultFacets(sparqlService, config, {
						failure: function() { console.err("Failure"); },
						success: function() { self.controller.init(); }
					
					} );
				} else {
					this.init();
				}				
			},
		
			init: function() {
				var self = this;
				
				var config = this.model.get('config');
				var sparqlService = this.model.get('sparqlService');

					
				
				
				var query = ns.FacetUtils.createStatusQuery(config);
				
				console.log("Status query:", query.toString(), config);
				
				sparqlService.executeSelect(query.toString(), {
					success: function(jsonRs) {
						var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");

						//console.log("labelFetcher", $.ssb);
						var labelFetcher = new $.ssb.utils.LabelFetcher(sparqlService);
						labelFetcher.fetch(_.keys(map), true, function(data) {
							
							var idToLabel = data.uriToLabel;
							
							//console.log("uriToLabel", idToLabel);
							for(var propertyName in map) {
								
								var label = propertyName;
								if(propertyName in idToLabel) {
									label = idToLabel[propertyName].value;
								}
																
								var count = map[propertyName];
	
								var countStr = (count > config.facetCountThreshold) ? ">" + config.facetCountThreshold : "" + count; 
	
								
								var facet = config.getFacet([propertyName]);
								if(!facet) {
									console.log("Getting facet from config: ", config, propertyName);								
								}
								
								facet.setCount(count);
								
								
								//console.log("Got facet by path:", facet);
	
								//var facetItem = new FacetItem({id: propertyName, name: propertyName, count: count});
								
								
								//self.facetCollection.add(new FacetItem({id: propertyName, name: propertyName, count: count}));
								var newItem = $$(facetSwitcher, {config: config, facet: facet, id: propertyName, name: label, count: count, countStr: countStr});
								
								self.append(newItem, "ul:first");
							}
						});
					}
				});
				
				
				
			    //var newItem = $$(facetItem, {name: 'FacetX', count: countStr});
			    //this.append(newItem, 'ul');
				
				
				//var config = this.model.get('config');
				
				//console.log("Create config:", config);
				
				
				/*
				var facets = config.getRoot().getSubFacets().asArray();
				console.log("facetsx", facets);
				for(var i in facets) {
					var facet = facets[i];
			  
					console.log("facetx", facet);
			  
			  
					var newItem = $$(facetItem, {content: facet.getId() });
					this.append(newItem, 'ul');
				}*/
			}
		
	
			/*
				'click #new': function(){
			    var newItem = $$(facetItem, {content:'Click to edit'});
			    this.append(newItem, 'ul'); // add to container, appending at <ul>
			  }
			  */
		});

		$("#facets2").append('<form action=""><input id="constrainToVisibleArea" type="checkbox" />Unlink from visible area</form>');
		
		
		// TODO: Implement behaviour
		$("#constrainToVisibleArea").click(function() { alert("cilkc"); });
		
		$$.document.append(facetList, "#facets2");
		
		//console.log("Agility test", $$.document);
		
		//$$("#test").append(check);
		// config.getRootP
	};

})(jQuery);
