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
    
    
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html class="js" lang="en" dir="ltr" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
    
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <title>LATC Quality Assurance Dashboard</title>
        

		<link rel="stylesheet" href="lib/twitter-bootstrap/2.0.3/css/bootstrap.min.css" /> 


<!--    	<link rel="stylesheet" href="lib/Font-Awesome/current/css/font-awesome.css"> -->
    
    
<!--         <link rel='stylesheet' type='text/css' -->
<!--             href='lib/dynatree/1.2.0_rc1/src/skin/ui.dynatree.css'> -->
        
        <link rel="stylesheet" type="text/css" href="src/main/webapp/css/style.css" />

        <link rel="stylesheet" type="text/css"
            href="lib/jquery-ui/1.8.16/themes/base/jquery-ui.css" />



		<style type="text/css">
			.warning-icon-tiny {
				width: 16px;
				height: 16px;
				float: left;
				margin: 0 5px;
				background-image: url("src/main/resources/images/eu/latc/warning-icon-tiny.png");
			}
		
		
			.error-icon-tiny {
				width: 16px;
				height: 16px;
				float: left;
				margin: 0 5px;
				background-image: url("src/main/resources/images/eu/latc/error-icon-tiny.png");
			}

			a:hover img, a:focus img {
				filter:alpha(opacity=45);
				-moz-opacity: 0.45;
				opacity: 0.45;
			}			
			
		</style>


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


        <script type="text/javascript"
            src="lib/jquery-ui/1.8.16/ui/jquery-ui.js"></script>


<!--         <script type="text/javascript" -->
<!--             src="lib/jquery-ui/1.8.16/external/jquery.cookie.js"></script> -->

<!--         <script type="text/javascript" -->
<!--             src="lib/dynatree/1.2.0_rc1/src/jquery.dynatree.js"></script> -->

        <script type="text/javascript"
            src="lib/underscore/1.3.1/underscore.js"></script>

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
<!--	<script type="text/javascript"
		src="lib/open-layers/2.10/OpenLayers.js"></script> -->

	<script type="text/javascript"
		src="lib/json-template/0.85/json-template.js"></script>

	<!--script type="text/javascript"
		src="lib/rdfquery/1.0/jquery.rdfquery.core-1.0.js"></script-->

    <script type="text/javascript"
		src="lib/RDFauthor/current/libraries/jquery.rdfquery.rdfa-1.0.js"></script>

<!--
 	<script type="text/javascript"
 		src="lib/open-layers/2.10/extensions/OpenStreetMap/OpenStreetMap.js"></script>
 		-->

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
		src="src/main/webapp/js/org/aksw/ssb/facets/Facets.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/Constraints.js"></script>

	<script type="text/javascript" src="config.js"></script>


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/QueryGenerationUtils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/facets/QueryExecutionUtils.js"></script>


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/QueryGenerator.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/QueryExecutor.js"></script>

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
		src="src/main/webapp/js/org/aksw/ssb/app/QueryGenerator.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/TableQueryGenerator.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/TableQueryExecutor.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/widgets/TableWidgetSparql.js"></script>
		
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/QuadTreeModel.js"></script>
		
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/QuadTreeCache.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/QueryCache.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/plugins/RDFauthor.js"></script>



	<script src="lib/highcharts/2.2.5/js/highcharts.js"></script>
	<script src="lib/highcharts/2.2.5/js/modules/exporting.js"></script>

	
	<script type="text/javascript" src="lib/canvg/current/rgbcolor.js"></script>
	<script type="text/javascript" src="lib/canvg/current/canvg.js"></script> 


	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/MathUtils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/qa-dashboard/utils/ChartUtils.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/qa-dashboard/app/Charts.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/qa-dashboard/app/controllers/AppController.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/qa-dashboard/app/main.js"></script>
		
		
	<!-- Layouting for this (p)HTML file-->
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/LayoutUtils.js"></script>


	<!-- OpenDataPortal specify layouting (header bar translations)-->
