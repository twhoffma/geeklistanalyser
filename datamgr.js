db = require('./db-couch.js');
srch = require('./srch-elastic.js');
bgg = require('./bgg.js');

var winston = require('winston');


function finalizeDb(){
	return db.finalizeDb
}

/* --- Boardgame -- */
function getBoardgame(boardgameId){
	var boardgameViewURL = db.getViewURL('boardgame', 'boardgame') + '?include_docs=true&key=\"' + boardgameId + "\"";
	return db.getDoc(boardgameViewURL).fail(function(v){ throw boardgameId})
}


function saveBoardgames(boardgames){
	return db.saveDocs(boardgames)
}


/* --- Geeklist --- */
function getGeeklists(updateable, visible){
	var url = db.getViewURL('geeklists', 'geeklists') + '?include_docs=true'
	
	return db.getDocs(url).then(
		function(rows){
			var geeklists = [];
			
			rows.forEach(function(row, i){
				if((row.doc.update === true && updateable === true) || (row.doc.visible === true && visible === true)){
					geeklists.push(row.doc);
				}
			});
			
			return geeklists
		}
	).fail(
		function(err){
			console.log(err);
		}
	)
}

//Gets the content of the geeklist
function getGeeklist(geeklistId, skip, num, sortby, asc){
	var viewname;
	
	switch(sortby){
		case 'name':
			viewname = 'geeklist_by_name';
			break;
		case 'yearpublished':
			viewname = 'geeklist_by_year';
			break;
		case 'thumbs': 
			viewname = 'geeklist_by_thumbs';
			break;
		case 'cnt':
			viewname = 'geeklist_by_cnt';
			break;
		default:
			viewname = 'geeklist_by_crets';
	}	

	var startkey = '[' + geeklistId + ']';
	var endkey = '[' + geeklistId + ', {}]'
	var url = db.getViewURL('geeklist', viewname) + '?include_docs=true&reduce=false';
	url = url + "&skip=" + (skip || 0) + "&limit=" + (num || 100);
	
	if(asc == 0){
		url = url + '&start_key=' + endkey;
		url = url + '&end_key=' + startkey;
		url = url + "&descending=true"
	}else{
		url = url + '&start_key=' + startkey;
		url = url + '&end_key=' + endkey;
	}
	
	return db.getDocs(url)
}

/* --- Boardgame statistics --- */
function deleteBoardgameStats(geeklistId, analysisDate){
	var url = db.getViewURL('boardgamestats', 'boardgamestats')+'?startkey=[{id}, \"{date}\"]&endkey=[{id}, \"{date}\", {}]&include_docs=true';
	url = url.replace(/\{id\}/g, geeklistId);
	url = url.replace(/\{date\}/g, analysisDate);
	
	return db.deleteDocs(url)
}

function getBoardgameStats(geeklistId, boardgameId){
	//TODO: Cannot be done the way 'boardgamestats' is set up. Need couch-lucene.
}

function saveBoardgameStats(boardgameStats){
	return db.saveDocs(boardgameStats)
}

//TODO: Dummy implementation
function updateBoardgameStats(boardgameStats){
	var urls = [];
	
	boardgameStats.forEach(
		function(boardgameStat){ 
			urls.push(db.getUpdateURL('boardgame2', 'updatestats') + '/' + boardgameStats[0].objectid);
		}
	);
	
	return db.updateDocs(urls, boardgameStats)
}

/* --- Geeklist statistics --- */
function deleteGeeklistStats(geeklistId, analysisDate){
	var url = db.getViewURL('geekliststats', 'geekliststats')+'?key=[{id}, \"{date}\"]&include_docs=true';
	url = url.replace(/\{id\}/g, geeklistId);
	url = url.replace(/\{date\}/g, analysisDate);
	
	return db.deleteDocs(url)
}

function getGeeklistStats(geeklistId, analysisDate){
	//TODO: Cannot be done the way 'geekliststats' is set up. Need couch-lucene.
}

function saveGeeklistStats(geeklistStats){
	return db.saveDocs(geeklistStats)
}

