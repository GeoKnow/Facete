
	var ItemViewTd = widgets.ItemViewLabel.extend({
		tagName: 'td',
		options: {
			binding: {
				label: function(model) {
					var result = getLabel(model, "s");
					return result;
				}
			}
		}
	});

	
	var TableView = widgets.ListView.extend({
		tagName: 'table'
	});

	var ViewTextBox = Backbone.View.extend({
		tagName: 'input',
		attributes: {
			type: 'text'
		},
		events: {
		    "change":  "contentChanged"
		},
		initialize: function() {
			_.bindAll(this, 'contentChanged');
			
			//console.log("inputContent", this.inputContent);
		},
		contentChanged: function(e) {
		    var input = $(this.el);
		    var val = input.val();

		    this.model.set({text: val});
		}
	});
	
	
	

	
	$.fn.ssb = {};
	
	$.fn.ssb.searchBox = function(searchModel) {
		var el = this[0];
		
		var result = new ViewTextBox({
			el: el,
			model: searchModel
		});
		
		return result;
	}

	$.fn.ssb.paginator = function(options) {
		var el = this[0];

		var tmp = _.extend({}, options);
		tmp.el = el;

		var result = new widgets.ViewPaginator(tmp);

//		var result = new widgets.ViewPaginator({
//			el: el,
//			model: paginatorModel
//		});
		
		return result;
	}
	
	
	var createListModels = function(sparqlService, queryFactory, labelFetcher) {
		//var container = $(containerEl);

		/*		
		var element = new sparql.ElementString("?x rdfs:label ?y", [sparql.Node.v("x"), sparql.Node.v("y")]);		
		var concept = new facets.ConceptInt(element, sparql.Node.v("x"));		
		
		var tableConfig = createExecutorConcept(sparqlService, concept);
		*/
		
		var tableConfig = createExecutorQueryFactory(sparqlService, queryFactory);
		var browseConfig = createSparqlSearch(tableConfig, {limit: 10}, labelFetcher);
		
		//console.log("browseConfig is ", browseConfig);
		
		
		var result = {
				model: new Backbone.Model(),
				browseConfig: browseConfig
		};
		
		return result;
	}
		
	
	
	var createListView = function(container, models) {
		var browseConfig = models.browseConfig;

		
		var MyItemView = ItemViewTd.extend({
			events: {
				'click span': function() {
					var node = this.model.get("s").node;
					models.model.set({selected: node});
					//alert("Selected: " + this.model.get("x").label.value);
				}
			}
		});
		
		
		var tableFactory = function(options) {
		
			var o = _.extend({
				tagName: 'table',
				attributes: {
					'class': 'table table-bordered table-striped table-condensed',
					'style': 'margin: 0px'
				},
				cols: 3,
				itemRenderer: new widgets.ItemRendererBackbone(MyItemView)
			}, options);

			
			//console.log("Table Factory", o);
			
			var result =  new widgets.ListViewTable(o);

			return result;
		};
		
		createView(container, models, tableFactory);
	};
	
	
	
	var createListViewOld = function(container, models) {
		
		var browseConfig = models.browseConfig;

		
		var MyItemView = ItemViewTd.extend({
			events: {
				'click span': function() {
					var node = this.model.get("s").node;
					models.model.set({selected: node});
					//alert("Selected: " + this.model.get("x").label.value);
				}
			}
		});
		
		
		var tableView = new widgets.ListViewTable({
			tagName: 'table',
			attributes: { 'class': 'table table-bordered table-striped table-condensed' },
			cols: 3,
			collection: browseConfig.collection,
			itemRenderer: new widgets.ItemRendererBackbone(MyItemView)
		});
		
		var el = tableView.render().el;


		var paginatorModel = browseConfig.config.paginatorModel;
		
		container.append($("<span>Filter:</span>"));
		
		container.append($().ssb.searchBox(browseConfig.searchModel).render().el);		
		container.append(el);
		container.append($().ssb.paginator({
			model: paginatorModel,
			attributes: {
				style: 'width: 200px; margin-left: auto; margin-right: auto;'
			}
		}).render().el);
	};
	
	/**
	 * Create a tabular list of resources (for a given queryFactory)
	 * 
	 * 
	 */
	var createInfoboxModels = function(sparqlService, labelFetcher) {
		var tableConfig = createExecutorQuery(sparqlService, null); //query);
		//console.log("tableConfig is", tableConfig);
		

		
		var browseConfig = createSparqlSearch(tableConfig, {limit: 10}, labelFetcher);

		
		var result = {
				model: new Backbone.Model(),
				browseConfig: browseConfig
		};
		
		return result;
	};



	var createInfoboxView = function(container, models) {
		var browseConfig = models.browseConfig;

		
		var MyView = widgets.ItemViewProject.extend({
			// TODO Setting the pointer style here is to aggressive
			attributes: { 'style': 'cursor:pointer' },
			events: {
				'click span': function() {
					var node = this.model.get("p");
					result.model.set({selected: node});
				}
			}
		});
		
		
		var tableFactory = function(options) {
			
			var o = _.extend({
				//tagName: 'table',
				attributes: {
					'class': 'table table-bordered table-striped table-condensed',
					'style': 'margin: 0px'
				},
				itemRenderer : new widgets.ItemRendererBackbone(MyView)
			}, options);

			
			//console.log("Table Factory", o);
			
			var result =  new TableView(o);

			return result;
		};
		
		createView(container, models, tableFactory);
		
	};

	var createInfoboxViewOld = function(container, models) {
		var browseConfig = models.browseConfig;

	//var container = $(containerEl);

		/*
		var concept = widgets.createConceptPartnerState();
		var element = concept.getElement(); 

		var query = queryUtils.createQuerySelectElement(element, element
				.getVarsMentioned(), {
			limit : 10
		});
		query.orderBy.push(new sparql.SortCondition(new sparql.ExprVar(
				sparql.Node.v("a"))));

		 */
		//query.offset = 100;

		

		
		var paginatorModel = browseConfig.config.paginatorModel;

		//console.log("Collection is", browseConfig);
		container.append($().ssb.searchBox(browseConfig.searchModel).render().el);

		//container.append($().ssb.paginator(browseConfig.config.paginatorModel).render().el);
		container.append($().ssb.paginator({
			model: paginatorModel,
			attributes: {
				style: 'margin-left: auto; margin-right: auto;'
			}
		}).render().el);

		
		/*
		var myTextBox = new ViewTextBox({model: browseConfig.searchModel});
		var textEl = myTextBox.render().el; //$('<input type="text" />');
		container.append(textEl);

		var paginatorView = new widgets.ViewPaginator({model: browseConfig.config.paginatorModel});
		var paginatorEl = paginatorView.render().el;
		container.append(paginatorEl);
		*/
		
		//container.append(el);
		var MyView = widgets.ItemViewProject.extend({
			// TODO Setting the pointer style here is to aggressive
			attributes: { 'style': 'cursor:pointer' },
			events: {
				'click span': function() {
					var node = this.model.get("p");
					result.model.set({selected: node});
				}
			}
		});
		

		var tableView = new TableView(
				{
					//el : //$("#table"),
					// attributes: {style: {'list-style': 'none'}},
					collection : browseConfig.collection,
					itemRenderer : new widgets.ItemRendererBackbone(
							MyView)
				});

		container.append(tableView.render().el);
		
		return result;
	};
	

	
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	
	var createSparqlExplorer = function(sparqlService, labelFetcher) {
		var queryFactory = new QueryFactoryQuery(null);
		this.tableConfig = createExecutorQueryFactory(sparqlService, queryFactory);
		this.browseConfig = createSparqlSearch(tableConfig, {limit: 10}, labelFetcher);
						
		var result = {
				model: new Backbone.Model(),
				browseConfig: browseConfig
		};
		
		return result;
	};
	
	/*
			setDescribeResource: function(node) {
				var query = createQueryDescribe(node);				

				this.setQuery(query);
			},
			
			setPropertyNode: function(node) {
				
			},
			
			setQuery: function(query) {
				var queryFactory = new QueryFactoryQuery(query);
				
				this.tableModel.set({queryFactory: queryFactory});
			},
	};
	*/
		
		
	
	
	var createListQueryFactory = function(geom) {
		var app = Namespace("org.aksw.ssb.app.controllers");
		
		var options = createAppConfig(); 
		var conf = options.queryGenerator;	
		var queryGenerator = new widgets.QueryGenerator(conf.concept, conf.navigationPath, null, conf.constraints, conf.pathManager);	
		var queryGeneratorGeo = new app.QueryGeneratorGeo(queryGenerator, conf.geoConstraintFactory);

		
		{
			var queryGenerator = queryGeneratorGeo.forGeoms([geom]);			
			var concept = queryGenerator.createDriverValues();
	
			//console.log("Concept is now: ", concept);
			
			var queryFactory = new QueryFactoryQueryGenerator(queryGenerator);
			return queryFactory;
		}		
	};


