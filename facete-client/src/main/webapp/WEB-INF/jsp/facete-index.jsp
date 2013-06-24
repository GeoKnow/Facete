<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html class="js" lang="en" dir="ltr" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head xmlns:update="http://ns.aksw.org/update/">
    
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

        <title>${title}</title>
        

        <link rel="stylesheet" href="resources/lib/twitter-bootstrap/2.3.2/css/bootstrap.min.css" />
		<!--[if lt IE 8]>
		<link rel="stylesheet" type="text/css" href="resources/lib/Font-Awesome/current/css/font-awesome-ie7.css" />
		<![endif]-->
		${cssIncludes}
        <link rel="stylesheet" type="text/css" href="resources/lib/select2/3.3.2/select2.css" />
        <link rel="stylesheet" type="text/css" href="resources/lib/jquery-ui/1.10.2/themes/base/jquery-ui.css" />    



        <!-- <script type="text/javascript" src="js/prototypes.js"></script> -->

		<!--[if lt IE 9]>
		<script type="text/javascript" src="resources/lib/html5shiv/67bff28/dist/html5shiv.js"></script>
		<![endif]-->

        <script type="text/javascript" src="resources/lib/JSON-js/json2.js"></script>
        <script type="text/javascript" src="resources/lib/namespacedotjs/a28da387ce/Namespace.js"></script>
        <script type="text/javascript" src="resources/lib/jquery/1.10.1/jquery-1.10.1.js"></script>
        <script type="text/javascript" src="resources/lib/jQuery-ajaxTransport-XDomainRequest/current/jQuery.XDomainRequest.js"></script>
        <script type="text/javascript" src="resources/lib/jquery-ui/1.10.2/ui/jquery-ui.js"></script>
        <script type="text/javascript" src="resources/lib/underscore/1.4.4/underscore.js"></script>
        <script type="text/javascript" src="resources/lib/underscore.string/current/dist/underscore.string.min.js"></script>
        <script type="text/javascript" src="resources/lib/backbone/1.0.0/backbone.js"></script>
        <script type="text/javascript" src="resources/lib/twitter-bootstrap/2.3.2/js/bootstrap.js"></script>
        <script type="text/javascript" src="resources/lib/agility/current/agility.js" charset="utf-8"></script>
        <script type="text/javascript" src="resources/lib/CryptoJS/3.0.2/components/core-min.js"></script>
        <script type="text/javascript" src="resources/lib/CryptoJS/3.0.2/components/enc-utf16-min.js"></script>
        <script type="text/javascript" src="resources/lib/CryptoJS/3.0.2/components/enc-base64-min.js"></script>
        <script type="text/javascript" src="resources/lib/open-layers/2.12/OpenLayers.js"></script>
        <script type="text/javascript" src="resources/lib/json-template/0.85/json-template.js"></script>
        <script type="text/javascript" src="resources/lib/RDFauthor/current/libraries/jquery.rdfquery.rdfa-1.0.js"></script>
        <!-- <script type="text/javascript" src="lib/open-layers/2.10/extensions/OpenStreetMap/OpenStreetMap.js"></script> -->

		<script type="text/javascript" src="resources/lib/doT/current/doT.js"></script>

        <script type="text/javascript" src="resources/lib/select2/3.4.0/select2.js"></script>



	<!-- The actual spatial semantic browsing widgets -->
	${jsIncludes}

	<script type="text/javascript" src="resources/facete-config.js"></script>

    <script type="text/javascript" src="resources/js/main-facets.js"></script>


	<script type="text/javascript">

		$(document).ready(function() {
			
			var layoutUtils = Namespace('org.aksw.utils.layout');
			
			$('.portlet-header').disableSelection();
			
			$('.portlet')
				.addClass('ui-widget') //ui-corner-all ui-widget-content
				.find('.portlet-header')
				//.addClass('ui-widget-header ui-corner-all')
				.addClass('navbar portlet-navbar') // navbar-fixed-top
				.wrapInner(function() {
					//console.log('this', this);
					var str
						= '<div class="navbar-inner" style="min-height:20px; height:20px; position:relative;">'
						+ '<a href="#" class="brand" style="font-size:14px; padding-top: 0px; padding-bottom: 0px;" />'
						+ '<a href="#" class="toggle-minimized" style="position: absolute; top: 4px; right: 10px;">'
						+ '<i class="icon-minus-sign" />'
						+ '</a>'
						//+ this.nodeValue.text()
						+ '</div>';
					
					return str;
				})
				//.prepend('<span class="ui-icon ui-icon-minusthick"></span>')
				.end()
				.find('.portlet-content');
			
			//$('.portlet-header').children();
			
		    $('.portlet').resizable({
		        //handles: {'s': 'ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se'},
		        handles: 's',
		        //grid: [25, 25],
		    	//alsoResize: $(this).find('.portlet-content'),
		    	resize: function(event, ui) {
		    		//$(ui.element).find()
		    		
		    		var $elContent = $(this).find('.portlet-content');
		    		
		    		var height = layoutUtils.getDefaultAutoHeight($elContent, false);
		    		$elContent.css('height', (height - 5) + 'px');
		    	}
		    	/*
		    	stop: function(ev, ui) {
		    		//$(ui.element).removeClass('width');
		    	}*/
		    });

		    //.draggable({
//		        grid: [25, 25]
//		    }).);

			
			$('.toggle-minimized').click(function(ev) {
				ev.preventDefault();
				
				$elI = $(this).find('i:first');
				$elI.toggleClass('icon-minus-sign').toggleClass('icon-plus-sign');
				$(this).parents('.portlet:first').toggleClass('portlet-minimized');
			});

			$('.portlet-group').sortable({
				//connectWith: 'portlet-group',
				handle: '.portlet-header'
				/*
				update: function(event, ui) {
		            var orders = new Array();
		            $('.portlet-group .portlet').each(function(i) {
		                var order = $(this).index();                
		                var id = $(this).attr('data-post-id');
		                orders.push(order);
		            });
		            console.log(orders);
		        }
				*/
			});

			
			//$('.portlet-content').autoHeight();

			//$('.portlet-container').disableSelection();
		});
	
	
	
		var facets = Namespace("org.aksw.ssb.facets");

		$(document).ready(facets.facetTest);
		
		
		
		
	</script>
