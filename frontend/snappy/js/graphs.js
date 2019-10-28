function init_graphs(){
	function requestJSON(url){
		return new Promise(function(resolve, reject){
			jQuery.ajax({
				url: url 
			}).then(
				function(data){
					var r = jQuery.parseJSON(data);
			
					resolve(r);
				},
				function(jqXHR, textStatus, errorThrown){
					reject(errorThrown);
				}
			);
		})
	}
	
	return {
		"getGraphData": function(geeklistid){
			var url = "./data/getGeeklistGraphData?geeklistid=" + parseInt(geeklistid);
			
			return requestJSON(url)	
		},
		
		"renderGraph": function(divId, nm, data){
			var d = data.map(e => ({"name": e.name, "y": e.value }));
			console.log(d);	
			Highcharts.chart(divId, {
			    chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				type: 'pie'
			    },
			    title: {
				text: nm
			    },
			    tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			    },
			    plotOptions: {
				pie: {
				    allowPointSelect: true,
				    cursor: 'pointer',
				    dataLabels: {
					enabled: false
				    },
				    showInLegend: true
				}
			    },
			    series: [{
				name: nm,
				colorByPoint: true,
				data: d
			    }]
			});
		}
	}
}