//General function for saving to couchDB
function deleteFilterRanges(geeklistId, analysisDate){
	var url = db.getViewURL('geeklistfilters', 'geeklistfilters')+'?key=[{id}, {date}]&include_docs=true';
	url = url.replace(/\{id\}/g, geeklistId);
	url = url.replace(/\{date\}/g, Date.parse(analysisDate));
	
	return db.deleteDocs(url)
}

function saveFilterRanges(filterValue){
	return db.saveDocs(filterValue)
}

function getGeeklistFiltersMinMax(geeklistid){
	var url = db.getViewURL('geeklistfilters', 'geeklistfilters_min_max')+'?reduce=true&group_level=2&start_key=[{id}]&end_key=[{id}, {}]';
	url = url.replace(/\{id\}/g, geeklistid);
	return db.getDocs(url)	
}

function getGeeklistFiltersComponents(geeklistid){
	var url = db.getViewURL('geeklistfilters', 'geeklistfilters_components')+'?reduce=true&group_level=3&start_key=[{id}]&end_key=[{id}, {}]';
	url = url.replace(/\{id\}/g, geeklistid);
	return db.getDocs(url)	
}

function getGeeklistFilters(geeklistid){
	var url = db.getViewURL('geeklistfilters', 'geeklistfilters')+'?start_key=[{id}, {}]&end_key=[{id}]&include_docs=true&descending=true';
	url = url.replace(/\{id\}/g, geeklistid);
	//console.log(url);	
	return db.getDocs(url)	
}

function getGeeklistFiltersLive(geeklistid){
	function FilterValue(geeklistId){
		this.type = 'filtervalue';
		this.objectid = geeklistId;
		this.playingtime = {'min': Infinity, 'max': -Infinity}
		this.numplayers = {'min': Infinity, 'max': -Infinity}
		this.yearpublished = {'min': Infinity, 'max': -Infinity}
		this.boardgamedesigner = []; 
		this.boardgameartist = [];
		this.boardgamecategory = []; 
		this.boardgamemechanic = [];
		this.boardgamepublisher = [];
	}
	
	//Creating filter values	
	var filterValue = new FilterValue(geeklistid);
	
	return getGeeklistFiltersComponents(geeklistid).then(
		function(comp){
			for(var j=0; j < comp.length; j++){
				var f = comp[j].key[1];
				var v = comp[j].key[2];
				
				filterValue[f].push(v);
			}
			
			return getGeeklistFiltersMinMax(geeklistid) 	
		}
	).then(
		function(minmax){
			for(var j=0; j < minmax.length; j++){
				var f = minmax[j].key[1];
				
				filterValue[f].min = minmax[j].value.min;
				filterValue[f].max = minmax[j].value.max;
			}
			
			return [{"doc": filterValue}]
		}
	);
}

function getBoardgameData(boardgameIds){
	var boardgames = [];
	var p = [];
	var bggList = [];
	var pBGG = [];	
	
	//console.log(boardgameIds);
	 
	boardgameIds.forEach(function(boardgameId){	
		p.push(getBoardgame(boardgameId).then(
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
					var idBatch = Math.floor(i / 100);
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

module.exports.getBoardgameData = getBoardgameData
module.exports.saveBoardgames = saveBoardgames
module.exports.getBoardgame = getBoardgame
module.exports.getGeeklists = getGeeklists
module.exports.getGeeklist = getGeeklist
module.exports.saveBoardgameStats = saveBoardgameStats
module.exports.deleteBoardgameStats = deleteBoardgameStats
module.exports.saveGeeklistStats = saveGeeklistStats
module.exports.deleteGeeklistStats = deleteGeeklistStats
module.exports.saveFilterRanges = saveFilterRanges
module.exports.deleteFilterRanges = deleteFilterRanges
module.exports.getGeeklistFilters = getGeeklistFilters
module.exports.finalizeDb = finalizeDb
module.exports.getGeeklistFiltersComponents = getGeeklistFiltersComponents
module.exports.getGeeklistFiltersMinMax = getGeeklistFiltersMinMax
module.exports.getGeeklistFiltersLive = getGeeklistFiltersLive
module.exports.updateBoardgameStats = updateBoardgameStats

module.exports.updateSearch = srch.updateSearch
module.exports.srchBoardgames = srch.srchBoardgames