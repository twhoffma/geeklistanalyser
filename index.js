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
	var bgameStats = [];
	var bgameQueue = [];
	
	bgg.getGeeklist(subgeeklistId).then(
		function(res){
			var $ = cheerio.load(res);
			
			$('item').each(function(index, element){
				if($(this).attr('objecttype') == 'thing'){
					if($(this).attr('subtype') == 'boardgame'){
						var bgId = $(this).attr('objectid');
						var thumbs = parseInt($(this).attr('thumbs'));
						
						//var bg = boardgamesQueue.filter(function(e){
						var bg = bgameQueue.filter(function(e){
							return e.objectId == bgId;
						});
						
						if(bg.length == 0){
							//boardgamesQueue.push({objectid: bgId});
							bgameQueue.push({objectId: bgId});
							console.log("New bg: " + bgId);
						}
					
						var bgStats = bgameStats.filter(function(e){
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
						
							bgameStats.push(bgStat);
						}else{
							bgStat = bgStats[0];
						}
						
						//Here we tally all stats.
						bgStat.cnt++;
						bgStat.thumbs += thumbs;
					}
				}else if($(this).attr('objecttype') == 'geeklist'){
						var glId = $(this).attr('objectid');
						
						//Check if list has already been traversed. This is necessary to prevent 
						//possible infinite loops
						var gl = geeklists.filter(function(e){
							return e.objectId == glId
						});
						
						if(gl.length == 0){
							console.log('Loading list: ' + glId);

							geeklists.push({objectId: glId});
							
							var geeklistStats = {
								objectId: glId,
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
							
							//TODO: Add geeklistStats array
							//TODO: When it returns one should combine the stats if they are additive.
							//TODO: If sublist is equal to geeklist then we are at the top level and should calculate non-additive stats.
							
							promises.push(getGeeklistData(geeklistId, glId).then(
								function(val){
									val.bgameQueue.forEach(function(v, i){
										//Add found boardgames to queue for loading stats
										if(bgameQueue.filter(function(e){ e.objectId === v.objectId	}) === 0){
											bgameQueue.push(v);
										}
										
									});
									
									console.log(val.bgameStats.length);
									//Here we need to combine stats from previous run
									val.bgameStats.forEach(function(v, i){
										var s = bgameStats.filter(function(e){ e.objectId === v.objectId});

										if(s.length > 0){
											var stat = s[0];
											
											console.log("Comb: " + v.objectId);
											
											stat.cnt += v.cnt;
											stat.thumbs += v.thumbs;
											//TODO: combine stat.hist	
										}else{
											bgameStats.push(v);
											console.log("New: " + v.objectId);
										}
									});

									return {bgameQueue: bgameQueue, bgameStats: bgameStats}
								}
							));
						}
						
						gl["numLists"]++;
				}
			});
			
			q.all(promises).then(
				function(val){
					val.forEach(function(res, i){
						res.bgameQueue.forEach(function(v, i){
							//Add found boardgames to queue for loading stats
							if(bgameQueue.filter(function(e){ e.objectId === v.objectId	}) === 0){
								bgameQueue.push(v);
							}	
						});
										
						//Here we need to combine stats from previous run
						res.bgameStats.forEach(function(v, i){
							var s = bgameStats.filter(function(e){ e.objectId === v.objectId});
							
							if(s.length > 0){
								var stat = s[0];
								stat.cnt += v.cnt;
								stat.thumbs += v.thumbs;
								//TODO: combine stat.hist	
							}else{
								bgameStats.push(v);
							}
						});
					});
					
					console.log(bgameStats);
					p.resolve({bgameQueue: bgameQueue, bgameStats: bgameStats});
					//p.resolve();
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
