<?php
    // false: include minimized JavaScript, otherwise include original source
    $debug = true;

    $activeThemePath = "themes/lgd";

    $configXml = simplexml_load_file("$activeThemePath/server-config.xml");
    $title = (string)$configXml->title;

    $semmapVersion = $configXml->version;
    if(!$semmapVersion) {
        $semmapVersion = "(not set)";
    }

    $headerFile = "$activeThemePath/header.html";

    include_once("index-utils.php");

    if($debug) {
        $cssFileNames = getCssSourceFiles();
        $jsFileNames = getJsSourceFiles();
    } else {
        $cssFileNames = getCssMinFiles();
        $jsFileNames = getJsMinFiles();
    }

    $cssIncludes = toStringCssTags($cssFileNames);
    $jsIncludes = toStringJsTags($jsFileNames);


    
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html class="js" lang="en" dir="ltr" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head xmlns:update="http://ns.aksw.org/update/">
    
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

        <title><?php echo "$title" ?></title>
        

        <link rel="stylesheet" href="lib/twitter-bootstrap/2.0.3/css/bootstrap.min.css" />
        <?php echo "$cssIncludes\n" ?>
        <link rel="stylesheet" type="text/css" href="lib/jquery-ui/1.8.16/themes/base/jquery-ui.css" />    

        <!-- <script type="text/javascript" src="src/main/webapp/js/prototypes.js"></script> -->

        <script type="text/javascript" src="lib/namespacedotjs/a28da387ce/Namespace.js"></script>
        <script type="text/javascript" src="lib/jquery/1.7.2/jquery-1.7.2.js"></script>
        <script type="text/javascript" src="lib/jQuery-ajaxTransport-XDomainRequest/current/jQuery.XDomainRequest.js"></script>
        <script type="text/javascript" src="lib/jquery-ui/1.8.16/ui/jquery-ui.js"></script>
        <script type="text/javascript" src="lib/underscore/1.3.1/underscore.js"></script>
        <script type="text/javascript" src="lib/underscore.string/current/dist/underscore.string.min.js"></script>
        <script type="text/javascript" src="lib/backbone/0.9.2/backbone.js"></script>
        <script type="text/javascript" src="lib/twitter-bootstrap/2.0.3/js/bootstrap.js"></script>
        <script type="text/javascript" src="lib/agility/current/agility.js" charset="utf-8"></script>
        <script type="text/javascript" src="lib/CryptoJS/3.0.2/components/core-min.js"></script>
        <script type="text/javascript" src="lib/CryptoJS/3.0.2/components/enc-utf16-min.js"></script>
        <script type="text/javascript" src="lib/CryptoJS/3.0.2/components/enc-base64-min.js"></script>
        <script type="text/javascript" src="lib/open-layers/2.12/OpenLayers.js"></script>
        <script type="text/javascript" src="lib/json-template/0.85/json-template.js"></script>
        <script type="text/javascript" src="lib/RDFauthor/current/libraries/jquery.rdfquery.rdfa-1.0.js"></script>
        <!-- <script type="text/javascript" src="lib/open-layers/2.10/extensions/OpenStreetMap/OpenStreetMap.js"></script> -->




	<!-- The actual spatial semantic browsing widgets -->
        <?php echo "$jsIncludes\n" ?>

	<script type="text/javascript" src="config.js"></script>


	<script type="text/javascript">

		var backend = Namespace("org.aksw.ssb.backend");
		var facets = Namespace("org.aksw.ssb.facets");
		var backboneUtils = Namespace("org.aksw.utils.backbone");
		var xsd = Namespace("org.aksw.ssb.vocabs.xsd");


		var facetTest = function() {
		
			var sparqlService = new backend.SparqlServiceHttp(
				"http://localhost:8810/sparql",
				[],
				"lib/SparqlProxyPHP/current/sparql-proxy.php",
				"service-uri");
		
		
			var v = sparql.Node.v("s");
			var element = new sparql.ElementString("?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [v]);		
	
			var concept = new facets.ConceptInt(element, v);
	
			// TODO Maybe concepts should really be used at the level of the DataFetcher rather than the QueryFactory level:
			// Note: (Concept)DataFetcher is then in the workflow between DataProvider and QueryFactory:
			// The DataProvider wraps the whole configuration, and calls the dataFetcher which makes use of the QueryFactories.
			// dataFetcher.fetchDataFor(concept);
			// If we have an external concept, we may have to chunk the items; rather than directly creating a query from them. 
	
			var queryGenerator = new facets.QueryGenerator(concept); 
			var queryFactoryConcept = new facets.QueryFactoryQueryGenerator(queryGenerator);
	
				var tableModel = new facets.TableModelQueryFactory(queryFactory);
				tableModel.setLimit(10);
			
	
			var queryGeneratorFacets = new facets.QueryGenerator(queryFactoryConcept, v);  
			
			//var queryGenerator = new facets.QueryGenerator(concept); 
			var queryFactory = new facets.QueryFactoryQueryGenerator(queryGenerator);
	
			var tableModel = new facets.TableModelQueryFactory(queryFactory);
			tableModel.setLimit(10);
			
			var queryFactoryKeyword = new facets.QueryFactoryKeyword(tableModel, [v]);			
	
			var executor = new facets.ExecutorQueryFactory(sparqlService, queryFactoryKeyword);
			var dataProviderTmp = new facets.DataProvider.Executor(executor);
			
			//var postProcessor = DataTemplate.Sparql.createPostProcessor(myDataTemplate, myDataBinding);
			//var searchDataProvider = new facets.DataProvider.Pipe(dataProviderTmp, postProcessor);
			
			
			// The idea is to have views on the ModelFacetNode objects.
			// These views can then wrap the node's corresponding queryFactory to add limit/offset/search
			
			var ModelFacetNode = Backbone.Model.extend({
				defaults: {
					//baseQueryFactory: null, // Query factory for the instances (can be seen as facet values)
					//facetsQueryFactory: null, // Query factory for the facets (of the instances)
					//constraints: [], // contraints applying to this node
					isExpanded: false, // when changing to true, the controller will start loading the children 
					isLoading: false,
					children: new Backbone.Collection(), // subFacets - NOT facet values!
					facetNode: null, // Reference to a (non-model) FacetNode
				}
			});
			
			var ControllerFacetNode = function(sparqlService, model, facetManager) {
				this.sparqlService = sparqlService;
				this.model = model;
				this.facetManager = facetManager ? facetManager : new facets.FacetManager();
			};
			
			ControllerFacetNode.prototype = {			
				bind: function() {
					var sparqlService = this.sparqlService;
					var model = this.model;
					var queryFactory = model.get("queryFactory");
					var query = queryFactory.createQuery();
				
					var handlers = {};
				
					var factoryChangeHandler = function() {
						model.set({isLoading: true});
						var collection = model.get("children");

						var queryFactory = model.get("queryFactory");
						var query = queryFactory.createQuery();
												
						var promise = dataFetcher.fetchData(query);
						promise.done(function(data) {
							collection.add(data);
							
							// For all remaining children, update the queryFactory accordingly
							_.each(collection, function(model) {
								
							
							});
							
							
						}).fail(function() {
							console.log("Facet loading failed... TODO Handle this case?");
						});
					};
									
					var destroyHandler = function() {
						_.each(handlers, function(value, key) {
							model.off(key, value);
						});
					};

					_.each(handlers, function(value, key) {
						model.on(key, value);
					});

					
					_.extend(handlers, {
						"change:queryFactory": factoryChangeHandler,
						"destroy": destroyHandler 
					});
				}
			};
			
			
			
			
			var modelFacetNode = new ModelFacetNode({
				baseQueryFactory: tableModel,
				//facetManager: new 
			});
			
			
			
	
	/**
	 * A facet provider for ingoing/outgoing properties
	 * 
	 */
	var FacetProviderSimple = function(sparqlService, isInverse) {
		this.sparqlService = sparqlService;
		this.isInverse = isInverse ? isInverse : false;
	};
	
	FacetProviderSimple.prototype = {
		fetchFacets: function(concept) {
			var self = this;
		
			var sampleSize = null; //50000;
			var facetVar = sparql.Node.v("__p");
			var countVar = sparql.Node.v("__c");
			
			var query = queryUtils.createQueryFacetCount(concept, facetVar, countVar, this.isInverse, sampleSize);

			var myDataTemplate = function(binding) {
				
				
				
				// TODO Create a copy of the facet manager excluding the constraints on this path.
				
				//var element = concept.getElement();
				
				var prefix = self.isInverse ? "<" : "";
			
				var result = {
					id: "simple_" + prefix + binding.facetName.value,
					type: "property",
					facetUri: binding.facetName.value,
					facetCount: binding.facetCount.value,
					isInverse: self.isInverse,
					concept: null
				};
				
				//console.log("Binding:", result);
				return result;
			};
			
			var myDataBinding = {
				facetName: facetVar.value,
				facetCount: countVar.value
			};
			
			
//			console.log("Query: " + query);
			
			var dataProviderFactory = new facets.DataProviderFactoryQuery(this.sparqlService, function(x) { return x; });
			
			var dataProviderTmp = dataProviderFactory.createDataProvider(query);


			var postProcessor = DataTemplate.Sparql.createPostProcessor(myDataTemplate, myDataBinding);
			var dataProvider = new facets.DataProvider.Pipe(dataProviderTmp, postProcessor);

			var promise = dataProvider.fetchData();			

//			dataProviderTmp.fetchData().done(function(x) { console.log("YEAH", JSON.stringify(x)); });
//			promise.done(function(x) { console.log("YEAH", JSON.stringify(x)); });
			
			return promise;
		}
	};
				
	
	// A fact provider returns a promise that yields the name of the facet plus a concept for its values.
	// { type: name: concept: } 
				
				
	var ModelFacetUpdater = function(facetProviders) {
		this.facetProviders = facetProviders;
	};
	
	
	ModelFacetUpdater.prototype = {
		updateFacets: function(model, concept) {
		
			// If the node is not expanded, we omit it
			var isExpanded = model.get("isExpanded");
			if(!isExpanded) {
				return;
			}

			var children = model.get("children");		
			var syncer = new backboneUtils.CollectionCombine(children);
		
		
			// Get the facets of the concept
			var promises = _.map(facetProviders, function(facetProvider) {
				var promise = facetProvider.fetchFacets(concept);
				return promise;
			});
			
			model.set({isLoading : true});
			$.when(promises, function() {
				model.set({isLoading : false});
			});
			
			

			syncer.sync(promises);
		}
	
	};
		
		
		var facetProviders = [
			new FacetProviderSimple(sparqlService, false)
		];
			
			
			
			var modelFacetUpdater = new ModelFacetUpdater(facetProviders);
			
			var rootModel = new ModelFacetNode();

			/**
			 * The concept for facets is as follows:
			 * - It is possible to create paths, which are essentially sequences of properties
			 * - Constraints can be created that make use of these paths
			 * - A constraint manager is a container for constraints on paths
			 *
			 * - A "FacetNode" is an object that can generate Triples from Paths; thereby allocating unique variables for each path
			 * - The constraint manager can then create a SPARQL element for all constraints set.
			 *
			 * This element can then be combined with some other query.
			 * 
			 */
			
			var amountPath = facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project http://example.org/beneficiary http://ex.org/amount");
			var cityPath = facets.Path.fromString("http://fp7-pp.publicdata.eu/ontology/project http://example.org/beneficiary http://ex.org/city");

			var constraintManager = new facets.ConstraintManager();
			{
				var nodeValue = sparql.NodeValue.makeNode(sparql.Node.forValue(1000));
				var constraint = facets.ConstraintUtils.createEquals(amountPath, nodeValue);
				constraintManager.addConstraint(constraint);
			}

			{
				var nodeValue = sparql.NodeValue.makeNode(sparql.Node.uri("http://ex.org/Leipzig"));
				var constraint = facets.ConstraintUtils.createEquals(cityPath, nodeValue);
				constraintManager.addConstraint(constraint);
			}

			
			var generator = new facets.GenSym("v");
			var rootFacetNode = facets.FacetNode.createRoot("s", generator);
			
			
			var elements = constraintManager.createElements(rootFacetNode);
			var e = new sparql.ElementTriplesBlock(elements);
			
			console.log("FOOBAR", e);
			
			

			console.log("Constraint:", constraint);
			
			var instance = constraint.instanciate(rootFacetNode);
			console.log("Constraint Instance:", instance);
			 
			
/*
			var projectFacetNode = rootFacetNode.forProperty("http://fp7-pp.publicdata.eu/ontology/project", false);
			//projectFacetNode.addConstraint(new facets.ConstraintEquals(new sparql.NodeValue(sparql.Node.typedLit(2008, xsd.integer)))); //{type: "equals", value: "foobar"});
			
			
			
			var yearFacetNode = rootFacetNode.forProperty("http://fp7-pp.publicdata.eu/ontology/year", false);
			//yearFacetNode.addConstraint(new facets.ConstraintEquals(new sparql.NodeValue(sparql.Node.typedLit(2008, xsd.integer)))); //{type: "equals", value: 2008});
			
			
			var triples = yearFacetNode.getTriples();
			
			console.log("yearFacetNode", yearFacetNode);			
			console.log("Triples", triples);
			
						var testRoot = yearFacetNode.copyExclude();
			
			console.log("testRoot", testRoot);
			
*/		
			
			//ConstraintManager.addContraint(yearFacetNode, new some Constraint);
			//ContraintMangager.createElement(yearfacetNode); // Create an element excluding some node
			
			
			
			// From the elementDesc we can:
			// Create a query for count of facet values
			//    Select ?o Count(Distinct ?s) { ?s rdfs:label ?o } Group By ?o
			// Create a query for the actual facet values and their instance count
			// Select Count(Distinct ?o) { ?s rdfs:label ?o }
			
			//var elementDesc = yearFacetNode.createElementDesc();
			
			
			// TODO: Maybe we should view the facetManager as a 'spec builder'
			
			
						
			//yearFacetNode.addConstraint(); //{type: "equals", value: 2009});
			
			/* Alternative spec:
			var facetSpec = {
				steps = [
					{
						step: {
							type: "property",
							uri: "http://fp7-pp.publicdata.eu/ontology/year",
							inverse: false
						},
						constraints: [{
							type: "equals",
							value: { // this is an RDF Node
								type: plain-literal,
								value: "2008"
							}
						]
					}, {
						// more //
					}
				]
			};
			
			*/
			
			var constraintFactoryMap = {
				equals: function(o) {
					var result = new facets.Equals(o.value);
					return result;
				}
			};
			
			var stepFactoryMap = {
				property: function(o) {
					var result = new facets.Step(o.property, o.isInverse);
					return result;
				}
			};
			
			
			/**
			 * TODO: Maybe expand the query factory with a
			 * getVarsMentioned() method or with a blacklist var method?
			 * The point is, I want to exend the query with new variables
			 * and avoid clashes.
			 *
			 */
			
			var QueryFactoryFacetNode = function(baseQueryFactory, conceptVarName, constraintMap) {
				this.queryFactory = baseQueryFactory;
				this.contraintMap = constraintMap;
				
				this.generator = new facets.GenSym();

				this.pathToVar = {};
			};
			
			QueryFactoryFacetNode.prototype = {
			
				createElements: function(facetNode) {
					// Iterate all steps
					_.each(facetNode.idToStep, function(step) {
						
						
					});
				
				},
			
				/**
				 *
				 *
				 */				
				createQuery: function() {
					
					
				}
			};
			
			
			
			
			//yearFacetNode.
			
			

/*
	var FacetMasterView = Backbone.View.extand({
		    tagName: 'li',
		    attributes: {style: 'float: left'},
		    initialize: function(){
		      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

		      this.model.bind('change', this.render, this);
		      this.model.bind('remove', this.unrender, this);
		    },
		    render: function() {
				var children = model.get("children");
				
				
		    
		    	var html = JSON.stringify(this.model.attributes);
		      $(this.el).html(html); 
		      return this;
		    },
		    unrender: function() {
		      $(this.el).remove();
		    },
		    remove: function(){
		      this.model.destroy();
		    }	
	});
*/


    /**
     * A collection for contraints.
     *
     * For simplicity this is a flat collection.
     * TODO Explain how to update a query factory from it
     *
     */
	var ContraintCollection = Backbone.Collection.extend({
	});


	var createFacetNodes = function(constraintCollection, rootFacetNode) {
	
		constraintCollection.each(function(model) {
			var path = model.get("path");
			var constraint = model.get("constraint");
			
			var node = rootFaceNode.forPath(path);
			node.addConstraint(contraint);
		});
	
	};

	
	/**
	 * ModelConstraints should be treated immutable!
	 *
	 */
	var ModelConstraint = Backbone.Model.extend({
		defaults: {
			path: null, // The path the contraint applies to
			constraint: null // Constraint data
		}
	});
	


	var ViewFacetItem = Backbone.View.extend({
		    tagName: 'li',
		    //attributes: {style: 'float: left'},
		    initialize: function(){
		      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

		      this.model.bind('change', this.render, this);
		      this.model.bind('remove', this.unrender, this);
		      
		      
		      this.facetValuesView = null;
		      
		    },
		    events: {
		    	'click .expandable': function() {
		    		var model = this.model;
		    	
		    		model.set({isExpanded: true});
		    		
		    		
		    		//console.log("Facet Model: ", model.attributes);
		    		
		    		modelFacetUpdater.updateFacets(model, concept);
		    		
		    		
		    		var facetNode = model.get("facetNode");
		    		var facetManager = facetNode.copyExcludeThis();
		    		
		    		
		    		
		    		//var subFm = facetManager.copyExcludePath(model.id);
		    		
		    		var queryFactory = new QueryFactoryFacetManager(concept, subFm);
		    		
		    		var dataFetcher = dataFetcherFactory.create(queryFactory);
		    		
		    		
		    	} 
		    },
		    render: function() {
		    	var foo = JSON.stringify(this.model.attributes);
		    	var text = this.model.get("facetUri");
		    	var html = '<a class="expandable" href="#"><img src="src/main/resources/osm-logo-small.png" />' + text + '</a>';
		    
		    	
		      $(this.el).html(html); 
		      return this;
		    },
		    unrender: function() {
		      $(this.el).remove();
		    },
		    remove: function() {
		      this.model.destroy();
		    }
	});

			var facetItemRenderer = new widgets.RendererItemView(
					{},
					null,
					ViewFacetItem,
					{
						label: "simpleLabel"
					}
			);

			var rootCollection = rootModel.get("children");

			this.facetWidget = new widgets.ListView({
				el: $("#facets"), 
				collection: rootCollection, 
				itemRenderer: facetItemRenderer
			});

			rootModel.set("isExpanded", true);
			
			modelFacetUpdater.updateFacets(rootModel, concept);
		
		}
		
		$(document).ready(facetTest);
		
	</script>
</head>
<body>


	<div id="wrapper">
	
	<input id="searchInput" type="text" />
	<ul id="facets" style="list-style: none; list-style-type:none;">
	
	</ul>
</body>
</html>
