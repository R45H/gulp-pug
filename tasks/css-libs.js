var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	bs   = require('browser-sync'); // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.plumber())
			.pipe($.if(!options.prod, $.sourcemaps.init()))
			.pipe($.cssimport())
			.pipe($.sass({
				outputStyle: options.prod ? 'compressed' : 'expanded'
			}))
			.pipe($.if(options.prod, $.stripCssComments({
				preserve: false
			})))
			.pipe($.rename({suffix: '.min'}))
			.pipe($.if(!options.prod, $.sourcemaps.write()))
			.pipe(gulp.dest(options.dist))
			.pipe(bs.stream());
	}
}