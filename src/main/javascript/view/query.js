(function($) {


var expr = {

	E_Equals: function(left, right) {
		this.left = left;
		this.right = right;
	},
	
	E_Not: function(subOp) {
		this.subOp = subOp;
	},
	
	E_And: function(left, right) {
		this.left = left;
		this.right = right;
	},
	
	E_Or: function(left, right) {
		this.left = left;
		this.right = right;
	},
	
	// Talis RDF term object { type, value, lang, datatype }
	E_RdfTerm: function(content) {
		this.content = content;
	}

};


function OpFilter(subOp, exprs) {
	this.subOp = subOp;
	this.exprs = exprs;
}

function QuadPattern() {
	this.quads = [];
}

function Quad(g, s, p, o) {
	this.g = g;
	this.s = s;
	this.p = p;
	this.o = o;
}

})(jQuery);