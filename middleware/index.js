var connect = require('connect')
var http = require('http')
var bodyParser = require('body-parser')
var compression = require('compression')
var qs = require('qs')
var db = require('../db-couch')
var Memcached = require('memcached')

var fs = require('fs');
c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));

/* Config */
//var uri = '/geeklistmonitor/data';
var uri = c.middleware.baseuri;
var memcached_uri = c.middleware.memcached_uri;

/* Middleware */
var app = connect();

var mc = new Memcached(memcached_uri, {'maxKeySize': 200});

app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));

app.use(uri + '/getGeeklistFilters', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	if(c.devmode){	
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	//TODO: Needs to clean incoming data.
	
	if(p.geeklistid != undefined){
		db.getGeeklistFilters(p.geeklistid).then(
			function(val){
				var r = JSON.stringify(val);
				
				cacheResponse(req._parsedUrl.href, r);
					
				res.end(r);
			}
		).catch(function(e){
			console.log("Error!");
			console.log(e);
		});
	}else{
		res.end("{\"msgtype\": \"error\", \"msg\": \"No filters found!\"}");
	}
});

app.use(uri + '/getGeeklists', function(req, res, next){
	if(c.devmode){
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	
	db.getGeeklists(false, true).then(
			function(val){
				var u = req._parsedUrl.href + '?';
				var r = JSON.stringify(val);
				
				console.log("Asked database about" + u);	
				
				cacheResponse(u, r);
				res.end(r);
    		}
		).fail(
			function(err){
				res.end("Failed to get geeklists: " + err);
			}
		);
});

app.use(uri + '/getGeeklist', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	if(c.devmode){
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	if(p.geeklistId != undefined){
		var skip = p.skip || 0;
		var limit = c.middleware.limit;
		
		var sortby = p.sortby || 'crets';
		var sortby_asc = p.sortby_asc || 0;
		var filterJSON = p.filters || '';		
		
		//TODO: Add cleaning of data before moving on.
		
		if(filterJSON != ''){
			console.log("Using filters");
			console.log(filterJSON);
			console.log(sortby);
			console.log(sortby_asc);
				
			//TODO: You need to use try/catch here..
			var filters = JSON.parse(p.filters);
			
			db.srchBoardgames(p.geeklistId, filters, sortby, sortby_asc, skip, limit).then(
				function(reply){
					//console.log(reply);
					//XXX: Decide whether functions are returning JSON before this step or not..
					
					var docs = JSON.parse(reply).hits.hits.map(function(o){
						return o._source
					});

					var r = JSON.stringify(docs);
						
					cacheResponse(req._parsedUrl.href, r);
					res.end(r);
				}
			).catch(
				function(res){
					console.log("srch fail: " + res);
					console.log(res);
					res.end("{'error': 'Search failed'}");
				}
			);
		}else{
			console.log('using non-filtered');
			
			db.getGeeklist(p.geeklistId, skip, limit, sortby, sortby_asc).then(
				function(reply){
					//XXX: Add logging
					var u = req._parsedUrl.href;

					var docs = reply.map(function(v){
						return v.doc
					});
					
					var r = JSON.stringify(docs);
					
					console.log("Asked about: " + u);

					cacheResponse(u, r);
					res.end(r);
				}
			).fail(function(res){
					console.log("fail: " + res);
					console.log(res);
					res.end("{'error': 'Geeklist not found/no games in list'}");
			});
		}
	}else{
		res.end("{'error': 'Geeklist not found!'}");
	}
});

function cacheResponse(cachekey, val){
	mc.set(cachekey, val, 120, function (err) { 
		if(err){
			console.log("Memcache storing of " + cachekey + " failed:" + err);
		}
	});
}

//function clean

http.createServer(app).listen(3000);
