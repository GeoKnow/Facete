
var DataTemplate = {};
			
/**
 * Returns a key from the model based on the binding.
 * 
 * 
 */
DataTemplate.getViaBinding = function(obj, key, binding) {
	var b = binding ? binding[key] : null;
	var result;

	if (b) {
		if (typeof b === 'function') {
			result = b(obj);
		} else {
			result = obj[b];
		}
	} else {
		result = obj[key];
	}
	
	return result;
};

DataTemplate.instanciate = function(fnDataTemplate, binding, data) {
	var copy = _.clone(data);
	
	_.each(binding, function(value, key) {
		var val = DataTemplate.getViaBinding(copy, key, binding);
		copy[key] = val;
	});

	var result = fnDataTemplate(copy);
	return result;
};
		
		
DataTemplate.Sparql = {};

DataTemplate.Sparql.createPostProcessor = function(fnDataTemplate, dataBinding) {
	var result = function(json) {
		var items = _.map(json.results.bindings, function(binding) {
			return DataTemplate.instanciate(fnDataTemplate, dataBinding, binding);
		});
		
		return items;
	};
	
	return result;
};
