#SparqlProxyPHP

A PHP forward proxy for remote access to SPARQL endpoints; forwards request/response headers and filters out non-SPARQL URL arguments.

## Introduction
The proxy introduces an additional "service-uri" query string parameter which supports specifying a remote endpoint. The main motivation is to enable remote access to SPARQL endpoints from within JavaScript.
Note that this proxy consists of a single file that only does the forwarding of requests and response (headers).
If you are looking for a proxy that features more than that, you may want to check out [this project](http://logd.tw.rpi.edu/ws/sparqlproxy.php).

## Warning
Right now it is still possible to access arbitrary sites with it. There has to be added some checks whether the target is actually a SPARQL endpoint (otherwise illegal content could be obtained via the proxy). The probably simplest filtering would be the requirement, that the service-uri has to end in `/sparql`.


## Filtering
The service-uri parameter is processed as follows:
 * Only host name, port and path are retained, all other URI components are discarded.

From the request url, the following processing is performed:
 * Only the query string arguments `query`, `format`, `timeout` are retained. **TODO Support at least all arguments by SPARQL spec **

## Deployment (Ubuntu):
You need apache, php and php-curl installed:

    sudo apt-get install libapache2-mod-php5 php5-curl

Make the script accessible via apache, e.g.

    cp sparql-proxy.php /var/www

## Example Usage:
The following example requests the first 3 results from [LinkedGeoData](http://linkedgeodata.org).

    curl http://localhost/sparql-proxy.php?service-uri=http%3A%2F%2Flinkedgeodata.org%2Fsparql&query=Select+%2A+%7B+%3Fs+%3Fp+%3Fo+%7D+Limit+3


