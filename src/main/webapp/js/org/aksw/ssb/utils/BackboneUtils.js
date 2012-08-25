(function() {

	var ns = Namespace("org.aksw.ssb.utils.backbone");
	
	/**
	 * Returns a key from the model based on the binding.
	 * 
	 * 
	 */
	ns.getModelValue = function(model, key, binding) {
		var b = binding ? binding[key] : null;
		var result;

		if(b) {
			if(typeof b === 'function') {
				return b(model);
			} else {				
				return model.get(b);
			}
		} else {
			return model.get(key);
		}
	};
	
})();