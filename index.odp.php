<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html class="js" lang="en" dir="ltr" xml:lang="en"
	xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<title>European Commission | Opening up European Commission</title>
	<style media="all" type="text/css">
@import "style.css";
</style>


	<script type="text/javascript" src="lib/gettext/0.08/lib/Gettext.js"></script>





	<?php
	$locale = "en";
	if(isSet($_GET["lang"]))$locale = $_GET["lang"];
	?>

	<link id="active_lang" rel="gettext" type="application/x-po"
		href="src/main/resources/i18n/<?php echo $locale ?>/LC_MESSAGES/messages.po" />



	<script type="text/javascript" src="lib/jquery/1.6.2/jquery-1.6.2.js"></script>

	<script type="text/javascript"
		src="lib/jquery-ui/1.8.16/ui/jquery-ui.js"></script>
	<script type="text/javascript"
		src="lib/jquery-ui/1.8.16/external/jquery.cookie.js"></script>

	<script type="text/javascript"
		src="lib/dynatree/1.2.0_rc1/src/jquery.dynatree.js"></script>

	<link rel='stylesheet' type='text/css'
		href='lib/dynatree/1.2.0_rc1/src/skin/ui.dynatree.css'>
		<link rel="stylesheet" type="text/css"
			href="src/main/javascript/style.css" />

		<script type="text/javascript"
			src="lib/underscore/1.1.7/underscore.js"></script>

		<script type="text/javascript" src="lib/backbone/0.5.3/backbone.js"></script>

		<script type="text/javascript" src="lib/agility/0.1.2/agility.min.js" charset="utf-8"></script>

		<!-- Gritter notifications
    <link rel="stylesheet" type="text/css" href="lib/gritter/e6e8b03/css/jquery.gritter.css" />
    <script type="text/javascript" src="lib/gritter/e6e8b03/js/jquery.gritter.js"></script>
    -->



		<!-- Open Layers 2.11-rc2 -->
		<script type="text/javascript"
			src="lib/open-layers/2.10/OpenLayers.js"></script>
		<!-- <script type="text/javascript" src="lib/webr3-rdf/cbfabc9/rdf.js"></script> -->

		<script type="text/javascript"
			src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js"></script>


		<!-- Configuration files -->
		<script type="text/javascript"
			src="src/main/javascript/ssb.namespacePrefixes.js"></script>


		<!-- The actual spatial semantic browsing widgets -->
		<script type="text/javascript" src="src/main/javascript/QuadTree.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/backend/ssb.backend.quadtree.js"></script>

		<script type="text/javascript" src="src/main/javascript/ssb.utils.js"></script>

		<script type="text/javascript" src="src/main/javascript/Dispatcher.js"></script>
		<script type="text/javascript" src="src/main/javascript/MultiMap.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/BidiMultiMap.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/jsonrdf-extraction-utils.js"></script>


		<script type="text/javascript"
			src="src/main/javascript/facet-controller.js"></script>


		<script type="text/javascript"
			src="src/main/javascript/jquery.ssb.facets.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/jquery.ssb.instances.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/jquery.ssb.map.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/jquery.ssb.search.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/jquery.ssb.facts.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/jquery.ssb.browsebox.js"></script>

		<script type="text/javascript"
			src="src/main/javascript/query-factory/ssb.query-factory.linkedgeodata.js"></script>

		<script type="text/javascript"
			src="src/main/javascript/backend/ssb.sparql-service.virtuoso.js"></script>

		<script type="text/javascript"
			src="src/main/javascript/backend/ssb.backend.delay.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/backend/ssb.backend.virtuoso.js"></script>

		<script type="text/javascript" src="src/main/javascript/jena/sparql-syntax.js"></script>
		<script type="text/javascript" src="src/main/javascript/facets/facets-old.js"></script>
		<script type="text/javascript" src="src/main/javascript/facets/facets.sparql.js"></script>


		<script type="text/javascript"
			src="src/main/javascript/query-factory/ssb.query-factory.wgs84.js"></script>
		<script type="text/javascript"
			src="src/main/javascript/backend/ssb.backend.wgs84.js"></script>

		<script type="text/javascript"
			src="src/main/javascript/QuadTreeModel.js"></script>

		<script type="text/javascript"
			src="src/main/javascript/SpatialSemanticBrowsing.js"></script>

		<script type="text/javascript">
        var ssbconf = {};
<?php
    // begins with http -> absolute, else relative
    $endpoint = isset($_REQUEST['endpoint']) ? $_REQUEST['endpoint'] : '/sparql';
    // empty means use it all
    $graph    = isset($_REQUEST['default-graph-uri']) ? $_REQUEST['default-graph-uri'] : '';
