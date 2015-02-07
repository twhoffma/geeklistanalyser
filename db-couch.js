qrequest = require('./qrequest.js');

var dbURL = "http://127.0.0.1:5984";
var boardgameViewURL = dbURL + '/geeklistmon/_design/boardgame/_view/boardgame?include_docs=true&key='

function getBoardgame(boardgameId){
	console.log("Getting " + boardgameId + " from db");
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
			
			console.log("Num games: " + boardgames.length);
				
			boardgames.forEach(function(bg, i){
					var docId;
					
					if(bg._id === undefined){
						docId = uuids.pop();
						console.log("Saving " + bg.objectid);
					}else{
						docId = bg._id;
						console.log("Updating " + bg.objectid);
					}

					console.log("Saving " + docId + " to db");
					
					var docURL = dbURL + "\\geeklistmon\\" + docId;
					
					promises.push(qrequest.qrequest("PUT", docURL, JSON.stringify(bg)).then(
							function(reply){
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
								//console.log("FAILED TO SAVE: " + JSON.stringify(bg));
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
	
		console.log(idURL);
	
		return qrequest.qrequest("GET", idURL, null, null).then(function(ret){ret.uuids}).fail(function(res){console.log("UUID Failed: " + res.statusCode)})
}

function saveBoardgameStats(boardgameStats){

}

function saveGeeklistStats(geeklistStats){

}

module.exports.saveBoardgames = saveBoardgames
module.exports.getBoardgame = getBoardgame
