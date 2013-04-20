(function() {

	var ns = Namespace("org.aksw.ssb.widgets");

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


	/*
	var ViewItemAddToTable = ns.ViewItemLink.extend({
		/*
		initialize: function() {
			ns.ViewItemLink.prototype.initialize.apply(this);
			
			_.bindAll(this);
		},
		* /
		events: {
			'click': function() {
				this.model.get('collectionColumns').addPath(self.path);
				ev.preventDefault();
			}
		}
	});
	
	
	var ViewItemRemoveFromTable = ns.ViewItemLink.extend({
		events: {
			'click': function() {
				self.collectionColumns.removePath(self.path);
				ev.preventDefault();
			}
		}					
	});
	*/

	
	
	/**
	 * I guess we can assume that the facet tree itself is fine the way it is.
	 * 
	 * The facet tree needs to define 3 extension points:
	 * - a perma area
	 * - a hover area
	 * - a collapse area 
	 * 
	 * The question is how we can attach plugins to the facet tree.
	 * 
	 * Probably the easiest way is to do something like:
	 * 
	 * var facetTreeWidget = new WidgetFacetTree(...);
	 * 
	 * var tablePlugin = new TablePlugin(facetTreeWidget);
	 * 
	 * the table plugin then registers itself as a listener for events, such as:
	 * - nodeCreated
	 * - nodeDestroyed
	 * 
	 * and performs according actions
	 * 
	 * In a later step, nodes and plugins expose their events, so
	 * that we can validate the set up and detect e.g. missing plugins
	 * 
	 */
	ns.PluginFacetTree = function(options) {
		_.bindAll(this);
		
		
		this.facetWidget = options.facetWidget;
		this.collectionColumns = options.collectionColumns;
		
		this.bind();
		
		//this.rootNode = rootNode;
	};
	
	ns.PluginFacetTree.prototype = {
		bind: function() {
			
			console.log("binding facet tree");
			
			var facetWidget = this.facetWidget;
			
			//var node = this.rootNode;
		
			// Register to the item add event
			// Note: We do not need to bind to item removed explicetly, as
			// we simply bind the live of plugin-additions to the life of the
			// added model
			facetWidget.on('itemAdded', this.onItemAdded);
			
			
			//node.on('nodeCreated', onNodeCreated);
			//node.on('nodeDestroyed', onNodeDestroyed);
			
			var viewModels = facetWidget.getViewModels();
			console.log('viewItems: ', viewModels);
			
			this.initRecCollection(viewModels);
		},
	
		onItemAdded: function(ev) {
			
			console.log("yeah", ev);
			
			var viewItem = ev.viewModel.get('view');
			this.install(viewItem);
			
		},
		
		initRecItem: function(viewItem) {
			install(viewItem);
			
			var childView = node.getChildView();
			
			if(childView) {
				var viewItems = childView.getViewItems();
				this.initRecCollection(viewItems);
			}
		},
		
		initRecCollection: function(viewModels) {
			var self = this;
			viewModels.each(function(viewModel) {
				var viewItem = viewModel.get('view');
				self.initRecItem(viewItem);
			});
		},
		
		
		
		install: function(viewItem) {
		
			var viewItemModel = viewItem.model;
			
			console.log("Installing table plugin on: ", viewItem);


			// get the node's hover and perma areas
			var $elPerma = viewItem.getPermaArea();
			var $elHover = viewItem.getHoverArea();

			
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();

			var collectionColumns = this.collectionColumns;

			// NOTE By setting the view's model to that of viewItemModel,
			// we bind the life time of the plugin's additions to that of the original model
			var viewItemAddToTable = new widgets.ViewItemLink({
				model: viewItemModel,
				subView: new ns.ViewItemIcon({
					model: viewItemModel,
					attributes: {
						'class': 'icon-circle-arrow-right'
					},
					fnState: function(model) {
						return '' + model.get('isAddedToTable');
					},
					stateToAttrs: {
						'false': { style: 'display: block'},
						'true': { style: 'display: none'}
					}
				}),
				events: {
					'click': function() {
						collectionColumns.addPath(path);
					}
				}
			});


			var viewItemRemoveFromTable = new widgets.ViewItemLink({
				model: viewItemModel,
				subView: new ns.ViewItemIcon({
					model: viewItemModel,
					attributes: {
						'class': 'icon-remove-circle'
					},
					fnState: function(model) {
						return '' + model.get('isAddedToTable');
					},
					stateToAttrs: {
						'false': { style: 'display: none'},
						'true': { style: 'display: block'}
					},
					events: {
						'click': function() {
							collectionColumns.removePath(path);
						}
					}
				})
			});

			/////var facetFacadeNode = model.get('facetFacadeNode');
			/////this.path = facetFacadeNode.getPath();
			
			// children.bind('add', this.add)
			var controllerColumnSync = new ns.ControllerColumnSync(
					path,
					viewItemModel,
					this.collectionColumns
			);


			var $elAddToTable = viewItemAddToTable.render().$el;
			$elHover.append($elAddToTable);

			
			var $elRemoveFromTable = viewItemRemoveFromTable.render().$el;
			$elPerma.append($elRemoveFromTable);

			
		}
	};
	
	
	
	

	
	
	
	
})();