$(document).ready(function() {

	

	function test() {
		
		var el = $('#wrapper');	
	
		var listQf = createListQueryFactory(sparql.Node.uri("http://linkedgeodata.org/triplify/node52943358"));
	
		
		var list = createList(sparqlService, listQf, el);
		var infobox = createInfobox(sparqlService, el);
	
		
		list.model.on("change:selected", function() {
			
			var node = list.model.get("selected");
			
			//console.log("boo", arguments);
			
			//var geom = sparql.Node.uri("http://linkedgeodata.org/triplify/node1681920624");
			
			//var queryGenerator = queryGeneratorGeo.forGeoms([geom]);			
			//var concept = queryGenerator.createDriverValues();
	
			var query = widgets.createPartnerQuery(node);
			var queryFactory = new QueryFactoryQuery(query);
			
			//console.log("Query is now: ", queryFactory.createQuery());
			
			//var queryFactory = new QueryFactoryQueryGenerator(queryGenerator);
			
			/*
			var tableConfig = createExecutorConcept(sparqlService, concept);
			*/
			var tableModel = infobox.browseConfig.config.tableModel;
			tableModel.set({queryFactory: queryFactory});
			
			//console.log("Table model: ", tableModel);//.browseConfig.tableModel);
		});
	}
	
	//test();
	
});








