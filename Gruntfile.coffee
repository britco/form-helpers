module.exports = (grunt) ->
	# Package
	# =======
	pkg = require './package.json'

	# Configuration
	# =============
	grunt.initConfig
		pkg: pkg
		concat:
			dist:
				src: ['src/global.js', 'src/*.js', 'src/**/*.js']
		uglify:
			options:
				mangle: false
				compress: false
				beautify: true
				wrap: 'globals'
				preserveComments: 'some'
				banner: '''
				/*!
				 * Form helpers
				 * @author Paul Dufour
				 * @company Brit + Co
				 */

				 '''
			dist:
				src: ['<%= pkg.distDirectory %>/<%= pkg.name %>-latest.js']
				dest: '<%= pkg.distDirectory %>/<%= pkg.name %>-<%= pkg.version %>.js'
		watch:
			files: ['src/*.js', 'src/**.js']
			tasks: ['concat']

	# Dev / prod toggles
	if process.env['DEV'] is 'true'
		grunt.config.set('concat.dist.dest', '<%= pkg.devDistDirectory %>/<%= pkg.name %>-latest.js')
		grunt.config.set('uglify.dist.dest', '<%= pkg.devDistDirectory %>/<%= pkg.name %>-<%= pkg.version %>.js')
	else
		grunt.config.set('concat.dist.dest', '<%= pkg.distDirectory %>/<%= pkg.name %>-latest.js')
		grunt.config.set('uglify.dist.dest', '<%= pkg.distDirectory %>/<%= pkg.name %>-<%= pkg.version %>.js')

	# Dependencies
	# ============
	for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
		grunt.loadNpmTasks name

	# Tasks
	# =====
	grunt.registerTask 'build', ->
		# Build for release
		grunt.task.run 'concat'

		if process.env?.DEV != 'true'
			grunt.task.run 'uglify'