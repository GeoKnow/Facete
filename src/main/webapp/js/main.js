/**
 * Entry point.
 * 
 * Set up of the (SPARQL) backend, and initialization of the
 * browsing component.
 * 
 */
(function() {

	/*
	 * Retrieve the config object. Configurable via config.js and the URL. 
	 */
	var config = Namespace("org.aksw.ssb.config");
	
	

	var facets = Namespace("org.aksw.ssb.facets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	var rdf = Namespace("org.aksw.ssb.vocabs.rdf");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	
	var qt = Namespace("org.aksw.ssb.collections.QuadTree");

	var app = Namespace("org.aksw.ssb.app.controllers");
	var backend = Namespace("org.aksw.ssb.backend"); 
	
	var facebox = Namespace("org.aksw.ssb.widgets.facetbox");

	
	var ns = Namespace("org.aksw.ssb.main");
	
	
			
			
	
	ns.AutoConfig = function(callback) {
		this.callback = callback;
		//this.
	};
	
	
	ns.AutoConfig.prototype.configureService = function(sparqlService) {
		var self = this;
		var result = {};
			
		var exec = sparqlService.executeAsk("Prefix geo:<http://www.w3.org/2003/01/geo/wgs84_pos#> Ask { ?s geo:long ?x; geo:lat ?y . }");
		
		$.when(exec).then(function(jsonRdf) {
			result.wgsPoint = jsonRdf.value; // boolean
			self.checkReady(result, sparqlService);
		}).fail(function() {
			
			alert("Error communicating with backend. Probably the configured SPARQL endpoint is down?");
			
			result.wgsPoint = false;
			self.checkReady(result, null);
		});
		
	};
	
	// As soon as all capabilities have been collected, invoke the callback
	ns.AutoConfig.prototype.checkReady = function(result, sparqlService) {
		if(typeof(result.wgsPoint) !== undefined) {
			this.callback(sparqlService, result);
			//$(this).trigger(ready, result);
		}
	};	
	
	
	/**
	 * TODO Move to some unit test suite
	 * 
	 */
	function testBounds() {
		var a = new qt.Bounds(-100, 100, -50, 50);
		var b = new qt.Bounds(-10, 10, -5, 5);
		
		alert(a.isOverlap(b));
		alert(b.isOverlap(a));
	};
		
	
	ns.init = function(sparqlService, caps) {
		// Destroy the old resources
		
		//console.log(caps);
		/*
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
		*/
		
		
		var prefixToService = {
				//'http://dbpedia.org/': new DelaySparqlService(new VirtuosoSparqlService("src/main/php/sparql-proxy-dbpedia.php", ["http://dbpedia.org"]))
		};
	
		
		//var ssb = new controllers.AppController();

		var appConfig = createAppConfig(); 
		var appController = new app.AppController(appConfig);

		appController.setSparqlService(sparqlService);
		//appController.setQueryFactory(queryFactory);
		
		appController.addFactSources(prefixToService);
		
		
		
		appController.init();
		//appController.setBackend(backend);
		//ssb.setFacetConfig(facetConfig);
		
		console.log("Initialization in progress");
				
		
		if(config.state) {
			//alert("State: " + JSON.stringify(ssbconf.state));
			appController.loadState(config.state);
		}
		
		appController.repaint();

	};
	
	
	$(document).ready(function() {

/*
		var ns = Namespace("org.aksw.ssb.facets.QueryUtils");
		
		var v = sparql.Node.v("class");
		var c = sparql.Node.v("c");
		var x = sparql.Node.v("x");
		var element = ns.createElementGetClasses(v);
		var concept = new facets.ConceptInt(element, v);

		//var query = ns.createQueryCountDistinct(element, null, v, c, [x]);
		var f = sparql.Node.v("f");
		var fc = sparql.Node.v("fc");
		var query = ns.createQueryFacetCount(concept, f, fc, false, 10);
		//alert("" + query);
*/	
		
		
		
		/*
		var x = $.when().pipe(function() { return 1; });
		var y = $.when().pipe(function() { return 2; });
		$.when(x, y).then(function() {
			console.log(arguments, arguments.length);
		});
		*/
		
		
		var sparqlService = new backend.SparqlServiceHttp(config.sparqlServiceUri, config.defaultGraphUris, config.sparqlProxyServiceUri, config.sparqlProxyParamName);
		
		
		var autoConfigurator = new ns.AutoConfig(ns.init);
		autoConfigurator.configureService(sparqlService);
	});
	
})();

