require('http').globalAgent.maxSockets = 5;
require('https').globalAgent.maxSockets = 5;

request = require('request');
q = require('q');
logger = require('./logger.js');

var maxRequests = 5;
var maxNumBackoffs = 5;
var numRequests = 0;
var reqQueue = [];

function backoff(method, url, data, headers, use_fallback, fallback_iter, useQueue, isQueued, lastResult){
	var p = q.defer();
	var delay = (1 + Math.random())*Math.exp(fallback_iter+1);
	
	if(fallback_iter <= maxNumBackoffs){
		logger.info(delay + "s [" + url + "]");
		
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
		
		logger.info("[UQ] " + reqQueue.length + " left in queue. [" + url + "]");	
		
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

function qrequest(method, url, data, headers, use_fallback, fallback_iter, useQueue, isQueued, lastResult){
	var p = q.defer();
	
	use_fallback = use_fallback || false;
	fallback_iter = fallback_iter || 0;
	method = method.toUpperCase();
	isQueued = isQueued || false;
	useQueue = useQueue || false;
	lastResult = lastResult || 0;
	
	if(method === "GET"){
		//Queue
		if(!isQueued && useQueue){
			p.promise.finally(
				function(){
					numRequests--;
					//nextRequest();
					
					
					var qr;
					if(reqQueue.length > 0){
						qr = reqQueue.shift();
						
						logger.info("[UQ] " + reqQueue.length + " left in queue. [" + url + "]");	
						//We fake one iteration to prevent this from being added recursively..
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
			);
		}
		
		//TODO: make num requests domain dependent.
		//If num running requests is less than max
		if(numRequests < maxRequests || !useQueue || fallback_iter > 0){
			if(fallback_iter === 0 && useQueue){
				numRequests++;
			}
			
			//Run request
			request(url, function(error, response, body){
				if(!error && response.statusCode == 200){
					p.resolve(response.body);
				}else if(!error && response.statusCode == 202){
					//The request was accepted. This implies server rendering. Try back-off.
					logger.info("202. Backing off #" + fallback_iter + "/" + maxNumBackoffs +  " [" + url + "]");
					
					if(lastResult === 503){
						fallback_iter = 1;
					}
					
					//XXX: If this is the result after a 503, it inherits the retry number instead of resetting.
					backoff(method, url, data, headers, true, fallback_iter, useQueue, isQueued, 202).then(
						function(v){p.resolve(v);},
						function(e){p.reject(e);}
					);
				}else{
					/*
					console.log(error);
					if(!error){
						console.log(response.statusCode);	
					}
					*/
					
					if(use_fallback && ((error && error.code == 'ECONNRESET') || response.statusCode == 503)){
						logger.warn("503/Hangup: Backing off #" + fallback_iter + "/" + maxNumBackoffs + " [" + url + "]");
						
						backoff(method, url, data, headers, true, fallback_iter, useQueue, isQueued, 503).then(
							function(v){p.resolve(v);},
							function(e){p.reject(e);}
						);
					}else{
						logger.error("failed url: " + url);
						logger.error(error);
						logger.error("Fallback iteration: #" + fallback_iter);
						logger.error("Fallback active: " + use_fallback);
						p.reject(error);	
					}
				}
			});
			//.finally will take the new item and execute.
		}else{
			reqQueue.push({"url": url, "deferred": p});
			logger.info("[Q] " + reqQueue.length + " left in queue. [" + url + "]");	
		}
	}else if(method === "PUT" || method === "POST"){
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
		
		request(
			r,
			function(error, response, body) {
				var sc = response.statusCode;
				
				if((sc == 201 && method === "PUT") || (sc >= 200 && sc < 300 && method === "POST")){		
					p.resolve(body);
					
				}else{
					logger.error(method.toUpperCase() + " error: " + response.statusCode);
					logger.error(method.toUpperCase() + " error: " + body);
					logger.error(method.toUpperCase() + " url: " + url);
						
					//console.log("Failed data: " + data);
					
					p.reject(body);
				}
			}
		)
	}else if(method.toUpperCase() === "DELETE"){
		request(
			{
				method: "DELETE",
				uri: url,
				body: data
			},
			function(error, response, body) {
				if(response.statusCode == 200){
					p.resolve(true);
				}else{
					logger.error("DELETE error: " + response.statusCode);
					logger.error("DELETE error: " + body);
					logger.error(method.toUpperCase() + " url: " + url);
						
					//console.log("Failed data: " + data);
					
					p.reject("ERROR");
				}
			}
		)
	}else{
		p.reject("Unknown http verb");
	}
	
	return p.promise
}

module.exports.qrequest = qrequest
