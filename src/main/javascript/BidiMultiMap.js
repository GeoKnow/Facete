function BidiMultiMap() {
	this.forward = new MultiMap();
	this.inverse = new MultiMap();
}

BidiMultiMap.prototype = {
	put: function(key, value) {
		//console.log("MultiMap [add] " + key + " " + value);
		this.forward.put(key, value);
		this.inverse.put(value, key);
	},


	remove: function(key, value) {
		this.forward.remove(key, value);
		this.inverse.remove(value, key);
	},
	
	/**
	 * Note: use putAllValues(someKey, {})
	 * to make a key known.
	 * 
	 */
	putAllValues: function(key, values) {
		if(!(key in this.forward.entries)) {
			this.forward.entries[key] = {};
		}
		
		for(value in values) {
			this.put(key, value);
		}
	},

	putAll: function(other) {
		for(key in other.forward.entries) {
			this.putAllValues(key, other.forward.entries[key]);
		}
	},

	get: function(key) {
		return this.forward.get(key);
	},
	
	getFirst: function(key) {
		var a = this.get(key);
		if(a) {
			console.log(a);
			
			var keys = getKeys(a);			
			if(keys.length > 0) {
				return keys[0];
			}
		}
	}
	
	/*
	this.get = function(key) {
		return key in this.entries ? this.entries[key] : {};
	};*/	
}
