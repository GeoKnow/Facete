(function() {
	
	var ns = Namespace("org.aksw.ssb.utils");

	ns.QueryCache = function(sparqlService, query) {
		this.sparqlService = sparqlService;
		this.query = query;
		
		// TODO Only select queries supported
		
		this.cache = varToNodeToData = {};
	};

	// Note: variable must be part of the projection
	ns.QueryCache.prototype.lookup = function(v, nodes, retain) {
		var filter = new sparql.E_In(v, nodes);

		var nodeToData = varToNodeToData[v.value];
		if(!nodeToData) {
			varToNodeToData[v.value] = nodeToData = {};
		}
		
		
		var fetchList = [];
		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			
			var keyStr = key.toString(); 
			if(keyStr in nodeToData) {
				continue;
			}
			
			fetchList.push(node);
		}
		
		fetchList = _.uniq(fetchList, function(node) { return node.toString(); });		

		var result;
		
		if(_.isEmpty(fetchList)) {
			result = $.when();
		} else {
			var copy = this.query.copySubstitute(function(x) { return x; });
			copy.elements.push(filter);

			result = this.sparqlService.executeAny(copy.toString()).pipe(function(jsonResultSet) {
				var bindings = jsonResultSet.result.bindings;
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					
					
					var indexNode = bindings[v.value];
					var keyStr = indexNode.toString();
					
					nodeToData[keyStr] = binding;				
				}
			});
		}
		
		result.pipe(function() {
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
