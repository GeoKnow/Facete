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

	
	var ns = {};
	
	if($.ssb) {
		//$.ssb = ns;
		ns = $.ssb;
	}
	
	
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
	
	
	ns.Node.prototype.toString = function() {
		switch(this.type) {
		case -1: return "?" + this.value;
		case 0: return "_:" + this.value;
		case 1: return "<" + this.value + ">";
		case 2: return "\"" + this.value + "\"" + (this.language ? "@" + this.language : "");
		case 3: return "\"" + this.value + "\"" + (this.language ? "^^" + this.datatype : "");
		}
	};
	
	
	ns.Node.prototype.isVar = function() {
		return this.type = -1;
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
	
	ns.Triple.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.Triple(fnNodeMap(s), fnNodeMap(p), fnNodeMap(o));
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
		this.triples = triples;
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

	ns.Template.prototype.toString = function() {
		return "{ " + this.bgp + " }";
	};
	
	ns.ElementString = function(value) {
		this.value = value;
	};
	
	ns.ElementString.prototype.toString = function() {
		return this.value;
	};
	
	ns.ElementSubQuery = function(query) {
		this.query = query;
	};
	
	ns.ElementSubQuery.prototype.toString = function() {
		return "{ " + this.query + " }";
	};

	ns.ElementFilter = function(expr) {
		this.expr = expr;
	};

	ns.ElementFilter.prototype.getVarsMentioned = function() {
		return [];
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

	ns.ElementOptional.prototype.toString = function() {
		return "Optional {" + element + "}";
	};
	
	ns.ElementUnion = function(elements) {
		this.elements = elements;
	};

	ns.ElementUnion.prototype.getVarsMentioned = function() {
		var result = [];
		for(var i in this.elements) {
			result = _.union(result, this.elements[i].getVarsMentioned());
		}
		return result;
	};

	ns.ElementUnion.prototype.toString = function() {
		return "{" + this.elements.join("} Union {") + "}";
	};

	
	ns.ElementTriplesBlock = function(triples) {
		this.triples = triples ? triples : [];
	};
	
	ns.ElementTriplesBlock.prototype.getVarsMentioned = function() {
		var result = [];
		for(var i in this.triples) {
			result = _.union(result, this.triples[i].getVarsMentioned());
		}
		return result;
	};

	ns.ElementTriplesBlock.prototype.toString = function() {
		return this.triples.join(" . ");
	};
	
	
	// Expression
	ns.E_Str = function(str) {
		this.str = str;
		this.varsMentioned = ns.extractSparqlVars(str); 
	};
	
	ns.E_Str.prototype.getVarsMentioned = function() {
		return this.varsMentioned;
	};
	
	ns.E_Equals = function(left, right) {
		this.left = left;
		this.right = right;
	};
	
	ns.E_Equals.prototype.toString = function() {
		return "(" + this.left + " = " + this.right + ")";
	};
	
	ns.E_Equals.prototype.eval = function(binding) {
		// TODO Evaluate the expression
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

	ns.E_Count.prototype.toString = function() {		
		return "Count(" + (this.subExpr ? this.subExpr : "*") +")";
	};
	
	ns.E_Distinct = function(subExpr) {
		this.subExpr = subExpr;
	};
	
	ns.E_Distinct.prototype.toString = function() {
		return "Distinct(" + this.subExpr +")";
	};

	ns.ExprVar = function(v) {
		this.v = v;
	};
	
	ns.ExprVar.prototype.toString = function() {
		return "" + this.v;
	};
	
	ns.NodeValue = function(node) {
		this.node = node;
	};
	
	ns.NodeValue.prototype.toString = function() {
		return "" + this.node;
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
	
	
	ns.Query = function() {
		this.type = 0; // select, construct, ask, describe
		
		this.distinct = false;
		this.reduced = false;
		
		this.isResultStar = false;
		
		// TODO: Make this a list
		this.projection = {}; // Map from var to expr; map to null for using the var directly
		
		this.order = []; // A list of expressions
		
		this.elements = [];
		
		this.constructTemplate = null;
		
		this.limit = null;
		this.offset = null;
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

		var arr = [];
		for(var v in this.projection) {
			var expr = this.projection[v];
			
			if(expr) {
				arr.push("(" + expr + " As ?" + v + ")");
			} else {
				arr.push("?" + v);				
			}			
		}
		
		var result = arr.join(" ");
		return result;
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
		var result = "Select " + distinctStr + this.toStringProjection() + " {" + this.elements.join(" . ") + "} " + this.toStringOrderBy() + this.toStringLimitOffset();
		
		return result;		
	};

	ns.Query.prototype.toStringConstruct = function() {
		var result = "Construct " + this.constructTemplate + " {" + this.elements.join(" . ") + "}" + this.toStringOrderBy() + this.toStringLimitOffset();
		
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
		
		//console.log("Aquiring nodes for " + this.bounds);
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
	
	
	
	$.ssb.test = function() {
		//console.log("test");
		
		var q = new ssb.Query();
		
		var ts = new ssb.ElementTriplesBlock();
		var p = ssb.Node.v("p");
		var t = new ssb.Triple(ssb.Node.uri("http://test.org"), p, ssb.Node.v("o"));
		ts.triples.push(t);
		
		q.elements.push(t);
		q.elements.push(new ssb.ElementFilter(new ssb.E_Equals(p, p)));
		

		//console.log("Query = " + q);
		
		
	};
	
})(jQuery);
		
