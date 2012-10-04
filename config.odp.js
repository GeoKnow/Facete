/**
 * This file contains basic configuration for the spatial semantic browser SemMap.
 * 
 *
 * TODO: We need to be able to deal with mulitiple configs at once; even multiple configs per graph!
 */
(function() {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");
	
	var config = Namespace("org.aksw.ssb.config");
	
	
	
	config.sparqlServiceUri = "http://localhost/sparql";
	
	
	
	// If a proxy service is set, then the sparqlServiceUri is resolved against it.
	// Otherwise, the sparqlServiceUri is interpreted as the service URL 
	config.sparqlProxyServiceUri = "lib/SparqlProxyPHP/current/sparql-proxy.php";
	config.sparqlProxyParamName = "service-uri";
	
	
	
	/*
	 * These settings are for the FP7 project partners dataset
	 */
	var s = sparql.Node.v("s");
	var a = sparql.Node.uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
	//var node = sparql.Node.uri("http://xxx.org/ontology/Project");
	
	// LGD-TEST
	var subvention = sparql.Node.uri("http://fp7-pp.publicdata.eu/ontology/Project");
	//var subvention = sparql.Node.uri("http://usefulinc.com/ns/doap#Project");
	//var subvention = sparql.Node.uri("http://diadem.cs.ox.ac.uk/ontologies/real-estate#House");
	//var subvention = sparql.Node.uri("http://linkedgeodata.org/ontology/Node");
	
	//var driverElement = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, node)]);
	var driverElement = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, subvention)]);
	
	var driver = new facets.Driver(driverElement, s);
	var pathManager = new facets.PathManager("s");

	
	//var geoPathStr = "http://fintrans.publicdata.eu/ec/ontology/beneficiary http://fintrans.publicdata.eu/ec/ontology/city http://www.w3.org/2002/07/owl#sameAs";
	var geoPathStr = "http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/city http://www.w3.org/2002/07/owl#sameAs";
	

	//var driver = null;
	//var geoPathStr = "";

	config.driver = driver; 
	config.navigationPath = null;
	config.geoPath = facets.Path.fromString(geoPathStr);
	config.pathManager = pathManager;

	
	
	
	//config.
	
	
	// TODO Not used yet
	config.namespaces = {
		'http://linkedgeodata.org/ontology/': 'lgdo',
		'http://linkedgeodata.org/property/': 'lgdp',
		'http://dbpedia.org/': 'dbpedia',
		'http://xmlns.com/foaf/0.1/' : 'foaf',
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#' : 'rdf',
		'http://www.w3.org/2000/01/rdf-schema#' : 'rdfs',
		'http://www.w3.org/2002/07/owl#' : 'owl',
		'http://www.w3.org/2001/XMLSchema#' : 'xsd',
		'http://www.w3.org/2003/01/geo/wgs84_pos#' : 'geo'
	};

	config.markerUrlDefault = "src/main/resources/images/org/openclipart/people/mightyman/map-marker-blue.svg";
	config.markerUrlSelected = "src/main/resources/images/org/openclipart/people/mightyman/map-marker-orange.svg";

	
	config.rdfauthorTestJson = {"http:\/\/rdfauthor.test\/":{"http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type":[{"type":"uri","value":"http:\/\/www.w3.org\/2002\/07\/owl#Ontology"}]},"http:\/\/rdfauthor.test\/Class\/rdfauthor":{"http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type":[{"type":"uri","value":"http:\/\/www.w3.org\/2002\/07\/owl#Class"}],"http:\/\/www.w3.org\/2000\/01\/rdf-schema#label":[{"type":"literal","value":"rdfauthor"}]},"http:\/\/rdfauthor.test\/rdfauthor\/geoproperty":{"http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type":[{"type":"uri","value":"http:\/\/rdfauthor.test\/Class\/rdfauthor"}],"http:\/\/www.w3.org\/2000\/01\/rdf-schema#label":[{"type":"literal","value":"geo-property"}],"http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#lat":[{"type":"literal","value":"51.3974","datatype":"http:\/\/www.w3.org\/2001\/XMLSchema#float"}],"http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#long":[{"type":"literal","value":"12.399","datatype":"http:\/\/www.w3.org\/2001\/XMLSchema#float"}]},"http:\/\/rdfauthor.test\/rdfauthor\/widgets":{"http:\/\/foo.bar\/treeselector":[{"type":"uri","value":"http:\/\/rdfauthor.test\/Class\/rdfauthor"}],"http:\/\/ns.ontowiki.net\/SysOnt\/Site\/content":[{"type":"literal","value":"Markdown Widget","datatype":"http:\/\/ns.ontowiki.net\/SysOnt\/Markdown"}],"http:\/\/vocab.org\/bio\/0.1\/date":[{"type":"literal","value":"1989-03-16","datatype":"http:\/\/www.w3.org\/2001\/XMLSchema#date"}],"http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type":[{"type":"uri","value":"http:\/\/rdfauthor.test\/Class\/rdfauthor"}],"http:\/\/www.w3.org\/2000\/01\/rdf-schema#comment":[{"type":"literal","value":"sysont:HTML runs HTML widget","datatype":"http:\/\/ns.ontowiki.net\/SysOnt\/HTML"}],"http:\/\/www.w3.org\/2000\/01\/rdf-schema#label":[{"type":"literal","value":"widgets"}],"http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#lat":[{"type":"literal","value":"51.3974","datatype":"http:\/\/www.w3.org\/2001\/XMLSchema#float"}],"http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#long":[{"type":"literal","value":"12.399","datatype":"http:\/\/www.w3.org\/2001\/XMLSchema#float"}],"http:\/\/www.w3.org\/2004\/02\/skos\/core#note":[{"type":"literal","value":"rdf:XMLLiteral runs XMLLiteral Widget","datatype":"http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#XMLLiteral"}],"http:\/\/xmlns.com\/foaf\/0.1\/depiction":[{"type":"uri","value":"http:\/\/lh3.ggpht.com\/-RtYRlNbylys\/Tlu3aZyOK8I\/AAAAAAAAAqw\/TLorU709r5U\/files.jpg"}],"http:\/\/xmlns.com\/foaf\/0.1\/mbox":[{"type":"uri","value":"mailto:foo.bar@bar.com"}],"http:\/\/xmlns.com\/foaf\/0.1\/phone":[{"type":"uri","value":"tel:+49341123456"}]}};
	
	config.quadTree = {
			maxTileItemCount: 50,
			maxGlobalItemCount: 200
	};

	
	// Maximum geoms to accept for global lookup

	//config.sparqlServiceUrl = "http://localhost/lgd/sparql";
	//config.sparqlServiceUrl = "http://localhost/llod/all/sparql";
	
	//config.sparqlServiceUrl = "http://localhost/oxford/sparql";
	//config.defaultGraphUris = ["http://diadem.cs.ox.ac.uk"];
	
	// TODO A
	//config.driver = new facets.Driver();
	
	/*
	 * Below are setting for the OpenDataPortal.
	 * If settings are not configured, the features will be disabled even if the files are included.
	 * 
	 */
	
	//config.odp = {};
	
	//config.odp.apiUrl = "http://localhost/open-data/api/";
	
})();
