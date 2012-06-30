



/**
 * Constructs query for a given rectangular area.
 * 
 * 
 * @param queryHeader
 * @param queryFooter
 * @returns
 */
function SparqlInstanceBackend(queryHeader, queryFooter, geoVarName)
{
	this.queryHeader = queryHeader;
	this.queryFooter = queryFooter;

	
	function getDistance(a, b) {
		// compute the distance
		d = 6367 * Math.arccos(Math.sin(a.lat) * Math.sin(b.lat) + Math.cos(a.lat) * Math.cos(b.lat) * Math.cos(b.lon - a.lon));
		return d;
	}

	
	this.createQuery = function(rect) {
		
		var d1 = getDistance(rect.lowerLeft, rect.upperRight);
		var d2 = getDistance(rect.upperLeft, rect.lowerRight);
		var d = Math.max(d1, d2);
		var c = rect.center;
		
		return queryHeader + "Filter(bif:st_intersects (?" + geoVarName + ", bif:st_point(" + c.x ", " + c.y + "), " + d + "))";
	}
}



/*
var sparqler = new SPARQL.Service("dbpedia_sparql_proxy.php");
		sparqler.addDefaultGraph("http://dbpedia.org");

		var query = sparqler.createQuery();
		
		$("#dbpedia").html("Fetching data from DBpedia <img src='loading.gif' />"); 

		var queryString = "SELECT * {<" + tags.dbpedia + "> ?p ?o} Limit 10";

		query.query(queryString,
				{ failure: sparqlFailure, success: sparqlSuccess });

		ret += query.queryUrl();
	}
	else
		ret += "Resource = " + tags;  
*/
	
	
