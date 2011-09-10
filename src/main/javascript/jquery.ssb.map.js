(function($) {

$.widget("ui.ssb_map", {

	// TODO: Add _init method for backward compatibility

	_create: function() {
		var self = this;
		
		var opts = this.options;
		//this.options.event += ".ssbinstances"; // namespace event
		
		
		this.domElement = this.element.get(0);
		
		this.nodeToPos = this.options.nodeToPos;
		this.nodeToFeature = this.options.nodeToFeature;
		this.nodeToLabel = this.options.nodeToLabel;
		this.wayToFeature = this.options.wayToFeature;
		
		this.nodeToType = this.options.nodeToType;
		this.schemaIcons = this.options.schemaIcons;
		
		//console.log(this.nodeToPos);
		//this.mapWidget = new MapWidget(this);
		//this.mapWidget._load();
		//this.tree.logDebug("Dynatree._init(): done.");

		
	    var options = { scales: [50000000, 30000000, 10000000, 5000000],
	    		projection: new OpenLayers.Projection("EPSG:900913"),
	    		displayProjection: new OpenLayers.Projection("EPSG:4326"),
	    		
	    		resolutions: [1.40625,0.703125,0.3515625,0.17578125,0.087890625,0.0439453125],
	            minScale: 50000000,
	            maxResolution: "auto",
	            maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
	            maxScale: 10000000,
	            minResolution: "auto",
	            minExtent: new OpenLayers.Bounds(-1, -1, 1, 1),
	            
	    		numZoomLevels: 19,
	    		units: 'm',

	            
	        	controls: [
	    					new OpenLayers.Control.MouseDefaults(),
//	    					new OpenLayers.Control.LayerSwitcher(),
	    					//new OpenLayers.Control.PanZoomBar(),
	    					new OpenLayers.Control.MousePosition(),
//	        					new OpenLayers.Control.OverviewMap(),
	    					new OpenLayers.Control.ScaleLine(),
	    		],
	    };
		
		this.map = new OpenLayers.Map(this.domElement, options); 

		
		var mapnikLayer = new OpenLayers.Layer.OSM.Mapnik("Mapnik");
		this.markerLayer = new OpenLayers.Layer.Markers("Address", { projection: new OpenLayers.Projection("EPSG:4326"), visibility: true, displayInLayerSwitcher: false });
	    this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer");
	    
	    
		this.map.addLayers([mapnikLayer, this.vectorLayer, this.markerLayer]);

		
		/*
		var size = new OpenLayers.Size(21,25);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		var icon = new OpenLayers.Icon('http://www.openstreetmap.org/openlayers/img/marker.png',size,offset);
		*/

		this.map.setCenter(new OpenLayers.LonLat(12.372966, 51.310228) // Center of the map
	    	.transform(
	    			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
	    			new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
	    	), 15 // Zoom level
		);

		//map.events.register("click"  , map, function(event) { Dispatcher.fireEvent("mapEvent", self.getBound());});
		//this.map.events.register("moveend", this.map, function(event) { Dispatcher.fireEvent("mapEvent", self.getBound());});
		//this.map.events.register("zoomend", this.map, function(event) { Dispatcher.fireEvent("mapEvent", self.getBound());});

		//this.map.events.register("moveend", this, function(event) { this.onMapEvent(event); });
		//this.map.events.register("zoomend", this, function(event) { this.onMapEvent(event); });

		//console.log(self);
		this.map.events.register("moveend", this, function(event) { self._trigger("onMapEvent", event, {"map": self.map}); });
		this.map.events.register("zoomend", this, function(event) { self._trigger("onMapEvent", event, {"map": self.map}); });
		
		this._doBind();
	},

	_doBind: function() {

		var self = this;
		
		/**
		 * For each entry in the nodeToPos map we create a feature
		 */
		$(this.nodeToPos).bind("changed", function(event, change) {
			
			self.nodeToFeature.removeAll(getKeys(change.removed));

			//console.log("pos");
			//console.log(change);
			for(id in change.added) {
				var point = change.added[id];

				point = point.transform(self.map.displayProjection, self.map.projection);
				
				var marker = self.createMarker(point, id);
				self.nodeToFeature.put(id, marker);
			}		
		});

		
		/**
		 * We add all nodeFeatures to the map 
		 */ 
		$(this.nodeToFeature).bind("changed", function(event, change) {
			for(key in change.removed) {
				//console.log("Features removed");
				value = change.removed[key];
				self.markerLayer.removeMarker(value);
				//self.vectorLayer.removeMarker(value);
			}


			for(key in change.added) {
				value = change.added[key];
				self.markerLayer.addMarker(value);
				//self.vectorLayer.addMarker(value);
			}		
		});
			
		
		$(this.wayToFeature).bind("changed", function(event, change) {
			
			for(key in change.removed) {
				//console.log("Features removed");
				value = change.removed[key];
				self.vectorLayer.removeFeatures([value]);
			}


			for(key in change.added) {
				value = change.added[key];
				self.vectorLayer.addFeatures([value]);
				//console.log(value);
			}		

			//self.wayToFeature.put(key, polygonFeature);
		    //self.vectorLayer.addFeatures([polygonFeature]);
			
			
		});
	},
	
	createMarker: function(point, nodeId) {
		
		var iconUrl = this.schemaIcons.get(this.nodeToType.get(nodeId));
		
		if(!iconUrl || iconUrl == "(missing icon)") {
			iconUrl = "http://www.openlayers.org/dev/img/marker.png";
		}
		
		//var tPoint = point.transform(map.displayProjection, map.projection);
		//console.log(tPoint);
		
		var size = new OpenLayers.Size(21, 25);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		var icon = new OpenLayers.Icon(iconUrl, size, offset);

		/*
		markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(0,0),icon));
		*/

		
		var feature = new OpenLayers.Feature(this.markerLayer, point, {icon: icon});
		feature.closeBox = true;
		feature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud,{'panMapIfOutOfView':false, 'autoSize': true});
		feature.data.popupContentHTML = "No content loaded yet";
		feature.data.overflow = "auto";

		var marker = feature.createMarker();

		var self = this;
		var markerClick = function(event) {
			
			self._trigger("onMarkerClick", event, {"nodeId": nodeId});
			
			/*
			for (var i = self.map.popups.length - 1; i >= 0; --i) {
				self.map.popups[i].hide();
			}
			if (this.popup == null) {
				this.popup = this.createPopup(this.closeBox);
				self.map.addPopup(this.popup);
				this.popup.show();
			} else {
				this.popup.toggle();
			}
			
			this.popup.setContentHTML(self.nodeToLabels.get(nodeId));
			
			//loadData(currentPopup, nodeId, xlon, xlat, tags);
			*/
			OpenLayers.Event.stop(evt);
		};
		
		//marker.events.register("mouseover", feature, markerClick);
		//marker.events.register("mouseout", feature, markerClick);
		marker.events.register("click", feature, markerClick);
		 //*/
		
		//markerLayer.addMarker(marker);
		
		return marker;
	},


	getBounds: function() {
		return this.map.getExtent().transform(this.map.projection, this.map.displayProjection);
	}


	/*
	onMapEvent: function(event) {
		$(this.domElement).trigger("onMapEvent", event, this.map);
	}*/
})

})(jQuery);



