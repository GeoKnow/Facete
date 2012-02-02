/**
 * Sparql endpoint class:
 * Allows execution of sparql queries against a preconfigured service
 * 
 * @param serviceUrl
 * @returns {VirtuosoSparqlService}
 */
function VirtuosoSparqlService(serviceUrl, defaultGraphUri)
{
	this.serviceUrl = serviceUrl;
	this.defaultGraphUri = defaultGraphUri;

	this.executeAny = function(queryString, callback) {
		if(!queryString) {
			console.error("Empty queryString - should not happen");
		}
		
		var result = executeQuery(this.serviceUrl, this.defaultGraphUri, queryString, 
				{
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
	
	this.executeSelect = function(queryString, callback) {
		return this.executeAny(queryString, callback);
		
	};
	
	this.executeAsk = function(queryString, callback) {
		return this.executeAny(queryString, callback);
	};
}


function DelaySparqlService(delegate, delay) {
	this.delegate = delegate;
	this.scheduler = new Scheduler(delay); 
}

DelaySparqlService.prototype = {
		executeSelect: function(queryString, callback) {
			return delegate.executeSelect(queryString, callback);
		},

		executeAsk: function(queryString, callback) {
			return delegate.executeAsk(queryString, callback);
		}
};


/**
 * Adapted from http://www.openlinksw.com/blog/~kidehen/?id=1653
 * 
 * @param baseURL
 * @param query
 * @param callback
 * @param format
 */
function executeQuery(baseURL, defaultGraphUri, query, callback, format) {
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
}
