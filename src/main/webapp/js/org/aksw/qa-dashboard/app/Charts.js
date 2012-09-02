(function() {
	
	var mathUtils = Namespace("org.aksw.utils.math");
	
	var ns = Namespace("org.aksw.qa-dashboard.charts");
	
	var charts = ns;

	
	ns.createHistogramData = function() {
		var data = [10, 20, 100, 50, 13, 29, 17, 8, 5, 2];
		
		var result = {
			min: 0,
			max: null,
			data: data,
			labels: charts.createBucketLabels(data.length, 0, 1, function(low, high) {
				var d = 0;
				return mathUtils.roundNumber(low * 100, d) + ' - ' + mathUtils.roundNumber(high * 100, d) + '%';
			})
		};
		
		return result;
	};
	
	
	ns.createBucketLabels = function(n, min, max, callback) {
		var range = max - min;
		var chunk = range / n;
		
		var result = [];
		for(i = 0; i < n; ++i) {
			var low = min + chunk * i;
			var high = min + chunk * (i + 1);
		
			var label = callback ? callback(low, high) : low + ' - ' + high;
		
			result.push(label);
		}
		
		return result;
	};
	
	ns.createHistogramChartSpec = function(data) {
		var result = {
            chart: {
                renderTo: null,
                type: 'column' //'bar'
            },
            title: {
                text: "Dataset Overview" // 'DBpedia LinkedGeoData Cities'
            },
            subtitle: {
                text: "" //"latest datasets"//'metric: ' + data.metricName //Konrad Höffner'
            },
            xAxis: {
				categories: data.labels,
				labels: {
					align: 'right',
					rotation: -45,
				}
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            tooltip: {
                formatter: function() {
                    return this.y +' datasets'; // this.series.name
                }
            },
            plotOptions: {
				column: {
		            groupPadding: 0,
		            pointPadding: 0,
		            borderWidth: 0
				}     
			},
            credits: {
                enabled: false
            },
            exporting: {
            	enabled: false
            },
            series: [{
            	name: 'precision',
            	showInLegend: true,
                data: data.data,
                color: '#4572A7'
            }, {
            	name: 'recall',
            	showInLegend: true,
                data: data.data,
                color: '#89A54E'
            }]
        };
        
        return result;
    };


	ns.createLinksetChartSpec = function(data) {
		var result = {
            chart: {
                renderTo: null,
                type: 'column', //'bar'
				borderWidth: 1
            },
            title: {
                text: data.name // 'DBpedia LinkedGeoData Cities'
            },
            subtitle: {
                text: 'by: ' + data.author //Konrad Höffner'
            },
            xAxis: {
               	categories: ['est. precision', 'est. recall'],
                title: {
                    text: null
                }

            },
            yAxis: {
                min: 0,
                max: 1,
                title: {
                	//enabled: false,
                    text: '',
                    align: 'high'
                }

            },
            tooltip: {
                formatter: function() {
                    return ''+
                        this.series.name +': '+ this.y +' millions';
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            /*
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -100,
                y: 100,
                floating: true,
                borderWidth: 1,
                backgroundColor: '#FFFFFF',
                shadow: true
            },*/
            credits: {
                enabled: false
            },
            exporting: {
            	enabled: false
            },
            series: [{
            	showInLegend: false,
                data: [data.precision],
                color: '#89A54E'
            }, {
            	showInLegend: false,
                data: [data.recall],
                color: '#AA4643'
            }]
        };
        
        return result;
	};

	ns.createNamespaceChartSpec = function(sourceToTargetToCount) {
		
		sourceToTargetToCount = {
			'dbp': {
				'lgd': 1350,
				'dbpedia': 5,
				'geonames': 2
			},
			'geonames': {
				'lgd': 2
			}
		};
		
		/*
		var colorIndex = 0;
		var colorMap = {};
		var sourceToCount = {};			
		_.each(sourceToTargetToCount, function(s, targetToCount) {
			
			if(!(s in colorMap)) {
				colorMap[s] = colorIndex++;
			}
			
			var total = 0;
			_.each(targetToCount, function(t, count) {
			
				if(!(t in colorMap)) {
					colorMap[t] = colorIndex++;
				}
			
			
				total += count;
			});
			
			sourceToCount[s] = total;
		});
		*/
		
		var colors = Highcharts.getOptions().colors;
		

		var data = [];
		$.each(sourceToTargetToCount, function(s, targetToCount) {
		
			var color = colors[data.length];
			
			var total = 0;
			var d = [];
			var categories = [];
			$.each(targetToCount, function(t, count) {
				total += count;
				
				categories.push(t);
				d.push(count);
			});

			var item = {
                y: total,
                color: color,
                drilldown: {
                    name: '',
                    categories: categories,
                    data: d,
                    color: color
                }
            };

			data.push(item);				
		});
		
		
        var categories = _.keys(sourceToTargetToCount);
        var name = 'Namespaces';
					            
        /*
        data = [
        	{
                y: 55.11,
                color: colors[0],
                drilldown: {
                    name: 'MSIE versions',
                    categories: ['MSIE 6.0', 'MSIE 7.0', 'MSIE 8.0', 'MSIE 9.0'],
                    data: [10.85, 7.35, 33.06, 2.81],
                    color: colors[0]
                }
            }, {
                y: 21.63,
                color: colors[1],
                drilldown: {
                    name: 'Firefox versions',
                    categories: ['Firefox 2.0', 'Firefox 3.0', 'Firefox 3.5', 'Firefox 3.6', 'Firefox 4.0'],
                    data: [0.20, 0.83, 1.58, 13.12, 5.43],
                    color: colors[1]
                }
            }, {
                y: 11.94,
                color: colors[2],
                drilldown: {
                    name: 'Chrome versions',
                    categories: ['Chrome 5.0', 'Chrome 6.0', 'Chrome 7.0', 'Chrome 8.0', 'Chrome 9.0',
                        'Chrome 10.0', 'Chrome 11.0', 'Chrome 12.0'],
                    data: [0.12, 0.19, 0.12, 0.36, 0.32, 9.91, 0.50, 0.22],
                    color: colors[2]
                }
            }, {
                y: 7.15,
                color: colors[3],
                drilldown: {
                    name: 'Safari versions',
                    categories: ['Safari 5.0', 'Safari 4.0', 'Safari Win 5.0', 'Safari 4.1', 'Safari/Maxthon',
                        'Safari 3.1', 'Safari 4.1'],
                    data: [4.55, 1.42, 0.23, 0.21, 0.20, 0.19, 0.14],
                    color: colors[3]
                }
            }, {
                y: 2.14,
                color: colors[4],
                drilldown: {
                    name: 'Opera versions',
                    categories: ['Opera 9.x', 'Opera 10.x', 'Opera 11.x'],
                    data: [ 0.12, 0.37, 1.65],
                    color: colors[4]
                }
            }
		];
		*/

        // Build the data arrays
        var browserData = [];
        var versionsData = [];
        for (var i = 0; i < data.length; i++) {
    
            // add browser data
            browserData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });
    
            // add version data
            for (var j = 0; j < data[i].drilldown.data.length; j++) {
                var brightness = 0.2 - (j / data[i].drilldown.data.length) / 5 ;
                versionsData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }

        // Create the chart
        var result = {
            chart: {
                renderTo: null,
                type: 'pie'
            },
            title: {
                text: 'Namespace histogram for "owl:sameAs"'
            },
            yAxis: {
                title: {
                    text: 'Total percent market share'
                }
            },
            plotOptions: {
                pie: {
                    shadow: false
                }
            },
            tooltip: {
        	    valueSuffix: '%'
            },
			credits: {
                enabled: false
            },
            exporting: {
            	enabled: false
            },
            series: [{
                name: 'Browsers',
                data: browserData,
                size: '60%',
                dataLabels: {
                    formatter: function() {
                        return this.y > 5 ? this.point.name : null;
                    },
                    color: 'white',
                    distance: -30
                }
            }, {
                name: 'Versions',
                data: versionsData,
                innerSize: '60%',
                dataLabels: {
                    formatter: function() {
                        // display only if larger than 1
                        return this.y > 1 ? '<b>'+ this.point.name +':</b> '+ this.y +' Links'  : null;
                    }
                }
            }]
        };
        
        return result;
	};

	
	
})();