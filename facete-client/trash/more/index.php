<?php
    // false: include minimized JavaScript, otherwise include original source
    $debug = true;


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
    

    /*
     * Settings
     */
    //$activeThemePath = "themes/odp";
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

        <link id="active_lang" rel="gettext" type="application/x-po" href="src/main/resources/i18n/<?php echo $locale ?>/LC_MESSAGES/messages.po" />

        <title><?php echo "$title" ?></title>
        

        <link rel="stylesheet" href="lib/twitter-bootstrap/2.0.3/css/bootstrap.min.css" />
        <?php echo "$cssIncludes\n" ?>
        <link rel="stylesheet" type="text/css" href="lib/jquery-ui/1.8.16/themes/base/jquery-ui.css" />    

        <!-- <script type="text/javascript" src="src/main/webapp/js/prototypes.js"></script> -->

        <script type="text/javascript" src="lib/namespacedotjs/a28da387ce/Namespace.js"></script>
        <script type="text/javascript" src="lib/gettext/0.08/lib/Gettext.js"></script>
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

	<script type="text/javascript" src="facete-config.js"></script>


	<script type="text/javascript" src="lib/RDFauthor/current/src/rdfauthor.js"></script>

	<script type="text/javascript">
        /*
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
	*/
	</script>
	
	

	<script type="text/javascript">
	        /*
	         * Update the config object based on the URL arguments.
	         * Default values will be overridden.
	         */
			var config = Namespace("org.aksw.ssb.config");

			
			var urlArgs = {};
            urlArgs.sparqlServiceUri = '<?php echo $sparqlServiceUri ?>';
            var defaultGraphUri = jQuery.trim('<?php echo $defaultGraphUri ?>');
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
					var valueStr = jQuery.trim("" + value);
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
	    });
	
	</script>

    </head>
<body>


	<div id="wrapper">
		<div id="header" class="header">
			<?php include($headerFile); ?>
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
									<li style="display:none;"><a href="#ssb-class-selection"><span
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
									<li style="display:none;"><a href="#ssb-resource-search"><span
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
		<!-- <div id="box-resources-content" /> -->
	</div>


	<div id="box-resources-secondary">
	</div>


	<div id="box-facts">
<!--		<div style="font-size: 24px;"> -->
			<!--                 <img src="src/main/resources/images/cross.svg" id="box-facts-closebutton-img"/> -->
			<i id="box-facts-closebutton-img" class="icon-remove-sign"></i>

<!--		</div> -->
<!--		<div id="box-facts-content" /> -->
	</div>

        <div id="semmap-version" style="position:absolute; left: 10px; bottom: 5px; font-size: smaller; color:#396EA2;">
            SemMap version: <?php echo $semmapVersion ?>
        </div>

</body>
</html>
