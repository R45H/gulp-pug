var
	gulp         = require('gulp'),
	$            = require('gulp-load-plugins')(),
	mqpacker     = require('css-mqpacker'),           // PostCSS | Объединение медиа запросов
	sortMqpacker = require('sort-css-media-queries'), // PostCSS | Правильная сортировка для mqpacker
	bs           = require('browser-sync');           // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.plumber())
			.pipe($.if(!options.prod, $.sourcemaps.init()))
			.pipe($.sassGlob())
			.pipe($.sass())
			.pipe($.postcss([
				mqpacker({
					sort: sortMqpacker
				})
			]))
			.pipe($.if(options.prod, $.autoprefixer(['last 15 versions', '>1%'])))
			.pipe($.if(options.prod, $.cssbeautify({
				indent: '\t'
			})))
			.pipe($.if(!options.prod, $.sourcemaps.write()))
			.pipe(gulp.dest(options.dist))
			.pipe(bs.stream());
	}
};