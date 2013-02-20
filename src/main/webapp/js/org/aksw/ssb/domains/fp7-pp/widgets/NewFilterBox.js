


var ViewWindow = Backbone.View.extend({
	
	initialize: function() {
		
	},
	
	render: function() {
		// Maybe reuse some existing framework for this???
		// We need: title, style, content, close-box
		
		
	}

});


//var ViewFacetBrowser




function runNewFilterBox() {
	
	var config = {};
	
	config.sparqlServiceUri = "http://localhost/sparql";

	/*
	 * Ugly namespace stuff
	 */
	
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


	var sparqlServiceHttp = new backend.SparqlServiceHttp(
			config.sparqlServiceUri, config.defaultGraphUris,
			config.sparqlProxyServiceUri, config.sparqlProxyParamName);
	
	var sparqlService = new backend.SparqlServicePaginator(sparqlServiceHttp, 1000);	
	var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
	
	
	/*
	 * Create the Query Browser
	 * 
	 */
	var baseModels = createQueryBrowser(sparqlService, labelFetcher);
	/*
	models.model.set({
		selected: {
			//node: node,
			//label: label
		}
	});
	*/


	var v = sparql.Node.v("test");
	var query = queryUtils.createQueryGetClasses(v);
	
	console.log("Query is", query);
	var baseQueryFactory = new QueryFactoryQuery(query);

	
	var tableModel = baseModels.browseConfig.config.tableModel;
	
	
	
	
	/**
	 * Let's pretend there is a model that is connected to all the properties
	 * of the initial table model.
	 * 
	 * (how to cascade filters?)
	 * 
	 */
	var facetModels = createQueryBrowser(sparqlService, labelFetcher);

	tableModel.on('change:queryFactory', function() {
		
		var queryFactory = this.get("queryFactory");
		var baseQuery = queryFactory.createQuery();
		
		
		var conceptVar = sparql.Node.v("test");
		var concept = new facets.ConceptInt(new sparql.ElementGroup(baseQuery.elements), conceptVar);

		var facetVar = sparql.Node.v("fv");

		
		var countFacetVar = sparql.Node.v("cv");
		var isInverse = false;
		var sampleSize = 1000;
		
		var facetQuery = queryUtils.createQueryFacetCount(concept, facetVar, countFacetVar, isInverse, sampleSize);
		
		//alert("Query: " + facetQuery);
		console.log("Base Query: " + baseQuery);
		console.log("Facet Query: " + facetQuery);
		

		var facetQueryFactory = new QueryFactoryQuery(facetQuery);
		
		facetModels.browseConfig.config.tableModel.set({queryFactory: facetQueryFactory});
		// Create the query for the properties
		
		// So any facet view needs to register on this class
		// Notify any		
	});

	
	
	
	
	
	//console.log("Query is now: ", queryFactory.createQuery());
	
	//var queryFactory = new QueryFactoryQueryGenerator(queryGenerator);
	
	/*
	var tableConfig = createExecutorConcept(sparqlService, concept);
	*/
	tableModel.set({queryFactory: baseQueryFactory});

	
	
	var container = $('body');
	container.children().remove();
	
	
	createView(container, baseModels);

	container.append('<hr />');
	
	createView(container, facetModels);

	/*
	
	var MyViewEditButton = Backbone.View.extend({
		tagName: 'i',
		attributes: {
			'class': 'icon-pencil', 
			'style': 'position: absolute; width: 16px; height: 16px; top: 0px; right: 16px; padding: 0px; margin: 3px;'
		    // 'style': 'position: absolute; width: 16px; height: 16px; padding: 0px; margin: 3px;' // top: 0px; right: 16px;'
		},
		events: {
			'click': function() {
				widgets.loadResourceEditor2(self.sparqlService, node);
			}
		}
	});
	
	if(config.targetGraph) {
    	container.append(new MyViewEditButton().render().el);
	}
*/
	/*
	var MyViewCloseButton = widgets.ViewCloseButton.extend({
		events: {
			'click': function() {
                container.fadeOut ('slow');
			}
		}
	});
	
	var closeButton = new MyViewCloseButton();
	var rendered = closeButton.render();
	container.append(rendered.el);
		*/	
	
}
