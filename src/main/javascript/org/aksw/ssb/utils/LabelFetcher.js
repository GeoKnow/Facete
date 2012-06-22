(function($) {

	var collections = Namespace("org.aksw.ssb.collections");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var qt = Namespace("org.aksw.ssb.collections.QuadTree");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	
	var ns = Namespace("org.aksw.ssb.utils");
	
	
	ns.LabelFetcher = function(sparqlService, langs, fetchAllLangs, cache) {
		this.langs = langs ? langs : ['en', ''];
		this.fetchAllLangs = fetchAllLangs ? fetchAllLangs : true;
		this.sparqlService = sparqlService;
		
		this.cache = cache ? cache : ns.LabelFetcher.defaultCache;		
	};
	
	// A cache instance that is shared among label fetcher instances
	// NOTE Data based on different LabelFetcher
	// configurations will go into the same cache.
	ns.LabelFetcher.defaultCache = new collections.LabelCollection();

	
	/**
	 * 
	 * 
	 * @param uris An array of uri-strings
	 * @param includeAllUris
	 */
	ns.LabelFetcher.prototype.cacheLookup = function(uris, includeAllUris) {
		var entries = {};
		var lookups = [];
		
		for(var i in uris) {
			var uri = uris[i];
			
			if(uri in this.cache.uriToLangToLabel) {
				
				var langToLabel = this.cache.uriToLangToLabel[uri];
				
				var label = null;
				for(var j in this.langs) {
					var lang = this.langs[j];
					
					if(lang in langToLabel) {				
						label = langToLabel[lang];
						
						entries[uri] = {value: label, lang: lang};
						break;
					}
				}
				
				if(!this.fetchAllLangs && label == null) {
					lookups.push(label);
				}
	
			} else {
				lookups.push(uri);
			}
		}
		
		return {entries: entries, notFound: lookups};
	};
	
	// TODO uris = String[]. Maybe this should be sparql.Node[]
	ns.LabelFetcher.prototype.fetch = function(uris, includeAllUris, callback) {
	
		//var uriStrs = _.map(uris, function(uri) { return uri.value; });
		
		var lookupResult = this.cacheLookup(uris, includeAllUris);
		var result = lookupResult.entries;	
		var lookups = lookupResult.notFound;
	
		lookups = filterUrisValidate(lookups);
	
		if(lookups.length == 0) {
			if(callback) {				
				callback(result);
			}
			defer = $.Deferred();
			defer.resolve(result);
			//defer.promise();
			return defer.promise();
		}
		
		//console.debug("Fetching labels for (<" + uris.join('> , <') + ">)");
	
		var filterStr = "";	
		if(!this.fetchAllLangs) {
		
			var ors = [];
			for(var i in this.langs) {
				var lang = this.langs[i];
				
				ors.push("langMatches(lang(?l), '" + lang + "')");
			}
			
			if(ors.length != 0) {	
				filterStr = "Filter(" + ors.join(" || ") + ") . ";
			}
		}
		
		
		var self = this;
		
		var queryString = "Select ?u ?l { ?u rdfs:label ?l . " + filterStr + "Filter(?u In (<" + lookups.join(">,<") + ">)) . }";
	
		//var self = this;
		//alert(queryString);
		var deferred = this.sparqlService.executeSelect(queryString).pipe(function(rs) {	
			// Add the results to the cache
			for(var i in rs.results.bindings) {
				var binding = rs.results.bindings[i];
				
				var uri = binding.u.value;
				var labelNode = binding.l;
				
				// possible BUG Shouldn't xml:lang be lang for valid Talis Json?
				var lang = labelNode["xml:lang"];
				if(!lang) {
					lang = "";
				}
				
				//console.debug("Got label", uri, lang, labelNode.value);
				
				self.cache.put(uri, lang, labelNode.value);
			}
			
			var lr = self.cacheLookup(lookups, includeAllUris);
			var map = lr.entries;
			console.log("LabelCache", self.cache);
			//mergeMapsInPlace(result, map);
			_.extend(result, map);
			
			if(callback) {
				callback(result);
			}
			
			return {uris: uris, uriToLabel: result};
		});	
	
		return deferred.promise();
	};
	
	
	
	
	/**
	 * @Deprecated
	 * A static function that fetches labels of the given set of uris.
	 * 
	 */
	ns.fetchLabels = function(uris, languages, callback) {		
		uris = filterUrisValidate(uris);
		
		if(uris.length == 0) {
			return;
		}
		
		console.log("Fetching labels for (<" + uris.join('> , <') + ">)");

		
		var queryString = "Select ?u ?l { ?u rdfs:label ?l . Filter(langMatches(lang(?l), '" + language + "')) . Filter(?u In (<" + uris.join(">,<") + ">)) . }";

		//var self = this;
		//alert(queryString);
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {
				
				var map = jsonRdfResultSetToMap($.parseJSON(response), "u", "l");

				callback(map);				
			}	
		});	
	}

})(jQuery);
