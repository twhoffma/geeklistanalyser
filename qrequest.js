request = require('request');
q = require('q');

function qrequest(method, url, data){
	var p = q.defer();
	
	if(method.toUpperCase() === "GET"){
		request(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				p.resolve(response.body);
			}else{
				console.log("failed url: " + url);
				p.reject(response.body);	
			}
		});
	}else if(method.toUpperCase() === "PUT"){
		request(
			{
				method: "PUT",
				uri: url,
				body: data
			},
			function(error, response, body) {
				if(response.statusCode == 201){
					
					p.resolve(body);
				}else{
					console.log("PUT error: " + response.statusCode);
					console.log("PUT error: " + body);
						
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
