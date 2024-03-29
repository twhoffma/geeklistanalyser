var connect = require('connect')
var http = require('http')
var bodyParser = require('body-parser')
var compression = require('compression')
var qs = require('qs')
var datamgr = require('../datamgr.js')
var Memcached = require('memcached')
var Q = require('q');

var fs = require('fs');
var c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));

/* Config */
var uri = c.devmode ? c.middleware.dev_baseuri : c.middleware.baseuri;
var memcached_uri = c.middleware.memcached_uri;

/* Commandline args */
var verbose = false;

process.argv.forEach(function(val, index, array){
	if(val === '-v'){
		verbose = true;
	}
});

function createError(e){
	return {"error": e}
}

/* Middleware */
var app = connect();

var mc = new Memcached(memcached_uri, {'maxKeySize': 200});

app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function onerror(err, req, res, next) {
  console.log(err);
});

app.use('/data/getGeeklistDetails', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	res.setHeader('Content-Type', 'application/json');
	
	datamgr.getGeeklists(false, true, [parseInt(p["geeklistid"])]).then(
		function(r){
			cacheResponse(req._parsedUrl.href, JSON.stringify(r));
			res.end(JSON.stringify(r));
			
			return true
		},
		function(e){
			res.end(JSON.stringify(createError(e)));
			throw e
		}
	).catch(function(e){
		res.end(JSON.stringify(createError(e)));
	});
});

//FIXME: There is no reason why this should be live.
app.use('/data/getGeeklistGraphData', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	if(c.devmode){	
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	//res.setHeader('Content-Type', 'application/json');

	if(p.geeklistid != undefined){
		//Get group for historical graphs..
		datamgr.getGeeklists(false, true).then(function(geeklists){
			var prom = [];
			var matchGroup = geeklists.filter(e => e.objectid == p.geeklistid)[0].group;
			
			//console.log("Matching either " + g.objectid + " or group " + matchGroup);
			geeklists.filter(e => (e.objectid == p.geeklistid || e.group == matchGroup)).forEach(function(g){
			//geeklists.filter(e => (e.objectid == p.geeklistid)).forEach(function(g){
				
				//TODO: Add graphs for group of the geeklist..
				
				prom.push(datamgr.getGeeklistFiltersComponents(g.objectid, true).then(
					function(val){
						var data = {'boardgamecategory': [], 'boardgamemechanic': []};
						
						val.forEach(function(v){
							//console.log(v.key[2]);	
							if(data[v.key[1]]){
								data[v.key[1]].push({'objectid': v.key[2].objectid, 'name': v.key[2].name, 'value': v.value});
							}
						});
						
						if(val.length > 0){
							//logger.debug(val[0].doc);
							return {geeklist: {objectid: g.objectid, group: g.group, year: g.year}, graphdata: data}
						}else{
							return Q.reject("nothing found!")
							//return {geeklist: {objectid: g.objectid, group: g.group, year: g.year}, graphdata: {}}
						}
					}
				).then(
					function(graphdata){
						return datamgr.getGeeklistFiltersComponentsObs(graphdata.geeklist.objectid, true).then(
							function(val){
								val.forEach(function(v){
									if(graphdata.graphdata[v.key[1]]){
										var graph = graphdata.graphdata[v.key[1]].filter(e => e.objectid === v.key[2].objectid);
										if(graph.length > 0){
											graph[0]['obs_value'] = v.value;
										}	
									}
								});

								return graphdata
							}
						)
					}
				).catch(
					function(e){
						logger.error(e);
						console.log(e);
						return Q.reject(e);
					}
				));
				
				//TODO: Add datamgr.getGeeklistFiltersComponentsObs - which are scaled by observations rather than entries. Affects Lists of lists.
			});
			
			return q.allSettled(prom).then(function(gd){
				console.log("All settled");
				//console.log(gd);
				
				var r = JSON.stringify(gd.filter(e=>(e.state === "fulfilled")).map(e=>e.value));
				
				cacheResponse(req._parsedUrl.href, r);
				res.end(r);
			}).catch(
				function(e){
					console.log(e)
				}
			)
		});
		
	}else{
		res.end("{\"msgtype\": \"error\", \"msg\": \"No filters found!\"}");
	}
});

app.use('/data/getGeeklistFilters', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	if(c.devmode){	
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	res.setHeader('Content-Type', 'application/json');
	//TODO: Needs to clean incoming data.
	
	if(p.geeklistid != undefined){
		//datamgr.getGeeklistFiltersLive(p.geeklistid).then(
		datamgr.getGeeklistFilters(p.geeklistid).then(
			function(val){
				if(val.length > 0){
					var r = JSON.stringify(val[0].doc);
				
					cacheResponse(req._parsedUrl.href, r);
					
					res.end(r);
				}else{
					res.end("{}");
				}
			}
		).catch(function(e){
			console.log("Error!");
			console.log(e);
		});
	}else{
		res.end("{\"msgtype\": \"error\", \"msg\": \"No filters found!\"}");
	}
});

