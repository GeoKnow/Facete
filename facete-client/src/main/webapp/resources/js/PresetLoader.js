(function() {

	ns.StateSyncer = function() {
		this.nameToModel = new Backbone.Collection();
		
		/*
		this.renameMap = {
				
		}*/
		
	};
	
	
	ns.StateSyncer.prototype = {
			setState: function(obj) {
				
				var self = this;
				_.each(obj, function(key, value) {

					// Check if there is a model for the given key
					var model = self.nameToModel.get(key);
					
					
				});
			}
			
			
	};
	
	
	
})();