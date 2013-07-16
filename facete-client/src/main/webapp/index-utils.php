<?php

// TODO Turn this into a proper object 

$minDir = "../../../facete-client/target/facete-client/webapp/";

function getJsMinFiles() {
    $result = array("{$minDir}js/semmap.min.js");
    return $result;
}

function getCssMinFiles() {
    $result = array("{$minDir}css/semmap.min.css");
    return $result;
}

function getStringFromXml($xml, $xpath) {
    $tmp = $xml->xpath($xpath);
    $result = $tmp[0];
    return $result;
}

function getWebappDir($pomXml) {
    //return "src/main/webapp";
    //return ".";
    return "resources/";
}

function getJsSourceDir($pomXml) {
    $result = getStringFromXml($pomXml, "//*[local-name()='jsSourceDir']");
    return $result;
}

function getCssSourceDir($pomXml) {
    $result = getStringFromXml($pomXml, "//*[local-name()='cssSourceDir']");
    return $result;
}


function getJsSourceFiles() {
	$facetePomFile = "resources/facete-pom.xml";
    $pomXml = simplexml_load_file($facetePomFile);

    $fileNames = $pomXml->xpath("//*[local-name()='jsSourceFiles']/*[local-name()='param']");

    $webappDir = getWebappDir($pomXml);
    $jsSourceDir = getJsSourceDir($pomXml);
    $prefix = $webappDir . "/" . $jsSourceDir . "/";
    $result = addPrefix($prefix, $fileNames);

    return $result;
}

function getCssSourceFiles() {
	$facetePomFile = "resources/facete-pom.xml";
    $pomXml = simplexml_load_file($facetePomFile);

    $fileNames = $pomXml->xpath("//*[local-name()='cssSourceFiles']/*[local-name()='param']");

    $webappDir = getWebappDir($pomXml);
    $cssSourceDir = getCssSourceDir($pomXml);
    $prefix = $webappDir . "/" . $cssSourceDir . "/";
    $result = addPrefix($prefix, $fileNames);

    return $result;
}

function addPrefix($prefix, $strs) {
    $result = array();
    foreach($strs as $str) {
        $result[] = $prefix . $str;
    }
    return $result;
}



function toStringJsTags($fileNames) {
    $result = "";
    foreach($fileNames as $fileName) {
        $result .= toStringJsTag($fileName) . "\n";
    }
    return $result;
}

function toStringJsTag($fileName) {
    $result = '<script type="text/javascript" src="' . $fileName . '"></script>';
    return $result;
}


function toStringCssTags($fileNames) {
    $result = "";
    foreach($fileNames as $fileName) {
        $result .= toStringCssTag($fileName) . "\n";
    }
    return $result;
}

function toStringCssTag($fileName) {
   $result = '<link rel="stylesheet" type="text/css" href="' . $fileName. '" />';
   return $result;
}


function parse_properties_file($fileName) {
    $str = file_get_contents($fileName);
    $result = parse_properties($str);
    return $result;
}

#Source: http://blog.rafaelsanches.com/2009/08/05/reading-java-style-properties-file-in-php/
function parse_properties($txtProperties) {
 $result = array();

 $lines = explode("\n", $txtProperties);
 $key = "";

 $isWaitingOtherLine = false;
 foreach($lines as $i=>$line) {

 if(empty($line) || (!$isWaitingOtherLine && strpos($line,"#") === 0)) continue;

 if(!$isWaitingOtherLine) {
 $key = substr($line,0,strpos($line,'='));
 $value = substr($line,strpos($line,'=') + 1, strlen($line));
 }
 else {
 $value .= $line;
 }

 /* Check if ends with single '\' */
 if(strrpos($value,"\\") === strlen($value)-strlen("\\")) {
 $value = substr($value, 0, strlen($value)-1)."\n";
 $isWaitingOtherLine = true;
 }
 else {
 $isWaitingOtherLine = false;
 }

 $result[$key] = $value;
 unset($lines[$i]);
 }

 return $result;
}

