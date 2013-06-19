<?php

	$basePath = "resources/";

    include_once("index-utils.php");


	// Read ini settings 
	$ini = parse_properties_file("$basePath/facete-index.properties");

    // If debug is false: include minimized JavaScript, otherwise include original source
    
    $debug = $ini["facete.debug"];
    $activeThemePath = $basePath . $ini["facete.themePath"];
	$templateFile = "WEB-INF/jsp/" . $ini["facete.templateFile"];

	/*
    $themeIni = parse_properties_file("$activeThemePath/theme.properties");
    $title = $themeIni["title"];
    $faceteVersion = $themeIni["version"];
    */


    $themeXml = simplexml_load_file("$activeThemePath/theme.xml");
    $title = (string)$themeXml->title;
    $faceteVersion = $themeXml->version;

    if(!$faceteVersion) {
        $faceteVersion = "(not set)";
    }


    $headerFile = "$activeThemePath/header.html";


    if($debug) {
        $cssFileNames = getCssSourceFiles();
        $jsFileNames = getJsSourceFiles();
    } else {
        $cssFileNames = getCssMinFiles();
        $jsFileNames = getJsMinFiles();
    }

    $cssIncludes = toStringCssTags($cssFileNames);
    $jsIncludes = toStringJsTags($jsFileNames);


	// Load facete-index.jsp and regex replace the placeholders
	$content = file_get_contents($templateFile);

	// TODO Make this more generic: Locate all ${}s in the content and then load the values
	// from e.g. an ini section
	$content = preg_replace("/\\$\{title\}/s", $title, $content);
	$content = preg_replace("/\\$\{cssIncludes\}/s", $cssIncludes, $content);
	$content = preg_replace("/\\$\{jsIncludes\}/s", $jsIncludes, $content);
	
	
	$headerHtml = file_get_contents($headerFile);
	$content = preg_replace("/\\$\{headerHtml\}/s", $headerHtml, $content);
	
	
	echo $content;
