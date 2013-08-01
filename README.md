# Welcome to Facete - Slice 'n' Dice RDF data explorer!


This project will be released soon - stay tuned!


Facete offers out-of-the-box faceted search over SPARQL endpoints.
Current features:
* Slicing and Dicing: Filter RDF data by any property / dimension
* Hierarchical facets: Constrain the facets of another facet's values using a simple tree structure. Pivoting made easy!
* Freely link facets to table columns (using the arrow-right icon)
* Freely link facets to a map view (using the glob icon)

Limitations:
* At the moment facete always queries for the exact facet / facet value counts. Therefore, Facete may not work with low selective facet selections on large datasets.

![Screenshot](facete-dissemination/src/main/resources/images/2013-04-21-Facete-Screenshot.png)


## Architecture
This project is comprised of the following modules
* facete-client: This is a pure JavaScript code base (+ index.php) offering faceted search on SPARQL endpoints.
* facete-server: This is a server module providing additional services to the client - although the client can be run without them. At the moment these services are CSV and RDF export for the facet selection.

## Configuration
Note: This section explains how the configuration should work for the release.


### facete-client
Check out the repository, and follow these steps

    git checkout devel

    # Create local copies of any .dist file in the repo, and adjust the content appropriately
    # (This has to be done manually right now, read section below)

    # Make the client known to your webserver, e.g:
    # NOTE Adjust the following line as needed
    ln -s <project-root>/facete-client/src/main/webapp /var/www/facete

Open a browser and check whether you can see the Facete application under [http://localhost/facete].


You also need to have PHP and curl for PHP installed:

    sudo apt-get install php5 php5-curl

Although the client is functional without any configuration (you can e.g. set which SPARQL endpoint to explore in the user interface - NOTE: this is currently bugged!), you most likely want to adjust some default values:

    cd <project-root>/facete-client/src/main/webapp/resources
    cp facete-config.js.dist facete-config.js
    cp facete-index.properties.dist facete-index.properties

Now adjust the settings in `facete-config.js` as needed according to the comments in that file, for example:


    config.sparqlServiceIri = "http://localhost:8810/sparql";
    config.sparqlDefaultGraphIris = ['http://fp7-pp.publicdata.eu/'];
    config.sparqlProxyServiceIri = "lib/SparqlProxyPHP/current/sparql-proxy.php";


### facete-server
TO BE DONE
Currently some settings can be adjusted via the the index.php.



## Licence
The source code of this repo is published under the [Apache License Version 2.0](LICENSE)

