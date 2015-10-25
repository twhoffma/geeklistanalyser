var filterDropdownIds = ['boardgameartist', 'boardgamedesigner', 'boardgamemechanic', 'boardgamecategory', 'releasetype', 'boardgamepublisher'];

function setLoadButtonState(enabled){
	if(enabled === true){
		$("#loadmore").html("Load more");
		$("#loadmore").prop('disabled', false);
	}else{
		$("#loadmore").html("That's it!");
		$("#loadmore").prop('disabled', true);
	}
}

function isDefaultFilters(){
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
}

function isDefaultSorting(){
	var isDefaultValues = true;
	
	if($('#sortby').val() !== 'crets'){ 
		isDefaultValues = false;
	}
	
	if($('input[name="sortby_asc"]:checked').val() !== "0"){
		isDefaultValues = false;
	}
	
	return isDefaultValues;
}

function isDefaultSlider(sliderId){
	var s = $(sliderId).slider();	
	var sliderValues = s.slider('getValue');
	var sliderMin = s.slider('getAttribute', 'min');
	var sliderMax = s.slider('getAttribute', 'max');
	
	return (sliderValues[0] === sliderMin && sliderValues[1] === sliderMax);
}

function resetFilters(){
	filterDropdownIds.forEach(function(v){
		$('#' + v).selectpicker('val', '');
		//var e = $('#' + v).selectpicker('val', '');
		
		//e.Value("");
	});


	$('.glyphicon-filter').css('color', 'black');
}

function resetSorting(){
	$('#sortby').val('crets');
	$('.glyphicon-sort-by-attributes').css('color', 'black');
}

function loadGeeklistFilters(geeklistid){
	var url = "./data/getGeeklistFilters?geeklistid=" + geeklistid;

	jQuery.ajax({
		url: url 
	}).done(function(data){
		var r = jQuery.parseJSON(data);
		if(r.length > 0){
			var doc = r[0].doc;
			
			['boardgameartist', 'boardgamedesigner', 'boardgamemechanic', 'boardgamecategory', 'boardgamepublisher'].forEach(function(v){
				var e = $('#' + v);
				e.find('option').remove();
			
				e.append('<option value="">Any</option>');
				
				for(var i = 0; i < doc[v].length; i++){
					e.append('<option value="' + doc[v][i].objectid + '">' + doc[v][i].name + '</option>');
				}

				e.selectpicker('refresh');
			});

			var e = $('#playingtime');
			e.slider({
						min: doc.minplaytime, 
						max: doc.maxplaytime, 
						value: [doc.minplaytime, doc.maxplaytime], 
						tooltip: 'always', 
						tooltip_split: true,
						scale: 'logarithmic'
					});
			e.slider('refresh');
			
			e = $('#numplayers');
			e.slider({
						min: doc.minplayers, 
						max: doc.maxplayers, 
						value: [doc.minplayers, doc.maxplayers], 
						tooltip: 'always', 
						tooltip_split: true,
						scale: 'logarithmic'
					});
			e.slider('refresh');
			
			e = $('#yearpublished');
			e.slider({
						min: doc.minyearpublished, 
						max: doc.maxyearpublished, 
						value: [doc.minyearpublished, doc.maxyearpublished], 
						tooltip: 'always', 
						tooltip_split: true
					});
			e.slider('refresh');
		}	
	});
}

function loadGeeklist(geeklistid, limit, skip, filter, sort){
	if(skip === undefined){
		skip = 0;
	}

	
	//var geeklistURL = "./data/getGeeklist?geeklistId=" + geeklistid + "&limit=" + limit + "&skip=" + skip;
	var geeklistURL = "./data/getGeeklist?geeklistId=" + geeklistid + "&skip=" + skip;
	
	var filterby = {};
	var sortby = $("#sortby").val();
	var sortby_asc = $("input[name='sortby_asc']:checked").val();
	
	var list = $('#games');
	
	if(skip === 0){
		list.empty();
		setLoadButtonState(true);
		
		var qs = "?id=" + geeklistid;

		['boardgamedesigner', 'boardgameartist', 'boardgamemechanic', 'boardgamecategory', 'boardgamepublisher', 'releasetype'].forEach(function(e){
			if($('#'+e).val() !== null && $('#'+e).val() !== ''){
				qs += "&" + e + "=" + $('#'+e).val();
   		 	}
		});
		
		qs += "&sortby=" + sortby;
		qs += "&sortby_asc=" + sortby_asc 
		
		var location = window.history.location || window.location;
		history.pushState(null, null, location.protocol + '//' + location.host + location.pathname + qs);
		
	}
	
	list.append("<tr id=\"spinner\"><td colspan=\"9\"><img src=\"img/spiffygif_30x30.gif\"</td></tr>");
	
	//Filters
	['boardgamedesigner', 'boardgameartist', 'boardgamemechanic', 'boardgamecategory', 'boardgamepublisher'].forEach(function(e){
		if($('#'+e).val() !== null && $('#'+e).val() !== ''){
			filterby[e] = $('#'+e).val();
			
			console.log($('#'+e).val());

    	}
	});

	if($('#releasetype').val() !== null && $('#releasetype').val() !== ''){
		filterby['releasetype'] = $('#releasetype').val();
	}
	
	var s = $('#playingtime').slider();	
	var sVal = s.slider('getValue');
	var sMin = s.slider('getAttribute', 'min');
	var sMax = s.slider('getAttribute', 'max');
	
	if(sVal[0] > sMin){
		filterby['playingtimemin'] = sVal[0];
	}

	if(sVal[1] < sMax){
		filterby['playingtimemax'] = sVal[1];
	}
	
	s = $('#numplayers').slider();	
	sVal = s.slider('getValue');
	sMin = s.slider('getAttribute', 'min');
	sMax = s.slider('getAttribute', 'max');
	
	if(sVal[0] > sMin){
		filterby['playersmin'] = sVal[0];
	}

	if(sVal[1] < sMax){
		filterby['playersmax'] = sVal[1];
	}
	
	s = $('#yearpublished').slider();	
	sVal = s.slider('getValue');
	sMin = s.slider('getAttribute', 'min');
	sMax = s.slider('getAttribute', 'max');
	
	if(sVal[0] > sMin){
		filterby['minyearpublished'] = sVal[0];
	}

	if(sVal[1] < sMax){
		filterby['maxyearpublished'] = sVal[1];
	}
	
	//Actual adding of filter should be somewhere else to keep it DRY
	if(Object.keys(filterby).length !== 0){
		geeklistURL += "&filters=" + JSON.stringify(filterby);
	}

	//Sorting
	geeklistURL += "&sortby=" + sortby + "&sortby_asc=" + sortby_asc;	
	

	
		
	jQuery.ajax({
		url: geeklistURL 
	}).done(function(data){
		var r = jQuery.parseJSON(data);
		var prevSortTerm = "";
		var currentTerm = "";
		
		$("#spinner").remove();
		
		if(r.length === 0){
			setLoadButtonState(false);
		}
			
		for(i = 0; i < r.length; i++){
			var n = r[i].name.filter(function(e){
							return e.primary === "true";
						}
					)[0].name  || r[i].name[0].name;
			
			var geeklist = r[i].geeklists.filter(function(o){
									return o.objectid == geeklistid;
								})[0];
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
	});	
}

function getGeeklists(){
	var url = "./data/getGeeklists";
	
	jQuery.ajax({
		url: url 
	}).done(function(data){
		var r = jQuery.parseJSON(data);
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
	});	
}
