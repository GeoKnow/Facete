(function($) {
	
	var widgets = Namespace("org.aksw.ssb.widgets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	
	var ns = Namespace("org.aksw.ssb.widgets.facetbox");

	
	ns.FacetConfig = function(facetCountThreshold, sampleSize) {
		// this.driver = driver;
		this.facetCountThreshold = facetCountThreshold;
		this.sampleSize = sampleSize;
	};


	/*
	ns.createFacetBox = function() {
		var result = $$(ns.listWidget);
		
		
		return result;
	};
	*/
	
	
	ns.ListItem = $$({
		setId: function(id) {
			this.model.set({id: id});
		},
		
		getId: function() {
			return this.model.get("id");
		}
	});
	
	
	ns.fnGetFacetValueId = function(data) {
		return "" + data.label;
	};
	
	ns.fnGetId = function(data) {
		return "" + data.label;
	};
	
	
	/**
	 * 
	 * 
	 * @param selectionModel Which facet constraints have been selected
	 * @param visibilityModel For which facets the values are shown
	 * @returns {ns.FacetSwitcherItemFactory}
	 */
	ns.FacetSwitcherItemFactory = function(selectionModel, visibilityModel) {
		this.selectionModel = selectionModel;
		this.visibilityModel = visibilityModel;
	};
	
	ns.FacetSwitcherItemFactory.prototype.create = function(parent, data) {
		
		
		console.log("Facet values:", data);
		return $$(ns.FacetSwitcherItem, {parent: parent, data:data, selectionModel: this.selectionModel, visibilityModel: this.visibilityModel, path: data.path, label: data.label, countStr: data.countStr, isPivotable: data.isPivotable, id: ns.fnGetId(data), fnId: ns.fnGetId});
	};					


	ns.facetBoxId = 1;
	
	ns.createFacetBox = function(selectionModel) {
	
		if(!selectionModel) {
			throw "No selectionModel for facetBox provided";
		}

		
		var id1 = "fb-tabs-" + (ns.facetBoxId++);
		var id2 = "fb-tabs-" + (ns.facetBoxId++);
		
		var result = $$(
			{
				view: { //format: '<div><p>Outgoing</p><div /><p>Incoming</p><div /></div>'
					format
						: '<div>'
						+ '<ul class="nav nav-tabs ssb-nav-tabs">'
						+ '<li><a href="#' + id1 + '">Outgoing</a></li>'
						+ '<li><a href="#' + id2 + '">Incoming</a></li>'
						+ '</ul>'
						+ '<div class="tab-content">'
						+ '<div id="' + id1 + '" class="tab-pane" />'
						+ '<div id="' + id2 + '"class="tab-pane" />'
						+ '</div>'
				},
				controller: {
					create: function() {
						
					    // Twitter Bootstrap's way of enabling tabs
				    	this.view.$('> ul > li > a').click(function (e) {
			                e.preventDefault();
			                $(this).tab('show');
			            });
	
				    	
				    	var visibilityModel = {};				    	
				    	//var selectionModel = {};
				    	
						var outgoing = widgets.createListWidget(new widgets.ListModelCollection(), new ns.FacetSwitcherItemFactory(selectionModel, visibilityModel));
						var incoming = widgets.createListWidget(new widgets.ListModelCollection(), new ns.FacetSwitcherItemFactory(selectionModel, visibilityModel));
	
	
						/*
						console.log("out", this.view.$("> div > div:eq(0)"));
						console.log("in", this.view.$("> div > div:eq(1)"));
						*/
						
						this.append(outgoing, "> div > div:eq(0)");
						this.append(incoming, "> div > div:eq(1)");
						
						this.setOutgoing(outgoing);
						this.setIncoming(incoming);
						
						
						this.bindEvents(outgoing);
						this.bindEvents(incoming);

						// FIXME Not sure why there has to be this hack in the AppController which toggles the tabs before the content shows up
				    	this.view.$('a:first').tab('show');

						/*
						var tabContent = this.view.$("> div");
						console.log("tabContent", tabContent);
					
						if(tabContent.autoHeight) {
							tabContent.autoHeight();
							$(window).resize();
						}
						*/
					}
				},
				getOutgoing: function() {
					return this.model.get("outgoing");
				},
				setOutgoing: function(outgoing) {
					this.model.set({outgoing: outgoing});
				},
				getIncoming: function() {
					return this.model.get("incoming");
				},
				setIncoming: function(incoming) {
					this.model.set({incoming: incoming});
				},
				
				bindEvents: function(container) {
					// TODO This kind of event forwarding sucks, is there a better - dynamic - way?
					// This object should not have to worry about the events...
					var self = this;
					container.bind("clickFacetValues", function(ev, payload) {
						self.trigger("clickFacetValues", payload);

						
						console.log("status open", payload);
						
						/*
						widget = payload.getFacetValues();
						if(!widget) {
							widget = payload.createFacetValues();
						}
						
						widget.getView().getListWidget().bind("selected", function(ev, item) {
							container.trigger("clickConstraints", item);
						});
						*/
						
					});
					
					//container.bind("clickConstraint", function(ev, payload) { self.trigger("clickConstraint", payload); });
					container.bind("pivot", function(ev, payload) { self.trigger("pivot", payload); });
					
					container.bind("clickConstraint", function(ev, payload) { self.trigger("clickConstraint", payload); });
					
				},
			}
		);
		
		return result;
	};
	
	ns.FacetSwitcherItem = $$(
		{
			model: {},
			view: {
				format: 
					'<li class="facets-tab-content-facetswitcher-li">'
					+     '<div>'
					+         '<span data-bind="label"/> '
					+         '(<span data-bind="countStr"/>)'
					+         ' <i style="display:none" class="icon-circle-arrow-right"></i>'
					+     '</div>'
					//+     '<div></div>'
					+ '</li>',
				style: '& span { cursor: pointer; } \
					& i { cursor: pointer; }'
			},
			
			controller: {
				create: function() {
					//console.log("Sigh", this.view.$("> div:eq(0) span"));

					// TODO [HACK] It does not feel right to have this event fired here.
					// Although a callback for fetching data might make sense... although I dont hollywood patterns in UI
					var visibilityModel = this.getVisibilityModel();
					var pathStr = "" + this.model.get("path");
					
					
					if(visibilityModel && pathStr && visibilityModel[pathStr]) {
						var facetValues = this.getFacetValues();
						facetValues.getView().view.$().show();
						console.log("Retained state", visibilityModel, pathStr);
						this.getParent().trigger("clickFacetValues", this);
					}
					
				},
				
				'mouseenter div': function() {					
					if(this.isPivotable()) {
						this.view.$("div i").show();
					}
				},
				
				'mouseleave div': function() {
					this.view.$("div i").hide();
				},
				
				
				// Pivoting action
				'click i' : function() {
					this.getParent().trigger("pivot", this);
				},
				
				'click div > span': function() {
					var facetValues = this.getFacetValues();
					facetValues.getView().view.$().toggle();

					var isFacetValuesVisible = facetValues.getView().view.$().is(":visible"); 
					
					var visibilityModel = this.getVisibilityModel();
					var pathStr = "" + this.model.get("path");
					
					if(isFacetValuesVisible) {
						visibilityModel[pathStr] = true;
					} else {
						delete visibilityModel[pathStr];
					}

					
					this.getParent().trigger("clickFacetValues", this);
				},
				
				'change' : function() {
					//this.controller.refresh();
				},
				
			},
			
			setPivotable: function(state) {
				this.model.set({isPivotable: state});
			},
			
			isPivotable: function() {
				return this.model.get("isPivotable");
			},
			
			getParent: function() {
				return this.model.get("parent");
			},
			createFacetValues: function() {
				//var facetValues = $$(ns.FacetValueItem);
				
				//var facetValues = widgets.createListWidget(new widgets.ListModelCollection(), ns.FacetValueItemFactory);
				//var facetValues = new widgets.ExecutorListWidget(null, widgets.checkItemFactory);
								
				var selectionModel = this.getSelectionModel();
				
				var executor = null; // There is no executor yet, but we may use null as a placeholder
				var viewModel = new widgets.ListModelExecutor(executor, 50);
				
				
				var self = this;
				var idFn = function(model) {
					var path = self.getPath();
					var nodeValue = new sparql.NodeValue(model.data);
					
					var constraint = new facets.ConstraintEquals(path, nodeValue);
					
					var result = "" + constraint;
					
					return constraint;
				};
				
				
				var renderer = new widgets.RendererCheckItemBackbone(selectionModel, idFn);
				var facetValues = new widgets.ExecutorListWidget(viewModel, renderer, this.labelFetcher);

				
				// TODO How to get our new ListWidget here
				
				//var facetValues = widgets.createExecutorList(executorModel, widgets.checkItemFactory, this.labelFetcher);
				
				
				// Bind events
				facetValues.getView().getListWidget().bind("selected", function(ev, payload) {
					// Small HACK to pass on path information - maybe its not even a hack
					payload.path = self.model.get("path");
					
					//alert("" +payload.path);
					
					self.getParent().trigger("clickConstraint", payload);
				});
				
				facetValues.getView().view.$().hide();
				
				this.setFacetValues(facetValues);
				
				this.append(facetValues.getView());
				
				return facetValues;
			},
			setFacetValues: function(facetValues) {
				this.model.set({facetValues: facetValues});
			},
			/*
			getFacetValues: function() {
				var result = this.model.get("facetValues");

				return result;
			},*/
			
			getFacetValues: function() {
				/* Note: the facetValues container is created on access */
				var result = this.model.get("facetValues");
				
				return result ? result : this.createFacetValues();				
			},
			getSelectionModel: function() {
				return this.model.get("selectionModel");
			},
			getVisibilityModel: function() {
				return this.model.get("visibilityModel");
			},
			getPath: function() {
				return this.model.get("path");
			}
		});
	

	ns.FacetValueItemFactory = function(parent, data) {
		return $$(ns.FacetValueItem, {
			parent: parent,
			data:data,
			label: data.label,
			countStr: data.countStr,
			id: ns.fnGetFacetValueId(data),
			fnId: ns.fnGetFacetValueId});
	};					

	

	ns.FacetValueItem = $$({
		model: { isEnabled : false },
		view: { format:  '<li class="facets-tab-content-facetitem-li">'
//					+ '<form action="">'
					+ '<input type="checkbox" data-bind="xxxisEnabled"/>' // There are some issues with firefox and chrome where the value is/is not changed at event-time
					+ '<span data-bind="label"/> (<span data-bind="count"/>)'
//					+ '</form>'
					+ '</li>',
				style: '& span { cursor:pointer; }'
		},
		controller: {

				'click input' : function() {
					
					this.setEnabled(!this.isEnabled());
					
					this.getParent().trigger("clickConstraint", this);
				},

				'click span:first' : function() {
				},
		},
		getParent: function() {
			return this.model.get("parent");
		},
		setEnabled: function(value) {
			this.model.set({isEnabled: value});
		},
		isEnabled: function() {
			return this.model.get("isEnabled");
		}
	});	
	
	
	/*
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
	*/
	
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
			
			//constraints.remove(constraintId);
			// this.destroy();
			var parent = this.model.get("parent");
			//parent.controller.removeItem(constraintId);
			parent.trigger("itemSelected", this);
		}
	});
	
	

	
	ns.createConstraintList = function(constraintSelectionModel) { //constraints) {

		var result = $$({
			view: {
				format: '<ol></ol>'
			},
			model: {
				idToItem : {},
				constraints: constraintSelectionModel
				//constraints : constraints
			},
			controller: {
				addItem : function(constraintId, constraint) {

					var idToItem = this.model.get("idToItem");
					var constraints = this.model.get("constraints");

					console.log("idToItem", idToItem, constraints);
					
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
						this.append(item); //, "ol:first");
						//alert("here");
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
				},
				
				removeAll: function() {
					this.each(function(i, child) {
						child.destroy();
					});
				}
				
			}
		});

		
		$(constraintSelectionModel).bind("change", function(ev, payload) {
			
			result.controller.removeAll();
			
			
			
		});	
		
		return result;
	};

	
})(jQuery);




/*
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
			},* /
			

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
				 * /
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

			setCount: function(count) {
				self.view.$("ol:first~span:first").html(
						"Count: " + count);					
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
				/*
				var countTask = backend.fetchCountFacetValues(breadcrumb,
						state, searchString);
				* /

				var valuesTask = backend.fetchFacetValues(path,
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

			getVisiblePaths : function(result) {
				if (!result) {
					result = [];
				}

				if (!this.controller.isFacetElementVisible()) {
					return result;
				} else {
					var path = this.model.get("path");
					if(path) {
						result.push(path);
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
				 * /

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
*/

