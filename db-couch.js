qrequest = require('./qrequest.js');

var dbURL = "http://127.0.0.1:5984";

function getBoardgame(boardgameId){
	var boardgameViewURL = dbURL + '/geeklistmon/_design/boardgame/_view/boardgame?include_docs=true&key='
	
	//console.log("Getting " + boardgameId + " from db");
	
	return p = qrequest.qrequest("GET", boardgameViewURL + "\"" + boardgameId + "\"", null, null).then(
		function(val){
			var data = JSON.parse(val);
			if(data.rows.length === 0){
				throw "Not found"
			}else{
				return data.rows[0].doc
			}
		}
	)
}

function saveBoardgames(boardgames){
	return generateUuids(boardgames.length).then(
		function(uuids){
			var promises = [];
			
			boardgames.forEach(function(bg, i){
					var docId;
					
					if(bg._id === undefined){
						docId = uuids.pop();
						console.log("Saving " + bg.objectid);
					}else{
						docId = bg._id;
						//console.log("Updating " + bg.objectid);
					}

					var docURL = dbURL + "\\geeklistmon\\" + docId;
					
					promises.push(qrequest.qrequest("PUT", docURL, JSON.stringify(bg)).then(
							function(res){
								var reply = JSON.parse(res);
								
								if(reply.ok){
									bg["_id"] = reply.id;
									bg["_rev"] = reply.rev;
									
									return true
								}else{
									throw "DB failed to save"
								}
							}
						).fail(
							function(){
								console.log("Failed to save boardgame: " + JSON.stringify(bg));
							}
						)
					);
				}
			);

			return q.all(promises)
		}
	) 
}

function generateUuids(num){
		var idURL = dbURL + '\\_uuids?count=' + num;
	
		return qrequest.qrequest("GET", idURL, null, null).then(function(ret){ret.uuids}).fail(function(res){console.log("UUID Failed: " + res.statusCode)})
}

function getGeeklists(inclAll){
	var geeklistViewURL = dbURL + '/geeklistmon/_design/geeklists/_view/geeklists?include_docs=true'
	
	return qrequest.qrequest("GET", geeklistViewURL).then(
		function(res){
			var geeklists = [];
			
			JSON.parse(res).rows.forEach(function(row, i){
				if(row.doc.update === true || inclAll === true){
					geeklists.push(row.doc);
				}
			});
			
			return geeklists
		}
	)
}

function saveBoardgameStats(boardgameStats){

}

function saveGeeklistStats(geeklistStats){

}

module.exports.saveBoardgames = saveBoardgames
module.exports.getBoardgame = getBoardgame
module.exports.getGeeklists = getGeeklists
