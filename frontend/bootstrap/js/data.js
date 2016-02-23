function init_data(){
	var fn = {};

	function getGeeklistFilters(geeklistid){
		var url = "./data/getGeeklistFilters?geeklistid=" + geeklistid;

		return new Promise(function(resolve, reject){
			jQuery.ajax({
				url: url 
			}).done(function(data){
				var r = jQuery.parseJSON(data);
			
				resolve(r);
			});
		})
	}
	
	function getGeeklist(geeklistid, skip, filter, sortby, sortby_asc){
		var filternames = [
			'boardgamedesigner', 
			'boardgameartist', 
			'boardgamemechanic', 
			'boardgamecategory', 
			'boardgamepublisher', 
			'releasetype',
			'playingtimemin',
			'playingtimemax',
			'playersmin',
			'playersmax',	
			'minyearpublished', 
			'maxyearpublished'
		]; 
		
		skip = skip || 0;
		filter = filter || {};
		sortby = sortby || 'crets';
		sortby_asc = sortby_asc || 0;
			
		var geeklistURL = "./data/getGeeklist?geeklistId=" + geeklistid + "&skip=" + skip;
		
		if(Object.keys(filter).length !== 0){
			geeklistURL += "&filters=" + JSON.stringify(filterby);
		}

		//Sorting
		geeklistURL += "&sortby=" + sortby + "&sortby_asc=" + sortby_asc;	
			
		return new Promise(function(resolve, reject){
			jQuery.ajax({
				url: geeklistURL 
			}).done(function(data){
				var r = jQuery.parseJSON(data);
				resolve(r);
			});
		})	
	}
	
	function getGeeklists(){
		var url = "./data/getGeeklists";
		
		return new Promise(function(resolve, reject){
			jQuery.ajax({
				url: url 
			}).done(function(data){
				var r = jQuery.parseJSON(data);
				
				resolve(r);
			});
		})	
	}
	
	fn['getGeeklistFilters'] = getGeeklistFilters;
	fn['getGeeklist'] = getGeeklist;
	fn['getGeeklists'] = getGeeklists;
	
	return fn;
}
