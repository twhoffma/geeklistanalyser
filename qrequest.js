require('http').globalAgent.maxSockets = 5;
require('https').globalAgent.maxSockets = 5;

request = require('request');
q = require('q');
logger = require('./logger.js');

fs = require('fs');
c = JSON.parse(fs.readFileSync('localconfig.json', 'utf8'));

var maxRequests = 1;
var maxRequestsPerSec = 1;
var maxNumBackoffs = 5;
var numRequests = 0;
var reqQueue = [];

/*
function backoff(method, url, data, headers, use_fallback, fallback_iter, useQueue, isQueued, lastResult){
	var p = q.defer();
	var delay = (1 + Math.random())*Math.exp(fallback_iter+1);
	
	if(fallback_iter <= maxNumBackoffs){
		logger.debug(delay + "s backoff added."); //[" + url + "]");
		
		setTimeout(function(){
			qrequest(method, url, data, headers, true, fallback_iter+1, useQueue, isQueued, lastResult).then(
				function(v){
					p.resolve(v);
				},
				function(e){
					p.reject(e);
				}
			);
		}, 1000*delay);
	}else{
		p.reject("Max number of backoffs reached!");
		logger.error("Max number of backoffs reached!");
	}
	
	return p.promise 
}

function nextRequest(){
	var qr;
		
	if(reqQueue.length > 0){
		qr = reqQueue.shift();
		
		logger.debug("[UQ] " + reqQueue.length + " left in queue. "); //[" + url + "]");	
		
		qrequest("GET", qr.url, null, null, true, 0, useQueue, true).then(
			function(v){
				qr.deferred.resolve(v);
			},
			function(e){
				qr.deferred.reject(e);
			}
		).catch(
			function(e){
				qr.deferred.reject(e);
			}
		);
	}
}
*/

function qrequest(method, url, data, headers, use_fallback, fallback_iter, useQueue, isQueued, lastResult){
	var p;
			
	use_fallback = use_fallback || false;
	fallback_iter = fallback_iter || 0;
	method = method.toUpperCase();
	isQueued = isQueued || false;
	useQueue = useQueue || false;
	lastResult = lastResult || 0;
	
	if(method === "GET"){
		if(numRequests < maxRequests || !useQueue){
			if(fallback_iter === 0 && useQueue){
				numRequests++;
			}
			
			p = runRequest(reqGet, 0, url);
		}else{
			var d = q.defer();
			
			reqQueue.push({"url": url, "deferred": d});
			logger.debug("++ " + reqQueue.length + " left in queue. "); // [" + url + "]");	
			logger.debug("Queued " + url);	
			
			p = d.promise;
		}
	}else if(method === "POST"){
		p = reqPost(url, data, headers)
	}else if(method === "PUT"){
		p = reqPut(url, data)
	}else if(method.toUpperCase() === "DELETE"){
		p = reqDelete(url, data)
	}else{
		p.reject("Unknown http verb");
	}
	
	if(useQueue){	
		//TODO: make num requests domain dependent.
		return p.finally(function(){
			//console.log("Went into finally..." + url);
			runNextRequest();
		}).catch(function(e){
			//console.log("Went into catch..." + url);
			//console.log(e);
			
			throw e
		});
	}else{
		return p
	}
}

/*
function request(tries) {
	if (tries > MAX_TRIES)
		reject;
	return doRequest().then(function(v){resolve(v)}, return request(tries + 1));
}
*/
function runNextRequest(){
	var qr;
	
	numRequests--;
	
	if(reqQueue.length > 0){
		qr = reqQueue.shift();
		logger.debug("-- " + reqQueue.length + " left in queue.");	
		
		//return runRequest(reqGet, 0, qr.url).then(
		runRequest(reqGet, 0, qr.url).then(
			function(v){
				qr.deferred.resolve(v);	
			},
			function(e){
				qr.deferred.reject(e);
			}
		).finally(function(){
			runNextRequest();
		});
	}
}

function queueRequest(fn, url){
	return new q.Promise(function(resolve, reject){
		reqQueue.push({"url": url, "deferred": d});
		logger.debug(reqQueue.length + " left in queue. "); 
	})
}

function runRequest(fn, tries, url, data, header){
	return new q.Promise(function(resolve, reject){
		var delay = 0;
		if(tries > maxNumBackoffs){
			reject("Max number of backoffs reached!");
		}else{
			if(tries > 0){
				delay = (1 + Math.random())*Math.exp(tries+1);
				logger.debug("Delay added: " + delay);
			}
			
			q.delay(1000 * delay).then(function(){
				return fn(url, data, header)
				/*
				if(url.indexOf('193588') !== -1){
					console.log("faking reject");
					return q.reject(502)
				}else{
					return fn(url, data, header)
				}
				*/
			}).then(
				function(v){
					resolve(v);
				},
				function(e){
					if(e == 202 || e == 503){
						return runRequest(fn, tries+1, url, data, header)
					}else{
						reject(e);
					}		
				}
			).then(
				function(v){
					resolve(v);
				},
				function(e){
					reject(e);
				}
			);
		}
	})
}

function reqGet(url){
	return new q.Promise(function(resolve, reject){
		request(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				resolve(response.body);
			}else if(!error && response.statusCode == 202){
				//The request was accepted. This implies server rendering. Try back-off.
				reject(202);
			}else{
				if((error && error.code == 'ECONNRESET') || (response.statusCode && response.statusCode == 503)){
					reject(503);
				}else{
					reject(error);
				}
			}
		});
	})
}

function reqDelete(url, data){
	return new q.Promise(function(resolve, reject){
			request(
				{
					method: "DELETE",
					uri: url,
					body: data
				},
				function(error, response, body) {
					if(response.statusCode == 200){
						resolve("OK");
					}else{
						logger.error("DELETE error: " + response.statusCode);
						logger.error("DELETE error: " + body);
						logger.error(method.toUpperCase() + " url: " + url);
							
						reject("ERROR");
					}
				}
			);
		}
	)
}

function reqPut(url, data, headers){
	var r = {
			method: 'PUT',
			uri: url
	};
	
	if(data !== undefined && data !== null){
			r['body'] = data;
	}
		
	if(headers !== undefined & headers !== null){
		r['headers'] = headers;
	}
	
	return new q.Promise(function(resolve, reject){
			request(
				r,
				function(error, response, body) {
					if(!error){
						var sc = response.statusCode;
						
						if(sc == 201){		
							resolve(body);	
						}else{
							logger.error(method.toUpperCase() + " error: " + response.statusCode);
							logger.error(method.toUpperCase() + " error: " + body);
							logger.error(method.toUpperCase() + " url: " + url);
								
							
							reject(body);
						}
					}else{
						logger.error(error);
						reject(error);
					}
				}
			)
		}
	)
}

function reqPost(url, data, headers){
	var method = 'POST';
	var r = {
			method: method,
			uri: url
	};
	
	if(data !== undefined && data !== null){
			r['body'] = data;
	}
		
	if(headers !== undefined & headers !== null){
		r['headers'] = headers;
	}
	
	return new q.Promise(function(resolve, reject){
			request(
				r,
				function(error, response, body) {
					if(!error){
						var sc = response.statusCode;
						
						if(sc >= 200 && sc < 300){		
							resolve(body);	
						}else{
							logger.error(method.toUpperCase() + " error: " + response.statusCode);
							logger.error(method.toUpperCase() + " error: " + body);
							logger.error(method.toUpperCase() + " url: " + url);
								
							
							reject(body);
						}
					}else{
						logger.error(error);
						reject(error);
					}
				}
			)
		}
	)
}

module.exports.qrequest = qrequest
