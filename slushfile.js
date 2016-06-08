var gulp = require('gulp'),
    _ = require('lodash'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    inquirer = require('inquirer');

gulp.task('default', function (done) {
  inquirer.prompt([
    {type: 'input', name: 'name', message: 'Give your module a name', default: gulp.args.join(' ')}, // Get app name from arguments by default
    {type: 'confirm', name: 'moveon', message: 'Continue?', default: 'y'}
  ],
  function (answers) {
    if (!answers.moveon) {
      return done();
    }

    var answers_old = answers;

    //console.log(answers_old);
    _.each(answers_old, function(value, key){
        //console.log(value);
        answers[key] = value;
        answers[key+'Cap'] = _.capitalize(value);
    });
    //console.log(answers);

    gulp.src(__dirname + '/templates/module/**/*')  // Note use of __dirname to be relative to generator
      .pipe(template(answers))                 // Lodash template support
      .pipe(rename(function(file) {
          // if root controller
          if (file.dirname === '.' && file.extname === '.js') {
              file.basename = answers.name;
          }
          // if script
          if (file.dirname === 'scripts' && file.extname === '.js') {
              file.basename = answers.nameCap+'Controller';
          }
          // if view
          if (file.dirname === 'views' && file.extname === '.html') {
              file.basename = answers.name;
          }
          //console.log(file);
      }))
      .pipe(conflict('./'+answers.name))                    // Confirms overwrites on file conflicts
      .pipe(gulp.dest('./'+answers.name))                   // Without __dirname here = relative to cwd
      .pipe(install())                         // Run `bower install` and/or `npm install` if necessary
      .on('end', function () {
        done();                                // Finished!
      })
      .resume();
  });
});