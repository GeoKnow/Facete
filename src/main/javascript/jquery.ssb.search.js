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


	function escapeHTML(text)
	{
		return $('<div/>').text(text).html();
	}

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

		var html = "<div>"; // style:'width: 50%'>";

		for(var i = 0; i < items.length; ++i) {
			var item = items[i];
				
			console.log(item);
			
			var clazz = "mybg ssb-container myborder";
			
			var str = "<div id='sr" + i + "' class='" + clazz + "' style='float:left; width:150px; height: 48px;'>";
			
			str += "<b>" + escapeHTML(item.name) + "</b><br /><div style='margin-left:20px;'>" + escapeHTML(item.description) + "</div></li>";
				//str += "<li id='sr" + i + "' class='" + clazz + "'><b>" + item.name + "</b><br /><div style='margin-left:20px;'>" + item.description + "</div></li>";
				
			
			str += "</div>";
				
			html += str;
				/*
				onmouseout=\"
					$(this).removeClass('highlight');
				\"
				onclick=\"
					center=new OpenLayers.LonLat($lon, $lat).transform(map.displayProjection,map.projection);
					map.setCenter(center, $zoom);
					mapEvent(1);
				\"
				onmouseover=\"
					$(this).addClass('highlight');
				\"
			
			*/
		}
		
		html += "<a id='searchResultsToggle' href='#'>hide</a>";

		html += "</div>";
		
		$(this.domElement).html(html);
		
		$("#searchResultsToggle").click(function() {
			$("#searchResults").slideUp("slow");
		});
		
		var self = this;		
		var zoom = 15;
		for(var i = 0; i < items.length; ++i) {
			
			$("#sr" + i).click((function(item) {
				
				return function() {
					console.log(self);
					//console.log(item);
					//notify("Info", "Selected (" + item.lat + ", " + item.lon + ")");
					center=item.lonlat.transform(self.map.displayProjection, self.map.projection);
					self.map.setCenter(center, zoom);
				};
			})(items[i])
			);
		}
		
	}
});

})(jQuery);
