module.exports = function(grunt) {
	
	//Initializing the configuration object
    grunt.initConfig({

        // Task configuration
		copy: {
  			main: {
    			files: [
      	  	  // includes files within path
      	  	  		{
						expand: true, 
						src: [
							'css/*', 
							'img/*', 
							'index.html'
						], 
						dest: '/var/www/hoffy.no/geeklistmonitor/', 
						filter: 'isFile'
					},
      	  	  		{
						expand: true,
						flatten: true, 
						src: [
							'bower_components/bootstrap/dist/css/*',
							'node_modules/jquery-ui/themes/base/slider.css', 
							'node_modules/bootstrap-slider/dist/css/*',
							'node_modules/bootstrap-multiselect/dist/css/bootstrap-multiselect.css',
							'node_modules/bootstrap-select/dist/css/bootstrap-select.min.css',
						], 
						dest: '/var/www/hoffy.no/geeklistmonitor/css/', 
						filter: 'isFile'
					},
      	  	  		{
						expand: true,
						flatten: true, 
						src: [
							'bower_components/bootstrap/dist/fonts/*', 
						], 
						dest: '/var/www/hoffy.no/geeklistmonitor/fonts/', 
						filter: 'isFile'
					},
					{
						expand: true,
						flatten: true,
						src: [
							'node_modules/jquery-ui/ui/jquery-1-7.js',
							'node_modules/bootstrap-slider/dist/bootstrap-slider.min.js',
							'node_modules/bootstrap-multiselect/dist/js/bootstrap-multiselect.js',
							'node_modules/bootstrap-select/dist/js/bootstrap-select.min.js',
							'node_modules/html5-history-api/history.min.js',
							'./js/data.js',
							'./js/ui.js',
							'./js/ui.slider.js',
							'./js/app.js',
						],
						dest: '/var/www/hoffy.no/geeklistmonitor/js/',
						filter: 'isFile'
					}
      	  	  		// includes files within path and its sub-directories
      	  	  		//{expand: true, src: ['path/**'], dest: 'dest/'},

      	  	  		// makes all src relative to cwd
      	  	  		//{expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},

      	  	  		// flattens results to a single level
      	  	  		//{expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'},
    			],
  	  		},
		},
        concat: {
			options: {
            	separator: ';',
      		},
			'default':	{
        		src: [
        		  	'./bower_components/jquery/dist/jquery.js',
       			  	'./bower_components/bootstrap/dist/js/bootstrap.js'
        		],
        		dest: '/var/www/hoffy.no/geeklistmonitor/js/frontend.js'
      			},
			'jquery-ui-custom':	{
				src: [
					'./node_modules/jquery-ui/ui/jquery-1.7.js',
					'./node_modules/jquery-ui/ui/core.js',
					'./node_modules/jquery-ui/ui/widget.js',
					'./node_modules/jquery-ui/ui/keycode.js',
					'./node_modules/jquery-ui/ui/widgets/mouse.js',
					'./node_modules/jquery-ui/ui/widgets/slider.js',
				],
				dest: '/var/www/hoffy.no/geeklistmonitor/js/jquery-ui-custom.js'
			}
		},
        cssmin: {
			target: {
				files: [{
					expand: true,
      				cwd: 'public/css',
      				src: ['*.css', '!*.min.css'],
      				dest: 'public/css',
      				ext: '.min.css'
    			}],
  			},
		},
        less: {
          //...
        },
        uglify: {
          //...
        },
        phpunit: {
          //...
        },
        watch: {
          //...
        }
	});

    // Plugin loading
    grunt.loadNpmTasks('grunt-contrib-copy');
  	grunt.loadNpmTasks('grunt-contrib-concat');
  	grunt.loadNpmTasks('grunt-contrib-cssmin');
  	//grunt.loadNpmTasks('grunt-contrib-watch');
  	//grunt.loadNpmTasks('grunt-contrib-less');
  	//grunt.loadNpmTasks('grunt-contrib-uglify');
  	//grunt.loadNpmTasks('grunt-phpunit');
	
 	// Task definition
  	grunt.registerTask('default', ['concat', 'copy']);
  	grunt.registerTask('prod', ['concat', 'copy', 'cssmin']);
};
