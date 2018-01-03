var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	bs   = require('browser-sync'); // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.if(options.prod, $.svgmin()))
			.pipe($.svgSprite({
				mode: {
					symbol: { // Используется тег symbol
						dest: '.', // Отключение папки symbol
						sprite: options.fName // Имя файла
					}
				},
				shape: {
					id: {
						generator: function(name, file) {
							return 'svg-' + name.slice((name.lastIndexOf('\\') + 1) || 0, name.indexOf('.')); // Добавляем префикс svg- к ID
						}
					}
				}
			}))
			.pipe(gulp.dest(options.dist))
			.pipe(bs.stream());
	}
};