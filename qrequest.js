request = require('request');
q = require('q');

function qrequest(method, url, data){
	var p = q.defer();
	
	if(method.toUpperCase() === "GET"){
		request(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				p.resolve(response.body);
			}else{
				p.reject(response.body);	
			}
		});
	}else if(method.toUpperCase() === "PUT"){
		request(
			{
				method: "PUT",
				uri: url,
				body: JSON.stringify(data)
			},
			function(error, response, body) {
				if(response.statusCode == 201){
					var reply = JSON.parse(body);
					
					p.resolve(reply);
				}else{
					console.log("error: " + response.statusCode);
					console.log("error: " + body);
					p.reject(body);
				}
			}
		)
			
	}
	
	return p.promise
}