?>
        ssbconf.endpoint = '<?php echo $endpoint ?>';
        ssbconf.models = ['<?php echo $graph ?>'];

        var lang = '<?php echo $locale ?>';

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

		function updateLang() {
        	var gt = new Gettext({ 'domain' : 'messages' });
        	$("#facets-title").html(gt.gettext('ssb.ui.facets'));
		}
        
        /**
         * I18n of the user interface
         *
         */
        window.onload = function init() {
			updateLang();
        	
        	$("#edit-lang-dropdown-select").val(lang);
       	};
        
        /**
         * This is a bit hacky, as we resize the instance list to 100% minus some pixel,
         * but its less hacky than hiding divs on mouse over and such
         * (and we require javascript anyway)
         */
         $(document).ready(function() {
        	 
             $(window).resize(function() {
				var windowHeight = $(window).height();
				var headerHeight = $("#header_div").height();
				var contentHeight = windowHeight - headerHeight;
				
               	$("#main").css('height', contentHeight + "px");
            	$("#instances").css('max-height', (contentHeight - 75) + "px");
            	$("#facets").css('max-height', (contentHeight - 75) + "px");
             });

             $(window).resize();
            
     		$("#edit-lang-dropdown-select").change(function() {
    			var lang = $("#edit-lang-dropdown-select").val();

    			var href = "src/main/resources/i18n/" + lang + "/LC_MESSAGES/messages.po";

    			$("#active_lang").attr('href', href);

    			updateLang();

    			//insertParam("lang", lang);
    		});

	       	 //$( "#tabs" ).tabs({ fx: { height: 'toggle', opacity: 'toggle' } });
     		//$( "#tabs" ).tabs({ fx: { opacity: 'toggle' } });
     		$( "#tabs" ).tabs({});
         });

    </script>

		<!-- <script type="text/javascript" src="src/main/javascript/main.js"></script>  -->
		<script type="text/javascript" src="src/main/javascript/main.js"></script>

