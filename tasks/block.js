var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	del  = require('del'), // Для удаления файлов и папок
	fs   = require('fs'); // Чтение и запись файлов

module.exports = function(options) {
	return function(done) {

		var
			name = $.util.env.name || $.util.env.n, // Имя блока
		
			dirBlocks = options.dirBlocks, // Полный путь до папки с блоками
			dirTemp = options.dirTemp, // Полный путь до папки с вёрсткой
		
			dirThis = dirBlocks + name + '/', // Полный путь до папки с текущим блоком
			dirThisRel = options.relBlocks + name + '/', // Относительный путь до папки с текущим блоком
		
			keyScss = $.util.env.scss || $.util.env.s, // Ключ генерации SCSS файла
			keyJs = $.util.env.js || $.util.env.j, // Ключ генерации JS файла
			keyPugMixin = $.util.env.mixins || $.util.env.mixin || $.util.env.mix || $.util.env.m, // Ключ генерации PUG миксина
			keyPugComp = $.util.env.components || $.util.env.component || $.util.env.comp || $.util.env.c, // Ключ генерации PUG компонента
			keyPugPart = $.util.env.partials || $.util.env.partial || $.util.env.part || $.util.env.p, // Ключ генерации PUG части страницы
			keyDataJson = $.util.env.json || $.util.env.o; // Ключ генерации JSON
		
		// Генерация SCSS при запуске без ключей
		if (!keyScss && !keyJs && !keyPugMixin && !keyPugComp && !keyPugPart && !keyDataJson) {
		
			fs.access(dirBlocks + name + '.js', function(err) {
		
				if (err) {
					addScss(dirBlocks, options.relBlocks);
				} else {
					moveJsToFolder();
					addScss(dirThis, dirThisRel);
				}
			});
		}
		// =====
		
		// Генерация SCSS и JS файлов
		if (keyScss) {
		
			if (keyJs) {
				fs.mkdirSync(dirThis);
				addScss(dirThis, dirThisRel);
				addJs(dirThis, dirThisRel);
			} else {
		
				fs.access(dirBlocks + name + '.js', function(err) {
		
					if (err) {
						addScss(dirBlocks, options.relBlocks);
					} else {
						moveJsToFolder();
						addScss(dirThis, dirThisRel);
					}
				});
			}
		} else {
		
			if (keyJs) {
		
				fs.access(dirBlocks + name + '.scss', function(err) {
		
					if (err) {
						addJs(dirBlocks, options.relBlocks);
					} else {
						moveScssToFolder();
						addJs(dirThis, dirThisRel);
					}
				});
			}
		}
		// =====
		
		// Генерация PUG миксина
		if (keyPugMixin) {
			addPugMixin(dirTemp);
		}
		// =====
		
		// Генерация PUG компонента
		if (keyPugComp) {
			addPugComp(dirTemp);
		}
		// =====
		
		// Генерация PUG части страницы
		if (keyPugPart) {
			addPugPart(dirTemp);
		}
		// =====
		
		// Генерация JSON файла
		if (keyDataJson) {
			addDataJson(dirTemp);
		}
		// =====
		
		function addScss(path, relPath) {
			var
				str =
					'$name: ' + name + ';\r\n' +
					'\r\n' +
					'.#{$name} {\r\n' +
					'\t\r\n' +
					'}',
				pathToMain = options.src + 'style.scss',
				inc = '\r\n@import url(\'' + relPath + name + '.scss\');';
		
			fs.writeFileSync(path + name + '.scss', str);
			fs.appendFileSync(pathToMain, inc);
		}
		
		function addJs(path, relPath) {
		
			fs.writeFileSync(
				path + name + '.js',
				''
			);
		
			fs.appendFileSync(
				options.src + 'script.js',
				'\r\n(function() { @@include(\'' + relPath + name + '.js\') }());'
			);
		}
		
		function addPugMixin(path) {
		
			fs.writeFileSync(
				path + 'mixins/' + name + '.pug',
				'mixin ' + name + '(data)\r\n\t'
			);
		}
		
		function addPugComp(path) {
		
			fs.writeFileSync(
				path + 'components/' + name + '.pug',
				''
			);
		}
		
		function addPugPart(path) {
		
			fs.writeFileSync(
				path + 'partials/' + name + '.pug',
				''
			);
		}
		
		function addDataJson(path) {
			name = name.replace(new RegExp('-', 'g'), '_');
		
			var str =
				'{\r\n' +
				'\t"' + name + '": [\r\n' +
				'\t\t{\r\n' +
				'\t\t\t\r\n' +
				'\t\t}\r\n' +
				'\t]\r\n' +
				'}';
		
			fs.writeFileSync(path + 'data/' + name + '.json', str);
		}
		
		function moveJsToFolder() {
		
			fs.mkdirSync(dirThis);
		
			gulp.src(dirBlocks + name + '.js')
				.pipe(gulp.dest(dirThis));
		
			gulp.src(options.src + 'script.js')
				.pipe($.replace(
					'@@include(\'' + options.relBlocks + name + '.js\')',
					'@@include(\'' + dirThisRel + name + '.js\')'
				))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}));
		
			return del(dirBlocks + name + '.js');
		}
		
		function moveScssToFolder() {
		
			fs.mkdirSync(dirThis);
		
			gulp.src(dirBlocks + name + '.scss')
				.pipe(gulp.dest(dirThis));
		
			gulp.src(options.src + 'style.scss')
				.pipe($.replace(
					'@import url(\'' + options.relBlocks + name + '.scss\');',
					'@import url(\'' + dirThisRel + name + '.scss\');'
				))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}));
		
			return del(dirBlocks + name + '.scss');
		}
		
		done();
	}
}