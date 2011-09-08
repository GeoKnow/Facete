function fetchDirectSuperClasses(service, uris, fn) {
	if(uris.length == 0) {
		return;
	}

	var queryString = "Select ?p ?c { ?c rdfs:subClassOf ?p . Filter(?c In (<" + uris.join(">,<") + ">)) . }";
	sparqlQuery("http://linkedgeodata.org/sparql", queryString, {
		failure: function() { notify("Error", "Sparql Query Failed"); },
		success: function(response) {
			
			var multiMap = jsonRdfResultSetToMultiMap(JSON.parse(response), "c", "p");

			// Add uris for which no super classes were found
			for(var i = 0; i < uris.length; ++i) {
				var uri = uris[i]; 

				if(!(uri in multiMap.forward.entries)) {
					multiMap.putAllValues(uri, {});
				}
			}
			
			fn(uris, multiMap);
		}	
	});		
}

function fetchTransitiveSuperClasses(service, uris, result, fn) {
	if(!result) {
		result = new BidiMultiMap();
	}

	fetchTransitiveSuperClassesRec(service, uris, result);
	
	if(fn) {
		fn(result);
	}
}



/**
 * result must be a BidiMultiMap
 * 
 * @param service
 * @param uris
 * @param result
 * @returns
 */
var fetchTransitiveSuperClassesRec = function(service, uris, result) {
	//var result = new BidiMultiMap();
	
	
	var superClassesToFetch = [];
	for(var i = 0; i < uris.length; ++i) {
		var uri = uris[i];
		
		if(!(uri in result.forward.entries)) {
			superClassesToFetch.push(uri);
		}
	}

	
	//console.log("Entries: ");
	//console.log(result.forward.entries);
	//console.log(superClassesToFetch);
	//console.log(result);
	/*
	for(uri in uris) {
		if(!(uri in result.forward)) {
			superClassesToFetch.push(uri);
		}
	}*/
	
	if(superClassesToFetch.length == 0) {
		return;
	}

	fetchDirectSuperClasses(service, superClassesToFetch, function(uris, map) {
		//console.log(map);
		/*
		for(var i = 0; i < uris.length; ++i) {
			var uri = uris[i];
			
			if(uri in map.forward) {
				
			}
		}
		*/
		
		result.putAll(map);
		//console.log(result);
		
		fetchTransitiveSuperClassesRec(service, uris, result);
	});
}; 

function removeReflexivity(multiMap) {
	
	for(key in multiMap.forward.entries) {
		multiMap.remove(key, key);
		/*
		for(value in multiMap.forward.entries[key]) {
			if(key)
			
		}*/
		
	}
}

function computeTreeStructure(classHierarchy) {
	var roots = [];
	
	// Find root nodes (the ones without a parent)
	for(child in classHierarchy.forward.entries) {
		parents = classHierarchy.forward.entries[child];
		//console.log("Hierarchy: " + child + " " + JSON.stringify(parents));
		if($.isEmptyObject(parents)) {
			roots.push(child);
		}
	}
	
	//console.log("Roots:", roots);
	
	var keyHierarchy = new BidiMultiMap();
	var keyToUri = new BidiMultiMap();
	var rootKeys = [];
	
	for(var i = 0; i < roots.length; ++i) {
		//console.log(keyToUri);
		
		var rootKey = computeTreeStructureRec(roots[i], "", classHierarchy, keyHierarchy, keyToUri, {});
	
		if(rootKey) {
			rootKeys.push(rootKey);
		}
	}
	 
	return {"rootKeys": rootKeys, "keyHierarchy": keyHierarchy, "keyToUri": keyToUri};
}



function computeTreeStructureExcerpt(tree, keys)
{
	var keySet = {};
	for(var i = 0; i < keys.length; ++i) {
		keySet[keys[i]] = true;
	}
	
	var keyHierarchy = new BidiMultiMap();
	var rootKeySet = {};
	
	computeTreeStructureBottomUpRec(tree, keySet, keyHierarchy, rootKeySet);
	
	var rootKeys = [];
	for(key in rootKeySet) {
		rootKeys.push(key);
	}

	return {"rootKeys": rootKeys, "keyHierarchy": keyHierarchy, "keyToUri": tree.keyToUri};
}

