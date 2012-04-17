/**
 * A widget for displaying facets of RDF resources.
 * 
 */
(function($) {
	
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var facets = Namespace("org.aksw.ssb.facets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	
	var collections = Namespace("org.aksw.ssb.collections");	

	
	//var labelUtils = Namespace("org.aksw.ssb.utils");
	
	var ns = Namespace("org.aksw.ssb.widgets.facetbox");


	/**
	 * This method fetches the initial facets for a given driver.
	 * 
	 */
	ns.loadFacets = function(sparqlService, state, callback) {
		var config = state.config;

		var query = queryUtils.createFacetQueryCount(state.driver.element, state.driver.variable, config.sampleSize);

		//console.log("Loading facets with", query.toString());
		
		var labelFetcher = new labelUtils.LabelFetcher(sparqlService);

		// The result will be handed over to the callback 
			
		sparqlService.executeSelect(query.toString(), {
			success: function(jsonRs) {
				ns.processFacets(state, jsonRs, labelFetcher);
			}
		});
	};

	
	ns.processFacets = function(state, jsonRs, labelFetcher, callback) {
		//console.log("Facet result set", jsonRs);
		
		var result = state; 
		var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");
	
		//console.log("labelFetcher", $.ssb);
		labelFetcher.fetch(_.keys(map), true, function(idToLabel) {
															
			for(var propertyName in map) {
				
				var label = propertyName;
				if(propertyName in idToLabel) {
					label = idToLabel[propertyName].value;
				}
													
				var count = map[propertyName];
				
				var node = result.pathManager.getRoot().getOrCreate(propertyName);

				node.data = {count: count, label: label};
			}
			
			callback.success(result);
		});		
	};
	
	ns.loadFacetValues = function(sparqlService, state, breadcrumb, callback) {
		var self = this;

		var baseElement = state.driver.element;
		
		var queryData = queryUtils.createFacetValuesQuery(baseElement, breadcrumb, state.config.sampleSize);

		var query = queryData.query;
		query.limit = 10;
		
		//console.debug("Values query:", queryData);
		
		// Test query
		//query.elements.push(new sparql.ElementString("?s rdfs:label ?var1 . Filter(regex(?var1, '199')) ."));
		
		// The result is a list of facet values:
		// (valueNode, label, count)
		var result = [];
		
		sparqlService.executeSelect(query.toString(), {
			success: function(jsonRs) {
				//console.log("Binding", jsonRs);
				
				var outputVar = breadcrumb.targetNode.variable;
				
				var bindings = jsonRs.results.bindings;
				
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					var val = binding[outputVar];
					
					var valueNode = sparql.Node.fromJson(val);
					var count = binding["__c"].value;// TODO Maybe parse as int
					
					result.push(new ns.FacetValue(valueNode, count));
				}
					
				
				//console.log("Raw facet values:", result);
				//var vars = jsonRs.head.vars;
				
				// TODO We need a discriminator column so we know which facet the values correspond to
				//var map = jsonRdfResultSetToMap(jsonRs, "var1", "__c");
		
				var uris = [];
				for(var i = 0; i < result.length; ++i) {
					var val = result[i].node.value.toString();

					if(val.startsWith("http://")) {
						uris.push(val);
					}
				}
				
				//console.log("Value URIs", uris, map);
				
				var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
				labelFetcher.fetch(uris, true, function(idToLabel) {

					//console.log("Facet value uris", idToLabel);

					for(var i = 0; i < result.length; ++i) {						
						var val = result[i].node;
						
						var label = idToLabel[val.value];
						if(!label) {
							label = val;
						}
						
						result[i].label = label;						
					}

					callback.success(result, idToLabel);
				});
			}
		});
	},
	
	
	ns.FacetValue = function(node, count) {
		this.node = node;
		this.count = count;
	};
	
	/**
	 * A facet configuration maps breadcrumb strings to basic information:
	 * counts, a set of values and for each value its count.
	 * 
	 * TODO Not sure if the pathManager should be part of the config, but I guess it makes sense.
	 * If so, we can get rid of FacetState
	 * 
	 * facetCountThreshold: If the threshold is reached, the user is indicated that a count is greater than the threshold. 
	 * sampleSize: Number of resources (usually instances) to consider (e.g. for counting properties)
	 * 
	 */
	ns.FacetConfig = function(facetCountThreshold, sampleSize) {
		//this.driver = driver;		
		this.facetCountThreshold = facetCountThreshold;
		this.sampleSize = sampleSize;
	};
	
	/**
	 * TODO The pathManager of the FacetState should actually be a copy of the
	 * pathManager of the config whenever there is an overlap.
	 * The idea is to separate the orginal pathManager from the
	 * counts, however the variables should be the same.
	 * 
	 * 
	 */
	ns.FacetState = function(config, driver, pathManager) {
		this.config = config;
		this.driver = driver;
		//this.pathManager = new facets.PathManager(config.driver.variable.value);
		//this.pathManager = pathManager;
		this.pathManager = pathManager;
	};
	
	
	ns.createFacetBox = function(sparqlService, state, constraints) {

		var facetList = ns.createFacetList(sparqlService, state, constraints);

		/*
		ns.loadFacets(sparqlService, state, {
			success: function(state) {
				// Remove the loading image, and show the facets
				console.log("Loaded state: ", state);
				facetList.controller.refresh();
			}
		});
		*/
		
		return facetList;
	};
	
	ns.FacetItem = $$(
		{isEnabled: false},
		'<div class="facets-tab-content-facetitem-li">' + 
			'<form action="">' + 
				'<input type="checkbox" data-bind="isEnabled"/>' + 
				'<span data-bind="label"/> (<span data-bind="count"/>)' + 
			'</form>' + 
			'<ol class="facets-tab-content-facetitem-li-ol"></ol>' + 
		'</div>', 
		'& span { cursor:pointer; }', {

		'click input': function() {
			var facetValue = this.model.get("value");
			var constraints = this.model.get("constraints");
			var breadcrumb = this.model.get("breadcrumb");
			
			var variable = breadcrumb.targetNode.variable;
			var constraint = new facets.ConstraintEquals(breadcrumb, new sparql.NodeValue(facetValue.node));
			
			var id = breadcrumb.toString() + " @" + facetValue.node.toString();
			
			var isEnabled = !this.model.get("isEnabled");
			console.log("Enabled:", isEnabled, id);
			if(isEnabled) {			
				constraints.put(id, constraint);
			} else {
				constraints.remove(id);
			}
			
			//console.log("Boom", facetValue, constraints, breadcrumb);
			console.log("constraint", constraints);
			
			console.log("Sparql element", constraints.getSparqlElement());
		},
		
		'click span:first': function() {
		},

		'click button': function() {
		this.destroy();
		}
	});


	ns.FacetSwitcher = $$(
		{valueToItem: {}},
		'<li class="facets-tab-content-facetswitcher-li">' + 
			'<span data-bind="name"/> ' +
			'(<span data-bind="countStr"/>)' + 
			'<div class="facets-tab-content-facetswitcher-li-entries">' +
				'<div class="facets-tab-content-facetswitcher-li-entries-nav">' + 
					'<a href="#t1" class="facets-tab-content-facetswitcher-li-nav-values">Values</a>' + 
					'<a href="#t2" class="facets-tab-content-facetswitcher-li-nav-subfacets">Sub-Facets</a>' + 
				'</div>' +
				'<div class="tabdiv" id="t1">' + 
					'<ol></ol>' + 
				'</div>' + 
				'<div class="tabdiv" id="t2">Facets not loaded</div>' + 
			'</div>', 
		'& span { cursor:pointer; }',
		{
			create: function() {
				// Turn the Html-view-string into tabs
				// TODO Should be an accordion
				this.view.$().tabs();
				//this.controller.loadValues();
			}, 
			
			refresh: function() {
				var facetElement = this.view.$("div:first");
				var isVisible = $(facetElement).is(":visible");

				if(isVisible) {
					//console.log("Refreshing facet value");
					this.controller.loadValues();
				}
			},
			
			loadValues: function() {
				var sparqlService = this.model.get('sparqlService');
				
				//this.view.$("ol").html("");
				

				var breadcrumb = this.model.get('breadcrumb');
				var state = this.model.get('state');
				var constraints = this.model.get('constraints');
			
				this.controller.loadFacetValues(sparqlService, state, breadcrumb, constraints);
			},
			
			loadFacetValues: function(sparqlService, state, breadcrumb, constraints) {
				var self = this;

				//console.debug("Loading facet values for breadcrumb: ", breadcrumb, constraints);
				
				ns.loadFacetValues(sparqlService, state, breadcrumb, {
					success: function(facetValues) {
						var valueToItem = self.model.get('valueToItem');
						
						var items = _.values(valueToItem);
						console.log("items", items.length);
						
						for(var i = 0; i < items.length; ++i) {
							var item = items[i];
							//item.destroy();
							item.view.$().hide();
						}						
						
						
						var visibleItems = [];
						for(var i = 0; i < facetValues.length; ++i) {
							var facetValue = facetValues[i];
							
							console.log("FacetValue:", facetValue + "", facetValue);
						
							if(!facetValue.count) {
								continue;
							}
							
							var model = {value: facetValue, label: facetValue.label.value, count: facetValue.count, breadcrumb: breadcrumb, constraints: constraints};

							var key = facetValue.node.toString();
							

							var item = valueToItem[key];
							if(!item) {							
								item = $$(ns.FacetItem, model);
								valueToItem[key] = item;
								self.append(item, "ol");
							} else {
								item.model.set(model);
							}
							
							visibleItems.push(item);
							//self.append(newItem, "ul.eq(1)");
						}
						console.log("visible items", visibleItems.length);
						
						console.debug("valueToItem", valueToItem);
						self.model.set({valueToitem: valueToItem});
						
						//return;

						//console.log("Visible Items", visibleItems);
						
						for(var i = 0; i < visibleItems.length; ++i) {
							var item = visibleItems[i];
							item.view.$().show();
							//self.append(item, "ol");
						}

					}
				});
			},
			
			'click span:first': function() {
				var facetElement = this.view.$("div:first");
				var isVisible = $(facetElement).is(":visible");
				
				console.log("visible", isVisible);
				
				if(isVisible) {
					$(facetElement).hide();
				} else {
					$(facetElement).show();
					this.controller.loadValues();
				}

				
				/*
				$(facetElement).toggle();

				var isLoaded = this.model.get('isLoaded');
				
				if(isLoaded) {
					return;
				}
				this.model.set({isLoaded: true});

				this.controller.loadValues();
				*/
			}
		}
	);
	
	
	/**
	 * 
	 * @param sparqlService
	 * @param config An object mapping facets to their states
	 */
	ns.createFacetList = function(sparqlService, state, constraints) {
		var result = $$(
			{sparqlService: sparqlService, state: state, constraints: constraints, propertyToItem: {}},
			'<div>' +
				'<div id="facets-tab-content-searchContainer">' + 
					'<form action="">'+ 
						'<input type="text" id="facets-tab-content-searchTextBox"/>' + 
						'<input type="button" value="Search" id="facets-tab-content-searchButton"/>' + 
					'</form>' + 
				'</div>' + 
			'<ul></ul></div>',
			{
				create: function() {
				},
			
				setState: function(state) {
					this.model.set({state: state});
				},
				
				/*
				setDriver: function(driver) {
					this.model.set({driver: driver}); 
				},*/
				
				hideAll: function() {
					var propertyToItem = this.model.get('propertyToItem');

					// Ugly code to remove all children and update the model
					var children = _.values(propertyToItem);
					for(var i = 0; i < children.length; ++i) {
						var child = children[i];
						
						child.view.$().hide(); //destroy();
					}
					//propertyToItem = {};
					this.model.set({propertyToItem: propertyToItem});					
				},
				
				refresh: function() {
					var self = this;
					
					this.controller.hideAll();
					
					var propertyToItem = this.model.get('propertyToItem');
					
					var state = this.model.get('state');
					if(!state) {
						return;
					}
					
					var config = state.config;
					var sparqlService = this.model.get('sparqlService');
					var constraints = this.model.get('constraints');
					
					
					var propertyToNode = state.pathManager.getRoot().outgoing;
					
					for(var propertyName in propertyToNode) {
						var node = propertyToNode[propertyName];
						
						var data = node.data;
						var count = data.count;
						
						// Do not show facets with a count of 0 
						if(!count) {
							continue;
						}
						
						var countStr = (count > config.facetCountThreshold) ? ">" + config.facetCountThreshold : "" + count; 

						var breadcrumb = facets.Breadcrumb.fromString(state.pathManager, propertyName);
						
						var item = propertyToItem[propertyName];
						
						var model = {sparqlService: sparqlService, constraints: constraints, state: state, breadcrumb: breadcrumb, id: propertyName, name: data.label, count: count, countStr: countStr};
						if(!item) {						
							item = $$(ns.FacetSwitcher, model);
							propertyToItem[propertyName] = item;
							self.append(item, "ul:first");						
						} else {
							item.model.set(model);
							item.view.$().show();
							//item.controller.refresh();
						}
						
						
						
					}
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
