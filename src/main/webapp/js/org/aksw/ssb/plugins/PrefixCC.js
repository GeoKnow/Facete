(function($) {
	
	ns = Namespace("org.aksw.ssb.plugins.PrefixCC");

	/*
	ns.QName = function(localName, prefix, namespace) {
		this.name = name;
		this.prefix = prefix;
		//this.namespace =
	};*/
	
	
	ns.NamespaceResolverPrefixCC = function() {
		this.serviceUri = "http://prefix.cc/";
		
		this.reverseLookupServiceUri = this.serviceUri + "reverse"; 
		
		this.namespaceToPrefix = {};
	};
	
	
	/**
	 * Fills the caches by downloading all data (a few thousand mappings) from prefix cc
	 */
	ns.NamespaceResolverPrefixCC.prototype.cacheAll = function() {
		console.warn("Not implemented yet");
	};
	
	
	ns.NamespaceResolverPrefixCC.prototype.reverseLookup = function(uriStr) {
		
		var hashIndex = uriStr.lastIndexOf("#");
		var slashIndex = uriStr.lastIndexOf("/");
		
		var endIndex = Math.max(hashIndex, slashIndex);
		
		var namespace = (endIndex >= 0) ? uriStr.substr(0, endIndex) : uriStr;

		
		var prefix = this.namespaceToPrefix[namespace];
		if(prefix) {
			var result = $.Deferred();
			
			result.resolve({uri: uriStr, prefix: prefix, namespace: namespace});
			
			return result;
		}
		
		
		var task = this.reverseLookupUncached(uriStr);
		
		var candidateTask = task.pipe(function(prefixes) {
			
			var bestCandidate = null;
			
			_.each(prefixes, function(namespace, prefix) {
				var candidate = {uri: uriStr, prefix: prefix, namespace: namespace};
				
				if(!bestCandidate) {
					bestCandidate = candidate;
				} else {
					if(candidate.namespace.length > bestCandidate.namespace.length) {
						bestCandidate = candidate;
					}
				}
				
				return bestCandidate;
			});
		});
		
		
		var self = this;
		var result = $(candidateTask).pipe(function(candidate) {
			
			self.namespaceToPrefix[candidate.namespace] = candidate.prefix; 
			return candidate;
		});

		
		return result;
	};
	

	/**
	 * Given a URI, return the namespace
	 * 
	 */
	ns.NamespaceResolverPrefixCC.prototype.reverseLookupUncached = function(uriStr) {
		
		var result = $.ajax({
			url: this.reverseLookupServiceUri,
			dataType: "json",
			data: {
				uri: uri
			}
		});
		
		return result;
	};
	
})(jQuery);