/**
 * Compute an excerpt from the schema whereas the classes are leaves
 * 
 * @param classHierarchy
 * @param classes
 */
function computeTreeStructureBottomUpRec(tree, keySet, outHierarchy, outRootKeySet)
{
	if($.isEmptyObject(keySet)) {
		return;
	}

	var next = {};
	
	for(var key in keySet) {
		
		if(key in tree.keyHierarchy.forward.entries) {
			var parents = tree.keyHierarchy.forward.entries[key];

			if($.isEmptyObject(parents)) {
				outRootKeySet[key] = true;				
			} else {
				for(var parent in parents) {
					outHierarchy.put(key, parent);
					next[parent] = true;
				}
			}
		} else {
			outRootKeySet[key] = true;
		}
	}

	computeTreeStructureBottomUpRec(tree, next, outHierarchy, outRootKeySet);
}



function computeTreeStructureRec(node, key, classHierarchy, outKeyHierarchy, outKeyToUri, visited)
{
	//console.log(visited);
	if(node in visited) {
		//alert("Cycle detected: " + JSON.stringify(visited) + ", " + node);
		return;
	}
	
	visited[node] = 1;
	
	var nodeKey = key ? key + " " + node : node;


	outKeyToUri.put(nodeKey, node);
	
	if(node in classHierarchy.inverse.entries) {
		children = classHierarchy.inverse.entries[node];
		
		for(child in children) {			
			var childKey = nodeKey + " " + child;
			
			outKeyHierarchy.put(childKey, nodeKey);
			
			computeTreeStructureRec(child, nodeKey, classHierarchy, outKeyHierarchy, outKeyToUri, visited);
		}
	}
	
	return nodeKey;
}


function LabelCollection() {
	this.uriToLangToLabel = {};
	
	this.get = function(uri, lang) {
		if(uri in this.uriToLangToLabel && lang in this.uriToLangToLabel[uri]) {
			return this.uriToLangToLabel[uri][lang];
		}
	};
	
	this.put = function(uri, lang, label) {
		//console.log(uri + " x " + lang + " x " + label);
		if(!(lang in this.uriToLangToLabel)) {
			this.uriToLangToLabel[uri] = {};
		}
		
		var old = this.uriToLangToLabel[uri][lang];
		
		//if(!old || !)
		if(!old || !old.equals(label)) {
			this.uriToLangToLabel[uri][lang] = label;
			Dispatcher.fireEvent("labelChanged", {u: uri, l: lang, o: old, n:label});
		}
	};
}


function MapCollection() {
	this.map = {};
	
	this.get = function(key) {
		if(key in this.map) {
			return this.map[key];
		}
	};
	
	this.put = function(key, value) {
		var old = (key in this.map) ? this.map[key] : null;
		
		if(old != value) {
			this.map[key] = value;
			$(this).trigger("itemAdded");
			//Dispatcher.fireEvent("labelChanged", {u: uri, l: lang, o: old, n:label});
		}
	};
}







function parseJsonRdfNode(node) {
	/*
	if(node.type = "literal") {
		if(node.dataype = "http://www.w3.org/2001/XMLSchema#integer") {
			return +(node.value);
		}
	}*/
	
	return node.value;
}

function jsonRdfResultSetToMap(json, keyName, valueName) {
	var result = {};
	
	for(var index in json.results.bindings) {
		var item = json.results.bindings[index];
				
		var key = parseJsonRdfNode(item[keyName]);
		var value = parseJsonRdfNode(item[valueName]);
		
		result[key] = value;
	}
	
	//notify("Debug", json.results.bindings.length + " facets loaded.");
	
	return result;
}

function jsonRdfResultSetToMultiMap(json, keyName, valueName) {
	var result = new BidiMultiMap();
	
	for(var index in json.results.bindings) {
		var item = json.results.bindings[index];
				
		var key = parseJsonRdfNode(item[keyName]);
		var value = parseJsonRdfNode(item[valueName]);
		
		//result[key] = value;
		result.put(key, value);
	}
	
	//notify("Debug", json.results.bindings.length + " facets loaded.");
	
	return result;
}



