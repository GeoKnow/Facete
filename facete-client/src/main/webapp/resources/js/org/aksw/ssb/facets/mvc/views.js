(function() {

	/*
	var backend = Namespace("org.aksw.ssb.backend");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var facets = Namespace("org.aksw.ssb.facets");
	 */
	
	var widgets = Namespace("org.aksw.ssb.widgets");
	var ns = widgets;

	
	
	/**
	 * In the target model, sets the state of whether the model was added
	 * to the table
	 * 
	 * @param path
	 * @param targetModel
	 * @param collectionColumns
	 * @returns {ns.ControllerColumnSync}
	 */
	ns.ControllerColumnSync = function(path, targetModel, collectionColumns) {
		_.bindAll(this);

		this.path = path;
		this.targetModel = targetModel;
		this.collectionColumns = collectionColumns;
		
		this.bind();
		this.updateModel();
	};
	
	
	ns.ControllerColumnSync.prototype = {
		bind: function() {
			this.collectionColumns.on('add remove reset', this.updateModel);
		},

		updateModel: function() {			
			//var path = this.targetModelmodel.get('path');
			var path = this.path;
			var containsPath = this.collectionColumns.containsPath(path);

			//console.log("ContainsPath " + containsPath, this + " " + this.path + " ", this.collectionColumns);
			
			this.targetModel.set({isAddedToTable: containsPath});
		}
	};

	
	
	/**
	 * Syncs the boolean targetPropery value of the targetModel based on the state
	 * of the stateCollection on whether it contains a specific path.
	 * 
	 * @param path
	 * @param targetModel
	 * @param stateCollection The collection from which to infer the state of the model
	 * @returns {ns.ControllerModelSync}
	 */
	ns.ControllerModelSync = function(path, targetModel, targetProperty, stateCollection, fnContainsPath) {
		_.bindAll(this);

		this.path = path;
		this.targetModel = targetModel;
		this.targetProperty = targetProperty;
		this.stateCollection = stateCollection;
		this.fnContainsPath = fnContainsPath;
		
		this.bind();
		this.updateModel();
	};
	
	
	ns.ControllerModelSync.prototype = {
		bind: function() {
			this.stateCollection.on('add remove reset', this.updateModel);
			
			var property = this.targetProperty;
			var self = this;


			this.targetModel.on('change:' + property, function() {
				var value = this.get(property);
				if(value) {
					self.stateCollection.addPath(self.path);
				} else {
					self.stateCollection.removePath(self.path);
				}
			});
		},

		updateModel: function() {
			var containsPath = this.fnContainsPath.call(this.stateCollection, this.path);

			//console.log("ContainsPath " + containsPath, this + " " + this.path + " ", this.collectionColumns);
			
			var data = {};
			data[this.targetProperty] = containsPath;
			
			this.targetModel.set(data);
		}
	};
	
	
	/**
	 * 
	 */
	ns.TreeTable = Backbone.View.extend({
		tagName: 'table',
		attributes: {
			'class': 'facet'
		},
		itemRenderer : widgets.facetItemRenderer
	});
	
	
	/**
	 * - A TreeTableRow is backed by a model.
	 * - One attribute of this model is the collection of children.
	 * 
	 * Each table row may have a set of child table rows.
	 * 
	 * 
	 */
	ns.TreeTableRow = Backbone.View.extend({
		tagName : 'tr',
		
		initialize: function() {
			var options = this.options;

			var parent = options.parent;
			var parentOptions = parent.options;
			
			var model = this.model;
			
			
			// FIXME Make child attribute configurable
			var children = model.get("children");
			
			
			// If the child collection changes, add corresponding rows
			var self = this;
			
			
			children.on('add', function(model) {
				var $tr = self.$el;
				
				
				$child = renderChild(model);
				
				$tr.append($child);
			});

			
			//var parentRow = this.options;
			
			//this.$el
		},
		
		
		expandChildren: function() {
			// Source: http://stackoverflow.com/questions/5636375/how-to-create-a-collapsing-tree-table-in-html-css-js
			//Gets all <tr>'s of greater depth below element in the table
	        var findChildren = function (tr) {
	            var depth = tr.data('depth');
	            return tr.nextUntil($('tr').filter(function () {
	                return $(this).data('depth') <= depth;
	            }));
	        };

	        var el = $(this);
	        var tr = el.closest('tr'); //Get <tr> parent of toggle button
	        var children = findChildren(tr);

	        //Remove already collapsed nodes from children so that we don't
	        //make them visible. 
	        //(Confused? Remove this code and close Item 2, close Item 1 
	        //then open Item 1 again, then you will understand)
	        var subnodes = children.filter('.expand');
	        subnodes.each(function () {
	            var subnode = $(this);
	            var subnodeChildren = findChildren(subnode);
	            children = children.not(subnodeChildren);
	        });

	        //Change icon and hide/show children
	        if (tr.hasClass('collapse')) {
	            tr.removeClass('collapse').addClass('expand');
	            children.hide();
	        } else {
	            tr.removeClass('expand').addClass('collapse');
	            children.show();
	        }
	        return children;
		},
		
		render: function() {
			var $el = this.$el;
			
			
			return this;
		},
		
		unrender: function() {
			//this.subFacetWidget.unrender();
			this.$el.remove();							
		}

	});
	
	

	ns.ViewItemFacet = Backbone.View.extend({
				tagName : 'li',
				
				// Extension points: These selectors point to DOM elements which other plugins may use
				permaAreaSelector: '> div > div > div.permaOptions',
				hoverAreaSelector: '> div > div > div.hoverOptions',
				collapseAreaSelector: 'not implemented yet',
				
				
				getNestingLevel: function() {

					//return this.subFacetWidget.options.nestingLevel;
					
					return this.options.parent.getNestingLevel(); //get('nestingLevel');
					/*
					var parent = this.options.parent;
					
					var result;
					if(!parent) {
						result = 0;
					} else {
						result = parent.getNestingLevel() + 1;
					}
					
					return result;
					*/ 
				},
				
				// attributes: {style: 'float: left'},
				initialize : function() {
					_.bindAll(this); 

					var options = this.options;

					var parent = options.parent;
					var parentOptions = parent.options;
					//this.modelFacetUpdater = parentOptions.modelFacetUpdater;
					this.fnUpdateFacets = parentOptions.fnUpdateFacets;

					var model = this.model;
					var children = model.get("children");

					/////this.collectionColumns = parentOptions.collectionColumns;
					
					
					var parentNestingLevel = this.getNestingLevel();
					
					///console.log('parent level', parent.nestingLevel + 1, this);
					
					this.subFacetWidget = new widgets.ViewFacetTree({
						collection: children,
						//modelFacetUpdater: this.modelFacetUpdater,
						fnUpdateFacets: this.fnUpdateFacets,
						/////collectionColumns: this.collectionColumns
						
						nestingLevel: parentNestingLevel + 1
					});
										
					
					var self = this;

					this.subFacetWidget.on('all', function() {
						// Note: According to backbone doc, listing for all gives the event name as first argument
						var p = self.options.parent;
						p.trigger.apply(p, arguments);
					});

					
					
					this.on('all', function() {
						var p = self.options.parent;
						p.trigger.apply(p, arguments);						
					});
					
					model.bind('remove', this.unrender, this);
					model.on('change:selectionCount', this.onChangeFacetStats); //onChangeSelectionCount);
					model.on('change:facetCount', this.onChangeFacetStats);

					model.on('change:isExpanded', this.changeIsExpanded, this);
					model.on('change:isLoading', this.updateIsLoading, this);

					model.on('change:hasSubFacets', this.changeHasSubFacets, this);


					var self = this;

					
					if (this.el) {
						this.render();
					}

					this.facetValuesView = null;
				},


				onChangePartitionStatus: function() {
					
					
				},
				
				onChangeFacetStats: function() {
					var selectionCount = this.model.get('selectionCount');					
					var facetCount = this.model.get('facetCount');

					//console.log('selection / facet' + selectionCount, facetCount);
					
					var html = '';
					if(selectionCount) {
						html
							= '<span class="selectionCount">' + selectionCount + '</span>'
							+ '<span>/</span>'
							;
					}
					
					if(!facetCount && facetCount !== 0) {
						facetCount = '';
					}
					
					html += '<span class="facetCount">' + facetCount + '</span>';

					
					this.$el.find('> div > div.facetStats').html(html);
				},
				
				updateIsLoading: function() {
					var $elI = this.$el.find("> div > div > a.expandable > i");
					var $elImg = $elI.find("> img"); //$elI.find("> div > a.expandable > i > img");

//					console.log("$elI", $elI);
//					console.log("$elImg", $elImg);
					
					$elImg.remove();

					var isLoading = this.model.get("isLoading");
					if(isLoading) {
						//console.log("SHOWING ICON");
						$elI.append('<img src="resources/icons/loading.gif" />');
					}
				},
				
				changeHasSubFacets: function() {
					var $elI = this.$el.find("> div > div > a.expandable > i");

					var model = this.model;
					var hasSubFacets = model.get('hasSubFacets');
					
					// If there are no subfacets, hide the button
					// otherwise, show the button according to their expanded state
					if(!hasSubFacets) {
						$elI.removeClass("icon-caret-right");
						$elI.removeClass("icon-caret-down");
					} else {
						this.changeExpandend();
					}				
				},
				
				changeIsExpanded : function() {
					var model = this.model;

					var hasSubFacets = model.get('hasSubFacets');
					if(!hasSubFacets) {
						return;
					}
					
					
					var isExpanded = model.get('isExpanded');

					var $elI = this.$el.find("> div > div > a.expandable > i");

					if(isExpanded) {
						$elI.removeClass("icon-caret-right");
						$elI.addClass("icon-caret-down");
					}
					else {
						$elI.removeClass("icon-caret-down");
						$elI.addClass("icon-caret-right");					
					}
					
					// var subFacetWidget = this.subFacetWidget;
					// if(!subFacetWidget) {
					// return;
					// }

					var subEl = this.subFacetWidget.$el;
					if (isExpanded) {
						subEl.show();
					} else {
						subEl.hide();
					}
				},

				/**
				 * The view for the list of child-nodes
				 */
				getChildView: function() {
					return this.subFacetWidget;
				},
				
				getPermaArea: function() {
					return this.$el.find(this.permaAreaSelector);
				},
				
				getHoverArea: function() {
					return this.$el.find(this.hoverAreaSelector);
				},
				
				getCollapseArea: function() {
					return this.$el.find(this.collapseAreaSelector);
				},
				
				updateFacets: function() {
					var model = this.model;

					var simulateLoad = false;// true;
					if(simulateLoad) {
						model.set({isLoading: true});
						var scheduler = new Scheduler(5000, true);
						
						var self = this;
						scheduler.schedule(function() {
							//console.log("bar");
							//self.modelFacetUpdater.updateFacets(model, facetFacadeNode);
							var promise = self.fnUpdateFacets(model);
							// Trigger a postRender event
							self.trigger('facetUpdate', promise);
						});
					} else {							
						//this.modelFacetUpdater.updateFacets(model, facetFacadeNode);
						var promise = this.fnUpdateFacets(model);
						this.trigger('facetUpdate', promise);							
					}					
				},
				
				events : {
					'click .toggle-parent': function(ev) {
						// TODO Consistently use some class for indicating toggles
						var expectedTargetSet = this.$el.find(".partitionArea:first > > .toggle-parent:parent");
						
						var isTargetValid = expectedTargetSet.filter(function() { return this === ev.target; }).length != 0;
						if (!isTargetValid) {
							return;
						}
						ev.preventDefault();

						
						var $elTarget = $(ev.target);
						var $elParent = $elTarget.parent();
						var $elContainer = $elParent.parent();
						
						$elContainer.children().toggleClass('hide');
						
						//console.log("Ev", $(ev.target).parent());
						//$elI = this.$el.find('i:first');

					},
					
					'click .expandable' : function(ev) {
						
						// Workaround for backbone not supporting relative paths for event target selector
						var expectedTarget = this.$el.find("> div > div > a.expandable")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}
						ev.preventDefault();

						var model = this.model;
						var isExpanded = model.get('isExpanded');
						if (isExpanded) {
							model.set({
								'isExpanded' : false
							});
						} else {
							//var facetFacadeNode = model.get("facetFacadeNode");

							model.set({
								'isExpanded' : true
							});

							this.updateFacets();
/*							
							promise.done(function() {
								console.log("DONE LOADING");
							});
							*/
						}
					},
					'click .activate' : function(ev) {
						
						// Workaround for backbone not supporting relative paths for event target selector
						var expectedTarget = this.$el.find("> div > div > a.activate")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}
						ev.preventDefault();

						var model = this.model;

						var facetNode = model.get('facetNode'); 
						
						//var concept = facetFacadeNode.createConcept();
						var data = {
							facetNode: facetNode	
						};
						
						this.trigger('facetSelected', data);
					},

					'mouseenter div': function(ev) {
						//var expectedTarget = this.el;
						var expectedTarget = this.$el.find("> div")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}

						
						this.getHoverArea().show();
						//this.$el.find("> div > div.hoverOptions").show();
					},
					
					'mouseleave div': function(ev) {
						//var expectedTarget = this.el;
						var expectedTarget = this.$el.find("> div")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}

						this.getHoverArea().hide();
						//this.$el.find("> div > div.hoverOptions").hide();
					}

				},

				render : function() {
					
					var text = this.model.get("facetUri");
					//console.log('Got facetUri:', text);
					
					if(!text) {
						text = 'http://ns.aksw.org/facete/builtin/Items';
					}
					
					var isInverse = this.model.get("isInverse");					
					var str;
					if(isInverse) {
						str = '    is <span data-uri="' + text + '"></span> of' ;
					} else {
						str = '    <span data-uri="' + text + '"></span>';
					}

					
					var nestingLevel = this.getNestingLevel();
					//console.log('Got nesting level' + nestingLevel);
					var paddingStr = 'padding-left: ' + nestingLevel * 15 + 'px';
					
					
					var html
						= '<div class="inline" style="width: 100%">'
						+ '  <div class="inline" style="width: 50px;">'
						+ '    <div class="inline" style="height:5px; width: 20px;">'
						+ '    </div>'
						+ '    <div class="permaOptions inline">'
						+ '    </div>'
						+ '    <div class="hoverOptions inline" style="display:none">'
						+ '    </div>'
						+ '  </div>'
                        + '  <div class="inline" style="' + paddingStr + '">'
						+ '    <a class="expandable" href="#">'
						+ '      <i class="icon-caret-right" />'
						+ '    </a>'
						+ '    <a class="activate" href="#">'
						+ str
						+ '    </a>'
						/*
						+ '<span class="selectionCount">' + selectionCountStr + '</span>'
						+ '<span class="valueSeparator">/</span>'
						+ '<span class="facetCount">' + facetCountStr + '</span>'
						+ ' '
						*/
						+ '  </div>'
						+ ' '
						+ '  <div class="facetStats inline" style="margin-left: 5px">'
						+ '  </div>'
						+ '</div>'						
						+ '<br class="clearBoth" />'

						// The partition is only shown on expanded facets whose children could
						// not be fetched in time
						// TODO Factor out a "plugin" component
						+ '<div class="partitionArea hide" style="margin-left: 20px">'
						+ '    <div class="partitionCover">'
						+ '<a href="#" class="btn btn-info btn-mini toggle-parent">Configure partitions...</a>'
						+ '<a href="#"><i class="icon-question-sign" style="color:#0080FF; font-size: 150%;" /></a>'
						+ '    </div>'
						+ '    <div class="hide partitionConfig">'
						+ 'Partition size: '
						+ '        <select class="partitionSize btn btn-mini" />'
						+ '        <div class="partitionPaginator" style="float:left;" />'
//						+ '        <a href="#" class="toggle-parent">(hide)</a>'
						+ '        <a href="#" class="btn btn-info btn-mini toggle-parent">(hide)</a>'
						+ '    </div>'
						+ '</div>'
						;

					this.$el.html(html);

					this.$elPermaDiv = this.$el.find(this.permaAreaSelector); //"> div > div > div.permaOptions");
					this.$elHoverDiv = this.$el.find(this.hoverAreaSelector); //"> div > div > div.hoverOptions");

					//console.log('permaDiv', this.$elPermaDiv);

					
					/*
					 * var model = this.model; var isExpanded =
					 * model.get("isExpanded"); if(!isExpanded) { return this; }
					 */

					var $elSubFacetWidget = this.subFacetWidget.render().$el;
					this.$el.append($elSubFacetWidget);

					
					$elSubFacetWidget.css({
						'margin-left': '0px',
						'padding-left': '0px'
						//'padding-left': '' + nestingLevel * 15 + 'px'
					});

					
					this.onChangeFacetStats();
					
					return this;
				},
				reset: function() {
					//this.unrender();
					/*
					this.subFacetWidget.unrender();
					this.$el.html('');//clear();
					this.render();
					*/
				},
				unrender: function() {
					this.subFacetWidget.unrender();
					this.$el.remove();
									
				}
				/*
				,
				remove: function() {
					this.model.destroy();
				}
				*/
			});

	ns.facetItemRenderer = new widgets.RendererItemView({}, null,
			widgets.ViewItemFacet, {
				label : "simpleLabel"
			});

	ns.ViewFacetTree = widgets.ListView.extend({
		attributes: {
			'class': 'facet'
		},
		itemRenderer : widgets.facetItemRenderer,
		//nestingLevel: 0
		getNestingLevel: function() {
			var options = this.options;
			var nestingLevel = options.nestingLevel;
			
			var result = nestingLevel ? nestingLevel : 0;

			return result;
		}
	});

	

	ns.ViewItemCheck = Backbone.View.extend({
		subView : null,

		tagName : 'input',
		attributes: {type: 'checkbox'}, //;style: 'float: left'},
		initialize : function() {
			_.bindAll(this); //, 'render', 'unrender', 'remove', 'setCheckState'); // every
			
			//console.log("Initialized super class");
			
			//this.model.on('change:isChecked', 'setCheckState');
			this.model.on('change:isChecked', this.updateCheckState);
	    	this.model.on('remove', this.unrender);
	    	
	    	this.updateCheckState();
		},
		updateCheckState: function() {
			var isChecked = this.model.get("isChecked");
			this.$el.attr('checked', isChecked);
			//console.log("setCheckState", isChecked, this.$el);
		},
		
		render : function() {

			var subView = this.subView;
			//var inputEl = $('<input type="checkbox"></input>');

			if(subView) {
				var subViewEl = subView.render().$el;
				this.$el.append(subViewEl);
			}
			

			//this.$el.append(inputEl);

			return this;
		},

		unrender : function() {
			this.$el.remove();
		}
	});

	
	ns.ViewItemCheckConstraint = ns.ViewItemCheck.extend({
		//tagName: 'li',
		tagName: 'input',
		attributes: {
			type: 'checkbox',
			'class': 'checkConstraint'
		},
		initialize: function() {
			//this.constructor.__super__.initialize.apply(this);
			ns.ViewItemCheck.prototype.initialize.apply(this);

			this.constraintCollection = checkNotNull(this.options.constraintCollection);
		},
		events: {
			//'click .checkConstraint':
			'click': function(ev) {
				
				//console.log("check model is", this.model);
				
				// Prevent the checkbox from getting checked
				// The check occurs as a reaction to adding the constraint to the constraint collection
				//ev.stopPropagation();
				//ev.preventDefault();
				
				var model = this.model;
				
				var constraint = model.get("constraint");
				if(!constraint) {
					console.log("Constraint not set - should not happen");
					return;
				}
				
				var path = constraint.path;
				var node = constraint.node;
				//var path = model.get("path");
				//var node = model.get("node");
				
				if(!path) {
					console.log("Path is null - should not happen");
					return;
				}
				//var nodeValue = sparql.NodeValue.makeNode(node);
								
				//var id = JSON.stringify(modelData.constraint);
				//modelData.id = id;

				var constraintCollection = this.constraintCollection;

				constraintCollection.toggleEqualsConstraint(path, node);
				
				/*****
				var priorModel = constraintCollection.findModelEquals(path, node);
				if(priorModel) {
					constraintCollection.remove(priorModel);
					//priorModel.destroy();
				} else {
					constraintCollection.add(modelData);
				}
				*/
				
				
				//console.log("Added a constraint", constraintCollection);
			}
		}
	});
	
	
	
	ns.ViewItemIcon = Backbone.View.extend({
		tagName: 'i',
		
		fnState: null,
		stateToAttrs: null,
		
		initialize: function() {
			_.bindAll(this);
			
			this.model.on('change', this.onChange);
	    	this.model.on('remove', this.unrender);
	    	
	    	this.fnState = this.options.fnState;
	    	this.stateToAttrs = this.options.stateToAttrs;
		},
		
		onChange: function() {
			//myElement.attr('class')
			var $el = this.$el;
			if(!$el) {
				return;
			}
			
			var state = this.fnState(this.model);
			var attrs = this.stateToAttrs[state];
			
			_.each(attrs, function(value, key) {
				$el.attr(key, value);
			});
		},
		
		render: function() {

			this.onChange();
			
			return this;
		},

		unrender: function() {
			this.$el.remove();
		}
	});
	
	
	ns.ViewItemLink = Backbone.View.extend({
		tagName : 'a',
		subView : null,

		attributes: {href: '#'},
		initialize : function() {
			_.bindAll(this);
			
	    	if(this.options.subView) {
	    		this.subView = this.options.subView;
	    	}			
		},
		
		render : function() {
			
//			if(true) {
//				this.$el.html("test");
//				return this;
//			}
			
			var subView = this.subView;
			if(subView) {
				$elSubView = subView.render().$el;
				this.$el.append($elSubView);
			}
			
			return this;
		},

		unrender : function() {
			this.$el.remove();
		}
	});


})();