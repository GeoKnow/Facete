/**
 * A widget for displaying facets of RDF resources.
 * 
 * TODO On opening a facet's values, we need an event that the app controller can react to.
 * 
 * 
 * TODO Synchronize the content with the constraint container:
 * 	. If there is an equal constraint on a path, then a checkbox can be shown enabled
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

	
	ns.FacetValueBackendSparql = function(sparqlService, labelFetcher) {
		this.sparqlService = sparqlService;
		this.labelFetcher = labelFetcher;
	};
	
	
	ns.FacetValueBackendSparql.prototype.fetchFacetValues = function(breadcrumb, facetState) {

		return queryUtils.loadFacetValues(this.sparqlService, this.labelFetcher, facetState, breadcrumb);
		/*
		.pipe(function(data) {
			//child.facetValues = data.facetValues;
			//console.log("So far got", facetValues);
		}));
		*/
	};

	
	
	/**
	 * This method fetches the initial facets for a given driver.
	 * 
	 * /
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
*/
	
		
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
	
	ns.FacetState.prototype.clearCounts = function() {
		var propertyToNode = this.pathManager.getRoot().outgoing;
		
		for(var propertyName in propertyToNode) {
			var node = propertyToNode[propertyName];
			
			if(node.data) {
				node.data.count = 0;
			}
		}		
	};
	
	ns.createFacetBox = function(state, constraints, backend) {

		var facetList = ns.createFacetList(state, constraints, backend);

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
	
	ns.ConstraintItem = $$(
		{parent: null, constraints: null, constraintId: null, label: ""},
		'<li><span data-bind="label" /></li>',
		'& span { cursor:pointer; }', {
		'click span:first': function() {
			var constraintId = this.model.get("constraintId");
			var constraints = this.model.get("constraints");

			constraints.remove(constraintId);
			//this.destroy();
			var parent = this.model.get("parent");
			parent.controller.removeItem(constraintId);
		}
	});
	
	ns.createConstraintList = function(constraints) {
	
				
		var result = $$(
			{idToItem: {}, constraints: constraints},
			'<div>' +
				'<ol></ol>' +
			'</div>', {
				addItem: function(constraintId, constraint) {
					
					var idToItem = this.model.get("idToItem");
					var constraints = this.model.get("constraints");
					
					
					var item = idToItem[constraintId];
					var model = {constraints: constraints, constraintId: constraintId, constraint: constraint, label: constraint.toString(), parent: this};
					if(item) {
						item.model.set(model);
					} else {
						item = $$(ns.ConstraintItem, model);
						idToItem[constraintId] = item;
						this.append(item, "ol:first");				
					}
				},
			
				removeItem: function(constraintId) {
					var idToItem = this.model.get("idToItem");


					if(constraintId in idToItem) {						
						var item = idToItem[constraintId];
						if(item) {
							item.destroy();							
						}

						delete idToItem[constraintId];
					}
				}
			
			}
		);
		
		return result;
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
			
			// TODO Separate this
			var constraintWidget = this.model.get("constraintWidget");
			
			var variable = breadcrumb.targetNode.variable;
			var constraint = new facets.ConstraintEquals(breadcrumb, new sparql.NodeValue(facetValue.node));
			
			var id = breadcrumb.toString() + " @" + facetValue.node.toString();
			
			var isEnabled = !this.model.get("isEnabled");
			//console.log("Enabled:", isEnabled, id);
			if(isEnabled) {			
				constraints.put(id, constraint);
				constraintWidget.controller.addItem(id, constraint);
			} else {
				constraints.remove(id);

				constraintWidget.controller.removeItem(id);
			}
			
			//console.log("Boom", facetValue, constraints, breadcrumb);
			console.log("Constraints", constraints);
			
			//console.log("Sparql element", constraints.getSparqlElement());
		},
		
		'click span:first': function() {
		},

		'click button': function() {
		this.destroy();
		}
	});


	ns.FacetSwitcher = $$(
		{valueToItem: {}, constraintWidget: null},
		'<li class="facets-tab-content-facetswitcher-li">' + 
			'<span data-bind="name"/> ' +
			'(<span data-bind="countStr"/>)' + 
			'<div class="facets-tab-content-facetswitcher-li-entries">' +
//				'<div class="facets-tab-content-facetswitcher-li-entries-nav">' + 
//					'<a href="#t1" class="facets-tab-content-facetswitcher-li-nav-values">Values</a>' + 
//					'<a href="#t2" class="facets-tab-content-facetswitcher-li-nav-subfacets">Sub-Facets</a>' + 
//				'</div>' +
				'<div class="tabdiv" id="t1">' + 
					'<ol></ol>' + 
				'</div>' + 
//				'<div class="tabdiv" id="t2">Subfacets not loaded</div>' + 
			'</div>' +
		'</li>', 
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
				var breadcrumb = this.model.get('breadcrumb');
				var state = this.model.get('state');
				var constraints = this.model.get('constraints');
			
				var backend = this.model.get('backend');
				
				var self = this;
				
				backend.fetchFacetValues(breadcrumb, state).pipe(function(data) {
					breadcrumb.targetNode.facetValues = data.facetValues;
					
					self.controller.syncValues(state);
				});
				
				//this.controller.loadFacetValues(sparqlService, state, breadcrumb, constraints);
			},
			
			getVisibleBreadcrumbsValues: function(result) {
				if(!result) {
					result = [];
				}
				
				if(!this.controller.isVisible()) {
					return result;
				} else {
					var breadcrumb = this.model.get("breadcrumb");
					if(breadcrumb) {
						result.push(breadcrumb);
					}
				}
				
				return result;				
			},
			
			syncValues: function(state) {
		
				
				var constraints = this.model.get('constraints');
				var valueToItem = this.model.get('valueToItem');
				var breadcrumb = this.model.get('breadcrumb');

				var backend = this.model.get('backend');
				
				var constraintWidget = this.model.get('constraintWidget');

				
				// Hide
				var facetValues = breadcrumb.targetNode.facetValues;

				for(facetValueStr in valueToItem) {
					var item = valueToItem[facetValueStr];
					var facetValue = facetValues[facetValueStr];
					
					if(!facetValue) {
						//console.log("hide", item);
						item.view.$().hide();
					}
				}

				
				
				//state.pathManager.getNode()
				//console.log("FacetValue:", facetValues + "", facetValues);
				if(!facetValues) {
					facetValues = {};
				}
				//console.log("a", _.keys(valueToItem).length, facetValues.length);
				
				var newItems  = [];
				var visibleItems = [];
				for(var i in facetValues) {
					var facetValue = facetValues[i];
					
				
					if(!facetValue.count) {
						continue;
					}
					
					var model = {value: facetValue, label: facetValue.label.value, count: facetValue.count, breadcrumb: breadcrumb, constraints: constraints, constraintWidget: constraintWidget, backend: backend};

					var key = facetValue.node.toString();
					//console.debug("Key", key, valueToItem);

					var item = valueToItem[key];
					if(!item) {							
						item = $$(ns.FacetItem, model);
						newItems.push(item);
						valueToItem[key] = item;
					} else {
						item.model.set(model);
					}
					
					visibleItems.push(item);
					//self.append(newItem, "ul.eq(1)");
				}
				
				//console.log("newItems", newItems.length);

				/*
				if(_.keys(valueToItem).length) {
					return;
				}*/

				
				for(var i = 0; i < newItems.length; ++i) {
					var item = newItems[i];
					this.append(item, "ol:first");
				}
				
				//console.log("visibleitems", visibleItems.length);

				
				for(var i = 0; i < visibleItems.length; ++i) {
					var item = visibleItems[i];
					item.view.$().show();
					//self.append(item, "ol");
				}
			},
			
			isVisible: function() {
				var facetElement = this.view.$("div:first");
				var result = $(facetElement).is(":visible");
				return result;
			},
			
			'click span:first': function() {
				var facetElement = this.view.$("div:first");
				var isVisible = $(facetElement).is(":visible");
				//console.log("visible", isVisible);
				
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
	ns.createFacetList = function(state, constraints, backend) {
		var result = $$(
			{state: state, constraints: constraints, propertyToItem: {}, constraintWidget: null, backend: backend},
			'<div>' +
				'<div id="facets-tab-content-searchContainer">' + 
//					'<form action="">'+ 
//						'<input type="text" id="facets-tab-content-searchTextBox"/>' + 
//						'<input type="button" value="Search" id="facets-tab-content-searchButton"/>' + 
//					'</form>' + 
				'</div>' + 
				'<ul></ul>' +
			'</div>',
			{
				create: function() {
					var constraints = this.model.get("constraints");
					
					var constraintWidget = ns.createConstraintList(constraints);
					
					this.append(constraintWidget, "div:first");
					this.model.set({constraintWidget: constraintWidget});
					
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


				getVisiblePropertiesValues: function() {
					
					var result = {};

					//var propertyToNode = state.pathManager.getRoot().outgoing;
					var propertyToItem = this.model.get('propertyToItem');
					
					
					for(var propertyName in propertyToItem) {						
						var item = propertyToItem[propertyName];
						
						if(item && item.controller.isVisible()) {
							result[propertyName] = item;
							//result.put(propertyName);
							//var breadcrumb = item.model.get("breadcrumb");
							//item.controller.getVisibleBreadcrumbsValues(result);
							
							//result.push(breadcrumb);
						}
					}

					return result;
				},


				/**
				 * Return an array containing breadcrumbs for which their values
				 * are visible.
				 * 
				 */
				getVisibleBreadcrumbsValues: function(result) 
				{
					if(!result) {
						result = [];
					}

					var state = this.model.get('state');
					if(!state) {
						return;
					}

					
					//var propertyToNode = state.pathManager.getRoot().outgoing;
					var propertyToItem = this.model.get('propertyToItem');
					
					
					for(var propertyName in propertyToItem) {						
						var item = propertyToItem[propertyName];
						
						if(item) {
							//var breadcrumb = item.model.get("breadcrumb");
							item.controller.getVisibleBreadcrumbsValues(result);
							
							//result.push(breadcrumb);
						}
					}

					return result;
				},
				
				refresh: function() {
					var constraintWidget = this.model.get("constraintWidget");
					
					var backend = this.model.get("backend");
					
					
					var self = this;
					
					var state = this.model.get('state');

					var propertyToNode = state ? state.pathManager.getRoot().outgoing : {};
					var propertyToItem = this.model.get('propertyToItem');

					// Hide elements for which no node exits or whose count is zero
					for(var propertyName in propertyToItem) {
						var node = propertyToNode[propertyName];
						var item = propertyToItem[propertyName];
						
						if(!node || (node.data && node.data.count === 0)) {
							item.view.$().hide();
						}						
					}

					//console.log("Refresh");

					if(!state) {
						return;
					}
					
					
					var config = state.config;
					//var sparqlService = this.model.get('sparqlService');
					var constraints = this.model.get('constraints');
					
					
					
					var newItems = [];
					var refreshableItems = [];
					
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
						
						var model = {constraints: constraints, state: state, breadcrumb: breadcrumb, id: propertyName, name: data.label, count: count, countStr: countStr, constraintWidget: constraintWidget, backend: backend};
						if(!item) {						
							item = $$(ns.FacetSwitcher, model);
							propertyToItem[propertyName] = item;							
							
							newItems.push(item);
						} else {
							item.model.set(model);
						}
						
						refreshableItems.push(item);
					}

					// Apend new elements
					for(var i = 0; i < newItems.length; ++i) {
						var item = newItems[i];
						self.append(item, "ul:first");
					}
					
					for(var i = 0; i < refreshableItems.length; ++i) {
						var item = refreshableItems[i];
						item.view.$().show();
					}

					
					for(var i = 0; i < refreshableItems.length; ++i) {
						var item = refreshableItems[i];
						
						//console.log("Refreshing item" , item);
						item.controller.refresh();
					}
					
				}
			}
		);
		
		return result;
	};


})(jQuery);
