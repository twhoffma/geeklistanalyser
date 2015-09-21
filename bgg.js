cheerio = require('cheerio');
qrequest = require('./qrequest.js');

var geeklistURL = 'https://www.boardgamegeek.com/xmlapi/geeklist/';
var boardgameURL = 'https://www.boardgamegeek.com/xmlapi/boardgame/';

function getGeeklist(geeklistId){
	console.log("Getting geeklist " + geeklistId + " from BGG");
	return qrequest.qrequest("GET", geeklistURL + geeklistId)
}

function getBoardgame(boardgameId){
	console.log("Looking up " + boardgameId + " at BGG..");
	
	return qrequest.qrequest("GET", boardgameURL + boardgameId, null, null).then(
		function(val){
			var bg = {};
			var $ = cheerio.load(val);
				
			bg['type'] = "boardgame";
			bg['objectid'] = boardgameId;
			bg['yearpublished'] = $('yearpublished').text();
			bg['minplayers'] = $('minplayers').text();
			bg['maxplayers'] = $('maxplayers').text();
			bg['playingtime'] = $('playingtime').text();
			bg['minplaytime'] = $('minplaytime').text();
			bg['maxplaytime'] = $('maxplaytime').text();
			bg['thumbnail'] = $('thumbnail').text();
			bg['geeklists'] = [];
				
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
			
			bg['boardgameintegration'] = [];
			$('boardgameintegration').each(function(index, elem){
				var id = $(this).attr('objectid');
				var val = $(this).text();
				
				if($(this).attr('inbound') === "true"){
					bg['boardgameintegration'].push({objectid: id, name: val});
				}
			});
			
			bg['boardgameimplementation'] = [];
			$('boardgameimplementation').each(function(index, elem){
				var id = $(this).attr('objectid');
				var val = $(this).text();
				
				if($(this).attr('inbound') === "true"){
					bg['boardgameimplementation'].push({objectid: id, name: val});
				}
			});
			
			return bg		
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
