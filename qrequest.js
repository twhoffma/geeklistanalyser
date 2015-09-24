request = require('request');
q = require('q');

function qrequest(method, url, data, headers){
	var p = q.defer();
	
	method = method.toUpperCase();
	
	if(method === "GET"){
		request(url, function(error, response, body){
			if(!error && response.statusCode >= 200 && response.statusCode < 300){
				p.resolve(response.body);
			}else{
				console.log("failed url: " + url);
				console.log(error);
				//console.log(error);
				//console.log(body);
				console.log("Returning error");
				p.reject(response.statusCode);	
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
