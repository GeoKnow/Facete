(function() {

	var uriUtils = Namespace("org.aksw.ssb.utils.uris");

	var ns = Namespace("org.aksw.utils.backbone");

	
	ns.DefaultModel = Backbone.Model.extend({
		defaults: {
			//value: null,
			/*label: "" // FIXME As there could be many ways for crafting constraint labels, 
				//associating a label only makes sense for view-models;*/  
	    }
	});
	
	ns.DefaultCollection = Backbone.Collection.extend({
		model: ns.DefaultModel
	});

	
	ns.fnDefaultId = function(item, row, offset) {
		return offset + row;
	};
	

	
	/**
	 * Returns a key from the model based on the binding.
	 * 
	 * 
	 */
	ns.getModelValue = function(model, key, binding) {
		var b = binding ? binding[key] : null;
		var result;

		if (b) {
			if (typeof b === 'function') {
				return b(model);
			} else {
				return model.get(b);
			}
		} else {
			return model.get(key);
		}
	};

	/**
	 * A seemingly useful routing approach for separating configuration and
	 * behaviour of routers.
	 * 
	 * Usage Example:
	 * 
	 * var appMethods = {...};
	 * 
	 * var AppRouter = backboneUtils.AppRouter.extend({
	 *     routes: {
	 *         ...
	 *     }     
	 * });
	 * 
	 * var appRouter = new AppRouter({app: app});
	 * 
	 * Backbone.history.start();
	 * 
	 * 
	 * Source:
	 * http://lostechies.com/derickbailey/2012/01/02/reducing-backbone-routers-to-nothing-more-than-configuration/
	 * 
	 */
	ns.AppRouter = Backbone.Router.extend({

		constructor : function(options) {
			Backbone.Router.prototype.constructor.call(this, options);

			if (this.routes) {
				this.processAppRoutes(options.app, this.routes);
			}
		},

		processAppRoutes : function(app, appRoutes) {
			var method, methodName;
			var route, routesLength;
			var routes = [];
			var router = this;

			for (route in appRoutes) {
				routes.unshift([ route, appRoutes[route] ]);
			}

			routesLength = routes.length;
			for ( var i = 0; i < routesLength; i++) {

				route = routes[i][0];
				methodName = routes[i][1];
				method = app[methodName];
				router.route(route, methodName, method);

			}
		}

	});
	
	/**
	 * 
	 * @param fnPromise A function that returns a promise that upon completion return the new state
	 */
	ns.slaveCollection = function(masterCollection, slaveCollection, fnPromise) {
		masterCollection.on("add", function(model) {
			
			var clone = jQuery.extend(true, {}, model.attributes);

			
			var promise = fnPromise(clone);
			$.when(promise).done(function(newState) {
				// TODO Treat request order properly
				slaveCollection.add(newState);
				//var newState = fn(model.attributes);
			});
		});
		
		masterCollection.on("remove", function(model) {
			// TODO Delete by id AND/OR cid
			slaveCollection.remove(model.id);			
		});
	};
	
	
	
	/**
	 * fnId(item, row, offset)
	 * 
	 */
	ns.BackboneSyncQuery = function(sparqlService, collection, fnPostProcess) {
		this.sparqlService = sparqlService;
		this.collection = collection ? collection : new ns.DefaultCollection();
		//this.fnId = fnId ? fnId : ns.fnDefaultId; // A function that returns the Id of items delivered by the tableModel
		this.fnPostProcess = fnPostProcess;
		
		this.taskCounter = 0;
	};
	
	ns.BackboneSyncQuery.prototype = {
			getCollection: function() {
				return this.collection;
			},
	
			sync: function(query) {
				var result = $.Deferred();
		
				this.taskCounter++;
				
				var queryExecution = this.sparqlService.executeSelect(query);
				var self = this;
				
				var tmp = self.taskCounter;
				
				
				queryExecution.done(function(jsonRs) {

					if(self.taskCounter != tmp) {
						result.fail();
						return;
					}
					
					var postProcessTask;
					if(self.fnPostProcess) {
						postProcessTask = self.fnPostProcess(jsonRs);
					} else {
						postProcessTask = queryExecution;
					}
						
					postProcessTask.done(function(jsonRs) {
						if(self.taskCounter != tmp) {
							result.fail();
							return;
						}

						var resolveData = self.processResult(jsonRs);
						
						result.resolve(resolveData);
					}).fail(function() {
						result.fail();
					});
																
				}).fail(function() {
					result.fail();
				});
				
				return result.promise();
			},
			
			
			processResult: function(jsonRs) {
				var offset = jsonRs.offset ? jsonRs.offset : 0;
				var bindings = jsonRs.results.bindings; //data;
				
				var destroyModels = [];
				
				this.collection.each(function(model) {
					destroyModels.push(model);
				});
				
				// The browsing experience is better, if first the new models are added
				// and then the old ones removed:
				// Removal of models may cause the page to shrink, and therefore change the location the user is viewing
				// before the new models are added
				
				//self.collection.reset();
				
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					
					//var id = self.fnId(binding, i, offset);
					var id = offset + i;
					
					binding.id = id;
	
					this.collection.add(binding);
				}
	
				for(var i = 0; i < destroyModels.length; ++i) {
					var model = destroyModels[i];
					model.destroy();
				}
			}
			
			
	};

	/**
	 * Returns a function that processes a json ResultSet:
	 * - parses all plain Json Nodes to sparql.Node objects
	 * - associates the label with each result set binding
	 * 
	 * Note: Having the labels at the resources is convenient;
	 * we could however store the labels in a model. This would allow adding
	 * arbitrary information to resources.
	 */
	ns.createDefaultPostProcessor = function(labelFetcher) {
		
		var fn = function(plainJsonRs) {
			
			jsonRs = uriUtils.parseJsonRs(plainJsonRs);
			
			uris = uriUtils.extractUrisFromJsonRs(jsonRs);
			
			var result = $.Deferred();
			
			var task = labelFetcher.fetch(uris);
	
			
			task.done(function(labelInfo) {
			
				uriUtils.transformJsonRs(jsonRs, function(node) {
						
					var result = {node: node};
					
					if(node && node.isUri()) {
						result.label = labelInfo.uriToLabel[node.value];
					}
					
					return result;
				});
	
				result.resolve(jsonRs);
			}).fail(function() {					
				result.fail();
			});
			
			return result.promise();
		};
		
		return fn;
	};
	
	
	
	ns.BackboneCollectionRdf = Backbone.Collection.extend({
		initialize: function(models, options) {

			this.options = options;
			
			//console.log("Collection:", sparqlService, postProcessor);
			
			this.syncer = new ns.BackboneSyncQuery(options.sparqlService, this, options.postProcessor);			
		},

		sync: function(jsonRs) {
			
			if(!query) {
				query = this.options.query;
			}
			
			if(!query) {
				throw "No query specified";
			}
			
			this.syncer.sync(query);
			
		}		
	});
	
	/**
	 * fnId(item, row, offset)
	 * 
	 */
	ns.SyncerRdfCollection = function(collection, fnPostProcess) {
		this.collection = collection ? collection : new ns.DefaultCollection();
		//this.fnId = fnId ? fnId : ns.fnDefaultId; // A function that returns the Id of items delivered by the tableModel
		this.fnPostProcess = fnPostProcess;
		
		this.taskCounter = 0;
	};
	
	ns.SyncerRdfCollection.prototype = {
			getCollection: function() {
				return this.collection;
			},
	
			sync: function(jsonRs) {

				var result = $.Deferred();
				var self = this;

				++self.taskCounter;
				var tmp = self.taskCounter;
				
				
				if(self.fnPostProcess) {
					var postProcessTask = self.fnPostProcess(jsonRs);
					
					postProcessTask.done(function(jsonRs) {
						if(self.taskCounter != tmp) {
							result.fail();
							return;
						}
	
						var resolveData = self.processResult(jsonRs);
						
						result.resolve(resolveData);
					}).fail(function() {
						result.fail();
					});
				} else {
					result.resolve(jsonRs);
				}
				
				return result.promise();
			},
			
			
			processResult: function(jsonRs) {
				var offset = jsonRs.offset ? jsonRs.offset : 0;
				var bindings = jsonRs.results.bindings; //data;
				
				var newModels = [];
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					
					var id = offset + i;
					
					binding.id = id;
	
					newModels.push(binding);
				}
	
				console.log("New models", newModels);
				this.collection.reset(newModels);
			}			
	};
	
	
	
	ns.BackboneSyncQueryCollection = Backbone.Collection.extend({
		initialize: function(models, options) {

			this.options = options;
			
			//console.log("Collection:", sparqlService, postProcessor);
			
			this.syncer = new ns.BackboneSyncQuery(options.sparqlService, this, options.postProcessor);			
		},

		sync: function(query) {
			
			if(!query) {
				query = this.options.query;
			}
			
			if(!query) {
				throw "No query specified";
			}
			
			this.syncer.sync(query);
			
		}
	
	});

})();