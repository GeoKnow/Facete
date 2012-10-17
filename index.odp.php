<?php
    $defaultLanguage = "en";

    
    /*
     * This PHP snippet reads URL arguments for configuration of the client.
     * Note that these arguments take precedence over the configuration is config.js 
     */
    $locale = isset($_GET["lang"]) ? $_GET["lang"] : $defaultLanguage;
    
    // begins with http -> absolute, else relative
    $sparqlServiceUri = isset($_REQUEST['service-uri']) ? $_REQUEST['service-uri'] : null;


    //$sparqlServiceUri = isset($_REQUEST['endpoint']) ? $_REQUEST['endpoint'] : null;
    
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
    
    
    
    
    
    //$sparqlServiceUri = "http://localhost/sparql";

    // LGD-TEST
    //$endpoint = "http://localhost/lgd/sparql";
    
    
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html class="js" lang="en" dir="ltr" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head xmlns:update="http://ns.aksw.org/update/">
    
    
        <!-- rdfAuthor config. TODO Make endpoints configurable -->
        <link about="http://ex.org" rel="update:sourceGraph" href="http://ex.org" class="Resource" /> 
        <link about="http://ex.org" rel="update:defaultGraph" href="http://ex.org" class="Resource" />
		<link about="http://ex.org" rel="update:queryEndpoint" href="http://localhost/sparql" />
		<link about="http://ex.org" rel="update:updateEndpoint" href="http://localhost/sparql" />
    
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

        <title>European Commission | Opening up European Commission</title>
        

        <!-- <style type="text/css">@import 'lib/fauxconsole/fauxconsole.css';</style> -->
		<link rel="stylesheet" href="lib/twitter-bootstrap/2.0.3/css/bootstrap.min.css" /> 


<!--    	<link rel="stylesheet" href="lib/Font-Awesome/current/css/font-awesome.css"> -->
    
    
<!--         <link rel='stylesheet' type='text/css' -->
<!--             href='lib/dynatree/1.2.0_rc1/src/skin/ui.dynatree.css'> -->
        
        <link rel="stylesheet" type="text/css" href="src/main/webapp/css/style.css" />

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




        <script type="text/javascript" src="lib/gettext/0.08/lib/Gettext.js"></script>

        <link id="active_lang" rel="gettext" type="application/x-po"
            href="src/main/resources/i18n/<?php echo $locale ?>/LC_MESSAGES/messages.po" />


        <script type="text/javascript" src="lib/jquery/1.7.2/jquery-1.7.2.js"></script>

		<script type="text/javascript" src="lib/jQuery-ajaxTransport-XDomainRequest/current/jQuery.XDomainRequest.js"></script>


        <!-- <script type="text/javascript" src="lib/fauxconsole/fauxconsole.js"></script> -->


        <script type="text/javascript"
            src="lib/jquery-ui/1.8.16/ui/jquery-ui.js"></script>


    <!-- Load modificiations to existing frameworks; such as adding events to jQuery's show method -->
<!--
Not needed; Twitter Bootstrap fires the neccessary event already.
	<script type="text/javascript" 
		src="src/main/webapp/js/org/aksw/ssb/mods/jQuery.js"></script>
		-->


<!--         <script type="text/javascript" -->
<!--             src="lib/jquery-ui/1.8.16/external/jquery.cookie.js"></script> -->

