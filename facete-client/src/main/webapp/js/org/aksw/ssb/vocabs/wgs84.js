(function() {
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.vocabs.wgs84");
	
	// Note: named it lon as jslint complains about using long as a keyword
	ns.lon = sparql.Node.uri("http://www.w3.org/2003/01/geo/wgs84_pos#long");
	ns.lat = sparql.Node.uri("http://www.w3.org/2003/01/geo/wgs84_pos#lat");
	
})();