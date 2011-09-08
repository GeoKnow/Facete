function BidiMultiMap() {
	this.forward = new MultiMap();
	this.inverse = new MultiMap();
	
	this.put = function(key, value) {
		//console.log("MultiMap [add] " + key + " " + value);
		this.forward.put(key, value);
		this.inverse.put(value, key);
	};


	this.remove = function(key, value) {
		this.forward.remove(key, value);
		this.inverse.remove(value, key);
	};
	
	/**
	 * Note: use putAllValues(someKey, {})
	 * to make a key known.
	 * 
	 */
	this.putAllValues = function(key, values) {
		if(!(key in this.forward.entries)) {
			this.forward.entries[key] = {};
		}
		
		for(value in values) {
			this.put(key, value);
		}
	};

	this.putAll = function(other) {
		for(key in other.forward.entries) {
			this.putAllValues(key, other.forward.entries[key]);
		}
	};

	/*
	this.get = function(key) {
		return key in this.entries ? this.entries[key] : {};
	};*/	
}
