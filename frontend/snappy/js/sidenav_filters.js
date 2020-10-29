function init_sidebar_filters(){
	var sidenavTemplate = Handlebars.templates.sidenav_filters;
    
	var filternames = [
		{'name': 'boardgamedesigner', 'type': 'selectpicker'},
		{'name': 'boardgameartist',  'type': 'selectpicker'},
		{'name': 'boardgamemechanic',  'type': 'selectpicker'},
		{'name': 'boardgamecategory',  'type': 'selectpicker'},
		{'name': 'boardgamepublisher',  'type': 'selectpicker'},
		{'name': 'boardgamefamily',  'type': 'selectpicker'},
		{'name': 'releasetype', 'type': 'dropdown'},
		{'name': 'playingtime', 'type': 'slider', 'method': 'range'},
		{'name': 'numplayers', 'type': 'slider', 'method': 'range'},
		{'name': 'yearpublished', 'type': 'slider', 'method': 'pips'},
		{'name': 'playingtimemin', 'type': 'sliderValue', 'related': 'playingtime'},
		{'name': 'playingtimemax', 'type': 'sliderValue', 'related': 'playingtime'},
		{'name': 'numplayersmin', 'type': 'sliderValue', 'related': 'numplayers'},
		{'name': 'numplayersmax', 'type': 'sliderValue', 'related': 'numplayers'},
		{'name': 'yearpublishedmin', 'type': 'sliderValue', 'related': 'yearpublished'},
		{'name': 'yearpublishedmax', 'type': 'sliderValue', 'related': 'yearpublished'}
	]; 
	
	var filterDropdownIds = [
		'boardgameartist', 
		'boardgamedesigner', 
		'boardgamemechanic', 
		'boardgamecategory', 
		'releasetype', 
		'boardgamepublisher',
		'boardgamefamily'
	];

	var sortingDefault = {
		'sortby': 'crets',
		'ascending': 0
	};
	
      	function renderSidenav(filter){
		//TODO: We need to split this into slider filters and selectpickers.. Handlebars will to the rendering SelectPicker
        	document.getElementById("sidenavFilters").innerHTML = geeklistsTemplate({filters: filter});
      	}
      
      	//Reset event
      	document.querySelectorAll(".glaze-sidenav-reset-button").forEach(b=>b.addEventListener('click', function(e){
	    		console.log("Reset button in sidenav clicked!); 
        	})
      	);
	
	function getSliderValue(id){
		var s = document.getElementById(id);
		var v = s.noUiSlider.get();	

		return {'name': id, 'min': parseInt(v[0]), 'max': parseInt(v[1])}
	}
    
	function getSorting(){
		return {
			'sortby': $("#sortby").val(),
			'ascending': $("input[name='sortby_asc']:checked").val()
		};
	}
		
	function setSorting(sorting = {}){
		var sortby;
		var ascending;
			
		sortby = sorting.sortby || sortingDefault.sortby;
		ascending = sorting.ascending || sortingDefault.ascending;
			
		$("#sortby").val(sortby);
		$("input[name='sortby_asc']:checked").val(ascending);
	}
	
		
	function populateFilters(r){
		filternames.forEach(function(e){
			var defaults;
			
			if(r[e.name] !== undefined){
				var v = r[e.name];	
				var el = $('#' + e.name);
				
				
				if(e.type === 'selectpicker' || e.type === 'dropdown'){
					populateSelectPicker(el, v, e, f);
				}else if(e.type === 'slider'){
					populateSlider(el, v, e)
				}
			}else{
			}
		});		
	}
	
	function populateSlider(el, v, e){
		var s = document.getElementById(e.name);
		
		if(s.noUiSlider){
			s.noUiSlider.destroy();
		}
		
		if(e.method === 'range'){
			noUiSlider.create(s, {range: v, start: [v.min, v.max], step: 1});
				
			defaults = {'min': v.min, 'max': v.max};
		}else if(e.method === 'pips'){
			//TODO: Make it snap to only given values. Need to generate {min: , max:, '10%':, ...}
			var v = v.map(function(e){return parseInt(e)}).sort((a,b) => (a - b));
			
			var rng = {};
			var key = '';
			
			rng['min'] = Math.min.apply(null, v);
			rng['max'] = Math.max.apply(null, v);
			
			for(var i = 0; i < v.length; i++){
				if(v[i] > rng['min'] && v[i] < rng['max']){ 
					rng[Math.round((i+1)/v.length*100) +'%'] = v[i];
				}
			}

			//console.log(rng);
			
			noUiSlider.create(s, {
				start: [rng['min'], rng['max']],
				range: rng,
				snap: true
			});
			
			defaults = {'min': Math.min.apply(null, v), 'max': Math.max.apply(null, v)};
		}
		
		currentFilterDefaults[e.name] = defaults;
		 
		s.noUiSlider.on('set', function(){
			var v = s.noUiSlider.get();
			$(s).parent().find("input.min").val(parseInt(v[0]));
			$(s).parent().find("input.max").val(parseInt(v[1]));
		});

		$(s).parent().find("input").on('change', function(e){
			var min = parseInt($(s).parent().find("input.min").val());
			var max = parseInt($(s).parent().find("input.max").val());
			s.noUiSlider.set([min,max]);
		});
		
		s.noUiSlider.set();
	}
	
	function populateSelectPicker(el, v, e, f){
		el.find('option').remove();
		el.append('<option value="">Any</option>');
		
		v.forEach(function(f){
			el.append('<option value="' + f.objectid + '" data-obs="' + f.value + '">' + f.name + '</option>');
		});
		
		if(e.type === 'selectpicker'){
			el.selectpicker('refresh');
		}

	}
			
	function setFilters(filter){
		var el;

		if(filter === undefined){
			return
		}
		
		filternames.forEach(function(e){
			if(filter[e.name] !== undefined){
				el = $('#'+e.name);

				if(e.type === 'selectpicker'){
					el.selectpicker('val', parseInt(filter[e.name]));
				}else if(e.type === 'dropdown'){
					el.val(filter[e.name]);
				}else if(e.type === 'sliderValue'){
					var s = document.getElementById(e.related);
					
					if(filter[e.related + 'min']){
						s.noUiSlider.set([parseInt(filter[e.related + 'min']), null]);
					}
					
					if(filter[e.related + 'max']){
						s.noUiSlider.set([null, parseInt(filter[e.related + 'max'])]);
					}
				}
			} 
		});
	}
		
	function getFilters(){
		var filter = {};	
			
		filternames.forEach(function(e){
			if(e.type === 'selectpicker' || e.type === 'dropdown'){
				if($('#'+e.name).val() !== null && $('#'+e.name).val() !== ''){
					filter[e.name] = $('#'+e.name).val();
				}
			}else if(e.type === 'slider'){
				var v = getSliderValue(e.name);
				
				if(v['min'] > currentFilterDefaults[e.name]['min']){
					console.log(e.name + " " + v['min'] + " is greather than " + currentFilterDefaults[e.name]['min']);
					
					filter[e.name + 'min'] = v['min'];
				}
				
				if(v['max'] < currentFilterDefaults[e.name]['max']){
					console.log(e.name + " " + v['max'] + " is lower than " + currentFilterDefaults[e.name]['max']);
					filter[e.name + 'max'] = v['max'];
				}
				/*
				v.forEach(function(f){

					console.log(f.name);
					filter[f.name] = f.value;
				});	
				*/
			}
		});
		
		return filter
	}
	
      	return {
        	"renderSidebarFilters": renderSidenav,
		"getSliderValue": getSliderValue,
		"setSorting": setSorting,
		"getSorting": getSorting,
		'setFilters': setFilters,
		'getFilters': getFilters
      	}
}
