var connect = require('connect')
var http = require('http')
var bodyParser = require('body-parser')
var compression = require('compression')
var qs = require('qs')
var couch = require('../db-couch')

var app = connect();

app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/getGeeklists', function(req, res, next){
	couch.getGeeklists(true).then(
			function(val){	
				res.end(JSON.stringify(val));
    		}
		).fail(
			function(err){
				res.end("Failed to get geeklists: " + err);
			}
		);
});

app.use('/getGeeklist', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	if(p.geeklistId != undefined){
		var skip = p.skip || 0;
		var limit = p.limit || 100;
		
		couch.getGeeklist(p.geeklistId, skip, limit).then(
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
