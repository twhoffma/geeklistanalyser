request = require('request');
cheerio = require('cheerio');
q = require('q');

var boardgamesQueue = [];
var boardgames = [];
var geeklists = [];
var boardgameStats = [];
var geeklistStats = [];
var currentDate = Date(); 

var dbURL = "http://127.0.0.1:5984";
var geeklistURL = 'https://www.boardgamegeek.com/xmlapi/geeklist/';
var boardgameURL = 'https://www.boardgamegeek.com/xmlapi/boardgame/';
var boardgameViewURL = dbURL + '/geeklistmon/_design/boardgame/_view/boardgame?include_docs=true&key='

//Tries to implement q promises for requests
function qrequest(method, url, data){
	var p = q.defer();
	
	if(method.toUpperCase() === "GET"){
		request(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				p.resolve(response.body);
			}else{
				p.reject(response.body);	
			}
		});
	}else if(method.toUpperCase() === "PUT"){
		request(
			{
				method: "PUT",
				uri: docURL,
				body: JSON.stringify(bg)
			},
			function(error, response, body) {
				if(response.statusCode == 201){
					console.log("bg saved: "+ docId);
					var reply = JSON.parse(body);
					
					if(reply.ok){
						bg["_id"] = reply.id;
						bg["_rev"] = reply.rev;
							
						p.resolve();
					}else{
						p.reject("DB failed to save: " + body);
					}
						
					}else{
						console.log("error: " + response.statusCode);
						console.log("error: " + body);
						p.reject(body);
					}
				}
			)
			
	}
	
	return p.promise
}

function getGeeklistData(geeklistId){
	var p = q.defer();
	var promises = [];
	
	/*
	var p = qrequest("GET", geeklistURL + geeklistId, null, null).then(
		var $ = cheerio.load(response.body);
			
		$('item').each(function(index, element){
			if($(this).attr('objecttype') == 'thing'){
				if($(this).attr('subtype') == 'boardgame'){
					var bgId = $(this).attr('objectid');
					var thumbs = $(this).attr('thumbs');
					
					var bg = boardgamesQueue.filter(function(e){
						return e.objectid == bgId;
					});
					
					if(bg.length == 0){
						boardgamesQueue.push({objectid: bgId});
					}
					
					var bgStats = boardgameStats.filter(function(e){
						return e.objectid == bgId && e.geeklistId == geeklistId
					});
					
					var bgStat;
					
					if(bgStats.length === 0){
						bgStat = {
							objectId: bgId,
							geeklistId: geeklistId,
							analysisDate: currentDate.getFullYear + "-" + currentData.getMonth + "-" + currentDate.getDay,
							chgts: currentDate.toString(),
							cnt: 0,
							thumbs: 0
						}
						
						boardgameStats.push(bgStat);
					}else{
						bgStat = bgStats[0];
					}

					bgStat.cnt++;
					bgStat.thumbs += thumbs;
				}
			}else if($(this).attr('objecttype') == 'geeklist'){
				var glId = $(this).attr('id');
				var gl = geeklists.filter(function(e){
					return e.objectid == geeklistId
				});
			
				if(gl.length == 0){
					console.log('Loading list: ' + glId);
					geeklists.push({objectid: glId});
					
					var geeklistStats = {
						objectid: glId,
						statDate: "2000-12-31",
						crets: "Now",
						numLists: 0
					};
							
					promises.push(getGeeklistData(glId).then(
						function(val){
							
						}
					));
				}
						
				gl["numLists"]++;
			}
		});	
	).allSettled(
		function(val){
			//push value to array
		},
		function(reason){
			//push value to rejected array
		}
	)
	*/
		
	request(geeklistURL + geeklistId, function(error, response, body){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(response.body);
			
			$('item').each(function(index, element){
				if($(this).attr('objecttype') == 'thing'){
					if($(this).attr('subtype') == 'boardgame'){
						var bgId = $(this).attr('objectid');
						var thumbs = parseInt($(this).attr('thumbs'));
						
						var bg = boardgamesQueue.filter(function(e){
							return e.objectid == bgId;
						});
						
						if(bg.length == 0){
							boardgamesQueue.push({objectid: bgId});
						}
					
						var bgStats = boardgameStats.filter(function(e){
							return e.objectid == bgId && e.geeklistId == geeklistId
						});
					
						var bgStat;
					
						if(bgStats.length === 0){
							bgStat = {
								objectId: bgId,
								geeklistId: geeklistId,
								analysisDate: currentDate.getFullYear + "-" + currentDate.getMonth + "-" + currentDate.getDay,
								chgts: currentDate.toString(),
								cnt: 0,
								thumbs: 0
							}
						
							boardgameStats.push(bgStat);
						}else{
							bgStat = bgStats[0];
						}

						bgStat.cnt++;
						bgStat.thumbs += thumbs;
					}
				}else if($(this).attr('objecttype') == 'geeklist'){
						var glId = $(this).attr('id');
						var gl = geeklists.filter(function(e){
							return e.objectid == geeklistId
						});
						
						if(gl.length == 0){
							console.log('Loading list: ' + glId);
							geeklists.push({objectid: glId});
							
							var geeklistStats = {
								objectid: glId,
								statDate: "2000-12-31",
								crets: "Now",
								numLists: 0
							};
							
							promises.push(getGeeklistData(glId).then(
								function(val){
									
								}
							));
						}
						
						gl["numLists"]++;
				}
			});
			
			q.all(promises).then(
				function(){
					//Should be
					//p.resolve(boardgameQueue);	
					p.resolve();
				}
			);
		}else{
			console.log('noting found or error!');
		}
	});
	
	return p.promise	
}

