var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')();

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.mergeJson({
				fileName: options.fName
			}))
			.pipe(gulp.dest(options.dist));
	}
}