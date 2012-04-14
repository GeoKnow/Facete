/**
 * A widget for displaying/browsing a set of resources.
 * 
 * 
 * 
 */
(function($) {

	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	
	var ns = Namespace("org.aksw.ssb.widgets"); 
	
	ns.DescriberSparql = function(sparqlService) {
		this.sparqlService = sparqlService;
	};
	
	ns.DescriberSparql.prototype.describe = function(nodes, callback) {
		return queryUtils.createDescribeQuery(nodes, callback);
	};
	

	ns.createResourceWidget = function(sparqlService, nodes) {
		if(!nodes) {
			nodes = [];
		}
		
		var describer = new ns.DescriberSparql(sparqlService);
		
		// Properties which should be displayed by default
		var shortSummaryProperties = [];		
		
		var result = $$(
				{describer: describer, nodes: nodes},
				'<div><form action=""><input type="text"/><input type="button" value="Search"/></form><ul></ul></div>',
				{
					create: function() {
						var describer = this.model.get('describer');
						var nodes = this.model.get('nodes');
						
						describer.describe(nodes, function() {
							alert("Describe callback called");
						});
					},
				
					refresh: function() {
					}
				});
				
		return result;
	};
	
	ns.ResourceItem =
		$$(
				{},
				'<div>Title</div><ul><ul>',
				{
					
				}
		);
	
	ns.ResourceList =
		$$(
				{},
				'<div>'
		);

	
})(jQuery);