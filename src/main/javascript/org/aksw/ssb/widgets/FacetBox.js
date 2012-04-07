/**
 * A widget for displaying facets of RDF resources.
 * 
 */
(function($) {
	
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var facets = Namespace("org.aksw.ssb.facets");
	
	//var labelUtils = Namespace("org.aksw.ssb.utils");
	
	var ns = Namespace("org.aksw.ssb.widgets.facetbox");

	/**
	 * This method fetches the initial facets for a given driver.
	 * 
	 */
	ns.loadFacets = function(sparqlService, state, callback) {
		var config = state.config;

		var query = queryUtils.createFacetQueryCount(config.driver.element, config.driver.variable);

		var labelFetcher = new labelUtils.LabelFetcher(sparqlService);

		// The result will be handed over to the callback 
		var result = state; 
			
		sparqlService.executeSelect(query.toString(), {
			success: function(jsonRs) {
				var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");
			
				//console.log("labelFetcher", $.ssb);
				labelFetcher.fetch(_.keys(map), true, function(idToLabel) {
																	
					for(var propertyName in map) {
						
						var label = propertyName;
						if(propertyName in idToLabel) {
							label = idToLabel[propertyName].value;
						}
															
						var count = map[propertyName];
	
						var countStr = (count > config.facetCountThreshold) ? ">" + config.facetCountThreshold : "" + count; 
	
						
						var node = result.pathManager.getRoot().getOrCreate(propertyName); //config.getFacet([propertyName]);
						if(!node) {
							console.log("Getting facet from config: ", config, propertyName);								
						}
	
						node.data = {count: count, label: label};
					}
					
					callback.success(result);
				});
			}
		});
	};
	
	
	/**
	 * A facet configuration maps breadcrumb strings to basic information:
	 * counts, a set of values and for each value count.
	 * 
	 */
	ns.FacetConfig = function(driver, facetCountThreshold, instanceScanCount) {
		// TODO Maybe combine driver/var into a single object
		this.driver = driver;
		
		if(!facetCountThreshold) {
			this.facetCountThreshold = 1000;
		}
		
		if(!instanceScanCount) {
			this.instanceScanCount = 10000;
		}
		
		//this.pathManager = new facets.PathManager(driverVar);
		//crumb
		//this.crumbTo
		
	};
	
	ns.FacetState = function(config) {
		this.config = config;
		this.pathManager = new facets.PathManager(config.driver.variable.value);
	};
	
	
	ns.createFacetBox = function(sparqlService, config) {

		//$("#facets2").append('<form action=""><input id="constrainToVisibleArea" type="checkbox" />Unlink from visible area</form>');


		var state = new ns.FacetState(config);

		var facetList = ns.createFacetList(sparqlService, state);
		$$.document.append(facetList, "#facets2");

		ns.loadFacets(sparqlService, state, {
			success: function(state) {
				// Remove the loading image, and show the facets
				console.log(state);
				facetList.controller.refresh();
			}
		});
		
		
		
		// TODO: Implement behaviour
		//$("#constrainToVisibleArea").click(function() { alert("cilkc"); });
		
		
		//var sparqlService = new VirtuosoSparqlService("http://localhost/sparql", ["http://fintrans.publicdata.eu/ec/"]);
	};
	
	ns.FacetItem = $$(
		{},
		'<li><form action=""><input type="checkbox" /><span data-bind="name"/> (<span data-bind="count"/>)</form><ol style="display:none;"></ol></li>', '& span { cursor:pointer; }', {

		'click input': function() {
			alert("click" + this.model.get("id"));
			
		},
		
		'click span:first': function() {
		},
		'click button': function() {
		this.destroy();
		}
	});


	ns.FacetSwitcher = $$(
		{},
		'<li><span data-bind="name"/> (<span data-bind="countStr"/>)<div style="display:none;" class="widget"><ul class="tabnav"><li><a href="#t1">Values</a></li><li><a href="#t2">Sub-Facets</a></li></ul><div class="tabdiv" id="t1"><ol></ol></div><div class="tabdiv" id="t2">Facets not loaded</div></div>', '& span { cursor:pointer; }',
		{
			create: function() {
				// Turn the Html-view-string into tabs
				// TODO Should be an accordion
				this.view.$().tabs();
				//this.controller.loadValues();
			}, 
			
			loadValues: function() {
				var facetElement = this.view.$("div:first");
				//var isVisible = $(facetElement).is(":visible");
				//$(facetElement).toggle();

				//console.log("Visibility: ", isVisible, facetElement, this.view);
				
				//var facetElement = this.view.$("ol:first");
				//var isVisible = $(facetElement).is(":visible");
				//$(facetElement).toggle();

				//console.log("Visibility: ", isVisible, facetElement, this.view);
				$(facetElement).toggle();

				
				
				var isLoaded = this.model.get('isLoaded');
				
				if(isLoaded) {
					return;
				}
				
				//this.view.$("ol").html("");
				
				this.model.set({isLoaded: true});

				var facet = this.model.get('facet');
				var config = this.model.get('config');

			
				this.controller.loadValuesCore(facet, config);
			},
			
			loadValuesCore: function(baseElement, facet) {
				var self = this;

				var queryData = queryUtils.createValuesQuery(baseElement, facet);

				var query = queryData.query;
				query.limit = 10;
				
				console.log("Values query:", queryData);
				
				// Test query
				//query.elements.push(new sparql.ElementString("?s rdfs:label ?var1 . Filter(regex(?var1, '199')) ."));
				
				sparqlService.executeSelect(query.toString(), {
					success: function(jsonRs) {
						
							
						//var vars = jsonRs.head.vars;
						
						// TODO We need a discriminator column so we know which facet the values correspond to
						var map = jsonRdfResultSetToMap(jsonRs, "var1", "__c");
				
						var uris = [];
						for(var key in map) {
							if(key.toString().startsWith("http://")) {
								uris.push(key);
							}
						}
						
						console.log("Value URIs", uris, map);
						
						var labelFetcher = new $.ssb.utils.LabelFetcher(sparqlService);
						labelFetcher.fetch(uris, true, function(idToLabel) {

							console.log("Facet value uris", idToLabel);

						
							for(var propertyName in map) {
								
								var label = propertyName;
								if(propertyName in idToLabel) {
									label = idToLabel[propertyName].value;
								}

								
								var count = map[propertyName];
							
								//var facetValue = facet.getValue();

								//var facet = config.getFacet([propertyName]);
								
								//facet.setCount(count);

								
							
								//var facetItem = new FacetItem({id: propertyName, name: propertyName, count: count});
							
							
							//self.facetCollection.add(new FacetItem({id: propertyName, name: propertyName, count: count}));
								var newItem = $$(ns.FacetItem, {id: propertyName, name: label, count: count});
							
								//self.append(newItem, "ul.eq(1)");
								self.append(newItem, "ol");
							}
						});
					}
				});
			},
			
			'click span:first': function() {
				this.controller.loadValues();
			}
		}
	);
	
	
	// style="position:absolute; left:500px; top:100px";
	/**
	 * 
	 * @param sparqlService
	 * @param config An object mapping facets to their states
	 */
	ns.createFacetList = function(sparqlService, state) {
		var result = $$(
			{sparqlService: sparqlService, state: state},
			'<div><form action=""><input type="text"/><input type="button" value="Search"/></form><ul></ul> </div>',
			{
				create: function() {
				},
			
				refresh: function() {
					var self = this;
					
					var state = this.model.get('state');
					var config = state.config;
					var sparqlService = this.model.get('sparqlService');
					
					var propertyToNode = state.pathManager.getRoot().outgoing;
					
					for(var propertyName in propertyToNode) {
						var node = propertyToNode[propertyName];
						
						var data = node.data;
						var count = data.count;
						var countStr = (count > config.facetCountThreshold) ? ">" + config.facetCountThreshold : "" + count; 

						var newItem = $$(ns.FacetSwitcher, {sparqlService: sparqlService, state: state, id: propertyName, name: data.label, count: count, countStr: countStr});
						
						self.append(newItem, "ul:first");						
					}
					
					
					/*
					var query = queryUtils.createStatusQuery(config);
					
					console.log("Status query:", query.toString(), config);
					
					sparqlService.executeSelect(query.toString(), {
						success: function(jsonRs) {
							var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");
		
							//console.log("labelFetcher", $.ssb);
							var labelFetcher = new $.ssb.utils.LabelFetcher(sparqlService);
							labelFetcher.fetch(_.keys(map), true, function(idToLabel) {
								
								
								//console.log("uriToLabel", idToLabel);
								for(var propertyName in map) {
									
									var label = propertyName;
									if(propertyName in idToLabel) {
										label = idToLabel[propertyName].value;
									}
																	
									var count = map[propertyName];
		
									var countStr = (count > config.facetCountThreshold) ? ">" + config.facetCountThreshold : "" + count; 
		
									
									var facet = config.getFacet([propertyName]);
									if(!facet) {
										console.log("Getting facet from config: ", config, propertyName);								
									}
									
									facet.setCount(count);
									
									
									//console.log("Got facet by path:", facet);
		
									//var facetItem = new FacetItem({id: propertyName, name: propertyName, count: count});
									
									
									//self.facetCollection.add(new FacetItem({id: propertyName, name: propertyName, count: count}));
									var newItem = $$(ns.FacetSwitcher, {config: config, facet: facet, id: propertyName, name: label, count: count, countStr: countStr});
									
									self.append(newItem, "ul:first");
								}
							});
						}
					});
					*/
				}
			}
		);
		
		return result;
	};
				
				
			    //var newItem = $$(facetItem, {name: 'FacetX', count: countStr});
			    //this.append(newItem, 'ul');
				
				
				//var config = this.model.get('config');
				
				//console.log("Create config:", config);
				
				
				/*
				var facets = config.getRoot().getSubFacets().asArray();
				console.log("facetsx", facets);
				for(var i in facets) {
					var facet = facets[i];
			  
					console.log("facetx", facet);
			  
			  
					var newItem = $$(facetItem, {content: facet.getId() });
					this.append(newItem, 'ul');
				}*/
		
	
			/*
				'click #new': function(){
			    var newItem = $$(facetItem, {content:'Click to edit'});
			    this.append(newItem, 'ul'); // add to container, appending at <ul>
			  }
	 	  */

})(jQuery);