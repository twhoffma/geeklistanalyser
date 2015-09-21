cheerio = require('cheerio');
q = require('q');
moment = require('moment');

db = require('./db-couch');
bgg = require('./bgg.js');

var currentDate = moment().format("YYYY-MM-DD")
var currentTime = moment().format("YYYY-MM-DD[T]HH:mm:SS")

function getGeeklistData(geeklistid, subgeeklistid, geeklists, boardgameStats, geeklistStats){
	var p = q.defer();
	var promises = [];
	
	//Get the geeklistStats for parent list
	var geeklistStatList = geeklistStats.filter(function(e){
		return e.objectid == geeklistid
	});
	
	var geeklistStat;
	
	//XXX: Find out why this is just not passed as a single object to be updated 
	if(geeklistStatList.length === 0){
		geeklistStat = {
			id: geeklistid, //XXX:For compatibility with other old ones in database, 
			objectid: geeklistid,
			statDate: currentDate,
			crets: moment().format("YYYY-MM-DD[T]HH:mm:SS"),
			numLists: 0,
			type: "geekliststat",
			depth: 0,
			numBoardgames: 0,
			avgListLength: 0,
			medListLength: 0,
			maxListLength: 0,
			minListLength: 0
		};
		geeklistStats.push(geeklistStat);
	}else{
		geeklistStat = geeklistStatList[0];
	}

	//Populate geeklist stats
	geeklistStat.depth += 1;
	
	//Load the list from BGG
	bgg.getGeeklist(subgeeklistid).then(
		function(res){
			var $ = cheerio.load(res);
			
			$('item').each(function(index, element){
				if($(this).attr('objecttype') == 'thing'){
					if($(this).attr('subtype') == 'boardgame'){
						var bgId = $(this).attr('objectid');
						var thumbs = parseInt($(this).attr('thumbs'));
						
						var bgStats = boardgameStats.filter(function(e){
							return e.objectid == bgId && e.geeklistid == geeklistid
						});
					
						var bgStat;
					
						if(bgStats.length === 0){
							bgStat = {
								objectid: bgId,
								geeklistid: geeklistid,
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

						geeklistStat.numBoardgames++;
					}
				}else if($(this).attr('objecttype') == 'geeklist'){
						var glId = $(this).attr('objectid');
						var gl = geeklists.filter(function(e){
							return e.objectid == glId
						});
						
						//Prevent infinite loops by checking where we've been
						if(gl.length == 0){
							console.log('Loading list: ' + glId);
							geeklists.push({objectid: glId});
							
							//TODO: Is not capturing return values ok? Is it proper form?	
							promises.push(getGeeklistData(geeklistid, glId, geeklists, boardgameStats, geeklistStats).fail(
								function(err){ 
									console.log("Error loading geeklist of geeklist:");
									console.log(err);
								}
							));
						}
						
						geeklistStat.numLists++;
				}
			});
			
			q.allSettled(promises).then(
				function(){
					//Should be
					//p.resolve(boardgameQueue);
					if(geeklistid === subgeeklistid){
						//TODO: Do top-level calculations such as average and median list length.
					}
					
					p.resolve({bgStats: boardgameStats, glStats: geeklistStats});
				},
				function(err){
					console.log(err);
					p.reject(err);
				}
			);
		}
	).fail(
		function(err){
			console.log(err);
		}
	);
	
	return p.promise	
}

function getBoardgameData(boardgameId){
	return db.getBoardgame(boardgameId).then(
		function(bg){
			//console.log(bg);
			return bg
		},
		function(){
			return bgg.getBoardgame(boardgameId) 
		}
	).catch(
		function(val){
			console.log("what??");
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
			p.push(getGeeklistData(geeklist.objectid, geeklist.objectid, [], [], []));
		});
		
		return q.allSettled(p)
	}
).spread(
	function(val){
		console.log("Saving boardgamestats");
		var geeklistId = val.value.glStats[0].objectid;
		var analysisDate = val.value.glStats[0].statDate;
		
		var pBgStats = db.deleteBoardgameStats(geeklistId, analysisDate).then(
			function(){
				return db.saveBoardgameStats(val.value.bgStats);
			}
		).fail(
			function(err){
				console.log("Error saving boardgame stats: " + err);
			}
		);
		
		//TODO: Implement median calculation for geeklists
		console.log("Saving geekliststats");
		var pGlStats = db.deleteGeeklistStats(geeklistId, analysisDate).then(
			function(){
				return db.saveGeeklistStats(val.value.glStats);
			}
		).fail(
			function(err){
				console.log("Error saving geeklist stats: " + err);
			}
		);
		
		return q.all([pBgStats, pGlStats]).then(function(){
				return val.value.bgStats
			});
		//TODO: Look up board game static, update static that is by some criterion incomplete.
		
		//TODO: Add most recent stats to boardgame object and save.
	},
	function(err){
		console.log("Error occurred:");
		console.log(err);
	}
).then(
	function(val){
		return q.all(val.map(function(bgStat){
				return getBoardgameData(bgStat.objectid).then(
					function(boardgame){
						console.log("Appending latest stats");
						//TODO: Need to append to geeklist array as well or change the model..
						var geeklist = boardgame.geeklists.filter(function(e){return e.objectid === bgStat.geeklistid});
						
						if(geeklist.length === 0){
							geeklist = {'objectid': bgStat.geeklistid, 'crets': moment().format("YYYY-MM-DD[T]HH:mm:SS"), 'latest': bgStat};
							boardgame['geeklists'].push(geeklist);
						}else{
							//There is only one latest per geeklist
							geeklist[0].latest = bgStat;
						}
						
						return boardgame
					},
					function(g){
						console.log("ERROR: Look up bg failed.");
						
						return false
					}
				).catch(function(e){
					console.log("ERROR caught in look up" + e);
				});
			})
		).then(
			function(boardgames){
				var filterValues = [];

				for(var i = 0; i < boardgames.length; i++){
					var boardgame = boardgames[i];
					
					for(var j=0; j < boardgame.geeklists.length; j++){
						var geeklistid = boardgame.geeklists[j].objectid;
						var fv = filterValues.filter(function(e){return e.objectid === geeklistid});
						var filterValue;
						
						if(fv.length === 0){
							filterValue =  {'type': 'filtervalue', 'analysisDate': currentDate, 'objectid': geeklistid, 'maxplaytime': -Infinity, 'minplaytime': Infinity, 'boardgamedesigner': [], 'boardgameartist': [], 'boardgamecategory': [], 'boardgamemechanic': []};
							filterValues.push(filterValue);
							console.log("created");
						}else{
							filterValue = fv[0];
							console.log("created");
						}
						
						filterValue.boardgameartist = boardgame.boardgameartist.reduce(function(prev, curr){
							console.log(curr);
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){
								return prev.concat(curr)
							}else{
								return prev
							}
						}, filterValue.boardgameartist);
						
						filterValue.boardgamedesigner = boardgame.boardgamedesigner.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){return prev.concat(curr)}else{return prev}
						}, filterValue.boardgamedesigner);
						
						filterValue.boardgamemechanic = boardgame.boardgamemechanic.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){return prev.concat(curr)}else{return prev}
						}, filterValue.boardgamemechanic);
						
						filterValue.boardgamecategory = boardgame.boardgamecategory.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){return prev.concat(curr)}else{return prev}
						}, filterValue.boardgamecategory);
						
						filterValue['maxplaytime'] = Math.max(filterValue['maxplaytime'], boardgame.maxplaytime || -Infinity);
						filterValue['maxplaytime'] = Math.max(filterValue['maxplaytime'], boardgame.playingtime || -Infinity);
						filterValue['minplaytime'] = Math.min(filterValue['minplaytime'], boardgame.minplaytime || Infinity);
						filterValue['minplaytime'] = Math.min(filterValue['minplaytime'], boardgame.playingtime || Infinity);
					}

					//console.log(filterValue);
				}
				
				return db.deleteFilterRanges(geeklistid, currentDate).then(function() {return db.saveFilterRanges(filterValues)}).then(function() { return boardgames});	
			}
		).then(
			function(boardgames){
				console.log("Saving all boardgames to DB.");
					
				return db.saveBoardgames(boardgames)
			}
		).catch(
			function(err){
				console.log("Uh-oh: ");
				console.log(err);
			}
		);
		
	},
	function(v){
		console.log("ERROR: Some stats failed to save!");
		
		return false
	}
).then(
	function(v){
		console.log("All done!");
		//console.log(v);
	}
);

