/**
 * A browse box:
 * 
 * | Srch: foo
 * |--------------|
 * | Clss1 -------|
 * | e1 | e2 | e3 |
 * |--------------|
 * |              |
 * |--------------|
 * 
 * 
 * div data-ssb-endpoint="" data-ssb-query="Select ?
 * 
 * 
 * Input:
 * InstanceId, Type, 
 * 
 */
(function($) {

	
$.widget("ui.ssb_browsebox", {
	
	_create: function() {

		this.domElement = this.element.get(0);

		this.render();
	},
	
	render: function() {
		
		var ssb = $.ssb;
		
		var q = new ssb.Query();
		var s = ssb.Node.v("s");
		var p = ssb.Node.v("p");
		var o = ssb.Node.v("o");

		var b = ssb.Node.v("b");
		var i = ssb.Node.v("i");
		var c = ssb.Node.v("c");
		var x = ssb.Node.v("x");
		var y = ssb.Node.v("y");

		var a = ssb.Node.uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
		var sameAs = ssb.Node.uri("http://www.w3.org/2002/07/owl#sameAs");
		
		var fintransNs = "http://fintrans.publicdata.eu/ec/ontology/";
		var subvention = ssb.Node.uri(fintransNs + "Subvention");
		var beneficiary = ssb.Node.uri(fintransNs + "beneficiary");
		var city = ssb.Node.uri(fintransNs + "city");
		var long = ssb.Node.uri("http://www.w3.org/2003/01/geo/wgs84_pos#long");
		var lat = ssb.Node.uri("http://www.w3.org/2003/01/geo/wgs84_pos#lat");

		var geoRelated = ssb.Node.uri(fintransNs + "geoRelated");
		//var beneficiary = Node.uri(fintransNs + "beneficiary");
		
		//var template = new ssb.Template(new ssb.BasicPattern([new ssb.Triple(s, p, o)]));
		
		
		var testElement = new ssb.ElementTriplesBlock([
		                      				new ssb.Triple(s, a, subvention)
		                      				]);

		var testTemplate = new ssb.Template(new ssb.BasicPattern([
  				new ssb.Triple(s, a, subvention)
  				]));
		
		// Geo Facet:
		//{
			var element = new ssb.ElementTriplesBlock([
			                                           new ssb.Triple(s, beneficiary, b),
			                                           new ssb.Triple(b, city, i),
			                                           new ssb.Triple(i, sameAs, c),
			                                           new ssb.Triple(c, long, x),
			                                           new ssb.Triple(c, lat, y),
			                                           ]);
			
			var construct = new ssb.BasicPattern([
			                                      new ssb.Triple(s, geoRelated, c),
			                                      new ssb.Triple(c, long, x),
			                                      new ssb.Triple(c, lat, y),
			                                      ]);

			q.constructTemplate = new ssb.Template(construct);
			q.elements.push(element);

			//q.constructTemplate = testTemplate;
			//q.elements.push(testElement);
		
			//var geoFacet = new ssb.Facet("geo", s, [c, x, y], construct, element);
		//}
		
		//$.ssb.facets.FacetManager

		var driver = new ssb.ElementTriplesBlock([new ssb.Triple(s, a, subvention)]);
		var fm = new ssb.facets.FacetManager(s, driver);


		//q.type = ssb.QueryType.Construct;
		
		
		//q.constructTemplate = template;
		//q.elements.push(ts);
		
		
		//console.log("My built query is: " + q);
		
		q = fm.createQueryLoadDefaults();
		
		
		
		
		var sparqlService = new VirtuosoSparqlService(ssbconf.endpoint, ssbconf.models);
		sparqlService.executeSelect(q.toString(), {
			success: function(json) { /*console.log("test", json);*/ }
		}
		);
		
		
		
		
		/*
		 * 
		 * 
		 */
		
		
		/*
		q.elements.push(t);
		q.elements.push(new ssb.ElementFilter(new ssb.E_Equals(p, p)));
		*/

		
		
		
		
		//$(this.domElement).html("<b>Here</b>");
	}


});

})(jQuery);


/*
(function($) {
	
	var ns = {};
	
	ns.FacetManager = function() {
		
	};
	
	ns.FacetManager
	
	
	ns.Facet = function(id, property) {
		
	};
	
})(jQuery);
*/



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
