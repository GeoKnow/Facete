(function() {

var ns = Namespace("org.aksw.ssb.widgets");
	
(function(ns) {
	
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	
	
	/**
	 * A search entry has a type and carries some data.
	 * 
	 */
	var ModelSearchResult = Backbone.Model.extend({
		defaults: {
			type: "unknown",
			data: {}
		}
	});
	
	
	/**
	 * A view for a resource.
	 * 
	 * Label (e.g. KYOTO)
	 * 
	 * Domain specific information
	 * - Type (Project) (Use most specific type(s?))
	 * - Number of project partners
	 * - Details button that shows a small overview
	 * - Total amount of money
	 * - 
	 * 
	 * 
	 * 
	 * Locate on map (if the resource has a geo-component)
	 * 
	 * 
	 */
	var ViewResource = Backbone.View.extend({
		
	});
	
	
	/**
	 * Display name, sub-name (region),
	 * 
	 * Functions:
	 * center on map
	 * 
	 */
	var ViewPlace = Backbone.View.extend({
	
		
		
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		},
	});
	
	ns.SearchNominatim = function(baseUrl, baseParams) {
	
		this.baseUrl = baseUrl ? baseUrl : "http://nominatim.openstreetmap.org/search"; 
		this.baseParams = {format: "json"};
	
	};
	
	
	
	/**
	 * Returns a deferred for a place search using Nominatim.
	 * 
	 * @param str
	 * @returns
	 */
	ns.SearchNominatim.prototype = {
			search: function(searchString) {

				var params = _.clone(this.baseParams);
				params["q"] = searchString;
				
				var self = this;
				var promise = $.ajax({
					url: self.baseUrl,
					data: params,
					crossDomain: true,
					dataType: 'json',
					type: 'GET'
				}).pipe(function(json) {
					var items = [];
					for(var i = 0; i < json.length; ++i) {
						
						var item = json[i];				
						var nameParts = item.display_name.split(",");
										
						var tmp = {
								id: "nominatim_" + item.osm_id,
								type: "place",
								data: { 
									label: nameParts[0],
									comment: nameParts[1],
									lon: item.lon,
									lat: item.lat
									//lonlat: new OpenLayers.LonLat(item.lon, item.lat)
								}
						};			
						
						items.push(tmp);
					}
					
					return items;
				});
				
				return promise;
				//q=" + encodeURIComponent(searchValue);
			}
	};
	
	
	/**
	 * This class can actually be seen as a data provider
	 * 
	 * @param sparqlService
	 * @param queryFactory
	 * @param searchVars
	 * @returns {ns.SearchSparql}
	 */
	ns.SearchSparql = function(dataProvider, queryFactoryKeyword) {
		this.dataProvider = dataProvider;
		this.queryFactoryKeyword = queryFactoryKeyword;
	};
	
	/**
	 * 
	 * @param searchString
	 */
	ns.SearchSparql.prototype = {
			search: function(searchString) {
				
				this.queryFactoryKeyword.setSearchString(searchString);
				
				var result = this.dataProvider.fetchData();
				return result;
			}
	};
	
	
	

})(ns);

})();