/*
.then(
	//TODO: Calculate and save geeklist stats
	function(val){
		var bg_promises = [];
		
		boardgamesQueue.forEach(function(bg, idx){
			var p = getBoardgameData(bg.objectid).then(
				function(v){
					bg = v;
					
					//TODO: Add most recent stats to boardgame
					boardgameStats.filter(function(e){e.objectid === bg.objectid}).forEach(function(v, i){
						
					});
						
					boardgames.push(bg);
				});
							
			bg_promises.push(p);
		});
			
		return q.all(bg_promises)
	}
).then(
	function(){
		return db.saveBoardgames(boardgames) //, db.saveBoardgameStats(boardgameStats)]
	}

	//TODO: Delete same-date and save geeklistStats to database
	//TODO: Delete same-date and save boardgameStats to database
  	//TODO: Calculate geeklistSnapshotStats (mechanics breakdown, drilldowns).
	//TODO: Delete and save geeklistSnapshotStats
//).fail(
//	function(){
//		console.log("Something went wrong!");
//	}
).done(
	function(){
		boardgameStats.forEach(function(bg, idx){
			console.log(bg);
		});

		console.log(geeklistStats[0]);
		console.log("All done");
	}
);
*/

//Classes - just for reference
geeklist = function(){
	return {
		objectid: null,
		geeklistGroup: "",
		update: false
	}
}
