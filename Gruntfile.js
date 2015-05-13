'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true,
                ignores: ['node_modules/**/*']
            },
            all: ['./*.js']
        },

        jscs: {
            src: [
                'app.js',
                'test/**/*.js',
                'Gruntfile.js'
            ],
            options: {
                config: '.jscsrc',
                verbose: true
            }
        }
    });

    grunt.registerTask('check', [
        'jshint',
        'jscs'
    ]);
};
