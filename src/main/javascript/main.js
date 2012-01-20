/**
 * Entry point.
 * 
 * Set up of the (SPARQL) backend, and initialization of the
 * browsing component.
 * 
 */
$(document).ready(function() {

	var sparqlService = new VirtuosoSparqlService("src/main/php/sparql-proxy-lgd.php", ["http://linkedgeodata.org"]);
	
	
	var queryFactory = new LinkedGeoDataQueryFactory();
	
	var backend = new DelayBackend(new VirtuosoBackend(sparqlService, queryFactory));


	//this.sparqlServiceDBpedia = new VirtuosoSparqlService("src/main/php/sparql-proxy-dbpedia.php", ["http://dbpedia.org"]);
	//this.backendDBpedia = new DelayBackend(new VirtuosoBackend(this.sparqlServiceDBpedia, queryFactory)); 

	
	// TODO Allow configuration of multiple sparql endpoint services per map layer
	// Layer description -> list of sparql endpoints
	var ssb = new SpatialSemanticBrowsing();
	ssb.setBackend(backend);
	ssb.setSparqlService(sparqlService);
	
	ssb.init();
});























