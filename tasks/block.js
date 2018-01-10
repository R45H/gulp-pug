var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	del  = require('del'), // Для удаления файлов и папок
	fs   = require('fs'); // Чтение и запись файлов

module.exports = function(options) {
	return function(done) {

		var
			name = $.util.env.name || $.util.env.n || options.name, // Имя блока
			comment = $.util.env.comment || $.util.env.cmt, // Комментарий для SCSS инклюда

			dirBlocks = options.dirBlocks, // Полный путь до папки с блоками
			dirTemp = options.dirTemp, // Полный путь до папки с вёрсткой

			dirThis = dirBlocks + name + '/', // Полный путь до папки с текущим блоком
			dirThisRel = options.relBlocks + name + '/', // Относительный путь до папки с текущим блоком

			keyScss = $.util.env.scss || $.util.env.s, // Ключ генерации SCSS файла
			keyJs = $.util.env.js || $.util.env.j, // Ключ генерации JS файла
			keyPugMixin = $.util.env.mixins || $.util.env.mixin || $.util.env.mix || $.util.env.m, // Ключ генерации PUG миксина
			keyPugComp = $.util.env.components || $.util.env.component || $.util.env.comp || $.util.env.c, // Ключ генерации PUG компонента
			keyPugPart = $.util.env.partials || $.util.env.partial || $.util.env.part || $.util.env.p, // Ключ генерации PUG части страницы
			keyDataJson = $.util.env.json || $.util.env.o // Ключ генерации JSON
		;

		// Генерация SCSS при запуске без ключей
		if (!keyScss && !keyJs && !keyPugMixin && !keyPugComp && !keyPugPart && !keyDataJson) {

			if (fs.existsSync(dirBlocks + name + '.scss')) {
				printMsg('err', 'Файл "' + name + '.scss" уже существует!');
			} else if (fs.existsSync(dirBlocks + name)) {
				printMsg('err', 'Папка "' + name + '" уже существует!');
			} else if (fs.existsSync(dirBlocks + name + '.js')) {
				moveJsToFolder();
				addScss(dirThis, dirThisRel);
			} else {
				addScss(dirBlocks, options.relBlocks);
			}
		}
		// =====

		// Генерация SCSS и JS файлов
		if (keyScss) {

			if (fs.existsSync(dirThis)) {
				printMsg('err', 'Папка "' + name + '" уже существует!');
			} else if (keyJs) {

				fs.mkdirSync(dirThis);

				if (fs.existsSync(dirBlocks + name + '.scss')) {
					moveScssToFolder();
				} else {
					addScss(dirThis, dirThisRel);
				}

				if (fs.existsSync(dirBlocks + name + '.js')) {
					moveJsToFolder();
				} else {
					addJs(dirThis, dirThisRel);
				}
			} else {

				if (fs.existsSync(dirBlocks + name + '.js')) {
					moveJsToFolder();
					addScss(dirThis, dirThisRel);
				} else {

					if (fs.existsSync(dirBlocks + name + '.scss')) {
						printMsg('err', 'Файл "' + name + '.scss" уже существует!');
					} else {
						addScss(dirBlocks, options.relBlocks);
					}
				}
			}
		} else {

			if (keyJs) {

				if (fs.existsSync(dirThis)) {
					printMsg('err', 'Папка "' + name + '" уже существует!');
					return false;
				}

				if (fs.existsSync(dirBlocks + name + '.scss')) {
					moveScssToFolder();
					addJs(dirThis, dirThisRel);
				} else {

					if (fs.existsSync(dirBlocks + name + '.js')) {
						printMsg('err', 'Файл "' + name + '.js" уже существует!');
					} else {
						addJs(dirBlocks, options.relBlocks);
					}
				}
			}
		}
		// =====

		// Генерация PUG миксина
		if (keyPugMixin) {

			if (fs.existsSync(dirTemp + 'mixins/' + name + '.pug')) {
				printMsg('err', 'Миксин "' + name + '.pug" уже существует!');
			} else {
				addPugMixin(dirTemp);
			}
		}
		// =====

		// Генерация PUG компонента
		if (keyPugComp) {

			if (fs.existsSync(dirTemp + 'components/' + name + '.pug')) {
				printMsg('err', 'Компонент "' + name + '.pug" уже существует!');
			} else {
				addPugComp(dirTemp);
			}
		}
		// =====

		// Генерация PUG части страницы
		if (keyPugPart) {

			if (fs.existsSync(dirTemp + 'partials/' + name + '.pug')) {
				printMsg('err', 'Включаемая область "' + name + '.pug" уже существует!');
			} else {
				addPugPart(dirTemp);
			}
		}
		// =====

		// Генерация JSON файла
		if (keyDataJson) {
			var fName = name.replace(new RegExp('-', 'g'), '_');

			if (fs.existsSync(dirTemp + 'data/' + fName + '.json')) {
				printMsg('err', 'Файл с данными "' + fName + '.json" уже существует!');
			} else {
				addDataJson(dirTemp);
			}
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
				pathToMain = options.src + 'style.scss', // Путь до диспетчера подключений
				placeIntoMain = '/* Blocks will be inserted here */', // Метка для вставки строки
				inc = '@import \'' + relPath + name + '\';', // Строка для вставки
				cmt = comment ? ' // ' + comment : ''; // Комментарий для SCSS инклюда

			fs.writeFileSync(path + name + '.scss', str);

			gulp.src(pathToMain)
				.pipe($.replace(
					placeIntoMain,
					inc + cmt + '\r\n' + placeIntoMain
				))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}));

			printMsg('ok', 'Файл "' + name + '.scss" создан!');
		}

		function addJs(path, relPath) {

			var
				pathToMain = options.src + 'script.js', // Путь до диспетчера подключений
				placeIntoMain = '/* Blocks will be inserted here */', // Метка для вставки строки
				inc = // Строка для вставки
					'(function() {\r\n' +
					'\t\t//=require \'' + relPath + name + '.js\'\r\n' +
					'\t}());';

			fs.writeFileSync(
				path + name + '.js',
				''
			);

			gulp.src(pathToMain)
				.pipe($.replace(
					placeIntoMain,
					inc + '\r\n\t' + placeIntoMain
				))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}));

			printMsg('ok', 'Файл "' + name + '.js" создан!');
		}

		function addPugMixin(path) {

			fs.writeFileSync(
				path + 'mixins/' + name + '.pug',
				'mixin ' + name + '(data)\r\n\t'
			);

			printMsg('ok', 'Миксин "' + name + '.pug" создан!');
		}

		function addPugComp(path) {

			fs.writeFileSync(
				path + 'components/' + name + '.pug',
				''
			);

			printMsg('ok', 'Компонент "' + name + '.pug" создан!');
		}

		function addPugPart(path) {

			fs.writeFileSync(
				path + 'partials/' + name + '.pug',
				''
			);

			printMsg('ok', 'Включаемая область "' + name + '.pug" создана!');
		}

		function addDataJson(path) {
			var fName = name.replace(new RegExp('-', 'g'), '_');

			var str =
				'{\r\n' +
				'\t"' + fName + '": [\r\n' +
				'\t\t{\r\n' +
				'\t\t\t\r\n' +
				'\t\t}\r\n' +
				'\t]\r\n' +
				'}';

			fs.writeFileSync(path + 'data/' + fName + '.json', str);

			printMsg('ok', 'Файл с данными "' + fName + '.json" создан!');
		}

		function moveJsToFolder() {

			if (!fs.existsSync(dirThis)) {
				fs.mkdirSync(dirThis);
			}

			gulp.src(dirBlocks + name + '.js')
				.pipe(gulp.dest(dirThis));

			gulp.src(options.src + 'script.js')
				.pipe($.replace(
					'//=require \'' + options.relBlocks + name + '.js\'',
					'//=require \'' + dirThisRel + name + '.js\''
				))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}));

			printMsg('ok', 'Файл "' + name + '.js" перенесён в папку "' + dirThis + '"!');

			return del(dirBlocks + name + '.js');
		}

		function moveScssToFolder() {

			if (!fs.existsSync(dirThis)) {
				fs.mkdirSync(dirThis);
			}

			gulp.src(dirBlocks + name + '.scss')
				.pipe(gulp.dest(dirThis));

			gulp.src(options.src + 'style.scss')
				.pipe($.replace(
					'@import \'' + options.relBlocks + name + '\';',
					'@import \'' + dirThisRel + name + '\';'
				))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}));

			printMsg('ok', 'Файл "' + name + '.scss" перенесён в папку "' + dirThis + '"!');

			return del(dirBlocks + name + '.scss');
		}

		function printMsg(state, str) {
			var
				reset = "\x1b[0m",
				fgColor = (state == 'ok') ? '\x1b[32m' : (state == 'err') ? '\x1b[31m' : reset;

			console.log(fgColor + '%s' + reset, str);
		}

		done();
	}
};