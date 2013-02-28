(function($, _) {

var widgets = Namespace("org.aksw.ssb.widgets");
	
(function(ns) {

	ns.MapView = Backbone.View.extend({
	    tagName: 'div',
	    attributes: {style: 'float: left'},
	    events: { 
//	      'click span.swap':  'swap',
//	      'click span.delete': 'remove'
	    },    
	    initialize: function() {
	      _.bindAll(this, 'updateView', 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	      this.model.on('change:uris change:json', this.updateView, this);
	      //var itemCollection = this.model.get("resources");
	      // TODO Add support for updates when modifying the resource data
	      //var graphModel = this.model.get("resources");
	      
	      //itemCollection.on('add', this.addItem, this);
	      //itemCollection.on('remove', this.removeItem, this);
	    },
	    render: function() {

	    	// Create the old map widget (this call returns a domElement)
	      this.$el.ssb_map2();
	      
	      // Get the actual widget (not the domElement, but the object)
	      this.legacyWidget = this.$el.data("ssb_map2");
	      
	      // Extract the map
	      this.map = this.legacyWidget.map;
	      var self = this;
	      
			this.map.events.register("moveend", this, function(event) {
				self.trigger("mapevent", event, {"map": self.map});
			});
			
			this.map.events.register("zoomend", this, function(event) {
				self.trigger("mapevent", event, {"map": self.map});
			});
			
			$(this.el).on("ssb_mapmarkerclick", function(ev, data) {
				self.trigger("markerclick", ev, data);
			});
			    
	      return this;
	    },
	    unrender: function() {
	      $(this.el).remove();
	    },
	    
	    remove: function(){
	      this.model.destroy();
	    },
	    
	    
	    updateView: function(model) {
	    	var self = this;
	    	
	    	var oldUris = model.previous("uris");
	    	var newUris = model.get("uris");
	    	
	    	var addedUris = _.difference(newUris, oldUris);
	    	var removedUris = _.difference(oldUris, newUris);
			//console.log("[MapView::updateView@addedUris]", addedUris);
			//console.log("[MapView::updateView@removedUris]", removedUris);
	    	
			//debugger;
			
	    	var json = model.get("json");
	    	var rdfGraph = new RdfGraph(json);
	    	
	    	self.legacyWidget.removeItems(removedUris);
	    	
	    	// For all addedUris, extract the geometric information
	    	for(var i = 0; i < addedUris.length; ++i) {
	    		var uri = addedUris[i];
	    		
	    		var lons = rdfGraph.getFloats(uri, "http://www.w3.org/2003/01/geo/wgs84_pos#long");
	    		var lats = rdfGraph.getFloats(uri, "http://www.w3.org/2003/01/geo/wgs84_pos#lat");
	    		
	    		
	    		//var tmp = json[uri];
	    		var jsonClone = _.clone(json);

	    		var attributes = {
	    				id: uri,
	    				json: jsonClone
	    		}
	    		
	    		var labels = rdfGraph.getStrings(uri, "http://www.w3.org/2000/01/rdf-schema#label", ["en", "de", ""]);
	    		if(labels.length > 0) {
	    			attributes["label"] = labels[0];
	    		} else {
	    			attributes["label"] = "";
	    		}
	    		
	    			
	    		if(lats.length == 1 && lons.length == 1) {
	    			var lon = lons[0];
	    			var lat = lats[0];
	    			
	    			var lonlat = new OpenLayers.LonLat(lon, lat);
	    			
	    			//console.log("Created marker at ", lon, lat, uri);
	    			self.legacyWidget.addItem(uri, lonlat, attributes, true);
	    		}
	    	}
	    },
	});
	
})(widgets);
})(jQuery, _);

