/**
 * Application specific vocabulary for internal use.
 * 
 */
(function() {
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var ns = Namespace("org.aksw.ssb.vocabs.appvocab");
	
	
	var p = "http://aksw.org/ssb/";

	ns.featureCount = sparql.Node.uri(p + "featureCount");	
})();
