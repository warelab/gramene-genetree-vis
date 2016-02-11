'use strict';

module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  var lessifyOptions = {
    plugins: [
      new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]})
    ]
  };

  grunt.initConfig({
    browserify: {
      options: {

        browserifyOptions: {
          debug: true
        },
        transform: [
          ['node-lessify', lessifyOptions],
          ['babelify', {presets: ["es2015", "react"]}]
        ]
      },
      dev: {
        src: './example.js',
        dest: 'build/bundle.js'

      },
      production: {
        browserifyOptions: {
          debug: false
        },
        src: '<%= browserify.dev.src %>',
        dest: '<%= browserify.dev.dest %>'
      }
    },

    watch: {
      browserify: {
        files: ['<%= browserify.dev.src %>', 'src/**/*.js', 'src/**/*.jsx', 'styles/**/*.less'],
        tasks: ['browserify:dev']
      }
    }
  });

  grunt.registerTask('default', ['browserify:dev', 'watch']);
  grunt.registerTask('package', ['browserify:production']);
};
