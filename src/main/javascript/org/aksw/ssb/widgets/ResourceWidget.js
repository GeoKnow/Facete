/**
 * A widget for displaying/browsing a set of resources.
 * 
 * 
 * 
 */
(function($) {

	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	
	var ns = Namespace("org.aksw.ssb.widgets"); 
	
	/* TODO Not sure if the describer wrapper makes sense - we might need more
	 * flexibility (see OntoWiki, which essentially allows you to switch between select and construct queries)
	 * so that the sparqlService itself is required
	ns.DescriberSparql = function(sparqlService) {
		this.sparqlService = sparqlService;
	};
	
	ns.DescriberSparql.prototype.describe = function(nodes, callback) {
		return queryUtils.createDescribeQuery(nodes, callback);
	};
	*/
	
	ns.executeDescribe = function(sparqlService, nodes, callback) {
		var query = queryUtils.createDescribeQueryNodes(nodes);
		var promise = sparqlService.executeConstruct(query.toString(), callback);
		return promise;
	};
	

	ns.createResourceWidget = function(sparqlService, nodes) {
		if(!nodes) {
			nodes = [];
		}
		
		//var describer = new ns.DescriberSparql(sparqlService);
		
		// Properties which should be displayed by default
		var shortSummaryProperties = [];		
		
		var result = $$(
				{sparqlService: sparqlService, nodes: []},
				'<div><form action=""><input type="text"/><input type="button" value="Search"/></form><ul></ul></div>',
				{
					create: function() {
					},
				
					refresh: function() {
					},
					
					setNodes: function(nodes) {
						console.log("setNodes called");
						
						var sparqlService = this.model.get('sparqlService');
						ns.executeDescribe(sparqlService, nodes, function() {
							console.log("Describe callback called");
						});						
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