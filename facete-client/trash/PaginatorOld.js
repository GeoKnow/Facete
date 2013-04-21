/**
 * Copyright (C) 2011, MOLE research group at AKSW,
 * University of Leipzig
 *
 * SpatialSemanticBrowsingWidgets is free software; you can redistribute
 * it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * SpatialSemanticBrowsingWidgets is distributed in the hope that it will
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
(function($) {

	ns = Namespace("org.aksw.ssb.plugins.Paginator");

	/**
	 * A cache for SPARQL queries based on limit and offset
	 * 
	 */
	ns.OffsetCache = function(sparqlService, queryTemplate) {
		this.sparqlService = sparqlService;
		this.queryTemplate = queryTemplate;
		
		this.cache = 
	};
	

	ns.QueryLoader.prototype.loadRange = function(minItemId, maxItemId) {
		var offset = minItemId;
		var limit = maxItemId - minItemId + 1;
	
		var query = queryTemplate.copySubstitute(function(x) { return x; });
		
		query.offset = offset;
		query.limit = limit;
		
		var promise = this.sparqlService.executeSelect(query.toString());
	};
	
	
	
	ns.QueryLoader = function(sparqlService, queryTemplate) {
		this.sparqlService = sparqlService;
		this.queryTemplate = queryTemplate;
	};
	
	ns.QueryLoader.prototype.load = function(minItemId, maxItemId) {
		var offset = minItemId;
		var limit = maxItemId - minItemId + 1;
		
		var query = queryTemplate.copySubstitute(function(x) { return x; });
		
		query.offset = offset;
		query.limit = limit;
		
		var promise = this.sparqlService.executeSelect(query.toString());
		
		
	};
	
	
	/**
	 * loadCallback(minItem, maxItem);
	 * 
	 */
	ns.Paginator = function(options, loader) {
		this.itemsPerPage = options.itemsPerPage;
		this.minPageCount = null;
		this.exactPageCount = null;
		this.currentPage = 0;
		
		this.requestId = 0;
		this.activeRequest = null;
	};
	
	ns.Paginator.prototype.setPage = function(pageId) {
		var minItemId = this.itemsPerPage * pageId;
		var maxItemId = this.itemsPerPage * (pageId + 1) - 1;
		
		var promise = loader.load(minItemId, maxItemId);
		
		return promise;
	};

	

$.widget("ui.ssb_instances", {

	// TODO: Add _init method for backward compatibility
	
	_create: function() {

		this.domElement = this.element.get(0);		

		this.itemsPerPage = options.itemsPerPage;
		this.minPageCount = null;
		this.exactPageCount = null;
		this.currentPage = 0;		
	},

	
	render: function() {
		var prev = "<a>prev</a>";
		var next = "<a>next</a>";
	},
});

})(jQuery);