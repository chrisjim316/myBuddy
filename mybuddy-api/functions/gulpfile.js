const gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  config = require('./config')

const ENV = config.IN_DEV ? 'development' : 'production'

gulp.task('nodemon', function (done) {
  nodemon({
      script: 'index.js',
      levels: 10, // trace, show everything
      ignore: ['*.log'],
      nodeArgs: ['--inspect'],
      ext: 'js json',
      events: {
        start: `cat ./mybuddy.exe && echo 'Started myBuddy API (${ENV})'`,
        restart: "osascript -e 'display notification \"App restarted due to:\n'$FILENAME'\" with title \"nodemon\"'"
      },
      done: done
    })
})

gulp.task('default', gulp.parallel('nodemon'))