(function() {
	
var ns = Namespace("org.aksw.ssb.facets");
	
(function(ns) {

	
	ns.QueryFactory = function() {		
	};
	
	ns.QueryFactory.prototype = {
		createQuery: function() {
			throw new "Not implemented";
		}
	};

	
	/**
	 * Sucks that JavaScript doesn't really have interfaces... anyway:
	 * 
	 * A QueryFactory  must have a method "create" which returns a query object,
	 * configured according to the current state of the QueryFactory
	 * 
	 * 
	 */
	ns.QueryFactoryQueryGenerator = function(queryGenerator, options) {
		this.queryGenerator = checkNotNull(queryGenerator);
		this.options = options;
	};
	
	ns.QueryFactoryQueryGenerator.prototype = {
		createQuery: function() {
			var result = this.queryGenerator.createQueryValues(this.options);
			return result;
		}
	};
	

	/**
	 * Query factory that always returns a specific preconfigured query
	 * 
	 */
	ns.QueryFactoryQuery = function(query) {
		this.query = query;
	};
	
	ns.QueryFactoryQuery.prototype = {
		createQuery: function() {
			var result = this.query ? this.query.clone() : null;
			return result;
		}
	};
	
	

	/**
	 * Note: A TableModelQuery is also a QueryFactory
	 * 
	 * Additionally, a table model features the getterns/setters:
	 * 
	 * limit
	 * offset
	 * projection
	 * 
	 * queryFactory // Enables exchanging the queryFactory
	 * 
	 * 
	 * TODO: Actually, this class should feature a SPARQL independent view for a table.
	 * 
	 * 
	 * 
	 * 
	 */
	 ns.TableModelQueryFactory = function(queryFactory) {
		this.queryFactory = queryFactory;
		
		// By default, the projection is the same as that of the query
		this.projection = null; //query.getProjection().clone();
		
		// Limit and offset are relative to those of the query
		this.limit = null;
		this.offset = null;
		
		// TODO: A partition could also be specified by a filter element, so in the future we may have a partitionElement attribute as well.		
		// Partition: The graph pattern of the underlying query will be wrapped in a sub query having
		// these limit and offsets.
		this.partitionOffset = null;
		this.partitionLimit = null;
		
		// Additional elements to be injected into the query
		this.elements = [];
		
		
		/* Each element of this array is an object
		 * {
		 *   id: // the id of the column - i.e. the sparql variable to sort
		 *   dir: // the sort direction 'desc' for descending, 'asc' or any other value for ascending 
		 * }
		 */
		this.orderBy = [];
	};

	ns.TableModelQueryFactory.prototype = {
		getProjection: function() {
			return this.projection;
		},
		
		setProjection: function(projection) {
			this.projection = projection;
		},
			
		getLimit: function() {
			return this.limit;
		},
		
		setLimit: function(limit) {
			this.limit = limit;
		},
	
		getPartitionLimit: function() {
			return this.partitionLimit;
		},
		
		setPartitionLimit: function(partitionLimit) {
			this.partitionLimit = partitionLimit;
		},
		
		getPartitionOffset: function() {
			return this.partitionOffset;
		},
		
		setPartitionOffset: function(partitionOffset) {
			this.partitionOffset = partitionOffset;
		},
		
		
		
		setElements: function(elements) {
			this.elements = elements;
		},
		
		getElements: function() {
			return this.elements;
		},
		
		getOffset: function() {
			return this.offset;
		},
		setOffset: function(offset) {
			this.offset = offset;
		},
		getQueryFactory: function() {
			return this.queryFactory;
		},
		setQueryFactory: function(queryFactory) {
			this.queryFactory = queryFactory;
		},
		
		/*
		 * TableModel functions
		 * These function treate a query as a table, and abstract from
		 * SPARQL specifics (e.g. the node/var objects)
		 * 
		 */
		
		/**
		 * Returns an array of column names.
		 * 
		 */
		getColumnIds: function() {
			var query = this.createQuery();
			
			var vars;
			
			if(query.isResultStar()) {
				vars = query.getVarsMentioned();
			} else {
				vars = query.getProjectVars().getVarList();
			}

			
			var result = [];
			for(var i = 0; i < vars.length; ++i) {
				var v = vars[i];
				var varName = v.value;
				
				result.push(varName);
			}

			return result;
		},
		
		getOrderBy: function() {
			return this.orderBy;
		},
		
		
		
		getColumnAttrs: function() {
			
		},

		// TODO Replacing the array may cause unwanted effects, maybe we should get rid of this method - however it is referenced
		setOrderBy: function(orderBy) {
			this.orderBy = orderBy;
		},
		
		
		createQuery: function() {
			var baseQuery = this.queryFactory.createQuery();
			
			if(baseQuery == null) {
				return null;
			}
			
			if(this.partitionOffset || this.partitionLimit) {
				var subQuery = new sparql.Query();
				
				// Copy all elements of the base query to the sub query
				//baseQuery.elements.push.apply(baseQuery.elements, subQuery.elements);
				subQuery.isResultStar = true;
				subQuery.elements = baseQuery.elements;
				subQuery.setOffset(this.partitionOffset);
				subQuery.setLimit(this.partitionLimit);
				
				var elementSubQuery = new sparql.ElementSubQuery(subQuery);
				baseQuery.elements = [ elementSubQuery ];
			}
			
			
			if(this.projection) {
				baseQuery.setProjectVars(this.projection);
			}
			
			var elements = this.elements;
			
			for(var i = 0; i < elements.length; ++i) {
				var element = elements[i];
				
				//var element = new sparql.ElementFilter([expr]);
				
				baseQuery.elements.push(element);
			}
			
			if(this.offset) {
				var baseOffset = baseQuery.offset;
				
				var offset = baseOffset ? baseOffset + this.offset : this.offset;
				
				baseQuery.offset = offset;
			}
			
			if(this.limit) {
				var baseLimit = baseQuery.limit;
				
				var limit = baseLimit ? Math.min(baseLimit, this.limit) : this.limit;
				
				baseQuery.limit = limit;
			}
			
			var orderBy = this.orderBy;
			for(var i = 0; i < orderBy.length; ++i) {
				var item = orderBy[i];
				var id = item.id;

				// if the id is a name, we interpret it as the variable name
				// however, if the id is numeric, we interpret it as a 0-based column index
				var v;
				if(typeof id === 'number') {
					vars = baseQuery.getProjectVars().getVarList();
					if(id >= vars.length) {
						console.log('[ERROR] Ignoring: Index ' + id + ' must be less than ' + vars.length, vars);
						continue;
					}
					
					v = vars[id];
				}
				else {
					v = sparql.Node.v(id);
				}
				
				
				
				var ev = new sparql.ExprVar(v);

				var dir = 1;
				if(item.direction && item.direction < 0) {
					dir = -1;
				}
				
				var sc = new sparql.SortCondition(ev, dir);
				baseQuery.getOrderBy().push(sc);
			}
			
			return baseQuery;
		},
	
	
		/**
		 * Returns an array of expressions
		 */
		createFilters: function() {
			var result = _.map(this.filters, function(varName, constraint) {
				var v = sparql.Node.v(varName);
				var expr = constraint.createExprVar(v);
				return expr;
			});
			
			return result;
		}
	};
	
	
	ns.QueryFactoryKeyword = function(queryFactory, searchVars) {
		this.queryFactory = checkNotNull(queryFactory);
		this.searchVars = searchVars;
		this.searchString = null;
		
		this.tableModel = new facets.TableModelQueryFactory(queryFactory);
	};
	
	
	
	ns.QueryFactoryKeyword.prototype = {
		setSearchString: function(searchString) {
			this.searchString = searchString;
		},
		
		getSearchString: function() {
			return this.searchString;
		},
			
		createQuery: function() {
			var searchString = this.searchString;
			var searchVars = this.searchVars;
			var tableModel = this.tableModel;

			if(searchString) { 
				var elements = queryUtils.createSearchElements(searchString, searchVars);
				tableModel.setElements(elements);
			} else {
				tableModel.setElements([]);
			}
			
			var result = tableModel.createQuery();
			return result;
		}
	};
					
	
	/** 
	 * Returns a new promise that is only resolved 
	 * when data from the initial promise hase been processed by 
	 * fnPostProcess.
	 * 
	 * Note: This is different from pipe, because the post processor
	 * returns a promise rather than data.
	 * 
	 * @param fnPostProcess A function that returns a promise
	 */
	ns.andThen = function(promise, fnPostProcess) {		
		var result = $.Deferred();
		
		promise.done(function() {

			var args = arguments;
			var postProcessTask = fnPostProcess.apply(undefined, args);
				
			postProcessTask.done(function() {
				var args = arguments;
				result.resolve(args);
			}).fail(function() {
				result.fail.apply(undefined, arguments);
			});
														
		}).fail(function() {
			result.fail(undefined, arguments);
		});
		
		return result.promise();
	};
	
	
	/**
	 * A factory for DataProvider objects based on queries
	 * 
	 * @param sparqlService
	 * @param fnPostProcessor
	 * @returns {ns.DataProviderFactoryQuery}
	 */
	ns.DataProviderFactoryQuery = function(sparqlService) {
		this.sparqlService = sparqlService;
	};
	
	ns.DataProviderFactoryQuery.prototype = {
		createDataProvider: function(query) {
			
			var qfq = new ns.QueryFactoryQuery(query);
			var executor = new ns.ExecutorQueryFactory(this.sparqlService, qfq);			
			
			var dataProvider = new facets.DataProvider.Executor(executor);			
			
			return dataProvider;
		}
	};
	
	
	/**
	 * There is two types of post processors:
	 * - Those that execute immediately and therefore .pipe can be used
	 * - Those that form sub tasks 
	 * 
	 * @param executor
	 * @param fnPostProcessor
	 * @returns {ns.DataProviderQueryFactory}
	 */
	ns.DataProviderQueryFactory = function(executor, fnPostProcessor) {
		this.executor = executor;
		this.fnPostProcessor = fnPostProcessor;
	};
	
	ns.DataProviderQueryFactory.prototype = {
		/*
		getQueryFactory: function() {
			return this.queryFactory;
		},
		*/
			
		fetchItems: function() {
			var fnPostProcessor = this.fnPostProcessor;
			
			var result = this.fetchResultSet().pipe(function(data) {
				var tmp = fnPostProcessor(data);
				return tmp;
			});
			
			return result;
		},
		
		
		fetchItemCount: function() {
			var result = this.executor.fetchResultSetSize();
			return result;
		}
	};

	ns.DataProvider = {};
	
	ns.DataProvider.Executor = function(executor) {
		this.executor = executor;
	};
	
	ns.DataProvider.Executor.prototype = {
			fetchData: function() {
				return this.executor.fetchResultSet();
			},
			
			fetchDataCount: function() {
				return this.executor.fetchResultSetSize();
			}
	};
	
	/*
	ns.DataProvider.pipe = function(dataProvider, fnPostProcess) {
		return new ns.DataProvider.Pipe(dataProvider, fnPostProcess);
	};
	*/
	
	ns.DataProvider.Pipe = function(dataProvider, fnPostProcess) {
		this.dataProvider = checkNotNull(dataProvider);
		this.fnPostProcess = checkNotNull(fnPostProcess);
	};
	
	ns.DataProvider.Pipe.prototype = {
		fetchData: function() {
			var self = this;
			
			var promise = this.dataProvider.fetchData();
			var tmp = promise.pipe(function() {
				var result = self.fnPostProcess.apply(undefined, arguments);
				return result;
			});
			
			return tmp;
		},
		
		fetchDataCount: function() {
			return this.dataProvider.fetchDataCount(); 
		}
	};
	

	ns.DataProviderCompound = function() {
		this.dataProviders = [];
		this.dataProviderCaches = [];
	};
	

	ns.DataProviderCompound.prototype = {
			updateAll: function() {
				var promises = [];
				var n = this.dataProviders.length;
				for(var i = 0; i < n; ++i) {
					var dataProvider = this.dataProviders[i];
					
					var promise = dataProvider.fetchDataCount();
					promises.push(promise);
				}
				
			},
			
			/**
			 * Returns the sum of all cached data sizes
			 */
			fetchDataCount: function() {
				var n = this.dataProviderCaches.length;
				var result = 0;
				for(var i = 0; i < n; ++i) {
					var cache = this.dataProviderCaches[i];
					
					var count = cache.size;
					result += count;
				}
				
				return result;
			},
			
			/**
			 * Returns a promise that fetches the appropriate data
			 * 
			 */
			fetchData: function(limit, offset) {
				// Find the appropriate dataProviders and corresponding sub-offset / sub-limits.
				var n = this.dataProviderCaches.length;
				
				var currentOffset = 0;
				for(var i = 0; i < n; ++i) {
					
					var cache = this.dataProviderCaches[i];
					var count = cache.size;
					
					var nextOffset = currentOffset + count;
					
					if(nextOffset > offset) {
						break;
					}
					
					currentOffset = nextOffset;
				}
				
				var startIndex = i;
				
				// fragment := {limit, offset}
				var fragments = [];
				for(var i = startIndex; ; ++i) {
					
				}
				
				
				
				
			}
	};
	
	
	/**
	 * Note: It is valid for queryFactory.createQuery() to return null (indicates empty table),
	 * but the queryFactory itself must not be null
	 *
	 * Note: The reason this class is not a DataProvider directly is,
	 * that in the future we might use a proper result set object rather
	 * then the JSon array.
	 */
	ns.ExecutorQueryFactory = function(sparqlService, queryFactory) { //}, fnPostProcess) {
		this.sparqlService = checkNotNull(sparqlService);
		this.queryFactory = checkNotNull(queryFactory);
		//this.fnPostProcess = fnPostProcess;
	};
	
	ns.ExecutorQueryFactory.prototype = {
		
		getQueryFactory: function() {
			return this.queryFactory;
		},
		
		fetchResultSet: function() {			
			var query = this.queryFactory.createQuery();
			//sconsole.log("Query: ", "" + query);
			
			if(!query) {
				var result = queryUtils.createEmptyResultSet([]);
				return result;
			}
			
			var promise = this.sparqlService.executeSelect(query);
			
			return promise;
		},
	
		asElement: function(elements) {
			var result;
			
			if(elements.length == 1) {
				result = elements[0];
			} else {
				result = new sparql.ElementGroup(elements);
			}
			
			return result;
		},
		
		fetchResultSetSize: function(sampleLimit, options, ajaxOptions) {
			var countVar = sparql.Node.v("__c");
			
			var query = this.queryFactory.createQuery(); 
			
			
			//console.log("Count Query base:" +  query);
			
			if(!query) {
				var result = $.Deferred();
				
				result.resolve({count: 0, more: false});
				
				return result.promise();
			}

			// Remove any ordering
			var orderBy = query.getOrderBy();
			while(orderBy.length > 0) {
				orderBy.pop();
			}
			
			
			var elements = query.getElements();
			
			
			//var element = this.asElement(elements);
			query.limit = null;
			query.offset = null;
			var element = new sparql.ElementSubQuery(query);
			
			//console.log("Creating count query: " + element); //JSON.stringify(element));
			
			
			var countQuery = queryUtils.createQueryCount(element, sampleLimit, null, countVar);

			var promise = queryUtils.fetchInt(this.sparqlService, countQuery, countVar, ajaxOptions);
	
			var result = promise.pipe(function(value) {			
				return {count: value, more: (sampleLimit && value >= sampleLimit) };
			});
			
			return result;
		}

	};

	
	/**
	 * A query factory that filters a variable to an explicit list
	 * of resources.  
	 *
	 * Intended for chunking extensional concepts
	 */
	ns.QueryFactoryFilter = function(subQueryFactory, v) {
		this.subQueryFactory = subQueryFactory;
		this.v = v;
	};
	
	ns.QueryFactoryFilter.prototype = {
		createQuery: function() {
			throw "Not implemented yet because other things had higher priority";
		}
	};
	
	
	
	
	/**
	 * A query factory that supports 
	 *
	 * Usage:
	 * FacetManager fm = queryFactoryFacets.getFacetManager();
	 * 
	 * The main question is, whether the fm should return "sub-fms" for the paths.
	 * E.g.
	 * var constraint = new ConstraintEquals(someValue);
	 * constraint
	 * 
	 * constraintId = fm.addConstraint(constraint);
	 * FacetManager subFm = fm.forProperty("rdfs:label");
	 * 
	 * 
	 * 
	 * 
	 */
	ns.QueryFactoryFacets = function(subQueryFactory) {
		this.subQueryFactory = subQueryFactory;
	};
	
	//ns.QueryFactory
	
	
	
	/**
	 * A QueryFactoryGeo bundles a QueryFactory and a GeoConstraintFactory. 
	 * 
	 * @param queryGenerator
	 * @param geoConstraintFactory
	 * @param options geoSubQuery = {true/false}
	 * @returns {ns.QueryGeneratorGeo}
	 */
	ns.GeoQueryFactory = function(queryFactory, geoVar, geoConstraintFactory, options) {
		this.queryFactory = queryFactory;
		this.geoVar = geoVar;
		this.geoConstraintFactory = geoConstraintFactory;
		this.options = options;
	};
	
	ns.GeoQueryFactory.prototype = {
			/**
			 * Return the geo variable
			 */
			getGeoVar: function() {
				return this.geoVar;
			},
			
			/**
			 * Return the underlying QueryFactory
			 * 
			 */
			getQueryFactory: function() {
				return this.queryFactory;
			},
			
			getGeoConstraintFactory: function() {
				return this.geoConstraintFactory();
			},
			
			getOptions: function() {
				return this.options;
			},
	
			/**
			 * Returns an element without constraints on the geoms.
			 * Note that the geo-related triples will still be there by default.
			 * 
			 * FIXME: Should there be an option to disable that?
			 * 
			 * @param options
			 */
			forGlobal: function(options) {
				
				var result = this.queryFactory.createQuery();
				
				if(!result) {
					return null;
				}
				var elements = result.elements;
				
				var geoElement = this._createGeoElement();
				if(geoElement.triples.length > 0) {
					elements.push(geoElement);
				}
								
				return result;
			},

			forBounds: function(bounds, options) {
				var filter = this._createGeoElementBounds(bounds);
				var result = this._forFilter(filter);
				return result;
			},
	
			forGeoms: function(geomUriNodes, options) {
				//var geomVar = this.geoConstraintFactory.geomVar;
				var geomVar = this.getGeoBreadcrumb().getTargetVariable(); //sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
				
				var geoElement = this._createGeoElement();
				var filter = new sparql.ElementFilter([new sparql.E_In(geomVar, geomUriNodes)]);
				
				var element = new sparql.ElementGroup([geoElement, filter]);
				
				
				var result = this._forFilter(element);
				return result;		
			},	
	
			/**
			 * Common code for forBounds and forGeoms.
			 */
			_forFilter: function(filter, options) {
				var inferredDriver = this.getInferredDriver();
				
				var tmpElement = new sparql.ElementGroup();
				
				if(inferredDriver && inferredDriver.element) {
					tmpElement.elements.push(inferredDriver.element);
				}
				
				tmpElement.elements.push(filter);
						
				var newElement;
				if(options && options.geoSubQuery) {
					var subQuery = new sparql.ElementSubQuery();
					
					//var geomVar = this.geoConstraintFactory.geomVar;
					var geomVar = sparql.Node.v(this.geoConstraintFactory.breadcrumb.targetNode.variable);
					
					subQuery.projectVars.add(geomVar);
					subQuery.elements.push(tmpElement);
					
					newElement = new sparql.ElementGroup();
					newElement.elemements.push(subQuery);
					
					
				} else {
					newElement = tmpElement; 
				}
				
				var resultDriver = null;
				
				//if(inferredDriver) {
				resultDriver = new facets.ConceptInt(newElement, this.getVariable());// inferredDriver.getVariable());
				//} 
				
				var result = new widgets.QueryGenerator(
						resultDriver, 
						this.getNavigationPath(),
						this.getFocusPath(),
						this.getConstraints(),
						this.getPathManager()
						);
				
				
				
				//this._appendConstraintElement(result.elements, options);
		
				return result;
			},

	
			_createGeoElement: function() {
				var result = new sparql.ElementTriplesBlock();
				result.addTriples(this.geoConstraintFactory.getTriples(this.getPathManager()));
				result.uniq();		
				
				return result;
			},
	
			_createGeoElementBounds: function(bounds) {
				var result = new sparql.ElementGroup();
		
				
				// Add geo triples
				//this._appendGeoElement(result.elements);
				//result.elements.push(this._createGeoElement());
				
				
				// Add the filter statement
				var geoConstraint = this.geoConstraintFactory.create(bounds);
				
				var ce = geoConstraint.createConstraintElement(this.getPathManager());
				
				var element = new sparql.ElementTriplesBlock(ce.getTriples());		
				var filter = new sparql.ElementFilter([ce.getExpr()]);
				
				result.elements.push(element);
				result.elements.push(filter);
		
				return result;		
			}
	};
	
	
})(ns);


})();
