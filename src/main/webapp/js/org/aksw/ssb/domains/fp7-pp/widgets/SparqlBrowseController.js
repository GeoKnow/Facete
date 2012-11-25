//(function($) {

	var checkNotNull = function(obj) {
		if(obj) {
			return obj;
		}
		
		throw "Object must not be null";
	};


	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var backend = Namespace("org.aksw.ssb.backend");
	var config = Namespace("org.aksw.ssb.config");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var widgets = Namespace("org.aksw.ssb.widgets");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var uriUtils = Namespace("org.aksw.ssb.utils.uris");
	var facets = Namespace("org.aksw.ssb.facets");

	
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");

	//config.sparqlServiceUri = "http://fts.publicdata.eu/sparql";
	
	/*
	var sparqlServiceHttp = new backend.SparqlServiceHttp(
			config.sparqlServiceUri, config.defaultGraphUris,
			config.sparqlProxyServiceUri, config.sparqlProxyParamName);
	
	var sparqlService = new backend.SparqlServicePaginator(sparqlServiceHttp, 1000);	
	var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
    */
	
	
	
	/*
	var RestrictionRange = function() {
		
	}
	*/
	
	
	
	var QueryFactory = function() {		
	};
	
	QueryFactory.prototype = {
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
	var QueryFactoryQueryGenerator = function(queryGenerator) {
		this.queryGenerator = checkNotNull(queryGenerator);
	};
	
	QueryFactoryQueryGenerator.prototype = {
		createQuery: function() {
			var result = this.queryGenerator.createQueryValues();
			return result;
		}
	};
	

	/**
	 * Query factory that always returns a specific preconfigured query
	 * 
	 */
	var QueryFactoryQuery = function(query) {
		this.query = query;
	};
	
	QueryFactoryQuery.prototype = {
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
	var TableModelQueryFactory = function(queryFactory) {
		this.queryFactory = queryFactory;
		
		// By default, the projection is the same as that of the query
		this.projection = null; //query.getProjection().clone();
		
		// Limit and offset are relative to those of the query
		this.limit = null;
		this.offset = null;
		
		// Additional elements to be injected into the query
		this.elements = [];
	};

	TableModelQueryFactory.prototype = {
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
				baseQuery.projection = projection;
			}
			
			var elements = this.elements;
			
			for(var i = 0; i < elements.length; ++i) {
				var element = elements[i];
				
				//var element = new sparql.ElementFilter([expr]);
				
				baseQuery.elements.push(element);
			}
			
			// TODO Treat limit/offset as relative to the generated query
			baseQuery.offset = this.offset;
			baseQuery.limit = this.limit;
			
			
			/*
			if(this.offset) {
				var newOffset = baseQuery.getOffset();
				if(!newOffset) {
					newOffset = 0;
				}
				
				newOffset += this.offset;

				baseQuery.offset = newOffset;
			}
			*/
			
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
	

	/**
	 * Note: It is valid for queryFactory.createQuery() to result null,
	 * but the queryFactory itself must not be null
	 * 
	 */
	var ExecutorQueryFactory = function(sparqlService, queryFactory) {
		this.sparqlService = checkNotNull(sparqlService);
		this.queryFactory = checkNotNull(queryFactory);
	};
	
	ExecutorQueryFactory.prototype = {
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
			
			//console.log("Query:", query);
			
			if(!query) {
				var result = $.Deferred();
				
				result.resolve({count: 0, isCutOff: false});
				
				return result.promise();
			}

			
			
			var elements = query.getElements();
			var element = this.asElement(elements);
			
			var countQuery = queryUtils.createQueryCount(element, sampleLimit, null, countVar);

			var promise = queryUtils.fetchInt(this.sparqlService, countQuery, countVar);
	
			var result = promise.pipe(function(value) {				
				return {count: value, isCutOff: (value >= sampleLimit) };
			});
			
			return result;
		}

	};
	
	
	
	
	
	
	
	/*
	var ExprModel = Backbone.Model.extend({
		defaults: {
			expr: null
		}
	});
	*/


	var TableModel = Backbone.Model.extend({
		defaults: {
			queryFactory: null,
			offset: 0,
			limit: 10,
			elements: [] // Additional elements to be appended to the query
			
			//searchText: "",
			//currentPage: 1,
			//concept: null
			//paginatorModel: new widgets.PaginatorModel(),
		}
	});
	
	/*
	 * The table view only needs to know:
	 * - what column names there are
	 * - which page
	 * - how many items per page
	 * 
	 * 
	 * 
	 * 
	 */
	
	/**
	 * Associate a SPARQL query (listModel) with a search box (filter resources)
	 * and a paginator.
	 * 
	 */
	var SparqlBrowseController = function(options) {

		this.tableModel = checkNotNull(options.tableModel);
		
		this.paginatorModel = checkNotNull(options.paginatorModel);
		
		
		// This is not a model but a "query configurator".
		// It is assumed it is somehow linked to the executor.
		this.tableConfig = checkNotNull(options.tableConfig);
		this.tableExecutor = checkNotNull(options.tableExecutor);

		//this.sparqlCollection = checkNotNull(options.sparqlCollection);
		this.syncer = checkNotNull(options.syncer);
	};
	

	SparqlBrowseController.prototype = {
		activate: function() {
			this.bind();
			this.syncState();
			this.syncData();
			this.refreshPageCount();
		},
			
		bind: function() {
			
			var self = this;

			/*
			this.tableModel.on("change:filterExprs", function() {
				this.refreshPageCount();
			});
			*/
			
			this.tableModel.on("change", function() {
				
				self.syncState();

				var diff = this.changedAttributes();
				
				console.log("Diff", diff);
				
				for(var att in diff) {
					switch(att) {
					case 'elements':
					case 'queryFactory':
					 	self.refreshPageCount();
					 	break;
					}
				}
				
				self.changePage();
				
				//self.sync();
				
				//self.
				//self.paginatorModel.set({currentPage: page});
			});
			
			this.paginatorModel.on("change:pageRequest", function() {
				
				var page = self.paginatorModel.get("pageRequest");
				
				//console.log("pageRequest", page);
				
				var limit = self.tableModel.get("limit");
				if(!limit) {
					limit = 0;
				} 
				
				var offset = (page - 1) * limit;
				
				self.tableModel.set({offset: offset});
				
				
				//self.paginatorModel.set({currentPage: page});
			});
		},
		
		refreshPageCount: function() {
			console.log("Refreshing page count");

			var self = this;

			var task = this.tableExecutor.fetchResultSetSize();
			var result = task.done(function(info) {
				var limit = self.tableModel.get("limit");
				
				var itemCount = info.count;			
				console.log("Item count: " + itemCount);
				
				var pageCount = limit ? Math.ceil(itemCount / limit) : 1;
				if(itemCount === 0) {
					pageCount = 1;
				}
				
				self.paginatorModel.set({pageCount: pageCount});
			});
		},
		
		changePage: function() {
			console.log("Changing page");
			
			var offset = this.tableModel.get("offset");
			var limit = this.tableModel.get("limit");

			var page;
			if(!limit) {
				page = 1;
			} else {
				page = Math.floor(offset / limit) + 1;
			}

			this.paginatorModel.set({currentPage: page});
			this.sync();
		},
		
		sync: function() {
			this.syncState();
			this.syncData();
		},
		
		syncState: function() {
			var offset = this.tableModel.get("offset");
			var limit = this.tableModel.get("limit");
			var elements = this.tableModel.get("elements");
			var queryFactory = this.tableModel.get("queryFactory");
			
			this.tableConfig.setLimit(limit);
			this.tableConfig.setOffset(offset);
			this.tableConfig.setElements(elements);
			this.tableConfig.setQueryFactory(queryFactory);
		},
		
		syncData: function() {
			var self = this;

			var task = this.tableExecutor.fetchResultSet();

			var offset = this.tableModel.get("offset");
			
			task.done(function(jsonRs) {
				jsonRs.offset = offset;
				
				//console.log("Syncing", jsonRs);
				self.syncer.sync(jsonRs);
				
			});
		}
	};
	

	var createFilterExpr = function(exprVar, pattern) {
		return new sparql.E_Regex(exprVar, pattern, 'i');
			
		//return new sparql.E_Like(exprVar, pattern);
	};

	var setSearch = function(searchText, config) {
		setSearch2(searchText, config.tableConfig, config.tableModel);
	}

	var setSearch2 = function(searchText, tableConfig, tableModel) {
		/*
		var diff = this.changedAttributes();
		var searchText = diff.text;
		*/			
		//console.log("Search text: ", this);

		
		
		if(searchText.length == 0) {
			tableModel.set({
				elements: []
			});
			
			return;
		}
		
		// TODO: Somehow notify the tableModel...
		var query = tableConfig.createQuery();
	
		if(!query) {
			return;
		}
		
		
		var projectVars = query.getProjectVars();
		var vars = projectVars.getVarList();
		
		//console.log(vars);

		
		/*
		Select Distinct ?s ?t ?u {
		    ?s ...
		    ?t ... ?u .
		    Filter(regex(?s, 'pattern') || regex(?t, 'pattern') . # Check the URIs
		    
		    Optional {
		        ?s rdfs:label ?s_lbl .
		        filter(langMatches(lang(?s_lbl), "en") | langMatches(lang(?o), "de") 
		    }
		    
		    Optional {
		        ?t rdfs:label ?t_lbl .
		        filter(langMatches(lang(?t_lbl), "en") | langMatches(lang(?o), "de") 
		    }
		    
		    Filter(Bound(o) || Bound(?t) ... )
		}
		
		*/

		
		var langTags = ["en", ""];
		
		var finalOrs = [];

		var evLabels = [];
		var optionals = [];
		for(var i = 0; i < vars.length; ++i) {
			var v = vars[i];

			/*
			 * Filter URIs
			 */
			
			var exprUri = createFilterExpr(new sparql.ExprVar(v), searchText);
			finalOrs.push(exprUri);
			
			/*
			 * Filter labels
			 */
		
			var vLabel = sparql.Node.v(v.value + "_lbl");
			var evLabel = new sparql.ExprVar(vLabel);

			evLabels.push(evLabel);
			
			var triple = new sparql.Triple(v, rdfs.label, vLabel);				
			var exprLabel = createFilterExpr(evLabel, searchText);

			var exprLang;
			
			if(langTags) {
				var exprLangs = [];
				for(var j = 0; j < langTags.length; ++j) {
					var langTag = langTags[j];
					
					var e = new sparql.E_LangMatches(new sparql.E_Lang(evLabel), sparql.Node.plainLit(langTag));
					
					exprLangs.push(e);
				}
			
				exprLang = sparql.orify(exprLangs);
			} else {
				exprLang = null;
			}

			
			var exprFinal;
			if(exprLang) {
				exprFinal = new sparql.E_LogicalAnd(exprLabel, exprLang);
			} else {
				exprFinal = exprLabel;
			}

			
			var element = new sparql.ElementGroup([
                new sparql.ElementTriplesBlock([triple]),
                new sparql.ElementFilter([exprFinal])
            ]);
			
			var optional = new sparql.ElementOptional(element); 				
			optionals.push(optional);
		}
		
		// One of the labels must be bound
		for(var i = 0; i < evLabels.length; ++i) {
			var evLabel = evLabels[i];
			var boundLabel = new sparql.E_Bound(evLabel);
			
			finalOrs.push(boundLabel);
		}
		
		var finalElements = [];
		finalElements.push.apply(finalElements, optionals);

		if(finalOrs.length > 0) {
			//console.log("Final ors: ", finalOrs);
			var finalOr = sparql.orify(finalOrs);
			var finalFilter = new sparql.ElementFilter([finalOr]);
			
			finalElements.push(finalFilter);
		}
		
		
		console.log("Final elements: " + finalElements);
		
		//if(finalElements.length > 0) {

		tableModel.set({
			elements: finalElements
		});
	};
	
	
//)(jQuery);

	
	var createExecutorConcept = function(sparqlService, concept) {
		var queryGenerator = new widgets.QueryGenerator(concept);

		var queryFactory = new QueryFactoryQueryGenerator(queryGenerator);
		
		var result = createExecutorQueryFactory(sparqlService, queryFactory);
		
		return result;
	}

	var createExecutorQuery = function(sparqlService, query) {
		var queryFactory = new QueryFactoryQuery(query);
		
		var result = createExecutorQueryFactory(sparqlService, queryFactory);
		
		return result;
	};
	
	var createExecutorQueryFactory = function(sparqlService, queryFactory) {
		var tableConfig = new TableModelQueryFactory(queryFactory);

		var tableExecutor = new ExecutorQueryFactory(sparqlService, tableConfig);
		
		var result = {
				config: tableConfig,
				executor: tableExecutor
		};
		
		return result;		
	};
	

	/**
	 * tableConfig { config { limit, offset, queryFactory }, executor { }
	 */
	var createSparqlPagination = function(tableConfig, tableModelAttrs, labelFetcher) {
		
		var collection = new Backbone.Collection();
		
		var syncer = new backboneUtils.SyncerRdfCollection(
			collection,
			backboneUtils.createDefaultPostProcessor(labelFetcher)
		);


		var tmpAttrs = _.extend({queryFactory: tableConfig.config.queryFactory});

		console.log("tmpAttrs", tmpAttrs);

		/*
		if(!options) {
			options = {};
		}*/
		
		var tableModel = new TableModel(tmpAttrs);
		var paginatorModel = new widgets.PaginatorModel({
			maxSlotCount: 11
		});
		
		

		var browseConfig = {
			tableModel: tableModel,
			
			paginatorModel: paginatorModel,
			tableConfig: tableConfig.config,
			tableExecutor: tableConfig.executor, // NOTE: The tableExecutor uses the tableModel internally, but by this the SparqlBrowseController does not have to be aware of the query generation and execution.
			syncer: syncer
		};
		
		var controller = new SparqlBrowseController(browseConfig);

		controller.activate();

		var result = {
				collection: collection,
				config: browseConfig,
				controller: controller				
		};
		
		return result;
	}
	
	
	var createSparqlSearch = function(tableConfig, tableModelAttrs, labelFetcher) {
		var result = createSparqlPagination(tableConfig, tableModelAttrs, labelFetcher);

		var searchModel = new Backbone.Model();


		searchModel.on('change:text', function() {
			var searchText = "" + this.get('text');
			
			setSearch(searchText, result.config);
		});

		
		result.searchModel = searchModel;
		
		return result;
	};


	var getLabel = function(model, key) {
		var result;

		var data = model.get(key);
		if(!data) {
			result = null;
		} else {
			var label = data.label;
			
			if(label) {
				result = label.value;
			} 							
		}
		
		if(!result && !(result === 0)) {
			result = "";
		}
		
		return result;		
	};