//var queryExecutor = new widgets.QueryExecutor(sparqlService, queryGenerator);




/*
var query = queryUtils.createQuerySelectElement(element, element
		.getVarsMentioned(), {
	limit : 1000
});
*/


/*
var myCollection = new Backbone.Collection([
    {id: 1, label: "hello"},
    {id: 2, label: "world"},
    {id: 3, label: "!"},
    {id: 4, label: "foo"},
    {id: 5, label: "bar"},
]);
*/

/*
var selectionModel = new Backbone.Model({
	selected: 1
});


var BtnGroupRenderer = function(model) {
	this.model = model;
};

BtnGroupRenderer.prototype = {
		create: function(model, parent) {
			
		}
};*/


/*
var myCollection = new backboneUtils.BackboneSyncQueryCollection([], {
	sparqlService: sparqlService,
	postProcessor: backboneUtils.createDefaultPostProcessor(labelFetcher)
});
*/



//
//
//function test1() {
//	
//	/*
//	 * 1. Create a query element of what should be filtered
//	 * 2. Turn it into an intensional concept (i.e. set of resources) by specifying a variable
//	 * 3. The query generator adds facetted filtering support to an concept
//	 * 4. Turn the query generator into a query factory (the create()) - actually, the query generator could already implement the queryFactory interface
//	 * 5. Wrap the query factory with a tableConfigurator; by this we can easily do simple table transformations, such as filtering, overriding limit/offset, projections and sorting
//	 * 
//	 * 
//	 * So we now have:
//	 * - tableConfigurator
//	 * - sparqlService
//	 * 
//	 * and we want to combine this into a TabelModelQueryFactoryExecutor
//	 * 
//	 * 
//	 * 
//	 */
//	var element = new sparql.ElementString("?x rdfs:label ?y", [sparql.Node.v("x"), sparql.Node.v("y")]);
//	
//	var concept = new facets.ConceptInt(element, sparql.Node.v("x"));		
//
//
//	
//	var browseConfig = createSparqlSearch(concept);
//	
//	
//	var tableView = new widgets.ListViewTable({
//		tagName: 'table',
//		//el: el,
//		attributes: { 'class': 'table table-bordered table-striped table-condensed' },
//		cols: 3,
//		collection: browseConfig.collection,
//		itemRenderer: new widgets.ItemRendererBackbone(ItemViewTd)
//	});
//	
//	var el = tableView.render().el;
//	
//	
//	var container = $('#wrapper');
//	//$(el).appendTo($('#wrapper'));
//	
//	
//	/*
//	var MyViewTextBox = ViewTextBox.extend({
//	});*/
//
//	
//	var myTextBox = new ViewTextBox({model: browseConfig.searchModel});
//	
//	
//	/*
//	textModel.on('change:text', function() {
//		
//		// Perform a search
//		
//		
//		var text = this.get("text");
//		//console.log(value);
//		alert("text: " + text);
//	});*/
//	
//	
//	
//	var textEl = myTextBox.render().el; //$('<input type="text" />');
//	container.append(textEl);
//	
//	
//	
//	var paginatorView = new widgets.ViewPaginator({model: browseConfig.config.paginatorModel});
//	var paginatorEl = paginatorView.render().el;
//	container.append(paginatorEl);
//
//	
//	container.append(el);
//
//	
//	
//	/*
//	var paginatorEl = $('<ul class="pagination pagination-centered"></ul>');
//	$('#wrapper').append(paginatorEl);
//	$(paginatorEl).paginator(paginatorModel);
//	*/
//	
//	
//	
//	//myCollection.sync(query);
//	
//	console.log("Collection: ", browseConfig.collection);
//	
//	
//	
//}
//		


	

//var el = $('<table class="table table-bordered table-striped table-condensed"></table>');
//console.log("el", el);
//$('body').append(el);

