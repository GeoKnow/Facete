(function() {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	
	var ns = Namespace("org.aksw.ssb.utils.talis-json");

	/**
	 * Returns an object containing all URIs of the given talisJson argument. 
	 * 
	 * @param talisJson
	 * @returns
	 */
	
	/**
	 * 
	 * 
	 */
	ns.talisJsonForEach = function(talisJson, callback) {
		for(s in talisJson) {
			var ps = talisJson[s];

			// TODO Handle blank nodes here
			var subject = sparql.Node.uri(s);

			
			for(p in ps) {
				var predicate = sparql.Node.uri(p);
				var os = ps[p];
				
				
				for(var i = 0; i < os.length; ++i) {
					var o = os[i];

					var object = sparql.Node.fromJson(o);

					callback(subject, predicate, object);
				}
			}
		}
	};

	/**
	 * TODO Maybe use a dedicated Graph object rather than an array?
	 * 
	 */
	ns.toTriples = function(talisJson) {
		
		var result = [];

		ns.talisJsonForEach(talisJson, function(s, p, o) {
			var triple = new sparql.Triple(s, p, o);
			result.push(triple);
		});

		return result;
	};
	
})();