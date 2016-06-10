var gulp = require('gulp'),
    _ = require('lodash'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    inquirer = require('inquirer');

gulp.task('default', function (done) {
  inquirer.prompt([
    {type: 'input', name: 'name', message: 'Give your module a name (hyphenated)', default: gulp.args[0]}, // Get app name from arguments by default
    {type: 'input', name: 'contName', message: 'Give your controller a name (hyphenated)', default: (typeof gulp.args[1] != 'undefined') ? gulp.args[1] : gulp.args[0]}, // Get app name from arguments by default
    {type: 'list', name: 'type', message: 'What would you like to generate?', default: 'controller', choices: ['controller', 'module']},
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
        answers[key+'LCamel'] = _.camelCase(value);
        answers[key+'UCamel'] = _.upperFirst(answers[key+'LCamel']);
    });
    //console.log(answers);

    if(answers.type === 'controller') {

      gulp.src([
        //__dirname + '/templates/module/scripts/*.js',
        //__dirname + '/templates/module/views/*.html'
        __dirname + '/templates/module/**',
        '!'+__dirname + '/templates/module/module.js',
      ])  // Note use of __dirname to be relative to generator
        .pipe(template(answers))                 // Lodash template support
        .pipe(rename(function(file) {
            // if script
            if (file.dirname === 'scripts' && file.extname === '.js') {
                file.basename = answers.contNameUCamel+'Controller';
            }
            // if view
            if (file.dirname === 'views' && file.extname === '.html') {
                file.basename = answers.contName;
            }
        }))
        .pipe(conflict('./'+answers.name), { cwd: '.' })                    // Confirms overwrites on file conflicts
        .pipe(gulp.dest('./'+answers.name), { cwd: '.' })                   // Without __dirname here = relative to cwd
        .pipe(install())                         // Run `bower install` and/or `npm install` if necessary
        .on('end', function () {
          done();                                // Finished!
        })
        .resume();


    }

    if(answers.type === 'module') {

      gulp.src(__dirname + '/templates/module/**/*')  // Note use of __dirname to be relative to generator
        .pipe(template(answers))                 // Lodash template support
        .pipe(rename(function(file) {
            // if root controller
            if (file.dirname === '.' && file.extname === '.js') {
                file.basename = answers.nameLCamel;
            }
            // if script
            if (file.dirname === 'scripts' && file.extname === '.js') {
                file.basename = answers.contNameUCamel+'Controller';
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

      }

    });
});