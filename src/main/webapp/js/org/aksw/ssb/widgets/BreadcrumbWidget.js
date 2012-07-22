(function() {

	var facets = Namespace("org.aksw.ssb.facets");

	var ns = Namespace("org.aksw.ssb.widgets");

	
//	ns.BreadcrumbModel = function(labelFetcher, breadcrumb) {
//		this.breadcrumb = breadcrumb;
//		this.labelFetcher = labelFetcher;
//	};
//	
//	ns.BreadcrumbModel.prototype.setBreadcrumb = function(breadcrumb) {
//		this.breadcrumb = breadcrumb;
//	};
//	
//	ns.BreadcrumbModel.prototype.getLabels = function() {
//		
//	};
//	
	
	ns.createStepItem = function(path, label, callbacks) {
		var result = $$(
				{path: path, label: label, callbacks: callbacks},
				'<li><span class="divider">/</span> <a href="#" data-bind="label" /></li>',
				{
					'click a': function() {
						var callbacks = this.model.get("callbacks");
						var path = this.model.get("path");
						
						callbacks.onNavigate(path);
					}
				});
		
		return result;
	};
	
	ns.createBreadcrumbWidget = function(callbacks) {
		
		var result = $$(
				{callbacks: callbacks},
				'<ul class="breadcrumb"><li>Showing:</li></ul>',
				{
					create: function() {
						//var item = ns.createBreadcrumbItem(ns.Breadcrumb.fromSteps(breadcrumb.pathManager, []), "home");						
						//this.append(item);
						
					},
					
					
					refresh: function() {
						//model.getLabels().pipe();
					},
					
					setPath: function(path, uriToLabel) {
						var callbacks = this.model.get("callbacks");
						
						
						this.each(function(i, child) {
							child.destroy();
						});
						
						var item = ns.createStepItem(new facets.Path(), "home", callbacks);						
						this.append(item);

						
						
						var steps = path.getSteps();
						
						//var bc = new facets.Breadcrumb.fromString(breadcrumb.pathManager, "");
						var array = [];
						
						for(var i = 0; i < steps.length; ++i) {
							var step = steps[i];
							
							// clone the array and push a new element
							array = array.slice(0);
							array.push(step);
							
							var name = step.propertyName;
							var label = name in uriToLabel ? uriToLabel[name].value : name;
							
							//var bc = facets.Breadcrumb.fromPath(breadcrumb.pathManager, new facets.Path(array));
							//console.log("Status", name, label, bc, array, step);
							var path = new facets.Path(array);
							
							var item = ns.createStepItem(path, label, callbacks);
							
							this.append(item);
						}
					},
				});
		
		return result;		
	};
	
})();