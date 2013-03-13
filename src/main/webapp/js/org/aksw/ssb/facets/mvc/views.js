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

	
	ns.ViewItemFacet = Backbone.View
			.extend({
				tagName : 'li',
				// attributes: {style: 'float: left'},
				initialize : function() {
					_.bindAll(this); 

					var options = this.options;

					var parent = options.parent;
					var parentOptions = parent.options;
					this.modelFacetUpdater = parentOptions.modelFacetUpdater;

					var model = this.model;
					var children = model.get("children");

					this.subFacetWidget = new widgets.ViewFacetTree({
						collection : children,
						modelFacetUpdater : this.modelFacetUpdater
					});

					// console.log("ModelFacetUpdater ",
					// this.modelFacetUpdater);

					// model.bind('change', this.render, this);
					model.bind('remove', this.unrender, this);
					model.on('change:isExpanded', this.changeIsExpanded, this);
					model.on('change:isLoading', this.updateIsLoading, this);
					// model.bind('change:isExpanded', function())

					// var children = model.get("children");

					// children.bind('add', this.add)

					if (this.el) {
						this.render();
					}

					this.facetValuesView = null;
				},

				updateIsLoading: function() {
					var $elI = this.$el.find("> a.expandable > i");
					var $elImg = $elI.find("> img");

					$elImg.remove();

					var isLoading = this.model.get("isLoading");
					if(isLoading) {
						//console.log("SHOWING ICON");
						$elI.append('<img src="src/main/resources/icons/loading.gif" />');
					}
				},
				
				changeIsExpanded : function() {
					var model = this.model;
					var isExpanded = model.get('isExpanded');

					var $elI = this.$el.find("> a.expandable > i");

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

				events : {
					'click a.expandable' : function(ev) {
						ev.preventDefault();
						
						// Workaround for backbone not supporting relative paths for event target selector
						var expectedTarget = this.$el.find("> a.expandable")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}

						var model = this.model;
						var isExpanded = model.get('isExpanded');
						if (isExpanded) {
							model.set({
								'isExpanded' : false
							});
						} else {
							var facetFacadeNode = model.get("facetFacadeNode");

							model.set({
								'isExpanded' : true,
							});

							var simulateLoad = false;// true;
							if(simulateLoad) {
								model.set({isLoading: true});
								var scheduler = new Scheduler(5000, true);
								
								var self = this;
								scheduler.schedule(function() {
									console.log("bar");
									self.modelFacetUpdater.updateFacets(model, facetFacadeNode);
								});
							} else {							
								this.modelFacetUpdater.updateFacets(model, facetFacadeNode);
							}
/*							
							promise.done(function() {
								console.log("DONE LOADING");
							});
							*/
						}
					},
					'click .activate' : function(ev) {
						ev.preventDefault();
						
						// Workaround for backbone not supporting relative paths for event target selector
						var expectedTarget = this.$el.find("> a.activate")[0];
						if (ev.currentTarget != expectedTarget) {
							return;
						}

						var model = this.model;
						// Show the facet values in the preconfigured area
						var facetFacadeNode = model.get("facetFacadeNode");
						//var path = facetFacadeNodep.getPath();
						
						var concept = facetFacadeNode.createConcept();

						var queryGenerator = new facets.QueryGenerator(concept);
						var queryFactory = new facets.QueryFactoryQueryGenerator(
								queryGenerator, {
									distinct : true
								});
						
						// TODO Combine the concept for the facet selection with the initial concept

						// var models = createQueryBrowser(sparqlService,
						// labelFetcher);

						// var tableModel =
						// models.browseConfig.config.tableModel;
						foobarTableModel.set({
							queryFactory : queryFactory,
							facetFacadeNode: facetFacadeNode // FIXME: Not sure if this should go here
						});

					}
				},
				render : function() {
					
					var text = this.model.get("facetUri");

					var html
						= '<a class="expandable" href="#">'
						//+ '    <img src="src/main/resources/osm-logo-small.png" />'
						+ '    <i class="icon-caret-right" />'
						+ '</a>'
						+ '<a class="activate" href="#">'
						+ '    <span data-uri="' + text + '"></span>'
						+ '</a>'
						;
					
					this.$el.html(html);

					// TODO: This is not the best place to do the update,
					// as it fires one query per element
					foobarI18N.update(this.$el);
					/*
					 * var model = this.model; var isExpanded =
					 * model.get("isExpanded"); if(!isExpanded) { return this; }
					 */

					var subFacetWidgetEl = this.subFacetWidget.render().$el;
					this.$el.append(subFacetWidgetEl);

					return this;
				},
				unrender : function() {
					this.$el.remove();
				},
				remove : function() {
					this.model.destroy();
				}
			});

	ns.facetItemRenderer = new widgets.RendererItemView({}, null,
			widgets.ViewItemFacet, {
				label : "simpleLabel"
			});

	ns.ViewFacetTree = widgets.ListView.extend({
		attributes: {
			'class': 'facet'
		},
		itemRenderer : widgets.facetItemRenderer
	});

	
	ns.ViewItemCheck = Backbone.View.extend({
		subView : null,

		tagName : 'input',
		attributes: {type: 'checkbox'}, //;style: 'float: left'},
		initialize : function() {
			_.bindAll(this); //, 'render', 'unrender', 'remove', 'setCheckState'); // every
			
			//this.model.on('change:isChecked', 'setCheckState');
			this.model.on('change:isChecked', this.updateCheckState);
	    	this.model.bind('remove', this.unrender, this);
	    	
	    	this.updateCheckState();
		},
		updateCheckState: function() {
			var isChecked = this.model.get("isChecked");
			this.$el.attr('checked', isChecked);
			console.log("setCheckState", isChecked, this.$el);
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
		attributes: {type: 'checkbox', 'class': 'checkConstraint'},
		initialize: function() {
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
				
				var constraint = {
					constraint: {
						type : "equals",
						path : path,
						node : node
					}
				};
				
				var id = JSON.stringify(constraint);
				constraint.id = id;
				
				
				var constraintCollection = this.constraintCollection;
				// TODO: toggle the constraint
				if(constraintCollection.get(id)) {
					constraintCollection.remove(id);
				} else {
					constraintCollection.add(constraint);
				}
				
				
				//console.log("Added a constraint", constraintCollection);
			}
		}
	});

})();