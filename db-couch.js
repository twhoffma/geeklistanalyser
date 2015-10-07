qrequest = require('./qrequest.js');
fs = require('fs');
c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));

var dbURL = "http://" + c.db.dbaddr + ":" + c.db.dbport;
var dbName = c.db.dbname;

var srchURL = "http://" + c.elastic.addr + ":" + c.elastic.port;
var srchIndex = c.elastic.srchIndex;
var srchType = c.elastic.srchType;

/* --- Generic functions --- */
function getSrchURL(){
	return srchURL + "/" + srchIndex + "/" + srchType + "/_search" 
}

function getViewURL(dsndoc, view){
	return dbURL + '/' + dbName + '/_design/' + dsndoc + '/_view/' + view
}

function getCompactURL(){
	return dbURL + '/' + dbName + '/_compact'
}

function generateUuids(num){
		//XXX: In reality, this can only fetch 1000 ids at a time - so this needs to be patched.
		var idURL = dbURL + '/_uuids?count=' + num;
	
		return qrequest.qrequest("GET", idURL, null, null).then(
			function(ret){
				return JSON.parse(ret).uuids
			}).fail(
				function(res){
					console.log("UUID Failed: " + res.statusCode)
				}
			)
}

function updateSearch(boardgames){
	var url = srchURL + "/_bulk"
	var bulk_request = [];
	var p = [];
	var h = {};

	boardgames.forEach(function(boardgame){
			h = {'update': {"_id": boardgame._id, "_type": "boardgame", "_index": "boardgames"}};
			bulk_request.push(JSON.stringify(h));
			bulk_request.push(JSON.stringify({"doc": boardgame, "doc_as_upsert": true}));
	});
	
	return qrequest.qrequest("POST", url, bulk_request.join("\n") + "\n", {"Content-Type": "application/json"}).then(
		function(v){
			var r = JSON.parse(v);
			var cntCreated = 0;
			var cntUpdated = 0;
			//console.log(r);	
			r.items.forEach(function(i){
				if(i.update.status == 201){
					cntCreated++;
				}else{
					cntUpdated++;
				}
			});
			
			console.log("Created: " + cntCreated + ", Updated: " + cntUpdated);
			
			return v
		},
		function(e){
			console.log(e);
			throw e
		}
	)
}

function deleteDocs(url){
	var p = [];
	
	return getDocs(url).then(
		function(rows){
			var docs = [];

			rows.forEach(function(row, i){
				docs.push({uuid: row.doc._id, rev: row.doc._rev});
			});
			
			return docs
		}
	).then(
		function(docs){
			var p = [];
			
			docs.forEach(
				function(doc, i){
					var url = dbURL + '/' + dbName + '/' + doc.uuid + '?rev=' + doc.rev;
					p.push(qrequest.qrequest("DELETE", url, null, null));
				}
			);

			return q.allSettled(
				function(success){
					console.log(success.length + " deleted");
				},
				function(fails){
					console.log(fails);
				}
			)
		}
	) 	
}

function getDocs(viewURL){
	return qrequest.qrequest("GET", viewURL, null, null).then(
		function(val){
			var data = JSON.parse(val);
			return data.rows
		},
		function(){
			console.log("no doc found!");
		}
	).catch(
		function(){
			console.log("now what=");
		}
	);
}

function getDoc(viewURL){
	return getDocs(viewURL).then(
		function(d){
			if(d.length > 0){
				return q(d[0].doc);
			}else{
				return q.reject("No doc found!");
			}
		}
	)
}

function saveDocs(docs){
	return generateUuids(docs.length).then(
		function(uuids){
			var promises = [];
				
			docs.forEach(function(doc, i){
					var docId;
					
					if(doc._id === undefined){
						docId = uuids.pop();
					}else{
						docId = doc._id;
					}
					
					var docURL = dbURL + "/" + dbName + "/" + docId;
						
					promises.push(qrequest.qrequest("PUT", docURL, JSON.stringify(doc)).then(
							function(res){
								var reply = JSON.parse(res);
								
								if(reply.ok){
									doc["_id"] = reply.id;
									doc["_rev"] = reply.rev;
									
									return true
								}else{
									throw "DB failed to save"
								}
							}
						).catch(
							function(e){
								console.log("Failed to save doc: " + JSON.stringify(doc));
								
								throw e
							}
						)
					);
				}
			);

			return q.all(promises)
		}
	).fail(
		function(err){
			console.log("No uuids");
			console.log(err);
		}
	)	
}

/* --- Boardgame -- */
function getBoardgame(boardgameId){
	var boardgameViewURL = getViewURL('boardgame', 'boardgame') + '?include_docs=true&key=\"' + boardgameId + "\"";
	return getDoc(boardgameViewURL).fail(function(v){ throw boardgameId})
}


function saveBoardgames(boardgames){
	return saveDocs(boardgames)
}


