qrequest = require('./qrequest.js');

var dbURL = "http://127.0.0.1:5984";
var boardgameViewURL = dbURL + '/geeklistmon/_design/boardgame/_view/boardgame?include_docs=true&key='

function getBoardgame(boardgameId){
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
						console.log("Updating " + bg.objectid);
					}

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
					));
				}
			);

			return q.all(promises)
		}
	) 
}

function generateUuids(num){
		var idURL = dbURL + '\\_uuids?count=' + boardgames.length;
		
		return qrequest.qrequest(idURL).then(function(ret){ret.uuids}).fail(function(res){console.log(res.statusCode)})
}
