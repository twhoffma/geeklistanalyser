var cheerio = require('cheerio');
var q = require('q');
var moment = require('moment');
var fs = require('fs');

var bgg = require('./bgg.js');
var datamgr = require('./datamgr.js');
var logger = require('./logger.js');

var c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));

process.title = 'glaze';

var startTime = moment();
var currentDate = moment().format(c.format.date);
var currentTime = moment().format(c.format.dateandtime);

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
		
		if(arg[0].toLowerCase() === "lists"){
			args[arg[0].toLowerCase()] = arg[1].toLowerCase().split(",").map(parseInt);
		}else{
			args[arg[0].toLowerCase()] = arg[1].toLowerCase();
		}
	}else{
		//First arg is action
		args[arg[0].toLowerCase()] = true;
	}
}

//Load geeklists and execute
datamgr.getGeeklists(true, false, args['lists']).then(
	function(geeklists){
		var action = "";

		if(args['update_search']){
			action = "update_search";
		}else if(args['generate_filters']){
			action = "generate_filters";
		}else if(args['update_static']){
			action = "update_static";
		}else if(args['sync_lists']){
			action = "sync_lists";
		}
		
		logger.debug("Loaded " + geeklists.length + " geeklists");	
		return runAction(action, geeklists).catch(function(e){
			logger.error("runAction failed");
			logger.error(e);
		})
	}
);

function runAction(action, geeklists){
	switch(action){
		case 'update_search': 
			return updateSearch()
			break;
		case 'generate_filters':
			return generateFilters(geeklists)
			break;
		case 'update_static':
			return updateStatic(geeklists)
			break;
		case 'sync_lists':
			return syncLists(geeklists) 
			break;
		default:
			return Promise.reject("Invalid action. Must be update_search,generate_filters,update_static or sync_lists.")
	}	
} 

