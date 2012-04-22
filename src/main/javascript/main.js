/**
 * Entry point.
 * 
 * Set up of the (SPARQL) backend, and initialization of the
 * browsing component.
 * 
 */
(function() {

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
	
	
	/**
	 * Add an .endsWith method to the prototype of String.
	 * 
	 * http://stackoverflow.com/questions/280634/endswith-in-javascript
	 * 
	 */
	if (!String.prototype.hasOwnProperty("endsWith")) {
	    String.prototype.endsWith = function (suffix) {
	        return this.indexOf(suffix, this.length - suffix.length) !== -1;
	    };
	}
			
			
	
	ns.AutoConfig = function(callback) {
		this.callback = callback;
		//this.
	};
	
	
	ns.AutoConfig.prototype.configureService = function(sparqlService) {
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
	}
	
	/**
	 * Currently hard wired configuration of the facets for the financial transparency system
	 * 
	 */
	function createFacetConfigFts(sparqlService) {
		//testBounds();
		
		var s = sparql.Node.v("s");
		var a = sparql.Node.uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");		
		var subvention = sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/Subvention");
		
		var driverElement = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, subvention)]);
		
		var driver = new facets.Driver(driverElement, s);
		
		var pathManager = new facets.PathManager("s");
	
		
		var baseStr = "http://fintrans.publicdata.eu/ec/ontology/beneficiary http://fintrans.publicdata.eu/ec/ontology/city http://www.w3.org/2002/07/owl#sameAs";	
		var pathStrX = baseStr + " " + geo.long.value;
		var pathStrY = baseStr + " " + geo.lat.value;
	
		
		var labelBc = new facets.Breadcrumb.fromString(pathManager, rdfs.label.value);
		var typeBc = new facets.Breadcrumb.fromString(pathManager, rdf.type.value);
		
		var breadcrumb = new facets.Breadcrumb.fromString(pathManager, baseStr);
		var breadcrumbX = new facets.Breadcrumb.fromString(pathManager, pathStrX);
		var breadcrumbY = new facets.Breadcrumb.fromString(pathManager, pathStrY);
		
		
		var e = breadcrumb.getTriples();
		//console.log("Breadcrumb:", breadcrumb);
		//console.log("XXXXX:", e.toString());
	
		
		var constraint = new facets.ConstraintEquals(breadcrumb, new sparql.NodeValue.makeNode(sparql.Node.uri("http://test.org")));
		
		//console.log("Constraint:", constraint.getExpr());
		
		var factory = new facets.ConstraintWgs84.Factory(breadcrumb);//breadcrumbX, breadcrumbY);
		
		var bounds = new qt.Bounds(0, 1, 2, 4);
		var c2 = factory.create(bounds);
		//console.log("C2:", c2.getExpr().toString());
		//console.log("C2:", c2.getElement().toString());
	
	
		//var sparqlService = new backend.SparqlServiceVirtuoso("http://localhost/sparql", ["http://fintrans.publicdata.eu/ec/"]);
	
		var facetbox = Namespace("org.aksw.ssb.widgets.facetbox");

		/*
		var config = new facetbox.FacetConfig(driver, 1001, 10001);
		var state = new facetbox.FacetState(config, pathManager);
		
		var constraints = new facets.ConstraintCollection();
		
		facetbox.createFacetBox(sparqlService, state, constraints);
		*/
		var constraints = new facets.ConstraintCollection();
	
		var options = {
				queryGenerator: {
					driver: driver,
					//driverVar: s,
					pathManager: pathManager,
					geoConstraintFactory: factory,
					constraints: constraints
				}
			};
		
		//var queryGenerator = new app.QueryGenerator(options);
		
		var appController = new app.AppController(options);
		return appController;
	}
	
	
	ns.init = function(sparqlService, caps) {
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
	
		
		//var ssb = new controllers.AppController();
		var appController = createFacetConfigFts(sparqlService);
		appController.setSparqlService(sparqlService);
		appController.setQueryFactory(queryFactory);
		
		appController.addFactSources(prefixToService);
		
		
		
		appController.init();
		//appController.setBackend(backend);
		//ssb.setFacetConfig(facetConfig);
		
		console.log("Initialization in progress");
		
		appController.repaint();
	};
	
	
	$(document).ready(function() {
	
		var sparqlService = new backend.SparqlServiceVirtuoso(ssbconf.endpoint, ssbconf.models);
		
		
		var config = new ns.AutoConfig(ns.init);
		config.configureService(sparqlService);
	});
	
})();

