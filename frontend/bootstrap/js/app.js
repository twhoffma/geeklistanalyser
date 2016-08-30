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
			sliders = init_sliders();
				
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
					//ui.setFilters(h.filters);
					console.log(h.filters);
					filter = h.filters;
				}
				
				loadGeeklist(h.id, false);
			}	
				

			/*
			enableMenuButtons(false);
			*/
			
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
			
			$('#tabFilters').on('shown.bs.tab', function (e) {
				//The bug seems related to that the modal dialog is not visible..
				ui.setFilters(filter);
			});
			
			$('#resetSorting').on('click', function(){
				ui.resetSorting();
			});
			
			$('#resetFilters').on('click', function(){
				ui.resetFilters();
			});

			$('#optionTabs a').click(function (e) {
  				e.preventDefault();
  				$(this).tab('show');
				console.log("changed tab");
			})
			/*	
			$('.selects').on("click", function(e){
				e.stopPropagation();
			});
			*/
			
			/*
			$('button#sort,button#filter').on("click", function(){
				loadGeeklist(selectedGeeklist, 10, 0);
			});

			$('#sortingModal').on('change', 'input,select', function(e){
				$('.glyphicon-sort-by-attributes').css('color', isDefaultSorting() ? 'black' : 'red');
				console.log("sorting change triggered!");
			});
			
			$('#filteringModal').on('change', 'input,select', function(e){
				$('.glyphicon-filter').css('color', isDefaultFilters() ? 'black' : 'red');
				console.log("filtering change triggered!");
			});


			['#boardgamepublisher', '#boardgamedesigner'].forEach(function(e){
				$(e).selectpicker();
			});
			*/
			
			function loadGeeklist(geeklistId, isUser){
				//var sorting;
				//var filter;
				//enableMenuButtons(false);
				
				
				if(geeklistId === undefined){
					return 
				}else if(selectedGeeklist !== geeklistId){
					console.log("reset. New geeklist. Is " + geeklistId + " was " + selectedGeeklist);	
					selectedGeeklist = geeklistId;
					
					//TODO: Get geeklist info and stats..
					
					filter = {};
					sorting = ui.sortingDefault;
				}

				if(isUser === true){
					console.log("user");
					sorting = ui.getSorting();
					filter = ui.getFilters();
					console.log(filter);	
				}else{
					data.getGeeklistFilters(selectedGeeklist).then(function(r){
						console.log("non-user/menu reload " + selectedGeeklist);
						//console.log(r);
						ui.populateFilters(r);
							
						//ui.resetFilters(filter);
						ui.setSorting(sorting);
							
						return true
					});
				}
				
				ui.setHistory(selectedGeeklist, 0, 0, filter, sorting);
				
				data.getGeeklist(selectedGeeklist, 0, filter, sorting).then(function(r){
					ui.renderGeeklist(r, '', selectedGeeklist, true);
				});
				
				/*
				data.loadGeeklistFilters(selectedGeeklist).then(function(r){
					
				});
				
				ui.resetFilters();
				ui.resetSorting();
				ui.enableSpinner();
				*/
				
				/*
				if(selectedGeeklist != 0){
					if(isUser === true){
						sorting = ui.getSorting();
						filter = ui.getFilters();
						
						console.log(sorting);
					}
					
					ui.setHistory(selectedGeeklist, 0, 0, filter, sorting);
					
					//console.log(filters);
				
					data.getGeeklist(selectedGeeklist, 0, filter, sorting).then(function(r){
						ui.renderGeeklist(r, '', selectedGeeklist, true);
					});
				}
				*/
			}
		});
	}
)();
