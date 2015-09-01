function loadGeeklist(geeklistid, limit, skip){
	if(limit === undefined){
		limit = 10;
	}

	if(skip === undefined){
		skip = 0;
	}

	
	var geeklistURL = "./data/getGeeklist?geeklistId=" + geeklistid + "&limit=" + limit + "&skip=" + skip;
	
	jQuery.ajax({
		url: geeklistURL 
	}).done(function(data){
		var r = jQuery.parseJSON(data);
		var list = $('#games');
			
		if(skip === 0){
			list.empty();
		}
		
		for(i = 0; i < r.length; i++){
			var n = r[i].doc.name.filter(function(e){return e.primary === "true"})[0].name  || r[i].doc.name[0].name;
			list.append("<tr class=\"gameline\"><td>" + n + "</td><td class=\"hidden-xs\">1</td></tr>");
			
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
		
		for(i = 0; i < r.length; i++){
			geeklists.append("<li><a class=\"geeklist-menu-item\" data-geeklistid=\"" + r[i].objectid + "\">" + r[i].name + "</a></li>");
		}
	})	
}
