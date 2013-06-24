//(function($) {


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
	
	
	
	

	
	
	
	
	
	/*
	var ExprModel = Backbone.Model.extend({
		defaults: {
			expr: null
		}
	});
	*/


	var TableModel = Backbone.Model.extend({
		defaults: {
			//sparqlServiceIri: null,
			//sparqlDefaultGraphIris: [],
			sparqlService: null,
			
			queryFactory: null,
			offset: 0,
			limit: 10,
			
			headerMap: new Backbone.Collection(), // Maps var names of the query to data items 
			
			elements: [] // Additional elements to be appended to the query // TODO Should be map, so we can reference additions by id
			
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
		
		//this.sparqlService = checkNotNull(options.sparqlService);
		
		// This is not a model but a "query configurator".
		// It is assumed it is somehow linked to the executor.
		//this.tableConfig = checkNotNull(options.tableConfig);
		//this.tableExecutor = checkNotNull(options.tableExecutor);

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
			
			this.tableModel.on('change', function() {
				
				//console.log("Table model changed");
				
				self.syncState();

				var diff = this.changedAttributes();
				
				//console.log("Diff", diff);
				
				// Page count must be recomputed if any of the following attributes change
				for(var att in diff) {
					switch(att) {
					case 'elements':
					case 'queryFactory':
					case 'sparqlService':
					 	self.refreshPageCount();
					 	break;
					}
				}
				
				self.changePage();
				
				//self.sync();
				
				//self.
				//self.paginatorModel.set({currentPage: page});
			});

//			this.tableModel.on('change:sparqlService', function() {
//				self.refreshPageCount();
//			});
			
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
			//console.log("Refreshing page count");

			var self = this;

			if(!this.tableExecutor) {
				self.paginatorModel.set({pageCount: 1});
				return;
			};
			
			var task = this.tableExecutor.fetchResultSetSize();
			
			
			var result = task.pipe(function(info) {
				var limit = self.tableModel.get("limit");
				
				var itemCount = info.count;			
				//console.log("Item count: " + itemCount);
				
				var pageCount = limit ? Math.ceil(itemCount / limit) : 1;
				if(itemCount === 0) {
					pageCount = 1;
				}
				
				self.paginatorModel.set({pageCount: pageCount});
			});
			
			return result;
		},
		
		changePage: function() {
			//console.log("Changing page");
			
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
			var sparqlService = this.tableModel.get("sparqlService");
			
			this.tableConfig = new facets.TableModelQueryFactory();
			
			this.tableConfig.setLimit(limit);
			this.tableConfig.setOffset(offset);
			this.tableConfig.setElements(elements);
			this.tableConfig.setQueryFactory(queryFactory);
			
			
			//console.log("Status of the tableConfig", this.tableConfig, sparqlService);
			
			//var queryFactory = new facets.QueryFactoryQuery(query);
			
			this.tableExecutor = null;
			
			if(queryFactory && sparqlService) {
				this.tableExecutor = new facets.ExecutorQueryFactory(sparqlService, this.tableConfig);
				
				//var query = "" + this.tableConfig.createQuery();
				//console.log("Query: " + query);
			}
			
			if(!this.tableExecutor) {
				console.log('[WARN] No sparql executor set');
			}
//			else {
//				console.log('[WARN] SPARQL Executor:', this.tableExecutor);
//			}
			
		},
		
		syncData: function() {
			var self = this;

			var offset = this.tableModel.get("offset");
			if(!this.tableExecutor) {
				self.syncer.sync({results: {bindings: []}}, offset);
				
				return;
			}
			

			var task = this.tableExecutor.fetchResultSet();

			
			task.done(function(jsonRs) {				
				//console.log("Syncing", jsonRs);
				self.syncer.sync(jsonRs, offset);				
			});
		}
	};
	

	var createFilterExpr = function(exprVar, pattern) {
		return new sparql.E_Regex(exprVar, pattern, 'i');
			
		//return new sparql.E_Like(exprVar, pattern);
	};

	var setSearch = function(searchText, tableModel) {
		//setSearch2(searchText, config.tableConfig, config.tableModel);
		setSearch2(searchText, tableModel);
	};

	
	
	var setSearch2 = function(searchText, tableModel) { //tableConfig, tableModel) {
		/*
		var diff = this.changedAttributes();
		var searchText = diff.text;
		*/			
		//console.log("Search text: ", this);

		var queryFactory = tableModel.get('queryFactory');
		var query = queryFactory.createQuery();
		
		
		if(searchText.length == 0) {
			tableModel.set({
				elements: []
			});
			
			return;
		}
		
		// TODO: Somehow notify the tableModel...
		//var query = tableConfig.createQuery();
	
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

		var finalElements = queryUtils.createSearchElements(searchText, vars);
		
		
		//console.log("Final elements: " + finalElements);
		
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
	};

	var createExecutorQuery = function(sparqlService, query) {
		var queryFactory = new facets.QueryFactoryQuery(query);
		
		var result = createExecutorQueryFactory(sparqlService, queryFactory);
		
		return result;
	};
	
	var createExecutorQueryFactory = function(sparqlService, queryFactory) {
		var tableConfig = new facets.TableModelQueryFactory(queryFactory);

		var tableExecutor = new facets.ExecutorQueryFactory(sparqlService, tableConfig);
		
		var result = {
				config: tableConfig,
				executor: tableExecutor
		};
		
		return result;		
	};
	

	/**
	 * tableConfig { config { limit, offset, queryFactory, sparqlService }, executor { }
	 */
	var createSparqlPagination = function(tableConfig) {
		
		// This is the result set
		var resultSet = new Backbone.Collection();
		
		var syncer = new backboneUtils.SyncerRdfCollection(
				resultSet,
				(function(jsonRs) {
					// Without having a post processor set, we omit any results
					console.log("[WARN] Post processor not set - Discarding data.");
					var deferred = $.Deferred();
					deferred.resolve({results: {bindings: []}});
					return deferred.promise();
				})
			//,backboneUtils.createDefaultPostProcessor(labelFetcher);
		);


		//var tmpAttrs = _.extend({queryFactory: tableConfig.config.queryFactory});

		//console.log("tmpAttrs", tmpAttrs);

		/*
		if(!options) {
			options = {};
		}*/
		
		var tableModel = new TableModel();

		var paginatorModel = new widgets.PaginatorModel({
			maxSlotCount: 9
		});
		
		
		
//		tableModel.on('change:sparqlService', function() {
//			var sparqlService = this.get('sparqlService');
//			
//			var labelFetcher = labelFetcherFactoryFn(sparqlService);
//		
//			var postProcessor = backboneUtils.createDefaultPostProcessor(labelFetcher);
//
//			syncer.setPostProcessor(postProcessor);
//			//this.set({labelFetche})
//		});
		
		//tableModel.set(tmpAttrs);

		var browseConfig = {
			tableModel: tableModel,
			paginatorModel: paginatorModel,
			//collection: collection
			syncer: syncer // The syncer takes care of syncing the query result with the resultCollection
			//tableConfig: tableConfig.config,
			//tableExecutor: tableConfig.executor, // NOTE: The tableExecutor uses the tableModel internally, but by this the SparqlBrowseController does not have to be aware of the query generation and execution.
		};
		

		var controller = new SparqlBrowseController(browseConfig);

		
		tableModel.on('change:postProcessFn', function() {
			var postProcessFn = this.get('postProcessFn'); 
			
			syncer.setPostProcessFn(postProcessFn);
			
			//console.log('Syncing after setting postProcess to ', postProcessFn);
			//controller.sync();
			//syncer.sync();
		});

		
		controller.activate();

		var result = {
				models: {
					resultSet: resultSet,
					tableModel: tableModel,
					paginatorModel: paginatorModel
				},				
				controllers: {
					browseController: controller
				}
				//config: browseConfig,
				//controller: controller				
		};
		
		
		return result;
	};
	
	
	var createSparqlSearch = function(tableConfig) {
		var result = createSparqlPagination(tableConfig);

		var models = result.models;

		var searchModel = new Backbone.Model();
		result.models.searchModel = searchModel;


		searchModel.on('change:text', function() {
			var searchText = "" + this.get('text');
			
			setSearch(searchText, models.tableModel); //result.config);
		});

		
		
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
