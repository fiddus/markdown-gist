'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true,
                ignores: ['node_modules/**/*']
            },
            all: ['./**/*.js']
        },

        jscs: {
            src: [
                'lib/**/*.js',
                'specs/**/*.js',
                'Gruntfile.js'
            ],
            options: {
                config: '.jscsrc',
                verbose: true
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'specs'
                }
            },
            src: ['specs/**/*Test.js']
        }
    });

    grunt.registerTask('check', [
        'jshint',
        'jscs'
    ]);

    grunt.registerTask('test', [
        'check',
        'mochaTest'
    ]);
};
