(function() {
	

	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

	var ns = Namespace("org.aksw.sbb.widgets");
	
	ns.CheckItem = $$({}, '<li>'
					+ '<form action="">'
					+ '<input type="checkbox" data-bind="isEnabled"/>'
					+ '<span data-bind="label"/>'
					+ '</form>'
					+ '</li>',
					{
						'click input': function() {
							var parent = this.model.get("parent");
							
							var checked = this.view.$(":checked").length == 1;
							
							parent.trigger("click", {isChild: true, item: this, checked: checked});
						}
					}	
					);

	ns.checkItemFactory = function(parent, data) {
		return $$(ns.CheckItem, {parent: parent, label: data});	
	};					

	//ns.refreshList(list, )

	ns.ListModelSparql = function(sparqlService, labelFetcher, driver, itemFactory, options) {
		this.sparqlService = sparqlService;
		this.labelFetcher = labelFetcher;
		this.driver = driver;
		this.options = options;
	};
	
	
	ns.ListModelSparql.prototype.fetchData = function() {
		var query = queryUtils.createQuerySelect(this.driver, this.options);						
		var task = queryUtils.fetchList(this.sparqlService, query, this.driver.variable);

		var result = $.Deferred();
		
		var self = this;
		$.when(task).then(function(resources) {
			

			var rawUriStrs = _.map(resources, function(item) { return item.isUri() ? item.value : null; });
			var uriStrs = _.filter(rawUriStrs, function(x) { return !(!x); });
			
			var labelTask = self.labelFetcher.fetch(uriStrs);
			
			$.when(labelTask).then(function(response) {

				var uriToText = {};
				_.each(response.uris, function(uri) {
					var label = (uri in response.uriToLabel) ? response.uriToLabel[uri].value : uri; 
					
					uriToText[uri] = label;
				});
				
				//result.resolve({uris: rawUriStrs, uriToText: uriToText});
				result.resolve(uriToText);
				
			}).fail(function() {
				result.fail();
			});
			
			
		}).fail(function() {
			result.fail();
		});

		return result;
	};

	
	
})();
