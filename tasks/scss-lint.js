var
	gulp       = require('gulp'),
	$          = require('gulp-load-plugins')(),
	stylelint  = require('stylelint'), // Для проверки кода
	reporter   = require('postcss-reporter'), // PostCSS | Для вывода сообщений от других плагинов
	scssSyntax = require('postcss-scss'); // PostCSS | Синтаксис SCSS

module.exports = function(options) {
	return function() {

		return gulp.src(options.src)
			.pipe($.plumber())
			.pipe($.postcss([
				stylelint(),
				reporter({
					clearReportedMessages: true
				})
			], {syntax: scssSyntax}));
	}
};