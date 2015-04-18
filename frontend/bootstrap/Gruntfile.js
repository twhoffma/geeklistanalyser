module.exports = function(grunt) {
	//Initializing the configuration object
    grunt.initConfig({

        // Task configuration
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
  	grunt.loadNpmTasks('../../node_modules/grunt-contrib-concat');
  	//grunt.loadNpmTasks('grunt-contrib-watch');
  	//grunt.loadNpmTasks('grunt-contrib-less');
  	//grunt.loadNpmTasks('grunt-contrib-uglify');
  	//grunt.loadNpmTasks('grunt-phpunit');

 	// Task definition
  	grunt.registerTask('default', ['concat']);
};
