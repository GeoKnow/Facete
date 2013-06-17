/**
 * Constants for the geovocab (geometry) vocabulary.
 * FIXME Do proper distinction between geometry and spatial vocab
 * 
 * http://geovocab.org/geometry.html
 * 
 */
(function() {
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.vocabs.geovocab");
	
	
	var p = "http://geovocab.org/geometry#";

	ns.geometry = sparql.Node.uri(p + "geometry");	
	ns.Geometry = sparql.Node.uri(p + "Geometry");
})();
