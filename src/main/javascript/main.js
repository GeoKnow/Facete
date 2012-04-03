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



function SelectionBox(collection, itemRenderer) {
	this.collection = collection;
}


/**
 * Method: draw
 * 
 * Returns:
 * {DOMElement}
 */
SelectionBox.prototype.draw = function() {
	var div = document.createElement("div");
	div.innerHTML = "<form><select><option value='a'>Test</select></form>"; 
	return div.firstChild;
};

SelectionBox.prototype.update = function() {
	// Reload data from the model
//	for(model)
};


/**
 * Currently hard wired configuration of the facets for the financial transparency system
 * 
 */
function createFacetConfigFts() {

	var facets = Namespace("org.aksw.ssb.facets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	
	console.log("Facets namespace is", facets);
	console.log("Syntax namespace is", sparql);

	var s = sparql.Node.v("s");
	var a = sparql.Node.uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");		
	var subvention = sparql.Node.uri("http://fintrans.publicdata.eu/ec/ontology/Subvention");
	
	var driver = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, subvention)]);
	
	var pathManager = new facets.PathManager("s");

	/**
	 * facetConfig = new RangeFacet("property or maybe even path");
	 * var field = facetConfig.addField(new Range(0, 100))
	 * 
	 *
	 *
	 * facetManager.addFacetConfig(facetConfig)
	 * 
	 * facetManager.enable(field)
	 * 
	 * Select * {
	 *   {
	 *     Select (<facetField1> As ?p), (Count(?s) As ?c) {
	 *         ?s a Subvention .
	 *         ?s amount ?v . Filter(?v1 >= 0 && ?v1 < 100) .
	 *     }
	 *   } 
	 * Union {
	 * ...
	 *     ?s amount ?v2 . Filter(?a >= 100 && ?a < 200) .
	 *     ...
	 * }
	 * }
	 */
	
	var breadcrumb = new facets.Breadcrumb.fromString(pathManager, "http://fintrans.publicdata.eu/ec/ontology/beneficiary http://fintrans.publicdata.eu/ec/ontology/city http://www.w3.org/2002/07/owl#sameAs");
	
	var e = breadcrumb.toTriples();
	console.log("Breadcrumb:", breadcrumb);
	console.log("XXXXX:", e.toString());
	
	
	var constraint = new facets.ConstraintEquals(breadcrumb, new sparql.NodeValue.makeNode(sparql.Node.uri("http://test.org")));
	
	console.log("Constraint:", constraint.toExpr());
	
	//var geoFacet = new facets.FacetWgsPm(pathManager, "http://fintrans.publicdata.eu/ec/ontology/beneficiary http://fintrans.publicdata.eu/ec/ontology/city http://www.w3.org/2002/07/owl#sameAs");
	
	//var typeConfig = {driver: driver, geoFacet: geoFacet};
	
	//var element = geoFacet.getElement();
	//var filter = geoFacet.createFilter(new Bounds(0, 1, 2, 4));
	
	//var valueFacet = new facets.FacetValuePm(pathManager, "http://amount");
	//valueFacet.createFilter()

	
	// Now what I need is a way to represent constraints
	
	// Possible solution: "pathStr" to facettype={geoFacet, valueFacet,histogramFacet}
	// 
	
	
	//console.log("Element", element);
	//console.log("Filter", filter);

	var config = "";
	return config;
}


/**
 * Creates a query for incoming/outgoing properies
 * 
 * Select ?in ?out {
 *   {
 *       element
 *   }
 *   
 *   { ?s ?out ?o1 }
 *   Union
 *   { ?o2 ?in ?s }
 * }
 * 
 * @param variable
 * @param element
 * @param direction -1: incoming, 1: outgoing, 0: both (default)
 */
function createFacetQuery(variable, element, direction) {
	
}


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
	ssb.setSparqlService(sparqlService);
	ssb.setQueryFactory(queryFactory);
	
	ssb.addFactSources(prefixToService);
	
	var facetConfig = createFacetConfigFts();
	
	ssb.init();
	ssb.setBackend(backend);
	//ssb.setFacetConfig(facetConfig);
	
	console.log("Initialization in progress");
}


$(document).ready(function() {
	var sparqlService = new VirtuosoSparqlService(ssbconf.endpoint, ssbconf.models);
	
	
	var config = new AutoConfig(init);
	config.configureService(sparqlService);
});



// TODO Remove this test function
$(document).ready(function() {

	var facets = Namespace("org.aksw.ssb.facets");
	
	facets.test();
	return;
	
	
	
	//listModel.add(new Item({title: "Subvention x", comment: "Yada yada"}));
	//listModel.add(new Item());
	
	
	//var x = new Item();
	//listModel.add(x);
	
	//x.destroy();
	

	
	/*
	listView.addItem("test");
	listView.addItem("test2");
	*/
	
	
	//var vars = myns.extractSparqlVars();
	//console.log(vars);
	var sparqlService = new VirtuosoSparqlService(ssbconf.endpoint, ssbconf.models);

	rp = new $.ssb.ResourceProvider("s", "?s geo:lat ?lat ; geo:long ?long .", sparqlService);
	
	//rp.fetch(function(arg) { console.log(arg); });
	rp.count({ success: function(arg) { console.log("count", arg); } });
	rp.isCountGreater(1000, { success: function(arg) { console.log("threshold exceeded? ", arg); } });
	
	rp.list({ success: function(arg) {}}, 10, 20);
	

	/**
	 * For a project, fetch all cities and their positions which are related to a beneficiary.
	 */
	projectRp = new $.ssb.ResourceProvider("p",
		    "?p prop:hasBeneficiary ?b . ?b addr:city ?c . ?c owl:sameAs ?x . ?x geo:long ?long . ?x geo:lat ?lat.", sparqlService
	);

	projectRp.prefixes["foaf"] = "http://xmlns.com/foaf/0.1/";
	projectRp.prefixes["class"] = "http://publicdata.eu/eu-transparency/classes/";
	projectRp.prefixes["prop"] = "http://publicdata.eu/eu-transparency/properties/";
	projectRp.prefixes["addr"] = "http://publicdata.eu/eu-transparency/properties/address/";
	
	//projectRp.list({ success: function(arg) {}}, 10, 20);
	projectRp.count({ success: function(arg) { console.log("Count", arg); }});
	
	/**
	 * For a city, fetch all related projects
	 */
	var cityToProject = "?x owl:sameAs ?c . ?b addr:city ?c . ?p prop:hasBeneficiary ?b .";
	
	$.ssb.test();
	/**
	 * Here is an idea how the basic navigation could work:
	 * var r = new ResourceProvider();
	 * model = new MarkerModel(r); // Note: Here the model is a collection - need to get my terminology clear in regard to Backbone and general MVC
	 * map.setMarkerModel(model, {id: "x", x: "long", y: "lat" });
	 * 
	 * r.fetch(); // Causes the model to send update events
	 * 
	 * 
	 * Now, let's see: If the first resource provider focuses on markers, but now we have another one that focuses on
	 * e.g. projects, then for the now resource provider we need to know how to obtain information for markers.
	 * 
	 * So essentially, we need some sub-path/query from the rp to the markers, and bind the appropriate variables to the marker model
	 * 
	 * 
	 * 
	 * 
	 */
});


