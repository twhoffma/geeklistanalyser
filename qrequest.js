require('http').globalAgent.maxSockets = 5;
require('https').globalAgent.maxSockets = 5;

request = require('request');
q = require('q');

var maxRequests = 5;
var maxNumBackoffs = 5;
var numRequests = 0;
var reqQueue = [];

function backoff(method, url, data, headers, use_fallback, fallback_iter, useQueue, isQueued){
	var p = q.defer();
	
	if(fallback_iter <= maxNumBackoffs){ 
		setTimeout(function(){
			qrequest(method, url, data, headers, true, fallback_iter+1, useQueue, isQueued).then(
				function(v){
					p.resolve(v);
				},
				function(e){
					p.reject(e);
				}
			, 1000*(1 + Math.random())*Math.exp(fallback_iter+1));
		});
	}else{
		p.reject("Max number of backoffs reached!");
	}
	
	return p.promise 
}

function qrequest(method, url, data, headers, use_fallback, fallback_iter, useQueue, isQueued){
	var p = q.defer();
	
	use_fallback = use_fallback || false;
	fallback_iter = fallback_iter || 0;
	method = method.toUpperCase();
	isQueued = isQueued || false;
	useQueue = useQueue || false;
	
	if(method === "GET"){
		//Queue
		if(!isQueued && useQueue){
			p.promise.finally(
				function(){
					var qr;
					
					numRequests--;
						
					if(reqQueue.length > 0){
						qr = reqQueue.shift();
						
						console.log("[UQ] " + reqQueue.length + " left in queue. [" + url + "]");	
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
		
		//XXX:But this will fail and increment the counter when backing off...
		//TODO: make num requests domain dependent.
		//If num running requests is less than max
		if(numRequests <= maxRequests || !useQueue){
			if(fallback_iter === 0 && useQueue){
				numRequests++;
			}
			
			//Run request
			request(url, function(error, response, body){
				if(!error && response.statusCode == 200){
					p.resolve(response.body);
				}else if(!error && response.statusCode == 202){
					//The request was accepted. This implies server rendering. Try back-off.
					console.log("202. Backing off #" + fallback_iter + "[" + url + "]");
					
					//XXX: There is a bug here where when backing off, request is queued immediately.	
					backoff(method, url, data, headers, true, fallback_iter, useQueue, isQueued).then(
						function(v){
							p.resolve(v);
						},
						function(e){
							p.reject(e);
						}
					);
				}else{
					console.log(error);
					if(!error){
						console.log(response.statusCode);	
					}
					
					if(use_fallback && ((error && error.code == 'ECONNRESET') || response.statusCode == 503)){
						console.log("503/Hangup: Backing off #" + fallback_iter + "[" + url + "]");
						//console.log(error.code);
						//XXX: There is a bug here where when backing off, request is queued immediately.	
						backoff(method, url, data, headers, true, fallback_iter, useQueue, isQueued).then(
							function(v){
								p.resolve(v);
							},
							function(e){
								p.reject(e);
							}
						);
					}else{
						console.log("failed url: " + url);
						console.log(error);
						console.log("Fallback iteration: #" + fallback_iter);
						console.log("Fallback active: " + use_fallback);
						p.reject(error);	
					}
				}
			});
			//.finally will take the new item and execute.
		}else{
			reqQueue.push({"url": url, "deferred": p});
			console.log("[Q] " + reqQueue.length + " left in queue. [" + url + "]");	
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
					console.log(method.toUpperCase() + " error: " + response.statusCode);
					console.log(method.toUpperCase() + " error: " + body);
					console.log(method.toUpperCase() + " url: " + url);
						
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
					console.log("DELETE error: " + response.statusCode);
					console.log("DELETE error: " + body);
					console.log(method.toUpperCase() + " url: " + url);
						
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