app.use('/data/getGeeklistStats', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	if(c.devmode){
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	res.setHeader('Content-Type', 'application/json');
	
	//db.getGeeklists(false, true).then(
	datamgr.getLatestGeeklistStats(p.geeklistId).then(
			function(val){
				var u = req._parsedUrl.href + '?';
				var r = JSON.stringify(val);
				
				if(verbose){
					console.log("Asked database about" + u);	
				}
				
				cacheResponse(u, r);
				res.end(r);
    		}
		).fail(
			function(err){
				res.end("Failed to get geeklists: " + err);
			}
		);
});

//app.use(uri + '/data/getGeeklists', function(req, res, next){
app.use('/data/getGeeklists', function(req, res, next){
	if(c.devmode){
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	res.setHeader('Content-Type', 'application/json');
	
	datamgr.getGeeklists(false, true).then(
			function(val){
				var u = req._parsedUrl.href + '?';
				var lists = [];
				var p = [];
					
				for(let i = 0; i < val.length; i++){
					//var gl = val[i];
					
					p.push(
						datamgr.getLatestGeeklistStats(val[i].objectid).then(
							function(v){
								if(!v || v.length === 0){
									//console.log("ERR");
									//console.log(v);
								}else{
									Object.assign(val[i], {latest: v[0].doc});
								}
							}
						).fail(
							function(e){
								console.log(e);
								throw e
							}
						).catch(
							function(e){
								console.log(e);
								throw e
							}
						)
					);
					
					//val[i] = gl;
					//lists.push(gl); 
					//console.log(val[i]);
				}
				
				//console.log("LISTS");	
				//console.log(lists);
				//console.log("/LISTS");	
				
				return q.allSettled(p).then(function(gd){
					var r = JSON.stringify(val);
				
					if(verbose){
						console.log("Asked database about" + u);	
					}
				
					cacheResponse(u, r);
					res.end(r);

					return true
				})
    			}
		).fail(
			function(err){
				res.end("Failed to get geeklists: " + err);
			}
		);
});

app.use('/data/getGeeklist', function(req, res, next){
//app.use(uri + '/data/getGeeklist', function(req, res, next){
	var p = qs.parse(req._parsedUrl.query);
	
	if(c.devmode){
		res.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	res.setHeader('Content-Type', 'application/json');
	
	if(p.geeklistId != undefined){
		var pagenum = p.page || 1;
		var skip = p.skip || 0;
		var limit = c.middleware.limit;
		
		var sortby = p.sortby || 'crets';
		var sortby_asc = p.sortby_asc || 0;
		var filterJSON = p.filters || '';		
		
		//TODO: Add cleaning of data before moving on.
		
		logger.info("Sort options:" + sortby + " " + (sortby_asc ? "ASC" : "DESC"));
		console.log(filterJSON);
		
		
		if(filterJSON != ''){
			logger.info("Fetch method: Search engine");
			
			validateFilters(p.filters).then(function(validFilters){	
				return datamgr.srchBoardgames(p.geeklistId, validFilters, sortby, sortby_asc, skip, limit).then(
					function(reply){
						//console.log(reply);
						//XXX: Decide whether functions are returning JSON before this step or not..
						
						var docs = JSON.parse(reply).hits.hits.map(function(o){
							return o._source
						});

						var r = JSON.stringify(docs);
						
						cacheResponse(req._parsedUrl.href, r);
						res.end(r);
						
						return Q(true)
					}
				)
			}).catch(
				function(res){
					console.log("srch fail: " + res);
					console.log(res);
					res.end("{'error': 'Search failed'}");
				}
			);
		}else{
			console.log('Fetch method: Database');
			
			datamgr.getGeeklist(p.geeklistId, skip, limit, sortby, sortby_asc, true).then(
				function(reply){
					//XXX: Add logging
					var u = req._parsedUrl.href;

					var docs = reply.map(function(v){
						return v.doc
					});
					
					var r = JSON.stringify(docs);
					
					if(verbose){		
						console.log("Asked about: " + u);
					}
					
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

function validateFilters(jsonString){
	return Q.fcall(function(){
		console.log(jsonString);
		return JSON.parse(jsonString)
	/*
	}).then(
		function(o){
			var f = {};
			Object.keys(o).forEach(function(k){
				Q.fcall((function(k, v){
					if(k === 'playingtime' || k === 'numplayers' || k === 'yearpublished'){
						console.log(k);
						console.log(v);
						return {'param': k, 'value': o[k]}
					}else if(k === 'releasetype' || k === 'sortby'){
						return {'param': k, 'value': o[k]}
					}else{
						return {'param': k, 'value': parseInt(o[k])}
					}

					return {'param': k, 'value': parseInt(o[k])}
				})(k, o[k])).then(
					function(v){
						f[v.param] = v.val;
						return true	
					},
					function(e){
						console.log(e);
					}
				);
			});
			return f
		},
		function(e){
			return Q.reject(e)
	*/
	}).catch(function(e){
		return Q.reject(e)
	});
}

function cacheResponse(cachekey, val){
	mc.set(cachekey, val, 120, function (err) { 
		if(err){
			logger.error("Memcache storing of " + cachekey + " failed:" + err);
		}
	});
}

//function clean

http.createServer(app).listen(3000);
