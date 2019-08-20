qrequest = require('./qrequest.js')
logger = require('./logger.js')

c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));

var srchURL = "http://" + c.elastic.addr + ":" + c.elastic.port;
var srchIndex = c.elastic.srchIndex;
var srchType = c.elastic.srchType;

/* --- Generic functions --- */
function getSrchURL(){
	//return srchURL + "/" + srchIndex + "/" + srchType + "/_search" 
	return srchURL + "/" + srchIndex + "/_search" 
}

//Update search engine
function updateSearch(docs){
	var url = srchURL + "/_bulk"
	var bulk_request = [];
	var p = [];
	var h = {};
	
	docs.forEach(function(doc){
			var idx;
			if(doc.type === "boardgame"){
				idx = "boardgames";
			}
			
			//h = {'update': {"_id": doc._id, "_type": doc.type, "_index": idx}};
			h = {'update': {"_id": doc._id, "_index": idx}};
			bulk_request.push(JSON.stringify(h));
			//console.log(doc);
			//Elastic 7.3.0 doesn't allow _id as part of a doc
			delete doc._id;
			bulk_request.push(JSON.stringify({"doc": doc, "doc_as_upsert": true}));
	});
	
	logger.info("[SearchEngine] Updating to " + url);
	return qrequest.qrequest("POST", url, bulk_request.join("\n") + "\n", {"Content-Type": "application/json"}).then(
		function(v){
			var r = JSON.parse(v);
			var cntCreated = 0;
			var cntUpdated = 0;
			var cntErrors = 0;
			logger.debug(r);
			r.items.forEach(function(i){
				if(i.update.status == 201){
					cntCreated++;
				}else if(i.update.status >= 200 && i.update.status < 300){
					cntUpdated++;
				}else{
					cntErrors++;
				}
			});
			
			if(cntErrors === 0){
				logger.info("[SearchEngine] Created: " + cntCreated + ", Updated: " + cntUpdated);
			}else{
				logger.error("[SearchEngine] Created: " + cntCreated + ", Updated: " + cntUpdated + ", Errors:" + cntErrors);
			}
			return v
		},
		function(e){
			logger.error(e);
			throw e
		}
	)
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
	//q['query'] = {};
	q['query'] = (filterGeeklistId(geeklistid));	
	q['query']['bool'] = {};
	
	//q['query']['bool'] = (filterGeeklistId(geeklistid));	
	//q['query']['bool']['must'] = [];
	//q['query']['bool']['must'].push(filterGeeklistId(geeklistid));	
	var must = [];
	var must_not = [];
	var should = [];

	//For many2many fields, add them.	
	['boardgamedesigner', 'boardgameartist', 'boardgamemechanic', 'boardgamecategory', 'boardgamepublisher', 'boardgamefamily'].forEach(function(e){	
		if(filters[e] != undefined){ 
			must.push(filterManyToMany(e, filters[e]));
		}
	});

	//For one to many relations..
	if(filters["releasetype"] != undefined){
		switch(filters["releasetype"]){
			case 'boardgame':
				must.push(filterIsEmpty('expands'));
				break;
			case 'expansion':
				must_not.push(filterIsEmpty('expands'));
				break;
			case 'reimplementation':
				must_not.push(filterIsEmpty('boardgameimplementation'));
				break;
			case 'integration':
				must_not.push(filterIsEmpty('boardgameintegration'));
				break;
			case 'collection':
				must_not.push(filterIsEmpty('boardgamecompilation'));
				break;
		}
	}

	//Playing time
	if(filters["playingtimemin"] !== undefined || filters["playingtimemax"] !== undefined){
		must.push(filterRange("playingtime", filters["playingtimemin"] || -Infinity, filters["playingtimemax"] || Infinity));
	}
	
	//Number of players
	if(filters["numplayersmin"] !== undefined || filters["numplayersmax"] !== undefined){
		q['query']['bool']['minimum_should_match'] = 1;
		
		should.push(filterRange("minplayers", filters["numplayersmin"] || -Infinity, filters["numplayersmax"] || Infinity));
		
		should.push(filterRange("maxplayers", filters["numplayersmin"] || -Infinity, filters["numplayersmax"] || Infinity));
	}
		
	//Year published
	if(filters["yearpublishedmin"] !== undefined || filters["yearpublishedmax"] !== undefined){
		
		must.push(filterRange("yearpublished", filters["yearpublishedmin"] || -Infinity, filters["yearpublishedmax"] || Infinity));
	}
	

	if(must.length > 0){
		q['query']['bool']['must'] = must;
	}

	if(must_not.length > 0){
		q['query']['bool']['must_not'] = must_not;
	}

	if(should.length > 0){
		q['query']['bool']['should'] = should;
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
		s = {"geeklists.latest.cnt": {"order": orderby, "nested_path": "geeklists.latest", "nested_filter": {"term": {"geeklists.latest.geeklistid": geeklistid}}}}	

	}else if(sortby === "wants"){
		s = {"geeklists.latest.cnt": {"order": orderby, "nested_path": "geeklists.latest", "nested_filter": {"term": {"geeklists.latest.geeklistid": geeklistid}}}}	

	}else{
		s = {"geeklists.crets": {"order": orderby, "nested_path": "geeklists", "nested_filter": {"term": {"geeklists.objectid": geeklistid}}}}	
	}
		
	q['sort'].push(s);
	
	var json_query = JSON.stringify(q);
	
	console.log("this is q:\n" + json_query);
	
	return qrequest.qrequest("POST", getSrchURL(), json_query, {"Content-Type": "application/json"});
}

