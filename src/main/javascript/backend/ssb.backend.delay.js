/***
 * A wrapper for delaying different types of canned-query requests 
 * to some backend (e.g. sparql endpoint)
 *  
 */
function DelayBackend(delegate) {
	this.delegate = delegate;

	this.fetchWayGeometriesScheduler = new Scheduler();
	this.fetchNodesScheduler = new Scheduler();
	this.fetchNodeTypesScheduler = new Scheduler();
	this.fetchNodeLabelsScheduler = new Scheduler();

	this.fetchClassesScheduler = new Scheduler();
	this.fetchLabelsScheduler = new Scheduler();
	this.fetchIconsScheduler = new Scheduler();
	//this.fetchStatementsBySubjectScheduler = new Scheduler();
}


// TODO There is maybe a nicer way of wrapping methods in js
// Maybe a function that returns a function ...
DelayBackend.prototype = {
	
	fetchWayGeometries: function(bounds, callback) {
		var self = this;
		this.fetchWayGeometriesScheduler.schedule(function() {self.delegate.fetchWayGeometries(bounds, callback);});
	},

	fetchNodes: function(bounds, callback) {
		var self = this;
		this.fetchNodesScheduler.schedule(function() {self.delegate.fetchNodes(bounds, callback);});		
	},
	
	fetchNodeTypes: function(bounds, callback) {
		var self = this;
		this.fetchNodeTypesScheduler.schedule(function() {self.delegate.fetchNodeTypes(bounds, callback);});
	},

	fetchNodeLabels: function(bounds, callback) {
		var self = this;
		this.fetchNodeLabelsScheduler.schedule(function() {self.delegate.fetchNodeLabels(bounds, callback);});		
	},
	
	fetchClasses: function(bounds, callback) {
		var self = this;
		this.fetchClassesScheduler.schedule(function() {self.delegate.fetchClasses(bounds, callback);});		
	},

	fetchLabels: function(uris, language, callback) {
		var self = this;
		this.fetchLabelsScheduler.schedule(function() {self.delegate.fetchLabels(uris, language, callback);});		
	},

	fetchIcons: function(uris, callback) {
		var self = this;
		this.fetchIconsScheduler.schedule(function() {self.delegate.fetchIcons(uris, callback);});		
	},

	/*
	fetchStatementsBySubject: function(uris, callback) {
		var self = this;
		this.fetchStatementsBySubjectScheduler.schedule(function() {self.delegate.fetchStatementsBySubject(uris, callback);});				
	}*/
};