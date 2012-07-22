(function() {
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var ns = Namespace("org.aksw.ssb.vocabs.rdfs");
	
	ns.label = sparql.Node.uri("http://www.w3.org/2000/01/rdf-schema#label");
	ns.subClassOf = sparql.Node.uri("http://www.w3.org/2000/01/rdf-schema#subClassOf");

})();	
