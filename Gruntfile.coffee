module.exports = (grunt) ->
	# Package
	# =======
	pkg = require './package.json'

	if process.env['DEV'] is 'true'
		pkg.distDirectory = pkg.devDistDirectory

	# Configuration
	# =============
	grunt.initConfig
		pkg: pkg
		concat:
			dist:
				src: [
					'src/global.js',
					'src/*.js',
					'src/**/*.js'
				]
				dest: '<%= pkg.distDirectory %>/<%= pkg.name %>-latest.js'
		uglify:
			options:
				mangle: false
				compress: false
				beautify: true
				preserveComments: 'some'
				banner: '''
				/*!
				 * Form helpers
				 * @author Paul Dufour
				 * @company Brit + Co
				 */

				 '''
			dist:
				src: '<%= pkg.distDirectory %>/<%= pkg.name %>-latest.js'
				dest: '<%= pkg.distDirectory %>/<%= pkg.name %>-latest.js'
		watch:
			files: ['./src/**/*.js']
			tasks: ['concat','uglify']

	# Dependencies
	# ============
	for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
		grunt.loadNpmTasks name

	# Tasks
	# =====
	grunt.registerTask 'default', ->
		grunt.task.run 'concat'
		grunt.task.run 'uglify'
		grunt.task.run 'watch'

	grunt.registerTask 'build', ->
		# Build for release
		grunt.task.run 'concat'

		grunt.config.set('uglify.dist.dest',
			'<%= pkg.distDirectory %>/<%= pkg.name %>-<%= pkg.version %>.js'
		)

		grunt.task.run 'uglify'