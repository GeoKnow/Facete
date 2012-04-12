/**
 * Constants for the geovocab (geometry) vocabulary.
 * FIXME Do proper distinction between geometry and spatial vocab
 * 
 * http://geovocab.org/geometry.html
 * 
 */
(function() {
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.vocabs.xsd");
	
	
	var p = "http://www.w3.org/2001/XMLSchema#";

	ns.xdouble = sparql.Node.uri(p + "double");	
})();
