(function() {

	var ns = Namespace("org.aksw.ssb.utils.strings");

	// I think this is just the prototype escapeHTML method
	ns.escapeHTML = function(text) {
		return !text ? "" : text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	};

    ns.endsWith = function(str, suffix) {
        return str.indexOf(suffix, this.length - suffix.length) !== -1;
    };

	ns.startsWith = function(str, prefix) {
		return str.indexOf(prefix) == 0;
	};
	
})();
