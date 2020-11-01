function init_graphs(){
	function requestJSON(url){
		return new Promise(function(resolve, reject){
			jQuery.ajax({
				url: url 
			}).then(
				function(data){
					//console.log(data);
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
			d = data.map(e => ({"name": e.name, "y": e.value }));
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
		},
		
		"renderGroupGraph": function(divId, nm, data, N, geeklistId, attr, valattr){
			var chartdata = getTopN(attr, valattr, N, geeklistId, data);
			var cats = chartdata.map(e => e.cat);
			var chartseries = getAreaChartSeries(chartdata, cats, valattr);
			
				
			renderAreaChart(divId, cats, chartseries, nm, N);
			
			function getTopN(attr, valattr, n, baseObjectId, d){
				  var baseTopN = d.find(e => e.geeklist.objectid === baseObjectId).graphdata[attr].sort((a,b)=>(a[valattr] < b[valattr] ? 1 : -1)).slice(0,n);
				  
				  var topNs = [];
				  //TODO: For each geeklist, sort by year, then by name. Then find top 10.
				  d.sort((a,b)=>(a.geeklist.year < b.geeklist.year ? -1 : 1)).forEach(function(v){
					var distinctYear = (d.filter(e => e.geeklist.year === v.geeklist.year).length === 1);
					var key = '' + v.geeklist.year + (distinctYear ? '' : ' (' + v.geeklist.objectid + ')');
				    
				    var graphData = v.graphdata[attr];
				    
				    var topN = graphData.filter(e => baseTopN.find(f => f.objectid === e.objectid)); 
				    
				    topNs.push({"cat": key, "topN": topN});
				  });
				  
				  return topNs
			}

			function renderAreaChart(chartId, cats, series, nm, N){
				var title = 'Breakdown by top ' + N + ' ' + nm + ' over time';
				console.log(cats);	
				  Highcharts.chart(chartId, {
				      chart: {
					  type: 'area'
				      },
				      title: {
					  text: title				      },
				      subtitle: {
					  text: 'Source: Boardgameeek.com'
				      },
				      xAxis: {
					  categories: cats, 
					  tickmarkPlacement: 'on',
					  title: {
					      enabled: false
					  }
				      },
				      yAxis: {
					  labels: {
					      format: '{value}%'
					  },
					  title: {
					      enabled: false
					  }
				      },
				      tooltip: {
					  pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})<br/>',
					  split: true
				      },
				      plotOptions: {
					  area: {
					      stacking: 'percent',
					      lineColor: '#ffffff',
					      lineWidth: 1,
					      marker: {
						  lineWidth: 1,
						  lineColor: '#ffffff'
					      }
					  }
				      },
				      series: series
				  });

				}

				function getAreaChartSeries(data, cats, valattr){
					var series = [];
				  
				  data.map(e => e.topN).forEach(function(topN, idxTopN){
				    topN.forEach(function(v, i){
					var s = series.find(e => (e.name === v.name));

					if(s === undefined){
					  let a = new Array(cats.length).fill(0);

					  s = {"name": v.name, "data": a};
					  series.push(s);
					}
						
					//Each series contains data for each topN array
					s.data[idxTopN] = (v[valattr] === undefined ? 0 : v[valattr]);
				      }
				    );
				  });
				  
				  return series
				}
		}
	}
}
