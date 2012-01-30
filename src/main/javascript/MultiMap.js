

// TODO Use underscores _.keys({}) instead.
function getKeys(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
};


/*
function TripleStore() {
	this.entries = {};
}

TripleStore.prototype.put(id, key, value) {
	var po = entries[id];
	if(!po) {
		po = {};
		entries[id] = po;
	}
	
	var o = po[key];
	if(!o) {
		o = {};
	}
	
	if(!(o[value])) {
		o[value] = 1;
		
		$(this).trigger("changed", {added:{}, removed:{}});
	}
};


TripleStore.prototype.remove(id, key, value) {
	
};

TripleStore.prototype.removeAllById(id) {
	
};
*/



function Set(initEntries) {
	this.entries = !initEntries ? {} : initEntries;
}

Set.fromArray = function(list) {
	var tmp = {};
	
	$.each(list, function(k, v) { tmp[k] = 1; });
	
	return new Set(tmp);
};

Set.prototype = {
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

function Map() {
	this.entries = {};
}

Map.prototype = {
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


/**
 * TODO Toggle between different semantics:
 * Map<Primitive, Set<Primitive>>
 * Map<Primivite, MultiSet<Primitive, Count>
 * 
 * 
 * @returns {MultiMap}
 */
function MultiMap() {
	
	this.entries = {};
}


MultiMap.prototype = {
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
	 */
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



