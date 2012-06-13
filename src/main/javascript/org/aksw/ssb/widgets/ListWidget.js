(function($) {

	var ns = Namespace("org.aksw.ssb.widgets.facetbox");
	
	
	ns.ListWidget = $$({}, "<ul></ul>", {
		addItem: function(item) {
			this.append(item);
		},
		removeItem: function(item) {
			this.remove(item);
		}		
	});
	/*
	ns.createListWidget = function() {
		
	}*/
	
})(jQuery);
