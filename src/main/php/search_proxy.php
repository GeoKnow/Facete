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

	$result = "Your search was: '$search'<br />";
	
	$result .= "<ol>";	
	
	// Alternating background colors
	$colorClasses = array("color0", "color1");
	
	
	$xml = simplexml_load_file($url);
	
	$ranking = array();
	$id = 0;	
	foreach($xml->xpath('//place') as $named) {		
		$attrs = $named->attributes();

		$tmp = explode(",", $attrs->display_name, 2);		


		$name = trim($tmp[0]);
		$lat  = $attrs->lat;
		$lon  = $attrs->lon;
		$is_in = trim($tmp[1]);
		//$zoom = $attrs->zoom;

		$zoom = 10;
		
		$name = stripNameFinderName($name);
		$is_in = stripNameFinderName($is_in);
		
		++$id;
		$colorClass = $colorClasses[$id % 2];
		
		$result .=
				"
					<li id='sr$id' class='$colorClass'
						onmouseout=\"
							$(this).removeClass('highlight');
						\"
						onclick=\"
							center=new OpenLayers.LonLat($lon, $lat).transform(map.displayProjection,map.projection);
							map.setCenter(center, $zoom);
							mapEvent(1);
						\"
						onmouseover=\"
							$(this).addClass('highlight');
						\"
					><b>$name</b><br /><div style='margin-left:20px;'>$is_in</div></li>
				";
			
				/*
				$fragment = 
					"<script type = 'text/javascript'>
						mk[$id] =
							addMarker(
								new OpenLayers.LonLat($latD, $lonD)
									.transform(map.displayProjection, map.projection),
								$nodeId,
								{{$ta}}
							);
					</script>";
		
				$result .= $fragment;
				*/
					
			
	}
	
	
	$result .= "</ol>";	
	//print_r($xml);
	
	/*
	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($c, CURLOPT_URL, $url);
	
	$contents = curl_exec($c);
	curl_close($c);

	return $contents;
	*/
	return $result;
}

$value = urldecode($_REQUEST['find']);
$queryResult = processNameFinderQuery($value, 0);


echo $queryResult;

?>