function filterGeeklistId(geeklistid){
	var q = {};
	/*
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['nested'] = {};
	q['filtered']['filter']['nested']['path'] = "geeklists";
	q['filtered']['filter']['nested']['filter'] = {};
	q['filtered']['filter']['nested']['filter']['bool'] = {};
	q['filtered']['filter']['nested']['filter']['bool']['must'] = [];
		
	var m = q['filtered']['filter']['nested']['filter']['bool']['must'];
	*/
	
	q['nested'] = {};
	q['nested']['path'] = "geeklists";
	q['nested']['query'] = {};
	q['nested']['query']['bool'] = {};
	q['nested']['query']['bool']['must'] = [];
		
	var m = q['nested']['query']['bool']['must'];
	m.push({'term': {'geeklists.objectid': geeklistid}});

	return q
}

function filterManyToMany(nameM2M, objectid){
	var q = {};
	/*
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['nested'] = {};
	q['filtered']['filter']['nested']['path'] = nameM2M;
	q['filtered']['filter']['nested']['filter'] = {};
	q['filtered']['filter']['nested']['filter']['bool'] = {};
	q['filtered']['filter']['nested']['filter']['bool']['must'] = [];
		
	var m = q['filtered']['filter']['nested']['filter']['bool']['must'];
	*/
	
	q['filter'] = {};
	q['filter']['nested'] = {};
	q['filter']['nested']['path'] = nameM2M;
	q['filter']['nested']['filter'] = {};
	q['filter']['nested']['filter']['bool'] = {};
	q['filter']['nested']['filter']['bool']['must'] = [];
		
	var m = q['filter']['nested']['filter']['bool']['must'];
	
	var t = {};
	t['term'] = {};
	t['term'][nameM2M + '.objectid'] = objectid;
	m.push(t);
	//m.push({'term': {nameM2M + '.objectid': objectid}});

	return q
}

function filterIsExpansion(){
	var q = {};
	/*
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['missing'] = {};
	q['filtered']['filter']['missing']['field'] = 'expands';
	*/
	
	q['filter'] = {};
	q['filter']['missing'] = {};
	q['filter']['missing']['field'] = 'expands';
	
	return q
}

function filterIsEmpty(fieldName){
	var q = {};
	/*
	q['filtered'] = {};
	q['filtered']['filter'] = {};
	q['filtered']['filter']['missing'] = {};
	q['filtered']['filter']['missing']['field'] = fieldName;
	*/

	q['filter'] = {};
	q['filter']['missing'] = {};
	q['filter']['missing']['field'] = fieldName;

	return q
}

function filterRange(name, min, max){
	var q = {};
	/*
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
	*/
	
	q['filter'] = {};
	q['filter']['range'] = {};
	q['filter']['range'][name] = {};
	
	if(min > -Infinity){
		q['filter']['range'][name]['gte'] = min;
	}

	if(max < Infinity){
		q['filter']['range'][name]['lte'] = max;
	}

	return q
}

module.exports.getSrchURL = getSrchURL
module.exports.srchBoardgames = srchBoardgames
module.exports.updateSearch = updateSearch
