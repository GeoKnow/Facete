
	widgets.ModelFactoryNodeLabel = function(labelSyncer) {
		this.labelSyncer = labelSyncer;
	};

	widgets.ModelFactoryNodeLabel.prototype = {
		createModels : function(uriStrs) {

		}
	};

	widgets.ModelNodeLabel = Backbone.Model.extend({
		defaults : {
			// id should be sparql.Node.toString()
			label : "(no label set)"
		}
	});

	widgets.CollectionNodeLabel = Backbone.Collection.extend({
		model : widgets.ModelNodeLabel
	});

	widgets.ViewItemNodeLabel = Backbone.View.extend({
		tagName : 'span',
		initialize : function() {
			_.bindAll(this);

			var labelSync = this.options.labelSync;
			checkNotNull(labelSync);

		},
		render : function() {
			var label = model.get("label");
			this.$el.text(label);
		},
		unrender : function() {
			this.$el.remove();
		}
	});

	
	/**
	 * Updates the labels of all registered models. Note: This class should only
	 * be used for UPDATING the labels; not for fetching the initial ones.
	 * 
	 * 
	 * @param labelFetcher
	 * @param collection
	 * @returns {widgets.ConstrollerLabelSync}
	 */
	widgets.ConstrollerLabelSync = function(labelFetcher, collection) {
		this.labelFetcher = labelFetcher;
		this.collection = collection ? collection
				: new widgets.CollectionNodeLabel();
	};

	widgets.ConstrollerLabelSync.prototype = {
		getCollection : function() {
			return this.collection;
		},

		/**
		 * Returns a promise yielding an array of models
		 * 
		 * @param uriStrs
		 */
		getModels : function(uriStrs) {
			var self = this;
			var promise = this.labelFetcher.fetchUris(uriStrs).pipe(
					function(labelInfo) {
						var uriToLabel = labelInfo.uriToLabel;

						var collection = self.collection;

						// var uris = labelInfo.uris;
						_.each(uriToLabel, function(label, uri) {
							var entry = {
								id : uri,
								label : label
							};

							// TODO: Make sure existing models are updated and
							// not destroyed
							collection.add(entry);
						});
					});

			return promise;
		},

		sync : function() {

			var uriStrs = this.collection.chain().map(function(model) { // Get
																		// the
																		// nodes
				var node = model.get("node");
				return node;
			}).filter(function(node) { // Only retain URIs
				var result = node && node.isUri();
				return result;
			}).map(function(node) { // Get the URI strings
				return node.value;
			}).value();

			var result = this.getModels(uriStrs);
			return result;
		}
	};
