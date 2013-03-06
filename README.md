# SemMap Spatial RDF Browser

# Notes on the devel branch: We are currently working hard on SemMap; for our devs:
    git checkout devel
    make deploy-sparql-proxy
    update the URL to the SPARQL endpoint
    (for now just use http://fp7-pp.publicdata.eu/sparql in src/main/webapp/js/main-facets.js)


# Configuration
## Client
Copy config.js.dist to config.js. Then adjust the settings in config.js as needed according to the comments.

## Server
Currently some settings can be adjusted via the the index.php.