<!--	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/Layout-Odp.js"></script> -->

	
	<script type="text/javascript">

		function divToImage(element) {
			// Such method might already be part of canvg
		}






	    $(document).ready(function() {
	    	    
	    	var mathUtils = Namespace("org.aksw.utils.math");
	    	    
	    	function percentageRange(low, high) {
	    		return mathUtils.roundNumber((low * 0.1), 2) + "% - " + mathUtils.roundNumber((high * 0.1), 2) + "%"
	    	}
	    	    
			$(function() {
				$( "#slider-range" ).slider({
					range: true,
					min: 0,
					max: 1000,
					values: [0, 1],
					slide: function(event, ui) {
					    var low = ui.values[0];
					    var high = ui.values[1];
                        var label = percentageRange(low, high);
					
						$("#amount").val(label);
					}
				});
				
				/*
				$("#amount").val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
			" - $" + $( "#slider-range" ).slider( "values", 1 ) );
			*/
	       });
	    	    
	    	    
	    	var charts = Namespace("org.aksw.qa-dashboard.charts");
	    	    
	    	// This is a place for hacking
			// Ideally nothing should go here, because scripting should go into separate files
	
	
			{
				var histogram = $('#histogram');
				var elHistogram = histogram.get(0);
				
				var data = charts.createHistogramData();
				data.metricName = "precision";
				
				var chartSpec = charts.createHistogramChartSpec(data);
				chartSpec.chart.renderTo = elHistogram;
				var histogramChart = new Highcharts.Chart(chartSpec);
			}			
			
			
			{
				var chartArea = $('#namespace-chart');
				var elChart = chartArea.get(0);
				
				
				var chartSpec = charts.createNamespaceChartSpec(data);
				chartSpec.chart.renderTo = elChart;
				var chart = new Highcharts.Chart(chartSpec);
				
				
			}			

	
			var data = [
				{name: 'DBpedia LinkedGeoData Airports', author: 'Konrad Höffner', precision: 0.8, recall: 0.4},
				{name: 'DBpedia LinkedGeoData Schools', author: 'Konrad Höffner', precision: 0.75, recall: 0.7},
				{name: 'DBpedia LinkedGeoData Lakes', author: 'Konrad Höffner', precision: 0.6, recall: 0.3},
				{name: 'DBpedia LinkedGeoData Peaks', author: 'Konrad Höffner', precision: 0.5, recall: 0.1}
			];
			
			/*
			for(var i = 0; i < data.length; ++i) {
				var datum = data[i];
			
				var chartSpec = createLinksetChartSpec(datum);

		        var imgUrl = chartToImage(chartSpec, 300, 200);
		        
		        var html =
		        	'<div style="float: left; margin: 5px">' +
		        	'    <img src="' + imgUrl + '" /><br />' +
		        	'    <div class="warning-icon-tiny" /> x 4' + //'<div style="clear:both; float:left;" />' +
		        	'    <div class="error-icon-tiny" /> x 5'+
		        	'</div>'; 
		        
	        	//alert(img);
	        
		        $('#search-result').append(html); 
			}
			*/

	        
	        
	    });

	</script>




    </head>

<body>

	<div id="wrapper">
		<div id="header" style="height: 50px;"> <!-- style="background-color:#0080ff;" -->
			<img style="float:left;" src="src/main/resources/images/eu/latc/latc-logo.gif" /><h1> Quality Assurance Dashboard</h1>			
		</div>
		
		<div id="main" style="position:relative">
			

			<div id="overview" style="width: 800px; margin: 0px auto; height:400px">
			
				<div style="float:left">
					<ul style="list-style-type: none; padding: 0; margin: 0;">
						<li><input type="checkbox">precision</input></li>
						<li><input type="checkbox">recall</input></li>
					</ul>
				</div>
				
				<div id="histogram" style="width: 500px; height: 300px;"></div>
			
			</div>
			
			
			
			<div id="facets-results">
			
				<div id="facets" style="position:absolute;left:0px;width:300px;height:100%"></div>
				
				<div id="results" style="position:absolute;left:300px;right:0px;height:100%>
					<input id="search" type="text" />
					<div style="clear:both;"></div>
					<div id="ssb-breadcrumb"></div>
					<div id="ssb-constraints">Constraints</div>

					
					<ul id="list" style="list-style: none;"></ul>


					<div style="clear:both;"></div>
					<div id="list-paginator"></div>
								<p>
	<label for="amount">Price range:</label>
	<input type="text" id="amount" style="border:0; color:#f6931f; font-weight:bold;" />
