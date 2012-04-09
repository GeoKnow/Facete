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
	 * SparqlServiceVirtuoso 
	 */

	
	ns.SparqlServiceVirtuoso = function(serviceUrl, defaultGraphUri) {
		this.serviceUrl = serviceUrl;
		this.defaultGraphUri = defaultGraphUri;
	};
	
	ns.SparqlServiceVirtuoso.prototype.executeAny = function(queryString, callback) {
		if(!queryString) {
			console.error("Empty queryString - should not happen");
		}
		
		var result = ns.executeQuery(this.serviceUrl, this.defaultGraphUri, queryString, {
				failure: function() {
					if(callback) {
						callback.failure();
					}
				},
				success: function(json) {
					//console.log(json);
					//var json = $.parseJSON(jsonStr);
					if(callback) {
						callback.success(json);
					}
				}
			});
			
		return result;
	};
		
	ns.SparqlServiceVirtuoso.prototype.executeSelect = function(queryString, callback) {
		return this.executeAny(queryString, callback);
		
	};
	
	ns.SparqlServiceVirtuoso.prototype.executeAsk = function(queryString, callback) {
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
	ns.executeQuery = function(baseURL, defaultGraphUri, query, callback, format) {
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
		var params={
				"default-graph-uri": defaultGraphUri, "query": query,
				"format": format,
		};
	
		
		var querypart="";
		for(var k in params) {
			//querypart+=k+"="+encodeURI(params[k])+"&";
			querypart+=k+"="+encodeURIComponent(params[k])+"&";
		}
		var queryURL=baseURL + '?' + querypart;
		
		return $.ajax(queryURL, callback);	
	};

})(jQuery);

