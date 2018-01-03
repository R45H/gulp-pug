var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	bs   = require('browser-sync'); // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.plumber())
			.pipe($.if(!options.prod, $.sourcemaps.init()))
			.pipe($.include())
			.pipe($.if(options.prod, $.uglify()))
			.pipe($.rename({suffix: '.min'}))
			.pipe($.if(!options.prod, $.sourcemaps.write()))
			.pipe(gulp.dest(options.dist))
			.pipe(bs.stream());
	}
};