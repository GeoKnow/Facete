/**
 * A widget for displaying facets of RDF resources.
 * 
 * TODO On opening a facet's values, we need an event that the app controller
 * can react to.
 * 
 * 
 * TODO Synchronize the content with the constraint container: . If there is an
 * equal constraint on a path, then a checkbox can be shown enabled
 * 
 */
(function($) {

	var labelUtils = Namespace("org.aksw.ssb.utils");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var facets = Namespace("org.aksw.ssb.facets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var collections = Namespace("org.aksw.ssb.collections");

	// var labelUtils = Namespace("org.aksw.ssb.utils");

	var ns = Namespace("org.aksw.ssb.widgets.facetbox");

	
	ns.FacetValueBackendSparql = function(sparqlService, labelFetcher) {
		this.sparqlService = sparqlService;
		this.labelFetcher = labelFetcher;
	};

	ns.FacetValueBackendSparql.prototype.fetchFacetValues = function(
			breadcrumb, facetState, searchString) {

		//var concat = facetState.baseBreadcrumb.concat(breadcrumb);
		
		
		//console.log("FacetValues", facetState, "" + breadcrumb);
		
		
		return queryUtils.loadFacetValues(this.sparqlService,
				this.labelFetcher, facetState, breadcrumb, searchString);
		/*
		 * .pipe(function(data) { //child.facetValues = data.facetValues;
		 * //console.log("So far got", facetValues); }));
		 */
	};

	ns.FacetValueBackendSparql.prototype.fetchCountFacetValues = function(
			breadcrumb, facetState, searchString) {

		var countLimit = 1001;
		var countVar = sparql.Node.v("__c");
		//var facetVar = sparql.Node.v("__p");
		
		var baseElement = facetState.driver.element;

		
		//var concat = facetState.baseBreadcrumb.concat(breadcrumb);
		
		var query = queryUtils.createQueryCountFacetValues(baseElement,
				breadcrumb, searchString, countLimit, countVar);

		return queryUtils.fetchInt(this.sparqlService, query.toString(),
				countVar).pipe(function(value) {
			return {
				count : value,
				countLimit : countLimit
			};
		});
	};

	/**
	 * This method fetches the initial facets for a given driver.
	 *  / ns.loadFacets = function(sparqlService, state, callback) { var config =
	 * state.config;
	 * 
	 * var query = queryUtils.createFacetQueryCount(state.driver.element,
	 * state.driver.variable, config.sampleSize);
	 * 
	 * //console.log("Loading facets with", query.toString());
	 * 
	 * var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
	 *  // The result will be handed over to the callback
	 * 
	 * sparqlService.executeSelect(query.toString(), { success: function(jsonRs) {
	 * ns.processFacets(state, jsonRs, labelFetcher); } }); };
	 */

	/**
	 * A facet configuration maps breadcrumb strings to basic information:
	 * counts, a set of values and for each value its count.
	 * 
	 * TODO Not sure if the pathManager should be part of the config, but I
	 * guess it makes sense. If so, we can get rid of FacetState
	 * 
	 * facetCountThreshold: If the threshold is reached, the user is indicated
	 * that a count is greater than the threshold. sampleSize: Number of
	 * resources (usually instances) to consider (e.g. for counting properties)
	 * 
	 */
	ns.FacetConfig = function(facetCountThreshold, sampleSize) {
		// this.driver = driver;
		this.facetCountThreshold = facetCountThreshold;
		this.sampleSize = sampleSize;
	};

	/**
	 * TODO The pathManager of the FacetState should actually be a copy of the
	 * pathManager of the config whenever there is an overlap. The idea is to
	 * separate the orginal pathManager from the counts, however the variables
	 * should be the same.
	 * 
	 * the baseBreadcrumb must be relative to the pathManager
	 * 
	 * Note: the breadcrumb must be related to the driver.
	 * 
	 * TODO: The facetState is broken:
	 * We need: 
	 * 
	 * - a driver provider { ?s a Commitment}
	 *- a constraint collection { Equals(beneficiary, "University of Leipzig") } (How to treat "exists" constraints?)
	 * - 
	 */
	ns.FacetState = function(config, driver, baseBreadcrumb) {
		this.config = config;
		this.driver = driver;
		
		
		// this.pathManager = new
		// facets.PathManager(config.driver.variable.value);
		// this.pathManager = pathManager;
		//this.pathManager = pathManager; 
		this.baseBreadcrumb = baseBreadcrumb;
		
		// TODO Hack The pathManager is used for attaching facet counts and values
		// However, this should be a separated object than the breadcrumbs pathManager
		this.pathManager = baseBreadcrumb.pathManager;
	};

	ns.FacetState.prototype.clearCounts = function() {
		var propertyToNode = this.pathManager.getRoot().outgoing;

		for ( var propertyName in propertyToNode) {
			var node = propertyToNode[propertyName];

			if (node.data) {
				node.data.count = 0;
			}
		}
	};

	ns.createFacetBox = function(state, constraints, backend, callbacks) {

		var facetList = ns.createFacetList(state, constraints, backend,
				callbacks);

		/*
		 * ns.loadFacets(sparqlService, state, { success: function(state) { //
		 * Remove the loading image, and show the facets console.log("Loaded
		 * state: ", state); facetList.controller.refresh(); } });
		 */

		return facetList;
	};

	ns.ConstraintItem = $$({
		parent : null,
		constraints : null,
		constraintId : null,
		label : ""
	}, '<li><span data-bind="label" /></li>', '& span { cursor:pointer; }', {
		'click span' : function() {
			
			//alert("weee");
			
			var constraintId = this.model.get("constraintId");
			var constraints = this.model.get("constraints");
			
			constraints.remove(constraintId);
			// this.destroy();
			var parent = this.model.get("parent");
			parent.controller.removeItem(constraintId);
		}
	});

	ns.createConstraintList = function(constraints) {

		var result = $$({
			idToItem : {},
			constraints : constraints
		}, '<div>' + '<ol></ol>' + '</div>', {
			addItem : function(constraintId, constraint) {

				var idToItem = this.model.get("idToItem");
				var constraints = this.model.get("constraints");

				var item = idToItem[constraintId];
				var model = {
					constraints : constraints,
					constraintId : constraintId,
					constraint : constraint,
					label : constraint.toString(),
					parent : this
				};
				if (item) {
					item.model.set(model);
				} else {
					item = $$(ns.ConstraintItem, model);
					idToItem[constraintId] = item;
					this.append(item, "ol:first");
				}
			},

			removeItem : function(constraintId) {
				var idToItem = this.model.get("idToItem");

				if (constraintId in idToItem) {
					var item = idToItem[constraintId];
					if (item) {
						item.destroy();
					}

					delete idToItem[constraintId];
				}
			}

		});

		return result;
	};

	ns.FacetItem = $$({
		isEnabled : false
	},
			'<li class="facets-tab-content-facetitem-li">'
					+ '<form action="">'
					+ '<input type="checkbox" data-bind="isEnabled"/>'
					+ '<span data-bind="label"/> (<span data-bind="count"/>)'
					+ '</form>'
					+ '<ol class="facets-tab-content-facetitem-li-ol"></ol>'
					+ '</li>', '& span { cursor:pointer; }', {

				'click input' : function() {
					var facetValue = this.model.get("value");
					var constraints = this.model.get("constraints");
					var breadcrumb = this.model.get("breadcrumb");

					// var variable = breadcrumb.targetNode.variable;
					var constraint = new facets.ConstraintEquals(breadcrumb,
							new sparql.NodeValue(facetValue.node));

					var id = breadcrumb.toString() + " @"
							+ facetValue.node.toString();

					var isEnabled = !this.model.get("isEnabled");
					// console.log("Enabled:", isEnabled, id);
					if (isEnabled) {
						constraints.put(id, constraint);
					} else {
						constraints.remove(id);
					}

					// console.log("Boom", facetValue, constraints, breadcrumb);
					// console.log("Constraints", constraints);

					// console.log("Sparql element",
					// constraints.getSparqlElement());
				},

				'click span:first' : function() {
				},

				'click button' : function() {
					this.destroy();
				}
			});

	ns.FacetSwitcher = $$(
			{
				valueToItem : {},
				searchString: ""
			},
			'<li class="facets-tab-content-facetswitcher-li">'
					+ '<div>'
					+ '<span data-bind="name"/> '
					+ '(<span data-bind="countStr"/>)'
					+ ' <i style="display:none" class="icon-circle-arrow-right"></i>'
					+ '</div>'
					+ '<div style="display:none" class="facets-tab-content-facetswitcher-li-entries">'
					+
					// '<div
					// class="facets-tab-content-facetswitcher-li-entries-nav">'
					// +
					// '<a href="#t1"
					// class="facets-tab-content-facetswitcher-li-nav-values">Values</a>'
					// +
					// '<a href="#t2"
					// class="facets-tab-content-facetswitcher-li-nav-subfacets">Sub-Facets</a>'
					// +
					// '</div>' +
					// '<div class="tabdiv" id="t1">' +
					// '<form action="">'+
					'<input type="text" id="facets-tab-values-searchTextBox" data-bind="searchString" />'
					+
					// '<input type="button" value="Search"
					// id="facets-tab-values-searchButton"/>' +
					// '</form>' +
					'<ol></ol>' + '<span></span>' +
					// '</div>' +
					// '<div class="tabdiv" id="t2">Subfacets not loaded</div>'
					// +
					'</div>' +
					'</li>',
					'& span { cursor:pointer; } \
					& i { cursor:pointer; }', {
				
				setState : function(state) {
					this.model.set({
						state : state
					});

					// console.log("New state for facet value:", state);
					// TODO Recursively set state
				},

				/*
				'change:pivotable': function(value) {
					if(value) {
						this.view.$("div i").style("color: black;");
					} else {
						this.view.$("div i").style("color: grey;");
					}
				},*/
				

				'mouseenter div': function() {
					var isPivotable = this.model.get("pivotable");
					if(isPivotable) {
						this.view.$("div i").show();
					}
				},
				
				'mouseleave div': function() {
					this.view.$("div i").hide();
				},
				
				
				// Pivoting action
				'click i' : function() {

					var breadcrumb = this.model.get("breadcrumb");
					//var step = this.model.get("step");
					
					//var state = this.model.get("state");
					var callbacks = this.model.get("callbacks");
 
					console.log("Moving to:", breadcrumb);
					
					//var concat = state.baseBreadcrumb.makeStep(step);
					
					callbacks.onMoveTo(breadcrumb);
				},
				
				'change' : function() {
					this.controller.refresh();
				},

				'click div:nth-child(1) span' : function() {
					
					var facetElement = this.controller.getFacetElement();
					var isVisible = $(facetElement).is(":visible");
					// console.log("visible", isVisible);

					if (isVisible) {
						$(facetElement).hide();
					} else {
						$(facetElement).show();
						this.controller.loadValues();
					}

					/*
					 * $(facetElement).toggle();
					 * 
					 * var isLoaded = this.model.get('isLoaded');
					 * 
					 * if(isLoaded) { return; } this.model.set({isLoaded:
					 * true});
					 * 
					 * this.controller.loadValues();
					 */
				},

				getFacetElement : function() {
					//var result = this.view.$("div:eq(1)");
					var result = this.view.$("div:nth-child(2)");
					return result;
				},
				
				isFacetElementVisible: function() {
					var facetElement = this.controller.getFacetElement();
					var result = $(facetElement).is(":visible");
					return result;
				},
				
				create : function() {
					var facetElement = this.controller.getFacetElement();
					facetElement.hide();
					// var isVisible = $(facetElement).is(":visible");

					// Turn the Html-view-string into tabs
					// TODO Should be an accordion
					// this.view.$().tabs();
					// this.controller.loadValues();
				},

				
				refresh : function() {
					var isVisible = this.controller.isFacetElementVisible();

					if (isVisible) {
						console.log("Refreshing facet value");
						this.controller.loadValues();
					}
				},

				loadValues : function() {
					var breadcrumb = this.model.get('breadcrumb');
					var state = this.model.get('state');
					// var constraints = this.model.get('constraints');

					var searchString = this.model.get('searchString');

					var backend = this.model.get('backend');

					var self = this;
					
					var path = breadcrumb.getPath();
					// TODO Change to path
					var countTask = backend.fetchCountFacetValues(breadcrumb,
							state, searchString);

					var valuesTask = backend.fetchFacetValues(breadcrumb,
							state, searchString).pipe(function(data) {
								
						// TODO HACK I think the facetValues should not be
						// simply attached to the target node
						// On the other hand, where should they go?
						breadcrumb.targetNode.facetValues = data.facetValues;

						return data;
					});

					// TODO This should not be here
					$.when(countTask, valuesTask).then(
							function(count, data) {
								self.controller.syncValues(state);

								console.log("Retrieved values: ", arguments);

								self.view.$("ol:first~span:first").html(
										"Count: " + count.count);
							});

					// this.controller.loadFacetValues(sparqlService, state,
					// breadcrumb, constraints);
				},

				getVisibleBreadcrumbsValues : function(result) {
					if (!result) {
						result = [];
					}

					if (!this.controller.isFacetElementVisible()) {
						return result;
					} else {
						var breadcrumb = this.model.get("breadcrumb");
						if (breadcrumb) {
							result.push(breadcrumb);
						}
					}

					return result;
				},

				syncValues : function(state) {

					var constraints = this.model.get('constraints');
					var valueToItem = this.model.get('valueToItem');
					var breadcrumb = this.model.get('breadcrumb');

					var backend = this.model.get('backend');

					// Hide
					var facetValues = breadcrumb.targetNode.facetValues;

					for (facetValueStr in valueToItem) {
						var item = valueToItem[facetValueStr];
						var facetValue = facetValues[facetValueStr];

						if (!facetValue) {
							// console.log("hide", item);
							item.view.$().hide();
						}
					}

					// state.pathManager.getNode()
					// console.log("FacetValue:", facetValues + "",
					// facetValues);
					if (!facetValues) {
						facetValues = {};
					}
					// console.log("a", _.keys(valueToItem).length,
					// facetValues.length);

					var newItems = [];
					var visibleItems = [];
					for ( var i in facetValues) {
						var facetValue = facetValues[i];

						if (!facetValue.count) {
							continue;
						}

						var model = {
							value : facetValue,
							label : facetValue.label.value,
							count : facetValue.count,
							breadcrumb : breadcrumb,
							constraints : constraints,
							backend : backend
						};

						var key = facetValue.node.toString();
						// console.debug("Key", key, valueToItem);

						var item = valueToItem[key];
						if (!item) {
							item = $$(ns.FacetItem, model);
							newItems.push(item);
							valueToItem[key] = item;
						} else {
							item.model.set(model);
						}

						visibleItems.push(item);
						// self.append(newItem, "ul.eq(1)");
					}

					// console.log("newItems", newItems.length);

					/*
					 * if(_.keys(valueToItem).length) { return; }
					 */

					for(var i = 0; i < newItems.length; ++i) {
						var item = newItems[i];
						this.append(item, "ol:first");
					}

					// console.log("visibleitems", visibleItems.length);

					for(var i = 0; i < visibleItems.length; ++i) {
						var item = visibleItems[i];
						item.view.$().show();
						// self.append(item, "ol");
					}
				},

			});

	
	/**
	 * The state combines (config, driver, baseBreadcrumb)  
	 * 
	 * 
	 * @param sparqlService
	 * @param config
	 *            An object mapping facets to their states
	 * @param callback:
	 *            Event handler for navigation events
	 */
	ns.createFacetList = function(state, constraints, backend, callbacks) {

		
		//var breadcrumb = state.baseBreadcrumb;
		
		var result = $$(
				{
					state : state,
					constraints : constraints,
					backend : backend,
					callbacks : callbacks,
					//steps: []
					baseBreadcrumb: state.baseBreadcrumb
				},
				"<div class='.ssb-size-max'>" +
				// '<div id="facets-tab-content-searchContainer">' +
				// // '<form action="">'+
				// // '<input type="text"
				// id="facets-tab-content-searchTextBox"/>' +
				// // '<input type="button" value="Search"
				// id="facets-tab-content-searchButton"/>' +
				// // '</form>' +
				// '</div>' +
				'<ul></ul>' + '</div>',
				{
					create : function() {
						// var constraints = this.model.get("constraints");

						// this.append(constraintWidget, "div:first");
						// this.model.set({constraintWidget: constraintWidget});

					},

					setState : function(state) {
						this.model.set({state: state, baseBreadcrumb: state.baseBreadcrumb});

						this.each(function(i, child) {
							child.controller.setState(state);
						});
					},

					/*
					 * setDriver: function(driver) { this.model.set({driver:
					 * driver}); },
					 */

					hideAll : function() {
						this.each(function(i, child) {
							child.view.$().hide();
						});
						/*
						 * var stepToItem =
						 * this.model.get('stepToItem');
						 *  // Ugly code to remove all children and update the
						 * model var children = _.values(stepToItem);
						 * for(var i = 0; i < children.length; ++i) { var child =
						 * children[i];
						 * 
						 * child.view.$().hide(); //destroy(); }
						 * //stepToItem = {};
						 * this.model.set({stepToItem: stepToItem});
						 */
					},

					getVisiblePropertiesValues : function() {
						var result = {};
						this.each(function(i, child) {

							if (child.controller.isFacetElementVisible()) {
								var propertyName = child.model
										.get("propertyName");
								result[propertyName] = child;
							}
						});

						return result;
					},
					//
					// getVisiblePropertiesValuesOld: function() {
					//					
					//					
					//
					// var result = {};
					//
					// //var propertyToNode =
					// state.pathManager.getRoot().outgoing;
					// var stepToItem = this.model.get('stepToItem');
					//					
					//					
					// for(var propertyName in stepToItem) {
					// var item = stepToItem[propertyName];
					//						
					// if(item && item.controller.isVisible()) {
					// result[propertyName] = item;
					// //result.put(propertyName);
					// //var breadcrumb = item.model.get("breadcrumb");
					// //item.controller.getVisibleBreadcrumbsValues(result);
					//							
					// //result.push(breadcrumb);
					// }
					// }
					//
					// return result;
					// },

					getStepStrToItem: function() {
						var result = {};
						this.each(function(i, child) {
							var step = child.model.get("step");
							
							result["" + step] = child;
						});
						
						return result;
					},
					
					/**
					 * Return an array containing breadcrumbs for which their
					 * values are visible.
					 * 
					 */
					getVisibleBreadcrumbsValues : function(result) {
						if (!result) {
							result = [];
						}

						var state = this.model.get('state');
						if (!state) {
							return;
						}

						// var propertyToNode =
						// state.pathManager.getRoot().outgoing;
						var stepStrToItem = this.controller.getStepStrToItem();

						for (var stepStr in stepStrToItem) {
							var item = stepStrToItem[stepStr];

							if (item) {
								// var breadcrumb =
								// item.model.get("breadcrumb");
								item.controller
										.getVisibleBreadcrumbsValues(result);

								// result.push(breadcrumb);
							}
						}

						return result;
					},

					setPivotFacets : function(steps) {
						var stepStrToItem = this.controller.getStepStrToItem();
						
						_.each(steps, function(step) {
							var item = stepStrToItem["" + step];
							if(item) {
								item.model.set({pivotable: true});
							}
						});
					},
					
					refresh : function() {
						var self = this;

						var backend = this.model.get("backend");
						var callbacks = this.model.get("callbacks");
						var state = this.model.get('state');
						//var steps = this.model.get('steps');
						
						var baseBreadcrumb = this.model.get('baseBreadcrumb');
						

						// TODO: there should not be a path manager here - rather it should be
						// an array of steps and targets, such as [{step: ..., successors:[{step: ...]}, {...}]
						
						var propertyToNode = state ? state.pathManager
								.getRoot().outgoing : {};

						// Index children by propertyName

						var stepStrToItem = this.controller.getStepStrToItem();
						
						console.log("P2I", stepStrToItem);


						// Hide elements for which no node exists or whose count
						// is zero
						// for(var propertyName in stepToItem) {
						this.each(function(i, child) {
							var step = child.model.get("step");
							var node = propertyToNode["" + step];

							// var item = stepToItem[propertyName];

							if (!node || !node.data || node.data.count === 0) {
								child.view.$().hide();
							}
						});
						// }

						// console.log("Refresh");

						if (!state) {
							return;
						}

						var config = state.config;
						// var sparqlService = this.model.get('sparqlService');
						var constraints = this.model.get('constraints');

						var newItems = [];
						var refreshableItems = [];

						for (var stepStr in propertyToNode) {
							var node = propertyToNode[stepStr];

							var data = node.data;
							var count = data ? data.count : 0;

							// Do not show facets with a count of 0
							if (!count) {
								continue;
							}

							var countStr = (count >= config.facetCountThreshold) ? ">"
									+ (config.facetCountThreshold - 1)
									: "" + count;

									/*
									var breadcrumb = facets.Breadcrumb.fromString(
											state.pathManager, propertyName);
											*/

									//var childSteps = steps.slice(0).push(step);

							var step = new facets.Step(stepStr);
							var childBreadcrumb = baseBreadcrumb.makeStep(step);  

							var item = stepStrToItem["" + step];

							
							var model = {
								constraints : constraints,
								state : state,
								breadcrumb : childBreadcrumb,
								step: step,
								pivotable: false,
								//steps: childSteps,
								id : "" + step,
								name : data.label,
								count : count,
								countStr : countStr,
								backend : backend,
								callbacks : callbacks
							};
							if (!item) {
								item = $$(ns.FacetSwitcher, model);
								stepStrToItem["" + step] = item;

								newItems.push(item);
							} else {
								item.model.set(model);
							}

							refreshableItems.push(item);
						}

						// Apend new elements
						for ( var i = 0; i < newItems.length; ++i) {
							var item = newItems[i];
							self.append(item, "ul:first");
						}

						for ( var i = 0; i < refreshableItems.length; ++i) {
							var item = refreshableItems[i];
							item.view.$().show();
						}

						for ( var i = 0; i < refreshableItems.length; ++i) {
							var item = refreshableItems[i];

							// console.log("Refreshing item" , item);
							item.controller.refresh();
						}

					}
				});

		return result;
	};

})(jQuery);
