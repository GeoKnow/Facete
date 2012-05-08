(function() {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.utils");

	ns.QueryCacheFactory = function(sparqlService) {
		this.sparqlService = sparqlService;
		this.queryToCache = {};
	};
	
	ns.QueryCacheFactory.prototype.create = function(query) {
		var queryStr = query.toString();
		var result = this.queryToCache[queryStr];
		
		if(!result) {
			result = new ns.QueryCache(this.sparqlService, query);
			this.queryToCache[queryStr] = result;
			
		}

		return result;
	};

	
	
	ns.QueryCache = function(sparqlService, query) {
		this.sparqlService = sparqlService;
		this.query = query;
		
		// TODO Only SELECT queries supported
		
		this.cache = varToNodeToData = {};
	};
		
	// Note: variable must be part of the projection
	ns.QueryCache.prototype.lookup = function(v, nodes, retain) {
		var filterExpr = new sparql.E_In(v, nodes);
		var filterElement = new sparql.ElementFilter(filterExpr);
		
		var nodeToData = varToNodeToData[v.value];
		if(!nodeToData) {
			varToNodeToData[v.value] = nodeToData = {};
		}
		
		
		var fetchList = [];
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			
			var keyStr = node.toString(); 
			if(keyStr in nodeToData) {
				continue;
			}
			
			fetchList.push(node);
		}
		
		fetchList = _.uniq(fetchList, function(node) { return node.toString(); });		

		var promise;
		
		if(_.isEmpty(fetchList)) {			
			promise = $.when();
		} else {
			var copy = this.query.copySubstitute(function(x) { return x; });
			copy.elements.push(filterElement);

			promise = this.sparqlService.executeAny(copy.toString()).pipe(function(jsonResultSet) {

				var bindings = jsonResultSet.results.bindings;
				
				//console.debug("Bindings", bindings);
				
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					
					
					var jsonNode = binding[v.value];
					var indexNode = sparql.Node.fromJson(jsonNode);
					var keyStr = indexNode.toString();
					
					nodeToData[keyStr] = binding;
				}
			});
		}

		var result = promise.pipe(function() {
			var data = {};
			for(var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				
				var keyStr = node.toString(); 
				if(keyStr in nodeToData) {
					var cached = nodeToData[keyStr];
					if(cached === null && !retain) {
						continue;
					} 
					
					data[keyStr] = nodeToData[keyStr];
				} else {
					data[keyStr] = null;
				}
			}
			
			return data;
		});
		
		return result;	
	};
	
})();
