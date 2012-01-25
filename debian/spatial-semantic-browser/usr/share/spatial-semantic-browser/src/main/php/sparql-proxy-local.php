<?php

include('SPARQLEndpoint.php');

$rawQuery = $_REQUEST['query'];
$format = $_REQUEST['format'];

$query = urldecode($rawQuery);
$defaultGraphUri = $_REQUEST['default-graph-uri'];

//$serviceUrl = $_REQUEST['service'];
$serviceUrl = 'http://localhost:8890/sparql';



$service = new SPARQLEndpoint($serviceUrl, $defaultGraphUri, $format);
$result = $service->executeQuery($query);
echo $result;

?>
