/*
 * Documentation for Assemble
 * https://github.com/assemble/assemble-docs/
 *
 * Copyright (c) 2013 Upstage
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Internal lib
  grunt.util._.mixin(require('./src/helpers/mixins').init(grunt));

  // Report elapsed execution time of grunt tasks.
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({

    // Metadata for templates
    pkg      : grunt.file.readJSON('package.json'),
    helpers  : grunt.file.readJSON('src/templates/pages/helpers.json'), // config for "helpers" docs

    site     : grunt.file.readYAML('src/data/site.yml'),
    bootstrap: grunt.file.readYAML('src/less/bootstrap.yml'),
    ghpages  : grunt.file.readYAML('src/less/ghpages.yml'),


    less: {
      options: {
        imports: {reference: '<%= ghpages.globals %>'}
      },
      main: {
        src: ['<%= bootstrap.bundle.docs %>', '<%= ghpages.bundle.docs %>'],
        dest: '<%= site.destination %>/assets/css/assemble.css'
      },
      gist: {
        src: ['src/less/docs/gist-overrides.less'],
        dest: '<%= site.destination %>/assets/css/gist.css'
      },
      markdown: {
        src: ['src/less/components/markdown.less'],
        dest: '<%= site.destination %>/assets/css/markdown.css'
      }
    },

    assemble: {
      options: {
        prettify: {
          indent: 2,
          condense: true,
          padcomments: true
        },
        marked: {
          sanitize: false,
          mentions: true
        },
        production: true,
        helpers: 'src/helpers/*.js',
        today: '<%= grunt.template.today() %>',
        assets: '<%= site.destination %>/assets',
        partials: [
          'src/templates/includes/**/*.{hbs,md}',
          'src/templates/layouts/includes/*.hbs'
        ],
        data: ['src/data/*.{json,yml}', 'package.json'],
        layoutdir: 'src/templates/layouts',
        layout: 'default.hbs'
      },
      links: {
        options: {
          ext: '.hbs'
        },
        src: 'src/templates/includes/snippets/links-template.md.hbs',
        dest: 'src/templates/includes/snippets/links-generated.md.hbs',
      },
      docs: {
        options: {
          layout: 'docs.hbs'
        },
        files: [{
          expand: true,
          flatten: true,
          cwd: 'src/templates/pages',
          src: ['*.hbs'],
          dest: '<%= site.destination %>/'
        }, {
          expand: true,
          flatten: true,
          cwd: 'src/templates/pages/docs',
          src: ['*.hbs'],
          dest: '<%= site.destination %>/docs/',
          ext: '.html'
        }, {
          expand: true,
          flatten: true,
          cwd: 'src/templates/pages/contributing',
          src: ['*.hbs'],
          dest: '<%= site.destination %>/contributing/',
          ext: '.html'
        }]
      },
      helpers: {
        options: {
          flatten: true,
          engine: 'handlebars',
          layout: 'helpers.hbs',
          pages: '<%= helpers.pages %>' // 'src/templates/pages/helpers.json'
        },
        files: {
          '<%= site.destination %>/helpers/': ['src/templates/pages/helpers/index.hbs']
        },
      },
      boilerplates: {
        options: {
          layout: 'boilerplates.hbs'
        },
        files: [{
          expand: true,
          flatten: true,
          cwd: 'src',
          src: ['templates/pages/boilerplates/*.hbs'],
          dest: '<%= site.destination %>/boilerplates/',
          ext: '.html'
        }]
      }
    },

    copy: {
      docs: {
        files: [
          {expand: true, cwd: 'contributing', src: ['**'],     dest: '<%= site.destination %>/contributing'},
          {expand: true, cwd: 'docs',         src: ['**'],     dest: '<%= site.destination %>/docs'},
          {expand: true, cwd: './',           src: ['*.html'], dest: '<%= site.destination %>/'}
        ]
      }
    },

    // Before generating new files, clean out files from previous build.
    clean: {
      ghpages: ['<%= site.destination %>/**/*.html']
    }
  });

  // Set the base path for Bootstrap LESS library.
  grunt.config.set('vendor.base', 'vendor');

  // Load npm and local plugins.
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('assemble-less');
  grunt.loadNpmTasks('grunt-github-api');
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Default task to be run.
  grunt.registerTask('default', [
    'clean:ghpages',
    'assemble:helpers',
    'assemble',
    'less'
  ]);
};