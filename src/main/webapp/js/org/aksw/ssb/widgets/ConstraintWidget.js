(function() {

	var facets = Namespace("org.aksw.ssb.facets");

	var ns = Namespace("org.aksw.ssb.widgets");

	
	ns.ConstraintTextBuilder = function(labelFetcher) {
		this.labelFetcher = labelFetcher;
	};
	
	ns.getPathUris = function(path) {
		var result = [];

		if(!path) {
			console.error("Path expected, got: " + path);
		}
		
		
		var steps = path.getSteps();
		_.each(steps, function(step) {
			if(!(step instanceof facets.Step)) {
				console.error("Only steps of type 'Step' supported");
				return;
			}
			
			var propertyName = step.getPropertyName();
			result.push(propertyName);
		});

		return result;
	};
	
	ns.extractUrisFromConstraint = function(pathConstraint) {
		var constraint = pathConstraint.getConstraint();
		
		if(!(constraint instanceof facets.ConstraintEquals)) {
			console.log("Unsupported constraint type " + typeof(constraint));
			return [];
		}
		
		// Extract all URIs from the path, and fetch their labels
		var path = pathConstraint.getPath(); //getText();
		var result = ns.getPathUris(path);
		
		var nodeValue = constraint.getNodeValue();
		var node = nodeValue.getNode();
		
		//console.log("aoeu", node);
		
		if(node.isUri()) {
			result.push(node.value);
		}
		
		return result;
	};
	
	ns.ConstraintTextBuilder.createText = function(pathConstraint, labelInfo) {
		var constraint = pathConstraint.getConstraint();

		var uriToLabel = labelInfo.uriToLabel;
		
		if(!(constraint instanceof facets.ConstraintEquals)) {
			return("Unsupported constraint type " + typeof(constraint));
		}
		
		var pathLabels = [];
		
		var path = pathConstraint.getPath();
		
		var steps = path.getSteps();
		_.each(steps, function(step) {
			
			
			if(!(step instanceof facets.Step)) {
				console.error("Only steps of type 'Step' supported");
								
				pathLabels.push("" + step);
				return;
			}

			var uri = step.getPropertyName();
			
			
			var label = uriToLabel[uri];
			var labelStr = label ? label.value : uri;

			console.log("aoeu", step);
			
			var prefix = step.isInverse() ? "<" : "";
			
			pathLabels.push(prefix + labelStr);
		});
			
			
		var pathStr = pathLabels.join(" / "); 
		
		var nodeValue = constraint.getNodeValue();
		var node = nodeValue.getNode();
		
		var exprStr = "" + node.value;
		
		if(node.isUri()) {
			var uri = node.getValue();
			
			console.log("aoeu", uri, uriToLabel);
			
			var label = uriToLabel[uri];
			exprStr = label ? label.value : uri;			
		};
		
		
		exprStr = "'" + exprStr + "'";
		
		var result = pathStr + " is " + exprStr;
		
		
		return result;
	};
	
	ns.ConstraintTextBuilder.prototype.fetchSimpleText = function(constraint) {
		var uris = ns.extractUrisFromConstraint(constraint);
		
		var task = this.labelFetcher.fetch(uris);
		
		var self = this;
		var result = $.when(task).pipe(function(labelInfo) {
			var msg = ns.ConstraintTextBuilder.createText(constraint, labelInfo);
			
			return msg;
		});
		
		return result;
	};
	
})();