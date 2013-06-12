(function() {

	var uriUtils = Namespace("org.aksw.ssb.utils.uris");

	var ns = Namespace("org.aksw.utils.backbone");



	/**
	 * This class enables syncing data from (an array of) promises
	 * into the target collection
	 *
	 * Obtained data is related to the parameter index of the promise.
	 * If sync is called again with new promises, each
	 * partition of the prior promises is updated.
	 * 
	 * Constraints:
	 * - The data returned by the promises should have proper id-properties set
	 * 
	 * @param collection
	 * @returns {ns.CollectionCombine}
	 */
	ns.CollectionCombine = function(collection) {
		this.collection = collection ? collection : new Backbone.Collection();			
		this.state = [];
		this.syncId = 0;
	};
	
	ns.CollectionCombine.prototype = {

		getCollection: function() {
			return this.collection;
		},				
	
		sync: function(promises) {
		
			var state = this.state;
			var collection = this.collection;
			
			// Add
			{
				var delta = promises.length - state.length;
				for(var i = 0; i < delta; ++i) {
					state[i] = [];
				}
			}
			
			// Remove
			{
				var delta = state.length - promises.length;
				
				for(var i = state.length - 1; i > promises.length; --i) {
					var tmp = state[i];
					collection.remove(tmp);					
				}
				state.splice(promises.length, delta);				
			} 
		
			var self = this;
			var syncId = ++this.syncId;
		
			//var dataProviders = this.dataProviders;
			
			var handleData = function(data, i) {
				if(syncId != self.syncId) {
					return;
				}
				
				//console.log("Syncing with data: ", data);
			
				var tmp = self.state[i];
				self.collection.remove(tmp);

				state[i] = data;
				if(data) { // FIXME only reject null and undefined.
					self.collection.add(data);
				}				
			};
			
			_.each(promises, function(promise, i) {
	
				promise.done(function(data) {
					handleData(data, i);
				}).fail(function(json) {
					// TODO Factor this out into error handling code
					var data = {
						id: "error" + i,
						type: "error",
						data: json
					};
					
					handleData(data, i);
				});
									
			});
		}
	};

	
	
	
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
				result = b(model);
			} else {
				result = model.get(b);
			}
		} else {
			result = model.get(key);
		}
		
		return result;
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

	
	ns.ControllerSlaveCollection = function(masterCollection, slaveCollection, fnTransform) {
		this.masterCollection = masterCollection;
		this.slaveCollection = slaveCollection;
		this.fnTransform = fnTransform;
		
		this.bind();
	};
	
	ns.ControllerSlaveCollection.prototype = {
		bind: function() {
			_.bindAll(this);
			this.masterCollection.on('add', this.onAdd);
			this.masterCollection.on('remove', this.onRemove);
			this.masterCollection.on('reset', this.onReset);
		},
		
		onAdd: function(model) {
			var newModel = fnTransform(model);
			
			this.slaveCollection.add(newModel);			
		},
		
		onRemove: function(model) {
			var newModel = fnTransform(model);
			
			this.slaveCollection.remove(newModel.id);
		},
		
		onReset: function(collection) {
			var self = this;
			var newModels = collection.map(function(model) {
				var newModel = self.fnTransform(model);
				return newModel;
			});

			this.slaveCollection.reset(newModels);
		}
	};
	
	/**
	 * 
	 * @param fnPromise A function that returns a promise that upon completion return the new state
	 */
	ns.slaveCollection = function(masterCollection, slaveCollection, fnPromise) {
		masterCollection.on("add", function(model) {
			
			var clone = jQuery.extend(true, {}, model.attributes);

			
			var promise = fnPromise(clone);
			promise.done(function(newState) {
				// TODO Treat request order properly
				slaveCollection.add(newState);
				//var newState = fn(model.attributes);
			});
		});
		
		masterCollection.on("remove", function(model) {
			// TODO Delete by id AND/OR cid
			slaveCollection.remove(model.id);			
		});
		
		masterCollection.on('reset', function(collection, options) {
			
			slaveCollection.reset();
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
				
				
				queryExecution.success(function(jsonRs) {

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
						
					postProcessTask.success(function(jsonRs) {
						if(self.taskCounter != tmp) {
							result.fail();
							return;
						}

						self.processResult(jsonRs);
						//console.log("Rosult", jsonRs);
						result.resolve(jsonRs);
						//var resolveData = self.processResult(jsonRs);
						
						//result.resolve(resolveData);
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
	 * Deprecated: Resource labels are set on the DOM level using SpanI18N
	 * 
	 * 
	 * --
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
			
			//console.log("plainJsonRs", plainJsonRs);
			
			//var before = JSON.stringify(plainJsonRs);
			
			var jsonRs = uriUtils.parseJsonRs(plainJsonRs);
			//var after = JSON.stringify(plainJsonRs);

			 /*
			if(before !== after) {
				console.log("Before: " + before);
				console.log("After: " + after);
				throw "Modification exception";
			}
			
			console.log("JSON RS IS NOW", jsonRs);
			*/
			var uris = uriUtils.extractUrisFromParsedJsonRs(jsonRs);
			
			
			var result = $.Deferred();
			
			var task = labelFetcher.fetch(uris);
	
			
			task.done(function(labelInfo) {
			
				var transformed = uriUtils.transformJsonRs(jsonRs, function(node) {
						
					var result = {node: node};
					
					//console.log("Node", jsonRs, node);
					
					if(node && node.isUri()) {
					//if(node && (node.type === "uri" || (node instanceof sparql.Node && node.isUri()))) {

						var label = labelInfo.uriToLabel[node.value];
						
						if(!label) {
							var str = uriUtils.extractLabelFromUri(node.value);
							label = {value: str};
						}
						
						//console.log("Label for node " + node + " is " + label.value);
						
						
						result.label = label;
					}
					
					
					return result;
				});
	
				result.resolve(transformed); //jsonRs);
			}).fail(function() {					
				result.fail();
			});
			
			return result.promise();
		};
		
		
		// Assign an id for debug reasons 
		if(!ns.createDefaultPostProcessor.id) {
			ns.createDefaultPostProcessor.id = 0;
		} 
		fn.id = ++ns.createDefaultPostProcessor.id; 

		
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
	
		if(!ns.SyncerRdfCollection.id) {
			ns.SyncerRdfCollection.id = 0;
		}
		
		this.id = ++ns.SyncerRdfCollection.id; 
	};
	
	
	ns.SyncerRdfCollection.prototype = {
			getCollection: function() {
				return this.collection;
			},
			
			setPostProcessFn: function(postProcessFn) {
				this.fnPostProcess = postProcessFn;
			},
	
			sync: function(jsonRs, offset) {
				//console.log("Sync [Start] ", this.id, "with " + JSON.stringify(jsonRs));
				
				var result = $.Deferred();

				++this.taskCounter;
				var tmp = this.taskCounter;
				
				
				var self = this;
				if(this.fnPostProcess) {
					var postProcessTask = this.fnPostProcess(jsonRs);
	
					
					//console.log("Post processor for ", this.id, " is ", this.fnPostProcess.id);
					
					postProcessTask.done(function(procJsonRs) {
						//console.log("Sync [PostProcess] ", self.id, JSON.stringify(procJsonRs));
						
						if(self.taskCounter != tmp) {
							result.fail();
							console.log("Action was superseded by another update - Fail");
							return;
						}
						
						result.resolve(procJsonRs);
					}).fail(function() {
						result.fail();
					});
				} else {
					result.resolve(jsonRs, offset);
				}

				
				var last = result.pipe(function(resultJsonRs) {
					self.processResult(resultJsonRs);
				});
				
				return last; //result.promise();
			},
			
			
			processResult: function(jsonRs, offset) {

				//var offset = jsonRs.offset ? jsonRs.offset : 0;
				if(!offset) {
					offset = 0;
				}
				
				var bindings = jsonRs.results.bindings; //data;
				
				var newModels = [];
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					
					var id = offset + i;
					
					binding.id = id;
	
					newModels.push(binding);
				}

	
				//console.log("New models", JSON.stringify(newModels));
				//console.log("Sync [Reset] ", this.id, " with " + JSON.stringify(jsonRs));
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