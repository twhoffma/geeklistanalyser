cheerio = require('cheerio');
q = require('q');
moment = require('moment');

db = require('./db-couch');
bgg = require('./bgg.js');

var boardgamesQueue = [];
var boardgames = [];
var geeklists = [];
var boardgameStats = [];
var geeklistStats = [];
var currentDate = moment().format("YYYY-MM-DD")
var currentTime = moment().format("YYYY-MM-DD[T]HH:mm:SS")

function getGeeklistData(geeklistId, subgeeklistId){
	var p = q.defer();
	var promises = [];
	
	bgg.getGeeklist(subgeeklistId).then(
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
							return e.objectId == bgId && e.geeklistId == geeklistId
						});
					
						var bgStat;
					
						if(bgStats.length === 0){
							bgStat = {
								objectId: bgId,
								geeklistId: geeklistId,
								analysisDate: currentDate,
								crets: moment().format("YYYY-MM-DD[T]HH:mm:SS"),
								cnt: 0,
								thumbs: 0,
								type: "boardgamestat",
								hist: {} //Histogram based on position
							}
						
							boardgameStats.push(bgStat);
						}else{
							bgStat = bgStats[0];
						}
						
						//Here we tally all stats.
						bgStat.cnt++;
						bgStat.thumbs += thumbs;
					}
				}else if($(this).attr('objecttype') == 'geeklist'){
						var glId = $(this).attr('objectid');
						var gl = geeklists.filter(function(e){
							return e.objectId == geeklistId
						});
						
						if(gl.length == 0){
							console.log('Loading list: ' + glId);
							geeklists.push({objectId: glId});
							
							var geeklistStats = {
								objectid: glId,
								statDate: currentDate,
								crets: moment().format("YYYY-MM-DD[T]HH:mm:SS"),
								numLists: 0,
								type: "geeklistStat",
								depth: 0,
								numBoardgames: 0,
								avgListLength: 0,
								medListLength: 0,
								maxListLenth: 0,
								minListLength: 0
							};
							
							promises.push(getGeeklistData(geeklistId, glId).then(
								function(val){
									//Here we need to combine stats from previous run
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
db.getGeeklists().then(
	function(geeklists){
		var p = [];
		
		geeklists.forEach(function(geeklist, i){
			p.push(getGeeklistData(geeklist.objectid, geeklist.objectid));
		});
		
		return q.allSettled(p)
	}
).then(
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
).fail(
	function(){
		console.log("Something went wrong!");
	}
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
