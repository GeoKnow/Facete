(function($) {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var qt = Namespace("org.aksw.ssb.collections.QuadTree");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	
	var ns = Namespace("org.aksw.ssb.utils");

	
	ns.GeomPointFetcher = function(queryCacheFactory) {
		this.geomVar = sparql.Node.v("g");
		this.lonVar = sparql.Node.v("x");
		this.latVar = sparql.Node.v("y");
		this.geomPointQuery = queryUtils.createQueryGeomLonLat(this.geomVar, this.lonVar, this.latVar);
		
		this.cache = queryCacheFactory.create(this.geomPointQuery);
	};
	
	ns.GeomPointFetcher.prototype.fetch = function(uris) {
		var self = this;
		
		return this.cache.lookup(this.geomVar, uris).pipe(function(jsonRs) {
			var result = {};
			
			var bindings = jsonRs.results.bindings;
			
			//_.each(geomToBinding, function(binding, str) {
			for(var i = 0; i < bindings.length; ++i) {
				
				var binding = bindings[i];
				
				var geomNode = binding[self.geomVar.value];
				var geomUri = geomNode.value;
				
				//var geomUri = sparql.Node.parse(str).value;
				//var geomUri = sparl.Node.parse(geom)
				
				//var keyNode = sparql.Node.parse(key);
				//var uri = keyNode.value;				
				var xStr = binding[self.lonVar.value].value;
				var yStr = binding[self.latVar.value].value;
				
				var x = parseFloat(xStr);
				var y = parseFloat(yStr);
								
				result[geomUri] = new qt.Point(x, y);
			}
			
			//console.debug("geomToBinding", result);
			
			return result;
		});
	};
	
})();