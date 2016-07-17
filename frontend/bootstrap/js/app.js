(
	function(){
		var ui;
		var data;
		var selectedGeeklist = 0;
		
		$(document).ready(function(){
			ui = init_ui();
			data = init_data();
			
			data.getGeeklists().then(function(r){
				ui.renderMenuGeeklists(r);
			});

			
			var h = ui.getHistory();
			console.log(h);
			
			if(h.id != undefined){
				selectedGeeklist = h.id;
				
				if(h.sorting != undefined){
					ui.setSorting(h.sorting);
				}
				
				data.getGeeklistFilters(h.id).then(function(r){
					//console.log(r);
					ui.populateFilters(r);
				});
				
				//TODO: Parse filters
				if(h.filters != undefined){
					ui.setFilters(h.filters);
					console.log(h.filters);
				}
				
				loadGeeklist(h.id);
			}	
				

			/*
			enableMenuButtons(false);
			
			//If deep-linking
			if(Object.keys(h).length !== 0){
				//XXX: Need to populate filter and sorting menu
				ui.populateFilterAndSorting(h);
					
				data.getGeeklist(h['id'], 0, h['filter'], h['sort'], h['sortby_asc']).then(function(v){
					ui.renderGeeklist(v, h['sort']);
				});
			}
				
			*/
			
			$('#loadmore').on("click", function(){
				//var filter = ui.getFilters();
				//var sorts = ui.getSorting();
				
				data.getGeeklist(selectedGeeklist, $('.gameline').length).then(function(r){
					ui.renderGeeklist(r, '', selectedGeeklist, false);
				});
			});
				
			$('.dropdown-menu').on("click", ".geeklist-menu-item", function(){
				loadGeeklist(this.dataset.geeklistid);
				/*
				var sorting;
				
				selectedGeeklist = this.dataset.geeklistid;
				
				sorting = ui.getSorting();
				console.log(sorting);
				
				data.getGeeklist(selectedGeeklist).then(function(r){
					ui.renderGeeklist(r, '', selectedGeeklist, true);
				});
				
			
					//enableMenuButtons(false);
				*/
						
				/*
				data.loadGeeklistFilters(selectedGeeklist).then(function(r){
					
				});
				
				ui.resetFilters();
				ui.resetSorting();
				ui.enableSpinner();
				*/

				/*	
				$('#listname').html($(this).text());
				enableMenuButtons(true);
				setLoadButtonState(true);
				*/
			});
			
			$('button#sort,button#filter').on("click", function(){
				loadGeeklist();
			});
			
			/*
			$('.selects').on("click", function(e){
				e.stopPropagation();
			});
			
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

			$('#resetSorting').on('click', function(){
				ui.resetSorting();
			});
			
			$('#resetFilters').on('click', function(){
				ui.resetFilters();
			});

			['#boardgamepublisher', '#boardgamedesigner'].forEach(function(e){
				$(e).selectpicker();
			});
			*/
			
			function loadGeeklist(geeklistId){
				var sorting;
				var filter;
				//enableMenuButtons(false);
				
				if(geeklistId != undefined){
					selectedGeeklist = geeklistId;
				}
				
				/*
				data.loadGeeklistFilters(selectedGeeklist).then(function(r){
					
				});
				
				ui.resetFilters();
				ui.resetSorting();
				ui.enableSpinner();
				*/
				
				if(selectedGeeklist != 0){	
					sorting = ui.getSorting();
					filter = ui.getFilters();
					ui.setHistory(selectedGeeklist, 0, 0, filter, sorting);
					
					//console.log(filters);
				
					data.getGeeklist(selectedGeeklist, 0, filter, sorting).then(function(r){
						ui.renderGeeklist(r, '', selectedGeeklist, true);
					});
				}
			}
		});
	}
)();
