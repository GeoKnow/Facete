/**
 * Entry point.
 * 
 * Set up of the (SPARQL) backend, and initialization of the
 * browsing component.
 * 
 */
function AutoConfig(callback) {
	this.callback = callback;
}

// Select Count(*) { { Select Distinct ?s { ?s geo:long ?x ; geo:lat ?y . Filter(?x > -5 && ?x < 100 && ?y > -5 && ?y < 100) . } Limit 1000 } }

AutoConfig.prototype = {
		ready: "ready",
		
		configureService: function(sparqlService) {
			var self = this;
			var result = {};
			
			sparqlService.executeAsk("Ask { ?s geo:long ?x; geo:lat ?y . }", {
				failure: function() {
					result.wgsPoint = false;
					self.checkReady(result, callback);
				},
				success: function(jsonRdf) {
					result.wgsPoint = jsonRdf.boolean;
					self.checkReady(result, sparqlService);
				} 
			});
			
		},

		// As soon as all capabilities have been collected, invoke the callback
		checkReady: function(result, sparqlService) {
			if(typeof(result.wgsPoint) !== undefined) {
				this.callback(sparqlService, result);
				//$(this).trigger(ready, result);
			}
		}
};


function init(sparqlService, caps) {
	// Destroy the old resources
	
	//console.log(caps);
	
	var queryFactory = null;
	var backend = null;
	
	if(caps.wgsPoint) {
		 queryFactory = new QueryFactoryWgs84();
		 backend = new BackendWgs84(sparqlService, queryFactory);		 
		 //backend = new DelayBackend(backend);
		 
	}
	
	if(!backend || !queryFactory) {
	
		alert("No geographic data found");
		
		return;
	}
	
	
	var prefixToService = {
			//'http://dbpedia.org/': new DelaySparqlService(new VirtuosoSparqlService("src/main/php/sparql-proxy-dbpedia.php", ["http://dbpedia.org"]))
	};

	
	var ssb = new SpatialSemanticBrowsing();
	ssb.setBackend(backend);
	ssb.setSparqlService(sparqlService);
	ssb.setQueryFactory(queryFactory);
	
	ssb.addFactSources(prefixToService);
	
	ssb.init();
	console.log("Initialization in progress");
}


$(document).ready(function() {
	var sparqlService = new VirtuosoSparqlService(ssbconf.endpoint, ssbconf.models);
	
	var config = new AutoConfig(init);
	config.configureService(sparqlService);
});























