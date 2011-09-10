<?php


function stripNameFinderName($name)
{
	// strip those [greek] [latin] ...etc
	$name = preg_replace("/\[[^\]]*\]/", "", $name);
	$name = preg_replace("/\s+/", " ", $name);
	$name = trim($name);
	
	return $name;
}

function processNameFinderQuery($search, $global)
{
	$base = "http://nominatim.openstreetmap.org/search?format=xml&q=";
	$url = $base . urlencode($search);
	$url .= "&format=json";

	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($c, CURLOPT_URL, $url);

	$contents = curl_exec($c);
	curl_close($c);

	return $contents;
}

$value = urldecode($_REQUEST['search']);
$queryResult = processNameFinderQuery($value, 0);


echo $queryResult;

?>
