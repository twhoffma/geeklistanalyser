require('http').globalAgent.maxSockets = 5;
require('https').globalAgent.maxSockets = 5;

request = require('request');
q = require('q');



function qrequest(method, url, data, headers, use_fallback, fallback_iter){
	var p = q.defer();
	
	use_fallback = use_fallback || false;
	fallback_iter = fallback_iter || 0;
	method = method.toUpperCase();
	
	if(method === "GET"){
		request(url, function(error, response, body){
			if(!error && response.statusCode >= 200 && response.statusCode < 300){
				p.resolve(response.body);
			}else{
				console.log(error);
				if(!error){
					console.log(response.statusCode);	
				}
				if(use_fallback && fallback_iter < 5 &&  ((error && error.code == 'ECONNRESET') || response.statusCode == 503)){
					console.log("Trying to back off " + fallback_iter);
					//console.log(error.code);
					
					setTimeout(function(){
						console.log("Running again.."); 
						return qrequest(method, url, data, headers, true, fallback_iter+1).then(function(v){
							p.resolve(v);
						},
							function(e){
								throw e
							}
						)
					}, 1000*(1 + Math.random())*10*(fallback_iter+1)); 
				}else{
					console.log("failed url: " + url);
					console.log(error);
					console.log(fallback_iter);
					console.log(use_fallback);
					p.reject(error);	
				}
			}
		});
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
						
					console.log("Failed data: " + data);
					
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
						
					console.log("Failed data: " + data);
					
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
