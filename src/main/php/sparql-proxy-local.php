<?php

//$serviceUrl = $_REQUEST['service'];
$serviceUrl = 'http://localhost:8890/sparql';



// The rest is from: http://fuzzytolerance.info/a-quick-and-dirty-reverse-proxy-with-php/

error_reporting(E_ERROR);
$args = $_SERVER['QUERY_STRING'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$serviceUrl?$args");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);

$content = curl_exec($ch);
//$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);

//header('Content-type: '.curl_getinfo($ch, CURLINFO_CONTENT_TYPE));

/*
list($headers,$content) = explode("\r\n\r\n",$result,2);
foreach (explode("\r\n",$headers) as $hdr)
    header($hdr);
echo $content;
*/

curl_close($ch);

echo "test";

?>
