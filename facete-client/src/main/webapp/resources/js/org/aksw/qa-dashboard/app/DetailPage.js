(function() {
	
	var ns = Namespace("org.aksw.qa-dashboard.core");
	
	/**
	 * 
	 */
	ns.renderDetailPage = function(id, queryFactory) {
		
		// TODO Rather than actually detaching elements,
		// I guess it would be much better simply just hiding the elements
		
		/*
		var body = $("body");
		var children = body.children();

		children.detach();
		
		body.html('<a href="#">Back</a>');
		$("a").click(function(event) {
			body.children().remove();
			//body.html('');
			event.preventDefault();
			
			body.append(children);
		});
		*/
		
		//var base = "http://qa.linkeddata.org/linking-project/";
		var base = "http://qa.linkeddata.org/linking-project/";
		var uri = base + id;
		
		
		/**
		 * What to display:
		 * 
		 * The linkset project - just like a wikipedia article - should by
		 * default show information about the latest revision.
		 * Well, I guess it would be ok if it showed information about the latest
		 * _evaluated_ revision.
		 * 
		 * Anyway, so the linkset is in the center, and evaluations depend on the selected revision.
		 * The same goes for Link-QA evals: the currently visible revision may not have such -
		 * however, the detail page of the linkset may have a shortcut link to it.
		 * 
		 * So a detail page should feature 2 things: a selector for the revision - 
		 * this might be best done by revision selector (just a backbone list) on top;
		 * each item also has icons for evaluations and link-qa.
		 * 
		 */
		
		var root = $("#detail-page");
		
		var queryStr = "Select ?s ?d { ?s a <http://qa.linkeddata.org/ontology/Linkset> . ?s <http://purl.org/dc/terms/created > ?d } Order By Desc(?d)";

		
		var task = queryFactory.executeSelect(queryStr);
		
		$.when(task).then(function(rs) {
			
			
		});
		
		
		
		
	};
	
	
})();






