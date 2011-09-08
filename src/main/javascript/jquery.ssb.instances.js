(function($) {


$.widget("ui.ssb_instances", {

	// TODO: Add _init method for backward compatibility
	
	_create: function() {

		this.domElement = this.element.get(0);
		
		this.repaintScheduler = new Scheduler();
		
		this.instanceToLabel = this.options.instanceToLabel;
		this.instanceToType  = this.options.instanceToType;
		this.schemaIcons = this.options.schemaIcons;	

		
		var self = this;
		
		$(this.instanceToLabel).bind("changed", function(event, change) {
			self.repaintScheduler.schedule(function() { self.onDataChange(change); });
		});
	},

	onDataChange: function(change) {
		notify("data", "changed");
		//var map = jsonRdfResultSetToMap(JSON.parse(response), "s", "o");
		
		var text = "<ul class='dynatree-container'>";
		var map = this.instanceToLabel.entries;
		
		var i = 0;
		for(var key in map) {
			++i;
			
			var value = map[key];
			
			var img = "";
			if(key in this.instanceToType) {
				
				var icon = this.schemaIcons[this.instanceToType[key]];
				if(icon) {
					img = "<img alt='' src='" + icon + "'>";
				}
			}
			
			text += "<li><span class='dynatree-node dynatree-has-children dynatree-lastsib dynatree-exp-cl dynatree-ico-c'>" + img + "<a class='dynatree-title' href='#'>" + i + ": "+ value + "</a><span></li>";
		}
		
		text += "</ul>";
		
		$(this.domElement).html(text);
	}
})

})(jQuery);