/*
function MapWidget(widget) {

	this.widget = widget;
	var opts = widget.options;
	
	this.domElement = widget.element.get(0);
		
	this.map     = undefined;
	this.markerLayer = undefined;
	this.vectorLayer = undefined;
	
	
	var self = this;
}
	/*
	this.lastRequestTime = 0;
	this.requestPeriod = 2000; // Minimum period between requests
	*/ 
	/*
	NodeInfo nodeInfo = new NodeInfo();
	nodeInfo.put(id, label, "hello");
	nodeInfo.put(id, type, "something");
	*/


	
	
	


/*		
	
	this.markerScheduler = new Scheduler();
	
	
	this.notificationScheduler = new Scheduler();

	

	//map.events.register("moveend", map, function() { alert("weee"); });
	
	this.processJson = function(data) {
		// We need to add this data to the model,
		// 
		
		this.markerLayer.clearMarkers();
		
		var counter = 0;
		for(var s in data) {

			var point = JsonRdfExtractionUtils.extractPoint(data, s);
			if(point) {
				//point = point.transform(map.displayProjection, map.projection);
				//notify("msg", "" + point.toString());
				++counter;
				createMarker(point, s);
			}			
		}
		
		//notify("Debug", counter + " markers added.");
	};
}











/*
this.onMapEventOld = function(event) {
	
	var extent = map.getExtent().transform(map.projection, map.displayProjection);
	
	var now = new Date().getTime();
	var delay = Math.max(0, this.requestPeriod - (now - this.lastRequestTime));
	//notify("here", "" + this.requestPeriod + " --- " + now + "---" + this.lastRequestTime);

	clearTimeout(this.timeout);
	
	this.timeout = setTimeout(function() {
		self.lastRequestTime = new Date().getTime();
		var queryString = self.backend.createQuery(extent);
		
		//var queryString = "blubb";
		//notify("Info", htmlEncode(queryString));
		
		//content = "Fetching data from DBpedia <img src='loading.gif' /> <br />" + content; 

		//notify("Trace", queryString);

		//self.backend.executeQuery(extent, {
		
		
		/* Fetch labels for result view
		sparqlQuery("http://linkedgeodata.org/sparql", queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {
				self.processJson(JSON.parse(response));
			}	
		});
		* /
		
		self.fetchInstances(extent);
		
		
		sparqlQuery("http://linkedgeodata.org/sparql", queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {
				self.processJson(JSON.parse(response));
			}	
		});
		
	}, delay);
	
};

/*
map.events.on({
	"zoomend": Dispatcher.fireEvent("mapEvent", arguments);
	"moveend": Dispatcher.fireEvent("mapEvent", arguments);
	//"click":  Dispatcher. //this.onMapEvent,
	scope: this
}); */


//$(this.nodeToLabel).bind("changed", function(x, d) { console.log(d); });




//this.graph = rdf.createGraph();


//rdf.graph.onAdd =	

//outer = this;


//this.resultView = $("#results");


/*
this.fetchInstances = function(bound) {
	var queryString = "Select ?s ?o { ?s <http://www.w3.org/2000/01/rdf-schema#label> ?o . ?s geo:geometry ?geo . " + createSparqlFilter("geo", bound) + "}"; 
	//notify("classes", queryString);
	
	sparqlQuery("http://linkedgeodata.org/sparql", queryString, {
		failure: function() { notify("Error", "Sparql Query Failed"); },
		success: function(response) {
			
			var map = jsonRdfResultSetToMap(JSON.parse(response), "s", "o");
			
			var text = "<ul class='dynatree-container'>";
			
			for(var key in map) {
				var value = map[key];
				
				text += "<li><span class='dynatree-node dynatree-has-children dynatree-lastsib dynatree-exp-cl dynatree-ico-c'><a class='dynatree-title' href='#'>" + value + "</a><span></li>";
			}
			
			text += "</ul>";
			
			$("#results").html(text);
			
			
			//Dispatcher.fireEvent("facetsLoaded", map);
			//notify("Debug - wee", JSON.stringify(map));
		}	
	});
	
};	
*/