<!--         <script type="text/javascript" -->
<!--             src="lib/dynatree/1.2.0_rc1/src/jquery.dynatree.js"></script> -->

        <script type="text/javascript"
            src="lib/underscore/1.3.1/underscore.js"></script>

        <script type="text/javascript"
            src="lib/underscore.string/current/dist/underscore.string.min.js"></script>


        <script type="text/javascript" src="lib/backbone/0.9.2/backbone.js"></script>

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


	<!-- The actual spatial semantic browsing widgets -->
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/QuadTree.js"></script>
    
	<script type="text/javascript" 
		src="src/main/webapp/js/ssb.utils.js"></script>

	<script type="text/javascript" 
		src="src/main/webapp/js/Dispatcher.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/MultiMap.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/MultiGraph.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/LabelCollection.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/jsonrdf-extraction-utils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/facet-controller.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/jquery.ssb.instances.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/jquery.ssb.map.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/jquery.ssb.search.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/backend/SparqlServiceHttp.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/backend/SparqlServicePaginator.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/sparql/Syntax.js"></script>


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/vocabs/xsd.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/vocabs/rdf.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/vocabs/rdfs.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/vocabs/owl.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/vocabs/wgs84.js"></script>
    
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/vocabs/geovocab.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/vocabs/appvocab.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/BackboneUtils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/StringUtils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/UriUtils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/Concepts.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/Facets.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/Constraints.js"></script>

	<script type="text/javascript" src="config.js"></script>


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/QueryGenerationUtils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/QueryExecutionUtils.js"></script>


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/QueryGenerator.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/QueryExecutor.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/LabelFetcher.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/GeomPointFetcher.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/RdfQuery.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/TalisJson.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/ListWidgetBase.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/ListWidgetBaseOld.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/PaginatorWidget.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/ListWidgetSparql.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/FacetBox.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/ResourceWidget.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/ResourceListWidget.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/BreadcrumbWidget.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/ConstraintWidget.js"></script>


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/controllers/AppController.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/QueryGeneratorGeo.js"></script>
		
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/QuadTreeModel.js"></script>
		
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/backend/QuadTreeCache.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/QueryCache.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/Abbreviator.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/plugins/RDFauthor.js"></script>
		
		
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/LayoutUtils.js"></script>
	
		
	<!-- Layouting for this (p)HTML file-->
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/Layout.js"></script>


	<!-- OpenDataPortal specify layouting (header bar translations)-->
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/Layout-Odp.js"></script>



	<!--script type="text/javascript" src="lib/RDFauthor/current/src/rdfauthor.js"></script-->
	<script type="text/javascript">
        
        var selectedGraph = {
            URI: "http://fp7-pp.publicdata.eu/",
            title: "",
            editable: true
        }
        var RDFAUTHOR_DEFAULT_GRAPH = "http://ex.org"; //"http://fintrans.publicdata.eu/ec/";
		
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
            urlArgs.sparqlServiceUri = '<?php echo $sparqlServiceUri ?>';
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

	<!-- <script type="text/javascript" src="src/main/webapp/js/main.js"></script>  -->
	<script type="text/javascript" src="src/main/webapp/js/main.js"></script>
	
	<script type="text/javascript">

		// HACK For browsers that do not support console.log
		if(!window.console) {
			var console = {
				log: function() { }
			}
		}

	    $(document).ready(function() {

		    // Twitter Bootstrap's way of enabling tabs
	    	$('#tabs > ul > li > a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
                
                // HACK We should not do excessive resize events
                $(window).resize();
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


	    	$('#ssb-tabs-search > ul > li > a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
			$('#ssb-tabs-search a:first').tab('show');

		    
	    	//$(".collapse").collapse();
	    	
			// Make the fact box closable
            $("#box-facts-closebutton-img").click(function () {
                $("#box-facts").fadeOut ('slow');
            });
            
			// Make the fact box closable
            $("#box-resources-closebutton-img").click(function () {
                $("#box-resources").fadeOut ('slow');
            });




			//$("#box-facts").position({of: $("#map")});
			//$("#box-resources").position({of: $("#main")});



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
                	
        	/*
        	$('*').live('show', function(e) {
				$(window).resize();
			});
			*/
        
	    });
	
	</script>

    </head>
<body>


	<div id="wrapper">
		<div id="header" class="header">

			<div id="header-language">
				<div class="region region-header-language">
					<div id="block-lang-dropdown-language"
						class="block block-lang-dropdown">


						<div class="content">
							<form action="/open-data/" method="post" id="lang-dropdown-form"
								accept-charset="UTF-8">
								<div>
									<div
										class="form-item form-type-select form-item-lang-dropdown-select">
										<select style="width: 140px"
											class="lang-dropdown-select-element form-select"
											id="edit-lang-dropdown-select" name="lang_dropdown_select"><option
												value="bg">Български (bg)</option>
											<option value="cs">čeština (cs)</option>
											<option value="da">dansk (da)</option>
											<option value="de">Deutsch (de)</option>
											<option value="el">ελληνικά (el)</option>
											<option value="en" selected="selected">English (en)</option>
											<option value="es">español (es)</option>
											<option value="et">eesti keel (et)</option>
											<option value="fi">suomi (fi)</option>
											<option value="fr">français (fr)</option>
											<option value="ga">Gaeilge (ga)</option>
											<option value="hu">magyar (hu)</option>
											<option value="it">Italiano (it)</option>
											<option value="lt">lietuvių kalba (lt)</option>
											<option value="lv">latviešu valoda (lv)</option>
											<option value="mt">Malti (mt)</option>
											<option value="nl">Nederlands (nl)</option>
											<option value="pl">polski (pl)</option>
											<option value="pt">português (pt)</option>
											<option value="ro">română (ro)</option>
											<option value="sk">slovenčina (sk)</option>
											<option value="sl">slovenščina (sl)</option>
											<option value="sv">svenska (sv)</option>
										</select>

									</div>
									<input type="hidden" name="bg" value="/open-data/bg" /> <input
										type="hidden" name="cs" value="/open-data/cs" /> <input
										type="hidden" name="da" value="/open-data/da" /> <input
										type="hidden" name="de" value="/open-data/de" /> <input
										type="hidden" name="el" value="/open-data/el" /> <input
										type="hidden" name="en" value="/open-data/" /> <input
										type="hidden" name="es" value="/open-data/es" /> <input
										type="hidden" name="et" value="/open-data/et" /> <input
										type="hidden" name="fi" value="/open-data/fi" /> <input
										type="hidden" name="fr" value="/open-data/fr" /> <input
										type="hidden" name="ga" value="/open-data/ga" /> <input
										type="hidden" name="hu" value="/open-data/hu" /> <input
										type="hidden" name="it" value="/open-data/it" /> <input
										type="hidden" name="lt" value="/open-data/lt" /> <input
										type="hidden" name="lv" value="/open-data/lv" /> <input
										type="hidden" name="mt" value="/open-data/mt" /> <input
										type="hidden" name="nl" value="/open-data/nl" /> <input
										type="hidden" name="pl" value="/open-data/pl" /> <input
										type="hidden" name="pt" value="/open-data/pt" /> <input
										type="hidden" name="ro" value="/open-data/ro" /> <input
										type="hidden" name="sk" value="/open-data/sk" /> <input
										type="hidden" name="sl" value="/open-data/sl" /> <input
										type="hidden" name="sv" value="/open-data/sv" />
									<noscript>
										<span> <input type="submit" id="edit-submit" name="op"
											value="Go" class="form-submit" />
										</span>
									</noscript>
									<input type="hidden" name="form_build_id"
										value="form-RpEpyK4TSCcjk3DP9PeLVzO7QEeXQf0mDY5kgd5rshM" /> <input
										type="hidden" name="form_id" value="lang_dropdown_form" />
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>

			<div id="header-menu">
				<div class="region region-header-menu">
					<div id="block-menu-menu-service-menu" class="block block-menu">


						<div class="content">
							<ul class="menu">
<!-- 								<li class="first leaf"><a href="/open-data/user/login" title="">-&gt;CMS</a></li> -->
								<li class="first leaf"><a id="org.ec.odp.ssb.ui.label.legal-notice" href="http://ec.europa.eu/geninfo/legal_notices_en.htm" title="">Legal Notice</a></li>
								<li class="leaf"><a href="/open-data/contact" title=""><span id="org.ec.odp.ssb.ui.label.contact">Contact</span></a></li>
								<li class="last leaf"><a href="http://ec.europa.eu/geninfo/query/search_en.html" title=""><span id="org.ec.odp.ssb.ui.label.search">Search</span></a></li>
							</ul>
						</div>

					</div>
				</div>
			</div>
			<div class="logo">
				<a id="logo" rel="Home" title="Home" href="/open-data/"> <img
					alt="Home"
					src="src/main/resources/images/logo_en.gif" />
				</a>
			</div>
			<div id="header-title">
				<a href="/open-data/" title="Home">Data Portal</a>

			</div>
			<div id="header-subtitle">The Open Data Hub of the European Union</div>

			<!--
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

-->
		</div>




		<div id="main" style="position:relative; width: 100%; height: 100%">
			<!-- <div class="row-fluid" style="height:100%"> -->
			<div id="ssb-navbar" style="position: absolute; top: 0px; left: 0px; width: 300px; height: 100%;">

				<div id="tabs" style="height: 100%; width: 100%; padding-right:0px;">

					<ul id="ssb-nav-tabs-header" class="nav nav-tabs ssb-nav-tabs">

						<li id="tabs-header-search"><a href="#tabs-content-search"><span
								id="org.aksw.ssb.ui.label.search-tab">Search</span> </a></li>

						<li id="tabs-header-instances"><a href="#tabs-content-instances"><span
								id="org.aksw.ssb.ui.label.instances-tab">Instances</span> </a></li>
						<li id="tabs-header-facets"><a href="#tabs-content-facets"><span
								id="org.aksw.ssb.ui.label.facets-tab">Facets</span> </a></li>
						<!-- 	                <li id="tabs-header-types"><a href="#tabs-content-types"><span id="org.aksw.ssb.ui.label.types-tab">Types</span></a></li> -->

						<li id="tabs-header-start"><a href="#tabs-content-start"><span
								id="org.aksw.ssb.ui.label.start-tab">Config</span> </a></li>

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

						<div id="tabs-content-search" class="tab-pane">
							<!--                 <div>  -->

							<div id="ssb-tabs-search" class="tab-content">
								<ul class="nav nav-tabs ssb-nav-tabs">
									<li><a href="#ssb-place-search"><span
											id="org.aksw.ssb.ui.label.place-search-tab">Places</span>
									</a></li>
									<li><a href="#ssb-resource-search"><span
											id="org.aksw.ssb.ui.label.resource-search-tab">Resources</span>
									</a></li>
								</ul>
								<div id="ssb-tabs-search-content" class="tab-content">
									<div id="ssb-place-search" class="tab-pane">
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
										<div id="searchResults"></div>
									</div>

									<div id="ssb-resource-search" class="tab-pane"></div>
								</div>
							</div>
						</div>






							<!--                 </div>  -->

					</div>

				</div>
			</div>
			<div id="ssb-main-content"
				style="position: absolute; top: 0px; bottom: 0px; left: 300px; right: 0px;">

				<div id="filtersAndMap" style="position:absolute; height: 100%; width: 100%;">

					<div id="ssb-breadcrumb"></div>
					<div id="ssb-constraints"></div>
					<div id="map" style="position:relative"></div>
				</div>
			</div>


		</div>
	</div>


	<div id="box-resources">
<!--		<div style="font-size: 24px;"> -->
			<!--                 <img src="src/main/resources/images/cross.svg" id="box-facts-closebutton-img"/> -->
			<i id="box-resources-closebutton-img" class="icon-remove-sign"></i>
<!--		</div> -->
	</div>

	<div id="box-facts">
<!--		<div style="font-size: 24px;"> -->
			<!--                 <img src="src/main/resources/images/cross.svg" id="box-facts-closebutton-img"/> -->
			<i id="box-facts-closebutton-img" class="icon-remove-sign"></i>

<!--		</div> -->
	</div>


</body>
</html>
