var
	gulp   = require('gulp'),
	$      = require('gulp-load-plugins')(),
	fs     = require('fs'), // Чтение и запись файлов
	bs     = require('browser-sync'), // Автоперезагрузка браузера
	emitty = require('emitty').setup('app/templates', 'pug', { // Для инкрементальной сборки Pug
		makeVinylFile: true
	});

module.exports = function(options) {
	return function() {

		return new Promise(function(resolve, reject) {
			var sourceOptions = global.watch ? {read: false} : {};

			emitty.scan(global.emittyChangedFile).then(function() {
				gulp.src(options.src, sourceOptions)
					.pipe($.plumber())
					.pipe($.if(global.watch === true, emitty.filter(global.emittyChangedFile)))
					.pipe($.data(function(file) {
						return JSON.parse(fs.readFileSync(options.json))
					}))
					.pipe($.pug())
					.pipe($.if(options.prod, $.jsbeautifier({
						indent_char: '\t',
						indent_size: 1
					})))
					.pipe(gulp.dest(options.dist))
					.pipe(bs.stream())
					.on('end', resolve)
					.on('error', reject);
			});

			if (global.watch === 'json') {
				global.watch = true;
			}

			resolve();
		});
	}
};