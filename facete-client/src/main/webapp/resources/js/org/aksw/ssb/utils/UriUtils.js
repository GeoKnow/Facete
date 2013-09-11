(function() {

	var strings = Namespace("org.aksw.ssb.utils.strings");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.utils.uris");

	ns.getUrlBase = function(url) {
		if(!url) {
			url = location.href;
		} 
		
		var startQs = url.indexOf('?');
		var startHash = url.indexOf('#');
		
		var baseEnd;
		if(startQs > 0) {
			baseEnd = startQs;
		}
		else if(startHash > 0) {
			baseEnd = startHash;
		}
		else {
			baseEnd -1;
		}
		
		var result = baseEnd > 0 ? url.substr(0, baseEnd) : url;

		return result;
	};
	
	ns.getUrlHashFragment = function(url) {
		if(!url) {
			url = location.href;
		} 
		
		// cut off any hash string
		var hashString = "";
		var hashStringStart = url.indexOf("#");

		var result = null;
		if(hashStringStart >= 0) {
			result = url.substring(hashStringStart + 1);
		}
		
		return result;
	};

	
	ns.parseUrlQueryString = function(urlQueryString) {
		if(!urlQueryString) {
			urlQueryString = location.search;
		}
		
		var start = urlQueryString.indexOf('?');
		var end = urlQueryString.indexOf('#');
	
		if(start >= 0) {
			++start;
		}

		
		var str = end < 0 ? urlQueryString.substr(start) : urlQueryString.substr(start, end);
		
	    var result = {};
	    var entries = str.split('&');

	    for(var i = 0; i < entries.length; ++i) {
	    	var entry = entries[i];

	    	var kv = entry.split('=');
	    	var k = kv[0];
	    	var v = kv[1];
	    	
	    	var arr = result[k];
	    	if(!arr) {
	    		result[k] = arr = [];
	    	}

	    	arr.push(v);
	    }

	    return result;
	}
	
	ns.extractLabelFromUri = function(str) {
		var a = str.lastIndexOf("#");
		var b = str.lastIndexOf("/");
		
		var i = Math.max(a, b);
		
		var result = str.substring(i + 1);
		return result;
	}


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
		var result = ns.transformJsonRs(jsonRs, function(plainNode) {
			var node = !plainNode ? null : sparql.Node.fromTalisJson(plainNode);
			
			return node;
		});
		
		return result;
	};
	
	/**
	 * (No longer In-Place) transformation of the bindings of a json result set
	 * 
	 * Note: In-Place causes severe problems, because results sets might
	 * originate from a cache, which gets corrupted when modified.
	 * 
	 */
	ns.transformJsonRs = function(tmpJsonRs, nodeTransformer) {

		var jsonRs = _.clone(tmpJsonRs);
		
		jsonRs.results = {
			bindings: []	
		};
		
		//jsonRs.results = _.clone(jsonRs.results);
		//jsonRs.results.bindings = _.clone(jsonRs.results.bindings);
		
		
		//console.log("transformJsonRs: jsonRs: ", jsonRs);
		
		var bindings = tmpJsonRs.results.bindings;		
		var newBindings = jsonRs.results.bindings;
		
		for(var i = 0; i < bindings.length; ++i) {
		
			var binding = bindings[i];
			var newBinding = {};
			
			$.each(binding, function(varName, node) {
				var newData = nodeTransformer(node);
				
				newBinding[varName] = newData;
			});

			//bindings[i] = newBinding;
			newBindings.push(newBinding);
		}
		
		return jsonRs;
	};
	
	/*
	ns.iterateNodesRs = function(jsonRs, iterator) {
		
	}
	*/
	
	ns.extractNodesFromJsonRs = function(jsonRs) {

		//console.log("extractNodesFromJsonRs: jsonRs: ", jsonRs);

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
	
	/**
	 * 
	 * 
	 * Can deal with parsed and non-parsed json result sets
	 * 
	 * @returns An array of strings for the URIs in the jsonRs
	 */
	ns.extractUrisFromParsedJsonRs = function(jsonRs) {
		var nodes = ns.extractNodesFromJsonRs(jsonRs);
		
		var uriStrs = _(nodes)
			.chain()
			.map(function(node) {

				//if(node.type === "uri" || (node instanceof sparql.Node && node.isUri())) {
				if(node.isUri()) {
					return node.value;
				}
				
				return;
			})
			.reject(function(node) {
				return node === undefined;
			})
			.value();
		
		//console.log("UriStrs", uriStrs);
		
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