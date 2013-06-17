(function($) {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	//var facets = Namespace("org.aksw.ssb.facets");
		
	//var qt = Namespace("org.aksw.ssb.collections.QuadTree");
	//var qtm = Namespace("org.aksw.ssb.collections.QuadTreeModel");
	//var qtc = Namespace("org.aksw.ssb.collections.QuadTreeCache");
	//var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	//var geovocab = Namespace("org.aksw.ssb.vocabs.geovocab");
	//var rdf = Namespace("org.aksw.ssb.vocabs.rdf");
	//var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");

	
	//var labelUtils = Namespace("org.aksw.ssb.utils");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	//var facetbox = Namespace("org.aksw.ssb.widgets.facetbox");
	//var widgets = Namespace("org.aksw.ssb.widgets"); 

	
	//var collections = Namespace("org.aksw.ssb.collections");
	
	var ns = Namespace("org.aksw.ssb.app.controllers");

	
	/**
	 * 
	 * 
	 * @param node
	 * @param item
	 */
	ns.FacetController.prototype.updateFacetCountsGeomRec = function(sparqlService, labelFetcher, facetState, node, propertyNameToItem) {
		
		//var self = this;
		var concept = state.concept;
		var query = queryUtils.createFacetQueryCount(concept.element, concept.variable);

		// Return a promise so we can react if the callback finishes
		return sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {

				//console.log("jsonRs for facet counts", jsonRs);
				return queryUtils.processFacets(facetState, jsonRs, labelFetcher).pipe(function(facetState) {
												
					//var countTasks = [];

					$.each(node.outgoing, function(propertyName, child) {
						var item = propertyNameToItem[propertyName];
						
						if(item) {
							
							var breadcrumb = item.model.get("breadcrumb");
							
							countTasks.push(queryUtils.loadFacetValues(sparqlService, labelFetcher, state, breadcrumb).pipe(function(data) {
								child.facetValues = data.facetValues;
								//console.log("So far got", facetValues);
							}));

							//console.log("Need to fetch: ", item);
						}							
					});
					
					return $.when.apply(window, countTasks).then(function() {
						return facetState;				
					});					
				});
		});
	};
	
	
	
})(jQuery);

