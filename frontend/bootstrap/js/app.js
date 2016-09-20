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
				
				loadGeeklist(h.id, true, false, true);
			}	
			
			$('#loadmore').on("click", function(){
				loadGeeklist(selectedGeeklist, false, false, false);
			});
				
			$('.dropdown-menu').on("click", ".geeklist-menu-item", function(){
				loadGeeklist(this.dataset.geeklistid, true, true, true);
			});
			
			$('button#sort,button#filter,button#apply').on("click", function(){
				loadGeeklist(selectedGeeklist, true, false, false);
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

			function loadGeeklist(geeklistId, clearList, clearOptions, clearInfo){
				var p = new Promise(function(resolve, reject){
					if(clearInfo){
						//Load geeklist info
						data.getGeeklistDetails(selectedGeeklist).then(function(r){
							return ui.renderGeeklistDetails(r);
						});
						
						//Load static geeklist filters
						data.getGeeklistFilters(selectedGeeklist).then(function(r){
							ui.populateFilters(r);
							ui.setFilters(filter);
							ui.setSorting(sorting);
							
							resolve();
						});
					}else{
						resolve();
					}	
				});
				
				if(geeklistId === undefined){
					return 
				}
				
			
				if(clearList){
					console.log("Reset.");	
					selectedGeeklist = geeklistId;
					
					//TODO: Get geeklist info and stats..
					
					//Clear list in UI preemptively. Looks better since it doesn't look like it is hanging.
					ui.clearGeeklist();
				}

				
				if(clearOptions){
					sorting = ui.sortingDefault;
					filter = {};	
				}

				p.then(function(){
					sorting = ui.getSorting();
					filter = ui.getFilters();

					ui.setHistory(selectedGeeklist, 0, 0, filter, sorting);
					
					//Load geeklist contents
					ui.setLoadButtonState("loading");
					var numLoaded = $('.gameline').length;
					data.getGeeklist(selectedGeeklist, numLoaded, filter, sorting).then(function(r){
						ui.renderGeeklist(r, '', selectedGeeklist, clearList);
						
						if(r.length < 100){
							ui.setLoadButtonState("finished");
						}else{
							ui.setLoadButtonState();
						}
						
					});
				});
			}
		});
	}
)();
