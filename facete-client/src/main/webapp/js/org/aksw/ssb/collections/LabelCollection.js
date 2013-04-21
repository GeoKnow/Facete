(function($) {
	
	var ns = Namespace("org.aksw.ssb.collections");
	
	ns.LabelCollection = function() {
		this.uriToLangToLabel = {};
	};
		
	
	ns.LabelCollection.prototype.get = function(uri, lang) {
		if(uri in this.uriToLangToLabel && lang in this.uriToLangToLabel[uri]) {
			return this.uriToLangToLabel[uri][lang];
		}
	};
		
	ns.LabelCollection.prototype.put = function(uri, lang, label) {
		//console.log(uri + " x " + lang + " x " + label);
		if(!(uri in this.uriToLangToLabel)) {
			this.uriToLangToLabel[uri] = {};
		}
		
		var old = this.uriToLangToLabel[uri][lang];
		
		//if(!old || !)
		if(!old || !old === label) {
			this.uriToLangToLabel[uri][lang] = label;
			Dispatcher.fireEvent("labelChanged", {u: uri, l: lang, o: old, n:label});
		}
	};

})();

