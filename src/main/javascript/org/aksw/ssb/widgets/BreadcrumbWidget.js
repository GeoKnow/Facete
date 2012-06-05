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
	
	ns.createBreadcrumbItem = function(breadcrumb, label, callbacks) {
		var result = $$(
				{breadcrumb: breadcrumb, label: label, callbacks: callbacks},
				'<li><span class="divider">/</span> <a href="#" data-bind="label" /></li>',
				{
					'click a': function() {
						var callbacks = this.model.get("callbacks");
						var breadcrumb = this.model.get("breadcrumb");
						
						callbacks.onNavigate(breadcrumb);
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
						model.getLabels().pipe();
					},
					
					setBreadcrumb: function(breadcrumb, uriToLabel) {
						var callbacks = this.model.get("callbacks");
						
						
						this.each(function(i, child) {
							child.destroy();
						});
						
						var item = ns.createBreadcrumbItem(facets.Breadcrumb.fromSteps(breadcrumb.pathManager, []), "home", callbacks);						
						this.append(item);

						
						
						var steps = breadcrumb.steps;
						
						//var bc = new facets.Breadcrumb.fromString(breadcrumb.pathManager, "");
						var array = [];
						
						for(var i = 0; i < steps.length; ++i) {
							var step = steps[i];
							
							// clone the array and push a new element
							array = array.slice(0);
							array.push(step);
							
							var name = step.propertyName;
							var label = name in uriToLabel ? uriToLabel[name].value : name;
							
							var bc = facets.Breadcrumb.fromSteps(breadcrumb.pathManager, array);
							//console.log("Status", name, label, bc, array, step);

							var item = ns.createBreadcrumbItem(bc, label, callbacks);
							
							this.append(item);
						}
					},
				});
		
		return result;		
	};
	
})();