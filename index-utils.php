<?php

function getStringFromXml($xml, $xpath) {
    $tmp = $xml->xpath($xpath);
    $result = $tmp[0];
    return $result;
}

function getWebappDir($pomXml) {
    return "src/main/webapp";
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
    $pomXml = simplexml_load_file("pom.xml");

    $fileNames = $pomXml->xpath("//*[local-name()='jsSourceFiles']/*[local-name()='param']");

    $webappDir = getWebappDir($pomXml);
    $jsSourceDir = getJsSourceDir($pomXml);
    $prefix = $webappDir . "/" . $jsSourceDir . "/";
    $result = addPrefix($prefix, $fileNames);

    return $result;
}

function getCssSourceFiles() {
    $pomXml = simplexml_load_file("pom.xml");

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


