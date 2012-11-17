$(document).ready(function() {
		


			var sparql = Namespace("org.aksw.ssb.sparql.syntax");
			var backend = Namespace("org.aksw.ssb.backend");
			var config = Namespace("org.aksw.ssb.config");
			var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
			var widgets = Namespace("org.aksw.ssb.widgets");
			var backboneUtils = Namespace("org.aksw.utils.backbone");
			var labelUtils = Namespace("org.aksw.ssb.utils");
			var uriUtils = Namespace("org.aksw.ssb.utils.uris");

			var sparqlServiceHttp = new backend.SparqlServiceHttp(
					config.sparqlServiceUri, config.defaultGraphUris,
					config.sparqlProxyServiceUri, config.sparqlProxyParamName);
			
			var sparqlService = new backend.SparqlServicePaginator(sparqlServiceHttp, 1000);
			
			var labelFetcher = new labelUtils.LabelFetcher(sparqlService);

			

			var concept = widgets.createConceptPartnerState();
			var element = concept.getElement(); 

			var query = queryUtils.createQuerySelectElement(element, element
					.getVarsMentioned(), {
				limit : 10
			});
			query.orderBy.push(new sparql.SortCondition(new sparql.ExprVar(
					sparql.Node.v("a"))));

			query.offset = 100;

				
				


			//TODO: The syncer should pass the result set to a post processor first.
			// TODO: Actually, this sync thing should already be a a backbone collection
			
			var viewCollection = new backboneUtils.BackboneSyncQueryCollection([], {
				sparqlService: sparqlService,
				postProcessor: backboneUtils.createDefaultPostProcessor(labelFetcher)
			});
			

			var TableView = widgets.ListView.extend({
				tagName: 'table'
			});
			
			var tableView = new TableView(
					{
						el : $("#table"),
						// attributes: {style: {'list-style': 'none'}},
						collection : viewCollection,
						itemRenderer : new widgets.ItemRendererBackbone(
								widgets.ItemViewProject)
					});


			viewCollection.sync(query);

		});


//var syncer = new backboneUtils.BackboneSyncQuery(sparqlService, null, backboneUtils.createDefaultPostProcessor(labelFetcher));



//var viewCollection = syncer.getCollection();

// var viewCollection = collection;
//var viewCollection = new Backbone.Collection();

// Bind the viewCollection so that author and project uri are
// resolved
/*
backboneUtils.slaveCollection(collection, viewCollection, function(
		data) {

	console.log("Data is", data);

	var partnerId = data.p;
	var uriStrs = [ partnerId.value ];

	var promise = labelFetcher.fetch(uriStrs).pipe(
			function(labelInfo) {

				data.partnerLabel = labelUtils.getLabel(partnerId,
						labelInfo);
				return data;
			});

	return promise;
});
*/


/*
$(document).ready(function() {

	var widgets = Namespace("org.aksw.ssb.widgets");

	/**
	 * A SPARQL table specification consists of: - a graphPattern (aka element) -
	 * limit - offset - condiditons //- a function that generates IDs for each
	 * row ; rowIds are automatically generated
	 * 
	 * /
	var TableSpecSparql = Backbone.Model.extend({
		defaults : {
			element : null,
			limit : null,
			offset : null,
			conditions : []
		}
	});

});

*/
/*
 * var TableView = widgets.ListView.extend({ tagName: 'table' });
 * 
 * 
 * var ItemViewRowBase = Backbone.View.extend({ tagName: 'tr',
 * //attributes: {style: ""}, events: { }, initialize: function(){
 * _.bindAll(this, 'render', 'unrender', 'remove'); // every
 * function that uses 'this' as the current object should be in here
 * 
 * this.model.bind('change', this.render, this);
 * this.model.bind('remove', this.unrender, this); }, render:
 * function() { var html;
 * 
 * if(typeof(this.renderHtml) === 'function') { html =
 * this.renderHtml(); } else { html = "<div>No renderer set or
 * renderer is not a function</div>"; }
 * 
 * $(this.el).html(html); return this; }, unrender: function() {
 * $(this.el).remove(); }, remove: function(){ this.model.destroy(); }
 * });
 */

/*
 * var ItemViewProject = ItemViewRowBase.extend({ renderHtml:
 * function() { var projectId = this.model.get("s"); var partnerId =
 * this.model.get("p"); var partnerRole = this.model.get("pr"); var
 * partnerAmount = this.model.get("a");
 * 
 * var partnerLabel = this.model.get("partnerLabel");
 * 
 * var a = parseFloat(partnerAmount.value);
 * 
 * var ratio = Math.min(a / 1000000.0, 1.0);
 * 
 * var data = { height: 20, width: 200 * ratio, //innerHtml:
 * formatNumber(a) innerHtml: "" };
 * 
 * console.log(data);
 * 
 * var result = '<td>' + partnerLabel + '</td>' + '<td style="position: relative; width: 250px">' +
 * renderBar(data) + '</td>' + '<td>' + formatNumber(a) + '</td>' ;
 * 
 * return result; } });
 */
