var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')();

module.exports = function(options) {
	return function() {

		if (global.watch) {
			global.watch = 'json';
		}

		return gulp.src(options.src)
			.pipe($.plumber())
			.pipe($.jsonmerge(options.fName))
			.pipe(gulp.dest(options.dist));
	}
};