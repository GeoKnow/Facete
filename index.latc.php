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
		src="src/main/webapp/js/org/aksw/ssb/collections/QuadTreeModel.js"></script>
		
	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/collections/QuadTreeCache.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/utils/QueryCache.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/plugins/RDFauthor.js"></script>



	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/qa-dashboard/app/controllers/AppController.js"></script>

	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/qa-dashboard/app/main.js"></script>
		
		
	<!-- Layouting for this (p)HTML file-->
<!--	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/Layout.js"></script> -->


	<!-- OpenDataPortal specify layouting (header bar translations)-->
<!--	<script type="text/javascript"
		src="src/main/webapp/js/org/aksw/ssb/app/Layout-Odp.js"></script> -->

	<script src="lib/highcharts/2.2.5/js/highcharts.js"></script>
	<script src="lib/highcharts/2.2.5/js/modules/exporting.js"></script>

	
	<script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/rgbcolor.js"></script>
	<script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/canvg.js"></script> 
	
	<script type="text/javascript">

		function divToImage(element) {
			// Such method might already be part of canvg
		}

		function chartToImage(chartSpec, width, height) {

			var s = $('body');
			
			// We temporarily need to add an invisible element
			// FIXME: Maybe highchart also works with a detached element?
			s.prepend('<div style="display:none"></div>');
			var dummy = s.children().eq(0);
			
			dummy.append('<div style="display:none; width: ' + width + 'px; height: ' + height + 'px;"></div>');
			dummy.append('<canvas style="display:none; width: 400px; height: 200px;"></canvas>');			

			var container = dummy.children().eq(0);
			var canvas = dummy.children().eq(1);
			
			console.log(s, dummy, container, canvas);

			// TODO Copy the spec
			chartSpec.chart.renderTo = container.get(0);
			
			var chart = new Highcharts.Chart(chartSpec);
			
			canvg(canvas.get(0), chart.getSVG());

			chart.destroy();
    						
			var imgUrl = canvas.get(0).toDataURL("image/png");
			
			var result = imgUrl;
			
			/*
			container.append('<img src="' + imgUrl + '"></img>');
			
			var result = container.children().eq(0);
			result.detach();
			*/ 	    
			
			dummy.remove();
			
			return result;
		};


		function createHistogramData() {
			var data = [10, 20, 100, 50, 13, 29, 17, 8, 5, 2];
			
			var result = {
				min: 0,
				max: null,
				data: data,
				labels: createBucketLabels(data.length, 0, 1, function(low, high) {
					var d = 0;
					return roundNumber(low * 100, d) + ' - ' + roundNumber(high * 100, d) + '%';
				})
			};
			
			return result;
		};
		
		function roundNumber(number, decimals) {
			var result = Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
			
			return result;
		};
  
		
		function createBucketLabels(n, min, max, callback) {
			var range = max - min;
			var chunk = range / n;
			
			var result = [];
			for(i = 0; i < n; ++i) {
				var low = min + chunk * i;
				var high = min + chunk * (i + 1);
			
				var label = callback ? callback(low, high) : low + ' - ' + high;
			
				result.push(label);
			}
			
			return result;
		};
		
		function createHistogramChartSpec(data) {
			var result = {
	            chart: {
	                renderTo: null,
	                type: 'column' //'bar'
	            },
	            title: {
	                text: "Dataset Overview" // 'DBpedia LinkedGeoData Cities'
	            },
	            subtitle: {
	                text: "" //"latest datasets"//'metric: ' + data.metricName //Konrad Höffner'
	            },
	            xAxis: {
					categories: data.labels,
					labels: {
						align: 'right',
						rotation: -45,
					}
	            },
	            yAxis: {
	                title: {
	                    text: null
	                }
	            },
	            tooltip: {
	                formatter: function() {
	                    return this.y +' datasets'; // this.series.name
	                }
	            },
	            plotOptions: {
					column: {
			            groupPadding: 0,
			            pointPadding: 0,
			            borderWidth: 0
    				}     
    			},
	            credits: {
	                enabled: false
	            },
	            exporting: {
	            	enabled: false
	            },
	            series: [{
	            	name: 'precision',
	            	showInLegend: true,
	                data: data.data,
	                color: '#4572A7'
	            }, {
	            	name: 'recall',
	            	showInLegend: true,
	                data: data.data,
	                color: '#89A54E'
	            }]
	        };
	        
	        return result;
	    };


		function createLinksetChartSpec(data) {
			var result = {
	            chart: {
	                renderTo: null,
	                type: 'column', //'bar'
					borderWidth: 1
	            },
	            title: {
	                text: data.name // 'DBpedia LinkedGeoData Cities'
	            },
	            subtitle: {
	                text: 'by: ' + data.author //Konrad Höffner'
	            },
	            xAxis: {
	               	categories: ['est. precision', 'est. recall'],
	                title: {
	                    text: null
	                }
	
	            },
	            yAxis: {
	                min: 0,
	                max: 1,
	                title: {
	                	//enabled: false,
	                    text: '',
	                    align: 'high'
	                }

	            },
	            tooltip: {
	                formatter: function() {
	                    return ''+
	                        this.series.name +': '+ this.y +' millions';
	                }
	            },
	            plotOptions: {
	                bar: {
	                    dataLabels: {
	                        enabled: true
	                    }
	                }
	            },
	            /*
	            legend: {
	                layout: 'vertical',
	                align: 'right',
	                verticalAlign: 'top',
	                x: -100,
	                y: 100,
	                floating: true,
	                borderWidth: 1,
	                backgroundColor: '#FFFFFF',
	                shadow: true
	            },*/
	            credits: {
	                enabled: false
	            },
	            exporting: {
	            	enabled: false
	            },
	            series: [{
	            	showInLegend: false,
	                data: [data.precision],
	                color: '#89A54E'
	            }, {
	            	showInLegend: false,
	                data: [data.recall],
	                color: '#AA4643'
	            }]
	        };
	        
	        return result;
		};

		function createNamespaceChartSpec(sourceToTargetToCount) {
			
			sourceToTargetToCount = {
				'dbp': {
					'lgd': 1000,
					'dbp': 5,
					'geonames': 1
				},
				'geonames': {
					'lgd': 5
				}
			};
			
			/*
			var colorIndex = 0;
			var colorMap = {};
			var sourceToCount = {};			
			_.each(sourceToTargetToCount, function(s, targetToCount) {
				
				if(!(s in colorMap)) {
					colorMap[s] = colorIndex++;
				}
				
				var total = 0;
				_.each(targetToCount, function(t, count) {
				
					if(!(t in colorMap)) {
						colorMap[t] = colorIndex++;
					}
				
				
					total += count;
				});
				
				sourceToCount[s] = total;
			});
			*/
			
			var colors = Highcharts.getOptions().colors;
			

			var data = [];
			$.each(sourceToTargetToCount, function(s, targetToCount) {
			
				var color = colors[data.length];
				
				var total = 0;
				var d = [];
				var categories = [];
				$.each(targetToCount, function(t, count) {
					total += count;
					
					categories.push(t);
					d.push(count);
				});

				var item = {
	                y: total,
	                color: color,
	                drilldown: {
	                    name: '',
	                    categories: categories,
	                    data: d,
	                    color: color
	                }
	            };

				data.push(item);				
			});
			
			
            var categories = _.keys(sourceToTargetToCount);
            var name = 'Namespaces';
			
			console.log(data);
			            
            /*
            data = [
            	{
	                y: 55.11,
	                color: colors[0],
	                drilldown: {
	                    name: 'MSIE versions',
	                    categories: ['MSIE 6.0', 'MSIE 7.0', 'MSIE 8.0', 'MSIE 9.0'],
	                    data: [10.85, 7.35, 33.06, 2.81],
	                    color: colors[0]
	                }
	            }, {
	                y: 21.63,
	                color: colors[1],
	                drilldown: {
	                    name: 'Firefox versions',
	                    categories: ['Firefox 2.0', 'Firefox 3.0', 'Firefox 3.5', 'Firefox 3.6', 'Firefox 4.0'],
	                    data: [0.20, 0.83, 1.58, 13.12, 5.43],
	                    color: colors[1]
	                }
	            }, {
	                y: 11.94,
	                color: colors[2],
	                drilldown: {
	                    name: 'Chrome versions',
	                    categories: ['Chrome 5.0', 'Chrome 6.0', 'Chrome 7.0', 'Chrome 8.0', 'Chrome 9.0',
	                        'Chrome 10.0', 'Chrome 11.0', 'Chrome 12.0'],
	                    data: [0.12, 0.19, 0.12, 0.36, 0.32, 9.91, 0.50, 0.22],
	                    color: colors[2]
	                }
	            }, {
	                y: 7.15,
	                color: colors[3],
	                drilldown: {
	                    name: 'Safari versions',
	                    categories: ['Safari 5.0', 'Safari 4.0', 'Safari Win 5.0', 'Safari 4.1', 'Safari/Maxthon',
	                        'Safari 3.1', 'Safari 4.1'],
	                    data: [4.55, 1.42, 0.23, 0.21, 0.20, 0.19, 0.14],
	                    color: colors[3]
	                }
	            }, {
	                y: 2.14,
	                color: colors[4],
	                drilldown: {
	                    name: 'Opera versions',
	                    categories: ['Opera 9.x', 'Opera 10.x', 'Opera 11.x'],
	                    data: [ 0.12, 0.37, 1.65],
	                    color: colors[4]
	                }
	            }
			];
    		*/

	        // Build the data arrays
	        var browserData = [];
	        var versionsData = [];
	        for (var i = 0; i < data.length; i++) {
	    
	            // add browser data
	            browserData.push({
	                name: categories[i],
	                y: data[i].y,
	                color: data[i].color
	            });
	    
	            // add version data
	            for (var j = 0; j < data[i].drilldown.data.length; j++) {
	                var brightness = 0.2 - (j / data[i].drilldown.data.length) / 5 ;
	                versionsData.push({
	                    name: data[i].drilldown.categories[j],
	                    y: data[i].drilldown.data[j],
	                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
	                });
	            }
	        }

	        // Create the chart
	        var result = {
	            chart: {
	                renderTo: null,
	                type: 'pie'
	            },
	            title: {
	                text: 'Namespace histogram for "owl:sameAs"'
	            },
	            yAxis: {
	                title: {
	                    text: 'Total percent market share'
	                }
	            },
	            plotOptions: {
	                pie: {
	                    shadow: false
	                }
	            },
	            tooltip: {
	        	    valueSuffix: '%'
	            },
				credits: {
	                enabled: false
	            },
	            exporting: {
	            	enabled: false
	            },
	            series: [{
	                name: 'Browsers',
	                data: browserData,
	                size: '60%',
	                dataLabels: {
	                    formatter: function() {
	                        return this.y > 5 ? this.point.name : null;
	                    },
	                    color: 'white',
	                    distance: -30
	                }
	            }, {
	                name: 'Versions',
	                data: versionsData,
	                innerSize: '60%',
	                dataLabels: {
	                    formatter: function() {
	                        // display only if larger than 1
	                        return this.y > 1 ? '<b>'+ this.point.name +':</b> '+ this.y +' Links'  : null;
	                    }
	                }
	            }]
	        };
	        
	        return result;
		};



	    $(document).ready(function() {
	    	    
	    	// This is a place for hacking
			// Ideally nothing should go here, because scripting should go into separate files
	
	
			{
				var histogram = $('#histogram');
				var elHistogram = histogram.get(0);
				
				var data = createHistogramData();
				data.metricName = "precision";
				
				var chartSpec = createHistogramChartSpec(data);
				chartSpec.chart.renderTo = elHistogram;
				var histogramChart = new Highcharts.Chart(chartSpec);
			}			
			
			
			{
				var chartArea = $('#namespace-chart');
				var elChart = chartArea.get(0);
				
				
				var chartSpec = createNamespaceChartSpec(data);
				chartSpec.chart.renderTo = elChart;
				var chart = new Highcharts.Chart(chartSpec);
				
				
			}			

	
			var data = [
				{name: 'DBpedia LinkedGeoData Airports', author: 'Konrad Höffner', precision: 0.8, recall: 0.4},
				{name: 'DBpedia LinkedGeoData Schools', author: 'Konrad Höffner', precision: 0.75, recall: 0.7},
				{name: 'DBpedia LinkedGeoData Lakes', author: 'Konrad Höffner', precision: 0.6, recall: 0.3},
				{name: 'DBpedia LinkedGeoData Peaks', author: 'Konrad Höffner', precision: 0.5, recall: 0.1}
			];
			
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

	        
	        
	    });

	</script>




    </head>

