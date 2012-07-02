(function() {

	var ns = Namespace("org.aksw.ssb.widgets");

	
	/**
	 * Items in the list may be checked.
	 * 
	 * There are severeal options where the check state could be stored:
	 * a) In the usual model, e.g. [{checked: true, data: your_object]
	 *    Pro: simple
	 *    Con: We would have to transform our original list.
	 * b) In a separate list checked: [true, false, ...] data = [{}, {}, ...]
	 *    Pro: separation
	 *    Con: 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */
	ns.CheckboxList = $$(ns.ListWidget, {
		controller: {
			create: function() {
				this.setItemFactory(widgets.checkItemFactory);
			}
		}
	});
		
	/*
		var listWidget = widgets.createExecutorList(executorModel, widgets.checkItemFactory, this.labelFetcher);

	});*/
	
})();
