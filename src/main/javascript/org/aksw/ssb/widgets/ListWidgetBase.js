(function($) {

	var ns = Namespace("org.aksw.ssb.widgets");
	
	ns.agilityJsIndexChildren = function(parent) {
		var result = {};
		
		parent.each(function(child) {
			var id = child.getId();
			
			result[id] = child;
		});
		
		return result;		
	};
	
	ns.itemLabel = $$({label: ""}, '<li><span data-bind="label" /></li>');
	
	ns.ItemFactoryString = function(parent, data) {
		return $$(ns.itemLabel, {parent: parent, label: data});
	};
	
	ns.listWidget = $$({
		view: { format: '<ul class="nav nav-list"></ul>', },
		model: {itemFactory: ns.ItemFactoryString},
		controller: {},

		clear: function() {
			this.each(function(child) {
				child.destroy();
			});
		},
		
		addItem: function(item) {
			this.append(item);
		},
		removeItem: function(item) {
			this.remove(item);
		},
		setListModel: function(listModel) {
			this.model.set({listModel: listModel});
		},
		getListModel: function() {
			return this.model.get("listModel");
		},
		setItemFactory: function(fn) {
			this.model.set({itemFactory: fn});
		},
		getItemFactory: function() {
			return this.model.get("itemFactory");
		},		
		syncView: function(keyToData) {
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
					item.model.set(data);
					item.setData(data);
				} else {
					item = self.getItemFactory()(self, data);
					
					self.append(item);
				}
			});
			
			
			
		},
		
		refresh: function() {
			var self = this;
			var task = this.getListModel().fetchData();
			
			$.when(task).then(function(keyToData) {
				
				self.syncView(keyToData);				
				
			});
		}
		
	});
	
	
	
	ns.createListWidget = function(model, itemFactory) {
		var result = $$(ns.listWidget);
		console.log("ListWidget", result);
		
		if(itemFactory) {
			result.setItemFactory(itemFactory);
		}
		result.setListModel(model);
		
		
		
		result.refresh();
			
		return result;
	};
	
	
})(jQuery);
