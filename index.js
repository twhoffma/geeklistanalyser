request = require('request');
cheerio = require('cheerio');
q = require('q');

var boardgamesQueue = [];
var boardgames = [];
var geeklists = [];
var boardgameStats = [];
var geeklistStats = [];
var promises = [];
var bg_promises = [];

function getGeeklistData(geeklistId){
	var url = 'https://www.boardgamegeek.com/xmlapi/geeklist/';
	var p = q.defer();
	var promises = [];

	//promises.push(p.promise);
	
	request(url + geeklistId, function(error, response, body){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(response.body);
			$('item').each(function(index, element){
				if($(this).attr('objecttype') == 'thing'){
					if($(this).attr('subtype') == 'boardgame'){
						var bgId = $(this).attr('objectid');
						var bg = boardgamesQueue.filter(function(e){
							return e.objectid == bgId;
						});
						
						if(bg.length == 0){
							boardgamesQueue.push({objectid: bgId});
						}
					}
				}else if($(this).attr('objecttype') == 'geeklist'){
						var glId = $(this).attr('id');
						var gl = geeklists.filter(function(e){
							return e.objectid == geeklistId
						});
						
						if(gl.length == 0){
							console.log('Loading list: ' + glId);
							geeklists.push({objectid: glId});
							
							promises.push(getGeeklistData(glId));
						}else{
							//Load precalculated data
							//if it exists - if not, it is a 
							//circular dependency and will be
							//discarded.
						}
				}
			});
			
			q.all(promises).then(
				function(){	
					p.resolve();
				}
			);
		}else{
			console.log('noting found or error!');
		}
	});
	
	return p.promise	
}

function getBoardgameData(boardgameId){
	var url = 'https://www.boardgamegeek.com/xmlapi/boardgame/';
	
	//Here, we should check the database first
	//then check if it is complete (if not, reload)
	//If not found, fetch from boardgamegeek
	
	var p = q.defer();
	
	//TODO: 
	//Send request to database: if found then resolve, else reject
	
	request(url + boardgameId, function(error, response, body){
		if(!error && response.statusCode == 200){
			var bg = {};
			var $ = cheerio.load(response.body);
			bg['objectid'] = boardgameId;
			bg['yearpublished'] = $('yearpublished').text();
			bg['minplayers'] = $('minplayers').text();
			bg['maxplayers'] = $('maxplayers').text();
			bg['playingtime'] = $('playingtime').text();
			bg['name'] = [];
			$('name').each(function(index, elem){
				bg['name'].push({'name': $(this).text(), 'primary': $(this).attr('primary')});
			});
			bg['thumbnail'] = $('thumbnail').text();
			bg['boardgamecategory'] = [];
			$('boardgamecategory').each(function(index, elem){
				var id = $(this).attr('objectid');
				var val = $(this).text();
				bg['boardgamecategory'].push({objectid: id, name: val});
			});
			bg['boardgamemechanic'] = [];
			$('boardgamemechanic').each(function(index, elem){
				var id = $(this).attr('objectid');
				var val = $(this).text();
				bg['boardgamemechanic'].push({objectid: id, name: val});
			});
			bg['boardgamedesigner'] = [];
			$('boardgamedesigner').each(function(index, elem){
				var id = $(this).attr('objectid');
				var val = $(this).text();
				bg['boardgamedesigner'].push({objectid: id, name: val});
			});
			bg['boardgameartist'] = [];
			$('boardgameartist').each(function(index, elem){
				var id = $(this).attr('objectid');
				var val = $(this).text();
				bg['boardgameartist'].push({objectid: id, name: val});
			});
			bg['boardgamepublisher'] = [];
			$('boardgamepublisher').each(function(index, elem){
				var id = $(this).attr('objectid');
				var val = $(this).text();
				bg['boardgamepublisher'].push({objectid: id, name: val});
			});			
		}
		
		return p.resolve(bg)
	});

	return p.promise
}

//This needs to be a promise.
//getGeeklistData(174437);

//q.all(
//	promises
//).then(
getGeeklistData(174437).then(
	function(){
		console.log("queue length" + boardgamesQueue.length);
		var bg_promises = [];
		
		boardgamesQueue.forEach(function(bg, idx){
			var p = getBoardgameData(bg.objectid).then(
				function(v){
					bg = v;
					boardgames.push(bg);
					console.log(JSON.stringify(bg));
				});
							
			bg_promises.push(p);
		});
			
		console.log("geeklist promises done!");
		return q.all(bg_promises)
	}
).then(
	//TODO: Save boardgames to database
	//TODO: Delete same-date and save geeklistStats to database
	//TODO: Delete same-date and save boardgameStats to database
  //TODO: Calculate geeklistSnapshotStats (mechanics breakdown, drilldowns).
	//TODO: Delete and save geeklistSnapshotStats
	function(){
		boardgames.forEach(function(bg, i){
			console.log(JSON.stringify(bg));
		});
		console.log(boardgames.length);
	}
	
).done(
	function(){
		console.log("All done");
	}
);

geeklist = function(){
	return {
		objectid: null,
		geeklistGroup: "",
		update: false
	}
}
