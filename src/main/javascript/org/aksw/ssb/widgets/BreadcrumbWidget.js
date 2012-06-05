(function() {

	var facets = Namespace("org.aksw.ssb.facets");

	var ns = Namespace("org.aksw.ssb.widgets");

	
	ns.BreadcrumbModel = function(labelFetcher, breadcrumb) {
		this.breadcrumb = breadcrumb;
		this.labelFetcher = labelFetcher;
	};
	
	ns.BreadcrumbModel.prototype.setBreadcrumb = function(breadcrumb) {
		this.breadcrumb = breadcrumb;
	};
	
	ns.BreadcrumbModel.prototype.getLabels = function() {
		
	};
	
	
	ns.createBreadcrumbItem = function(breadcrumb, label) {
		var result = $$(
				{breadcrumb: breadcrumb, label: label},
				'<li><a href="#" data-bind="label" /a> <span class="divider">/</span></li>',
				{
					'click a': {
						
					}
				});
		
		return result;
	};
	
	ns.createBreadcrumbWidget = function() {
		
		var result = $$(
				{},
				'<ul class="breadcrumb"><li>Showing:<li> <span class="divider">/</span></ul>',
				{
					refresh: function() {
						model.getLabels().pipe();
					},
					
					setBreadcrumb: function(breadcrumb, uriToLabel) {
						this.each(function(i, child) {
							child.destroy();
						});
						
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

							var item = ns.createBreadcrumbItem(bc, label);
							
							this.append(item);
						}
					},
				});
		
		return result;		
	};
	
})();