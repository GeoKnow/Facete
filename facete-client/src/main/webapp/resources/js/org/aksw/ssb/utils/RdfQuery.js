(function() {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var ns = Namespace("org.aksw.ssb.utils.rdfquery");
	
	ns.rdfQueryFromTalisJson = function(talisJson) {
		var triples = [];
		
		for(s in talisJson) {
			var ps = talisJson[s];
			
			for(p in ps) {
				var os = ps[p];
				
				for(var i = 0; i < os.length; ++i) {
					var o = os[i];
					
					var node = sparql.Node.fromTalisJson(o);
					
					//var t = "<" + s.toString() + "> " + "<" + p.toString() + "> " + node.toString() + "";
					//var t = "<" + s.toString() + "> " + "<" + p.toString() + "> <" + s.toString() + "> .";
					
					//console.log(t);
					//var triple = $.rdf.triple(t);
					//console.log(triple);
					//var triple = $.rdf.triple("<" + s.toString() + ">", "<" + p.toString() + ">", "<" + s.toString() + ">");

					var triple = $.rdf.triple("<" + s.toString() + ">", "<" + p.toString() + ">", node.toString());
					triples.push(triple);
				}
			}
		}

		var result = $.rdf.databank(triples);
		
		return result;
	};

})();