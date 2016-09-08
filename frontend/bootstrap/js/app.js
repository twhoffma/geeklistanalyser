(
	function(){
		var ui;
		var data;
		var selectedGeeklist = 0;
		var sorting;
		var filter;
		
		$(document).ready(function(){
			ui = init_ui();
			data = init_data();
				
			data.getGeeklists().then(function(r){
				ui.renderMenuGeeklists(r);
			});

			
			var h = ui.getHistory();
			
			if(h.id != undefined){
				selectedGeeklist = h.id;
				
				if(h.sorting != undefined){
					ui.setSorting(h.sorting);
					sorting = h.sorting;
				}
				
				//Parse filters
				if(h.filters != undefined){
					filter = h.filters;
				}
				
				loadGeeklist(h.id, false);
			}	
			
			$('#loadmore').on("click", function(){
				//var filter = ui.getFilters();
				//var sorts = ui.getSorting();
				
				console.log("loading more from " + selectedGeeklist);	
				data.getGeeklist(selectedGeeklist, $('.gameline').length, filter, sorting).then(function(r){
					ui.renderGeeklist(r, '', selectedGeeklist, false);
				});
			});
				
			$('.dropdown-menu').on("click", ".geeklist-menu-item", function(){
				loadGeeklist(this.dataset.geeklistid, false);
			});
			
			$('button#sort,button#filter,button#apply').on("click", function(){
				loadGeeklist(selectedGeeklist, true);
			});
			
			$('body').on('shown.bs.modal', "#modSortingAndFilters", function (e) {
				ui.setFilters(filter);
			});
			
			$('#resetSorting').on('click', function(){
				ui.resetSorting();
			});
			
			$('#resetFilters').on('click', function(){
				ui.resetFilters();
			});

			function loadGeeklist(geeklistId, isUser){
				if(geeklistId === undefined){
					return 
				}else if(selectedGeeklist !== geeklistId){
					console.log("reset. New geeklist. Is " + geeklistId + " was " + selectedGeeklist);	
					selectedGeeklist = geeklistId;
					
					//TODO: Get geeklist info and stats..
					
					filter = {};
					sorting = ui.sortingDefault;

					//Clear list in UI preemptively. Looks better since it doesn't look like it is hanging.
					ui.clearGeeklist();
				}

				if(isUser === true){
					console.log("user");
					sorting = ui.getSorting();
					filter = ui.getFilters();
				}else{
					console.log("non-user/menu reload " + selectedGeeklist);
					
					//Load geeklist info
					data.getGeeklistDetails(selectedGeeklist).then(function(r){
						ui.renderGeeklistDetails(r);
					});
					
					//Load static geeklist filters
					data.getGeeklistFilters(selectedGeeklist).then(function(r){
						ui.populateFilters(r);
						ui.setFilters(filter);
						ui.setSorting(sorting);
							
						return true
					});
				}
				
				ui.setHistory(selectedGeeklist, 0, 0, filter, sorting);
				
				//Load geeklist contents
				ui.setLoadButtonState("loading");
				data.getGeeklist(selectedGeeklist, 0, filter, sorting).then(function(r){
					ui.renderGeeklist(r, '', selectedGeeklist, true);
					
					if(r.length < 100){
						ui.setLoadButtonState("finished");
					}else{
						ui.setLoadButtonState();
					}
					
				});
			}
		});
	}
)();
