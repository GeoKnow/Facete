(function($) {

	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var stringUtils = Namespace("org.aksw.ssb.utils.strings");

	
	var ns = Namespace("org.aksw.ssb.widgets");
	
	
	// TODO Make use of backbone for the selection model
	ns.SelectionModel = Backbone.Model.extend({
		defaults: {
			isSelected: false,
			label: "no label provided",
			data: null
	    }
	});

	
	ns.SelectionCollection = Backbone.Collection.extend({
		model: ns.SelectionModel
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	ns.ListModelSimple = function() {
		
	};
	
	
	ns.ListItem = $$({
		setId: function(id) {
			this.model.set({id:id});
		},
		
	
		getId: function() {
			return this.model.get(id);
		}
	});
	
	
	ns.agilityJsIndexChildren = function(parent) {
		var result = {};
		
		parent.each(function(index, child) {
			
			var id = child.model.get("id");
			//console.log("Child id is", id);
			
			result[id] = child;
		});
		
		return result;		
	};
	
	ns.itemLabel = $$({label: ""}, '<li><span data-bind="label" /></li>', {
		'click span': function() {

			var parent = this.model.get("parent");
			console.log("Triggereing click event on ", parent);
			//alert("parent is: " + parent);
			if(parent) {
				parent.trigger("click", {isChild: true, item: this, data: this.model.get("data")});
			}
		}
	});
	
	ns.RendererString = function(fnId, binding) {
		this.fnId = fnId;
		this.binding = binding;
	};
	
	ns.getDataValue = function(data, key, binding) {
		var b = binding ? binding[key] : null;
		var result;

		if(b) {
			if(typeof b === 'function') {
				return b(data);
			} else {				
				return data[b];
			}
		} else {
			return data[key];
		}
	};
	
	ns.RendererString.prototype.create = function(data, parent) {
		var label = ns.getDataValue(data, "label", this.binding);
		
		var result = $$(ns.itemLabel, {parent: parent, label: label, fnId: this.fnId, data: data});
		
		return result;
	};
	
	
	/**
	 * A simple list widget.
	 * 
	 * TODO I think we should distinguish between a pure view-only list widget,
	 * and a view+model list widget.
	 * 
	 */
	ns.ListWidget = $$({
		//view: { format: '<ul class="nav nav-list"></ul>', },
		view: { format: '<ul></ul>' },
		model: {itemRenderer: new ns.RendererString(), collection: []},
		/*
		controller: {
			'change': function() {
				
				var fnId = this.getFnId();
				
				var keyToData = {};
				
				_.each(this.getCollection(), function(data) {
					var id = fnId(data);
					keyToData[id] = data;
				});
				
				//console.log("Synch", keyToData);
				this.syncView(keyToData);
			}			
		},*/
		/*
		getContainerElement: function() {
			return this.view.$();
		},
		*/
		clear: function() {
			this.each(function(i, child) {
				child.destroy();
			});
		},
		getItems: function() {
			var result = [];
			this.each(function(i, item) {
				result.push(item);
			});
			return result;
		},
		trimToSize: function(size) {
			var items = this.getItems();
			
			for(var i = size; i < items.length; ++i) {
				items[i].destroy();
			}
		},
		/*
		setCollection: function(collection) {
			this.model.set({collection: collection});
		},
		getCollection: function() {
			return this.model.get("collection");
		},
		*/
		addItem: function(item) {
			//console.log("Item is", item);
			this.append(item);//, this.getContainerElement());
		},
		removeItem: function(item) {
			this.remove(item);
		},
		setModel: function(listModel) {
			this.model.set({listModel: listModel});
		},
		getModel: function() {
			return this.model.get("listModel");
		},
		setItemRenderer: function(itemRenderer) {
			this.model.set({itemRenderer: itemRenderer});
		},
		getItemRenderer: function() {
			return this.model.get("itemRenderer");
		},		
		getFnId: function() {
			return this.model.get("fnId");
		},
		setFnId: function(fnId) {
			this.model.set({fnId: fnId});
		},
		syncView2: function(collection) {
			this.clear();
			
			var self = this;
			//var collection = this.getCollection();
			var renderer = self.getItemRenderer();
			//console.log("ListWidget, Renderer", renderer);
			_.each(collection, function(item) {
								
				itemView = renderer.create(item, self);
				
				
				//console.log("Rendered item ", item, itemView);

				self.append(itemView);
			});
			
			//this.trimToSize(collection.size());
		},
		
		syncView: function(keyToData) {
			
			//console.log("[ListWidget] sync view, data: ", keyToData);
			
			this.syncView2(keyToData);
			return;
			
			var idToItem = ns.agilityJsIndexChildren(this);

			// Destroy all children for which there is no key
			var oldKeys = _.keys(idToItem);
			var newKeys = _.keys(keyToData);
			
			var toRemove = _.difference(oldKeys, newKeys);
			_.each(toRemove, function(id) {
				var item = idToItem[id];
				if(item) {
					item.destroy();
				}
			});
			
			
			var self = this;
			_.each(newKeys, function(key) {
				var item = idToItem[key];
				var data = keyToData[key];
				
				if(item) {
					//console.log("Update", item, "with", data);
					item.model.set(data);
					//item.setData(data);
					item.view.sync();
				} else {
					item = self.getItemRenderer().create(data, self);
					
					//console.log("Append", item);
					self.append(item);//, self.getContainerElement());
				}
			});
			
			
		},
		
		refresh: function() {
			var listModel = this.getModel();
			
			//console.log("listModel", listModel);
			if(!listModel || !listModel.fetchData) {
				return;
			}

			var self = this;
						
			var task = listModel.fetchData();
			$.when(task).then(function(collection) {
				
				//console.log("[List Widgeht] Fetched data", collection);
				self.syncView(collection);
				
			});
		}
		
	});
	
	/*
	ns.createListWidget2 = function(itemRenderer, fnId) {
		var result = $$(ns.ListWidget);
		//console.log("ListWidget", result);
		
		if(itemRenderer) {
			result.setItemRenderer(itemRenderer);
		}
		
		if(fnId) {
			result.setFnId(fnId);
		}
		
		return result;
		//result.setListModel(model);
		
	};
	*/

	
	ns.ListView = Backbone.View.extend({
		//el: $('body'), // el attaches to existing element
		tagName: 'ul',
	    events: {
	    },
	    initialize: function(){
	    	// _.bindAll(this, 'render', 'addItem', 'appendItem'); // every function that uses 'this' as the current object should be in here
	      
	    	//this.collection = new List();
	    	//this.collection.bind('add', this.appendItem); // collection event binder

	    	this.collection.bind('add', this.addModel, this);
	    	//this.collection.remove('remove', this.unrender, this);
	    	this.collection.bind('reset', this.clear, this);
	    	
	    	this.render();
	    },
	    addModel: function(model) {
			var renderer = this.getItemRenderer();	
			
			//console.log("Options", this.options);

			//itemView = renderer.create(model, this);
			//this.appendItem(itemView);	    	
			
			var element = renderer.create(model, this);
			this.appendElement(element);
	    },
	    render: function() {
			//this.clear();
			
			var self = this;

			this.collection.each(function(model) {
				self.addModel(model);
				/*
				var renderer = self.getItemRenderer();				
				itemView = renderer.create(self, item);
				self.appendItem(itemView);
				*/
			});
			
			return this;
	    },
	    unrender: function() {
	    	$(this.el).remove();
	    },
	    appendElement: function(element) {
	    	$(this.el).append(element);
	    },
	    appendItem: function(itemView) {
	    	$(this.el).append(itemView.render().el);
	    },
	    getItemRenderer: function() {
	    	return this.options.itemRenderer;
	    },
	    clear: function() {
	    	$(this.el.children).remove();
	    }
	});
	
	
	/**
	 * A simple list widget.
	 * 
	 * TODO I think we should distinguish between a pure view-only list widget,
	 * and a view+model list widget.
	 * 
	 */
	/*
	ns.ListWidgetBackbone = $$({
		//view: { format: '<ul class="nav nav-list"></ul>', },
		view: { format: '<ul></ul>' },
		model: {itemRenderer: new ns.RendererString()},

		getContainerElement: function() {
			return this.view.$();
		},
		clear: function() {
			this.each(function(i, child) {
				child.destroy();
			});
		},
		getItems: function() {
			var result = [];
			this.each(function(i, item) {
				result.push(item);
			});
			return result;
		},
		trimToSize: function(size) {
			var items = this.getItems();
			
			for(var i = size; i < items.length; ++i) {
				items[i].destroy();
			}
		},
		addItem: function(item) {
			console.log("Item is", item);
			this.append(item);//, this.getContainerElement());
		},
		removeItem: function(item) {
			this.remove(item);
		},
		setCollection: function(collection) {
			var old = this.getCollection();
			
			
			if(old) {
				old.unbind("add", this.refresh, this);
				old.unbind("remove", this.refresh, this);
			}
			
			collection.bind("add", this.refresh, this);
			collection.bind("remove", this.refresh, this);

			
			this.model.set({collection: collection});
		},
		getCollection: function() {
			return this.model.get("collection");
		},
		setItemRenderer: function(itemRenderer) {
			this.model.set({itemRenderer: itemRenderer});
		},
		getItemRenderer: function() {
			return this.model.get("itemRenderer");
		},		
		getFnId: function() {
			return this.model.get("fnId");
		},
		setFnId: function(fnId) {
			this.model.set({fnId: fnId});
		},
//		sync3: function() {
//			this.syncView2(this.getCollection());
//		},
		syncView2: function(collection) {
			this.clear();
			
			var self = this;
			//var collection = this.getCollection();

			var renderer = this.getItemRenderer();
			collection.each(function(item) {
				console.log("RenderingItem: ", item);
				
				//console.log("ListWidgetBackbone, renderer:", renderer);
				
				itemView = renderer.create(item, self);
				self.append(itemView);
			});
			
			//this.trimToSize(collection.size());
		},
		
		syncView: function(keyToData) {
			
			this.syncView2(keyToData);
			return;
			
			var idToItem = ns.agilityJsIndexChildren(this);

			// Destroy all children for which there is no key
			var oldKeys = _.keys(idToItem);
			var newKeys = _.keys(keyToData);
			
			var toRemove = _.difference(oldKeys, newKeys);
			_.each(toRemove, function(id) {
				var item = idToItem[id];
				if(item) {
					item.destroy();
				}
			});
			
			
			var self = this;
			_.each(newKeys, function(key) {
				var item = idToItem[key];
				var data = keyToData[key];
				
				if(item) {
					console.log("Update", item, "with", data);
					item.model.set(data);
					//item.setData(data);
					item.view.sync();
				} else {
					item = self.getItemRenderer().create(self, data);

					console.log("Append", item);
					self.append(item);//, self.getContainerElement());
				}
			});
			
			
		},
		
		refresh: function() {
			var collection = this.getCollection();
			
			console.log("listModel", collection);
			if(!collection) {
				return;
			}

			var self = this;
						
			self.syncView(collection);
		}
		
	});

	
	ns.createListWidgetBackbone = function(collection, itemRenderer) {
		var result = new ns.ListView({collection: collection, itemRenderer: itemRenderer});
		
		/*
		var result = $$(ns.ListWidgetBackbone);
		
		if(itemRenderer) {
			result.setItemRenderer(itemRenderer);
		}
		result.setCollection(collection);
		result.refresh();
		* /
			
		return result;
	};
*/
	
	
	

	ns.ItemViewCheckbox = Backbone.View.extend({
		tagName: 'li',
		
		events: {
			'click span': function() {
				$(this.parent).trigger("click", {isChild: true, item: this, model: this.model});				
			}
		},
		
		initialize: function() {
			this.parent = this.options.parent;
			
			if(!parent) {
				console.error("No parent container provided");
			}
			
			
			this.model.bind('change', this.render, this);
			this.model.bind('remove', this.unrender, this);
		},
	
	    render: function() {
	    	var label = this.model.get("label");
	    	var state = this.model.get("isSelected");
	
	    	var stateStr = state ? "checked" : "";
	    	
	        $(this.el).html('<input type="checkbox" checked="' + stateStr + '"/><span>' + label + '</span>');
	        return this;
	    },
	    
	    unrender: function() {
	    	$(this.el).remove();
	    },
	    
	    destroy: function() {
	    	this.unrender();
	    }
	});


	ns.ItemViewLabel = Backbone.View.extend({
		tagName: 'li',
		
		events: {
			'click span': function() {
				$(this.options.parent).trigger("click", {isChild: true, item: this, model: this.model});				
			}
		},
		
		initialize: function() {
			if(!this.options.parent) {
				console.error("No parent container provided");
			}
			
			
			this.model.bind('change', this.render, this);
			this.model.bind('remove', this.unrender, this);
		},
	
	    render: function() {
	    	var label = backboneUtils.getModelValue(this.model, "label", this.options.binding);
	    	
	    	
	        $(this.el).html('<span style="cursor: pointer;">' + stringUtils.escapeHTML(label) + '</span>');
	        // $(this.el).html('<span style="cursor: pointer;">' + "Label " + this.model.get("label") + '</span>');
	        
	        return this; // for chainable calls, like .render().el
	    },
	    
	    unrender: function() {
	    	$(this.el).remove();
	    }
	});
	

	/**
	 * A Renderer for selectable items, such as Checkbox-items
	 * 
	 * @param selectionModel
	 * @param fnId
	 * @param ctor
	 * @param binding
	 * @returns {ns.RendererItemView}
	 */
	ns.RendererItemView = function(selectionModel, fnId, ctor, binding) {
		this.selectionModel = selectionModel;
		this.fnId = fnId ? fnId : function(x) { return x.id; };
		this.ctor = ctor;
		this.binding = binding; // A mapping form model attributes to render attributes
	};
	
	ns.RendererItemView.prototype.create = function(model, parent) {
		var id = this.fnId(model);
		
		//console.debug("Rendering id: " + id);
		
		var itemView = new this.ctor({parent: parent, model: model, binding: this.binding});
		
		var result = itemView.render().el;
		
		return result;
	};

	
	
	ns.createListWidget = function(model, itemRenderer) {
		var result = $$(ns.ListWidget);
		
		if(itemRenderer) {
			result.setItemRenderer(itemRenderer);
		}
		result.setModel(model);
		
		
		
		result.refresh();
			
		return result;
	};
	
	
})(jQuery);
