<!DOCTYPE html>
<!--
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

-->
<html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <title>Spatial Semantic Browser</title>


    <script type="text/javascript" src="lib/jquery/1.6.2/jquery-1.6.2.js"></script>

    <script type="text/javascript" src="lib/jquery-ui/1.8.16/ui/jquery-ui.js"></script>
    <script type="text/javascript" src="lib/jquery-ui/1.8.16/external/jquery.cookie.js"></script>

    <script type="text/javascript" src="lib/dynatree/1.2.0_rc1/src/jquery.dynatree.js"></script>

    <link rel='stylesheet' type='text/css' href='lib/dynatree/1.2.0_rc1/src/skin/ui.dynatree.css'>
    <link rel="stylesheet" type="text/css" href="src/main/javascript/style.css" />

    <script type="text/javascript" src="lib/underscore/1.1.7/underscore.js"></script>
    <!-- <script type="text/javascript" src="lib/backbone/0.5.3/backbone.js"></script> -->

    <!-- Gritter notifications
    <link rel="stylesheet" type="text/css" href="lib/gritter/e6e8b03/css/jquery.gritter.css" />
    <script type="text/javascript" src="lib/gritter/e6e8b03/js/jquery.gritter.js"></script>
    -->



    <!-- Open Layers 2.11-rc2 -->
    <script type="text/javascript" src="lib/open-layers/2.10/OpenLayers.js"></script> -->

    <!-- <script type="text/javascript" src="lib/webr3-rdf/cbfabc9/rdf.js"></script> -->

    <script type="text/javascript" src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js"></script>


    <!-- Configuration files -->
    <script type="text/javascript" src="src/main/javascript/ssb.namespacePrefixes.js"></script>


    <!-- The actual spatial semantic browsing widgets -->
    <script type="text/javascript" src="src/main/javascript/QuadTree.js"></script>
    <script type="text/javascript" src="src/main/javascript/backend/ssb.backend.quadtree.js"></script>

    <script type="text/javascript" src="src/main/javascript/ssb.utils.js"></script>

    <script type="text/javascript" src="src/main/javascript/Dispatcher.js"></script>
    <script type="text/javascript" src="src/main/javascript/MultiMap.js"></script>
    <script type="text/javascript" src="src/main/javascript/BidiMultiMap.js"></script>
    <script type="text/javascript" src="src/main/javascript/jsonrdf-extraction-utils.js"></script>

    <script type="text/javascript" src="src/main/javascript/facet-controller.js"></script>


    <script type="text/javascript" src="src/main/javascript/jquery.ssb.facets.js"></script>
    <script type="text/javascript" src="src/main/javascript/jquery.ssb.instances.js"></script>
    <script type="text/javascript" src="src/main/javascript/jquery.ssb.map.js"></script>
    <script type="text/javascript" src="src/main/javascript/jquery.ssb.search.js"></script>
    <script type="text/javascript" src="src/main/javascript/jquery.ssb.facts.js"></script>

    <script type="text/javascript" src="src/main/javascript/query-factory/ssb.query-factory.linkedgeodata.js"></script>

    <script type="text/javascript" src="src/main/javascript/backend/ssb.sparql-service.virtuoso.js"></script>

    <script type="text/javascript" src="src/main/javascript/backend/ssb.backend.delay.js"></script>
    <script type="text/javascript" src="src/main/javascript/backend/ssb.backend.virtuoso.js"></script>

    <script type="text/javascript" src="src/main/javascript/query-factory/ssb.query-factory.wgs84.js"></script>
    <script type="text/javascript" src="src/main/javascript/backend/ssb.backend.wgs84.js"></script>

    <script type="text/javascript" src="src/main/javascript/QuadTreeModel.js"></script>

    <script type="text/javascript" src="src/main/javascript/SpatialSemanticBrowsing.js"></script>

    <script type="text/javascript">
        var ssbconf = {};
        ssbconf.endpoint = '/sparql'; // begins with http -> absolute, else relative
        //ssbconf.models = ['http://climbing.org'];
	ssbconf.models = [];
    </script>

    <!-- <script type="text/javascript" src="src/main/javascript/main.js"></script>  -->
    <script type="text/javascript" src="src/main/javascript/main.js"></script>


  </head>

  <body>

 	<a href="http://aksw.org" target="_blank"><img src="src/main/resources/AKSW_Logo_rgb.svg" style="position:absolute; bottom:20px; right:0px; z-index:-1; width:150px;"></img></a>


    <div id="searchDiv" class="mybg" style="position:absolute; top:0; left:200px; z-index:1; right:200px; height:24px; overflow:auto">
  		<form style='float:left' action='javascript: doSearch();'>
  			<label for="search"><b>Search:</b></label>
			<input type="text" id="search-field" name="search-field" value="" autocomplete="off" onchange="this.form.submit();" />
		</form>
		powered by <a class='link' href='http://nominatim.openstreetmap.org' target="_blank"><img class='noborder' src='src/main/resources/osm-logo-small.png' />Nominatim</a>
    </div>
    <div id="searchResults" class="mybg" style="position:absolute; top:24px; left:200px; right:200px; z-index:2; overflow:auto;"></div>

    <div id="map" style="position:absolute; top:0px; left:0px; z-index:-9999; width:100%; height:100%;"></div>


	<div class="mybg" style="position:absolute; top:0px; left:0px; height:24px; width:200px;">Instances</div>
	<div id="instances" class="mybg" style="position:absolute; top:24px; left:0px;  width:200px; max-height:90%; overflow:auto;"></div>


	<div class="mybg" style="position:absolute; top:0px; right:0px; height:24px; width:200px;">Facets</div>
    <div id="facets"    class="mybg" style="position:absolute; top:24px; right:0px; width:200px; max-height:90%; overflow:auto;"></div>

    <div id="facts"     class="mybg" style="position:absolute; left: 250px; bottom:0px; right:250px; max-height:70%; z-index:1; overflow:auto; border: 1px solid #000000; border-radius: 7px 7px 0px 0px;"></div>

    </body>
</html>
