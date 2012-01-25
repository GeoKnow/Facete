var DatatypePropertyFilter = function(name, enabled, type, min, max) {
	this.name = name;
	this.enabled = enabled;
	this.type = type; // Integer, Float, etc.
	this.min = min;
	this.max = max;
}

var FilterConfiguration = {
	classFilter: {}, // Maps a class URI to either true (filter active) or false
	
	propertyFilter: {} // Maps a property to either t
};
