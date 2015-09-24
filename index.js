cheerio = require('cheerio');
q = require('q');
moment = require('moment');

db = require('./db-couch');
bgg = require('./bgg.js');

var currentDate = moment().format("YYYY-MM-DD")
var currentTime = moment().format("YYYY-MM-DD[T]HH:mm:ss")

function FilterValue(analysisDate, geeklistId){
	this.type = 'filtervalue';
	this.analysisDate = analysisDate;
	this.objectid = geeklistId;
	this.maxplaytime = -Infinity; 
	this.minplaytime = Infinity;
	this.boardgamedesigner = []; 
	this.boardgameartist = [];
	this.boardgamecategory = []; 
	this.boardgamemechanic = [];
	this.boardgamepublisher = [];
}

function GeeklistStat(geeklistid, statDate){
	this.objectid = geeklistid;
	this.statDate = statDate;
	this.crets = moment().format("YYYY-MM-DD[T]HH:mm:ss");
	this.numLists =0;
	this.type = "geekliststat";
	this.depth = 0;
	this.numBoardgames = 0;
	this.avgListLength = 0;
	this.medListLength = 0;
	this.maxListLength = 0;
	this.minListLength = 0;
};

function BoardgameStat(boardgameid, geeklistid, analysisdate){
	this.objectid = boardgameid;
	this.geeklistid = geeklistid;
	this.analysisDate = analysisdate;
	this.crets = moment().format("YYYY-MM-DD[T]HH:mm:ss");
	this.cnt = 0;
	this.thumbs = 0;
	this.type = "boardgamestat";
	this.hist = {}; //Histogram based on position
}

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
		/*
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
		*/
		geeklistStat = new GeeklistStat(geeklistid, currentDate);
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
							/*
							bgStat = {
								objectid: bgId,
								geeklistid: geeklistid,
								analysisDate: currentDate,
								crets: moment().format("YYYY-MM-DD[T]HH:mm:ss"),
								cnt: 0,
								thumbs: 0,
								type: "boardgamestat",
								hist: {} //Histogram based on position
							}
							*/
							bgStat = new BoardgameStat(bgId, geeklistid, currentDate);
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
db.getGeeklists(true, false).then(
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
					//TODO: Rewrite to send multiple boardgames at once.
					function(boardgame){
						console.log("Appending latest stats");
						//TODO: Need to append to geeklist array as well or change the model..
						var geeklist = boardgame.geeklists.filter(function(e){return e.objectid === bgStat.geeklistid});
						
						if(geeklist.length === 0){
							geeklist = {'objectid': bgStat.geeklistid, 'crets': moment().format("YYYY-MM-DD[T]HH:mm:ss"), 'latest': bgStat};
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
							filterValue = new FilterValue(currentDate, geeklistid);
							filterValues.push(filterValue);
						}else{
							filterValue = fv[0];
						}
						
						filterValue.boardgameartist = boardgame.boardgameartist.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){
								return prev.concat(curr)
							}else{
								return prev
							}
						}, filterValue.boardgameartist).sort(function(a, b){return (a.name < b.name)});
						
						filterValue.boardgamedesigner = boardgame.boardgamedesigner.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){return prev.concat(curr)}else{return prev}
						}, filterValue.boardgamedesigner).sort(function(a, b){return (a.name < b.name)});
						
						filterValue.boardgamemechanic = boardgame.boardgamemechanic.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){return prev.concat(curr)}else{return prev}
						}, filterValue.boardgamemechanic).sort(function(a, b){return (a.name < b.name)});
						
						filterValue.boardgamecategory = boardgame.boardgamecategory.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){return prev.concat(curr)}else{return prev}
						}, filterValue.boardgamecategory).sort(function(a, b){return (a.name < b.name)});
						
						filterValue.boardgamepublisher = boardgame.boardgamepublisher.reduce(function(prev, curr){
							if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){return prev.concat(curr)}else{return prev}
						}, filterValue.boardgamepublisher).sort(function(a, b){return (a.name < b.name)});
						
						filterValue.maxplaytime = Math.max(filterValue.maxplaytime, boardgame.maxplaytime || -Infinity, boardgame.playingtime || -Infinity);
						filterValue.minplaytime = Math.min(filterValue.minplaytime, boardgame.minplaytime || Infinity, boardgame.playingtime || Infinity);
					}
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
	function(v) { return db.finalizeDb()}
).then(
	function(v){
		console.log("All done!");
	}
).catch(
	function(e){
		console.log(e);
	}
);
