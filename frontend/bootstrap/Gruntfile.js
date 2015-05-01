module.exports = function(grunt) {
	
	//Initializing the configuration object
    grunt.initConfig({

        // Task configuration
		copy: {
  			main: {
    			files: [
      	  	  // includes files within path
      	  	  		{expand: true, src: ['css/*', 'bower_components/bootstrap/dist/css/*'], dest: 'public/', filter: 'isFile'},

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
      		js_frontend: {
        		src: [
        		  	'./bower_components/jquery/jquery.js',
       			  	'./bower_components/bootstrap/dist/js/bootstrap.js',
        			'./js/frontend.js'
        		],
        		dest: './public/js/frontend.js'
      		},
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
