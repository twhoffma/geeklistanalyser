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
				
				mc.add(u, r, 10, function (err) { 
					if(err != undefined){
						console.log("Memcache storing of " + u + " failed: " + err);
					}
				});
					
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
		
		db.getGeeklist(p.geeklistId, skip, limit).then(
			function(reply){
				//XXX: Add logging
				var u = req._parsedUrl.href;
				var r = JSON.stringify(reply);
				
				console.log("Asked about: " + u);
				
				mc.set(u, r, 10, function (err) { 
					if(err){
						console.log("Memcache storing of " + u + " failed:" + err);
					}
				});
				
				res.end(r);
			}
		).fail(function(res){
				console.log("fail: " + res);
				console.log(reply);
				res.end("{}");
		});
	}else{
		res.end("{}");
	}
});

http.createServer(app).listen(3000);
