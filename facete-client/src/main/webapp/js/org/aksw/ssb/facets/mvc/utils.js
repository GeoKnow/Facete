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


	/**
	 * A facet provider for ingoing/outgoing properties
	 * 
	 */
	ns.FacetProviderSimple = function(sparqlService, isInverse) {
		this.sparqlService = sparqlService;
		this.isInverse = isInverse ? isInverse : false;
	};

	ns.FacetProviderSimple.prototype = {
			
		/**
		 * @param mode false for exclusion, true for inclusion
		 * 
		 */
		fetchFacets : function(concept, mode, steps) { // Maybe URIs should be steps?
			var self = this;

			var sampleSize = null; // 50000;
			var facetVar = sparql.Node.v("__p");
			var countVar = sparql.Node.v("__c");
			
			var query = queryUtils.createQueryFacetCount(concept, facetVar,
					countVar, this.isInverse, sampleSize);

			console.log("Fetching facets with query: " + query);
			
			var uris = [];
			if(steps && steps.length > 0) {
				
				// Create the URIs from the steps
				for(var i = 0; i < steps.length; ++i) {
					var step = steps[i];
					
					if(step.isInverse() === this.isInverse) {
						var propertyUri = sparql.Node.uri(step.propertyName);

						uris.push(propertyUri);
					}
				}
				
				// Skip fetching if we have inclusion mode with no uris
				if(mode === true) {
					if(uris.length === 0) {
						return null;
					}
				}	

				
				if(uris.length !== 0) {
					var expr = new sparql.E_In(new sparql.ExprVar(facetVar), uris);
					
					if(!mode) {
						expr = new sparql.E_LogicalNot(expr);
					}

					var filter = new sparql.ElementFilter([expr]);

					console.log("Filter: ", filter);
					query.elements.push(filter);
				}
			}
			
			console.log("Steps: ", steps);
			console.log("IsInverse: ", this.isInverse);
			console.log("Uris: ", uris);
			console.log("FacetProviderQuery: " + query);
			
			
			var myDataTemplate = function(binding) {

				// TODO Create a copy of the facet manager excluding the
				// constraints on this path.

				// var element = concept.getElement();

				var prefix = self.isInverse ? "<" : "";

				var result = {
					id : "simple_" + prefix + binding.facetName.value,
					type : "property",
					facetUri : binding.facetName.value,
					facetCount : binding.facetCount.value,
					isInverse : self.isInverse,
				// concept: null
				};

				// console.log("Binding:", result);
				return result;
			};

			var myDataBinding = {
				facetName : facetVar.value,
				facetCount : countVar.value
			};

			// console.log("Query: " + query);

			var dataProviderFactory = new facets.DataProviderFactoryQuery(
					this.sparqlService, function(x) {
						return x;
					});

			var dataProviderTmp = dataProviderFactory.createDataProvider(query);

			var postProcessor = DataTemplate.Sparql.createPostProcessor(
					myDataTemplate, myDataBinding);
			var dataProvider = new facets.DataProvider.Pipe(dataProviderTmp,
					postProcessor);

			var promise = dataProvider.fetchData();

			// dataProviderTmp.fetchData().done(function(x) {
			// console.log("YEAH", JSON.stringify(x)); });
			// promise.done(function(x) { console.log("YEAH",
			// JSON.stringify(x)); });

			return promise;
		}
	};


	// A fact provider returns a promise that yields the name of the facet plus
	// a concept for its values.
	// { type: name: concept: }

	// //@param constraintManagerFactory: An object that has a createConstraintManager method.
	ns.ModelFacetUpdater = function(facetProviders, baseConcept, constraintCollection, sparqlService) {//constraintManagerFactory */) {
		this.facetProviders = facetProviders;
		this.baseConcept = baseConcept;
		this.constraintCollection = constraintCollection;
		
		
		this.sparqlService = sparqlService;
		/* this.constraintManagerFactory = constraintManagerFactory; */
	};

	ns.ModelFacetUpdater.prototype = {
		updateFacets : function(model, facetFacadeNode) {
			var self = this;

			// If the node is not expanded, we omit it
			var isExpanded = model.get("isExpanded");
			if (!isExpanded) {
				return;
			}

			
			// The concepts for which to fetch facets
			// We have a list of concepts because we need to deal with constraints configurations
			// For these concepts we can just 
			var conceptItems = [];
			

			// Figure out which facet steps have constraints:
			// For each of them we have to fetch the counts individually by excluding
			// constraints on that path
			
			// On the other hand, we can do a single query to capture all non-constrained paths
			var constrainedSteps = facetFacadeNode.getConstrainedSteps();
			console.log("Constrained steps: " + JSON.stringify(constrainedSteps));

			var promises = [];

			var fnLoop = function(sparqlService, conceptItem) {

				var facetUri = conceptItem.property;
				var concept = conceptItem.concept;
				
				var element = concept.getElement();
				var variable = concept.getVariable();
				
				var outputVar = sparql.Node.v("__c");
				var limit = null;

				var query = queryUtils.createQueryCountDistinct(element, null, variable, outputVar, null, null);
				console.log("Fetching facets with ", query);
				var queryExecution = queryUtils.fetchInt(sparqlService, query, outputVar);

				
				var promise = queryExecution.pipe(function(facetCount) {
					conceptItem.facetCount = facetCount;
					//item.facetFacadeNode = subNode;
					//item.step = step;

					console.log("ConceptItem: ", conceptItem);
					
					// We need to return arrays for result 
					var result = [conceptItem];
					return result;
				});

				return promise;
			};
			
			for(var i = 0; i < constrainedSteps.length; ++i) {
				var step = constrainedSteps[i];				
				
				var propertyName = step.propertyName;

				var targetNode = facetFacadeNode.forStep(step);
				var targetConcept = targetNode.createConcept();
				//var subNode = facetFacadeNode.forProperty(stepfacetUri.value, step.isInverse);

				var prefix = self.isInverse ? "<" : "";

				var item = {
					id: "simple_" + prefix + propertyName,
					type: 'property',
					property: propertyName,
					isInverse: step.isInverse,
					concept: targetConcept,
					step: step,
					facetFacadeNode: targetNode
				};		
				
				conceptItems.push(item);
			}
			
			
			
			//var individualPromise
			
			for(var i = 0; i < conceptItems.length; ++i) {
				var conceptItem = conceptItems[i];				
				var promise = fnLoop(this.sparqlService, conceptItem);
				promises.push(promise);
			}
			
			
			// The generic query
			var tmpConcept = facetFacadeNode.createConcept();
			
			// Check if the concept of the facetFacadeNode is empty
			var tmpElement = tmpConcept.getElement();
			var isEmptyTmpElement = tmpElement instanceof sparql.ElementGroup && tmpElement.elements.length === 0;
			
			var baseConcept = this.baseConcept;
			var baseElement = baseConcept.getElement();
			
			var e;
			if(!isEmptyTmpElement) {
				
				if(baseConcept.isSubjectConcept()) {
					e = tmpElement;
				} else {
					e = new sparql.ElementGroup([baseElement, tmpElement]);
				}
			} else {
				e = baseElement;
			}
			
			
			var concept = new facets.ConceptInt(e, tmpConcept.getVariable());
			
			console.log("GenericConcept: " + concept, concept.isSubjectConcept());


			var children = model.get("children");
			//var syncer = new backboneUtils.CollectionCombine(children);

			// Get the facets of the concept
			var tmpPromises = _.map(this.facetProviders, function(facetProvider) {
				// TODO: We do not want the facets of the concept,
				// but of the concept + consteraints
				
				// This means: We need to get all constraints at the current path -
				// or more specifically: All steps.
				
				
				var tmp = facetProvider.fetchFacets(concept, false, constrainedSteps);

				var promise = tmp.pipe(function(items) {

					var mapped = _.map(items, function(item) {

						var facetUri = item.facetUri;
						var isInverse = item.isInverse;

						var step = {
							type: 'property',
							property: facetUri,
							isInverse: isInverse
						};
						
						var subFacadeNode = facetFacadeNode.forProperty(facetUri, isInverse);
						
						/*
						item = {
								facetFacadeNode: subNode,
								step: step
						};
						*/
						item.facetFacadeNode = subFacadeNode;
						item.facetNode = subFacadeNode.getFacetNode();
						item.step = step;

						//console.log("Mapped model:", item);

						return item;
					});

					return mapped;
				});

				return promise;
			});

			model.set({
				isLoading : true
			});

			promises.push.apply(promises, tmpPromises);

			console.log("Number of promises loading " + promises.length, promises);
			
			var finalPromise = $.when.apply(null, promises);
			
			finalPromise.done(function() {
				model.set({
					isLoading : false
				});
			});

			finalPromise.done(function() {
				console.log("Arguments: ", arguments);
				var items = [];
				for(var i = 0; i < arguments.length; ++i) {
					var args = arguments[i];
					
					items.push.apply(items, args);
				}

                var itemIds = [];
                for(var i = 0; i < items.length; ++i) {
                    var item = items[i];
                    var itemId = item.id;
                    itemIds.push(itemId);
                }


                // Find all children, whose ID was not yeld
                var childIds = children.map(function(child) {
                    return child.id;
                });


                var removeChildIds = _.difference(childIds, itemIds);
                children.remove(removeChildIds);
/*
                for(var i = 0; i < removeChildIds.length; ++i) {
                    var childId = removeChildIds
                }
*/

				for(var i = 0; i < items.length; ++i) {
					var item = items[i];
					
					var previous = children.get(item.id);
					if(previous) {
						var tmp = item;
						item = previous;
						item.set(tmp);
					} else {
						children.add(item);
					}
				}

				children.each(function(child) {
					var facetFacadeNode = child.get('facetFacadeNode');
					self.updateFacets(child, facetFacadeNode);
				});
				
				/*
				_.each(items, function(item) {
					item.done(function(a) {
						console.log("FFS", a);
					});
				});*/
				/*
				console.log("Children", children);
				console.log("Items", items);
				for(var i = 0; i < items.length; ++i) {
					var item = items[i];
					console.log("Child[" + i + "]: ", item); // + JSON.stringify(items[i]));
				}
				children.set(items);
				console.log("New children", children);
				*/
				
			});
			
			//syncer.sync(promises);
			
			return finalPromise;
		}

	};
	
})();
	
	
