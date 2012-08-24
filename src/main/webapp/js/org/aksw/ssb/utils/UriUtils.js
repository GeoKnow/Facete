(function() {

	var strings = Namespace("org.aksw.ssb.utils.strings");
	
	var ns = Namespace("org.aksw.ssb.utils.uris");


	// Very hacky check to avoid literals as URIs
	ns.isValidUri = function(str) {
		//return !str.contains('+');
		return strings.startsWith(str, "http://");
	};
	
	
	ns.filterUrisValidate = function(uris) {
		var result = [];
		
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
			
			if(ns.isValidUri(uri)) {
				result.push(uri);
			}
		}
		
		return result;
	};

})();