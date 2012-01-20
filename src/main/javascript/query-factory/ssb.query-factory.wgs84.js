/**
 * Generic QueryFactory for wgs84 lat/long
 * 
 * @param options
 * @returns {LinkedGeoDataQueryFactory}
 */
function QueryFactoryGeneric(options) {
	this.options = options;
}

QueryFactoryGeneric.prototype = {

	/**
	 * 
	 * 
	 * @param varName
	 * @param uris
	 * @returns
	 */
	createClassFilter: function(varName, uris) {
		if(uris.length == 0) {
			return "";
		}
		
		// TODO For each uri create Filter(?x = foo Or ?x = bar Or ...)
		
		return "Filter(?" + varName + " In (<" + uris.join(">,<") + ">)) . ";
	},


	/**
	 * Not supported
	 */
	createWayGeometriesQuery: function(bounds) {
		return null;
	},
	

	createNodesQuery: function(bounds) {
		var uris = this.options.classFilter.toArray();
		
		return "\
			Prefix wgs:<http://www.w3.org/2003/01/geo/wgs84_pos#>\
			Select ?n ?t ?l ?lat ?lon {\
				?n a ?t .\
				?n rdfs:label ?l .\
				?n wgs84:lat ?lat .\
				?n wgs84:long ?lon ." + 
				this.createClassFilter("t", uris) +
				"\
		}";					
	}
};
