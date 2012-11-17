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
	
	/**
	 * Currently hard wired configuration of the facets for the financial transparency system
	 * 
	 */
	function createFacetConfigFts(sparqlService) {
		//testBounds();
		
		
		var concept = config.concept;
		var pathManager = null;

		console.log("Config is", config);

		
		var fallbackDriver = null;
		
		var concept = config.concept ? config.concept : fallbackDriver;
		var geoPath = config.geoPath ? config.geoPath : new facets.Path();
		var navigationPath = config.navigationPath ? config.navigationPath : new facets.Path();

		
		if(config.query || config.variable) {
			// The query string is assumed to be a SELECT query. Surround with {} to
			// turn it into a SPARQL element.
			var queryString = "{ " + config.query + " }";
			
			var vName = config.variable;
			var v = sparql.Node.v(vName);
			

			//var query = new sparql.Query();
			//query.elements.push(new sparql.ElementString(queryString, [v]));
			//query.projectVars.add(v);
			
			var conceptElement = new sparql.ElementString(queryString, [v]);
			concept = new facets.ConceptInt(conceptElement, v);
			pathManager = new facets.PathManager(vName); 
			
			
			navigationPath = new facets.Path();
			geoPath = new facets.Path();
		}
		
		/*
		else {
			var s = sparql.Node.v("s");
			var a = sparql.Node.uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");				
			var node = sparql.Node.uri("http://linkedgeodata.org/ontology/Node");
			
			// LGD-TEST
			//var subvention = sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/Subvention");
			//var subvention = sparql.Node.uri("http://diadem.cs.ox.ac.uk/ontologies/real-estate#House");
			var subvention = sparql.Node.uri("http://linkedgeodata.org/ontology/Node");
			
			//var conceptElement = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, node)]);
			var conceptElement = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, subvention)]);
			
			concept = new facets.ConceptInt(conceptElement, s);
			pathManager = new facets.PathManager("s");
		}
		*/
		
		
		
		
		//var baseStr = "http://fintrans.publicdata.eu/ec/ontology/beneficiary http://fintrans.publicdata.eu/ec/ontology/city http://www.w3.org/2002/07/owl#sameAs";	

		
		// TODO I think the system should work if the concept is left on null
		// Alternatively, the concept must be set to the triples of the geoPath
		//var fallbackDriver = createFallbackDriver(); // null
		
		
		
		
		// LGD-TEST
		//var baseStr = "";
		
		//var geoPath = facets.Path.fromString(baseStr);
		//var navigationPath = facets.Path.fromString("");
		
		
		//var pathStrX = baseStr + " " + geo.long.value;
		//var pathStrY = baseStr + " " + geo.lat.value;
	
		
		//var labelBc = new facets.Breadcrumb.fromString(pathManager, rdfs.label.value);
		//var typeBc = new facets.Breadcrumb.fromString(pathManager, rdf.type.value);
		
		
		//var breadcrumb = new facets.Path.fromString(pathManager, baseStr);
		//var breadcrumbX = new facets.Breadcrumb.fromString(pathManager, pathStrX);
		//var breadcrumbY = new facets.Breadcrumb.fromString(pathManager, pathStrY);
		
		
		//var navigationPath = new facets.Path.fromString(pathManager, ""); 

		
		//var e = breadcrumb.getTriples();
		//console.log("Breadcrumb:", breadcrumb);
		//console.log("XXXXX:", e.toString());
	
		
		//var constraint = new facets.ConstraintEquals(geoPath, new sparql.NodeValue.makeNode(sparql.Node.uri("http://test.org")));
		
		//console.log("Constraint:", constraint.getExpr());
		
		var factory = new facets.ConstraintWgs84.Factory(geoPath);//breadcrumbX, breadcrumbY);
		
		//var factory = new facets.ConstraintOgcFactory(facets.Path.fromString("http://geovocab.org/geometry#geometry"));
		
		
		var bounds = new qt.Bounds(0, 1, 2, 4);
		var c2 = factory.create(bounds);
		//console.log("C2:", c2.getExpr().toString());
		//console.log("C2:", c2.getElement().toString());
	
	
		//var sparqlService = new backend.SparqlServiceVirtuoso("http://localhost/sparql", ["http://fintrans.publicdata.eu/ec/"]);
	
		var facetbox = Namespace("org.aksw.ssb.widgets.facetbox");

		
		/*
		var config = new facetbox.FacetConfig(concept, 1001, 10001);
		var state = new facetbox.FacetState(config, pathManager);
		
		var constraints = new facets.ConstraintCollection();
		
		facetbox.createFacetBox(sparqlService, state, constraints);
		*/
		var constraints = new facets.ConstraintCollection();
	
		var options = {
				queryGenerator: {
					concept: concept,
					//conceptVar: s,
					navigationPath: navigationPath,
					pathManager: pathManager,
					geoConstraintFactory: factory,
					constraints: constraints
				}, 
				config: config
			};
		
		//var queryGenerator = new app.QueryGenerator(options);
		
		var appController = new app.AppController(options);
		return appController;
	}
	
	
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
		var appController = createFacetConfigFts(sparqlService);
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

