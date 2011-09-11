# Spatial Semantic Browsing Widgets
This GIT repository contains widgets for browsing spatial RDF data in SPARQL endpoints.
The widgets are implemented as jQuery plugins.

Currently the widgets have been deployed in the [LinkedGeoData](http://linkedgeodata.org/)-project, specifically in the [browser](http://browser.linkedgeodata.org). 
 
The widgets located in src/main/javascript are:

-  jquery.ssb.map.js      : Renders a map, based on [OpenLayers](http://openlayers.org/).
-  jquery.ssb.facets.js   : Displays a hierarchy of classes/properties, based on [DynaTree](http://code.google.com/p/dynatree/).
-  jquery.ssb.instances.js: Displays a list of instances.

The constructors take references to "model" objects, which may be shared among them.
For instance, the map which associates uris with icons can be shared by all three.

Additionally, the logic for initialization, event handling, and fetching data from SPARQL endpoints is currently located in the src/main/javascript/main.js file (which definitely needs some refactoring).
 