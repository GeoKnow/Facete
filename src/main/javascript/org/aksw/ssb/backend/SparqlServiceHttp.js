/**
 * Sparql endpoint class:
 * Allows execution of sparql queries against a preconfigured service
 * 
 * @param serviceUrl
 * @returns {VirtuosoSparqlService}
 */
(function($) {
			
	var ns = Namespace("org.aksw.ssb.backend");

	/*
	 * SparqlServiceHttp
	 * 
	 */
	ns.SparqlServiceHttp = function(serviceUrl, defaultGraphUris) {
		this.serviceUrl = serviceUrl;
		
		this.setDefaultGraphs(defaultGraphUris);
	};
	
	
	ns.SparqlServiceHttp.prototype.setDefaultGraphs = function(uriStrs) {
		this.defaultGraphUris = uriStrs ? uriStrs : [];
	};
	
	ns.SparqlServiceHttp.prototype.getDefaultGraphs = function() {
		return this.defaultGraphUris;
	};
	
	ns.SparqlServiceHttp.prototype.executeAny = function(queryString, callback) {
		if(!queryString) {
			console.error("Empty queryString - should not happen");
		}
		
		var result = ns.executeQuery(this.serviceUrl, this.defaultGraphUris, queryString);
		
		/* Callback is deprecated cause promise pwns.
		if(callback) {
			result.done(function(data) {
				if(callback.success) {
					callback.success(data);
				} else {
					callback(data);
				}
			});
			
			if(callback.failure) {
				result.error(function() {
					callback.failure();
				});
			}
		}	
		*/		
			
		return result;
	};
	
	
	
	ns.SparqlServiceHttp.prototype.executeSelect = function(queryString, callback) {
		return this.executeAny(queryString, callback);
		
	};
	
	ns.SparqlServiceHttp.prototype.executeAsk = function(queryString, callback) {
		return this.executeAny(queryString, callback);
	};
	
	// TODO What to return: RdfJson vs RdfQuery
	ns.SparqlServiceHttp.prototype.executeConstruct = function(queryString, callback) {
		return this.executeAny(queryString, callback);
	};

	
	/*
	 * SparqlServiceDelay 
	 */

	
	ns.SparqlServiceDelay = function(delegate, delay) {
		this.delegate = delegate;
		this.scheduler = new Scheduler(delay); 
	};
	
	ns.SparqlServiceDelay.prototype.executeSelect = function(queryString, callback) {
		return delegate.executeSelect(queryString, callback);
	};
	
	ns.SparqlServiceDelay.prototype.executeAsk = function(queryString, callback) {
		return delegate.executeAsk(queryString, callback);
	};
	
	
	/**
	 * Adapted from http://www.openlinksw.com/blog/~kidehen/?id=1653
	 * 
	 * @param baseURL
	 * @param query
	 * @param callback
	 * @param format
	 */
	ns.executeQuery = function(baseURL, defaultGraphUris, query, callback, format) {
		if(!format) {
			format="application/json";
		}
		
		/*
		var params={
			"default-graph": "", "should-sponge": "soft", "query": query,
			"debug": "on", "timeout": "", "format": format,
			"save": "display", "fname": ""
		};
		*/
		var params = _.map(defaultGraphUris, function(item) {
			var pair = {key: "default-graph-uri", value: item };
			return pair;
		});
		
		params.push({key: "query", value: query});
		params.push({key: "format", value: format});
	
		
		var querypart="";
		_.each(params, function(param) {
			//querypart+=k+"="+encodeURI(params[k])+"&";
			querypart+=param.key+"="+encodeURIComponent(param.value)+"&";
		});

		return $.post(baseURL, querypart, callback);
	};

})(jQuery);

