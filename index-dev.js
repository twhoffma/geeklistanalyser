cheerio = require('cheerio');
q = require('q');
db = require('./db-couch');
bgg = require('./bgg.js');

var boardgamesQueue = [];
var boardgames = [];
var geeklists = [];
var boardgameStats = [];
var geeklistStats = [];
var currentDate = Date(); 

function getGeeklistData(geeklistId){
	var p = q.defer();
	var promises = [];
	
	bgg.getGeeklist(geeklistId).then(
		function(res){
			var $ = cheerio.load(res);
			
			$('item').each(function(index, element){
				if($(this).attr('objecttype') == 'thing'){
					if($(this).attr('subtype') == 'boardgame'){
						var bgId = $(this).attr('objectid');
						var thumbs = parseInt($(this).attr('thumbs'));
						
						var bg = boardgamesQueue.filter(function(e){
							return e.objectid == bgId;
						});
						
						if(bg.length == 0){
							boardgamesQueue.push({objectid: bgId});
						}
					
						var bgStats = boardgameStats.filter(function(e){
							return e.objectid == bgId && e.geeklistId == geeklistId
						});
					
						var bgStat;
					
						if(bgStats.length === 0){
							bgStat = {
								objectId: bgId,
								geeklistId: geeklistId,
								analysisDate: currentDate.getFullYear + "-" + currentDate.getMonth + "-" + currentDate.getDay,
								chgts: currentDate.toString(),
								cnt: 0,
								thumbs: 0
							}
						
							boardgameStats.push(bgStat);
						}else{
							bgStat = bgStats[0];
						}

						bgStat.cnt++;
						bgStat.thumbs += thumbs;
					}
				}else if($(this).attr('objecttype') == 'geeklist'){
						var glId = $(this).attr('id');
						var gl = geeklists.filter(function(e){
							return e.objectid == geeklistId
						});
						
						if(gl.length == 0){
							console.log('Loading list: ' + glId);
							geeklists.push({objectid: glId});
							
							var geeklistStats = {
								objectid: glId,
								statDate: "2000-12-31",
								crets: "Now",
								numLists: 0
							};
							
							promises.push(getGeeklistData(glId).then(
								function(val){
									
								}
							));
						}
						
						gl["numLists"]++;
				}
			});
			
			q.all(promises).then(
				function(){
					//Should be
					//p.resolve(boardgameQueue);	
					p.resolve();
				}
			);
		}
	);
	
	return p.promise	
}

function getBoardgameData(boardgameId){
	return db.getBoardgame(boardgameId).fail(
		function(){
			return bgg.getBoardgame(boardgameId) 
		}
	).fail(
		function(val){
			console.log(val);
			throw val
		}
	)
}

/*
 * Run main algorithm
 */
getGeeklistData(174437).then(
	//TODO: Calculate and save geeklist stats
	function(){
		var bg_promises = [];
		
		boardgamesQueue.forEach(function(bg, idx){
			var p = getBoardgameData(bg.objectid).then(
				function(v){
					bg = v;
					//bg["geeklists"] = [];
					//bg.geeklists.push("174437");
					
					boardgames.push(bg);
				});
							
			bg_promises.push(p);
		});
			
		return q.all(bg_promises)
	}
).then(
	function(){
		return db.saveBoardgames(boardgames)
	}

	//TODO: Save boardgames to database
	//TODO: Delete same-date and save geeklistStats to database
	//TODO: Delete same-date and save boardgameStats to database
  	//TODO: Calculate geeklistSnapshotStats (mechanics breakdown, drilldowns).
	//TODO: Delete and save geeklistSnapshotStats
).done(
	function(){
		boardgameStats.forEach(function(bg, idx){
			console.log(bg);
		});
		console.log("All done");
	}
);

//Classes - just for reference
geeklist = function(){
	return {
		objectid: null,
		geeklistGroup: "",
		update: false
	}
}
