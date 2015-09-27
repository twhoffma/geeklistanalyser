cheerio = require('cheerio');
qrequest = require('./qrequest.js');

var geeklistURL = 'https://www.boardgamegeek.com/xmlapi/geeklist/';
var boardgameURL = 'https://www.boardgamegeek.com/xmlapi/boardgame/';

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
	this.boardgamepublisher = [];
	this.boardgameintegration = [];
	this.boardgameimplementation = [];
	this.expansions = [];
	this.expands = [];
}

function getGeeklist(geeklistId){
	console.log("Getting geeklist " + geeklistId + " from BGG");
	return qrequest.qrequest("GET", geeklistURL + geeklistId)
}

function getBoardgame(boardgameId){
	console.log("Looking up " + boardgameId + " at BGG..");
	
	return qrequest.qrequest("GET", boardgameURL + boardgameId, null, null).then(
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