</p>
<div id="slider-range"></div>
			
					
				</div>
			
			</div>




<div id="datasets" style="width:500px;height:300px;"></div>


<div id="search-result" style="height:300px;"></div>


<div style="clear: both;" />
<br />

<hr />


<div class="btn-toolbar">
<div class="btn-group">

<a class="btn" href="#"><i class="icon-th"></i></a>
<a class="btn" href="#"><i class="icon-list"></i></a>
</div>
</div>


<hr />


<h1>DBpedia LinkedGeoData Airport</h1>
<p style="padding-left: 50px; font-size: 17px;"><i>by: Konrad H&ouml;ffner</i></p>
<!-- <p style="padding-left: 50px; font-size: 13px;">: <i>LATC Runtime</i></p> -->

<br />
<div>
	<table style="width: 500px;">
		<tr><td>Number of links</td><td>1359</td></tr>					
		<tr><td>Number of duplicate links</td><td>0</td></tr>
		<tr><td>Revision age</td><td>62 days (May 26 2012)</td></tr>
	</table>
</div>
<br />			
<!--
<div style="background-color:#FFF0BF; height: 34px; display: table; border-radius: 15px; padding: 3px; margin: 3px; width: 700px;">
	<img style="float: left; margin: 0 5px;" src="src/main/resources/images/eu/latc/warning-icon.png" />
	<span style="color: #D1A30D; font-size: 15px; display: table-cell; vertical-align: middle;">There are less than 20 evaluated links in the positive linkset</span>
</div>

<div style="background-color:#FFD1D6; height: 34px; display: table; border-radius: 15px; padding: 3px; margin: 3px; width: 700px;">
	<img style="margin: 0 5px;" src="src/main/resources/images/eu/latc/error-icon.png" />
	<span style="color: #ED2D43; font-size: 15px; display: table-cell; vertical-align: middle; width: 600px;">The linkset contains invalid URIs</span>
</div>

-->
<table style="background-color:#FFF0BF; height: 38px; border-radius: 15px; padding: 3px; margin: 3px; width: 700px;">
	<tr>
		<td style="width:40px;"><img style="margin: 0 5px;" src="src/main/resources/images/eu/latc/warning-icon.png" /></td>
		<td><span style="color: #D1A30D; font-size: 15px; vertical-align: middle;">There are less than 20 evaluated links in the positive linkset</span></td>
	</tr>
</table>


<table style="background-color:#FFD1D6; height: 38px; border-radius: 15px; padding: 3px; margin: 3px; width: 700px;">
	<tr>
		<td style="width:40px;"><img style="margin: 0 5px;" src="src/main/resources/images/eu/latc/error-icon.png" /></td>
		<td><span style="color: #ED2D43; font-size: 15px; vertical-align: middle;">The linkset contains invalid URIs</span></td>
	</tr>
</table>


<!--
<div style="background-color:#FFD1D6; height: 34px; border-radius: 15px; padding: 3px; width: 500px;">
	<img style="vertical-align: middle;" src="src/main/resources/images/eu/latc/error-icon.png" />
	<span style="color: #ED2D43; font-size: 15px;">The linkset contains invalid URIs.</span>
</div>
-->		
<div>
	<div id="namespace-chart" style="align:left;width:500px;"></div>			
</div>


<div>
	<h2>Evaluation Result</h2>
	<table style="width: 500px;">
		<tr><td>Positive Estimated Precision</td><td>74%</td></tr>
		<tr><td>Positive Estimated Recall</td><td>61%</td></tr>
		<tr><td>Negative Estimated Precision</td><td>17%</td></tr>
		<tr><td>Pegative Estimated Recall</td><td>12%</td></tr>
	</table>
	<a href="#">Compare with a different reference set...</a>			
</div>

<div>
	<h2>Evolution</h2>
	The charts below show the evaluation results of prior revisions of this linkset against the latest reference sets at that time.
	<div id="#evolution"></div>
</div>

<div>
	<h2>LOD Impact</h2>
	These charts show the change of metrics when the link set was added to the LOD cloud.
</div>
	




</div>

		</div>
	</div>

</body>

</html>
