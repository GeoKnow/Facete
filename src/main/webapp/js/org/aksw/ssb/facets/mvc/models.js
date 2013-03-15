(function() {

	/*
	var backend = Namespace("org.aksw.ssb.backend");
	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var widgets = Namespace("org.aksw.ssb.widgets");
	 */
	
	var facets = Namespace("org.aksw.ssb.facets");
	var ns = facets;

	ns.ModelFacetNode = Backbone.Model.extend({
		defaults : {
			//step: null, // The step leading to this node (null for root nodes)
			// baseQueryFactory: null, // Query factory for the instances (can
			// be seen as facet values)
			// facetsQueryFactory: null, // Query factory for the facets (of the
			// instances)
			// constraints: [], // contraints applying to this node
			isExpanded : false, // when changing to true, the controller will
								// start loading the children
			isLoading : false,
			/*
			 * children: new Backbone.Collection({ //model: ns.ModelFacetNode
			 * }), // subFacets - NOT facet values!
			 */
			facetFacadeNode : null, // Reference to a (non-model)
									// FacetFacadeNode
		},

		initialize : function() {
			// console.log("Initializing ModelFacetNode", this);

			this.set({
				children : new ns.CollectionFacetNode()
			});
		},
		
		forPath: function(path) {
			var result = this;
			var steps = path.getSteps();

			var result = this;
			
			for(var i = 0; i < steps.length; ++i) {
				var step = steps[i];

				var children = result.get('children');

				var subNode = children.find(function(child) {
					var facetFacadeNode = child.get('facetFacadeNode');
					var childStep = facetFacadeNode.getFacetNode().getStep();
					var result = childStep.equals(step);
					return result;
				});

				result = subNode;

				if(!result) {
					console.log("Path not found: " + path);
					break;
				}
			}
			
			return result;
		}
		
	});
	

	ns.CollectionFacetNode = Backbone.Collection.extend({
		model : ns.ModelFacetNode
	});
	
	
	/**
	 * ModelConstraints should be treated immutable!
	 * 
	 * TODO: I think we should use the complex model here too:
	 * a constraint has a type and then some extra fields depending on it
	 * e.g. {type: 'equals', path: somePath, value: node}
	 */
	ns.ModelConstraint = Backbone.Model.extend({
		defaults : {
			//type: null,
			//path : null, // The path the contraint applies to
			
			// TODO: Not sure if the constraint should be a sub-object
			constraint : null
		}
	});

	
	/**
	 * A collection for contraints.
	 * 
	 * For simplicity this is a flat collection. TODO Explain how to update a
	 * query factory from it
	 * 
	 */
	ns.ConstraintCollection2 = Backbone.Collection.extend({
		model: ns.ModelConstraint,
		
		existsEquals: function(path, node) {
			var result = this.some(function(model) {
				
				//console.log("Comparing path and node to model:", path, node, model);
				
				var constraint = model.get('constraint');
				//var constraint = model;

				/*
				console.log("Comparing path and node to model:", path, node, model);
				console.log(constraint.type === 'equals');
				console.log(path.equals(constraint.path));
				console.log(node.equals(constraint.node));
				*/
				
				var test
					= constraint.type === 'equals'
					&& path.equals(constraint.path)
					&& node.equals(constraint.node);
			
				
				return test;
			});
			
			return result;
		},
		
		createConstraintManager: function(rootFacetNode) {
			
			var constraintManager = new facets.ConstraintManager();
			var facetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);

			this.each(function(model) {
				var constraint = model.get('constraint');

				var path = constraint.path;
				var node = constraint.node; 

				
				checkNotNull(constraint);
				
				if(constraint.type !== 'equals') {
					logger.log("Only equals supported right now");
					return
				}
				
				facetFacadeNode.forPath(path).addConstraint({
					type: 'equals',
					path: path,
					node: node
				});
			});

			return constraintManager;
//			var nodeValue = sparql.NodeValue.makeNode(sparql.Node
//					.uri("http://dbpedia.org/resource/year/2008"));
//			var constraint = facets.ConstraintUtils.createEquals(yearPath,
//					nodeValue);			
		}
	});

	

	
	ns.createFacetNodes = function(constraintCollection, rootFacetNode) {

		constraintCollection.each(function(model) {
			var path = model.get("path");
			var constraint = model.get("constraint");

			var node = rootFaceNode.forPath(path);
			node.addConstraint(constraint);
		});

	};

	/**
	 * These models are created 
	 * 
	 */
	ns.ModelItemCheckConstraint = Backbone.Model.extend({
		defaults: {
			isChecked: false
			//path: null,
			//node: null
		}
	});

	/**
	 * This collection is
	 * 
	 */
	ns.CollectionItemCheckConstraint = Backbone.Collection.extend({
		model: ns.ModelItemCheckConstraint
	});
	

	
	
	ns.MapModel = Backbone.Model.extend({
		/**
		 * The collection of resources that should be displayed. 
		 */
		uris: [],
		//resources: new ResourceCollection(),
		
		/**
		 * Rdf data about these resources in Talis Json format
		 */
		json: {},		
	});

})();