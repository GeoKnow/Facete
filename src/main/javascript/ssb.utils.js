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

function toQuadTreeBounds(bounds) {
	return new Bounds(bounds.left, bounds.right, bounds.bottom, bounds.top);
}


function mergeMapsInPlace(a, b) {
	for(k in b) {
		a[k] = b[k];
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
	return !str.contains('+');
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

	//var self = this;
	//alert(queryString);
	service.executeSelect(queryString, {
		failure: function() { notify("Error", "Sparql Query Failed"); },
		success: function(response) {

			
			callback(response);
		}	
	});	
};