function updateSearch(){
	logger.info("Updating search engine");
	
	return datamgr.getBoardgames().then(
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
}

function generateFilters(geeklists){
	logger.info("Generating static filter values.");
	return q.allSettled(geeklists.map(generateFilterValues)).then(
		function(){ 
			logger.info("Done saving filtervalues");	
			return true 
		}
	)
}

//TODO: This cannot be intertwined with regular sync_list run since it reloads stuff from database, which during run will be stale.
function updateStatic(geeklists){
	logger.info("Updating bordgame static");
	
	new Promise(function(resolve, reject){
		if(!args['lists']){
			resolve(datamgr.getBoardgames().then(x=>x.map(b=>b.doc)));
		}else{
			resolve(datamgr.getGeeklist(args['lists'], 0, 10000).then(x=>x.map(y=>y.doc)));
		}
	}).then(
		function(dbBoardgames){
			//var ids = dbBoardgames.map(r => r.doc.objectid);
			var ids = dbBoardgames.map(r => r.objectid);
			logger.info("Found " + ids.length + " boardgames to update.");
			//1. Forcefully tell datamgr to load boardgame data from BGG
			return datamgr.getBoardgameData(ids, "bgg").then(
				function(bggBoardgames){
					logger.info("Got " + bggBoardgames.length + " games from BGG");
					
					var bgStats = dbBoardgames.map(b=>b.geeklists).map(gl=>gl.latest);
					//console.log(bgStats[0]);
					var updBoardgames = [];
					
					bggBoardgames.forEach(function(newBg){
						let oldBg = dbBoardgames.filter(x=>parseInt(x.objectid) === parseInt(newBg.objectid))[0];
						
						if(typeof(oldBg) === "undefined"){
							logger.error("" + newBg.objectid + " was not found in old boardgames, although it was returned by BGG");
						}else{
							newBg["_id"] = oldBg._id;
							newBg["_rev"] = oldBg._rev;
							newBg.geeklists = oldBg.geeklists;
						
							updBoardgames.push(newBg);
						}
					});
					
					/*	
					console.log("---- DB bg: ----\n\n");
					console.log(dbBoardgames[0]);
					console.log("---- BGG bg: ----\n");
					console.log(updBoardgames.filter(x=>parseInt(x.objectid) === parseInt(dbBoardgames[0].objectid))[0]);
					*/
					
					logger.info("Saving all updated boardgames to DB.");
				
					return datamgr.saveBoardgames(updBoardgames).then(
						function(){
							return true
						}
					).fail(
						function(e){
							console.log(e)
						}
					)
				}
			)

			//2. Merge boardgame most recent from 
			//return loadBoardgames(boardgameIdList).then(boardgames=>addBoardgameStats(boardgames, bgStats))	
		}
	).catch(
		function(err){
			logger.error("Failed to update static");
			logger.error(err);

			throw err
		}	
	);
}

function syncLists(loadedGeeklists){
	logger.info("Loading geeklists");
	
	return new Promise(function(resolve, reject){
			var p = [];
				
			if(loadedGeeklists.length > 0){		
				loadedGeeklists.forEach(function(geeklist, i){
					
					//Only run lists that are provided at the commandline, or all with update === true if none is given.
					geeklists.push(geeklist);
						
					p.push(getGeeklistData(geeklist.type, geeklist.objectid, geeklist.objectid, new Set(), [], [], geeklist.excluded, geeklist.saveObservations));
				});
				
					
				return resolve(q.allSettled(p))
			}else{
				return reject("No lists to sync. Any found were inactive..");
			}
		}
	).then(
		//TODO: We do not atm use stats for anything, so might as well not save them?
		function(results){
			logger.debug("Saving stats");
			
			//The previous step return several promises, so filter out the ones that resolved.
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
				
			return loadBoardgames(boardgameIdList).then(boardgames=>addBoardgameStats(boardgames, bgStats))	
		}
	).then(
		function(boardgames){
			logger.info("Saving all boardgames to DB.");
				
			return datamgr.saveBoardgames(boardgames).then(
				/*
				function(){
					return boardgames
				}
				*/
				x => q(boardgames)
			).fail(e => q.Reject(e))
			
			
			/*
			//TODO: Implement partial update functions in couchDB
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
		//TODO: Refactor
		function(boardgames){
			let rssLists = geeklists.filter(x=>(x.rss || false));
			
			var xmlEscape = (nm => nm.replace(/&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&apos;'));
			
			logger.info("Generating rss for " + rssLists.length + " lists");
			moment.locale("en");
			rssLists.forEach(function(r){
				var l = boardgames.filter(x=>x.geeklists.filter(y=>y.objectid === r.objectid).length > 0);
				
				var sortFn = {
					'crets': function(a,b){
						let aCrets = a.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.postdate;
						let aDate = moment(aCrets).toDate();
						let bCrets = b.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.postdate;
						let bDate = moment(bCrets).toDate();
						
						return -1 * (aDate < bDate ? -1 : 1)
					},
					'thumbs': function(a,b){
						let aThumbs = parseInt(a.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.thumbs || 0);
						let bThumbs = parseInt(b.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.thumbs || 0);
						
						return -1 * (aThumbs < bThumbs ? -1 : 1)
					},
					'cnt': function(a,b){
						let aDate = parseInt(a.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.cnt || 0);
						let bDate = parseInt(b.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.cnt || 0);
						
						return -1 * (aDate < bDate ? -1 : 1)
					},
					'wants': function(a,b){
						let aDate = parseInt(a.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.wants || 0);
						let bDate = parseInt(b.geeklists.filter(x=>x.objectid === r.objectid)[0].latest.wants || 0);
						
						return -1 * (aDate < bDate ? -1 : 1)
					}
				};
				
				//['crets', 'cnt', 'wants', 'thumbs'].forEach(function(s){
				['crets'].forEach(function(s){
					logger.info("Writing to: " + c.rss.output_folder + r.objectid + "-" + s + ".rss");	
					var f = fs.createWriteStream(c.rss.output_folder + r.objectid + "-" + s + ".rss");	
					logger.debug("Num games for RSS:" + l.length);
				
					f.write('<?xml version="1.0" encoding="UTF-8" ?>\n');
					f.write('<rss version="2.0">\n');
					f.write('<channel>\n');
					f.write('<title>' + r.name + ' - ' + s + '</title>\n');
					f.write('<link>https://glaze.hoffy.no?id=' + r.objectid + '</link>\n');
					f.write('<description>Latest geeklist analytics</description>\n');
				
					l.sort(sortFn[s]);
						
					l.forEach(function(b){
						let nm = b.name.filter(x=>(x.primary || false))[0].name;
						//nm = nm.replace(/&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&apos;');
						nm = xmlEscape(nm);
						
						let latest = b.geeklists.filter(x=>x.objectid === r.objectid)[0].latest;
						f.write('<item>\n');
						f.write('<title>' + nm + '</title>\n');	

						let desc = '<ul>';
						desc += '<li>count: ' + latest.cnt + '</li>';
						desc += '<li>' + 'thumbs: ' + latest.thumbs + '</li>';
						desc += '<li>' + 'wants: ' + (latest.wants || 0)+'</li>';
						desc += '</ul>';
						f.write('<description><![CDATA[' + desc + ']]></description>\n');
						
						let pubDate = moment(latest.postdate).format('ddd, DD MMM YYYY hh:mm:ss ZZ');
						f.write('<pubDate>' + pubDate + '</pubDate>\n');	
						f.write('<link>' + 'https://www.boardgamegeek.com/boardgame/' + b.objectid + '</link>\n');
						f.write('<guid isPermaLink="false">' + r.objectid + ":" + b.objectid + '</guid>\n');

						//Iterate over mechanics/designer/category TBA... as <category>
						b.boardgamemechanic.forEach(function(x){
							f.write('<category>' + 'Mechanic/' + xmlEscape(x.name) + '</category>\n');	
						});
						
						b.boardgamedesigner.forEach(function(x){
							f.write('<category>' + 'Designer/' + xmlEscape(x.name) + '</category>\n');	
						});
							
						f.write('</item>\n');
					});
					
					f.write('</channel>\n');
					f.write('</rss>');
					f.end();
				});
			});

			return boardgames
		}
	//Some issue with empty lists. Definitively should at the very least be non-blocking if it fails..
	).then(
		boardgames => generateGraphData(boardgames).finally(x =>boardgames)
	).then(
		function(boardgames){
			logger.info("Updating search engine");
			
			return datamgr.updateSearch(boardgames).then(b=>b).catch(
				function(err){
					logger.error("Failed in saving db/search engine step.");
					logger.error(err);
					
					throw err
				}
			)
		}
	).then(
		function(){
			return generateFilters(geeklists)
			/*
			logger.info("Generating static filter values.");
			return q.allSettled(geeklists.map(generateFilterValues)).then(
				function(){ 
					logger.info("Done saving filtervalues");	
					return true 
				}
			)
			*/
		}
	).then(
		function(v) { 
			return datamgr.finalizeDb()
		}
	).then(
		function(v){
			var startTime = moment(currentTime, c.format.dateandtime);
			var now = moment();
			
			
			var timeTaken = moment.utc(moment.duration(now.diff(startTime)).asMilliseconds()).format("HH:mm:ss");
			logger.info("All done in " + timeTaken);
			return true
		}
	).catch(
		function(e){
			throw e
			//logger.error("Failure using sync_lists");
			//logger.error(e);
		}
	);
}

/* END OF MAIN */

function generateGraphData(boardgames){
	var gd = {
		objectid: 0, //geeklistid
		boardgamemechanics: [], //contains mapping id to name to reduce data
		boardgamecategories: [], //...
		data: []
	};
	
	var graphData = [];
	//var geeklists = [...(boardgames.map(x=>x.geeklists))];//.map(x=>x.objectid);
	//console.log(geeklists);
	//if it doesn't exist, create it..
	
	geeklists.map(x=>x.objectid).forEach(function(v){
		let geeklistBoardgames = boardgames.filter(x=>(x.geeklists.filter(g=>parseInt(g.objectid) === parseInt(v)).length > 0));
		console.log('' + v + ' has ' + geeklistBoardgames.length + ' boardgames');
		
		let data = graphData.filter(x=>x.geeklistid === parseInt(v));
		
		if(data.length > 0){
			data = data[0];
		}else{
			data = {geeklistid: parseInt(v), graphData:[], bordgamemechanics:[], bordgamecategories:[]};
			graphData.push(data);
		}
		
		geeklistBoardgames.forEach(function(b){
			data.graphData.push(
				{
					boardgamemechanic: b.boardgamemechanic.map(x=>x.objectid),
					boardgamecategory: b.boardgamecategory.map(x=>x.objectid),
					boardgamefamily: b.boardgamefamily.map(x=>x.objectid),
					playingtime: b.playingtime,
					minplaytime: b.minplaytime,
					maxplaytime: b.maxplaytime,
					minplayers: b.minplayers,
					maxplayers: b.maxplayers
				}
			);
		});
	});
	
	graphData.forEach(function(v){
			var f = fs.createWriteStream(c.graphdata.output_folder + v.geeklistid + ".json");	
			f.write(JSON.stringify(v));
			f.end();
		}
	);
	
	return q(boardgames)	
}

function genereateRSS(){
	
}

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

function BoardgameStat(boardgameid, geeklistid, analysisdate, postdate, editdate, listtype){
	this.objectid = "" + boardgameid;
	this.geeklistid = geeklistid;
	this.listtype = listtype;
	this.analysisDate = analysisdate;
	//this.crets = moment().format(c.format.dateandtime);
	this.crets = moment().format();
	this.cnt = 0;
	this.thumbs = 0;
	this.wants = 0;
	this.type = "boardgamestat";
	this.hist = {}; //Histogram based on position
	this.obs = [];
	this.postdate = moment(postdate).format();
	//this.postdate = moment(postdate).format(c.format.dateandtime);
	this.editdate = moment(editdate).format();
	//this.editdate = moment(editdate).format(c.format.dateandtime);
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
		
			return boardgames	
			//return addBoardgameStats(boardgames, bgStats)
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
	logger.info("Adding most recent stats to boardgame data");
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

function getBoardgameStat(geeklistId, boardgameId, currentDate, postDate, editDate, listtype){
	var l = boardgameStats.filter(function(e){
		return e.objectid == boardgameId && e.geeklistid == geeklistId 
	});
	var i;

	if(l.length === 0){
		i = new BoardgameStat(boardgameId, geeklistId, currentDate, postDate, editDate, listtype);
		boardgameStats.push(i);
	}else{
		i = l[0];
		
		//The first post defines creation time.
		//if(Date.parse(i.postdate) > postDate){
		if(moment(i.postdate).toDate() > postDate){
			i.postdate = moment(postDate).format(c.format.dateandtime);
		}
		
		//The latest editdate is the one that is used.
		//if(Date.parse(i.editdate) < editDate){
		if(moment(i.editdate).toDate() < editDate){
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

function updateBoardgameStat(e, boardgameStats, rootGeeklistId, geeklistId, rootListType){
	var bgStat;
	var itemId = e.id;
	var bgId = e.objectid;
	var thumbs = parseInt(e.thumbs);
	//var postdate = Date.parse(e.postdate);
	var postdate = moment(e.postdate).toDate();
	//var editdate = Date.parse(e.editdate);
	var editdate = moment(e.editdate).toDate();
	var wants = parseInt(e.wants) || e.cnt;	

	var bgStats = boardgameStats.filter((e) => (e.objectid == bgId && e.geeklistid == rootGeeklistId));

	if(bgStats.length === 0){
		bgStat = new BoardgameStat(bgId, rootGeeklistId, currentDate, postdate, editdate, rootListType);
		boardgameStats.push(bgStat);
	}else{
		bgStat = bgStats[0];
		
		//The first post defines creation time.
		//if(Date.parse(bgStat.postdate) > postdate){
		if(moment(bgStat.postdate).toDate() > postdate){
			bgStat.postdate = moment(postdate).format(c.format.dateandtime);
		}
		
		//The latest editdate is the one that is used.
		//if(Date.parse(bgStat.editdate) < editdate){
		if(moment(bgStat.editdate).toDate() < editdate){
			bgStat.editdate = moment(editdate).format(c.format.dateandtime);
		} 
	}
	
	//Here we tally all stats.
	bgStat.cnt++;
	bgStat.thumbs += thumbs;
	bgStat.obs.push({'geeklist': geeklistId, 'id': itemId});
	bgStat.wants += wants;
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
						updateBoardgameStat(e, boardgameStats, geeklistid, subgeeklistid, listtype)
						
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
						logger.debug(e.objectid + " is excluded");	
					}
					
					geeklistStat.numLists++;
				}
			});
			
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


