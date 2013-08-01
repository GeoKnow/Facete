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
	ns.DerefHttpDirect = function(serviceUrl) {
		this.serviceUrl = serviceUrl;
	};
	
	ns.DerefHttpDirect.prototype.deref = function(args) {
		var parts = _.map(args, function(value, key) {
			return key + "=" + encodeURIComponent(value);
		});
		
		var queryPart = parts.join("&");
		
		return $.post(this.serviceUrl, queryPart);		
	};
	
	
	ns.SparqlServiceBase = function() {
	};
	
	ns.SparqlServiceBase.prototype.executeAny = prototype(query) {
		this.service.deref(query);
	};
	
	ns.SparqlServiceBase.prototype.executeSelect = function(query) {
		return this.executeAny(query);
	};
	
	ns.SparqlServiceBase.prototype.executeAsk = function(query) {
		return this.executeAny(query);
	};
	
	// TODO What to return: RdfJson vs RdfQuery
	ns.SparqlServiceBase.prototype.executeConstruct = function(query) {
		return this.executeAny(query);
	};
	
	
	ns.SparqlServiceBase.prototype.executeDescribe = function(query) {
		return this.executeAny(query);
	};


		
	
	ns.SparqlServiceHttpProxy = function(proxyServiceUrl, remoteServiceUrl, defaultGrapUris) {
		this.proxyServiceUrl = proxyServiceUrl;
		this.remoteServiceUrl = remoteServiceUrl;
		this.defaultGraphUris = defaultGraphUris;
	};
	*/
	
	
	
	/**
	 * SparqlServiceHttp
	 * 
	 * @param extraArgs: A set of additional arguments to pass via the query string
	 */
	ns.SparqlServiceHttp = function(serviceUri, defaultGraphUris, proxyServiceUri, proxyParamName) {
		this.serviceUri = serviceUri;
		
		this.proxyServiceUri = proxyServiceUri;
		this.proxyParamName = proxyParamName ? proxyParamName : "service-uri"; 
		
		this.setDefaultGraphs(defaultGraphUris);
		
		//this.extraArgs = extraArgs; 
	};
	
	ns.SparqlServiceHttp.prototype = {
		getStateHash: function() {
			var idState = {
					serviceUri: this.serviceUri,
					defaultGraphUris: this.defaultGraphUris
			}
			
			var result = JSON.stringify(idState);
			
			return result;
		}
			
	};
	
	ns.SparqlServiceHttp.prototype.setDefaultGraphs = function(uriStrs) {
		this.defaultGraphUris = uriStrs ? uriStrs : [];
	};
	
	ns.SparqlServiceHttp.prototype.getDefaultGraphs = function() {
		return this.defaultGraphUris;
	};
	
	ns.SparqlServiceHttp.prototype.executeAny = function(query, ajaxOptions) {
		
		//console.log("Preparing SPARQL query: " + query);
		
		// TODO Make this a switch
		if(true) {
			if(query.flatten) {
				var before = query;
				query = before.flatten();
				
				//console.log("FLATTEN BEFORE: " + before, before);
				//console.log("FLATTEN AFTER:"  + query, query);
			}
		}
		
		
		// Force the query into a string
		var queryString = "" + query;
		
		if(!queryString) {
			console.error("Empty queryString - should not happen");
		}

		var httpOptions = {};
		var serviceUri = this.serviceUri;
		
		if(this.proxyServiceUri) {
			httpOptions[this.proxyParamName] = serviceUri;
			serviceUri = this.proxyServiceUri;
		}
		
		
		var result = ns.executeQuery(serviceUri, this.defaultGraphUris, queryString, httpOptions, ajaxOptions);
			
		return result;
	};
	
	
	
	ns.SparqlServiceHttp.prototype.executeSelect = function(query, ajaxOptions) {
		return this.executeAny(query, ajaxOptions);
	};
	
	ns.SparqlServiceHttp.prototype.executeAsk = function(query, ajaxOptions) {
		return this.executeAny(query, ajaxOptions).pipe(function(json) { return json['boolean']; });
	};
	
	// TODO What to return: RdfJson vs RdfQuery
	ns.SparqlServiceHttp.prototype.executeConstruct = function(query, ajaxOptions) {
		return this.executeAny(query, ajaxOptions);
	};
	
	
	ns.SparqlServiceHttp.prototype.executeDescribe = function(query, ajaxOptions) {
		return this.executeAny(query, ajaxOptions);
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
	ns.executeQuery = function(baseURL, defaultGraphUris, query, options, ajaxOptions) {
		if(!options) {
			options = {};
		}
		
		if(!options.format) {
			// FIXME Should not modify options object
			options.format="application/json";
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
		//params.push({key: "format", value: format});
	
		_.each(options, function(v, k) {
			params.push({key: k, value: v});
		});
		
		var querypart="";
		_.each(params, function(param) {
			//querypart+=k+"="+encodeURI(params[k])+"&";
			querypart+=param.key+"="+encodeURIComponent(param.value)+"&";
		});

		var url = baseURL + "?" + querypart;
		//alert("url: " + url);
		

		var ajaxObj = {
			url: url,
			dataType: 'json'
		};

		if(ajaxOptions) {
			_.extend(ajaxObj, ajaxOptions);
		}
		
		//return $.post(baseURL, querypart);
		var result = $.ajax(ajaxObj);
			
		return result;
	};

})(jQuery);

