(function() {

	var strings = Namespace("org.aksw.ssb.utils.strings");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.utils.uris");


	// Very hacky check to avoid literals as URIs
	ns.isValidUri = function(str) {
		//return !str.contains('+');
		return strings.startsWith(str, "http://");
	};
	
	
	ns.filterUrisValidate = function(uris) {
		var result = [];
		
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
			
			if(ns.isValidUri(uri)) {
				result.push(uri);
			}
		}
		
		return result;
	};

	
	/**
	 * In-place convertion of plain Json nodes to sparql.Syntax.Node objects.
	 * 
	 */
	ns.parseJsonRs = function(jsonRs) {
		ns.transformJsonRs(jsonRs, function(plainNode) {
			var node = !plainNode ? null : sparql.Node.fromJson(plainNode);
			
			return node;
		});
		
		return jsonRs;
	};
	
	/**
	 * In-Place transformation of the bindings of a json result set
	 */
	ns.transformJsonRs = function(jsonRs, nodeTransformer) {

		console.log("transformJsonRs: jsonRs: ", jsonRs);
		
		var bindings = jsonRs.results.bindings;
			
		for(var i = 0; i < bindings.length; ++i) {
		
			var binding = bindings[i];
			var newBinding = {};
			
			$.each(binding, function(varName, node) {
				var newData = nodeTransformer(node);
				
				newBinding[varName] = newData;
			});

			bindings[i] = newBinding;			
		}
		
		return jsonRs;
	};
	
	/*
	ns.iterateNodesRs = function(jsonRs, iterator) {
		
	}
	*/
	
	ns.extractNodesFromJsonRs = function(jsonRs) {

		console.log("extractNodesFromJsonRs: jsonRs: ", jsonRs);

		var result = [];
		var bindings = jsonRs.results.bindings;
		
		var tmpUris = {};
		for(var i = 0; i < bindings.length; ++i) {

			var binding = bindings[i];
			
			$.each(binding, function(varName, node) {
				result.push(node);
			});
		}
		
		return result;
	};
	
	ns.extractUrisFromJsonRs = function(jsonRs) {
		var nodes = ns.extractNodesFromJsonRs(jsonRs);
		
		var uriStrs = _(nodes)
			.chain()
			.map(function(node) {
				//if(node.type === "uri") {
				if(node.isUri()) {
					return node.value;
				}
				
				return;
			})
			.reject(function(node) {
				return node === undefined;
			})
			.value();
		
		console.log("UriStrs", uriStrs);
		
		var result = _.uniq(uriStrs);
		
		return result;
	};
	
	/*
	ns.extractUrisFromJsonRs = function(jsonRs) {

		console.log("extractUrisFromJsonRs: jsonRs: ", jsonRs);

		
		var bindings = jsonRs.results.bindings;
		
		var tmpUris = {};
		for(var i = 0; i < bindings.length; ++i) {

			var binding = bindings[i];
			
			(function(i) {
				$.each(binding, function(varName, node) {
					if(node && node.isUri()) {
						var uriStr = node.getValue();
						
						tmpUris[uriStr] = true;
					}
				});
			})(i);
			
		}
		
		var uris = _.keys(tmpUris);
		
		return uris;
	};
	*/

	
})();