var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	bs   = require('browser-sync'); // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.cssimport())
			.pipe($.sass({
				outputStyle: 'expanded'
			}))
			.pipe($.groupCssMediaQueries())
			.pipe($.if(options.prod, $.autoprefixer(['last 15 versions', '>1%'], {cascade: true})))
			.pipe(gulp.dest(options.dist))
			.pipe(bs.stream());
	}
}