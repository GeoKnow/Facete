(function() {

	var ns = Namespace("org.aksw.ssb.utils.strings");

	
	/**
	 *
	 * Yet another namespaceing solution, but it looks kinda neat; but I wonder
	 * if I will run into conflicts with ambigous this pointers in the end.
	 * 
	 * http://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
	 * 
	 */
	(function() {
	
		// I think this is just the prototype escapeHTML method
		this.escapeHTML = function(text) {
			return !text ? "" : text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		};
	
	    this.endsWith = function(str, suffix) {
	        return str.indexOf(suffix, this.length - suffix.length) !== -1;
	    };
	
		this.startsWith = function(str, prefix) {
			return str.indexOf(prefix) == 0;
		};
	
		// Source: http://stackoverflow.com/questions/2901102/how-to-print-number-with-commas-as-thousands-separators-in-javascript
		this.formatNumber = function(x) {
		    var parts = x.toString().split(".");
		    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		    return parts.join(".");
		};
	}).apply(ns);

})();