</head>
<body>
	<div id="container" style="position: relative;">

		<div id="header_div">
			<div id="header">
				<div id="banner-image-right"></div>
				<div id="banner-flag">
					<a id="logo" rel="home" title="Home" href="#"> <img alt="Home"
						src="images/logo.gif">
					
					</a>
				</div>
				<div id="banner-title">
					<a href="#">European Commission</a>
				</div>
				<div id="banner-subtitle">
					<span>Open Geo-Data Explorer</span>
				</div>
				<div id="services">
					<ul>
						<!--<li class="first"><a href="#">Data: A to Z</a></li>
						<li><a href="#">Data Owners</a></li>
						<li><a href="#">Contact us</a></li>
						<li><a href="#">Accessibility</a></li>
						<li class="last"><a href="#">Legal notice</a></li>
						<li class="first"><a href="#">$TOP_MENU_ITEM</a></li>-->
					</ul>
				</div>
				<div id="languages">
					<select name="lang_dropdown_select" id="edit-lang-dropdown-select">
						<option value="#">Български</option>
						<option value="#">Čeština</option>
						<option value="#">Dansk</option>
						<option value="de">Deutsch</option>
						<option value="#">Ελληνικά</option>
						<option value="en" selected="selected">English</option>
						<option value="#">Eesti</option>
						<option value="#">Español</option>
						<option value="#">Français</option>
						<option value="#">Gaeilge</option>
						<option value="#">Italiano</option>
						<option value="#">Latviešu</option>
						<option value="#">Lietuvių</option>
						<option value="#">Magyar</option>
						<option value="#">Malti</option>
						<option value="#">Nederlands</option>
						<option value="#">Polski</option>
						<option value="#">Português</option>
						<option value="#">Română</option>
						<option value="#">Slovenčina</option>
						<option value="#">Slovenščina</option>
						<option value="#">Suomi</option>
						<option value="#">Svenska</option>
						<!-- <option value="$LANGUAGE_VALUE" selected="selected">$LANGUAGE</option>  -->
					</select>
				</div>
				<!--
				<div id="searchandlogin">
					<span id="login"> <a href="#">Log in</a> or <a href="#">sign up</a>
					</span>
					<form id="search-form" accept-charset="UTF-8" target="_self">
						<div id="search-form-wrapper">
							<input id="search-form-input" type="text"
								title="Enter the terms you wish to search for."
								value="What are you looking for?" name="input" /> <input
								id="search-form-submit" type="submit" value="Search"
								name="submit" />
						</div>
					</form>
				</div>
  				-->

			</div>
			<div id="path">EUROPEAN COMMISSION &gt; OPEN DATA PORTAL &gt; Viewer</div>

			<div id="navigation">
				<ul>

					<li class="first active"><a href="#">Home</a></li>
					<li><a href="#">Data</a></li>
					<li><a href="#">Apps</a></li>
					<li><a href="#">Ideas</a></li>
					<li><a href="#">Forums</a></li>
					<li><a href="#">Linked Data</a></li>
					<li class="last"><a href="#">About</a></li>

					<li class="first active"><a href="#">$MENU_ITEM</a></li>
				</ul>
			</div>
		</div>


		<div id="main" style="position: relative; height: 100%">

			<div
				style="position: relative; top: 0px; left: 0px; height: 100%; width: 100%;">
				<div id="map"
					style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;"></div>

				<div id="test" style="position: absolute; top: 24px; left: 200px;">
					<ul></ul>
				</div>


				<div id="searchDiv" class="mybg"
					style="position: absolute; top: 0; left: 200px; right: 200px; height: 24px; overflow: auto">
					<form style='float: left' action='javascript: doSearch();'>
						<label for="search"><b>Search:</b> </label> <input type="text"
							id="search-field" name="search-field" value="" autocomplete="off"
							onchange="this.form.submit();" />
					</form>
					powered by <a class='link'
						href='http://nominatim.openstreetmap.org' target="_blank"><img
						class='noborder' src='src/main/resources/osm-logo-small.png' />Nominatim</a>
				</div>

				<div id="searchResults" class="mybg"
					style="position: absolute; top: 24px; left: 200px; right: 200px; overflow: auto;"></div>



				<div class="mybg"
					style="position: absolute; top: 0px; left: 0px; height: 24px; width: 200px;">Instances</div>

				<div id="instances" class="mybg"
					style="position: absolute; top: 24px; left: 0px; width: 200px; overflow: auto;"></div>

				<div id="facets-title" class="mybg"
					style="position: absolute; top: 0px; right: 0px; height: 24px; width: 200px;">Facets</div>

				<div id="facets" class="mybg"
					style="position: absolute; top: 24px; right: 0px; width: 200px; overflow: auto;"></div>


				<div id="tabs" class="widget"
					style="position: absolute; top: 24px; left: 50px; width: 250px;">
					<ul class="tabnav">
						<li><a href="#tabs-2">Instances</a></li>
						<li><a href="#facets2">Facets</a></li>
						<li><a href="#tabs-3">Types</a></li>
					</ul>
					<div class="tabdiv" id="facets2"></div>
					<div class="tabdiv" id="tabs-2">
						<p>Morbi tincidunt, dui sit amet facilisis feugiat, odio metus gravida ante, ut pharetra massa metus id nunc. Duis scelerisque molestie turpis. Sed fringilla, massa eget luctus malesuada, metus eros molestie lectus, ut tempus eros massa ut dolor. Aenean aliquet fringilla sem. Suspendisse sed ligula in ligula suscipit aliquam. Praesent in eros vestibulum mi adipiscing adipiscing. Morbi facilisis. Curabitur ornare consequat nunc. Aenean vel metus. Ut posuere viverra nulla. Aliquam erat volutpat. Pellentesque convallis. Maecenas feugiat, tellus pellentesque pretium posuere, felis lorem euismod felis, eu ornare leo nisi vel felis. Mauris consectetur tortor et purus.</p>
					</div>
					<div class="tabdiv" id="tabs-3">
						<p>Mauris eleifend est et turpis. Duis id erat. Suspendisse potenti. Aliquam vulputate, pede vel vehicula accumsan, mi neque rutrum erat, eu congue orci lorem eget lorem. Vestibulum non ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce sodales. Quisque eu urna vel enim commodo pellentesque. Praesent eu risus hendrerit ligula tempus pretium. Curabitur lorem enim, pretium nec, feugiat nec, luctus a, lacus.</p>
						<p>Duis cursus. Maecenas ligula eros, blandit nec, pharetra at, semper at, magna. Nullam ac lacus. Nulla facilisi. Praesent viverra justo vitae neque. Praesent blandit adipiscing velit. Suspendisse potenti. Donec mattis, pede vel pharetra blandit, magna ligula faucibus eros, id euismod lacus dolor eget odio. Nam scelerisque. Donec non libero sed nulla mattis commodo. Ut sagittis. Donec nisi lectus, feugiat porttitor, tempor ac, tempor vitae, pede. Aenean vehicula velit eu tellus interdum rutrum. Maecenas commodo. Pellentesque nec elit. Fusce in lacus. Vivamus a libero vitae lectus hendrerit hendrerit.</p>
					</div>
				</div>



				<div id="facts" class="mybg"
					style="position: absolute; left: 250px; bottom: 0px; right: 250px; max-height: 70%; overflow: auto; border: 1px solid #000000; border-radius: 7px 7px 0px 0px;"></div>

				<div id="browsebox" class="mybg"
					style="position: absolute; top: 50px; left: 300px; width: 600px; hight: 600px; overflow: auto;"></div>
			</div>

		</div>
		<!-- <div id="footer">$FOOTER</div>  -->
	</div>

</body>
</html>
