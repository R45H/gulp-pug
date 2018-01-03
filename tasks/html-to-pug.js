var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')();

module.exports = function(options) {
	return function() {

		return gulp.src(options.src + 'index.html')
			.pipe($.html2pug({
				tabs: true,
				fragment: true
			}))
			.pipe(gulp.dest(options.src));
	}
};