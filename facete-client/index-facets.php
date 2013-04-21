﻿<?php
    // false: include minimized JavaScript, otherwise include original source
    $debug = true;

    $activeThemePath = "themes/odp2";

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
        <link rel="stylesheet" type="text/css" href="lib/select2/3.3.2/select2.css"></script>
        <link rel="stylesheet" type="text/css" href="lib/jquery-ui/1.10.2/themes/base/jquery-ui.css" />    

        <!-- <script type="text/javascript" src="src/main/webapp/js/prototypes.js"></script> -->

        <script type="text/javascript" src="lib/namespacedotjs/a28da387ce/Namespace.js"></script>
        <script type="text/javascript" src="lib/jquery/1.9.1/jquery-1.9.1.js"></script>
        <script type="text/javascript" src="lib/jQuery-ajaxTransport-XDomainRequest/current/jQuery.XDomainRequest.js"></script>
        <script type="text/javascript" src="lib/jquery-ui/1.10.2/ui/jquery-ui.js"></script>
        <script type="text/javascript" src="lib/underscore/1.4.4/underscore.js"></script>
        <script type="text/javascript" src="lib/underscore.string/current/dist/underscore.string.min.js"></script>
        <script type="text/javascript" src="lib/backbone/1.0.0/backbone.js"></script>
        <script type="text/javascript" src="lib/twitter-bootstrap/2.0.3/js/bootstrap.js"></script>
        <script type="text/javascript" src="lib/agility/current/agility.js" charset="utf-8"></script>
        <script type="text/javascript" src="lib/CryptoJS/3.0.2/components/core-min.js"></script>
        <script type="text/javascript" src="lib/CryptoJS/3.0.2/components/enc-utf16-min.js"></script>
        <script type="text/javascript" src="lib/CryptoJS/3.0.2/components/enc-base64-min.js"></script>
        <script type="text/javascript" src="lib/open-layers/2.12/OpenLayers.js"></script>
        <script type="text/javascript" src="lib/json-template/0.85/json-template.js"></script>
        <script type="text/javascript" src="lib/RDFauthor/current/libraries/jquery.rdfquery.rdfa-1.0.js"></script>
        <!-- <script type="text/javascript" src="lib/open-layers/2.10/extensions/OpenStreetMap/OpenStreetMap.js"></script> -->

        <script type="text/javascript" src="lib/select2/3.3.2/select2.js"></script>



	<!-- The actual spatial semantic browsing widgets -->
        <?php echo "$jsIncludes\n" ?>

	<script type="text/javascript" src="config.js"></script>

    <script type="text/javascript" src="src/main/webapp/js/main-facets.js"></script>


	<script type="text/javascript">

		var facets = Namespace("org.aksw.ssb.facets");

		$(document).ready(facets.facetTest);
		
	</script>
</head>
<body>
	<div class="container">
		<?php include($headerFile); ?>

		<div id="div-settings" class="row-fluid" style="display: none">
			<form>
				<label><input type="radio" name="group1" checked="checked"/>Global</label>
				<div class="service-config"></div>
				<div class="inline">Service:</div> <div id="sparql-service-selector" class="select2-container inline" style="width: 300px;"></div>
    			<div class="inline">Datasets:</div> <div id="default-graph-selector" class="select2-container multiple inline" style="width: 600px;"></div>
				<br class="clearBoth" />
				<hr>
				<label><input type="radio" name="group1" />Level of Detail</label>
				<div class="lod-slider inline" style="width: 300px;"></div>
				<div class="lod-service-condfig"></div>
				<br class="clearBoth" />
			<form>
		</div>

		<div class="row-fluid">
			<div class="span3 left-column">
				<ul id="facets" style="list-style: none; list-style-type:none;"></ul>
                <div id="facetValues" style="min-height: 300px"></div>
			</div>
		
			<div class="span5">
                <div id="instances"></div>
                <a id="exportCsv" href="#">Export CSV</a>
                <a id="exportRdf" href="#">Export RDF</a>
			</div>

			<div id="mapContainer" class="span4">
				<div id="map" style="height: 500px;"></div>
				<a id="centerMapOnPosition" href="#" style="position:absolute; bottom: 20px; z-index: 1000;">Center on user location</a>
			</div>
 
			
		</div>
    </div>
</body>
</html>