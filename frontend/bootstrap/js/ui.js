function init_ui(){
	var fn = {};
	var filternames = [
		{'name': 'boardgamedesigner', 'type': 'text'},
		{'name': 'boardgameartist',  'type': 'text'},
		{'name': 'boardgamemechanic',  'type': 'text'},
		{'name': 'boardgamecategory',  'type': 'text'},
		{'name': 'boardgamepublisher',  'type': 'text'},
		{'name': 'releasetype', 'type': 'text'},
		{'name': 'playingtime', 'type': 'slider'},
		{'name': 'players', 'type': 'slider'},
		{'name': 'yearpublished', 'type': 'slider'},
		{'name': 'playingtimemin', 'type': 'sliderValue'},
		{'name': 'playingtimemax', 'type': 'sliderValue'},
		{'name': 'playersmin', 'type': 'sliderValue'},
		{'name': 'playersmax', 'type': 'sliderValue'},
		{'name': 'yearpublishedmin', 'type': 'sliderValue'},
		{'name': 'yearpublishedmax', 'type': 'sliderValue'}
	]; 
	
	var filterDropdownIds = [
		'boardgameartist', 
		'boardgamedesigner', 
		'boardgamemechanic', 
		'boardgamecategory', 
		'releasetype', 
		'boardgamepublisher'
	];
	
	fn = {
		'setHistory': function setHistory(geeklistid, limit, skip, filter, sorting){
			var qs = "?id=" + geeklistid;
			
			skip = skip || 0;
			
			if(skip === 0){	
				filternames.forEach(function(e){
					if(filter[e.name] !== undefined){
						qs += "&" + e.name + "=" + filter[e.name];
					}
				});	
				
				if(sorting != undefined){
					if(sorting.sortby != undefined){	
						qs += "&sortby=" + sorting.sortby;
					}
					if(sorting.ascending != undefined){
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
			}
		},
		
		'setSorting': function setSorting(sorting){
			var sortby = sorting.sortby || 'crets';
			var ascending = sorting.ascending || 0;
			
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
						if(p.length = 2){
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
				if(r[e.name] != undefined){
					
					var el = $('#' + e.name);
					el.find('option').remove();
					el.append('<option value="">Any</option>');
					
					r[e.name].forEach(function(f){
						el.append('<option value="' + f.objectid + '">' + f.name + '</option>');
					});

					el.selectpicker('refresh');
				}else{
					//console.log(e.name);
				}
			});		
		},
			
		'setFilters': function setFilters(filter){
			var el;
			
			filternames.forEach(function(e){
				if(e.type === 'text'){
					if(filter[e.name] != undefined){
						console.log("Found " + e.name);
						el = $('#'+e.name);
						//el.val(""+filter[e.name]);
						//$(el).selectpicker('refresh');
						//el.selectpicker();
						//el.selectpicker('val', parseInt(filter[e.name]));
						//el.selectpicker('val', "Jim Winslow");
						//el.selectpicker("refresh");
					}
				/*
				}else if(e.type === 'slider'){
					var v = getSliderValue(e.name);
					
					v.each(function(f){
						filter[f.name] = f.value;
					});	
				*/
				}
    		});
			
			
		},
		
		'refreshFilters': function refreshFilters(){
			//https://github.com/silviomoreto/bootstrap-select/issues/1167
			$('#boardgamedesigner').selectpicker('val', '298');
			filternames.forEach(function(e){
				if(e.type === 'text'){
					//$('#'+e.name).selectpicker('val', 'refresh');
				/*
				}else if(e.type === 'slider'){
					var v = getSliderValue(e.name);
					
					v.each(function(f){
						filter[f.name] = f.value;
					});	
				*/
				}
    		});
		},
			
		'getFilters': function getFilters(){
			var filter = {};	
				
			filternames.forEach(function(e){
				if(e.type === 'text'){
					if($('#'+e.name).val() !== null && $('#'+e.name).val() !== ''){
						filter[e.name] = $('#'+e.name).val();
					}
				/*
				}else if(e.type === 'slider'){
					var v = getSliderValue(e.name);
					
					v.each(function(f){
						filter[f.name] = f.value;
					});
				*/	
				}
    		});
			
			return filter
		},
		
		'getSliderValue': function getSliderValue(id){
			var filter = [];
			
			var s = $('#' + id).slider();	
			var sVal = s.slider('getValue');
			var sMin = s.slider('getAttribute', 'min');
			var sMax = s.slider('getAttribute', 'max');
			
			if(sVal[0] > sMin){
				filter.push({'name': id + 'min', 'value': sVal[0]});
			}

			if(sVal[1] < sMax){
				filter.push({'name': id + 'max', 'value': sVal[1]});
			}

			return filter
		},
		
		'enableMenuButtons': function enableMenuButtons(enabled){
			$('button#menuBtnSort').prop('disabled', !enabled);
			$('button#menuBtnFilter').prop('disabled', !enabled);
		},
				
		'renderGeeklist': function renderGeeklist(r, sortby, geeklistid, clear){
			var prevSortTerm = "";
			var currentTerm = "";
			
			var list = $('#games');

			if(clear){
				list.children().remove();
			}
			
			$("#spinner").remove();
			
			if(r.length === 0){
				setLoadButtonState(false);
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
						currentTerm = "<= " + (100 * (Math.max(Math.ceil(boardgamestat.thumbs / 100, 0), 1)));
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
			
		'setLoadButtonState': function setLoadButtonState(enabled){
			if(enabled === true){
				$("#loadmore").html("Load more");
				$("#loadmore").prop('disabled', false);
			}else{
				$("#loadmore").html("That's it!");
				$("#loadmore").prop('disabled', true);
			}
		},

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
				//var e = $('#' + v).selectpicker('val', '');
				
				//e.Value("");
			});


			$('.glyphicon-filter').css('color', 'black');
		},

		'resetSorting': function resetSorting(){
			$('#sortby').val('crets');
			$('.glyphicon-sort-by-attributes').css('color', 'black');
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
	
	/*
	fn['getHistory'] = getHistory;	
	fn['setHistory'] = setHistory;
	
	fn['getFilters'] = getFilters;	
	fn['isDefaultFilters'] = isDefaultFilters;
	fn['isDefaultSlider'] = isDefaultSlider;
	fn['resetFilters'] = resetFilters;
	
	fn['getSorting'] = getSorting;	
	fn['isDefaultSorting'] = isDefaultSorting;
	fn['resetSorting'] = resetSorting;
	
	fn['populateFilterAndSorting'] = populateFilterAndSorting;
	fn['renderGeeklist'] = renderGeeklist;
	fn['renderMenuGeeklists'] = renderMenuGeeklists;
	
	fn['enableMenuButtons'] = enableMenuButtons;
	fn['setLoadButtonState'] = setLoadButtonState;
	*/
	return fn
}
