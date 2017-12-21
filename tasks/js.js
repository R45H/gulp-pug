var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	bs   = require('browser-sync'); // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.fileInclude())
			.pipe($.if(options.prod, $.jsbeautifier({
				indent_char: '\t',
				indent_size: 1
			})))
			.pipe(gulp.dest(options.dist))
			.pipe(bs.stream());
	}
}