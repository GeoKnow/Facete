(function() {
	
	var ns = Namespace("org.aksw.ssb.widgets");

	(function() {
		
    	this.ViewCloseButton = Backbone.View.extend({
    		tagName: 'i',
    		attributes: {
    			'class': 'icon-remove-sign', 
    			'style': 'position: absolute; width: 16px; height: 16px; top: 0px; right: 0px; padding: 0px; margin: 3px;'
    		}
    	});

		
	}).apply(ns);
	
	
})();