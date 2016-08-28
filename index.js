cheerio = require('cheerio');
q = require('q');
moment = require('moment');
fs = require('fs');

c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));
db = require('./db-couch');
bgg = require('./bgg.js');

var currentDate = moment().format(c.format.date)
var currentTime = moment().format(c.format.dateandtime)

function FilterValue(analysisDate, geeklistId){
	this.type = 'filtervalue';
	this.analysisDate = analysisDate;
	this.objectid = geeklistId;
	this.playingtime = {'min': Infinity, 'max': -Infinity}
	this.numplayers = {'min': Infinity, 'max': -Infinity}
	this.yearpublished = {'min': Infinity, 'max': -Infinity}
	//this.maxplaytime = -Infinity; 
	//this.minplaytime = Infinity;
	//this.maxplayers = -Infinity; 
	//this.minplayers = Infinity;
	//this.maxyearpublished = -Infinity; 
	//this.minyearpublished = Infinity;
	this.boardgamedesigner = []; 
	this.boardgameartist = [];
	this.boardgamecategory = []; 
	this.boardgamemechanic = [];
	this.boardgamepublisher = [];
}

function GeeklistStat(geeklistid, statDate){
	this.objectid = geeklistid;
	this.statDate = statDate;
	this.crets = moment().format(c.format.dateandtime);
	this.numLists =0;
	this.type = "geekliststat";
	this.depth = 0;
	this.numBoardgames = 0;
	this.avgListLength = 0;
	this.medListLength = 0;
	this.maxListLength = 0;
	this.minListLength = 0;
};

var boardgameStats = [];
var geeklistStats = [];

function getBoardgameStats(geeklistId){
	return boardgameStats.filter(function(e){
			return e.geeklistid == geeklistId
		});
}

function getGeeklistStats(geeklistId){
	
	return geeklistStats.filter(function(e){
		return e.objectid == geeklistId
	});
}

function getBoardgameStat(geeklistId, boardgameId, currentDate, postDate, editDate){
	var l = boardgameStats.filter(function(e){
		return e.objectid == boardgameId && e.geeklistid == geeklistId
	});
	var i;

	if(l.length === 0){
		i = new BoardgameStat(boardgameId, geeklistId, currentDate, postDate, editDate);
		boardgameStats.push(i);
	}else{
		i = l[0];
		
		//The first post defines creation time.
		if(Date.parse(i.postdate) > postDate){
			i.postdate = moment(postDate).format(c.format.dateandtime);
		}
		
		//The latest editdate is the one that is used.
		if(Date.parse(i.editdate) < editDate){
			i.editdate = moment(editDate).format(c.format.dateandtime);
		} 
	}

	return i
}

function getGeeklistStat(geeklistId, currentDate){
	var l = geeklistStats.filter(function(e){
		return e.objectid == geeklistId
	});
	var i;
		
	if(l.length === 0){
		i = new GeeklistStat(geeklistId, currentDate);
		geeklistStats.push(l);
	}else{
		i = l[0];
	}

	return i
}

function BoardgameStat(boardgameid, geeklistid, analysisdate, postdate, editdate){
	this.objectid = boardgameid;
	this.geeklistid = geeklistid;
	this.analysisDate = analysisdate;
	this.crets = moment().format(c.format.dateandtime);
	this.cnt = 0;
	this.thumbs = 0;
	this.type = "boardgamestat";
	this.hist = {}; //Histogram based on position
	this.postdate = moment(postdate).format(c.format.dateandtime);
	this.editdate = moment(editdate).format(c.format.dateandtime);
}

