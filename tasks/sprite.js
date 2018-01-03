var
	gulp = require('gulp'),
	sprite = require('gulp.spritesmith'); // Создание спрайтов

module.exports = function(options) {
	return function(done) {

		var data = gulp.src(options.src)
			.pipe(sprite({
				imgName: options.fName + '.png',
				cssName: options.fName + '.css'
			}));

		data.img.pipe(gulp.dest(options.dist)); // Картинка
		data.css.pipe(gulp.dest(options.dist)); // Стили

		done();
	}
};