/* --- Geeklist --- */
function getGeeklists(updateable, visible){
	var url = getViewURL('geeklists', 'geeklists') + '?include_docs=true'
	
	return getDocs(url).then(
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
		case 'year':
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
	var url = getViewURL('geeklist', viewname) + '?include_docs=true&reduce=false';
	url = url + "&skip=" + (skip || 0) + "&limit=" + (num || 100);
	
	if(asc == 0){
		url = url + '&start_key=' + endkey;
		url = url + '&end_key=' + startkey;
		url = url + "&descending=true"
	}else{
		url = url + '&start_key=' + startkey;
		url = url + '&end_key=' + endkey;
	}
	
	return getDocs(url)
}

/* --- Boardgame statistics --- */
function deleteBoardgameStats(geeklistId, analysisDate){
	var url = getViewURL('boardgamestats', 'boardgamestats')+'?startkey=[{id}, \"{date}\"]&endkey=[{id}, \"{date}\", {}]&include_docs=true';
	url = url.replace(/\{id\}/g, geeklistId);
	url = url.replace(/\{date\}/g, analysisDate);
	
	return deleteDocs(url)
}

function getBoardgameStats(geeklistId, boardgameId){
	//TODO: Cannot be done the way 'boardgamestats' is set up. Need couch-lucene.
}

function saveBoardgameStats(boardgameStats){
	return saveDocs(boardgameStats)
}

/* --- Geeklist statistics --- */
function deleteGeeklistStats(geeklistId, analysisDate){
	var url = getViewURL('geekliststats', 'geekliststats')+'?key=[{id}, \"{date}\"]&include_docs=true';
	url = url.replace(/\{id\}/g, geeklistId);
	url = url.replace(/\{date\}/g, analysisDate);
	
	return deleteDocs(url)
}

function getGeeklistStats(geeklistId, analysisDate){
	//TODO: Cannot be done the way 'geekliststats' is set up. Need couch-lucene.
}

function saveGeeklistStats(geeklistStats){
	return saveDocs(geeklistStats)
}

//General function for saving to couchDB
function deleteFilterRanges(geeklistId, analysisDate){
	var url = getViewURL('geeklistfilters', 'geeklistfilters')+'?key=[{id}, {date}]&include_docs=true';
	url = url.replace(/\{id\}/g, geeklistId);
	url = url.replace(/\{date\}/g, Date.parse(analysisDate));
	
	return deleteDocs(url)
}

function saveFilterRanges(filterValue){
	return saveDocs(filterValue)
}

function getGeeklistFilters(geeklistid){
	var url = getViewURL('geeklistfilters', 'geeklistfilters')+'?start_key=[{id}, {}]&end_key=[{id}]&include_docs=true&descending=true';
	url = url.replace(/\{id\}/g, geeklistid);
	
	return getDocs(url)	
}

function finalizeDb(){
	var url = getCompactURL();
	
	return qrequest.qrequest("POST", url, null, {"Content-Type": "application/json"})
}

//Search by filtering and sort result
function srchBoardgames(geeklistid, filters, sortby, sortby_asc, skip, lim){
	var q = {};
	
	//Number of items to skip during incremental loading
	if(skip != 0){
		q['from'] = skip;	
	}
	
	//Set the number results to return
	q['size'] = lim;
	
	//Filtering
	q['query'] = {};
	q['query']['bool'] = {};
	q['query']['bool']['must'] = [];
	
	q['query']['bool']['must'].push(filterGeeklistId(geeklistid));	
	
	['boardgamedesigner', 'boardgameartist', 'boardgamemechanic', 'boardgamecategory', 'boardgamepublisher'].forEach(function(e){	
		if(filters[e] != undefined){ 
			q['query']['bool']['must'].push(filterManyToMany(e, filters[e]));
		}
	});

	if(filters["releasetype"] != undefined){
		switch(filters["releasetype"]){
			case 'boardgame':
				//q['query']['bool']['must'].push(filterIsExpansion());
				q['query']['bool']['must'].push(filterIsEmpty('expands'));
				break;
			case 'expansion':
				if(q['query']['bool']['must_not'] === undefined){  
					q['query']['bool']['must_not'] = [];	
				}
				//q['query']['bool']['must_not'].push(filterIsExpansion());
				q['query']['bool']['must_not'].push(filterIsEmpty('expands'));
				break;
			case 'reimplementation':
				if(q['query']['bool']['must_not'] === undefined){  
					q['query']['bool']['must_not'] = [];	
				}
				q['query']['bool']['must_not'].push(filterIsEmpty('boardgameimplementation'));
				break;
			case 'integration':
				if(q['query']['bool']['must_not'] === undefined){  
					q['query']['bool']['must_not'] = [];	
				}
				q['query']['bool']['must_not'].push(filterIsEmpty('boardgameintegration'));
				break;
			case 'collection':
				if(q['query']['bool']['must_not'] === undefined){  
					q['query']['bool']['must_not'] = [];	
				}
				q['query']['bool']['must_not'].push(filterIsEmpty('boardgamecompilation'));
				break;
		}
	}

	//Playing time
	if(filters["playingtimemin"] != undefined || filters["playingtimemax"] != undefined){
		q['query']['bool']['must'].push(filterRange("playingtime", filters["playingtimemin"] || -Infinity, filters["playingtimemax"] || Infinity));
	}
	
	//Number of players
	if(filters["playersmin"] != undefined || filters["playersmax"] != undefined){
		q['query']['bool']['minimum_should_match'] = 1;
		q['query']['bool']['should'] = [];
		q['query']['bool']['should'].push(filterRange("minplayers", filters["playersmin"] || -Infinity, filters["playersmax"] || Infinity));
		q['query']['bool']['should'].push(filterRange("maxplayers", filters["playersmin"] || -Infinity, filters["playersmax"] || Infinity));
	}
		
	//Year published
	if(filters["minyearpublished"] != undefined || filters["maxyearpublished"] != undefined){
		q['query']['bool']['must'].push(filterRange("yearpublished", filters["minyearpublished"] || -Infinity, filters["maxyearpublished"] || Infinity));
	}
	
	//Sorting
	var orderby;
	var s;
	
	if(sortby_asc == 0){
		orderby = "desc";
	}else{
		orderby = "asc";	
	}
		
	q['sort'] = [];
	
    if(sortby === "name"){
		s = {"name.name": {"order": orderby, "nested_filter": {"term": {"name.primary": "true"}}}};	
	}else if(sortby === "yearpublished"){
		s = {"yearpublished": {"order": orderby}}
	}else if(sortby === "thumbs"){
		s = {"geeklists.latest.thumbs": {"order": orderby, "nested_path": "geeklists.latest", "nested_filter": {"term": {"geeklists.latest.geeklistid": geeklistid}}}}
	}else if(sortby === "cnt"){
		s = {"geeklists.latest.crets": {"order": orderby, "nested_path": "geeklists.latest", "nested_filter": {"term": {"geeklists.lastest.geeklistid": geeklistid}}}}	
	}else{
		s = {"geeklists.crets": {"order": orderby, "nested_path": "geeklists", "nested_filter": {"term": {"geeklists.objectid": geeklistid}}}}	
	}
		
	q['sort'].push(s);
	
	var json_query = JSON.stringify(q);
	
	console.log("this is q:\n" + json_query);
	
	return qrequest.qrequest("POST", getSrchURL(), json_query);
}

function filterGeeklistId(geeklistid){
	var q = {};
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['nested'] = {};
	q['filtered']['filter']['nested']['path'] = "geeklists";
	q['filtered']['filter']['nested']['filter'] = {};
	q['filtered']['filter']['nested']['filter']['bool'] = {};
	q['filtered']['filter']['nested']['filter']['bool']['must'] = [];
		
	var m = q['filtered']['filter']['nested']['filter']['bool']['must'];
	m.push({'term': {'geeklists.objectid': geeklistid}});

	return q
}

function filterManyToMany(nameM2M, objectid){
	var q = {};
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['nested'] = {};
	q['filtered']['filter']['nested']['path'] = nameM2M;
	q['filtered']['filter']['nested']['filter'] = {};
	q['filtered']['filter']['nested']['filter']['bool'] = {};
	q['filtered']['filter']['nested']['filter']['bool']['must'] = [];
		
	var m = q['filtered']['filter']['nested']['filter']['bool']['must'];
	var t = {};
	t['term'] = {};
	t['term'][nameM2M + '.objectid'] = objectid;
	m.push(t);
	//m.push({'term': {nameM2M + '.objectid': objectid}});

	return q
}

function filterIsExpansion(){
	var q = {};
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['missing'] = {};
	q['filtered']['filter']['missing']['field'] = 'expands';

	return q
}

function filterIsEmpty(fieldName){
	var q = {};
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['missing'] = {};
	q['filtered']['filter']['missing']['field'] = fieldName;

	return q
}

function filterRange(name, min, max){
	var q = {};
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['range'] = {};
	q['filtered']['filter']['range'][name] = {};

	if(min > -Infinity){
		q['filtered']['filter']['range'][name]['gte'] = min;
	}

	if(max < Infinity){
		q['filtered']['filter']['range'][name]['lte'] = max;
	}

	return q
}

module.exports.saveBoardgames = saveBoardgames
module.exports.getBoardgame = getBoardgame
module.exports.getGeeklists = getGeeklists
module.exports.getGeeklist = getGeeklist
module.exports.saveBoardgameStats = saveBoardgameStats
module.exports.deleteBoardgameStats = deleteBoardgameStats
module.exports.saveGeeklistStats = saveGeeklistStats
module.exports.deleteGeeklistStats = deleteGeeklistStats
module.exports.srchBoardgames = srchBoardgames
module.exports.saveFilterRanges = saveFilterRanges
module.exports.deleteFilterRanges = deleteFilterRanges
module.exports.getGeeklistFilters = getGeeklistFilters
module.exports.finalizeDb = finalizeDb
module.exports.updateSearch = updateSearch
