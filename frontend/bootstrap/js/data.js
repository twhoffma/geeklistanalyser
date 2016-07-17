function init_data(){
	var fn = {
		'getGeeklistFilters': function getGeeklistFilters(geeklistid){
			var url = "./data/getGeeklistFilters?geeklistid=" + geeklistid;

			return new Promise(function(resolve, reject){
				if(geeklistid === undefined){
					reject("Parameter 'geeklistid' must be defined");
				}else{
					jQuery.ajax({
						url: url 
					}).done(function(data){
						var r = jQuery.parseJSON(data);
					
						resolve(r);
					});
				}
			})
		},
		
		'getGeeklist': function getGeeklist(geeklistid, skip, filter, sorting){
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
			var sortby = sorting.sortby || 'crets';
			var sortby_asc = sorting.ascending || 0;
				
			var geeklistURL = "./data/getGeeklist?geeklistId=" + geeklistid + "&skip=" + skip;
			
			if(Object.keys(filter).length !== 0){
				geeklistURL += "&filters=" + JSON.stringify(filter);
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
		},
		
		'getGeeklists': function getGeeklists(){
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
	}
	/*
	fn['getGeeklistFilters'] = getGeeklistFilters;
	fn['getGeeklist'] = getGeeklist;
	fn['getGeeklists'] = getGeeklists;
	*/
	return fn;
}
