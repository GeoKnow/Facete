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


$.widget("ui.ssb_instances", {

	// TODO: Add _init method for backward compatibility
	
	_create: function() {

		this.domElement = this.element.get(0);
		
		//this.repaintScheduler = new Scheduler();
		
		this.instanceToLabel = this.options.instanceToLabel;
		this.instanceToType  = this.options.instanceToType;
		this.schemaIcons = this.options.schemaIcons;	

		
		var self = this;
		
		/*
		$(this.instanceToLabel).bind("changed", function(event, change) {
			self.repaintScheduler.schedule(function() { self.onDataChange(change); });
		});*/
	},

	onDataChange: function(change) {
		this.refresh();
	},
	
	
	refresh: function() {
		//notify("data", "changed");
		//var map = jsonRdfResultSetToMap(JSON.parse(response), "s", "o");
		
		var text = "<ul class='ssb-container'>";
		var map = this.instanceToLabel.entries;
		
		var order = _.keys(map).sort(function(a, b) { return alphabetical(map[a], map[b]); } );

		var self = this;

		var i = 0;
		for(var index in order) {
			++i;

			var key = order[index];
			
			var value = map[key];
			
			var img = "";
				
			var icon = this.schemaIcons.get(this.instanceToType.get(key));
			if(icon && icon != "(missing icon)") { // FIXME The special case should not occur, but does right now
				img = "<img alt='' src='" + icon + "'> ";
			}
			
			var id = "inst" + i;
			
			text += "<li><span class=''><a id='" + id + "' class='' href='#'>" + i + ": " + img + value + "</a><span></li>";
		}
		
		text += "</ul>";
		
		$(this.domElement).html(text);

		// Add the events
		i = 0;
		for(var key in map) {
			++i;

			var id = "inst" + i;
		
			var selector = "#" + id; 
			
			$(selector).click(function(i, key) {
				return function (event) {
					self._trigger("click", event, {"key": key});
				};				
			}(i, key));
			
			$(selector).hover(
					function(i, key) {
						return function (event) {
							self._trigger("hover", event, {"key": key});
						};				
					}(i, key),
					function(i, key) {
						return function (event) {
							self._trigger("unhover", event, {"key": key});
						};				
					}(i, key)
			);
			
		}

	}
});

})(jQuery);


function alphabetical(a, b)
{
     var A = a === undefined ? a : a.toLowerCase();
     var B = b === undefined ? b : b.toLowerCase();
     if (A < B){
        return -1;
     }else if (A > B){
       return  1;
     }else{
       return 0;
     }
}