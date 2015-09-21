function loadGeeklist(geeklistid, limit, skip, filter, sort){
	if(limit === undefined){
		limit = 10;
	}

	if(skip === undefined){
		skip = 0;
	}

	
	var geeklistURL = "./data/getGeeklist?geeklistId=" + geeklistid + "&limit=" + limit + "&skip=" + skip;
	
	var filterby;
	var sortby = $("#sortby").val();
	var sortby_asc = $("input[name='sortby_asc']:checked").val();
	
	geeklistURL += "&sortby=" + sortby + "&sortby_asc=" + sortby_asc;	
	alert(sortby + " " + sortby_asc);
	
	jQuery.ajax({
		url: geeklistURL 
	}).done(function(data){
		var r = jQuery.parseJSON(data);
		var list = $('#games');
		
		//TODO: Make an array of subheader 	
		if(skip === 0){
			list.empty();
		}
		
		var prevSortTerm = "";
		var currentTerm = "";
		
		for(i = 0; i < r.length; i++){
			var n = r[i].name.filter(function(e){
							return e.primary === "true"
						}
					)[0].name  || r[i].name[0].name;
			
			if(sortby.name === "name"){
				currentTerm = n.substring(0,1);
			}else if(sortby.name === "thumbs"){
				currentTerm = r[i].geeklists.filter(function(o){
						return o.objectid
					}
				)[0].thumbs;
			}
			
			if($('.subheader[data-subheader="' + currentTerm + '"]').length === 0){
					list.append("<tr class=\"subheader\" data-subheader=\"" + currentTerm + "\"><td colspan=\"4\">" + currentTerm + "</td></tr>");
			}
			
			prevSortTerm = currentTerm;
			
			var l = "<tr class=\"gameline\"><td>" + n + "</td>";
			l += "<td class=\"hidden-xs\">" + r[i].yearpublished  + "</td>";
			l += "<td class=\"hidden-xs\">" + r[i].minplayers  + "</td>";
			l += "<td class=\"hidden-xs\">" + r[i].maxplayers  + "</td>";
			l += "<td class=\"hidden-xs\">" + r[i].playingtime  + "</td>";
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
				return -1
			}else if(b.group < a.group){
				return 1
			}else{
				if(a.year < b.year){
					return -1
				}else if(a.year > b.year){
					return 1
				}else{
					return 0
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
	})	
}
