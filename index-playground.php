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
		src="src/main/webapp/js/org/aksw/ssb/widgets/TableWidgetSparql.js"></script>

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
	<!-- <script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/Layout.js"></script> --


	<!-- OpenDataPortal specify layouting (header bar translations)-->
	<!-- <script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/Layout-Odp.js"></script> -->


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/controllers/ResourceDetailsController.js"></script>


	<!-- <script type="text/javascript" src="src/main/webapp/js/main.js"></script>  -->

	<script type="text/javascript" src="src/main/webapp/js/org/aksw/ssb/domains/fp7-pp/widgets/ProjectInfoWidget.js"></script>



<!--	<script type="text/javascript" src="src/main/webapp/js/org/aksw/ssb/domains/fp7-pp/widgets/TestProjectPartnerFundingTable.js"></script> -->
	<script type="text/javascript" src="src/main/webapp/js/org/aksw/ssb/domains/fp7-pp/widgets/TestTableView.js"></script>
	


	<script type="text/javascript">

	    $(document).ready(function() {
	    	
	    });
	    
	</script>

    </head>
<body>


<div id="wrapper">

	<table id="table" />

</div>


</body>
</html>

