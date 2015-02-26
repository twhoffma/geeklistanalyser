var connect = require('connect')
var http = require('http')
var bodyParser = require('body-parser')
var compression = require('compression')

var app = connect();

app.use(compression());
app.use(bodyParser.urlencoded());

app.use('/getGeeklists', function(req, res, next){
	res.end("Hello boardgamegeek!");
});

app.use('/getGeeklist', function(req, res, next){
	console.log(req.query);
	res.end("Logged");
});

http.createServer(app).listen(3000);
