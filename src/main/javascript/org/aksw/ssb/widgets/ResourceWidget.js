/**
 * A widget for displaying/browsing a set of resources.
 * 
 * 
 * 
 */
(function($) {

	var stringUtils = Namespace("org.aksw.ssb.utils.strings");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var talisJsonUtils = Namespace("org.aksw.ssb.utils.talis-json");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var rdfAuthor = Namespace("org.aksw.ssb.plugins.RDFauthor");

	
	var ns = Namespace("org.aksw.ssb.widgets"); 
	
	/* TODO Not sure if the describer wrapper makes sense - we might need more
	 * flexibility (see OntoWiki, which essentially allows you to switch between select and construct queries)
	 * so that the sparqlService itself is required
	ns.DescriberSparql = function(sparqlService) {
		this.sparqlService = sparqlService;
	};
	
	ns.DescriberSparql.prototype.describe = function(nodes, callback) {
		return queryUtils.createDescribeQuery(nodes, callback);
	};
	*/
	
	ns.executeDescribe = function(sparqlService, nodes, callback) {
		var query = queryUtils.createDescribeQueryNodes(nodes);
		var promise = sparqlService.executeConstruct(query.toString(), callback);
		return promise;
	};

	

	ns.createResourceWidget = function(sparqlService, nodes) {
		if(!nodes) {
			nodes = [];
		}
		
		//var describer = new ns.DescriberSparql(sparqlService);
		
		// Properties which should be displayed by default
		var shortSummaryProperties = [];		
		
		var result = $$(
				{sparqlService: sparqlService, nodes: []},
				'<div></div>',
				{
					create: function() {
					},
				
					refresh: function() {
					},
					
					setNodes: function(nodes) {
						var self = this;
						//console.log("setNodes called");
						
						var sparqlService = this.model.get('sparqlService');
						ns.executeDescribe(sparqlService, nodes, function(talisJson) {
							//console.log("Describe callback called", talisJson);
							
							var uris = ns.collectUris(talisJson);							
							var uriStrs = _.keys(uris);
							
							var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
							labelFetcher.fetch(uriStrs, false, function(uriToLabel) {
								var html = ns.generateHtml(talisJson, uriToLabel);
								self.view.$().html(html);
								
								rdfAuthor.populateRDFauthor(talisJson);
								RDFauthor.setOptions({useSPARQL11: true, viewOptions:{type: "popover"}});

											RDFauthor.start();

							});
						});						
					}
				});

		
		return result;
	};
	
	ns.collectUris =  function(talisJson) {
		var uris = {};
		var triples = talisJsonUtils.toTriples(talisJson);							
		for(var i = 0; i < triples.length; ++i) {
			var triple = triples[i];
			
			if(triple.s.isUri()) { uris[triple.s.value] = triple.s; }
			if(triple.p.isUri()) { uris[triple.p.value] = triple.p; }
			if(triple.o.isUri()) { uris[triple.o.value] = triple.o; }
		}

		return uris;
	};
	
	
	ns.getLabel = function(key, map) {
		var result;
		if(key in map) {
			var item = map[key];
			
			result = item.value;
			
			if(item.lang) {
				// Uncomment to show the language tag
				//result += " (" + item.lang +")";
			}			
		} else {
			result = key;
		}
		
		return result;
	};
	
	ns.generateHtml = function(talisJson, uriToLabel) {
		
		//console.log("uriToLabel", uriToLabel);
		var html = "";
		
		var rdfa = "xmlns:u='http://ns.aksw.org/update/' u:from='http://ex.org'";
			
		html += "<table class='box-facts-table'" + rdfa + ">\n";
        //html += "<div id='box-facts-content'>\n";

		var rowClass = ["even", "odd"];
		
		for(s in talisJson) {
			var ps = talisJson[s];

			var sLabel = ns.getLabel(s, uriToLabel);
			var sLabelHtml = stringUtils.escapeHTML(sLabel);

			// Write a heading
			// TODO Replace URIs with their labels
			var rowId = 0;
			
			//var rdfaAboutStr = "about='" + s + "'";

			html += '<tr class="' + rowClass[rowId % rowClass.length] + '"><td colspan="2"><a href="' + s + '" class="rdf-subject"><span style="font-weight: bold;" id="label:' + s + '">' + sLabel + '</span></a></td></tr>';

			/*
			html += '<div class="box-facts-content-line">' + 
                        '<div class="box-facts-content-cell-both">' + 
                            '<a href="' + s + '">' + sLabelHtml + '</a>' +  
                        '</div>' + 
                    '</div>';
            */
			
			for(p in ps) {
				var pLabel = ns.getLabel(p, uriToLabel);
				var pLabelHtml = stringUtils.escapeHTML(pLabel);

				var os = ps[p];
				
				
				for(var i = 0; i < os.length; ++i) {
					var o = os[i];

					var oNode = sparql.Node.fromJson(o);
					//console.log("oNode", o, oNode);
					var oLabel = oNode.isUri() ? ns.getLabel(oNode.value, uriToLabel) : oNode.value.toString();
					var oLabelHtml = stringUtils.escapeHTML(oLabel);
					
					
					var pHtml = (i == 0)
						? '<a href="' + p + '"><span id="label:' + p + '">' + pLabelHtml + '</span></a>'
						: "";


					var rdfa = { about: s, property: p, datatype: o.datatype, 'xml:lang': o.lang, content: o.value };
					//console.debug("rdfa is", rdfa);
					
					var attrStr = "";
					_.each(rdfa, function(value, key) {
						if(value !== null && value !== undefined) {
							value = value.toString().replace("'", "\\'");
							attrStr += " " + key + "='" + value + "'";
						}
					});

					var oHtml = '<a href="' + o.value + '"><span id="label:' + o.value + '" ' + attrStr + '>' + oLabelHtml + '</span></a>';

					html += '<tr class="box-facts-content-line-' + rowClass[rowId % rowClass.length] + '"><td>' + pHtml + '</td><td>' + oHtml + '</td></tr>\n';
					/*
					html += '<div class="box-facts-content-line-' + rowClass[rowId % rowClass.length] + '">' +
                                '<div class="box-facts-content-cell-left">' + pHtml + '&nbsp;</div>' + 
                                '<div class="box-facts-content-cell-right">' + oHtml + '&nbsp;</div>' +
                            '</div>\n';
                   */

					
					// Write the predicate for the first row
					// TODO Create link target
					// TODO Make recursive template for objects (like in OntoWiki)
					++rowId;
				}
			}
		}
		
		html += "</table>\n";
		//html += "</div>\n";
		
		return html;
	};
	
	ns.ResourceItem =
		$$(
				{},
				'<div>Title</div><ul><ul>',
				{
					
				}
		);
	
	ns.ResourceList =
		$$(
				{},
				'<div>'
		);

	
})(jQuery);
