/**
 * SPRAQL Algebra classes.
 * 
 * Neither finished nor used - yet.
 * 
 */
(function($) {

	var ns = Namespace("org.aksw.ssb.sparql.algebra");

	ns.Quad = function(g, s, p, o) {
		this.g = g;
		this.s = s;
		this.p = p;
		this.o = o;
	};
	
	ns.OpQuadPattern = function() {
		this.quads = [];
	};
	
	ns.OpFilter = function(subOp, exprs) {
		this.subOp = subOp;
		this.exprs = [];
	};
	
	ns.OpLeftJoin = function(left, right) {
		this.left = left;
		this.right = right;
	};
	
	ns.OpUnion = function(members) {
		this.members = members;
	};
	
	ns.OpJoin = function(left, right) {
		this.left = left;
		this.right = right;
	};


})(jQuery);