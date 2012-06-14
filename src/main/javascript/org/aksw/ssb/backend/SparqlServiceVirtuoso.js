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

	ns.Paginator = function(query, pageSize) {
		this.query = query;
		this.nextOffset = query.offset ? query.offset : 0;
		this.nextRemaining = (query.limit || query.limit === 0) ? query.limit : null;
		
		this.pageSize = pageSize;
	};
	
	
	// Returns the next limit and offset
	ns.Paginator.prototype.next = function() {
		this.query.offset = this.nextOffset === 0 ? null : this.nextOffset;

		if(this.nextRemaining == null) {
			this.query.limit = this.pageSize;
			this.nextOffset += this.pageSize;
		} else {
			var limit = Math.min(this.pageSize, this.nextRemaining);
			this.nextOffset += limit;
			this.nextRemaining -= limit;
			
			if(limit === 0) {
				return null;
			}
			
			this.query.limit = limit;
		}
		
		return this.query;
	};
	
	ns.SparqlServicePaginator = function(backend, pageSize) {
		this.backend = backend;
		this.pageSize = pageSize ? pageSize : 0;
	};
	
	ns.SparqlServicePaginator.prototype.executeConstructRec = function(paginator, prevResult, deferred) {
		
	};
	
	ns.SparqlServicePaginator.prototype.executeSelectRec = function(paginator, prevResult, deferred) {
		var query = paginator.next();
		if(!query) {
			deferred.resolve(prevResult);
			return;
		}
		
		var self = this;
		$.when(this.backend.executeSelect(query)).then(function(jsonRs) {
			// If result set size equals pageSize, request more data.			
			var result;
			if(!prevResult) {
				result = jsonRs;
			} else {
				prevResult.results.bindings = prevResult.results.bindings.concat(jsonRs.results.bindings);
				result = prevResult;
			}
			
			var resultSetSize = jsonRs.results.bindings.length;
			//console.debug("ResultSetSize, PageSize: ", resultSetSize, self.pageSize);
			if(resultSetSize < self.pageSize) {
				deferred.resolve(result);
			} else {				
				return self.executeSelectRec(paginator, result, deferred);
			}
			
		}, function() { deferred.fail(); });
		// TODO Add fail handler

	};
	
	ns.SparqlServicePaginator.prototype.executeSelect = function(query) {
		var clone = query.clone();
		var paginator = new ns.Paginator(clone, this.pageSize);
		
		var deferred = $.Deferred();
		
		this.executeSelectRec(paginator, null, deferred);
		
		return deferred;
	};
	
	ns.SparqlServicePaginator.prototype.executeConstruct = function(query) {
		
	};
	
	
	
	ns.SparqlServiceVirtuoso = function(serviceUrl, defaultGraphUri) {
		this.serviceUrl = serviceUrl;
		this.defaultGraphUri = defaultGraphUri;
	};
	
	ns.SparqlServiceVirtuoso.prototype.executeAny = function(queryString, callback) {
		if(!queryString) {
			console.error("Empty queryString - should not happen");
		}
		
		var result = ns.executeQuery(this.serviceUrl, this.defaultGraphUri, queryString);
		
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
			
		return result;
	};
		
	ns.SparqlServiceVirtuoso.prototype.executeSelect = function(queryString, callback) {
		return this.executeAny(queryString, callback);
		
	};
	
	ns.SparqlServiceVirtuoso.prototype.executeAsk = function(queryString, callback) {
		return this.executeAny(queryString, callback);
	};
	
	// TODO What to return: RdfJson vs RdfQuery
	ns.SparqlServiceVirtuoso.prototype.executeConstruct = function(queryString, callback) {
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
		//var queryURL=baseURL + '?' + querypart;
		
		//return $.ajax(queryURL, callback);
		//console.log(baseURL, querypart);
		
		return $.post(baseURL, querypart, callback);
	};

})(jQuery);

