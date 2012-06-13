/**
 * Copyright (C) 2011, MOLE research group at AKSW,
 * University of Leipzig
 *
 * SpatialSemanticBrowsingWidgets is free software; you can redistribute
 * it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * SpatialSemanticBrowsingWidgets is distributed in the hope that it will
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
(function($) {

	  function escapeHTML(text) {
		  
		    return !text ? "" : text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		  }


	  /*
	function escapeHTML(text)
	{
		return $('<div/>').text(text).html();
	}
	*l

/**
 * Ideally, when its done, it should look like this:
 * 
 * |-----------------|----------
 * |  1  |  2 |...   |         |
 * |-----------------|   map   |
 * |                 | preview |
 * |-----------------|---------|
 * 
 * 
 */
$.widget("ui.ssb_search", {

	// TODO: Add _init method for backward compatibility
	
	_create: function() {

		this.domElement = this.element.get(0);
		this.map = this.options.map;
		
		var self = this;

		/*
		$(this.instanceToLabel).bind("changed", function(event, change) {
			self.repaintScheduler.schedule(function() { self.onDataChange(change); });
		});*/
	},

	
	/**
	 * An array of items, having the attributes:
	 * name, description, lonlat: OpenLayers.Lonlat
	 * 
	 * @param items
	 */
	setItems: function(items) {

		var html = "<ul>",
			item = 0,
			len = items.length;

		for(var i = 0; i < len; ++i) {
			item = items[i];
			html += "<li id='sr" + i + "' style='cursor:pointer;'>" + 
						"<div class=\"searchResults-item-name\">" + escapeHTML(item.name) + "</div>" + 
						"<div class=\"searchResults-item-description\">" + escapeHTML(item.description) + "</div>" + 
					"</li>";
		}

		html += "</ul>";
		
		$(this.domElement).html(html);
		
		$("#searchResultsToggle").click(function() {
			$("#searchResults").slideUp("slow");
		});
	
		// Add the click events
		var self = this;		
		var zoom = 15;
		for(var i = 0; i < items.length; ++i) {
			
			$("#sr" + i).click((function(item) {
				
				return function() {
					//console.log(item);
					//notify("Info", "Selected (" + item.lat + ", " + item.lon + ")");
					/*
					console.log("Hello:");
					console.log(item);
					console.log(self.map.displayProjection);
					console.log(self.map.projection);
					 */
					var center=item.lonlat.clone().transform(self.map.displayProjection, self.map.projection);
					//console.log(center);
					self.map.setCenter(center, zoom, true, true);
					//self.map.
				};
			})(items[i])
			);
		}
		
	}
});

})(jQuery);
