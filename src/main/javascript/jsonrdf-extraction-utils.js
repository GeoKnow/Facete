var JsonRdfExtractionUtils = {
	
	extractPoints: function(str) {
		var values = str.split(/\s+/g);
		/*
		if(values.length % 2 != 0) {
			return null;
		}*/
		//var n = values.length / 2;
		
		var points = [];
		for(var i = 0; i < values.length; i+=2) {
			var y = parseFloat(values[i]);
			var x = parseFloat(values[i + 1]);
			
			//console.log("point(" + x + ", " + y + ")");
			
			var p = new OpenLayers.Geometry.Point(x, y);
			points.push(p);
		}

		return points;
	},
		
	extractPolygon: function(data, subject) {
		var str = this.extractFirstValue(data, subject, "http://www.georss.org/georss/polygon");

		var points = extractPoints(str);
		
	    // create a polygon feature from a list of points
	    var linearRing = new OpenLayers.Geometry.LinearRing(points);
	    
	    
	    var polygonFeature = new OpenLayers.Feature.Vector(linearRing, null, style_green);

	    return polygonFeature;
	    /*
	    vectorLayer.addFeatures([polygonFeature]);
	    */
	},

	
	parsePoint: function(str) {
		if(str.toLowerCase().trim().startsWith("point")) {
			var start = str.indexOf("(");
			var end   = str.indexOf(")");
			
			if(start == -1 || end == -1) {
				return;
			}
			
			var tmp = str.substring(start + 1, end).trim();
			var parts = tmp.split(" ");
			
			if(parts.length != 2) {
				return;
			}
			
			var x = +(parts[0]);
			var y = +(parts[1]);
			
			return new OpenLayers.LonLat(x, y);
		}
	},

	/**
	 * Extracts the coordinates of the point from a triple of the form 
	 * 
	 * ?s <http://www.w3.org/2003/01/geo/wgs84_pos#geometry"> "POINT(1 2)" .
	 * 
	 * 
	 * @param data
	 * @param subject
	 * @returns {OpenLayers.LonLat}
	 */
	extractPoint: function(data, subject) {
		var str = this.extractFirstValue(data, subject, "http://www.w3.org/2003/01/geo/wgs84_pos#geometry");
		
		if(str) {
			return parsePoint(str);
		}
	},

	extractPoint2: function(data, subject) {
		var x = this.extractFirstValue(data, subject, "http://www.w3.org/2003/01/geo/wgs84_pos#long");
		var y = this.extractFirstValue(data, subject, "http://www.w3.org/2003/01/geo/wgs84_pos#lat");
		
		return (x && y) ? new OpenLayers.LonLat(x, y) : null;
	},

	extractFirstValue: function(data, subject, predicate) {
		var ts = data[subject];
	
		return (predicate in ts) ? ts[predicate][0]["value"] : null;
	}

};

