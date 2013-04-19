
		// Whever the config changes, we must update
		// TODO Untested
		//configModel.on('change', fnUpdateFacets)

    	
		
		
		var queryGenerator = new facets.QueryGenerator(conc);
		var queryFactory = new facets.QueryFactoryQueryGenerator(
				queryGenerator, {
					distinct : true
				});



// var amountPath =
		// facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project
		// http://example.org/beneficiary http://ex.org/amount");
		// var cityPath =
		// facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project
		// http://example.org/beneficiary http://ex.org/city");

		if (false) {
			var yearPath = facets.Path
					.fromString("http://fp7-pp.publicdata.eu/ontology/year");

			{
				var nodeValue = sparql.NodeValue.makeNode(sparql.Node
						.uri("http://dbpedia.org/resource/year/2008"));
				var constraint = facets.ConstraintUtils.createEquals(yearPath,
						nodeValue);
				constraintManager.addConstraint(constraint);
			}
		}

		if (false) {
			facetFacade
					.forPathStr("http://fp7-pp.publicdata.eu/ontology/year")
					.addConstraint(
							{
								type : "equals",
								node : sparql.Node
										.uri("http://dbpedia.org/resource/year/2008")
							});
		}

		/*
		 * { var nodeValue =
		 * sparql.NodeValue.makeNode(sparql.Node.forValue(1000)); var constraint =
		 * facets.ConstraintUtils.createEquals(amountPath, nodeValue);
		 * constraintManager.addConstraint(constraint); }
		 *  { var nodeValue =
		 * sparql.NodeValue.makeNode(sparql.Node.uri("http://ex.org/Leipzig"));
		 * var constraint = facets.ConstraintUtils.createEquals(cityPath,
		 * nodeValue); constraintManager.addConstraint(constraint); }
		 */

		// TODO Maybe concepts should really be used at the level of the
		// DataFetcher rather than the QueryFactory level:
		// Note: (Concept)DataFetcher is then in the workflow between
		// DataProvider and QueryFactory:
		// The DataProvider wraps the whole configuration, and calls the
		// dataFetcher which makes use of the QueryFactories.
		// dataFetcher.fetchDataFor(concept);
		// If we have an external concept, we may have to chunk the items;
		// rather than directly creating a query from them.

		
		
		//var queryFactoryKeyword = new facets.QueryFactoryKeyword(tableModel, [ v ]);

		// var executor = new facets.ExecutorQueryFactory(sparqlService,
		// queryFactoryKeyword);
		// var dataProviderTmp = new facets.DataProvider.Executor(executor);

		// var postProcessor =
		// DataTemplate.Sparql.createPostProcessor(myDataTemplate,
		// myDataBinding);
		// var searchDataProvider = new
		// facets.DataProvider.Pipe(dataProviderTmp, postProcessor);

		// The idea is to have views on the ModelFacetNode objects.
		// These views can then wrap the node's corresponding queryFactory to
		// add limit/offset/search
		
		/*
		var modelFacetNode = new facets.ModelFacetNode({
			baseQueryFactory : tableModel,
			// facetManager: new
		});
		*/

