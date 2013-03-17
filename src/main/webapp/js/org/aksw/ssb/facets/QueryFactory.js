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
	 */
	 ns.TableModelQueryFactory = function(queryFactory) {
		this.queryFactory = queryFactory;
		
		// By default, the projection is the same as that of the query
		this.projection = null; //query.getProjection().clone();
		
		// Limit and offset are relative to those of the query
		this.limit = null;
		this.offset = null;
		
		// Additional elements to be injected into the query
		this.elements = [];
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
			
		createQuery: function() {
			var baseQuery = this.queryFactory.createQuery();
			
			if(baseQuery == null) {
				return null;
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
		
		fetchResultSetSize: function(sampleLimit, options) {
			var countVar = sparql.Node.v("__c");
			
			var query = this.queryFactory.createQuery(); 
			
			//console.log("Count Query base:" +  query);
			
			if(!query) {
				var result = $.Deferred();
				
				result.resolve({count: 0, isCutOff: false});
				
				return result.promise();
			}

			
			
			var elements = query.getElements();
			
			
			//var element = this.asElement(elements);
			query.limit = null;
			query.offset = null;
			var element = new sparql.ElementSubQuery(query);
			
			//console.log("Creating count query: " + element); //JSON.stringify(element));
			
			
			var countQuery = queryUtils.createQueryCount(element, sampleLimit, null, countVar);

			var promise = queryUtils.fetchInt(this.sparqlService, countQuery, countVar);
	
			var result = promise.pipe(function(value) {				
				return {count: value, isCutOff: (value >= sampleLimit) };
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
	
	
})(ns);


})();
