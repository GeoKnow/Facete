/**
 * A graph which keeps track of how often a triple has been inserted.
 * The motivation for this class is to construct a graph from
 * cache fragments. If a cache fragment is dropped, the triples are
 * not removed if they are still referenced.
 * 
 * NOTE Assumes that triple strings are normalized.
 * 
 */
(function($) {
	
	var ns = Namespace("org.aksw.ssb.collections");

	
	ns.MultiGraph = function() {
		this.tripleToCount = {};
		this.databank = $.rdf.databank();
	};
	
	/**
	 * Recommended: use $.rdf.triple objects
	 * Strings could break things if they are not normalized
	 * 
	 * @param triple
	 */
	ns.MultiGraph.prototype.addTriple = function(triple) {
		var str = triple.toString();
		if(ns.inc(this.tripleToCount, str) === 1) {		
			this.databank.add(triple);
		}
	};
	
	ns.MultiGraph.prototype.removeTriple = function(triple) {
		var str = triple.toString();

		if(ns.dec(this.tripleToCount, str) === 0) {
			this.databank.remove(triple);
		}
	};

	ns.MultiGraph.prototype.addDatabank = function(databank) {
		var triples = this.databank.triples();
		
		for(var i = 0; i < triples.length; ++i) {
			this.addTriple(triples[i]);
		}
	};

	ns.MultiGraph.prototype.removeDatabank = function(databank) {
		var triples = this.databank.triples();
		
		for(var i = 0; i < triples.length; ++i) {
			this.removeTriple(triples[i]);
		}
	};
		
})(jQuery);