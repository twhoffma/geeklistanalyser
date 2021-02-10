function init_ui(){
	var fn = {};
	var filternames = [
		{'name': 'boardgamedesigner', 'type': 'selectpicker'},
		{'name': 'boardgameartist',  'type': 'selectpicker'},
		{'name': 'boardgamemechanic',  'type': 'selectpicker'},
		{'name': 'boardgamecategory',  'type': 'selectpicker'},
		{'name': 'boardgamepublisher',  'type': 'selectpicker'},
		{'name': 'boardgamefamily',  'type': 'selectpicker'},
		{'name': 'releasetype', 'type': 'dropdown'},
		{'name': 'playingtime', 'type': 'slider', 'method': 'range'},
		{'name': 'numplayers', 'type': 'slider', 'method': 'range'},
		{'name': 'yearpublished', 'type': 'slider', 'method': 'pips'},
		{'name': 'playingtimemin', 'type': 'sliderValue', 'related': 'playingtime'},
		{'name': 'playingtimemax', 'type': 'sliderValue', 'related': 'playingtime'},
		{'name': 'numplayersmin', 'type': 'sliderValue', 'related': 'numplayers'},
		{'name': 'numplayersmax', 'type': 'sliderValue', 'related': 'numplayers'},
		{'name': 'yearpublishedmin', 'type': 'sliderValue', 'related': 'yearpublished'},
		{'name': 'yearpublishedmax', 'type': 'sliderValue', 'related': 'yearpublished'}
	]; 
	
	var filterDropdownIds = [
		'boardgameartist', 
		'boardgamedesigner', 
		'boardgamemechanic', 
		'boardgamecategory', 
		'releasetype', 
		'boardgamepublisher',
		'boardgamefamily'
	];

	var sortingDefault = {
		'sortby': 'crets',
		'ascending': 0
	};

	var currentFilterDefaults = {};	
	
	//Handlebars
	Handlebars.registerHelper('bgAttrFilterLink', function t(attr, val){
		var addr = window.location.search || "?";
		
		var re = new RegExp('((\\?|&)?)' + attr + "=[^&]*", 'i');
		
		if(re.test(addr)){
	  		var repl = '$1' + attr + "=" + val;
	    
			addr = addr.replace(re, repl);
	  	}else{
			addr += "&" + attr + "=" + val;
		}
		
		return addr
	});

	Handlebars.registerPartial('render_attr', Handlebars.templates.bgattr);
	Handlebars.registerPartial('sidenav_rangeslider', Handlebars.templates.sidenav_rangeslider);
	Handlebars.registerPartial('sidenav_dropdown', Handlebars.templates.sidenav_dropdown);
	
	function toggleDetails(e, op){
	      var p = $(e.target).parent().parent().parent().parent(); //It's pretty far up there
	      var c = p.children(".details");
	      
	      var o = "" + p.data("tobsies") || "";
	      var tobsies = o.split(",").filter(x=>x!="").map(x => x.split(":")[1]);
	      
	      //console.log(tobsies); 
	      o = "" + p.data("obsies") || "";
	      var obsies = o.split(",").filter(x=>x!="").map(x => x.split(":")[1]);
	      
	      o = "" + p.data("probsies") || "";
	      var probsies = o.split(",").filter(x=>x!="").map(x=>({"previewid": x.split(":")[0], "objectid": x.split(":")[1]}));
	      
	      if(obsies.length > 0 || tobsies.length > 0 || probsies.length > 0){
					if(c.length > 0){
						$(e.target).removeClass("fa-angle-up").addClass("fa-angle-down");
		  			p.children(".details").remove();
					}else{
						$(e.target).removeClass("fa-angle-down").addClass("fa-angle-up");
		  			p.append("<div class=\"block details\"></div>");
		  			var c = p.children(".details")[0];
		  
					  c.innerHTML += Handlebars.templates.bgobs(
							{
								obsies: obsies,
		     				tobsies: tobsies,
				      	probsies: probsies
							}
		  			);
					}
	    	}else{
					//console.log("No obs!");	
	    	}
			}

			//Events - these shouldn't be here..
			$(document).on('click', '.obs-caret', function(e){
				toggleDetails(e);
			});
	    
			$(document).on('click', '#collapseExpand', function(e){
				let bi = $('#staticBtnIcon')[0];
		
				if(bi.className == "fas fa-compress"){
					bi.className = "fas fa-expand";
			
					document.getElementById('geeklistitems').dataset.glazeCollapsed = "Y";
				}else{
					bi.className = "fas fa-compress";
		
					document.getElementById("geeklistitems").dataset.glazeCollapsed = "N";
				}	
			});
		
			function displaySpinner(visible){
				/*
				if(visible === true){
					$("#games").append("<tr id=\"spinner\"><td colspan=\"9\"><img src=\"img/spiffygif_30x30.gif\"</td></tr>");
				}else{
					$("#games").children('#spinner').remove();
				}
				*/
			}
	
	function setLoadButtonState(state){
		var e = document.getElementById("loadmore");
		var c;
		var i;
		var m;
		
		switch (state){
			case "error":
				c = "btn-danger";
				m = "Error!";
				i = "fa-exclamation-triangle";
				e.disabled = false;
				break;
			case "loading":
				c = "btn-warning";
				m = "Loading..";
				i = "fa-refresh iconspin";
				e.disabled = false;
				break;
			case "finished":
				c = "btn-success";
				m = "All done!";
				i = "fa-check-square-o";
				e.disabled = true;
				break;
			default :
				c = "btn-primary";	
				m = "Load more";
				i = "fa-caret-down";
				e.disabled = false;
		}
			
		e.className = "btn " + c;
		e.innerHTML = '<i class="fa ' + i + '" aria-hidden="true"></i> '+m;
	}
		
	function getSliderValue(id){
		var s = document.getElementById(id);
		var v = s.noUiSlider.get();	

		return {'name': id, 'min': parseInt(v[0]), 'max': parseInt(v[1])}
	}
	
	function markHistogramRange(svg, min, max){
		svg.childNodes.forEach(function(n, i){
			let v = parseInt(n.dataset.bucket);
			
			if(v >= min && v <= max){
				n.setAttribute('style', 'fill:rgb(0,128,128)');
			}else{
				n.setAttribute('style', 'fill:rgb(128,128,128)');
			}
		});
	}	
	
	function renderSliderHistogram(svg, d, widthScaling, min, max){
		  var maxValue = Math.max(...d.map(e => e.value));
		  
		  var n = d.length;
		  
		  
		  while (svg.firstChild) {
		      svg.firstChild.remove()
		  }
		  
		  
		  let w = 100 / n; 
		  let numObs = 0;
		  let totObs = 0
		  
		  d.forEach(function(v, i){
		    let e = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		    let h = v.value / maxValue * 100;
		    
		    e.setAttribute('x', '' +(w * i) + "%");
		    e.setAttribute('y', (100 - h) + '%');
		    e.setAttribute('width', '' + w * widthScaling + '%');
		    e.setAttribute('height', '' + h + '%');
		    
                    e.setAttribute('style', 'fill:rgb(0,128,128)');
		    
		    totObs = totObs + parseInt(v.value);
		    
		    e.setAttribute('data-bucket', v.key);
		    e.setAttribute('data-bucket-obs', v.value);
		    
		    e.addEventListener("click", function(){console.log(this.dataset.bucket);});
		    
		    svg.appendChild(e);
		  });
		
		  markHistogramRange(svg, min, max);
	}	
		
	fn = {
		'setLoadButtonState': setLoadButtonState,
		'setHistory': function setHistory(geeklistid, limit, skip, filter, sorting){
			var qs = "?id=" + geeklistid;
			
			skip = skip || 0;
			
			if(skip === 0){	
				filternames.forEach(function(e){
					if(filter[e.name] !== undefined){
						qs += "&" + e.name + "=" + filter[e.name];
					}
				});	
				
				if(sorting !== undefined){
					if(sorting.sortby !== undefined){	
						qs += "&sortby=" + sorting.sortby;
					}
					if(sorting.ascending !== undefined){
						qs += "&ascending=" + sorting.ascending;
					}
				}
				
				var location = window.history.location || window.location;
				history.pushState(null, null, location.protocol + '//' + location.host + location.pathname + qs);
			}
			
		},
		'renderUntoggleLinks': function renderUntoggleLinks(h){
			//Use history object h to render links here.
			$("#activefilters").empty();
			
			var args = Object.getOwnPropertyNames(h).filter(e => e !== "id");
			var linkparts = [];
			args.forEach(function(k){
				if(k !== "filters" && k !== "sorting"){
					linkparts.push([k,h[k]].join("="))	
				}else{
					Object.getOwnPropertyNames(h[k]).forEach(function(fs){
						linkparts.push([fs,h[k][fs]].join("="));
					});
				}	
			});
			
			linkparts.forEach(function(l, i){
				let html = "<a class=\"btnUntoggle\" href=\"?";
				if(h["id"]){
					html += "id=" + h["id"] + "&";
				}
				html += linkparts.filter(e => l !== e).join('&') + "\">" + l + "</a> ";
				
				$("#activefilters").append(html);
			});
		},
		'setErrorMessage': function setErrorMessage(e){
			document.getElementById('errormsg').innerHTML = e;
			$("#errorbox").show();
		},

		'clearErrorMessage': function clearErrorMessage(){
			document.getElementById('errormsg').innerHTML = "";
			$("#errorbox").hide();
		},
			
		'getSorting': function getSorting(){
			return {
				'sortby': $("#sortby").val(),
				'ascending': $("input[name='sortby_asc']:checked").val()
			};
		},
		
		'setSorting': function setSorting(sorting = {}){
			var sortby;
			var ascending;
			
			sortby = sorting.sortby || sortingDefault.sortby;
			ascending = sorting.ascending || sortingDefault.ascending;
			
			$("#sortby").val(sortby);
			$("input[name='sortby_asc']:checked").val(ascending);
		},
			
		'getHistory': function getHistory(){
			var params = {sorting:{}, filters:{}};
				
			if(window.location.search){
				var qs = window.location.search.substring(1);
					
				params = qs.split("&").reduce(
					function(prev, curr){
						var p = curr.split("=");
						var k = p[0];
						
						//Only include parameters that have a value
						if(p.length === 2){
							var v = decodeURIComponent(p[1]);
								
							if(filternames.filter(function(e){return e.name === k}).length > 0){ 
								prev.filters[k] = v;
							}else if(k === "sortby" || k === "ascending"){
								prev.sorting[k] = v;
							}else{
								prev[k] = v;
							}
						}

						return prev
					}, 
					{sorting:{}, filters:{}}
				);
			}
			
			return params
		},
		
		'populateFilters': function populateFilters(r){
			filternames.forEach(function(e){
				var defaults;
				
				if(r[e.name] !== undefined){
					var v = r[e.name];	
					var el = $('#' + e.name);
					
					
					if(e.type === 'selectpicker' || e.type === 'dropdown'){
						el.find('option').remove();
						el.append('<option value="">Any</option>');
						
						v.forEach(function(f){
							el.append('<option value="' + f.objectid + '" data-obs="' + f.value + '">' + f.name + '</option>');
						});
						
						if(e.type === 'selectpicker'){
							el.selectpicker('refresh');
						}
					}else if(e.type === 'slider'){
						var s = document.getElementById(e.name);
						var h = document.getElementById(e.name + 'hist');
						
						if(s.noUiSlider){
							s.noUiSlider.destroy();
						}
						
						if(e.method === 'range'){
							noUiSlider.create(s, {range: v, start: [v.min, v.max], step: 1});
								
							defaults = {'min': v.min, 'max': v.max};
						}else if(e.method === 'pips'){
							//TODO: Make it snap to only given values. Need to generate {min: , max:, '10%':, ...}
							var v = v.map(function(e){return parseInt(e)}).sort((a,b) => (a - b));
							
							var rng = {};
							var key = '';
							//console.log(v);
							rng['min'] = Math.min.apply(null, v);
							rng['max'] = Math.max.apply(null, v);
							
							for(var i = 0; i < v.length; i++){
								if(v[i] > rng['min'] && v[i] < rng['max']){ 
									rng[Math.round((i+1)/v.length*100) +'%'] = v[i];
								}
							}

							
							noUiSlider.create(s, {
								start: [rng['min'], rng['max']],
								range: rng,
								snap: true//,
								/*
								pips: {
									mode: 'steps',
									filter: function(v){
										if(v == rng['min'] || v == rng['max'] || v == 0){ //|| v === listyear){
											return 1
										}else{
											return 0
										}
									}
								}
								*/
								//,
								//connect: true
							});
							
							//noUiSlider.create(s, {range: rng, snap: true, pips: {mode: 'values', values: v, density: 0, stepped: true}, start: [v[0], v[v.length - 1]]});
							
							defaults = {'min': Math.min.apply(null, v), 'max': Math.max.apply(null, v)};
						}

						var histnm = e.name + 'hist';
						
						//What was I thinking? :)	
						if(e.name === 'playingtime'){
							histnm = 'playtimehist';
						}
						
						if(h && r[histnm]){	
							renderSliderHistogram(h, r[histnm], 0.9, defaults.min, defaults.max);
						}
						
						currentFilterDefaults[e.name] = defaults;
						 
						s.noUiSlider.on('set', function(){
							var v = s.noUiSlider.get();
							$(s).parent().find("input.min").val(parseInt(v[0]));
							$(s).parent().find("input.max").val(parseInt(v[1]));
							//XXX
							markHistogramRange($(s).parent().find("svg")[0], parseInt(v[0]), parseInt(v[1]));
							
						});

						$(s).parent().find("input").on('change', function(e){
							var min = parseInt($(s).parent().find("input.min").val());
							var max = parseInt($(s).parent().find("input.max").val());
							s.noUiSlider.set([min,max]);
							markHistogramRange($(s).parent().find("svg")[0], min, min);
						});
						
						
						s.noUiSlider.set();
						//s.noUiSlider.set([defaults.min, defaults.max]);
					}
				}else{
				}
			});		
		},
			
		'setFilters': function setFilters(filter){
			var el;

			if(filter === undefined){
				return
			}
			
			filternames.forEach(function(e){
				if(filter[e.name] !== undefined){
					el = $('#'+e.name);

					if(e.type === 'selectpicker'){
						el.selectpicker('val', parseInt(filter[e.name]));
					}else if(e.type === 'dropdown'){
						el.val(filter[e.name]);
					}else if(e.type === 'sliderValue'){
						var s = document.getElementById(e.related);
						
						if(filter[e.related + 'min']){
							s.noUiSlider.set([parseInt(filter[e.related + 'min']), null]);
						}
						
						if(filter[e.related + 'max']){
							s.noUiSlider.set([null, parseInt(filter[e.related + 'max'])]);
						}
					}
				} 
    		});
		},
		
		/*	
		'refreshFilters': function refreshFilters(){
			//https://github.com/silviomoreto/bootstrap-select/issues/1167
			$('#boardgamedesigner').selectpicker('val', '298');
			filternames.forEach(function(e){
				if(e.type === 'text'){
					//$('#'+e.name).selectpicker('val', 'refresh');
				}else if(e.type === 'slider'){
					var v = getSliderValue(e.name);
					
					v.each(function(f){
						filter[f.name] = f.value;
					});	
				}
    		});
		},
		*/	
		
		'getFilters': function getFilters(){
			var filter = {};	
				
			filternames.forEach(function(e){
				if(e.type === 'selectpicker' || e.type === 'dropdown'){
					if($('#'+e.name).val() !== null && $('#'+e.name).val() !== ''){
						filter[e.name] = $('#'+e.name).val();
					}
				}else if(e.type === 'slider'){
					var v = getSliderValue(e.name);
					
					if(v['min'] > currentFilterDefaults[e.name]['min']){
						console.log(e.name + " " + v['min'] + " is greather than " + currentFilterDefaults[e.name]['min']);
						
						filter[e.name + 'min'] = v['min'];
					}
					
					if(v['max'] < currentFilterDefaults[e.name]['max']){
						console.log(e.name + " " + v['max'] + " is lower than " + currentFilterDefaults[e.name]['max']);
						filter[e.name + 'max'] = v['max'];
					}
					/*
					v.forEach(function(f){

						console.log(f.name);
						filter[f.name] = f.value;
					});	
					*/
				}
    		});
			return filter
		},
		
		//'getSliderValue': getSliderValue,
		
		'enableMenuButtons': function enableMenuButtons(enabled){
			$('button#menuBtnSort').prop('disabled', !enabled);
			$('button#menuBtnFilter').prop('disabled', !enabled);
		},
		
		'clearGeeklist': function clearGeeklist(){
			//$('#games').children().remove();
			$('#geeklistitems').children().remove();
		},
		
		'displaySpinner': displaySpinner,
		'renderGeeklistDetails': function(r){
			$('#geeklistname').text(r[0].name);
		},
		'renderGeeklist': function renderGeeklist(r, sortby, geeklistid, clear){
			//var prevSortTerm = "";
			//var currentTerm = "";
			
			//var list = $('#games');
			var list = $('#geeklistitems');
			console.log("render stuff!");
			if(clear){
				list.children().remove();
			}
			
			sortby = sortby || '';
				
			for(i = 0; i < r.length; i++){
				var bg = r[i];
				
				//console.log(bg);	
				bg.geeklists = bg.geeklists.filter(x => x.objectid === parseInt(geeklistid));
				bg.bgid = bg.objectid;
				
				let obsData  = bg.geeklists[0].latest.obs.map(x => "" + x.geeklist + ":" + x.id).join(",");
				
				switch(bg.geeklists[0].latest.listtype){
					case "preview":
						bg.probsies = obsData;
						break;
					case "tradelist":
						bg.tobsies = obsData;
						break;
					default:
						bg.obsies = obsData;
				}
					
				var l = Handlebars.templates.bg(bg);
					
				list.append(l);
			}
		},
		/*		
		'setLoadButtonState': function setLoadButtonState(enabled){
			if(enabled === true){
				$("#loadmore").html("Load more");
				$("#loadmore").prop('disabled', false);
			}else{
				$("#loadmore").html("That's it!");
				$("#loadmore").prop('disabled', true);
			}
		},
		*/

		'isDefaultFilters': function isDefaultFilters(){
			var isDefaultValues = true;
			
			filterDropdownIds.forEach(function(v){
				var e = $('#' + v);
				
				if(e.val() !== ""){
					isDefaultValues = false;
				}
			});
			
			isDefaultValues = (isDefaultValues && isDefaultSlider('#playingtime'));
			isDefaultValues = (isDefaultValues && isDefaultSlider('#numplayers'));
			isDefaultValues = (isDefaultValues && isDefaultSlider('#yearpublished'));
			
			return isDefaultValues;
		},

		'isDefaultSorting': function isDefaultSorting(){
			var isDefaultValues = true;
			
			if($('#sortby').val() !== 'crets'){ 
				isDefaultValues = false;
			}
			
			if($('input[name="sortby_asc"]:checked').val() !== "0"){
				isDefaultValues = false;
			}
			
			return isDefaultValues;
		},

		'isDefaultSlider': function isDefaultSlider(sliderId){
			var s = $(sliderId).slider();	
			var sliderValues = s.slider('getValue');
			var sliderMin = s.slider('getAttribute', 'min');
			var sliderMax = s.slider('getAttribute', 'max');
			
			return (sliderValues[0] === sliderMin && sliderValues[1] === sliderMax);
		},

		'resetFilters': function resetFilters(){
			filterDropdownIds.forEach(function(v){
				$('#' + v).selectpicker('val', '');
			});


			$('.glyphicon-filter').css('color', 'black');
		},

		'resetSorting': function resetSorting(){
			//setSorting();
			$('#sortby').val('crets');
			$('input[name="sortby_asc"][value="0"]').prop("checked", true);
			//$('.glyphicon-sort-by-attributes').css('color', 'black');
		},
		'renderMenuGeeklists': function renderMenuGeeklists(r, filters){
			var ul = $('ul#geeklists');
			ul.children().remove();
			
			var cmpYear = function(a,b){
				if(a.year > b.year){
					return -1
				}else if(a.year === b.year){
					return a.name < b.name ? -1 : 1
				}else{
					return 1
				}
				
			};
			
			r.sort(function(a,b){
				if((a.update && b.update) || !(a.update && b.update)){
					return cmpYear(a,b)
				}else{
					return -1
				}
			});
				
			for(i = 0; i < r.length; i++){
				var matchActive = (filters.active === r[i].update || filters.active === undefined);
				var matchGroup = (filters.listgroup === r[i].group || filters.listgroup === undefined);
				var matchYear = (filters.listyear === r[i].year || filters.listyear === undefined);
				var matchType = (filters.listtype === r[i].type || filters.listtype === undefined);
				
				if(matchActive && matchGroup && matchYear && matchType){
					var l = Handlebars.templates.list(r[i]);
					ul.append(l);
				}
			}
		}
	}
	
	return fn
}
