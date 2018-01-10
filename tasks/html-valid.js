var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')();

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.w3cjs())
			.pipe($.w3cjs.reporter());
	}
};