</head>
<body>
	<div class="container fill">
<!-- 		<div class="row-fluid"> -->
		<!-- <?php include($headerFile); ?> -->
		${headerHtml} 

			<div id="div-settings" class="row-fluid" style="display: none">
				<form>
<!-- 					<label><input type="radio" name="group1" checked="checked"/>Global</label> -->
					<div class="service-config"></div>
					<div class="inline">Service:</div> <div id="sparql-service-selector" class="select2-container inline" style="width: 300px;"></div>
	    			<div class="inline">Datasets:</div> <div id="default-graph-selector" class="select2-container multiple inline" style="width: 600px;"></div>
					<br class="clearBoth" />
					<hr />
<!-- 					<label><input type="radio" name="group1" />Level of Detail</label> -->
<!-- 					<div class="lod-slider inline" style="width: 300px;"></div> -->
<!-- 					<div class="lod-service-condfig"></div> -->
<!-- 					<br class="clearBoth" /> -->
				</form>
			</div>
<!-- 		</div> -->
		
<!-- 		<br class="clearBoth" style="width:0px; height: 0px;" /> -->
		<div class="clearfix"></div>				
		<div class="row-fluid" style="overflow: visible;">
		
			<div class="span3 filler portlet-group ui-sortable" style="background-color:#E9EFF3;">
		
<!-- 				<div class="portlet-group ui-sortable">  row-fluid -->
					<div class="portlet">
						<div class="portlet-header">Facets</div>
						<div class="portlet-content"> <!-- min-height: 300px;  -->
<!-- 							<div style="overflow:auto;">				 -->
								<ul id="facets" class="facet-tree" style="list-style: none; list-style-type:none;"></ul>
<!-- 							</div> -->
						</div>
					</div>
	
					<div class="portlet">
						<div class="portlet-header">Facet Values</div>				
		                <div id="facetValues" class="portlet-content"></div>
					</div>
<!-- 				</div> -->

					<div class="portlet">
						<div class="portlet-header">Filters</div>				
		                <div id="constraints" class="portlet-content"></div>
					</div>

			</div>
			
			<div class="span9" style="margin-left: 5px; margin-top: 3px;">
				<div class="row-fluid portlet-group ui-sortable">
			
					<div class="portlet span7">
						<div class="portlet-header">Table View</div>
		                	<div id="instances" class="portlet-content"></div>
<!-- 						<div class="portlet-content" style="overflow: auto;")> -->
<!-- 		                	<div id="instances"></div> -->
<!-- 						</div> -->
		                
		<!--                 <a style="display:none" id="exportCsv" href="#">Export CSV</a> -->
		<!--                 <a style="display:none" id="exportRdf" href="#">Export RDF</a> -->
					</div>
		
					<div class="portlet span5">
						<div class="portlet-header">Map</div>
						<div id="mapContainer" class="portlet-content">
							<div id="map" style="height: 300px;"></div>
							<a id="centerMapOnPosition" href="#" style="display:none; position:absolute; bottom: 20px; z-index: 1000;">Center on user location</a>
						</div>
					</div>			


					<div class="portlet span7">
						<div class="portlet-header">Resource View</div>
		                	<div id="resourceView" class="portlet-content"></div>
					</div>

				</div>
				
		<!-- 		<div class="portlet-group ui-sortable row-fluid"> -->

			</div>

 		</div>
		
    </div>
</body>
</html>