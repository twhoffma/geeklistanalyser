qrequest = require('./qrequest.js');

var dbURL = "http://127.0.0.1:5984";
var dbName = "geeklistdb";

var srchURL = "http://127.0.0.1:9200";
var srchIndex = "boardgames";
var srchType = "boardgame";

/* --- Generic functions --- */
function getSrchURL(){
	return srchURL + "/" + srchIndex + "/" + srchType + "/_search" 
}

function getViewURL(view){
	return dbURL + '/' + dbName + '/_design/' + view + '/_view/' + view
}

function generateUuids(num){
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
						console.log("Updating " + doc.objectid);
					}
					
					var docURL = dbURL + "\\" + dbName + "\\" + docId;
					
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
							function(){
								console.log("Failed to save doc: " + JSON.stringify(doc));
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
	var boardgameViewURL = getViewURL('boardgame') + '?include_docs=true&key=\"' + boardgameId + "\"";
	return getDoc(boardgameViewURL)
}


function saveBoardgames(boardgames){
	return saveDocs(boardgames)
}


/* --- Geeklist --- */
function getGeeklists(inclAll){
	var url = getViewURL('geeklists') + '?include_docs=true'
	
	return getDocs(url).then(
		function(rows){
			var geeklists = [];
			
			rows.forEach(function(row, i){
				if(row.doc.update === true || inclAll === true){
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
function getGeeklist(geeklistId, skip, num, asc){
	var url = getViewURL('geeklist') + '?include_docs=true&reduce=false&key=' + geeklistId + '';
	url = url + "&skip=" + (skip || 0) + "&limit=" + (num || 100);
	
	if(asc){
		url = url + "&descending=true"
	}
	
	return getDocs(url)
}

/* --- Boardgame statistics --- */
function deleteBoardgameStats(geeklistId, analysisDate){
	var url = getViewURL('boardgamestats')+'?startkey=[{id}, \"{date}\"]&endkey=[{id}, \"{date}\", {}]&include_docs=true';
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
	var url = getViewURL('geekliststats')+'?key=[{id}, \"{date}\"]&include_docs=true';
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

//Should return allowable ranges for data-dependent filters 
//such as issuers, designers, publishers, mechanics, categories, publication years, thumbs.
function getFilerRanges(){

}

//Search by filtering and sort result
function srchBoardgames(filters, sortby, skip, lim){
	var q = {};
	var geeklistid;

	geeklistid = filters['geeklistid'];
	
	//Number of items to skip during incremental loading
	if(skip != 0){
		q['from'] = skip;	
	}
	
	//Set the number results to return
	q['size'] = lim;
	
	//Filtering
	//TODO: Make this less stupid.
	q['query'] = {};
	q['query']['filtered'] = {};
	q['query']['filtered']['filter'] = {};
	q['query']['filtered']['filter']['nested'] = {};
	q['query']['filtered']['filter']['nested']['path'] = "geeklists";
	q['query']['filtered']['filter']['nested']['filter'] = {};
	q['query']['filtered']['filter']['nested']['filter']['bool'] = {};
	q['query']['filtered']['filter']['nested']['filter']['bool']['must'] = [];
	
	var m = q['query']['filtered']['filter']['nested']['filter']['bool']['must'];
	m.push({'term': {'geeklists.objectid': geeklistid}});
	
	
	//Sorting
	if(sortby != undefined){
		var orderby;
		var s;
		
		if(sortby.orderby === "desc"){
			orderby = "desc";
		}else{
			orderby = "asc";	
		}
		
		q['sort'] = [];
		
    	if(sortby.name === "name"){
			s = {"name.name": {"order": orderby, "nested_filter": {"term": {"name.primary": "true"}}}};	
		}else if(sortby.name === "yearpublished"){
			s = {"yearpublished": {"order": orderby}}
		}else if(sortby.name === "thumbs"){
			s = {"geeklists.latest.thumbs": {"order": orderby, "nested_path": "geeklists.latest", "nested_filter": {"term": {"geeklists.latest.geeklistid": geeklistid}}}}
		}else if(sortby.name === "geeklist_addts"){
			s = {"geeklists.latest.crets": {"order": orderby, "nested_path": "geeklists.latest", "nested_filter": {"term": {"geeklists.lastest.geeklistid": geeklistid}}}}	
		}else{
			console.log("WARN: no sorting...")	
		}
		
		q['sort'].push(s);
	}
	
	var json_query = JSON.stringify(q);
	//console.log("this is q:\n" + json_query);
	
	return qrequest.qrequest("POST", getSrchURL(), json_query);
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
