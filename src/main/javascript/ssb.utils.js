/**
 * Schedules callbacks for delayed invocation.
 * Only the latest set callback will be invoked after the delay, the others are discarded.
 * 
 * This class is useful for e.g. limitting the rate of ajax/sparql requests
 * 
 * TODO: If a request is taking too long, schedule new requests, but do not execute them
 * before the other requests returns. Hm, nah bad idea, that might get the app stuck.
 * 
 * @returns {Scheduler}
 */
function Scheduler() {
	this.lastRequestTime = 0;
	this.requestPeriod = 2000; // Minimum period between requests 
	
	this.schedule = function(callback) {
		var now = new Date().getTime();
		var delay = Math.max(0, this.requestPeriod - (now - this.lastRequestTime));

		clearTimeout(this.timeout);

		var outer = this;
		
		this.timeout = setTimeout(function() {
			outer.lastRequestTime = new Date().getTime();
			callback();
		}, delay);
	};
}

function toOpenLayersBounds(bounds) {
	return new OpenLayers.Bounds(bounds.left, bounds.bottom, bounds.right, bounds.top);
}

var qt = Namespace("org.aksw.ssb.collections.QuadTree");

function toQuadTreeBounds(bounds) {	
	return new qt.Bounds(bounds.left, bounds.right, bounds.bottom, bounds.top);
}


function mergeMapsInPlace(a, b) {
	for(k in b) {
		a[k] = b[k];
	}
}

function mergeInc(a, b) {
	for(k in b) {
		if(k in a) {
			a[k] += b[k];
		} else {
			a[k] = b[k];
		}		
	}
}

function mergeDec(a, b) {
	for(k in b) {
		if(k in a) {
			a[k] -= b[k];
		} else {
			a[k] = b[k];
		}		
	}
}


function inc(map, key) {
	if(key in map) {
		++map[key];
	} else {
		map[key] = 1;
	}
}

function dec(map, key, deleteKeyOnZero) {
	if(key in map) {
		var value = --map[key];
		
		if(value === 0) {
			delete map[key];
		}
		
	} else {
		map[key] = -1;
	}	
}


/*
 * Utility functions for some geometric computations 
 */

function getOuterRadiusDeg(bound)
{
	var d1 = getDistanceDeg(bound.left, bound.bottom, bound.right, bound.top);
	var d2 = getDistanceDeg(bound.left, bound.top, bound.right, bound.bottom);
	var d = Math.max(d1, d2);

	return d * 0.5;
}

function getDistanceDeg(x1, y1, x2, y2) {
	return getDistanceRad(
			degToRad(x1),
			degToRad(y1),
			degToRad(x2),
			degToRad(y2));
}

function degToRad(value)
{
	return value * (Math.PI / 180.0);
}


/**
 * 
 * Source: http://www.movable-type.co.uk/scripts/latlong.html
 */
function getDistanceRad(x1, y1, x2, y2) {
	var R = 6371; // km
	var d = Math.acos(Math.sin(y1) * Math.sin(y2) + 
	                  Math.cos(y1) * Math.cos(y2) *
	                  Math.cos(x2 - x1)) * R;
	return d;
}

/**
 * 
 * See http://stackoverflow.com/questions/1219860/javascript-jquery-html-encoding for a discussion
 */
function htmlEncode(value){
	return $('<div/>').text(value).html();
}

function htmlDecode(value){
	return $('<div/>').html(value).text();
}


function extractTagsMulti(jsonRdfs)
{
	var result = {};
	for(var i = 0; i < jsonRdfs.length; ++i) {
		extractTagsCore(result, jsonRdfs[i]);
	}
	
	return result;
}

function extractTags(json)
{
	return extractTagsCore({}, json);
}

function extractTagsCore(result, json)
{
	for(var i = 0; i < json.results.bindings.length; ++i) {
		var item = json.results.bindings[i];
		//console.log(item);
		var key = item.p.value;
		
		// Check if the key is prefixed with a known namespace
		// In that case replace it
		var namespacedKey = namespaceUri(key);
		if(namespacedKey != null)
			key = namespacedKey;
		
		if(item.o['xml:lang'] != null)
			key = key += "@" + item.o['xml:lang'];
		
		if(!(key in result)) {
			result[key] = [];
		}
		
		result[key].push(item.o.value);
	}
	
	return result;
}


function isValidUri(str) {
	//return !str.contains('+');
	return str.startsWith("http://");
}


function filterUrisValidate(uris) {
	var result = [];
	
	for(var i = 0; i < uris.length; ++i) {
		var uri = uris[i];
		
		if(isValidUri(uri)) {
			result.push(uri);
		}
	}
	
	return result;
}

function namespaceUri(uri) {
	return namespaceUri(uri, ssb_reverseNamespacePrefixes);
}

function namespaceUri(uri, knownPrefixes)
{
	for (var prefix in knownPrefixes) {
		var namespace = knownPrefixes[prefix];
		
		// FIXME replace with startsWith
		if(uri.substr(0, prefix.length)==prefix) {
			return namespace + ':' + uri.substr(prefix.length);
			break;
		}					
	}
	return null;
}

function notify(title, text)
{
	$.gritter.add({
		title: title,
		text: text,
//		image: image,
//		sticky: false,
	});
}


function fetchStatementsBySubject(service, uris, callback) {		
	
	uris = filterUrisValidate(uris);
	
	if(uris.length == 0) {
		return;
	}
	
	console.log("Fetching statements for (<" + uris.join('> , <') + ">)");	
	var queryString = "Select ?s ?p ?o { ?s ?p ?o . Filter(?s In (<" + uris.join(">,<") + ">)) . }";

	service.executeSelect(queryString, {
		failure: callback.failure,
		success: callback.success	
	});	
};

function fetchStatementsByObject(service, uris, callback) {		
	
	uris = filterUrisValidate(uris);
	
	if(uris.length == 0) {
		return;
	}
	
	console.log("Fetching statements for (<" + uris.join('> , <') + ">)");	
	var queryString = "Select ?s ?p ?o { ?s ?p ?o . Filter(?o In (<" + uris.join(">,<") + ">)) . }";

	service.executeSelect(queryString, {
		failure: callback.failure,
		success: callback.success	
	});	
};



/**
 * Source: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * 
 * @returns {Number}
 */
if(!String.prototype.hashCode) {
	String.prototype.hashCode = function(){
		var hash = 0;
		if (this.length == 0) return hash;
		for (var i = 0; i < this.length; i++) {
			char = this.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};
}


/*
// Not sure if we really need to mimic Java's hashCode/equals stuff. For now it seems I can get
// on without it.
if(!ssb) {
	ssb = {};
}

ssb.hashCode = function(obj) {
	if(!obj) {
		return 0;
	} else {
		obj.hashCode();
	}
};
*/