module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # CoffeeScript compilation
    coffee:
      spec:
        options:
          bare: true
        expand: true
        cwd: 'spec'
        src: ['**.coffee']
        dest: 'spec'
        ext: '.js'

    # Browser version building
    exec:
      install:
        command: './node_modules/.bin/component install -d'
      build:
        command: './node_modules/.bin/component build -u component-json,component-coffee -o browser -n oflo-runtime -d'

    # Automated recompilation and testing when developing
    watch:
      files: ['spec/*.coffee', 'runtime/*.js']
      tasks: ['test']

    # BDD tests on browser
    mocha_phantomjs:
      options:
        output: 'spec/result.xml'
        reporter: 'dot'
      all: ['spec/localrunner.html']

    # Coding standards
    coffeelint:
      components: ['components/*.coffee']

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-contrib-coffee'
  @loadNpmTasks 'grunt-exec'

  # Grunt plugins used for testing
  @loadNpmTasks 'grunt-contrib-watch'
  @loadNpmTasks 'grunt-mocha-phantomjs'
  @loadNpmTasks 'grunt-coffeelint'

  # Our local tasks
  @registerTask 'build', ['exec']
  @registerTask 'test', ['coffeelint', 'build', 'coffee', 'mocha_phantomjs']
  @registerTask 'default', ['test']
