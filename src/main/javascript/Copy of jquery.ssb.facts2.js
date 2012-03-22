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

function set () {

	var result = {};

	for (var i = 0; i < arguments.length; i++) {
		result[arguments[i]] = true;
	}

	return result;
}

function firstTagValue(tags, key) {
	return key in tags ? tags[key][0] : "";
}

function renderNode(id, tags) {

	
	var ret = "";	
	
	ret += '<b>'+ firstTagValue(tags, 'rdfs:label') + '</b>';		
	ret += "<br />";

	ret += "<a href='" + id + "' target='_blank'>" + id + "</a><br />";
	ret += "<hr />";

	//ret += "<a href='http://openstreetmap.org/edit?editor=potlatch&lat=" + xlat + "&lon=" + xlon + "&zoom=18&node=" + id + "' target='_blank'>Edit on OpenStreetMap</a><br />";

	
	var header = "";
	
	var depiction = firstTagValue(tags, 'foaf:depiction');
	if(depiction != "") {
		header += "<img style='float:right; width:128px; height:128px; margin: 5px' src = '" + depiction + "' />";
	}
	
	
	var abstractEn = firstTagValue(tags,'dbpedia:ontology/abstract@en');
	if(abstractEn != "") {
		header += "<p style='margin:5px'>" + abstractEn + "</p>";
	}

	
	ret += header;
	ret += "<p style='clear:right;' />";
	
	if(depiction || abstractEn) {
		ret += "<hr />";
	}
	
	var ignoredTags = set('rdfs:label', 'description', 'image', 'source_ref');
	
	ret += "<table>";
	
	for(var key in tags) {
		if(key in ignoredTags) {
			continue;
		}
		
		var values = key in tags ? tags[key] : [];
		
		for(var j = 0; j < values.length; ++j) {
			var value = values[j];
			
			if(value.startsWith("http://")) {
				value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
			}
			
			
			ret += "<tr>";
			
			ret += "<td>" + key + "</td><td>" + value + "</td>";
			
			ret += "</tr>";
		}
	}

	ret+="</table>";
	
	
	return ret;
}

	
	

$.widget("ui.ssb_facts", {
	
	_create: function() {
		this.jsonRdfs = [];

		this.domElement = this.element.get(0);

		//this.repaintScheduler = new Scheduler();

		/*
		
		this.instanceToLabel = this.options.instanceToLabel;
		this.instanceToType  = this.options.instanceToType;
		this.schemaIcons = this.options.schemaIcons;	
		*/

		
		var self = this;
		
		/*
		$(this.instanceToLabel).bind("changed", function(event, change) {
			self.repaintScheduler.schedule(function() { self.onDataChange(change); });
		});*/
	},
	
	getAllKeys: function(array) {
		var result = {};
		
		for(var i in array) {
			var o = array[i];
			
			if(o) {
				var keys = _.keys(o);
				
				for(var j in keys) {
					var key = keys[j];
					
					result[key] = true;
				}
			}
		} 
		
		return result;
	},
	
	
	/**
	 * Set the data to be displayed.
	 * Binding is an array of 'columnName->rdfTerm' mappings, as returned by RdfQuery
	 * The projection parameter is optional specifies which columns to display in which order.
	 * If it is omitted, the bindings are scanned first.
	 * 
	 * [
	 *   {
	 *     'book': { type: 'uri', value: 'http://example.com/aReallyGreatBook' },
	 *      'author': { type: 'bnode', value: '_:creator' }
	 *   }
	 * ]
	 * 
	 * @param binding
	 * @param projection
	 */
	setData: function(binding, projection) {
		
		if(!projection) {
			var map = getAllKeys(binding);
			projection = _.keys(map);
		}
		
		//notify("data", "changed");
		//var map = jsonRdfResultSetToMap(JSON.parse(response), "s", "o");
		
		var html = "";
			
		html += "<a id='factsToggle' href='#'>hide</a>";
		html += "<hr />";

		html += "<div class='ssb-container'>";
		
		var tags = extractTagsMulti(jsonRdfs);
		
		html += renderNode(subject, tags);


		html += "</div>";
		
		$(this.domElement).html(html);
		
		var self = this;
		$("#factsToggle").click(function() {
			$(self.domElement).slideUp("slow");
		});
	}
});

})(jQuery);

