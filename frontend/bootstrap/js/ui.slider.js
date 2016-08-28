function init_sliders(){
	/*
    $(".filterrangeslider").slider({
      range: true,
      min: 0,
      max: 500,
      values: [ 75, 300 ],
      slide: function( event, ui ) {
        console.log(ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    }
	*/
	var s = $('#playingtime')
	s.slider();
	console.log("sliders initialized");
	s.on('change', function(e){
		console.log(e.newValue);
		$(this).parent().children('input.minman').val(e.newValue[0]);
		$(this).parent().children('input.maxman').val(e.newValue[1]);
	});
}
