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
	//console.log(qs.parse(req._parsedUrl.query, true));
	//TODO: Implement a function to get all boardgames for a given geeklistid parameter that is a number. 
	console.log(req.query);
	res.end("Logged");
});

http.createServer(app).listen(3000);
