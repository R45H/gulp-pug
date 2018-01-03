var
	gulp     = require('gulp'),
	$        = require('gulp-load-plugins')(),
	pngquant = require('imagemin-pngquant'), // Для работы с PNG
	bs       = require('browser-sync'); // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.newer(options.dist))
			.pipe($.if(options.prod, $.imagemin({
				interlaced: true,
				progressive: true,
				use: [pngquant()]
			})))
			.pipe(gulp.dest(options.dist))
			.pipe(bs.stream());
	}
};