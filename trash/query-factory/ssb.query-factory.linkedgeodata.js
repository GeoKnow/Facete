function LinkedGeoDataQueryFactory() {
	//this.options = options;
	this.classFilter = null;
}

LinkedGeoDataQueryFactory.prototype = {

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
	 * Must return columns ?w ?g
	 */
	createWayGeometriesQuery: function(bounds) {
		var result = "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?w ?g { ?w ?p ?g ; lgdo:hasNodes ?wn . ?wn ?x ?n . Filter(?p = georss:polygon || ?p = georss:linestring) . { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } }";

		
		//console.log(result);
		//return "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?w ?g { ?w ?p ?g . ?w lgdo:hasNodes ?wn . Filter(?p = georss:polygon || ?p = georss:linestring) . { Select ?wn { ?wn ?x ?n . { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } } } }";
		//return "Select * { ?w <http://www.georss.org/georss/polygon> ?g . } Limit 1";		
		//return "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?w ?g { ?w ?p ?g ; lgdo:hasNodes ?wn . ?wn ?x ?n . Filter(?p = georss:polygon || ?p = georss:linestring) . ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "}";
	
		return result;
	},
	

	createNodesQuery: function(bounds) {
		if(this.classFilter == null) {
			return "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?n ?g ?t ?l { ?n a lgdo:Node . ?n rdfs:label ?l . ?n lgdo:directType ?t . ?n geo:geometry ?g . { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } }";
		}
		
		var uris = this.classFilter.toArray();
		
		return (uris.length == 0)
			? "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?n ?g ?t ?l { ?n a lgdo:Node . ?n rdfs:label ?l . ?n lgdo:directType ?t . ?n geo:geometry ?g . { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } }"
			: "Prefix lgdo:<http://linkedgeodata.org/ontology/> Prefix georss:<http://www.georss.org/georss/> Select ?n ?g ?t ?l { ?n a lgdo:Node . ?n rdfs:label ?l . ?n lgdo:directType ?t . ?n geo:geometry ?g . { Select Distinct ?n { ?n rdf:type ?ts { Select ?n { ?n geo:geometry ?geo . " + createSparqlFilter("geo", bounds) + "} } " + this.createClassFilter("ts") + "} } }";		
	}
};
