function init_header(){
	function toggleLoadingEffect(){
    var e = document.getElementById("glaze-hdr");
    var c = e.className.split(" ");
    var nc = [];
    var found = false;

    c.forEach(function(v,i){
      if(v !== "loading"){
        nc.push(v);
      }else{
        found = true;
      }

    });

    if(!found){
      nc.push("loading");
    }

    e.className = "listHeader" + " " + nc.join(" ");

  }
  
  /*
  window.addEventListener('scroll', function(e) {
    var h = document.querySelectorAll(".listHeader")[0];
    
    //console.log(h.getBoundingClientRect().top + window.pageYOffset);
    var o = h.getBoundingClientRect().top;
    
    if(window.pageYOffset > 0){ //h.offsetParent.offsetTop){
      if(!h.classList.contains("headerFixed")){
      	h.classList.add("headerFixed");
      }
    }else{
      h.classList.remove("headerFixed");
    }
  });
  */

  function setDetails(details){
	if(details.name){ 
  		document.getElementById("glaze-hdr-listname").innerHTML = details.name ;
	}
	
	//document.getElementById("glaze-back-to-menu").show();	
	$("#glaze-back-to-menu").show();	
  	
	//document.getElementById("glaze-hdr-depth").innerHTML = details.stats.depth || "?";
    	//document.getElementById("glaze-hdr-numlists").innerHTML = details.stats.numlists || "?";
    	//document.getElementById("glaze-hdr-numitems").innerHTML = details.stats.numitems || "?";
    	//document.getElementById("glaze-hdr-distinct").innerHTML = details.stats.distictitems || "?";
    	document.getElementById("glaze-hdr-link").href = 'https://www.boardgamegeek.com/' + (details.type === "preview" ? "geekpreview/" : "geeklist/") + details.objectid ;
    	//var e = document.getElementById("glaze-hdr-update");
    
    	//e.innerHTML = details.update ? "ACTIVE" : "INACTIVE";
    	//e.className = "syncStatus " + (details.update ? "syncActive" : "syncInactive");
    
    	//document.getElementById("glaze-hdr-chgts").innerHTML = details.stats.chgts || "Who knows when it was last updated?";
  }
  
  function getSampleData(){
    return [
              {
                "_id":"14995",
                "_rev":"1-5496205be34b5cccb88bab0203a723de",
                "type":"geeklist",
                "name":"Essen 2006 Canonical List",
                "group":"Essen",
                "year":2006,
                "update":false,
                "objectid":14995,
                "visible":true,
                "fromDate":"2016-12-31",
                "toDate":"2017-10-29",
                "excluded":[],
                "tradeLists":[],
                "stats": {}
              }
  	]
  }
  
  return {
  	"toggleLoadingEffect": toggleLoadingEffect,
    "setDetails": setDetails,
    "getSampleData": getSampleData
  }
}
