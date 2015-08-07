var connect = require('connect')
var http = require('http')
var bodyParser = require('body-parser')
var compression = require('compression')
var qs = require('qs')
var db = require('../db-couch')

var app = connect();

var uri = '/geeklistmonitor/data';

app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));

app.use(uri + '/getGeeklists', function(req, res, next){
	res.setHeader("Access-Control-Allow-Origin", "*");
	
	db.getGeeklists(true).then(
			function(val){	
				res.end(JSON.stringify(val));
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
				//console.log("Serving geeklist " + p.geeklistId);
				res.end(JSON.stringify(reply));
				//console.log("Served geeklist " + p.geeklistId);
			}
		).fail(function(res){
				console.log("fail: ");
				console.log(reply);
				res.end("{}");
		});
	}else{
		res.end("{}");
	}
});

http.createServer(app).listen(3000);
