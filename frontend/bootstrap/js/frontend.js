function loadGeeklist(){
	var geeklistURL = "http://127.0.0.1:3000/getGeeklist?geeklistId=71143&limit=10" + "&skip=" + $('.gameline').length;
	
	jQuery.ajax({
		url: geeklistURL 
	}).done(function(data){
		var r = jQuery.parseJSON(data);
			
		//$('#games').empty();
		
		for(i = 0; i < r.length; i++){
			$('#games').append("<tr class=\"gameline\"><td>" + r[i].doc.name + "</td></tr>");
		}
	})	
}

