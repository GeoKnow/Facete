	/**
	 * Currently hard wired configuration of the facets for the financial transparency system
	 *
	 * TODO This method gets called multiple times by some widgets, should be avoided
	 */
	function createAppConfig() {

		var concept = config.concept;
		var pathManager = null;

		//console.log("Config is", config);

		
		var fallbackDriver = null;
		
		var concept = config.concept ? config.concept : fallbackDriver;
		var geoPath = config.geoPath ? config.geoPath : new facets.Path();
		var navigationPath = config.navigationPath ? config.navigationPath : new facets.Path();

		
		if(config.query || config.variable) {
			// The query string is assumed to be a SELECT query. Surround with {} to
			// turn it into a SPARQL element.
			var queryString = "{ " + config.query + " }";
			
			var vName = config.variable;
			var v = sparql.Node.v(vName);
			

			//var query = new sparql.Query();
			//query.elements.push(new sparql.ElementString(queryString, [v]));
			//query.projectVars.add(v);
			
			var conceptElement = new sparql.ElementString(queryString, [v]);
			concept = new facets.ConceptInt(conceptElement, v);
			pathManager = new facets.PathManager(vName); 
			
			
			navigationPath = new facets.Path();
			geoPath = new facets.Path();
		}
		
		
		var factory = new facets.ConstraintWgs84.Factory(geoPath);//breadcrumbX, breadcrumbY);
		
		var bounds = new qt.Bounds(0, 1, 2, 4);
		var c2 = factory.create(bounds);
	
		var facetbox = Namespace("org.aksw.ssb.widgets.facetbox");
		
		var constraints = new facets.ConstraintCollection();
	
		var result = {
			queryGenerator: {
				concept: concept,
				//conceptVar: s,
				navigationPath: navigationPath,
				pathManager: pathManager,
				geoConstraintFactory: factory,
				constraints: constraints
			}, 
			config: config
		};
		
		return result;
	}
	
	var checkNotNull = function(obj) {
		if(obj) {
			return obj;
		}
		
		throw "Object must not be null";
	};

	
	/**
	 * Clamp a value to a certain range
	 * 
	 * @param val
	 * @param min
	 * @param max
	 * @returns
	 */
	function clamp(val, min, max) {
		return Math.max(min, Math.min(max, val));
	}
	
	/**
	 * Check for SVG support
	 * 
	 * Source: http://stackoverflow.com/questions/654112/how-do-you-detect-support-for-vml-or-svg-in-a-browser
	 * @returns true if SVG Shapes are supported.
	 */
	function supportsSvg() {
	    //var result = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.0");
	    var result = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
	    //var result = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
	    
	    return result;
	}


	/**
	 * Add an .endsWith method to the prototype of String.
	 * TODO Include underscore.string
	 * 
	 * http://stackoverflow.com/questions/280634/endswith-in-javascript
	 * 
	 */
/*
	if (!String.prototype.hasOwnProperty("endsWith")) {
	    String.prototype.endsWith = function(suffix) {
	        return this.indexOf(suffix, this.length - suffix.length) !== -1;
	    };
	}

	if (!String.prototype.hasOwnProperty("startsWith")) {
		String.prototype.startsWith = function(prefix) {
			return this.indexOf(prefix) == 0;
		};
	}
*/
	

/**
 * TODO Not sure if we need this class, or whether we could reuse something
 * The requirements are:
 * Take an ajax request, and while the request is running, queue only the most recet successing request.
 * 
 */
var SchedulerDeferred = function(timeout) {
	this.timeout = timeout ? timeout : 1000;
};


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
var Scheduler = function(requestPeriod) {
	this.lastRequestTime = 0;
	this.requestPeriod = requestPeriod ? requestPeriod : 2000; // Minimum period between requests 
};

Scheduler.prototype.schedule = function(callback) {
	var now = new Date().getTime();
	var delay = Math.max(0, this.requestPeriod - (now - this.lastRequestTime));

	clearTimeout(this.timeout);

	var outer = this;
	
	this.timeout = setTimeout(function() {
		outer.lastRequestTime = new Date().getTime();
		callback();
	}, delay);
};

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
		text: text
//		image: image,
//		sticky: false,
	});
}



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
			var ch = this.charCodeAt(i);
			hash = ((hash<<5)-hash)+ch;
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