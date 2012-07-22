/**
 * Problem:
 * Somehow there needs to be an interface to build queries, but at the same time there needs
 * to be a way to execute them.
 * 
 * Having something like Jena's Query object in js would be really really neat.
 * 
 * 
 *  
 * 
 * @returns
 */

(function($) {

	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");

	var ns = Namespace("org.aksw.ssb.sparql.syntax");

	
	ns.uniqTriples = function(triples) {
		var result =  _.uniq(triples, false, function(x) { return x.toString(); });
		return result;
	};
	
	/**
	 * Combine two arrays of triples into a singe one with duplicates removed
	 * 
	 */
	ns.mergeTriples = function(a, b) {
		var combined = a.concat(b);		
		var result = ns.uniqTriples(combined);
		return result;		
	};
	
	
	//console.log("The namespace is: ", ns);
	
	//var ns = {};
	
	ns.varPattern = /\?(\w+)/g;
	ns.prefixPattern =/\s+(\w+):\w+\s+/g;

	/**
	 * Extract SPARQL variables from a string
	 * 
	 * @param str
	 * @returns {Array}
	 */
	ns.extractSparqlVars = function(str) {
		return ns.extractAll(ns.varPattern, str, 1);
	};

	ns.extractPrefixes = function(str) {
		return ns.extractAll(ns.prefixPattern, str, 1);	
	};


	ns.extractAll = function(pattern, str, index) {
		// Extract variables from the fragment	
		var match;
		var result = [];
		
		while (match = pattern.exec(str)) {
			result.push(match[index]);
		}
		
		result = _.uniq(result);
		
		return result;
		
	};
		
	ns.Node = function(type, value, language, datatype) {
		this.type = type;
		this.value = value;
		this.language = language;
		this.datatype = datatype;
	};
	
	ns.Node.Type = {};
	ns.Node.Type.Variable = -1;
	ns.Node.Type.BlankNode = 0;
	ns.Node.Type.Uri = 1;
	ns.Node.Type.PlainLiteral = 2;
	ns.Node.Type.TypedLiteral = 3;
	
	ns.Node.fromJson = function(talisJson) {
		var result = new ns.Node();
		
		if(!talisJson || typeof(talisJson.type) === 'undefined') {
			throw "Invalid node";
		}
		
		var type;
		switch(talisJson.type) {
		case 'bnode': type = 0; break;
		case 'uri': type = 1; break;
		case 'literal': type = 2; break;
		case 'typed-literal': type = 3; break;
		default: console.error("Unknown type: '" + talisJson.type + "'");
		}
		
		result.type = type;
		result.value = talisJson.value;
		result.language = talisJson.lang ? talisJson.lang : "";
		result.datatype = talisJson.datatype ? talisJson.datatype : "";

		// TODO I thought it happened that a literal hat a datatype set, but maybe I was imaginating things
		if(result.datatype) {
			result.type = 3;
		}
		
		return result;
		/*
		var type = -2;
		if(node.type == "uri") {
			
		}*/
	};
	
	ns.Node.isNode = function(candidate) {
		return candidate && (candidate instanceof ns.Node);
	};
	
	ns.Node.isUri = function(candidate) {
		return ns.Node.isNode(candidate) && candidate.isUri();		
	};

	
	ns.Node.parse = function(str) {
		var str = str.trim();
		
		if(str.startsWith('<') && str.endsWith('>')) {
			return ns.Node.uri(str.substring(1, str.length - 1));
		} else {
			throw "Node.parse not implemented for argument: " + str;
		}
	};
	
	ns.Node.uri = function(str) {
		return new ns.Node(1, str, null, null);
	};
		
	ns.Node.v = function(name) {
		return new ns.Node(-1, name, null, null);
	};
	
	ns.Node.blank = function(id) {
		return new ns.Node(0, id, null, null);
	};
	
	ns.Node.plainLit = function(value, language) {
		return new ns.Node(2, value, language, null);
	};
	
	ns.Node.typedLit = function(value, datatype) {
		return new ns.Node(3, value, null, datatype);
	};

	ns.Node.forValue = function(value) {
		var dt = typeof value;		
		if(dt === "number") {
			return ns.Node.typedLit(value, "http://www.w3.org/2001/XMLSchema#double");
		} else {
			console.error("No handling for datatype ", td);
		}
		
		//alert(dt);		
	};
	
	/**
	 * Warning: If fnNodeMap does not return a copy, the node will not be copied.
	 * In general, Node should be considered immutable!
	 * 
	 * @param fnNodeMap
	 * @returns
	 */
	ns.Node.prototype.copySubstitute = function(fnNodeMap) {
		var sub = fnNodeMap(this);		 
		var result = (sub == undefined || sub == null) ? this : sub;
		return result;
	};
	
	ns.Node.prototype.toString = function() {
		switch(this.type) {
		case -1: return "?" + this.value;
		case 0: return "_:" + this.value;
		case 1: return "<" + this.value + ">";
		case 2: return "\"" + this.value + "\"" + (this.language ? "@" + this.language : "");
		case 3: return "\"" + this.value + "\"" + (this.datatype ? "^^<" + this.datatype + ">" : "");
		}
	};
	
	
	ns.Node.prototype.isVar = function() {
		return this.type === -1;
	};
	
	ns.Node.prototype.isUri = function() {
		return this.type === ns.Node.Type.Uri;
	};
	
	ns.Triple = function(s, p, o) {
		this.s = s;
		this.p = p;
		this.o = o;
	};
	
	ns.Triple.prototype.toString = function() {
		//return this.s + " " + this.p + " " + this.o + " .";
		return this.s + " " + this.p + " " + this.o;
	};
	
	/*
	ns.fnNodeMapWrapper = function(node, fnNodeMap) {
		var sub = fnNodeMap(node);		 
		var result = (sub == undefined || sub == null) ? node : sub;
		return result;
	};
	*/
	
	ns.Triple.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.Triple(this.s.copySubstitute(fnNodeMap), this.p.copySubstitute(fnNodeMap), this.o.copySubstitute(fnNodeMap));
	};
	
	ns.Triple.prototype.getSubject = function() {
		return this.s;
	};

	ns.Triple.prototype.getProperty = function() {
		return this.p;
	};
	
	ns.Triple.prototype.getObject = function() {
		return this.o;
	};
	
	ns.Triple.prototype.getVarsMentioned = function() {
		var result = [];
		result = ns.Triple.pushVar(result, this.s);
		result = ns.Triple.pushVar(result, this.p);
		result = ns.Triple.pushVar(result, this.o);
		
		return result;
	};
	
	
	ns.Triple.pushVar = function(array, node) {
		return (node.type != -1) ? array : _.union(array, node.value);
	};
	
	
	ns.BasicPattern = function(triples) {
		this.triples = triples ? triples : [];
	};
	
	ns.BasicPattern.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.BasicPattern(this.triples.map(function(x) { return x.copySubstitute(fnNodeMap); }));
	};
	
	ns.BasicPattern.prototype.toString = function() {
		return this.triples.join(" . "); 
	};

	/*
	ns.BasicPattern.prototype.copySubstitute = function() {

	};
	*/
	
	ns.Template = function(bgp) {
		this.bgp = bgp;
	};

	ns.Template.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.Template(this.bgp.copySubstitute(fnNodeMap));
	};
	
	ns.Template.prototype.toString = function() {
		return "{ " + this.bgp + " }";
	};
	
	ns.ElementNamedGraph = function(element, namedGraphNode) {
		this.element = element;
		this.namedGraphNode = namedGraphNode;
	};
	
	ns.ElementNamedGraph.prototype.toString = function() {
		return "Graph " + this.namedGraphNode + " { " + this.element + " }";
	};
	
	ns.ElementNamedGraph.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ElementNamedGraph(this.element.copySubstitute(fnNodeMap), this.namedGraphNode.copySubstitute(fnNodeMap));
	};
	
	ns.ElementNamedGraph.prototype.getVarsMentioned = function() {
		
		var result = this.element.getVarsMentioned();
		if(this.namedGraphNode.isVar()) {
			_.union(result, [this.namedGraphNode]);
		}
		
		return result;
	};
	
	ns.ElementNamedGraph.prototype.flatten = function() {
		return new ns.ElementNamedGraph(this.element.flatten(), this.namedGraphNode);
	};
		
	
	/**
	 * An element that injects a string "as is" into a query.
	 * 
	 */
	ns.ElementString = function(value, varsMentioned) {
		this.value = value;
		this.varsMentioned = varsMentioned ? varsMentioned : [];
	};
	
	ns.ElementString.prototype.toString = function() {
		return this.value;
	};

	ns.ElementString.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ElementString(this.value, this.varsMentioned);
	};
	
	ns.ElementString.prototype.getVarsMentioned = function() {
		return this.varsMentioned;
	};
	
	ns.ElementString.prototype.flatten = function() {
		return this;
	};

	/*
	ns.ElementSubQueryString = function(value) {
		this.value = value;
	};
	
	ns.ElementSubQueryString = function(value) {
		
	}
	*/
	
	
	ns.ElementSubQuery = function(query) {
		this.query = query;
	};
	
	ns.ElementSubQuery.prototype.toString = function() {
		return "{ " + this.query + " }";
	};

	ns.ElementSubQuery.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ElementSubQuery(this.query.copySubstitute(fnNodeMap));
	};
	
	ns.ElementSubQuery.prototype.flatten = function() {
		return new ns.ElementSubQuery(this.query.flatten());
	};
	
	ns.ElementFilter = function(expr) {
		this.expr = expr;
	};
	
	ns.ElementFilter.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ElementFilter(this.expr.copySubstitute(fnNodeMap));
	};

	ns.ElementFilter.prototype.getVarsMentioned = function() {
		return [];
	};
	
	ns.ElementFilter.prototype.flatten = function() {
		return this;
	};
	
	ns.ElementFilter.prototype.toString = function() {
		return "Filter(" + this.expr + ")";
	};
	
	ns.ElementOptional = function(element) {
		this.optionalPart = element;
	};

	ns.ElementOptional.prototype.getVarsMentioned = function() {
		return this.optionalPart.getVarsMentioned();
	};

	ns.ElementOptional.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ElementOptional(this.optionalPart.copySubstitute(fnNodeMap));
	};
	
	ns.ElementOptional.prototype.flatten = function() {
		return new ns.ElementOptional(this.optionalPart.flatten());
	};
	
	ns.ElementOptional.prototype.toString = function() {
		return "Optional {" + element + "}";
	};
	
	
	ns.ElementUnion = function(elements) {
		this.elements = elements ? elements : [];
	};

	ns.ElementUnion.prototype.getVarsMentioned = function() {
		var result = [];
		for(var i in this.elements) {
			result = _.union(result, this.elements[i].getVarsMentioned());
		}
		return result;
	};

	ns.ElementUnion.prototype.copySubstitute = function(fnNodeMap) {
		var tmp = _.map(this.elements, function(element) { return element.copySubstitute(fnNodeMap); });
		
		return new ns.ElementUnion(tmp);		
	};
	
	ns.ElementUnion.prototype.flatten = function() {
		var tmp = _.map(this.elements, function(element) { return element.flatten(); });
		
		return new ns.ElementUnion(tmp);
	};
	
	ns.ElementUnion.prototype.toString = function() {
		return "{" + this.elements.join("} Union {") + "}";
	};

	
	ns.ElementTriplesBlock = function(triples) {
		this.triples = triples ? triples : [];
	};
	
	ns.ElementTriplesBlock.prototype.getTriples = function() {
		return this.triples;
	};

	ns.ElementTriplesBlock.prototype.addTriples = function(otherTriples) {
		this.triples = this.triples.concat(otherTriples);
	};
	
	ns.ElementTriplesBlock.prototype.uniq = function() {
		this.triples = ns.uniqTriples(this.triples);
		//this.triples = _.uniq(this.triples, false, function(x) { return x.toString(); });
	};
	
	ns.ElementTriplesBlock.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ElementTriplesBlock(this.triples.map(function(x) { return x.copySubstitute(fnNodeMap); }));
	};
	
	ns.ElementTriplesBlock.prototype.getVarsMentioned = function() {
		var result = [];
		for(var i in this.triples) {
			result = _.union(result, this.triples[i].getVarsMentioned());
		}
		return result;
	};

	ns.ElementTriplesBlock.prototype.flatten = function() {
		return this;
	};
	
	ns.ElementTriplesBlock.prototype.toString = function() {
		return this.triples.join(" . ");
	};
	
	ns.ElementGroup = function(elements) {
		this.elements = elements ? elements : [];
	};

	ns.ElementGroup.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ElementGroup(this.elements.map(function(x) { return x.copySubstitute(fnNodeMap); }));
	};
	
	ns.ElementGroup.prototype.getVarsMentioned = function() {
		var result = [];
		for(var i in this.elements) {
			result = _.union(result, this.elements[i].getVarsMentioned());
		}
		return result;
	};

	ns.ElementGroup.prototype.toString = function() {
		//return this.elements.join(" . ");
		return ns.joinElements(" . ", this.elements);
	};
		
	
	ns.ElementGroup.prototype.flatten = function() {
		var processed = _.map(this.elements, function(element) { return element.flatten(); });

		if(processed.length === 1) {
			return processed[0];
		} else {
			return new ns.ElementGroup(ns.flattenElements(processed));
		}
	};
	
	
	
	/**
	 * Bottom up
	 * - Merge ElementTripleBlocks
	 * - Merge ElementGroups
	 */
	ns.flattenElements = function(elements) {
		var result = [];
		
		var triples = [];
		
		var tmps = [];
		_.each(elements, function(item) {
			if(item instanceof ns.ElementGroup) {
				tmps.push.apply(tmps, item.elements);
			} else {
				tmps.push(item);
			}
		});
		
		_.each(tmps, function(item) {
			if(item instanceof ns.ElementTriplesBlock) {
				triples.push.apply(triples, item.getTriples());
			} else {
				result.push(item);
			}
		});		

		if(triples.length > 0) {			
			var ts = ns.uniqTriples(triples);
			
			result.unshift(new ns.ElementTriplesBlock(ts));
		}
		
		//console.log("INPUT ", elements);
		//console.log("OUTPUT ", result);
		
		return result;
	};
	
	ns.joinElements = function(separator, elements) {
		var strs = _.map(elements, function(element) { return "" + element; });
		var filtered = _.filter(strs, function(str){ return str.length != 0; });
		
		return filtered.join(separator);
	};
	
	ns.E_In = function(variable, nodes) {
		//console.log("E_IN", variable);
		
		this.variable = variable;
		this.nodes = nodes;
	};
	
	ns.E_In.prototype.getVarsMentioned = function() {
		return [this.variable];
	};
	
	ns.E_In.prototype.copySubstitute = function(fnNodeMap) {		
		return new ns.E_In(this.variable.copySubstitute(fnNodeMap), this.nodes.map(function(x) { return x.copySubstitute(fnNodeMap); }));
	};
	
	ns.E_In.prototype.toString = function() {
		return "(" + this.variable + " In (" + this.nodes.join(", ") + "))";
	};
	
	
	// Expression
	/*
	ns.E_Str = function(str) {
		this.str = str;
		this.varsMentioned = ns.extractSparqlVars(str); 
	};
	
	ns.E_Str.prototype.copySubstitute = function(fnNodeMap) {
		console.error("Not implemented");
		return this.str;
	};

	ns.E_Str.prototype.getVarsMentioned = function() {
		return this.varsMentioned;
	};
	*/
	ns.E_Cast = function(expr, node) {
		this.expr = expr;
		this.node = node;
	};
	
	ns.E_Cast.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_Cast(this.expr.copySubstitute(fnNodeMap), this.node.copySubstitute(fnNodeMap));		
	};
	
	ns.E_Cast.prototype.getVarsMentioned = function() {
		var result = this.expr.getVarsMentioned();
		
		// Note: Actually a variable is invalid in the node postition 
		if(node.isVar()) {
			result.push(result);
		}
		
		return result;
	};
	
	ns.E_Cast.prototype.toString = function() {
		return this.node + "(" + this.expr + ")";
	};
	
	ns.E_Str = function(subExpr) {
		this.subExpr = subExpr; 
	};
		
	ns.E_Str.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_Str(this.subExpr.copySubstitute(fnNodeMap));
	};

	ns.E_Str.prototype.getVarsMentioned = function() {
		return this.subExpr.getVarsMentioned();
	};
	
	ns.E_Str.prototype.toString = function() {
		return "str(" + this.subExpr + ")";
	};
	
	
	ns.E_Regex = function(expr, pattern, flags) {
		this.expr = expr;
		this.pattern = pattern;
		this.flags = flags;
	};
		
	ns.E_Regex.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_Regex(this.expr.copySubstitute(fnNodeMap), this.pattern, this.flags);
	};
	
	ns.E_Regex.prototype.getVarsMentioned = function() {
		return this.expr.getVarsMentioned();
	};
	
	ns.E_Regex.prototype.toString = function() {
		var patternStr = this.pattern.replace("'", "\\'");
		var flagsStr = this.flags ? ", '" + this.flags.replace("'", "\\'") + "'" : "";

		
		return "Regex(" + this.expr + ", '" + patternStr + "'" + flagsStr + ")"; 
	};

	ns.E_Equals = function(left, right) {
		this.left = left;
		this.right = right;
	};
	
	ns.E_Equals.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_Equals(fnNodeMap(this.left), fnNodeMap(this.right));
	};
	
	ns.E_Equals.prototype.toString = function() {
		return "(" + this.left + " = " + this.right + ")";
	};
	
	ns.E_Equals.prototype.eval = function(binding) {
		// TODO Evaluate the expression
		;
	};

	ns.E_GreaterThan = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_GreaterThan.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_GreaterThan(fnNodeMap(this.left), fnNodeMap(this.right));
	};
	
	ns.E_GreaterThan.prototype.toString = function() {
		return "(" + this.left + " > " + this.right + ")";
	};

	ns.E_LessThan = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_LessThan.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_LessThan(fnNodeMap(this.left), fnNodeMap(this.right));
	};
	
	ns.E_LessThan.prototype.toString = function() {
		return "(" + this.left + " < " + this.right + ")";
	};
	
	ns.E_LogicalAnd = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_LogicalAnd.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_LogicalAnd(fnNodeMap(this.left), fnNodeMap(this.right));
	};
	
	ns.E_LogicalAnd.prototype.toString = function() {
		return "(" + this.left + " && " + this.right + ")";
	};
	
	ns.E_LogicalOr = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_LogicalOr.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_LogicalOr(fnNodeMap(this.left), fnNodeMap(this.right));
	};
	
	ns.E_LogicalOr.prototype.toString = function() {
		return "(" + this.left + " || " + this.right + ")";
	};

	
	/**
	 * If null, '*' will be used
	 * 
	 * @param subExpr
	 * @returns {ns.E_Count}
	 */
	ns.E_Count = function(subExpr) {
		this.subExpr = subExpr;
	};

	ns.E_Count.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_Count(this.subExpr.copySubstitute(fnNodeMap));
	};
	
	ns.E_Count.prototype.toString = function() {		
		return "Count(" + (this.subExpr ? this.subExpr : "*") +")";
	};
	
	ns.E_Distinct = function(subExpr) {
		this.subExpr = subExpr;
	};

	ns.E_Distinct.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_Distinct(this.subExpr.copySubstitute(fnNodeMap));
	};
	
	ns.E_Distinct.prototype.toString = function() {
		return "Distinct(" + this.subExpr +")";
	};

	ns.ExprVar = function(v) {
		this.v = v;
	};
	
	ns.ExprVar.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.ExprVar(this.v.copySubstitute(fnNodeMap));
	};

	
	ns.ExprVar.prototype.toString = function() {
		return "" + this.v;
	};
	
	ns.NodeValue = function(node) {
		this.node = node;
	};
	
	// Jena-style compatibility
	ns.NodeValue.makeNode = function(node) {
		return new ns.NodeValue(node);
	};

	ns.NodeValue.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.NodeValue(this.node.copySubstitute(fnNodeMap));
	};
	
	ns.NodeValue.prototype.toString = function() {
		if(this.node.datatype === xsd.xdouble.value) {
			return parseFloat(this.node.value);
		}
		
		// TODO Numeric values do not need the full rdf term representation
		// e.g. "50"^^xsd:double - this method should output "natural/casual"
		// representations
		return this.node.toString();

		/*
		var node = this.node;
		var type = node.type;
		
		switch(type) {
		case 1: return this.node.toString();
		case 2: return ns.valueFragment(node) + ns.languageFragment(node);
		case 3: return ns.valueFragment(node) + ns.datatypeFragment(node);
		default: {
				console.warn("Should not happen; type = " + node.type);
				break;
		}		
		}
		*/
	};
	
	ns.valueFragment = function(node) {
		return '"' + node.value.toString().replace('"', '\\"') + '"';
	};
	
	ns.languageFragment = function(node) {
		return node.language ? "@" + node.language : "";
	};
	
	ns.datatypeFragment = function(node) {
		return node.datatype ? '^^<' + node.datatype + '>' : "";
	};
	

	
	ns.QueryType = {};
	ns.QueryType.Unknown = -1;
	ns.QueryType.Select = 0;
	ns.QueryType.Construct = 1;
	ns.QueryType.Ask = 2;
	ns.QueryType.Describe = 3;
	
	ns.OrderDir = {};
	ns.OrderDir.Asc = 0;
	ns.OrderDir.Desc = -1;
	
	ns.Order = function(expr, direction) {
		this.expr = expr;
		this.direction = direction ? direction : ns.OrderDir.Asc;
	};
	
	ns.Order.prototype.toString = function() {
		
		var result = "" + this.expr;
		
		if(this.direction == ns.OrderDir.Desc) {
			result = "Desc(" + result + ")";
		}
		
		return result;
	};
	
	
	ns.VarExprList = function() {
		this.vars = [];
		this.varToExpr = {};
	};
	
	ns.VarExprList.prototype.add = function(v, expr) {
		this.vars.push(v);
		
		if(expr) {
			this.varToExpr[v.value] = expr;
		}
	};
	
	ns.VarExprList.prototype.entries = function() {
		var result = [];
		for(var i = 0; i < this.vars.length; ++i) {
			var v = this.vars[i];
			var expr = this.varToExpr[v.value];
			
			result.push({v:v, expr:expr});
		}

		return result;
	};
	
	ns.VarExprList.prototype.copySubstitute = function(fnNodeMap) {
		var result = new ns.VarExprList();
		
		var entries = this.entries();
		for(var i = 0; i < entries.length; ++i) {
			var entry = entries[i];
			var newVar = fnNodeMap(entry.v);
			var newExpr = entry.expr ? entry.expr.copySubstitute(fnNodeMap) : null;
			
			result.add(newVar, newExpr);
		}
		
		return result;
	};
	
	ns.VarExprList.prototype.toString = function() {
		var arr = [];
		var projEntries = this.entries();
		for(var i = 0; i < projEntries.length; ++i) {
			var entry = projEntries[i];
			var v = entry.v;
			var expr = entry.expr;
		
			if(expr) {
				arr.push("(" + expr + " As " + v + ")");
			} else {
				arr.push("" + v);				
			}			
		}
		
		var result = arr.join(" ");
		return result;
	};
	
	ns.Query = function() {
		this.type = 0; // select, construct, ask, describe
		
		this.distinct = false;
		this.reduced = false;
		
		this.isResultStar = false;
		
		this.projectVars = new ns.VarExprList();
		//this.projectVars = []; // The list of variables to appear in the projection
		//this.projectExprs = {}; // A map from variable to an expression
		
		//this.projection = {}; // Map from var to expr; map to null for using the var directly
		
		this.order = []; // A list of expressions
		
		this.elements = [];
		
		this.constructTemplate = null;
		
		this.limit = null;
		this.offset = null;
	};
	
	ns.fnIdentity = function(x) { return x; };
	
	ns.Query.prototype.clone = function() {
		return this.copySubstitute(ns.fnIdentity);
	};
	
	ns.Query.prototype.flatten = function() {
		var result = this.clone();

		var tmp = _.map(result.elements, function(element) { return element.flatten(); });

		var newElements = ns.flattenElements(tmp);
		
		result.elements = newElements;

		return result;
	};
	
	ns.Query.prototype.copySubstitute = function(fnNodeMap) {
		var result = new ns.Query();
		result.type = this.type;
		result.distinct = this.distinct;
		result.reduced = this.reduced;
		result.isResultStar = this.isResultStar;
		result.limit = this.limit;
		result.offset = this.offset;
 
		result.projectVars = this.projectVars.copySubstitute(fnNodeMap);

		//console.log("PROJECTION  " + this.projectVars + " --- " + result.projectVars);

		/*
		for(key in this.projection) {
			var value = this.projection[key]; 

			var k = fnNodeMap(ns.Node.v(key));
			var v = value ? value.copySubstitute(fnNodeMap) : null;
			
			result.projection[k] = v;
		}*/
		
		if(this.constructTemplate) {
			result.constructTemplate = this.constructTemplate.copySubstitute(fnNodeMap);
		}
		
		for(var i = 0; i < this.order.length; ++i) {
			result.order.push(this.order[i].copySubstitute(fnNodeMap));
		}

		result.elements = _.map(this.elements, function(element) { return element.copySubstitute(fnNodeMap); });		

		//console.log("CLONE ORIG " + this);
		//console.log("CLONE RES " + result);
		
		return result;
	};
	
	ns.Query.prototype.toString = function() {
		switch(this.type) {
		case ns.QueryType.Select: return this.toStringSelect();
		case ns.QueryType.Construct: return this.toStringConstruct();
		
		}
	};

		
	ns.Query.prototype.toStringProjection = function() {
		if(this.isResultStar) {
			return "*";
		}

		return "" + this.projectVars;		
	};

	
	ns.Query.prototype.toStringLimitOffset = function() {
		var result = "";
		
		if(this.limit != null) {
			result += " Limit " + this.limit;
		}
		
		if(this.offset != null) {
			result += " Offset " + this.offset;
		}
		
		return result;		
	};
	
	
	ns.Query.prototype.toStringOrderBy = function() {
		if(this.order.length === 0) {
			return "";
		} else {
			return "Order By " + this.order.join(" ") + " ";
		}
	};
	
	ns.Query.prototype.toStringSelect = function() {
		var distinctStr = this.distinct ? "Distinct " : "";
		
		//console.log("Elements: ", this.elements);
		var result = "Select " + distinctStr + this.toStringProjection() + " {" + ns.joinElements(" . ", this.elements) + "} " + this.toStringOrderBy() + this.toStringLimitOffset();
		
		return result;		
	};

	ns.Query.prototype.toStringConstruct = function() {
		var result = "Construct " + this.constructTemplate + " {" + ns.joinElements(" . ", this.elements) + "}" + this.toStringOrderBy() + this.toStringLimitOffset();
		
		return result;
	};
	
	
	
	ns.ResourceProvider = function(variable, fragment, service) {
		this.variable = variable;
		this.fragment = fragment;
		this.service = service;
		this.prefixes = {};
	};


	ns.ResourceProvider.prototype.fetch = function(callback) {
		var queryStr = "Select * {" + this.fragment + "}"; 
		
		this.service.executeSelect(queryStr, callback);
	};

	ns.ResourceProvider.prototype.count = function(callback) {
		ns.count(this.getPreambel(), this.fragment, this.service, callback);
	};


	ns.count = function(preambel, fragment, service, callback) {
		var queryStr = preambel + "Select (Count(*) As ?count) {" + fragment + "}"; 
		
		service.executeSelect(queryStr, {
			failure: function() { callback.failure(); },
			success: function(json) { callback.success(json.results.bindings[0].count.value); }
		});	
	};

	ns.getPreambel = function(prefixes, map) {	
		var result = "";
		for(var i in prefixes) {
			var prefix = prefixes[i];
			
			var resolved = map[prefix];
			if(resolved) {
				result += "Prefix " + prefix + ": <" + resolved + ">\n";
			}
		}
		
		return result;
	};

	ns.ResourceProvider.prototype.getPreambel = function() {
		var ps = ns.extractPrefixes(this.fragment);
		return ns.getPreambel(ps, this.prefixes);
	};

	ns.ResourceProvider.prototype.list = function(callback, limit, offset) {
		
		var limitStr = !limit ? "" : " Limit " + limit;
		var offsetStr = !offset ? "" : " Offset " + offset;
		
		var queryStr = this.getPreambel() + "Select * {" + this.fragment + "}" + limitStr + offsetStr;
		
		this.service.executeSelect(queryStr, callback);
	};

	/**
	 * Check if the count of resources is greater than the given threshold 
	 * 
	 */
	ns.ResourceProvider.prototype.isCountGreater = function(threshold, callback) {
		var subQuery = "{ Select * {" + this.fragment + "} Limit " + (threshold + 1) + " }"; 
		
		
		ns.count(this.getPreambel(), subQuery, this.service, {
			failure: function() { callback.failure(); },
			success: function(count) { callback.success(count > threshold); }
		});
		
		//this.service.executeSelect(queryStr, {success: function(json) { callback.success(json.results.bindings[0].count.value); }});
		
	};

	
	ns.GeoResourceProvider = function(delegate, latVar, longVar, quadTree) {
		this.delegate = delegate;
		
		this.latVar = latVar;
		this.longVar = longVar;
		this.quadTree = quadTree;
		
		this.bounds = null;
	};

	ns.GeoResourceProvider.prototype.setBounds = function(bounds) {
		
	};
	
	ns.fetch = function() {
		
		console.log("Aquiring nodes for " + this.bounds);
		var nodes = this.quadTree.aquireNodes(this.bounds, 2);
		
		
		// We need to know which 'facets/property/paths' the underlying query returns, so that we can index accordingly
		// So fetching data can result in a query plan that yields a result set that first returns data from memory, and then the results of modified queries
		
		// Alternatively, we could geo-index a certain static query. But this means that whenever the facets change we have
		// To re-index everything again.

	};
	
	
	
	ns.ConstraintEquals = function(value) {
		this.value = value;
	};
	
	ns.ConstraintEquals.prototype.isSatisfiedBy = function(value) {
		return this.value.equals(value);
	};
	
	ns.ConstraintEquals.prototype.toString = function(value) {
		return "equals(" + this.value + ")";
	};
	
	
	
	ns.Table = function() {
		
	};
	
	ns.Table.add = function(row) {
		
	};
	
	ns.Table.addIndex = function(index) {
		
	};
	
	
	ns.Table.select = function(colToConstraint) {
	
	};
	
	
	
	ns.test = function() {
		console.log("test");
		
		var q = new ssb.Query();
		
		var ts = new ssb.ElementTriplesBlock();
		var p = ssb.Node.v("p");
		var t = new ssb.Triple(ssb.Node.uri("http://test.org"), p, ssb.Node.v("o"));
		ts.triples.push(t);
		
		q.elements.push(t);
		q.elements.push(new ssb.ElementFilter(new ssb.E_Equals(p, p)));
		

		console.log("Query = " + q);
		
		
	};
	
	/**
	 * Creates a new (compound) expressions from an array
	 * of individual exrpessions.
	 * [a, b, c, d] with ctor set to "E_LogicalAnd" (abbr. And) will become
	 * And(And(a, b), And(c, d))
	 * 
	 */
	ns.opifyBalanced = function(exprs, ctor) {
		//console.warn("Constructor", ctor);

		if(exprs.length == 0) {
			return null;
		}

		var open = exprs;
		
		while(open.length > 1) {
			var next = [];

			for(var i = 0; i < open.length; i+=2) {
				var hasSecond = i + 1 < open.length;
				
				var a = open[i];
				
				if(hasSecond) {
					b = open[i + 1];
					next.push(new ctor(a, b));
				} else {
					next.push(a);
				}
			}
			
			open = next;
		}
		
		return open[0];
	}; 

	ns.opify = ns.opifyBalanced; 
	
})(jQuery);
		
