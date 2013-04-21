(function() {
	
	// TODO Move to generic utils project
	var ns = Namespace("org.aksw.utils.charts");
	
	ns.chartToImage = function(chartSpec, width, height) {

		var s = $('body');
		
		// We temporarily need to add an invisible element
		// FIXME: Maybe highchart also works with a detached element?
		s.prepend('<div style="display:none"></div>');
		var dummy = s.children().eq(0);
		
		dummy.append('<div style="display:none; width: ' + width + 'px; height: ' + height + 'px;"></div>');
		dummy.append('<canvas style="display:none; width: 400px; height: 200px;"></canvas>');			

		var container = dummy.children().eq(0);
		var canvas = dummy.children().eq(1);
		
		//console.log(s, dummy, container, canvas);

		// TODO Copy the spec rather modifying it
		chartSpec.chart.renderTo = container.get(0);
		
		var chart = new Highcharts.Chart(chartSpec);
		
		canvg(canvas.get(0), chart.getSVG());

		chart.destroy();
						
		var imgUrl = canvas.get(0).toDataURL("image/png");
		
		var result = imgUrl;
		
		/*
		container.append('<img src="' + imgUrl + '"></img>');
		
		var result = container.children().eq(0);
		result.detach();
		*/ 	    
		
		dummy.remove();
		
		return result;
	};
	
})();