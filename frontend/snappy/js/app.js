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
			sidenav_geeklists = init_sidebar_geeklists();
			hdr = init_header();
				
			ui.clearErrorMessage();
							
			var h = ui.getHistory();
			
			data.getGeeklists().then(function(r){
				sidenav_geeklists.setGeeklistsSidebar(r);
				
				let filters = {};
				
				if(h.active !== undefined){
					filters['active'] = (h.active === "true");
				}
				
				if(h.listgroup !== undefined){
					filters['listgroup'] = h.listgroup;
				}
				
				if(h.listyear !== undefined){
					filters['listyear'] = parseInt(h.listyear);
				}
				
				if(h.listtype !== undefined){
					filters['listtype'] = h.listtype;
				}
				
				ui.renderMenuGeeklists(r, filters);
				
				if(h.id !== undefined){
					$('#geeklists').hide();
				}
			}).catch(function(e){
				ui.setErrorMessage(e);
			});
			
			//Render args in header
			ui.renderUntoggleLinks(h);
				
			//If id of a specific geeklist is in args, load that one.	
			if(h.id != undefined){
				$(".listHeaderButtons").show();
				$("#loadmore").show();
				
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
			}else{
				//$('#sidenavGeeklists').toggle();	
			}	
			
			$('#loadmore').on("click", function(){
				loadGeeklist(selectedGeeklist, false, false, false);
			});
				
			$('.dropdown-menu').on("click", ".geeklist-menu-item", function(){
				loadGeeklist(this.dataset.geeklistid, true, true, true);
			});
			
			$('#sidenavLists').on("click", ".geeklist-menu-item", function(){
				loadGeeklist(this.dataset.geeklistid, true, true, true);
				$('#sidenavGeeklists').toggle();	
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

			$('.listHeaderButton').on('click', function(e){
				if(e.target.tagName.toUpperCase() === 'I'){
					e = e.target.parentNode;
				}
				
				if(e.target.dataset.glazeShow == "sidebar_list"){
					$('#sidenavGeeklists').toggle();
				}else if(e.target.dataset.glazeShow == "geeklist"){
					$('#sidenavGeeklists').hide();
				}
			});
			
			function loadGeeklist(geeklistId, clearList, clearOptions, clearInfo){
				if(geeklistId === undefined){
					return 
				}
				
				var p = new Promise(function(resolve, reject){
					console.log("Start loading effect :)");
					hdr.toggleLoadingEffect();
					
					if(clearInfo){
						//Load geeklist info
						console.log("get some data!");
						data.getGeeklistDetails(geeklistId).then(function(r){
							//return ui.renderGeeklistDetails(r);
							let d = r[0];
							d.stats = {};
							hdr.setDetails(d);
							console.log(d);
						});
						
						//Load static geeklist filters
						data.getGeeklistFilters(geeklistId).then(function(r){
							ui.populateFilters(r);
							ui.setFilters(filter);
							ui.setSorting(sorting);
							
							console.log("All loaded");	
							resolve();
						});
					}else{
						console.log("Doing nothin'");
						resolve();
					}	
				}).catch(function(e){
					ui.setErrorMessage(e);
				});
				
				if(clearList){
					console.log("Reset.");	
					selectedGeeklist = geeklistId;
					
					//TODO: Get geeklist info and stats..
					
					//Clear list in UI preemptively. Looks better since it doesn't look like it is hanging.
					ui.clearGeeklist();
				}

				p.then(function(){
					if(clearOptions){
						sorting = ui.sortingDefault;
						filter = {};	
					}else{
						sorting = ui.getSorting();
						filter = ui.getFilters();
					}
					console.log("Options set");	
					ui.setHistory(selectedGeeklist, 0, 0, filter, sorting);
					var h = ui.getHistory();
					console.log(h);
					ui.renderUntoggleLinks(h);
					
					//Load geeklist contents
					ui.setLoadButtonState("loading");
					//var numLoaded = $('.gameline').length;
					var numLoaded = $('.bg').length;
					data.getGeeklist(selectedGeeklist, numLoaded, filter, sorting).then(function(r){
						ui.renderGeeklist(r, '', selectedGeeklist, clearList);
						
						console.log("Stop loading effect :)");	
						hdr.toggleLoadingEffect();
						if(r.length < 100){
							ui.setLoadButtonState("finished");
						}else{
							ui.setLoadButtonState();
						}
						
					});
				}).catch(function(e){	
					alert(e);
					ui.setErrorMessage(e);
				});
			}
		});
	}
)();
