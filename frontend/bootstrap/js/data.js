function init_data(){
	function requestJSON(url){
		return new Promise(function(resolve, reject){
			jQuery.ajax({
				url: url 
			}).done(function(data){
				var r = jQuery.parseJSON(data);
			
				resolve(r);
			});
		})
	}
	
	var fn = {
		'getGeeklistDetails': function getGeeklistInfo(geeklistid){
			var url = "./data/getGeeklistDetails?geeklistid=" + parseInt(geeklistid);
			
			return requestJSON(url)	
		},
		
		'getGeeklistFilters': function getGeeklistFilters(geeklistid){
			var url = "./data/getGeeklistFilters?geeklistid=" + parseInt(geeklistid);
			
			return requestJSON(url) 
		},
		
		'getGeeklist': function getGeeklist(geeklistid, skip, filter, sorting = {}){
			skip = skip || 0;
			filter = filter || {};
			var sortby = sorting.sortby || 'crets';
			var sortby_asc = sorting.ascending || 0;
				
			var url = "./data/getGeeklist?geeklistId=" + geeklistid + "&skip=" + skip;
			
			if(Object.keys(filter).length !== 0){
				url += "&filters=" + JSON.stringify(filter);
			}

			//Sorting
			url += "&sortby=" + sortby + "&sortby_asc=" + sortby_asc;	
			
			return requestJSON(url)
		},
		
		'getGeeklists': function getGeeklists(){
			var url = "./data/getGeeklists";
			
			return requestJSON(url)
		}
	}
	
	return fn;
}
