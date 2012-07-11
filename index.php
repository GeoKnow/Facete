<?php
    $defaultLanguage = "en";

    
    /*
     * This PHP snippet reads URL arguments for configuration of the client.
     * Note that these arguments take precedence over the configuration is config.js 
     */
    $locale = isset($_GET["lang"]) ? $_GET["lang"] : $defaultLanguage;
    
    // begins with http -> absolute, else relative
    $sparqlServiceUrl = isset($_REQUEST['endpoint']) ? $_REQUEST['endpoint'] : null;
    
    // Empty means use it all
    // FIXME Support multiple default graphs
    $defaultGraphUri = isset($_REQUEST['default-graph-uri']) ? $_REQUEST['default-graph-uri'] : null;
    
    // A JSON object representing the current state (lat/long, facets, etc)
    $state = isset($_REQUEST['state']) ? $_REQUEST['state'] : null;
    
    
    /*
     * Parameters for setting a custom driver
     * 
     */
    $query = isset($_REQUEST['query']) ? $_REQUEST['query'] : null;
    $var = isset($_REQUEST['var']) ? $_REQUEST['var'] : null;
    
    
    //$sparqlServiceUrl = "http://localhost/sparql";

    // LGD-TEST
    //$endpoint = "http://localhost/lgd/sparql";
    
    
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html class="js" lang="en" dir="ltr" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head xmlns:update="http://ns.aksw.org/update/">
    
        <!-- rdfAuthor config. TODO Make endpoints configurable -->
        <link about="" rel="update:defaultGraph" href="http://localhost/spatial" class="Resource">
		<link about="http://localhost/spatial" rel="update:queryEndpoint" href="http://localhost/sparql" />
		<link about="http://localhost/spatial" rel="update:updateEndpoint" href="http://localhost/sparql" />
        <link about="" rel="update:sourceGraph" href="http://localhost/spatial" class="Resource"> 
    
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <title>European Commission | Opening up European Commission</title>
        

		<link rel="stylesheet" href="lib/twitter-bootstrap/2.0.3/css/bootstrap.min.css" /> 


    	<link rel="stylesheet" href="lib/Font-Awesome/current/css/font-awesome.css">
    
    
<!--         <link rel='stylesheet' type='text/css' -->
<!--             href='lib/dynatree/1.2.0_rc1/src/skin/ui.dynatree.css'> -->
        
        <link rel="stylesheet" type="text/css" href="src/main/resources/css/style.css" />

        <link rel="stylesheet" type="text/css"
            href="lib/jquery-ui/1.8.16/themes/base/jquery-ui.css" />

<!--         <link rel="stylesheet" type="text/css" -->
<!--             href="lib/jquery-ui/1.8.16/themes/base/jquery.ui.tabs.css" /> -->

<!-- 			<link -->
<!-- 				rel="stylesheet" type="text/css" -->
<!-- 				href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/themes/ui-lightness/jquery-ui.css" /> -->


			<!-- 		<link rel="stylesheet" href="lib/jquery-ui/1.8.16/css/smoothness/jquery-ui-1.8.20.custom.css" /> -->
<!-- 		<link rel="stylesheet" href="style.css" /> -->

        <script type="text/javascript"
            src="lib/namespacedotjs/a28da387ce/Namespace.js"></script>


	<script type="text/javascript" src="config.js"></script>


        <script type="text/javascript" src="lib/gettext/0.08/lib/Gettext.js"></script>

        <link id="active_lang" rel="gettext" type="application/x-po"
            href="src/main/resources/i18n/<?php echo $locale ?>/LC_MESSAGES/messages.po" />


        <script type="text/javascript" src="lib/jquery/1.7.2/jquery-1.7.2.js"></script>


        <script type="text/javascript"
            src="lib/jquery-ui/1.8.16/ui/jquery-ui.js"></script>


<!--         <script type="text/javascript" -->
<!--             src="lib/jquery-ui/1.8.16/external/jquery.cookie.js"></script> -->

<!--         <script type="text/javascript" -->
<!--             src="lib/dynatree/1.2.0_rc1/src/jquery.dynatree.js"></script> -->

        <script type="text/javascript"
            src="lib/underscore/1.3.1/underscore.js"></script>

        <script type="text/javascript" src="lib/backbone/0.5.3/backbone.js"></script>

        <script type="text/javascript"
            src="lib/twitter-bootstrap/2.0.3/js/bootstrap.js"></script>



