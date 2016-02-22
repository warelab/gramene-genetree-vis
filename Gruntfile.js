'use strict';

module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    browserify: {
      options: {

        browserifyOptions: {
          debug: true
        }
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
