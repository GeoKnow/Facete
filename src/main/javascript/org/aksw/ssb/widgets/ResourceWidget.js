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
		
	};
	
	/*
	ns.createResourceWidget(sparqlService, resources) {
		if(!resources) {
			resources = [];
		}
		
		// Properties which should be displayed by default
		var shortSummaryProperties = [];		
		
		var result = $$(
				{sparqlService: sparqlService, resources: resources},
				'<div><form action=""><input type="text"/><input type="button" value="Search"/></form><ul></ul></div>',
				{
					create: function() {
					},
				
					refresh: function() {
					}
				});
				
		return result;
	};
	
	ns.ResourceItem =
		$$(
				{resource: resource},
				'<div>Title</div><ul><ul>',
				{
					
				}
		);
	
	ns.ResourceList =
		$$(
				{},
				'<div>'
		);
	
	*/
	
})(jQuery);