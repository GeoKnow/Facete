(function() {

var ns = Namespace("org.aksw.ssb.widgets");
	
(function() {
	
	
	this.ItemViewResource = Backbone.View.extend({
		el: $('body'), // el attaches to existing element
		tagName: 'table',
	    events: {
	    },

	    /**
	     * options:
	     * colNames: [{id: "http://...", name: "age", cellRenderer:}] 
	     * 
	     */
	    initialize: function() {
	    },
	    /*
		renderHtml: function() {
				
				var model = this.model;
				
				
				
			}
		*/
	});
	
	
	/**
	 * 
	 * options:
	 *     - sparqlService
	 *     - concept
	 *     - syncCollection (backboneUtils.BackboneSyncQueryCollection)
	 * 
	 */
	this.ResourceWidgetController = function(options) {

		this.options = options ? options : {};
		
		
		
		var concept = widgets.createConceptPartnerState();
		var element = concept.getElement(); 

		var query = queryUtils.createQuerySelectElement(element, element
				.getVarsMentioned(), {
			limit : 1000
		});
		query.orderBy.push(new sparql.SortCondition(new sparql.ExprVar(
				sparql.Node.v("a"))));

		query.offset = 700;

	};
	
	this.ResourceWidgetController.prototype = {
			showResource: function(node) {
		
				// Fetch generic data for the resource
				
				
				
				
				// Fetch domain specific data for the resource using queries
			}
		
	};

	
}).apply(ns);
	

})();
