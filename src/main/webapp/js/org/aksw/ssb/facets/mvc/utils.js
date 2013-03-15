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
		fetchFacets : function(concept) {
			var self = this;

			var sampleSize = null; // 50000;
			var facetVar = sparql.Node.v("__p");
			var countVar = sparql.Node.v("__c");

			var query = queryUtils.createQueryFacetCount(concept, facetVar,
					countVar, this.isInverse, sampleSize);

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
	ns.ModelFacetUpdater = function(facetProviders, baseConcept /*, constraintManagerFactory */) {
		this.facetProviders = facetProviders;
		this.baseConcept = baseConcept;
		/* this.constraintManagerFactory = constraintManagerFactory; */
	};

	ns.ModelFacetUpdater.prototype = {
		updateFacets : function(model, facetFacadeNode) {

			var tmpConcept = facetFacadeNode.createConcept();
			
			var tmpElement = new sparql.ElementGroup([this.baseConcept.getElement(), tmpConcept.getElement()]);
			
			//concept.getElement().push(this.baseConcept.getElement());
			var concept = new facets.ConceptInt(tmpElement, tmpConcept.getVariable());
			
	
			//var facetFacadeNode = model.get('facetFacadeNode');
			//constraintCollection
			
			
			
			// console.log("Loading facets for concept:" + concept);
			// console.log("The model is: ", model);

			// If the node is not expanded, we omit it
			var isExpanded = model.get("isExpanded");
			if (!isExpanded) {
				return;
			}

			var children = model.get("children");
			var syncer = new backboneUtils.CollectionCombine(children);

			// Get the facets of the concept
			var promises = _.map(this.facetProviders, function(facetProvider) {
				// TODO: We do not want the facets of the concept,
				// but of the concept + constraints
				
				// This means: We need to get all constraints at the current path -
				// or more specifically: All steps.
				
				
				var tmp = facetProvider.fetchFacets(concept);

				var promise = tmp.pipe(function(items) {

					var mapped = _.map(items, function(item) {

						var facetUri = item.facetUri;
						var isInverse = item.isInverse;

						var step = {
							type: 'property',
							property: facetUri,
							isInverse: isInverse
						};
						
						var subNode = facetFacadeNode.forProperty(facetUri, isInverse);
						
						/*
						item = {
								facetFacadeNode: subNode,
								step: step
						};
						*/
						item.facetFacadeNode = subNode;
						item.step = step;

						// console.log("Mapped model:", item);

						return item;
					});

					return mapped;
				});

				return promise;
			});

			model.set({
				isLoading : true
			});

			var finalPromise = $.when(promises);
			
			finalPromise.done(function() {
				model.set({
					isLoading : false
				});
			});

			syncer.sync(promises);
			
			return finalPromise;
		}

	};
	
})();
	
	