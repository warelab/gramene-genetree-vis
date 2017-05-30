'use strict';

module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    browserify: {
      options: {

        browserifyOptions: {
          debug: true
        },
        transform: [
          ['babelify', {presets: ['es2015', 'react']}]
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

    less: {
      dev: {
        files: {
          "build/styles.css": "styles/tree.less"
        }
      }
    },

    watch: {
      browserify: {
        files: ['<%= browserify.dev.src %>', 'src/**/*.js', 'src/**/*.jsx'],
        tasks: ['browserify:dev']
      },
      styles: {
        files: ['**/*.less'],
        tasks: ['less:dev']
      }
    }
  });

  grunt.registerTask('default', ['less:dev', 'browserify:dev', 'watch']);
  grunt.registerTask('package', ['browserify:production']);
};