//XXX: Rewrite, should contain rootGeeklist, parentGeeklist, currentGeeklist, visitedGeeklists, boardgameStats, geeklistStats.
function getGeeklistData(geeklistid, subgeeklistid, geeklists, boardgameStats, geeklistStats, excluded){
	var p = q.defer();
	var promises = [];
	
	
	//Get the geeklistStats for parent list
	var geeklistStatList = geeklistStats.filter(function(e){
		return e.objectid == geeklistid
	});
	
	var geeklistStat;
	excluded = excluded || [];
		
	//XXX: Find out why this is just not passed as a single object to be updated 
	if(geeklistStatList.length === 0){
		geeklistStat = new GeeklistStat(geeklistid, currentDate);
		geeklistStats.push(geeklistStat);
	}else{
		geeklistStat = geeklistStatList[0];
	}
	
	
	//TODO: GeeklistStat for the parent list (should be root)
	//geeklistStat = getGeeklistStat(geeklistid, currentDate);
	
	//TODO: Most stats are broken.
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
						var postdate = Date.parse($(this).attr('postdate'));
						var editdate = Date.parse($(this).attr('editdate'));
						
							
						var bgStats = boardgameStats.filter(function(e){
							return e.objectid == bgId && e.geeklistid == geeklistid
						});
					
						var bgStat;
					
						if(bgStats.length === 0){
							bgStat = new BoardgameStat(bgId, geeklistid, currentDate, postdate, editdate);
							boardgameStats.push(bgStat);
						}else{
							bgStat = bgStats[0];
							
							//The first post defines creation time.
							if(Date.parse(bgStat.postdate) > postdate){
								bgStat.postdate = moment(postdate).format(c.format.dateandtime);
							}
							
							//The latest editdate is the one that is used.
							if(Date.parse(bgStat.editdate) < editdate){
								bgStat.editdate = moment(editdate).format(c.format.dateandtime);
							} 
						}
						
						//TODO:
						//var bgStat = getBoardgameStat(bgId, geeklistid, currentDate, postdate, editdate);
							
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
						
						var isExcluded = (excluded.filter(function(e){return e === parseInt(glId)}).length > 0);
							
						//Prevent infinite loops by checking where we've been
						if(gl.length === 0 && !isExcluded){
							console.log('Loading list: ' + glId);
							geeklists.push({objectid: glId});
							
							//TODO: Is not capturing return values ok? Is it proper form?	
							promises.push(getGeeklistData(geeklistid, glId, geeklists, boardgameStats, geeklistStats).fail(
								function(err){ 
									console.log("Error loading geeklist of geeklist:");
									console.log(err);
								}
							));
						}else if(isExcluded){
							console.log(glId + " is excluded");	
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
					//p.resolve({bgStats: getBoardgameStats(), glStats: getGeeklistStats()});
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

function getBoardgameData(boardgameIds){
	var boardgames = [];
	var p = [];
	var bggList = [];
	var pBGG = [];	
	
	//console.log(boardgameIds);
	 
	boardgameIds.forEach(function(boardgameId){	
		p.push(db.getBoardgame(boardgameId).then(
			function(bg){
				/*
				TODO:
				if(!bg.isComplete()){
					bggList.push(bg.objectid);
				}
				*/
				
				boardgames.push(bg);
				return true
			},
			function(bgId){
				bggList.push(bgId);
				return false
			}
		));
	});
	
	return q.allSettled(p).then(
		function(){
			var p = [];
			var idList = [];
			
			for(i = 0; i < bggList.length; i++){
				idList.push(bggList[i]);
					
				if(idList.length === 100 || (bggList.length-1) === i){
					var idBatch = Math.floor(idList.length / 100);
					console.log("Looking up boardgames " + (idBatch + 1) + " - " + ((idBatch + 1)*100));
						
					p.push(bgg.getBoardgame(idList.join(",")));
					idList = [];
				}
			}

			return q.all(p).then(
				function(a){
					a.forEach(
						function(e){
							e.forEach(
								function(b){
									boardgames.push(b);	
								}
							);
						}
					);
					return boardgames	
				}
			)
		}
	).catch(
		function(val){
			console.log("what??");
			//console.log(val);
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
			p.push(getGeeklistData(geeklist.objectid, geeklist.objectid, [], [], [], geeklist.excluded));
		});
		console.log("Num lists: " + p.length)	
		return q.allSettled(p)
	}
).then(
	function(results){
		var pBgStats = [];
		var pGlStats = [];
		var bgStats = [];
		
		
		results.forEach(function(r){
			//glStats[0] is the main list
			var geeklistId = r.value.glStats[0].objectid;
			var analysisDate = r.value.glStats[0].statDate;
			
			bgStats = bgStats.concat(r.value.bgStats);
			
			console.log("Saving boardgamestats");
			pBgStats.push(
				db.deleteBoardgameStats(geeklistId, analysisDate).then(
					function(){
						return db.saveBoardgameStats(r.value.bgStats);
					}
				).fail(
					function(err){
						console.log("Error saving boardgame stats: " + err);
						throw err
					}
				)
			);
			
			//TODO: Implement median calculation for geeklists
			console.log("Saving geekliststats");
			pGlStats.push(
				db.deleteGeeklistStats(geeklistId, analysisDate).then(
					function(){
						return db.saveGeeklistStats(r.value.glStats);
					}
				).fail(
					function(err){
						console.log("Error saving geeklist stats: " + err);
					}
				)
			);

			console.log("Done saving stats");
		
		});
		
		return q.all(pBgStats.concat(pGlStats)).then(
			function(){
				return bgStats
			}).catch(
				function(err){
					console.log("Error in stats saving");
					console.log(err);
	
					throw err
				}
			)
	},
	function(err){
		console.log("Error occurred:");
		console.log(err);
		throw err
	}
).then(
	function(bgStats){
		return getBoardgameData(bgStats.map(
				function(e){return e.objectid}
			).reduce(
				function(prev, curr){
					if(prev.indexOf(curr) === -1){
						return prev.concat(curr)
					}else{
						return prev
					}
				},
				[]
			)
		).then(
			function(boardgames){
				boardgames.forEach(function(boardgame){
					bgStats.filter(function(e){return e.objectid === boardgame.objectid}).forEach(function(bgStat){
						var geeklist = boardgame.geeklists.filter(function(e){return e.objectid === bgStat.geeklistid});
							
						if(geeklist.length === 0){
							geeklist = {'objectid': bgStat.geeklistid, 'crets': moment(bgStat.postdate).format(c.format.dateandtime), 'latest': bgStat};
							boardgame['geeklists'].push(geeklist);
						}else{
							//There is only one latest per geeklist per boardgame
							geeklist[0].latest = bgStat;
						}
					});
				});

				return boardgames
			},
			function(err){
				console.log("Couldn't find boardgame in db or bgg..");
				console.log(err);

				throw err
			}
		).catch(
			function(err){
				console.log("Caught error bg lookup..");
				console.log(err);
				
				throw err
			}
		)
	}
).then(
	function(boardgames){
		var filterValues = [];
		var geeklists = [];
		
		console.log("Saving filtervalues");	
		for(var i = 0; i < boardgames.length; i++){
			var boardgame = boardgames[i];
			
			for(var j=0; j < boardgame.geeklists.length; j++){
				var geeklistid = boardgame.geeklists[j].objectid;
				var fv = filterValues.filter(function(e){return e.objectid === geeklistid});
				var filterValue;
				
				if(geeklists.indexOf(geeklistid) === -1){
					geeklists.push(geeklistid);
				}
					
				if(fv.length === 0){
					filterValue = new FilterValue(currentDate, geeklistid);
					filterValues.push(filterValue);
				}else{
					filterValue = fv[0];
				}

				['boardgameartist', 'boardgamedesigner', 'boardgamecategory', 'boardgamemechanic', 'boardgamepublisher'].forEach(function(prop){
					filterValue[prop] = boardgame[prop].reduce(function(prev, curr){
						if(prev.filter(function(e){return e.objectid === curr.objectid}).length === 0){
							return prev.concat(curr)
						}else{
							return prev
						}
					}, filterValue[prop]).sort(function(a, b){return (a.name > b.name)});
				});
				
				filterValue.playingtime.max = Math.max(filterValue.playingtime.max, boardgame.maxplaytime || -Infinity, boardgame.playingtime || -Infinity);
				filterValue.playingtime.min = Math.min(filterValue.playingtime.min, boardgame.minplaytime || Infinity, boardgame.playingtime || Infinity);
				filterValue.numplayers.max = Math.max(filterValue.numplayers.max, boardgame.maxplayers || -Infinity);
				filterValue.numplayers.min = Math.min(filterValue.numplayers.min, boardgame.minplayers || Infinity);
				
				filterValue.yearpublished.max = Math.max(filterValue.yearpublished.max, boardgame.yearpublished || -Infinity);
				filterValue.yearpublished.min = Math.min(filterValue.yearpublished.min, boardgame.yearpublished || Infinity);
			}
		}
		
		var p = [];

		geeklists.forEach(function(geeklistid){
			//console.log(geeklistid);	
			p.push(db.deleteFilterRanges(geeklistid, currentDate).then(
				function() {
					var fv = filterValues.filter(function(e){return e.objectid === geeklistid});
					
					return db.saveFilterRanges([fv[0]]).then(
						function() { 
							//TODO: Could return anything.
							return boardgames
						},
						function(err){
							console.log("Failed to save some stats");
							console.log(err);
						}
					)
				}
			));
		});

		console.log("Done saving filtervalues");	
		return q.allSettled(p).then(function(){ return boardgames })
	}
).then(
	function(boardgames){
		console.log("Saving all boardgames to DB.");
			
		return db.saveBoardgames(boardgames).then(
				function(){
					console.log("Updating search engine");
					
					return db.updateSearch(boardgames)
				}
			).fail(
			function(err){
				console.log("Failed to have some boardgames");
				console.log(err);
			}
		)
	}
).then(
	function(v) { 
		return db.finalizeDb()
	}
).then(
	function(v){
		console.log("All done!");
		return true
	}
).catch(
	function(e){
		console.log(e);
	}
);
