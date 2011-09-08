var getKeys = function(obj){
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




function Map() {
	this.entries = {};
}

Map.prototype.put = function(key, value) {

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
};

Map.prototype.remove = function(key) {
	if(key in this.entries) {
	
		var value = this.entries[key];
		delete this.entries[key];
	
		var tmp = {};
		tmp[key] = value;
		
		$(this).trigger("changed", {added:{}, removed:tmp });
	}
};

Map.prototype.addAll = function(o) {
	for(key in o) {
		this.put(key,  o[key]);
	}
};

Map.prototype.removeAll = function(keys)
{
	// OPTIMIZE send only a single event
	for(var i = 0; i < keys.length; ++i) {
		this.remove(keys[i]);
	}
}

Map.prototype.clear = function() {
	var tmp = this.entries;
	this.entries = {};
	
	$(this).trigger("changed", {added:{}, removed: tmp});
};


Map.prototype.get = function(key) {
	return this.entries[key];
};



function MultiMap() {
	
	this.entries = {};
	
	this.put = function(key, value) {
        
		var set = (key in this.entries) ? this.entries[key] : this.entries[key] = {};

		set[value] = (value in set) ? set[value] + 1 : 1;
	};


	this.remove = function(key, value) {
		if(key in this.entries) {
			if(value in this.entries[key]) {
				delete this.entries[key][value];
			}
			
			if(this.entries[key].length == 0) {
				delete this.entries[key];
			}
		}
	};
	
	this.get = function(key) {
		return key in this.entries ? this.entries[key] : {};
	};
}