<body>

	<div id="wrapper">
		<div id="header" style="height: 50px;"> <!-- style="background-color:#0080ff;" -->
			<img style="float:left;" src="src/main/resources/images/eu/latc/latc-logo.gif" /><h1> Quality Assurance Dashboard</h1>
		</div>
		
		<div id="main">
			
			<!-- <div id="overview" style="width: 800px; margin: 0px auto;"> -->
			
				<div style="float:left">
					<ul style="list-style-type: none; padding: 0; margin: 0;">
						<li><input type="checkbox">precision</input></li>
						<li><input type="checkbox">recall</input></li>
					</ul>
				</div>
				
				<div id="histogram" style="width: 500px; height: 300px;"></div>
			
			<!-- </div> -->
			
			
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
			
			<div style="background-color:#FFF0BF; height: 34px; display: table; border-radius: 15px; padding: 3px;">
				<img style="float: left; margin: 0 5px;" src="src/main/resources/images/eu/latc/warning-icon.png" />
				<span style="color: #D1A30D; font-size: 15px; display: table-cell; vertical-align: middle;">There are less than 20 evaluated links in the positive linkset</span>
			</div>

			<div style="background-color:#FFD1D6; height: 34px; display: table; border-radius: 15px; padding: 3px;">
				<img style="float: left; margin: 0 5px;" src="src/main/resources/images/eu/latc/error-icon.png" />
				<span style="color: #ED2D43; font-size: 15px; display: table-cell; vertical-align: middle;">The linkset could not be parsed.</span>
			</div>
			
			<div>
				<h2>Facts</h2>
				<table style="width: 500px;">
					<tr><td>Number of links</td><td>1359</td></tr>					
					<tr><td>Number of duplicate links</td><td>0</td></tr>
					<tr><td>Revision age</td><td>179 days (Sep 26 2012)</td></tr>
				</table>
				
				<div id="namespace-chart"></div>			
			</div>
			
			
			<div>
				<h2>Evaluation Result</h2>
				<table style="width: 500px;">
					<tr><td>Precision</td><td>70%</td></tr>
					<tr><td>Recall</td><td>50%</td></tr>
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

</body>

</html>
