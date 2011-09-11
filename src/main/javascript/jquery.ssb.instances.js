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
		
		this.repaintScheduler = new Scheduler();
		
		this.instanceToLabel = this.options.instanceToLabel;
		this.instanceToType  = this.options.instanceToType;
		this.schemaIcons = this.options.schemaIcons;	

		
		var self = this;
		
		$(this.instanceToLabel).bind("changed", function(event, change) {
			self.repaintScheduler.schedule(function() { self.onDataChange(change); });
		});
	},

	onDataChange: function(change) {
		//notify("data", "changed");
		//var map = jsonRdfResultSetToMap(JSON.parse(response), "s", "o");
		
		var text = "<ul class='dynatree-container'>";
		var map = this.instanceToLabel.entries;
		
		var i = 0;
		for(var key in map) {
			++i;
			
			var value = map[key];
			
			var img = "";
				
			var icon = this.schemaIcons.get(this.instanceToType.get(key));
			if(icon) {
				img = "<img alt='' src='" + icon + "'> ";
			}
			
			//TODO fire event when clicked
			text += "<li><span class='dynatree-node dynatree-has-children dynatree-lastsib dynatree-exp-cl dynatree-ico-c'><a class='dynatree-title' href='#'>" + i + ": " + img + value + "</a><span></li>";
		}
		
		text += "</ul>";
		
		$(this.domElement).html(text);
	}
})

})(jQuery);
