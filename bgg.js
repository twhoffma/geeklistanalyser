cheerio = require('cheerio');
qrequest = require('./qrequest.js');
q = require('q');
parseString = require('xml2js').parseString;


var geeklistURL = 'https://www.boardgamegeek.com/xmlapi/geeklist/';
var boardgameURL = 'https://www.boardgamegeek.com/xmlapi/boardgame/';

var queueGeeklists = [];
var queueBoardgames = [];

var fetchingGeeklist = false;
var fetchingBoardgame = false;

function Boardgame(boardgameId){
	this.type = "boardgame";
	this.objectid = boardgameId;
	this.yearpublished = 0;
	this.minplayers = 0;
	this.maxplayers = 0;
	this.playingtime = 0;
	this.minplaytime = 0;
	this.maxplaytime = 0;
	this.thumbnail = "";
	this.geeklists = [];
	this.name = [];
	this.boardgamecategory = [];
	this.boardgamemechanic = [];	
	this.boardgamedesigner = [];	
	this.boardgameartist = [];
	this.boardgamefamily = [];
	this.boardgamepublisher = [];
	this.boardgameintegration = [];
	this.boardgameimplementation = [];
	this.boardgamecompilation = [];
	this.expansions = [];
	this.expands = [];
}

function getGeeklist(listtype, geeklistId){
	//Look up a geeklist - use queueing
	if(listtype === "preview"){
		console.log("requesting a preview");
		return qrequest.qrequest("GET", `https://api.geekdo.com/api/geekpreviews?nosession=1&previewid=${geeklistId}`, null, null, true, 0, true).then(
			function(results){
				let r = JSON.parse(results);
				let p = [];
				console.log(`Wow! ${r.config.numpages} pages!`);
				for(let i = 1; i <=r.config.numpages; i++){
					p.push(
						qrequest.qrequest("GET", `https://api.geekdo.com/api/geekpreviewitems?nosession=1&pageid=${i}&previewid=${geeklistId}`, null, null, true, 0, true).then(
							function(convPreview){
								return JSON.parse(convPreview).map(
									x => (
										{
											'id': 0, 
											'objecttype':x.objecttype, 
											'subtype': 'boardgame', 
											'objectid': parseInt(x.objectid), 
											'objectname':x.geekitem.item.primaryname.name, 
											'username':'',
											'postdate': new Date(Date.parse(x.date_created)).toISOString(),
											'editdate': new Date(Date.parse(x.date_updated)).toISOString(),
											'thumbs': parseInt(x.reactions.thumbs),
											'imageid': parseInt(x.geekitem.item.imageid)
										}
									)
								)
							}
						)
					);
				}

				return q.allSettled(p);
			}).then(
				function(r){
					let l = r.map(e => e.value).reduce(
						function(prev, curr){
							if(prev.indexOf(curr) === -1){
								return prev.concat(curr)
							}else{
								return prev
							}
						},
						[]
					);
					
					return l	
				}
			)
	}else{
		return qrequest.qrequest("GET", geeklistURL + geeklistId, null, null, true, 0, true).then(
			function(results){
				let n = function(value,name){
        			if(['objectid','thumbs','id','imageid'].includes(name)){
                			return parseInt(value)
        			}else if(['postdate','editdate'].includes(name)){
                			return new Date(Date.parse(value)).toISOString()
        			}else{
                			return value
        			}
				}
				
				return q(new Promise(function(resolve, reject){
					parseString(results, {attrValueProcessors: [n]}, 
						function(err, res){
							if(err){
								reject(err);
							}else{
								resolve(res);
							}
						}
					)
				})).then(function(res){
					let items = res.geeklist.item.map(x => x['$']).filter(x => (x.subtype === 'boardgame' || x.objecttype === 'geeklist'));
					return items
				});
			}
		);
	}
}

function getBoardgame(boardgameId){
	//Look up board games - use queuing.
	return qrequest.qrequest("GET", boardgameURL + boardgameId, null, null, true, 0, true).then(
		function(val){
			var $ = cheerio.load(val);
			var boardgames = [];
			
			$('boardgame').each(function(index, elem){
				var bg = new Boardgame($(this).attr('objectid'));
				
				bg.yearpublished = $('yearpublished', $(this)).text();
				bg.minplayers = $('minplayers', $(this)).text();
				bg.maxplayers = $('maxplayers', $(this)).text();
				bg.playingtime = $('playingtime', $(this)).text();
				bg.minplaytime = $('minplaytime', $(this)).text();
				bg.maxplaytime = $('maxplaytime', $(this)).text();
				bg.thumbnail = $('thumbnail', $(this)).text();
				
				$('name', $(this)).each(function(index, elem){
					bg.name.push({'name': $(this).text(), 'primary': $(this).attr('primary')});
				});
		
				$('boardgamecategory', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					
					bg.boardgamecategory.push({objectid: id, name: val});
				});
			
				$('boardgamemechanic', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					bg.boardgamemechanic.push({objectid: id, name: val});
				});
				
				$('boardgamedesigner', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					bg.boardgamedesigner.push({objectid: id, name: val});
				});
		
				$('boardgamefamily', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					bg.boardgamefamily.push({objectid: id, name: val});
				});
				
				$('boardgameartist', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					bg.boardgameartist.push({objectid: id, name: val});
				});
		
				$('boardgamepublisher', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					bg.boardgamepublisher.push({objectid: id, name: val});
				});
				
				$('boardgameintegration', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					
					if($(this).attr('inbound') === "true"){
						bg.boardgameintegration.push({objectid: id, name: val});
					}
				});
				
				$('boardgameimplementation', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					
					if($(this).attr('inbound') === "true"){
						bg.boardgameimplementation.push({objectid: id, name: val});
					}
				});
				
				$('boardgameexpansion', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					
					if($(this).attr('inbound') === "true"){
						bg.expands.push({objectid: id, name: val});
					}else{
						bg.expansions.push({objectid: id, name: val});
					}
				});
				
				$('boardgamecompilation', $(this)).each(function(index, elem){
					var id = $(this).attr('objectid');
					var val = $(this).text();
					
					if($(this).attr('inbound') === "true"){
						bg.boardgamecompilation.push({objectid: id, name: val});
					}
				});
				
				boardgames.push(bg);
			});	
			
			return boardgames
		}
	)
}

function selectorToArray(selector, checkInbound){
	var a = [];
	
	selector.each(function(index, elem){
		console.log(elem);
		var id = this.attr('objectid');
		var val = this.text();
		var inbound = this.attr('inbound');
				
		if(!checkInbound || inbound === "true"){
			a.push({objectid: id, name: val});
		}
	});

	return a
}

module.exports.getGeeklist = getGeeklist
module.exports.getBoardgame = getBoardgame
