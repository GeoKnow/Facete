/**
 * Generic QueryFactory for wgs84 lat/long
 * 
 * @param options
 * @returns {LinkedGeoDataQueryFactory}
 */
function QueryFactoryWgs84() {
	//this.options = options;
	this.classFilter = null;
	this.languageFilter = null;
}

QueryFactoryWgs84.prototype = {

	createClassFilter: function(varName) {
		if(!this.classFilter) {
			return "";
		}
		
		var uris = this.classFilter.toArray();

		return uris.length == 0 ? "" : "Filter(?" + varName + " In (<" + uris.join(">,<") + ">)) . ";
	},

	setClassFilter: function(classFilter) {
		this.classFilter = classFilter;
	},


	/**
	 * Not supported
	 */
	createWayGeometriesQuery: function(bounds) {
		return null;
	},
	
	createNodeCountQuery: function(bounds) {
		var uris = this.classFilter ? this.classFilter.toArray() : [];

		return "Select Count(*) As ?c { { Select Distinct ?n { ?n a ?t ; geo:long ?x ; geo:lat ?y . " +  createBBoxFilterWgs84("x", "y", bounds) + this.createClassFilter("t", uris) + " } Limit 1000 } }";
	},

	/*
	createInstanceQuery: function() {
		var uris = this.classFilter ? this.classFilter.toArray() : [];
		
		return "Select ?n{
	},*/
	
	createNodesQuery: function(bounds) {
		var uris = this.classFilter ? this.classFilter.toArray() : [];
		
		//return "Prefix geo:<http://www.w3.org/2003/01/geo/wgs84_pos#> Select ?n ?t ?l ?x ?y { ?n a ?t . ?n rdfs:label ?l . ?n geo:long ?x . ?n geo:lat ?y ." + createBBoxFilterWgs84("x", "y", bounds) + this.createClassFilter("t", uris) + "}";
		return "Prefix geo:<http://www.w3.org/2003/01/geo/wgs84_pos#> Select ?n ?x ?y { ?n a ?t ; geo:long ?x ; geo:lat ?y ." + createBBoxFilterWgs84("x", "y", bounds) + this.createClassFilter("t", uris) + "}";
	},
	
	createNodeTypesQuery: function(bounds) {
		var uris = this.classFilter ? this.classFilter.toArray() : [];
		
		return "Prefix geo:<http://www.w3.org/2003/01/geo/wgs84_pos#> Select ?n ?t { ?n a ?t ; geo:long ?x ; geo:lat ?y ." + createBBoxFilterWgs84("x", "y", bounds) + this.createClassFilter("t", uris) + "}";
	},
	
	createNodeLabelsQuery: function(bounds) {
		var uris = this.classFilter ? this.classFilter.toArray() : [];
		
		return "Prefix geo:<http://www.w3.org/2003/01/geo/wgs84_pos#> Select ?n ?l { ?n a ?t ; rdfs:label ?l ; geo:long ?x ; geo:lat ?y ." + createBBoxFilterWgs84("x", "y", bounds) + this.createClassFilter("t", uris) + "}"; //createLanguageFilter(this.language) + "}";		
	}
};
