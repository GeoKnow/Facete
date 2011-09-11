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
	$base = "http://nominatim.openstreetmap.org/search?format=json&q=";
	$url = $base . urlencode($search);

	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($c, CURLOPT_URL, $url);

	$contents = curl_exec($c);
	curl_close($c);

	return $contents;
}

$value = urldecode($_REQUEST['query']);
$queryResult = processNameFinderQuery($value, 0);

// http://snippets.dzone.com/posts/show/5882
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
echo $queryResult;

?>