function getBoardgameData(boardgameId){
	var p = qrequest("GET", boardgameViewURL + "\"" + boardgameId + "\"", null, null).then(
		function(val){
			var data = JSON.parse(val);
			if(data.rows.length === 0){
				throw "Not found"
			}else{
				return data.rows[0].doc
			}
		}
	).fail(
		function(){
			console.log("Looking up " + boardgameId + " at BGG..");
			var p = qrequest("GET", boardgameURL + boardgameId, null, null).then(
				function(val){
					var bg = {};
					var $ = cheerio.load(val);
						
					bg['type'] = "boardgame";
					bg['objectid'] = boardgameId;
					bg['yearpublished'] = $('yearpublished').text();
					bg['minplayers'] = $('minplayers').text();
					bg['maxplayers'] = $('maxplayers').text();
					bg['playingtime'] = $('playingtime').text();
					bg['thumbnail'] = $('thumbnail').text();
			
					bg['name'] = [];
					$('name').each(function(index, elem){
						bg['name'].push({'name': $(this).text(), 'primary': $(this).attr('primary')});
					});
			
					bg['boardgamecategory'] = [];
					$('boardgamecategory').each(function(index, elem){
						var id = $(this).attr('objectid');
						var val = $(this).text();
						bg['boardgamecategory'].push({objectid: id, name: val});
					});
				
					bg['boardgamemechanic'] = [];
					$('boardgamemechanic').each(function(index, elem){
						var id = $(this).attr('objectid');
						var val = $(this).text();
						bg['boardgamemechanic'].push({objectid: id, name: val});
					});
					
					bg['boardgamedesigner'] = [];
					$('boardgamedesigner').each(function(index, elem){
						var id = $(this).attr('objectid');
						var val = $(this).text();
						bg['boardgamedesigner'].push({objectid: id, name: val});
					});
			
					bg['boardgameartist'] = [];
					$('boardgameartist').each(function(index, elem){
						var id = $(this).attr('objectid');
						var val = $(this).text();
						bg['boardgameartist'].push({objectid: id, name: val});
					});
			
					bg['boardgamepublisher'] = [];
					$('boardgamepublisher').each(function(index, elem){
						var id = $(this).attr('objectid');
						var val = $(this).text();
						bg['boardgamepublisher'].push({objectid: id, name: val});
					});
					
					return bg		
				}
			);
			
			return p
		}
	).fail(
		function(val){
			console.log(val);
			throw val
		}
	)
	
	return p
}

/*
 * Run main algorithm
 */
getGeeklistData(174437).then(
	//TODO: Calculate and save geeklist stats
	function(){
		var bg_promises = [];
		
		boardgamesQueue.forEach(function(bg, idx){
			var p = getBoardgameData(bg.objectid).then(
				function(v){
					bg = v;
					//bg["geeklists"] = [];
					//bg.geeklists.push("174437");
					
					boardgames.push(bg);
				});
							
			bg_promises.push(p);
		});
			
		return q.all(bg_promises)
	}
).then(
	function(){
		var p = q.defer();
		var idURL = dbURL + '\\_uuids?count=' + boardgames.length;
		
		console.log(idURL);
		
		request(idURL, function(error, response, body){
			if(!error && response.statusCode == 200){
				p.resolve(JSON.parse(body).uuids);
			}else{
				console.log("error: " + response.statusCode);
				console.log("error: " + body);
			}
		});
		
		return p.promise
	}
).then(
	//TODO: Save boardgames to database
	//TODO: Delete same-date and save geeklistStats to database
	//TODO: Delete same-date and save boardgameStats to database
  	//TODO: Calculate geeklistSnapshotStats (mechanics breakdown, drilldowns).
	//TODO: Delete and save geeklistSnapshotStats
	function(uuids){
		var promises = [];
		
		//Use bulk saving instead	
		boardgames.forEach(function(bg, i){
			var p = q.defer();
			var docId;
			console.log(bg);
			if(bg._id === undefined){
				docId = uuids.pop();
				console.log("Saving " + bg.objectid);
			}else{
				docId = bg._id;
				console.log("Updating " + bg.objectid);
			}
			
			var docURL = dbURL + "\\geeklistmon\\" + docId;
			
				
			request(
				{
					method: "PUT",
					uri: docURL,
					body: JSON.stringify(bg)
				},
				function(error, response, body) {
					if(response.statusCode == 201){
						console.log("bg saved: "+ docId);
						var reply = JSON.parse(body);
						
						if(reply.ok){
							bg["_id"] = reply.id;
							bg["_rev"] = reply.rev;
							
							p.resolve();
						}else{
							p.reject("DB failed to save");
						}
						
						//p.resolve();
					}else{
						console.log("error: " + response.statusCode);
						console.log("error: " + body);
						p.reject(body);
					}
				}
			)
			
			promises.push(p.promise);
		});
		
		return q.all(promises)
	}
).done(
	function(){
		boardgameStats.forEach(function(bg, idx){
			console.log(bg);
		});
		console.log("All done");
	}
);

//Classes - just for reference
geeklist = function(){
	return {
		objectid: null,
		geeklistGroup: "",
		update: false
	}
}
