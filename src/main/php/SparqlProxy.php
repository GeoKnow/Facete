<?php

include('SPARQLEndpoint.php');

$query = $_REQUEST['query'];
$defaultGraphURI = $_REQUEST['default-graph-uri'];

//dbpedia_sparql_proxy.php?default-graph-uri=http%3A%2F%2Fdbpedia.org&output=json&query=Select%20*%20%7B%3Fs%20%3Fp%20%3Fo%7D%20Limit%2010

$query = urldecode($query);

$dbpediaSparql = new SPARQLEndpoint("http://linkedgeodata.org/sparql", $defaultGraphURI);
$queryResult = $dbpediaSparql->executeQuery($query);
//$queryResult = $dbpediaSparql->executeQuery("Select * {?s ?p ?o} Limit 10");
echo $queryResult;

?>
