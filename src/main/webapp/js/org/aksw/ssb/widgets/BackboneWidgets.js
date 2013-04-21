(function() {
	
	var ns = Namespace("org.aksw.ssb.widgets");

	ns.ViewCloseButton = Backbone.View.extend({
		tagName: 'i',
		attributes: {
			'class': 'icon-remove-sign', 
			'style': 'position: absolute; width: 16px; height: 16px; top: 0px; right: 0px; padding: 0px; margin: 3px;'
		}
	});


	ns.ViewItemLink = Backbone.View.extend({
		tagName : 'a',
		subView : null,

		attributes: {href: '#'},
		initialize : function() {
			_.bindAll(this);
			
	    	if(this.options.subView) {
	    		this.subView = this.options.subView;
	    	}			
		},
		
		render : function() {
			
//			if(true) {
//				this.$el.html("test");
//				return this;
//			}
			
			var subView = this.subView;
			if(subView) {
				$elSubView = subView.render().$el;
				this.$el.append($elSubView);
			}
			
			return this;
		},

		unrender : function() {
			this.$el.remove();
		}
	});

	
})();