<!--         <script type="text/javascript" src="lib/agility/0.1.2/agility.min.js" -->
<!--             charset="utf-8"></script> -->

        <script type="text/javascript" src="lib/agility/current/agility.js"
            charset="utf-8"></script>


        <script type="text/javascript"
            src="lib/CryptoJS/3.0.2/components/core-min.js"></script>

		<script type="text/javascript" src="lib/CryptoJS/3.0.2/components/enc-utf16-min.js"></script>

        <script type="text/javascript"
            src="lib/CryptoJS/3.0.2/components/enc-base64-min.js"></script>


	<!-- Open Layers 2.11-rc2 -->
	<script type="text/javascript"
		src="lib/open-layers/2.10/OpenLayers.js"></script>

	<script type="text/javascript"
		src="lib/json-template/0.85/json-template.js"></script>

	<!--script type="text/javascript"
		src="lib/rdfquery/1.0/jquery.rdfquery.core-1.0.js"></script-->

    <script type="text/javascript"
		src="lib/RDFauthor/current/libraries/jquery.rdfquery.rdfa-1.0.js"></script>

 	<script type="text/javascript"
 		src="lib/open-layers/2.10/extensions/OpenStreetMap/OpenStreetMap.js"></script>

<!-- 	<script type="text/javascript" -->
<!-- 		src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js"></script> -->

	<!-- Configuration files -->
	<script type="text/javascript"
		src="src/main/javascript/ssb.namespacePrefixes.js"></script>

	<!-- The actual spatial semantic browsing widgets -->
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/collections/QuadTree.js"></script>
    
	<script type="text/javascript" 
		src="src/main/javascript/ssb.utils.js"></script>

	<script type="text/javascript" 
		src="src/main/javascript/Dispatcher.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/collections/MultiMap.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/collections/MultiGraph.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/collections/LabelCollection.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/jsonrdf-extraction-utils.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/facet-controller.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/jquery.ssb.instances.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/jquery.ssb.map.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/jquery.ssb.search.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/backend/SparqlServiceHttp.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/backend/SparqlServicePaginator.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/sparql/Syntax.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/vocabs/xsd.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/vocabs/rdf.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/vocabs/rdfs.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/vocabs/owl.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/vocabs/wgs84.js"></script>
    
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/vocabs/geovocab.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/vocabs/appvocab.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/facets/Facets.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/facets/Constraints.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/facets/QueryGenerationUtils.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/facets/QueryExecutionUtils.js"></script>


	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/QueryGenerator.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/QueryExecutor.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/utils/StringUtils.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/utils/LabelFetcher.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/utils/GeomPointFetcher.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/utils/RdfQuery.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/utils/TalisJson.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/ListWidgetBase.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/PaginatorWidget.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/ListWidgetSparql.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/FacetBox.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/ResourceWidget.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/ResourceListWidget.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/widgets/BreadcrumbWidget.js"></script>


	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/app/controllers/AppController.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/app/QueryGenerator.js"></script>
		
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/collections/QuadTreeModel.js"></script>
		
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/collections/QuadTreeCache.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/utils/QueryCache.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/plugins/RDFauthor.js"></script>

	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/experiments/FacetNavigator.js"></script>
		
		
	<!-- Layouting for this (p)HTML file-->
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/app/Layout.js"></script>


	<!-- OpenDataPortal specify layouting (header bar translations)-->
	<script type="text/javascript"
		src="src/main/javascript/org/aksw/ssb/app/Layout-Odp.js"></script>



	<!--script type="text/javascript" src="lib/RDFauthor/current/src/rdfauthor.js"></script-->
	<script type="text/javascript">
        
        var selectedGraph = {
            URI: "http://localhost/spatial",
            title: "",
            editable: true
        }
        var RDFAUTHOR_DEFAULT_GRAPH = "http://localhost/spatial";
		
		RDFAUTHOR_BASE = 'lib/RDFauthor/current/'; //'http://localhost/rdfauthor';
        // RDFAUTHOR_READY_CALLBACK = function() {
            // RDFauthor.setOptions({useSPARQL11: true, viewOptions:{type: "popover"}});
            // RDFauthor.setInfoForGraph(RDFAUTHOR_DEFAULT_GRAPH, 'queryEndpoint', 'http://localhost/sparql');
            // RDFauthor.setInfoForGraph(RDFAUTHOR_DEFAULT_GRAPH, 'updateEndpoint', 'http://localhost/sparql');
			

			// console.debug("[RDFauthor] Registered graphs and services", RDFauthor._graphInfo);
        // };
	</script>
	
	

	<script type="text/javascript">
	        /*
	         * Update the config object based on the URL arguments.
	         * Default values will be overridden.
	         */
			var config = Namespace("org.aksw.ssb.config");

			
			var urlArgs = {};
            urlArgs.sparqlServiceUrl = '<?php echo $sparqlServiceUrl ?>';
            var defaultGraphUri = '<?php echo $defaultGraphUri ?>'.trim();
			if(defaultGraphUri.length > 0) {
				urlArgs.defaultGraphUris = [defaultGraphUri];
			}

            var rawState = '<?php echo $state ?>';
            urlArgs.state = $.parseJSON(rawState);
            
            urlArgs.lang = '<?php echo $locale ?>';


			urlArgs.query = '<?php echo $query ?>';
			urlArgs.variable = '<?php echo $var ?>';


            // Only add entries with non-null and non-empty-string values to 'override' 
            var override = {};
			$.each(urlArgs, function(key, value) {
				if(value) {
					var valueStr = ("" + value).trim();
					if(valueStr.length > 0) {
						override[key] = value;
					}
				}
			});
			
            _.extend(config, override);

            //alert("Final configuration: " + JSON.stringify(config));
            
            function insertParam(key, value)
            {
                key = escape(key); value = encodeURIComponent(value);

                var kvp = document.location.search.substr(1).split('&');

                var i=kvp.length; var x; while(i--) 
                {
                    x = kvp[i].split('=');

                    if (x[0]==key)
                    {
                            x[1] = value;
                            kvp[i] = x.join('=');
                            break;
                    }
                }

                if(i<0) {kvp[kvp.length] = [key,value].join('=');}

                //this will reload the page, it's likely better to store this until finished
                document.location.search = kvp.join('&'); 
            }
        
        </script>

	<!-- <script type="text/javascript" src="src/main/javascript/main.js"></script>  -->
	<script type="text/javascript" src="src/main/javascript/main.js"></script>
	
	<script type="text/javascript">

	    $(document).ready(function() {

		    // Twitter Bootstrap's way of enabling tabs
	    	$('#tabs > ul > li > a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });

		    // Enable the first tab
	    	$('#tabs a:first').tab('show');


		    // Resizing does not work currently - would be great if we could add that in the future
			//$("#ssb-navbar").resizable();

		    // Enable tabs: start
	    	$('#ssb-tabs-start > ul > li > a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });

		    // Enable the first tab
	    	$('#ssb-tabs-start a:first').tab('show');

		    
	    	//$(".collapse").collapse();
	    	
			// Make the fact box closable
            $("#box-facts-closebutton-img").click(function () {
                $("#box-facts").fadeOut ('slow');
            });
            
			// Make the fact box closable
            $("#box-resources-closebutton-img").click(function () {
                $("#box-resources").fadeOut ('slow');
            });


			$("#box-facts").position({of: $("#map")});
			$("#box-resources").position({of: $("#map")});
			//$("#box-resources").position({of: $("#map"));
			
			//$("#box-facts").resizable();
    		
	    	//$("#tabs").tabs();
		    /* 
            $("#tabs-instances").click ( function () {
                $("#tabs-facets-content").hide ();
                $("#tabs-places-content").hide ();
                $("#tabs-types-content").hide ();
                
                $("#tabs-instances-content").show ();
            });
            $("#tabs-facets").click ( function () {
                $("#tabs-instances-content").hide ();
                $("#tabs-types-content").hide ();
                $("#tabs-places-content").hide ();
                
                $("#tabs-facets-content").show ();
            });
            $("#tabs-types").click ( function () {
                $("#tabs-instances-content").hide ();
                $("#tabs-facets-content").hide ();
                $("#tabs-places-content").hide ();
                
                $("#tabs-types-content").show ();
            });
            $("#tabs-places").click ( function () {
                $("#tabs-instances-content").hide ();
                $("#tabs-facets-content").hide ();
                $("#tabs-types-content").hide ();
                
                $("#tabs-places-content").show ();
            });
            
            $("#tabs-instances-content").hide ();
            $("#tabs-places-content").hide ();
            $("#tabs-types-content").hide ();
        */
	    });
	
	</script>

    </head>
<body>


	<div id="wrapper">
		<div id="header">


			<img src="src/main/resources/images/logo_european_commision.gif"
				id="header-logo" />
			<div id="header-headline">
				<a href="">Open Data Portal</a>
			</div>
			<div id="header-abstract">Spatial Browser</div>
			<div id="header-menu-right">
				<a id="org.ec.odp.ssb.ui.label.legal-notice" href="#">Legal Notice</a>
				| <a href="#"><span id="org.ec.odp.ssb.ui.label.contact">Contact</span>
				</a> | <a href="#"><span id="org.ec.odp.ssb.ui.label.search">Search</span>
				</a> <select name="lang" id="language-switcher">
					<option value="#">Čeština</option>
					<option value="#">Dansk</option>
					<option value="de">Deutsch</option>
					<option value="#">Ελληνικά</option>
					<option value="en" selected="selected">English</option>
					<option value="#">Eesti</option>
					<option value="#">Español</option>
					<option value="#">Français</option>
					<option value="#">Gaeilge</option>
				</select>
			</div>
			<div id="header-blueblock">&nbsp;</div>
		</div>



		<div id="main" style="position:relative; width: 100%; height: 100%">
			<!-- <div class="row-fluid" style="height:100%"> -->
			<div id="ssb-navbar" style="position: absolute; top: 0px; left: 0px; width: 300px; height: 100%;">

				<div id="tabs" style="height: 100%; width: 100%; padding-right:0px;">

					<ul id="ssb-nav-tabs-header" class="nav nav-tabs ssb-nav-tabs">
						<li id="tabs-header-start"><a href="#tabs-content-start"><span
								id="org.aksw.ssb.ui.label.start-tab">Start</span> </a></li>

						<li id="tabs-header-instances"><a href="#tabs-content-instances"><span
								id="org.aksw.ssb.ui.label.instances-tab">Instances</span> </a></li>
						<li id="tabs-header-facets"><a href="#tabs-content-facets"><span
								id="org.aksw.ssb.ui.label.facets-tab">Facets</span> </a></li>
						<!-- 	                <li id="tabs-header-types"><a href="#tabs-content-types"><span id="org.aksw.ssb.ui.label.types-tab">Types</span></a></li> -->
						<li id="tabs-header-places"><a href="#tabs-content-places"><span
								id="org.aksw.ssb.ui.label.places-tab">Places</span> </a></li>
					</ul>
					<!--             </div> -->


					<div id="ssb-nav-tabs-content" class="tab-content">

						<div id="tabs-content-start" class="tab-pane">

							<div id="ssb-tabs-start" class="tab-content">
								<ul class="nav nav-tabs ssb-nav-tabs">
									<li><a href="#ssb-graph-selection"><span
											id="org.aksw.ssb.ui.label.graph-selection-tab">Graphs</span>
									</a></li>
									<li><a href="#ssb-class-selection"><span
											id="org.aksw.ssb.ui.label.class-selection-tab">Classes</span>
									</a></li>
								</ul>
								<div id="ssb-tabs-start-content" class="tab-content">
									<div id="ssb-graph-selection" class="tab-pane"></div>
									<div id="ssb-class-selection" class="tab-pane"></div>
								</div>
							</div>
						</div>


						<div id="tabs-content-instances" class="tab-pane"></div>
						<div id="tabs-content-facets" class="tab-pane"></div>
						<div id="tabs-content-places" class="tab-pane">
							<!--                 <div>  -->
							<div class="tabdiv" id="places-tab">
								<div>
									<form id="box-places-searchform"
										action="javascript: doSearch();">
										<input type="text" id="search-field" name="search-field"
											value="" autocomplete="off" style="width: 200px;" /> <input
											type="image" src="src/main/resources/images/search.png"
											class="ssb-icon" />
									</form>
									<p style="font-size: 11px;">
										powered by <a href="http://nominatim.openstreetmap.org"
											target="_blank">Nominatim</a>
									</p>
								</div>
								<div id="searchResults"></div>
							</div>
							<!--                 </div>  -->
						</div>

					</div>

				</div>
			</div>
			<div id="ssb-main-content"
				style="position: absolute; top: 0px; bottom: 0px; left: 300px; right: 0px;">

				<div id="filtersAndMap" style="height: 100%; width: 100%;">

					<div id="ssb-breadcrumb"></div>
					<div id="ssb-constraints"></div>
					<div id="map" style="position:relative"></div>
				</div>
			</div>


		</div>
	</div>


	<div id="box-resources">
		<div style="font-size: 24px;">
			<!--                 <img src="src/main/resources/images/cross.svg" id="box-facts-closebutton-img"/> -->
			<i id="box-resources-closebutton-img" class="icon-remove-sign"></i>
		</div>
	</div>

	<div id="box-facts">
		<div style="font-size: 24px;">
			<!--                 <img src="src/main/resources/images/cross.svg" id="box-facts-closebutton-img"/> -->
			<i id="box-facts-closebutton-img" class="icon-remove-sign"></i>
		</div>
	</div>


</body>
</html>
