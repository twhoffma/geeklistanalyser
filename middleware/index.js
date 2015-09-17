var connect = require('connect')
var http = require('http')
var bodyParser = require('body-parser')
var compression = require('compression')
var qs = require('qs')
var db = require('../db-couch')
var Memcached = require('memcached')


/* Config */
var uri = '/geeklistmonitor/data';
var memcached_uri = 'localhost:11211';

/* Middleware */
var app = connect();

var mc = new Memcached(memcached_uri, {'maxKeySize': 200});

app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));

app.use(uri + '/getGeeklists', function(req, res, next){
	res.setHeader("Access-Control-Allow-Origin", "*");
	
	
	db.getGeeklists(true).then(
			function(val){
				var u = req._parsedUrl.href + '?';
				var r = JSON.stringify(val);
				
				console.log("Asked database about" + u);	
				
				cacheResponse(u, r);
				/*	
				mc.add(u, r, 10, function (err) { 
					if(err != undefined){
						console.log("Memcache storing of " + u + " failed: " + err);
					}
				});
				*/	
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
	
	res.setHeader("Access-Control-Allow-Origin", "*");
	
	if(p.geeklistId != undefined){
		var skip = p.skip || 0;
		var limit = p.limit || 100;
		console.log(p.filters);	
		if(p.filters != undefined || p.sortby != undefined){
			console.log("Using filters");
				
			var filters = {};
			var sortby; 
			if(p.filters){
				filters = JSON.parse(p.filters);
			}
			
			if(!p.sortby){
				sortby = {'orderby': 'asc', 'name': 'thumbs'};
			}else{
				sortby = JSON.parse(p.sortby);
			}

			filters['geeklistid'] = p.geeklistId;
			
			
			db.srchBoardgames(filters, sortby, skip, limit).then(
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
			
			db.getGeeklist(p.geeklistId, skip, limit).then(
				function(reply){
					//XXX: Add logging
					var u = req._parsedUrl.href;

					var docs = reply.map(function(v){
						return v.doc
					});
					
					var r = JSON.stringify(docs);
					
					console.log("Asked about: " + u);

					cacheResponse(u, r);
					
					/*
					mc.set(u, r, 10, function (err) { 
						if(err){
							console.log("Memcache storing of " + u + " failed:" + err);
						}
					});
					*/
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
	mc.set(cachekey, val, 10, function (err) { 
		if(err){
			console.log("Memcache storing of " + cachekey + " failed:" + err);
		}
	});
}

http.createServer(app).listen(3000);
