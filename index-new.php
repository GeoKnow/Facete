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

		// A class that combines the elements of multiple backbone collections
		var CollectionConcater = function(target, sources) {
			this.target = target ? target : new Backbone.Collection();
			this.sources = sources; 
			
			this.syncId = 0;
		};
		
		CollectionConcater.prototype = {
			add: function(collection) {
			},
			
			remove: function(collection) {
			}
		};


		var backend = Namespace("org.aksw.ssb.backend");
		var facets = Namespace("org.aksw.ssb.facets");
		//var facets = Namespace("org.aksw.ssb.widgets");

	var ViewSearchItem = Backbone.View.extend({
		    tagName: 'li',
		    attributes: {style: 'float: left'},
		    initialize: function(){
		      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

		      this.model.bind('change', this.render, this);
		      this.model.bind('remove', this.unrender, this);
		    },
		    render: function(){
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


		var CollectionCombine = function(collection) {
			this.collection = collection ? collection : new Backbone.Collection();			
			this.state = [];
			this.syncId = 0;
		};
		
		CollectionCombine.prototype = {

			getCollection: function() {
				return this.collection;
			},				
		
			sync: function(promises) {
			
				var state = this.state;
				var collection = this.collection;
				
				// Add
				{
					var delta = promises.length - state.length;
					for(var i = 0; i < delta; ++i) {
						state[i] = [];
					}
				}
				
				// Remove
				{
					var delta = state.length - promises.length;
					
					for(var i = state.length - 1; i > promises.length; --i) {
						var tmp = state[i];
						collection.remove(tmp);					
					}
					state.splice(promises.length, delta);				
				} 
			
				var self = this;
				var syncId = ++this.syncId;
			
				var dataProviders = this.dataProviders;
				
				var handleData = function(data, i) {
					if(syncId != self.syncId) {
						return;
					}
				
					var tmp = self.state[i];
					self.collection.remove(tmp);

					state[i] = data;
					if(data) { // FIXME only reject null and undefined.
						self.collection.add(data);
					}				
				};
				
				_.each(promises, function(promise, i) {
		
					promise.done(function(data) {
						handleData(data, i);
					}).fail(function(json) {
						// TODO Factor this out into error handling code
						var data = {
							id: "error" + i,
							type: "error",
							data: json
						};
						
						handleData(data, i);
					});
										
				});
			}
		};
				


	var SearchMeta = function(searchProviders) {
		this.searchProviders = searchProviders;
	};
	
	SearchMeta.prototype = {
		search: function(str) {
		
			var promises = _.map(this.searchProviders, function(searchProvider) {
				var promise = searchProvider.search(str);
				return promise;
			});
			
			return promises;
		}
	};


		var searchTest = function() {
			var sparqlService = new backend.SparqlServiceHttp(
				"http://localhost:8810/sparql",
				[],
				"lib/SparqlProxyPHP/current/sparql-proxy.php",
				"service-uri");
				
				
			var v = sparql.Node.v("s");
			var element = new sparql.ElementString("?s a <http://fp7-pp.publicdata.eu/ontology/Project>", [v]);		

			var myDataTemplate = function(binding) {
					return {
						id: "resource_" + binding.label.value,
						type: "resource",
						data: binding/*{ 
							label: nameParts[0],
							comment: nameParts[1],
							lon: item.lon,
							lat: item.lat
							//lonlat: new OpenLayers.LonLat(item.lon, item.lat)
						}*/
					};
			};
			
			var myDataBinding = {
				label: "s"
			};


			var concept = new facets.ConceptInt(element, v);
			
			var queryGenerator = new facets.QueryGenerator(concept); 
			var queryFactory = new facets.QueryFactoryQueryGenerator(queryGenerator);

			var tableModel = new facets.TableModelQueryFactory(queryFactory);
			tableModel.setLimit(10);
			
			var queryFactoryKeyword = new facets.QueryFactoryKeyword(tableModel, [v]);			

			var executor = new facets.ExecutorQueryFactory(sparqlService, queryFactoryKeyword);
			var dataProviderTmp = new facets.DataProvider.Executor(executor);
			
			var postProcessor = DataTemplate.Sparql.createPostProcessor(myDataTemplate, myDataBinding);
			var searchDataProvider = new facets.DataProvider.Pipe(dataProviderTmp, postProcessor);
			
			
			var searchSparql = new widgets.SearchSparql(searchDataProvider, queryFactoryKeyword);
			var searchNominatim = new widgets.SearchNominatim(); //"http://nominatim.aksw.org/nominatim/");
			var searchMeta = new SearchMeta([searchSparql, searchNominatim]);

			
			var searchCollection = new Backbone.Collection();
			
			
			var searchItemRenderer = new widgets.RendererItemView(
					{},
					null,
					ViewSearchItem,
					{
						label: "simpleLabel"
					}
			);
			
			this.constraintWidget = new widgets.ListView({
				el: $("#searchResults"), 
				collection: searchCollection, 
				itemRenderer: searchItemRenderer
			});
			
			
			
			
			var searchColCont = new CollectionCombine(searchCollection);
			
			
			var searchInput = $("#searchInput"); 
			//searchInput.change(function() {
			
			var scheduler = new Scheduler(500);
			
			searchInput.on("keyup", function() {
				scheduler.schedule(function() {
				
					var val = searchInput.val();
					var promises = searchMeta.search(val);
					searchColCont.sync(promises);
				});
			
			});
			
			//tableModel.setLimit(
			
			/*
			qe.done(function(json) {
				alert(":)");
			}).fail(function() {
				alert(":(");
			});*/
			
			
			
			
		}


		$(document).ready(searchTest);
		
	</script>
</head>
<body>


	<div id="wrapper">
	
	<input id="searchInput" type="text" />
	<div id="searchResults">
	
	</div>
</body>
</html>
