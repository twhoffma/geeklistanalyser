(
	function(){
		var ui;
		var data;
		var selectedGeeklist = 0;
		
		$(document).ready(function(){
			ui = init_ui();
			data = init_data();
			
			var h = ui.getHistory();
					
			data.getGeeklists().then(function(r){
				ui.renderMenuGeeklists(r);
			});

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
				//enableMenuButtons(false);
				
				selectedGeeklist = this.dataset.geeklistid;
						
				/*
				data.loadGeeklistFilters(selectedGeeklist).then(function(r){
					
				});
				
				ui.resetFilters();
				ui.resetSorting();
				ui.enableSpinner();
				*/
				data.getGeeklist(selectedGeeklist).then(function(r){
					ui.renderGeeklist(r, '', selectedGeeklist, true);
				});
				
				/*	
				$('#listname').html($(this).text());
				enableMenuButtons(true);
				setLoadButtonState(true);
				*/
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
		});
	}
)();
