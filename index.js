var cheerio = require('cheerio');
var q = require('q');
var moment = require('moment');
var fs = require('fs');

var bgg = require('./bgg.js');
var datamgr = require('./datamgr.js');
var logger = require('./logger.js');

var c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));

process.title = 'glaze';

var currentDate = moment().format(c.format.date)
var currentTime = moment().format(c.format.dateandtime)

var args = {};
var boardgameStats = [];
var geeklistStats = [];
var geeklists = [];

/*MAIN*/
//Read args
for(i = 2; i < process.argv.length; i++){
	var arg = process.argv[i].split("=");
	
	if(arg.length > 1){
		//All others are parameters
		args[arg[0].toLowerCase()] = arg[1].toLowerCase().split(",").map(parseInt);
	}else{
		//First arg is action
		args[arg[0].toLowerCase()] = true;
	}
}

if(args['update_search']){
	logger.info("Updating search engine");
	
	datamgr.getBoardgames().then(
		function(boardgames){
			return datamgr.updateSearch(boardgames.map(r => r.doc))
		}
	).catch(
		function(err){
			logger.error("Failed in saving db/search engine step.");
			logger.error(err);
				
			throw err
		}
	)
}else if(args['update_static']){
	logger.info("Updating bordgame static");
	
	new Promise(function(resolve, reject){
		if(!args['lists']){
			resolve(datamgr.getBoardgames());
		}else{
			resolve(datamgr.getGeeklist(args['lists'], 0, 10000));
		}
	}).then(
		function(boardgames){
			var ids = boardgames.map(r => r.doc.objectid);
			logger.info("Found " + ids.length + " boardgames to update.");
			//1. Forcefully tell datamgr to load boardgame data from BGG
			//2. Merge boardgame most recent from 
		}
	).catch(
		function(err){
			logger.error("Failed to update static");
			logger.error(err);

			throw err
		}	
	);
}else if(args['sync_lists']){
	logger.info("Loading geeklists");
	
	//Process geeklists
	datamgr.getGeeklists(true, false, args['lists']).then(
		function(loadedGeeklists){
			var p = [];
				
			if(loadedGeeklists.length > 0){		
				loadedGeeklists.forEach(function(geeklist, i){
					
					//Only run lists that are provided at the commandline, or all with update === true if none is given.
					//if(!args['lists'] || args['lists'].indexOf(parseInt('' + geeklist.objectid)) > -1){
					geeklists.push(geeklist);
						
					//p.push(getGeeklistData(geeklist.objectid, geeklist.objectid, [], [], [], geeklist.excluded, geeklist.saveObservations));
					p.push(getGeeklistData(geeklist.type, geeklist.objectid, geeklist.objectid, new Set(), [], [], geeklist.excluded, geeklist.saveObservations));
					//}
				});
				
				return q.allSettled(p)
			}else{
				return Promise.reject("No lists to sync!");
			}
		}
	).then(
		function(results){
			return saveStats(results.filter((v) => v.value).map((v) => v.value))
		},
		function(err){
			logger.error("Error occurred:");
			logger.error(err);
			throw err
		}
	).then(
		function(bgStats){
			logger.info("Loading boardgame data");
			
			var boardgameIdList = bgStats.map(function(e){return e.objectid}).reduce(
				function(prev, curr){
					if(prev.indexOf(curr) === -1){
						return prev.concat(curr)
					}else{
						return prev
					}
				},
				[]
			);
			
			return loadBoardgames(boardgameIdList, bgStats)	
		}
	).then(
		function(boardgames){
			logger.info("Saving all boardgames to DB.");
				
			return datamgr.saveBoardgames(boardgames).then(
				function(){
					return boardgames
				}
			).fail(
				function(e){
					console.log(e)
				}
			)
			/*
			return datamgr.saveBoardgames(boardgames).then(
				//	function(){
				//		logger.info("Running update function in CouchDB for stats");
				//		return datamgr.updateBoardgameStats([boardgames[0].geeklists[0].latest]);
				//	}
				//).then(
					function(){
						logger.info("Updating search engine");
						return datamgr.updateSearch(boardgames);
					}
				).catch(
					function(err){
						logger.error("Failed in saving db/search engine step.");
						logger.error(err);
					}
				)
			*/
		}
	).then(
		function(boardgames){
			logger.info("Updating search engine");
			
			return datamgr.updateSearch(boardgames).catch(
				function(err){
					logger.error("Failed in saving db/search engine step.");
					logger.error(err);
					
					throw err
				}
			)
		}
	).then(
		function(){
			logger.info("Generating static filter values.");
			return q.allSettled(geeklists.map(generateFilterValues)).then(
				function(){ 
					logger.info("Done saving filtervalues");	
					return true 
				}
			)
		}
	).then(
		function(v) { 
			return datamgr.finalizeDb()
		}
	).then(
		function(v){
			var startTime = moment(currentTime, c.format.dateandtime);
			var now = moment();
			
			var timeTaken = moment(moment.duration(now.diff(startTime))).format("hh:mm:ss");
			logger.info("All done in " + timeTaken);
			return true
		}
	).catch(
		function(e){
			logger.error(e);
		}
	);
}else{
	logger.error("You need to specify sync_lists or update_search as an argument");
}
/* END OF MAIN */

