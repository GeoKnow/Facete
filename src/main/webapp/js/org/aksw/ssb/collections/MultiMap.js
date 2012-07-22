(function($) {
	
	var ns = Namespace("org.aksw.ssb.collections");	
	
	ns.Set = function(initEntries) {
		this.entries = !initEntries ? {} : initEntries;
	};
	
	ns.Set.fromArray = function(list) {
		var tmp = {};
		
		$.each(list, function(k, v) { tmp[k] = 1; });
		
		return new Set(tmp);
	};
	
	ns.Set.prototype = {
		add: function(key) {
			this.entries[key] = 1; //;value;
			
			$(this).trigger("changed", {added:[key], removed:[] });
		},
		
		contains: function(key) {
			return this.entries[key] != undefined;
		},
	
		difference: function(otherSet) {
			var result = [];
			
			for(var key in this.entries) {
				if(!otherSet.contains(key)) {
					result.push(key);
				}
			}
			
			return result;
		},
		
		addAll: function(otherSet) {
			var added = [];
			
			for(var k in otherSet.entries) {
				var v = this.entries[k];
				if(!v) {
					this.entries[k] = 1;
					added.push[k];
				} else {
					this.entries[k] = v + 1;
				}
			}
			
			$(this).trigger("changed", {added:added, removed:[] });
		},
		
		remove: function(key) {
			if(key in this.entries) {
				
				var value = this.entries[key];
				delete this.entries[key];
			
				
				$(this).trigger("changed", {added:[], removed:[key] });
			}
		},
		
		isEmpty: function() {
			return _.isEmpty(this.entries);
		},
		
		clone: function() {
			return new Set(entries.clone());
		},
		
		toArray: function() {
			return getKeys(this.entries);
		}
	};
	
	ns.Map = function() {
		this.entries = {};
	};
	
	ns.Map.prototype = {
		put: function(key, value) {
		
			this.remove(key);
			
			this.entries[key] = value;
			
			var tmp = {};
			tmp[key] = value;
			
			$(this).trigger("changed", {added:tmp, removed:{} });
		
			/*
			var oldValue = this.entries[key];
			
			if(oldValue !== value) {
				
				var removed = {};
				if(key in this.entries) {
					removed[key] = oldValue;
				} 
				
				
				var tmp = {};
				tmp[key] = value;
				
				$(this).trigger("changed", {added:tmp, removed:removed });
			}*/
		},
	
		remove: function(key) {
			if(key in this.entries) {
			
				var value = this.entries[key];
				delete this.entries[key];
			
				var tmp = {};
				tmp[key] = value;
				
				$(this).trigger("changed", {added:{}, removed:tmp });
			}
		},	
		
		addAll: function(o) {
			for(key in o) {
				this.put(key,  o[key]);
			}
		},
	
		removeAll: function(keys) {
			// OPTIMIZE send only a single event
			for(var i = 0; i < keys.length; ++i) {
				this.remove(keys[i]);
			}
		},
	
		clear: function() {
			var tmp = this.entries;
			this.entries = {};
			
			$(this).trigger("changed", {added:{}, removed: tmp});
		},
	
	
		get: function(key) {
			return this.entries[key];
		}
	};
	
	
	ns.MultiMap = function() {
		this.entries = {};
	};
	
	ns.MultiMap.prototype.clone = function() {
		var result = new ns.MultiMap();
		result.addMultiMap(this);
		
		return result;
	};
	
	ns.MultiMap.prototype.clear = function() {
		this.entries = {};
	};
	
	ns.MultiMap.prototype.addMultiMap = function(other) {
		for(var key in other.entries) {
			var values = other.entries[key];
			
			for(var i = 0; i < values.length; ++i) {
				var value = values[i];
				
				this.put(key, value);
			}			
		}
	};
	
	ns.MultiMap.prototype.get = function(key) {
		return (key in this.entries)
			? this.entries[key]
			: [];
	};
	
	ns.MultiMap.prototype.put = function(key, value) {
		var values;
		
		if(key in this.entries) {
			values = this.entries[key];
		} else {
			values = [];
			this.entries[key] = values;
		}
		
		values.push(value);
	};

	ns.MultiMap.prototype.removeKey = function(key) {
		delete this.entries[key];
	};
	
	
	
	
	
	ns.SetMultiMap = function() {
		this.entries = {};
	};
	
	ns.SetMultiMap.prototype.clear = function() {
		this.entries = {};
	};
	
	/*
	ns.SetMultiMap.prototype.addMultiMap = function(other) {
		for(var key in other.entries) {
			var values = other.entries[key];
			
			for(var i = 0; i < values.length; ++i) {
				var value = values[i];
				
				this.put(key, value);
			}			
		}
	};
	*/
	
	ns.SetMultiMap.prototype.put = function(key, value) {
		var values;
		
		if(key in this.entries) {
			values = this.entries[key];
		} else {
			values = {};
			this.entries[key] = values;
		}
		
		values[value] = true;
	};

	ns.SetMultiMap.prototype.removeKey = function(key) {
		delete this.entries[key];
	};
	
	ns.SetMultiMap.prototype.clear = function(key) {
		this.entries = {};
	};
	
	ns.SetMultiMap.prototype.get = function(key) {
		return (key in this.entries)
			? _.keys(this.entries[key])
			: [];
	};
	
	
	
	ns.BidiMultiMap = function(forward, inverse, inverseMap) {
		this.forward = forward; //new ns.MultiMap();
		this.inverse = inverse; //new ns.MultiMap();
		
		if(!inverseMap) {
			inverseMap = new ns.BidiMultiMap(inverse, forward, this);
		}
		
		this.inverseMap = inverseMap;
	};
	
	ns.BidiMultiMap.prototype.inverseMap = function() {
		return inverseMap;
	};

	ns.BidiMultiMap.createWithSet = function(ctor) {
		return new ns.BidiMultiMap(new ns.SetMultiMap(), new ns.SetMultiMap());
	};
	
	ns.BidiMultiMap.prototype.put = function(key, value) {			
		this.forward.put(key, value);
		this.inverse.put(value, key);
	};


	ns.BidiMultiMap.prototype.remove = function(key, value) {
		this.forward.remove(key, value);
		this.inverse.remove(value, key);
	};
		
	/**
	 * Note: use putAllValues(someKey, {})
	 * to make a key known.
	 * 
	 */
	ns.BidiMultiMap.prototype.putAllValues = function(key, values) {
		if(!(key in this.forward.entries)) {
			this.forward.entries[key] = {};
		}
		
		for(value in values) {
			this.put(key, value);
		}
	};

	ns.BidiMultiMap.prototype.putAll = function(other) {
		for(key in other.forward.entries) {
			this.putAllValues(key, other.forward.entries[key]);
		}
	};

	ns.BidiMultiMap.prototype.get = function(key) {
		return this.forward.get(key);
	};
		
	ns.BidiMultiMap.prototype.getFirst = function(key) {
		var a = this.get(key);
		if(a) {
			//console.log(a);
			
			var keys = getKeys(a);			
			if(keys.length > 0) {
				return keys[0];
			}
		}
	};
	
	ns.BidiMultiMap.prototype.clear = function() {
		this.forward.clear();
		this.backward.clear();
	};

	
	
	/**
	 * TODO Toggle between different semantics:
	 * Map<Primitive, Set<Primitive>>
	 * Map<Primivite, MultiSet<Primitive, Count>
	 * 
	 * 
	 * @returns {MultiMap}
	 */
	/*
	ns.MultiMap = function() {
		
		this.entries = {};
	};
	
	
	ns.inc = function(obj, key, init) {
		if(!init) {
			init = 1;
		}
		
		val = key in obj ? obj[key] : init;
		
		obj[key] = val;
		
		return val;
	};
	
	ns.dec = function(obj, key, del) {
		val = key in obj ? obj[key] : undefined;
		
		if(val > 0) {
			--val;
		}
		
		if(del && (!val || val < 0)) {
			delete obj[key];
		}
		
		return val;
	};
	
	ns.MultiMap.prototype = {
	    addKey: function(key) {
			if(!(key in this.entries)) {
				this.entries[key] = {};
			}
	    },
			
		inc: function(key, value) {
	        
			var set = (key in this.entries) ? this.entries[key] : this.entries[key] = {};
	
			set[value] = (value in set) ? set[value] + 1 : 1;
		},
		
		dec: function(key, value, retainKey) {
			if(!(key in this.entries)) {
				return;
			}
	
			var set = this.entries[key];
			
			if(!(value in set)) {
				return;
			}
			
			var count = set[value];
			--count;
	
			if(count <= 0) {
				delete set[value];
			} else {
				set[value] = count;
			}
			
			if(!retainKey) {
				if(_.isEmpty(set)) {
					delete this.entries[key];
				}
			}
		},
		
		count: function(key, value) {
			return this.entries[key][value];
		},
	
		put: function(key, value) {
			this.inc(key, value);
		},
		
		/**
		 * 
		 * @param key
		 * @param values An array of values, e.g. [1, 2, 3]
		 * /
		putAll: function(key, values) {
			for(var i in values) {
				this.put(key,  values[i]);
			}
		},
	
	
	
		remove: function(key, value) {
			if(key in this.entries) {
				if(value in this.entries[key]) {
					delete this.entries[key][value];
				}
				
				if(this.entries[key].length == 0) {
					delete this.entries[key];
				}
			}
		},
		
		removeKey: function(key) {
			//TODO Fire event
			delete this.entries[key];
		},
		
		removeAll: function(keys) {
			// OPTIMIZE send only a single event
			for(var i = 0; i < keys.length; ++i) {
				this.remove(keys[i]);
			}
		},
	
		get: function(key) {
			return key in this.entries ? this.entries[key] : {};
		},
		
		clear: function() {
			var tmp = this.entries;
			this.entries = {};
			
			$(this).trigger("changed", {added:{}, removed: tmp});
		},
	
	};
	*/

	/*
	ns.BidiMultiMap = function() {
		this.forward = new ns.MultiMap();
		this.inverse = new ns.MultiMap();
	};

	ns.BidiMultiMap.prototype = {
		inc: function(key, value) {
			this.forward.inc(key, value);
			this.inverse.inc(value, key);		
		},

		dec: function(key, value, retainKey) {
			this.forward.inc(key, value, retainKey);
			this.inverse.inc(value, key, retainKey);		
		},
			
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
		 * /
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
				//console.log(a);
				
				var keys = getKeys(a);			
				if(keys.length > 0) {
					return keys[0];
				}
			}
		}
		
		/*
		this.get = function(key) {
			return key in this.entries ? this.entries[key] : {};
		};* /	
	};

*/

	
})(jQuery);
