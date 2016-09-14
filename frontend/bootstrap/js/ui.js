function init_ui(){
	var fn = {};
	var filternames = [
		{'name': 'boardgamedesigner', 'type': 'selectpicker'},
		{'name': 'boardgameartist',  'type': 'selectpicker'},
		{'name': 'boardgamemechanic',  'type': 'selectpicker'},
		{'name': 'boardgamecategory',  'type': 'selectpicker'},
		{'name': 'boardgamepublisher',  'type': 'selectpicker'},
		{'name': 'releasetype', 'type': 'dropdown'},
		{'name': 'playingtime', 'type': 'slider'},
		{'name': 'numplayers', 'type': 'slider'},
		{'name': 'yearpublished', 'type': 'slider'},
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
		'boardgamepublisher'
	];

	var sortingDefault = {
		'sortby': 'crets',
		'ascending': 0
	};
	
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
		var filter = [];
		
		var s = document.getElementById(id);
		var v = s.noUiSlider.get();	

			
		filter.push({'name': id + 'min', 'value': parseInt(v[0])});
		filter.push({'name': id + 'max', 'value': parseInt(v[1])});

		/*
		TODO: Implement min/max check
		//var s = $('input#' + id).slider();
		var s = $('#' + id);
		var val = s.slider("values");
		//var val = s.slider('getValue');
		var min = s.slider( "option", "min" );
		var max = s.slider( "option", "max" );
		//var max = s.slider('getAttribute', 'max');
		
		
		if(val[0] > min){
			filter.push({'name': id + 'min', 'value': val[0]});
		}

		if(val[1] < max){
			filter.push({'name': id + 'max', 'value': val[1]});
		}
		*/
		return filter;
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
				if(r[e.name] !== undefined){
					var v = r[e.name];	
					var el = $('#' + e.name);
					
					
					if(e.type === 'selectpicker' || e.type === 'dropdown'){
						el.find('option').remove();
						el.append('<option value="">Any</option>');
						
						v.forEach(function(f){
							el.append('<option value="' + f.objectid + '">' + f.name + '</option>');
						});
						
						if(e.type === 'selectpicker'){
							el.selectpicker('refresh');
						}
					}else if(e.type === 'slider'){
						var s = document.getElementById(e.name);
						
						if(s.noUiSlider){
							s.noUiSlider.destroy();
						}
						
						noUiSlider.create(s, {range: v, start: [v.min, v.max], step: 1});
						
						s.noUiSlider.on('set', function(){
							var v = s.noUiSlider.get();
							$(s).parent().children("input.min").val(parseInt(v[0]));
							$(s).parent().children("input.max").val(parseInt(v[1]));
						});

						$(s).parent().children("input").on('change', function(e){
							var min = parseInt($(s).parent().children("input.min").val());
							var max = parseInt($(s).parent().children("input.max").val());
							s.noUiSlider.set([min,max]);
						});
						
						s.noUiSlider.set();
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
					v.forEach(function(f){
						filter[f.name] = f.value;
					});
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
			$('#games').children().remove();
		},
		
		'displaySpinner': displaySpinner,
		'renderGeeklistDetails': function(r){
			$('#geeklistname').text(r[0].name);
		},
		'renderGeeklist': function renderGeeklist(r, sortby, geeklistid, clear){
			var prevSortTerm = "";
			var currentTerm = "";
			
			var list = $('#games');

			if(clear){
				list.children().remove();
			}
			
			sortby = sortby || '';
				
			for(i = 0; i < r.length; i++){
				var n = r[i].name.filter(function(e){
								return e.primary === "true";
							}
						)[0].name  || r[i].name[0].name;
				
				var geeklist = r[i].geeklists.filter(function(o){return o.objectid == geeklistid})[0];
				var boardgamestat = geeklist.latest; 
				
				
				//For certain sort terms, print subheaders
				if(sortby === "name" || sortby === "thumbs" || sortby === "yearpublished"){
					if(sortby === "name"){
						currentTerm = n.substring(0,1);
					}else if(sortby === "thumbs"){
						currentTerm = "&le; " + (100 * (Math.max(Math.ceil(boardgamestat.thumbs / 100, 0), 1)));
					}else if(sortby === "yearpublished"){
						currentTerm = r[i].yearpublished;
					}
				
					if($('.subheader[data-subheader="' + currentTerm + '"]').length === 0){
						list.append("<tr class=\"subheader\" data-subheader=\"" + currentTerm + "\"><td colspan=\"10\">" + currentTerm + "</td></tr>");
					}
				}
				
				prevSortTerm = currentTerm;
				
				var l = "<tr class=\"gameline\"><td><a href=\"http://www.boardgamegeek.com/boardgame/" + r[i].objectid + "\" target=\"_blank\">" + n + "</a></td>";
				l += "<td class=\"hidden-xs\">" + r[i].yearpublished  + "</td>";
				l += "<td class=\"hidden-xs\">" + r[i].minplayers  + "</td>";
				l += "<td class=\"hidden-xs\">" + r[i].maxplayers  + "</td>";
				l += "<td class=\"hidden-xs\">" + r[i].playingtime  + "</td>";
				l += "<td class=\"hidden-xs\">" + r[i].minplaytime  + "</td>";
				l += "<td class=\"hidden-xs\">" + r[i].maxplaytime  + "</td>";
				l += "<td class=\"hidden-xs\">" + boardgamestat.thumbs  + "</td>";
				l += "<td class=\"hidden-xs\">" + boardgamestat.cnt  + "</td>";
				l += "<td class=\"hidden-s\">" + geeklist.crets  + "</td>";
				
				l += "</tr>";
					
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
		
		'renderMenuGeeklists': function renderMenuGeeklists(r){
			var geeklists = $('#geeklists .dropdown-menu');
			r.sort(function(a, b){
				if(a.group < b.group){
					return -1;
				}else if(b.group < a.group){
					return 1;
				}else{
					if(a.year < b.year){
						return -1;
					}else if(a.year > b.year){
						return 1;
					}else{
						return 0;
					}
				}
			});
				
			for(i = 0; i < r.length; i++){
				var g = $('li[data-geeklistgroup="' + r[i].group  + '"]');
				//var grp;
				var geeklistitem = "<li><a class=\"geeklist-menu-item\" data-geeklistid=\"" + r[i].objectid + "\">" + r[i].name + "</a></li>";	
				if(g.length === 0)
				{
					geeklists.append('<li class="dropdown-header" data-geeklistgroup="' + r[i].group + '">' + r[i].group + '</li>');
				}
				
				geeklists.append(geeklistitem);
			}
		}
	}
	
	return fn
}