function FilterValue(analysisDate, geeklistId){
	this.type = 'filtervalue';
	this.analysisDate = analysisDate;
	this.objectid = geeklistId;
	this.playingtime = {'min': Infinity, 'max': -Infinity}
	this.numplayers = {'min': Infinity, 'max': -Infinity}
	//this.yearpublished = {'min': Infinity, 'max': -Infinity}
	this.yearpublished = [];
	this.boardgamedesigner = []; 
	this.boardgameartist = [];
	this.boardgamecategory = []; 
	this.boardgamemechanic = [];
	this.boardgamepublisher = [];
	this.boardgamefamily = [];
}

function BoardgameStat(boardgameid, geeklistid, analysisdate, postdate, editdate){
	this.objectid = "" + boardgameid;
	this.geeklistid = geeklistid;
	this.analysisDate = analysisdate;
	this.crets = moment().format(c.format.dateandtime);
	this.cnt = 0;
	this.thumbs = 0;
	this.type = "boardgamestat";
	this.hist = {}; //Histogram based on position
	this.obs = [];
	this.postdate = moment(postdate).format(c.format.dateandtime);
	this.editdate = moment(editdate).format(c.format.dateandtime);
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

function Geeklist(geeklistid, crets, latest){
	this.objectid = geeklistid;
	this.crets = crets;
	this.latest = latest;
};

//This loads boardgame static and appends stats. Should be refactored into two..
function loadBoardgames(boardgameIdList, bgStats){
	//TODO: Aggregate some info on how many new, updated, etc.. Segmented on geeklist.
	return datamgr.getBoardgameData(boardgameIdList).then(
		function(boardgames){
			//Populate the latest geeklist stat for each boardgame
		
			logger.info("Adding most recent stats to boardgame data");
			
			return addBoardgameStats(boardgames, bgStats)

			/*
			boardgames.forEach(function(boardgame){
				bgStats.filter(function(e){return e.objectid === boardgame.objectid}).forEach(function(bgStat){
					
					var geeklist = boardgame.geeklists.filter(function(e){return e.objectid === bgStat.geeklistid});
						
					if(geeklist.length === 0){
						geeklist = {'objectid': bgStat.geeklistid, 'crets': moment(bgStat.postdate).format(c.format.dateandtime), 'latest': bgStat};
						//geeklist = new Geeklist(bgStat.geeklistid, moment(bgStat.postdate).format(c.format.dateandtime), bgStat);
						boardgame['geeklists'].push(geeklist);
					}else{
						//There is only one latest per geeklist per boardgame
						geeklist[0].latest = bgStat;
					}
				});
			});

			return boardgames
			*/
		},
		function(err){
			logger.error("Couldn't find boardgame in db or bgg..");
			logger.error(err);

			throw err
		}
	).catch(
		function(err){
			logger.error("Caught error bg lookup..");
			logger.error(err);
			
			throw err
		}
	)
}

//There will be a warning if a boardgame does not have any corresponding stats
function addBoardgameStats(boardgames, boardgamesStats){
	return q.Promise(function(resolve, reject){
		console.log("Appending stats to " + boardgames.length + " boardgames");
		boardgames.forEach(function(boardgame){
			let boardgameStats = boardgamesStats.filter(e => (parseInt(e.objectid) === parseInt(boardgame.objectid)));
			
			if(boardgameStats.length === 0){
				logger.warn("No stats found for boardgame object id " + boardgame.objectid);
			}
			
			boardgameStats.forEach(function(s){
					if(boardgame.geeklists === undefined){
						boardgame['geeklists'] = [];
						//console.log(boardgame.objectid + " Zing!");
					}

					var geeklist = boardgame.geeklists.filter(e =>  (parseInt(e.objectid) === parseInt(s.geeklistid)));
						
					if(geeklist.length === 0){
						geeklist = {
										'objectid': s.geeklistid, 
										'crets': moment(s.postdate).format(c.format.dateandtime), 
										'latest': s
						};
						
						boardgame['geeklists'].push(geeklist);
					}else{
						//There is only one latest per geeklist per boardgame
						geeklist[0].latest = s;
					}
				});
			});

			resolve(boardgames);
	})
}

function saveStats(stats){
	var p = [];
	var bgStats = [];
	var n = 0;
	
	logger.info("Saving stats");
	stats.forEach(function(r){
		var geeklistId = r.glStats[0].objectid;
		var analysisDate = r.glStats[0].statDate;
		
		bgStats = bgStats.concat(r.bgStats);
		
		p.push(
			datamgr.deleteBoardgameStats(geeklistId, analysisDate).then(
				function(){
					return datamgr.saveBoardgameStats(r.bgStats);
				}
			).fail(
				function(err){
					logger.error("Error saving boardgame stats: " + err);
					throw err
				}
			)
		);
		
		//TODO: Implement median calculation for geeklists
		p.push(
			datamgr.deleteGeeklistStats(geeklistId, analysisDate).then(
				function(){
					logger.debug("Saving glStat for " + geeklistId);
					return datamgr.saveGeeklistStats(r.glStats);
				}
			).fail(
				function(err){
					logger.error("Error saving geeklist stats: " + err);
					
					throw err
				}
			)
		);
	});
	
	return q.all(p).then(
		function(){
			console.log("Done saving stats");
			return bgStats
		}
	).catch(
		function(err){
			console.log("Error in stats saving");
			console.log(err);

			throw err
		}
	);
}

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

/*
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
*/

function updateBoardgameStat(e, boardgameStats, rootGeeklistId, geeklistId){
	var bgStat;
	/*
	var itemId = xmlObj.attr('id');
	var bgId = xmlObj.attr('objectid');
	var thumbs = parseInt(xmlObj.attr('thumbs'));
	var postdate = Date.parse(xmlObj.attr('postdate'));
	var editdate = Date.parse(xmlObj.attr('editdate'));
	*/
	
	var itemId = e.id;
	var bgId = e.objectid;
	var thumbs = parseInt(e.thumbs);
	var postdate = Date.parse(e.postdate);
	var editdate = Date.parse(e.editdate);
	
	var bgStats = boardgameStats.filter((e) => (e.objectid == bgId && e.geeklistid == rootGeeklistId));

	if(bgStats.length === 0){
		bgStat = new BoardgameStat(bgId, rootGeeklistId, currentDate, postdate, editdate);
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
	bgStat.obs.push({'geeklist': geeklistId, 'id': itemId});
}

//XXX: Rewrite, should contain rootGeeklist, parentGeeklist, currentGeeklist, visitedGeeklists, boardgameStats, geeklistStats.
function getGeeklistData(listtype, geeklistid, subgeeklistid, visitedGeeklists, boardgameStats, geeklistStats, excluded, saveObs){
	var p = q.defer();
	var promises = [];
	
	excluded = excluded || [];
	saveObs = saveObs || false;
	
	/*	
	var geeklistStat = geeklistStats.get(geeklistid);
		
	if(geeklistStat === undefined){
		geeklistStat = new GeeklistStat(geeklistid, currentDate);
		geeklistStats.set(geeklistid, geeklistStat);
	}
	*/
	
	//Get the geeklistStats for parent list
	var geeklistStatList = geeklistStats.filter(function(e){
		return e.objectid == geeklistid
	});
	
	var geeklistStat;
	excluded = excluded || [];
	saveObs = saveObs || false;
		
	//XXX: Find out why this is just not passed as a single object to be updated 
	if(geeklistStatList.length === 0){
		geeklistStat = new GeeklistStat(geeklistid, currentDate);
		geeklistStats.push(geeklistStat);
	}else{
		geeklistStat = geeklistStatList[0];
	}
	
	//TODO: Most stats are broken.
	//Populate geeklist stats
	geeklistStat.depth += 1;
	
	//Load the list from BGG
	bgg.getGeeklist(listtype, subgeeklistid).then(
		function(res){
			res.forEach(function(e){
				if(e.objecttype === 'thing'){
					if(e.subtype === 'boardgame'){
						updateBoardgameStat(e, boardgameStats, geeklistid, subgeeklistid)
						
						geeklistStat.numBoardgames++;
					}
				}else if(e.objecttype === 'geeklist'){
					let isExcluded = (excluded.indexOf(e.objectid) > -1);
					
					if(!visitedGeeklists.has(e.objectid) && !isExcluded){
						logger.debug('Loading sublist: ' + e.objectid);
						visitedGeeklists.add(e.objectid);
							
						promises.push(
							getGeeklistData("geeklist", geeklistid, e.objectid, visitedGeeklists, boardgameStats, geeklistStats, excluded).then(
								function(v){
									("Promise resolved: " + e.objectid);
								},
								function(err){ 
									logger.error("Error loading sublist:");
									logger.error(err);

									throw err
								}
							)
						);
					}else if(isExcluded){
						logger.debug(glId + " is excluded");	
					}
					
					geeklistStat.numLists++;
				}
			});
			
			/*
			var $ = cheerio.load(res);
			
				
			$('item').each(function(index, element){
				if($(this).attr('objecttype') == 'thing'){
					if($(this).attr('subtype') == 'boardgame'){
						updateBoardgameStat($(this), boardgameStats, geeklistid, subgeeklistid)
						
						geeklistStat.numBoardgames++;
					}
				}else if($(this).attr('objecttype') == 'geeklist'){
						var glId = parseInt($(this).attr('objectid'));
						var isVisited = visitedGeeklists.has(glId);
						var isExcluded = (excluded.indexOf(glId)>-1);
							
						//Prevent infinite loops by checking where we've been
						if(!isVisited && !isExcluded){
							logger.debug('Loading sublist: ' + glId);
							visitedGeeklists.add(glId);
							
							//TODO: Is not capturing return values ok? Is it proper form?	
							promises.push(getGeeklistData("geeklist", geeklistid, glId, visitedGeeklists, boardgameStats, geeklistStats, excluded).then(
								function(v){
									("Promise resolved: " + glId);
								},
								function(err){ 
									logger.error("Error loading sublist:");
									logger.error(err);

									throw err
								}
							));
						}else if(isExcluded){
							logger.debug(glId + " is excluded");	
						}
						
						geeklistStat.numLists++;
				}
			});
			*/

			q.allSettled(promises).then(
				function(){
					logger.debug("All subpromises of " + subgeeklistid + " resolved." + promises.length + " in total.");
					//Should be
					//p.resolve(boardgameQueue);
					if(geeklistid === subgeeklistid){
						//TODO: Do top-level calculations such as average and median list length.
					}
						
					p.resolve({bgStats: boardgameStats, glStats: geeklistStats});
					//p.resolve({bgStats: getBoardgameStats(), glStats: getGeeklistStats()});
				},
				function(err){
					//logger.error("Here it comes 2");
					logger.error(err);
					p.reject(err);
				}
			);
		}
	).catch(
		function(err){
			logger.error(err);
			
			p.reject(err);	
			throw err
		}
	);
	
	return p.promise	
}


function generateFilterValues(geeklist){
	var geeklistid = geeklist.objectid;
	var filterValue = new FilterValue(currentDate, geeklistid);
	
	//logger.info("Generating geeklist filtervalues for " + geeklistid);
	return datamgr.getGeeklistFiltersComponents(geeklistid).then(
		function(comp){
			var keys = [];
			for(var j=0; j < comp.length; j++){
				var f = comp[j].key[1];
				var v = comp[j].key[2];

				filterValue[f].push(v);
				
				if(keys.indexOf(f) === -1){
					keys.push(f);
				}
			}
			
			//Sorting
			keys.forEach(function(k){
				
				if(filterValue[k].length > 0 && typeof filterValue[k][0] === "object"){
					//console.log(filterValue[k]);
					filterValue[k].sort(function(a, b){
							if(a.name.toUpperCase() < b.name.toUpperCase()){
								return -1
							}else{
								return 1
							}
						});
				}
			});
				
			return datamgr.getGeeklistFiltersMinMax(geeklistid) 	
		}
	).then(
		function(minmax){
			for(var j=0; j < minmax.length; j++){
				var f = minmax[j].key[1];
				
				filterValue[f].min = minmax[j].value.min;
				filterValue[f].max = minmax[j].value.max;
			}

			return filterValue
		}
	).then(
		function(fv){
			//logger.info("Deleting old filter values..");
			return datamgr.deleteFilterRanges(fv.objectid, fv.analysisDate).then(function(){return fv})
		}
	).then(
		function(fv){
			//logger.info("Saving new filter values");
			return datamgr.saveFilterRanges([fv]).then(function(){return true})
		}
	).catch(
		function(err){
			logger.error("Failed to save filter");
			logger.error(err);
		}
	);
}


