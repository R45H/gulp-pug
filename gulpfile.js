/* ===== ПОДКЛЮЧЕНИЕ ПЛАГИНОВ ===== */
var
   gulp         = require('gulp'),                         // GULP
   sass         = require('gulp-sass'),                    // Препроцессор Sass
   browserSync  = require('browser-sync'),                 // Автоперезагрузка браузера
   uglify       = require('gulp-uglifyjs'),                // Сжатие JS
   rename       = require('gulp-rename'),                  // Для переименования файлов
   del          = require('del'),                          // Для удаления файлов и папок
   imagemin     = require('gulp-imagemin'),                // Для работы с изображениями
   pngquant     = require('imagemin-pngquant'),            // Для работы с PNG
   cache        = require('gulp-cache'),                   // Для кэширования
   autoprefixer = require('gulp-autoprefixer'),            // Автоматическое добавление префиксов
   include      = require('gulp-file-include'),            // Подключение файлов в другие файлы
   queries      = require('gulp-group-css-media-queries'), // Объединение медиа запросов
   sprite       = require('gulp.spritesmith'),             // Создание спрайтов
   plumber      = require('gulp-plumber'),                 // Перехват ошибок
   gutil        = require('gulp-util'),                    // Различные вспомогательные утилиты
   cssImport    = require('gulp-cssimport'),               // Работа @import
   strip        = require('gulp-strip-css-comments'),      // Убирает комментарии
   runSequence  = require('run-sequence'),                 // Для синхронного выполнения задач
   pug          = require('gulp-pug'),                     // Шаблонизатор Pug (бывший Jade)
   merge        = require('gulp-merge-json'),              // Конкатенация JSON
   data         = require('gulp-data'),                    // Парс JSON
   fs           = require('fs'),                           // Чтение и запись файлов
   prettify     = require('gulp-jsbeautifier'),            // Форматирование JS и HTML
   replace      = require('gulp-replace')                  // Замена текста в файлах
;
/* ================================ */



/* ========= ПЕРЕМЕННЫЕ =========== */

// Перезагрузка сервера
var reload = browserSync.reload;

// Перехват ошибок
var err = {
	errorHandler: function (error) {
		gutil.log('Error: ' + error.message);
		gutil.beep();
		this.emit('end');
	}
};

// Переключатель сборки для работы или в продакшн (false для работы)
var prod = gutil.env.p || gutil.env.production;

// Пути
var app = 'app/'; // Папка исходников
var dist = prod ? 'production/' : 'dist/'; // Папка готового проекта
var temp = 'temp/'; //Папка со служебными файлами

/* ================================ */



/* ===== ТАСК "BROWSER-SYNC" ====== */
gulp.task('browser-sync', function() {
	browserSync({ // Выполняем browserSync
		server: dist, // Директория для сервера
		notify: false, // Отключаем уведомления
		ghostMode: false // Отключаем синхронизацию между устройствами
	});
});
/* ================================ */

/* ========= ТАСК "JSON" ========== */
gulp.task('json', function() {
	return gulp.src(app + '/templates/data/**/*.json') // Возьмём файлы
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(merge({ // Сольём в один
			fileName: 'data.json'
		}))
		.pipe(gulp.dest(temp)); // Выплюнем
});
/* ================================ */

/* ========= ТАСК "PUG" ========== */
gulp.task('pug', function () {
	return gulp.src(app + 'templates/*.pug') // Выберем файлы по нужному пути
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(data(function(file) { // Парсим JSON
			return JSON.parse(fs.readFileSync('temp/data.json'))
		}))
		.pipe(pug()) // Сконвертим в HTML
		.pipe(prod ? prettify({ // Форматируем код
			indent_char: '\t',
			indent_size: 1
		}) : gutil.noop())
		.pipe(gulp.dest(dist)) // Выплюнем их
		.pipe(reload({stream: true})); //Перезагрузим сервер
});
/* ================================ */

/* ========= ТАСК "SASS" ========== */
gulp.task('scss', function() {
	return gulp.src(app + 'src/style.scss') // Берём источник
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(cssImport()) // Запускаем @import
		.pipe(sass({outputStyle: 'expanded'})) // Преобразуем SCSS в CSS
		.pipe(queries()) // Объединяем медиа запросы
		.pipe(prod ? autoprefixer(['last 15 versions', '>1%', 'ie 8', 'ie 7'], {cascade: true}) : gutil.noop()) // Создаём префиксы
		.pipe(gulp.dest(dist + 'css/')) // Выгружаем результат
		.pipe(reload({stream: true})); // Перезагружаем сервер
});
/* ================================ */

/* ======= ТАСК "CSS-LIBS" ======== */
gulp.task('css-libs', function() {
	return gulp.src(app + 'src/libs.scss') // Берём источник
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(cssImport()) // Запускаем @import
		.pipe(sass({outputStyle: prod ? 'compressed' : 'expanded'})) // Преобразуем SCSS в CSS
		.pipe(prod ? strip({ // Убираем комментарии
			preserve: false // /* */ - Такие тоже
		}) : gutil.noop())
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс ".min"
		.pipe(gulp.dest(dist + 'css')) // Выгружаем
		.pipe(reload({stream: true})); // Перезагружаем сервер
});
/* ================================ */

/* ======== ТАСК "JS" ======== */
gulp.task('js', function() {
	return gulp.src([ // Берём файлы
		app + 'src/script.js',
		app + 'src/blocks/map/map.js'
	])
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(include()) // Собираем их в один файл
		.pipe(prod ? prettify({ // Форматируем код
			indent_char: '\t',
			indent_size: 1
		}) : gutil.noop())
		.pipe(gulp.dest(dist + 'js')) // Выгружаем
		.pipe(reload({stream: true})); // Перезагружаем сервер
});
/* ================================ */

/* ======== ТАСК "JS-LIBS" ======== */
gulp.task('js-libs', function() {
	return gulp.src(app + 'src/libs.js') // Берём все необходимые скрипты
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(include()) // Собираем их в один файл
		.pipe(prod ? uglify() : gutil.noop()) // Сжимаем
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс ".min"
		.pipe(gulp.dest(dist + 'js')) // Выгружаем
		.pipe(reload({stream: true})); // Перезагружаем сервер
});
/* ================================ */

/* ========== ТАСК "IMG" ========== */
gulp.task('img', function() {
	return gulp.src(app + 'img/**/*') // Берём все изображения
		.pipe(prod ? cache(imagemin({ // Сжимаем их с наилучшими настройками с учётом кэширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})) : gutil.noop())
		.pipe(gulp.dest(dist + 'img')) // Выгружаем на продакшн
		.pipe(reload({stream: true})); // Перезагружаем сервер
});
/* ================================ */

/* ========= ТАСК "FONTS" ========= */
gulp.task('fonts', function() {
	return gulp.src(app + 'fonts/**/*') // Берём шрифты
	.pipe(gulp.dest(dist + 'fonts')) // Выгружаем на продакшн
	.pipe(reload({stream: true})); // Перезагружаем сервер
});
/* ================================ */

/* ========= ТАСК "CLEAN" ========= */
gulp.task('clean', function() {
	return del.sync([dist, temp]); // Удаляем папки "dist" и "temp" перед сборкой
});
/* ================================ */

/* ========= ТАСК "BUILD" ========= */
gulp.task('build', function(callback) {
	runSequence(
		'clean',
		'json',
		[
			'pug',
			'scss',
			'css-libs',
			'js',
			'js-libs',
			'img',
			'fonts'
		],
		callback
	);
});
/* ================================ */

/* ========= ТАСК "WATCH" ========= */
gulp.task('watch', function() {
	gulp.watch(app + '**/*.pug', ['pug']); // Наблюдение за PUG файлами
	gulp.watch([app + 'src/**/*.scss', '!' + app + 'src/libs.scss'], ['scss']); // Наблюдение за своими SCSS файлами
	gulp.watch(app + 'src/libs.scss', ['css-libs']); // Наблюдение за скачанными CSS файлами
	gulp.watch([app + 'src/**/*.js', '!' + app + 'src/libs.js'], ['js']); // Наблюдение за своими JS файлами
	gulp.watch(app + 'src/libs.js', ['js-libs']); // Наблюдение за скачанными JS файлами
	gulp.watch(app + 'img/*', ['img']); // Наблюдение за картинками
	gulp.watch(app + 'fonts/*', ['fonts']); // Наблюдение за шрифтами
	gulp.watch(app + 'templates/data/**/*.json', function() { // Наблюдение за JSON файлами
		runSequence(
			'json',
			'pug'
		);
	});
});
/* ================================ */



/* -------------------------------- */
/*         СЛУЖЕБНЫЕ ТАСКИ          */
/* -------------------------------- */

/* ===== КОМАНДА ПО УМОЛЧАНИЮ ===== */
gulp.task('default', function(callback) {
	runSequence(
		'build',
		'browser-sync',
		'watch',
		callback
	);
});
/* ================================ */

/* ======== ОЧИСТКА КЭША ========== */
gulp.task('clear', function() {
	return cache.clearAll();
});
/* ================================ */

/* ====== СОЗДАНИЕ СПРАЙТОВ ======= */
gulp.task('sprite', function() {
	var spriteData = gulp.src(app + 'sprites/*.*') // путь, откуда берем картинки для спрайта
		.pipe(sprite({
			imgName: 'RESULT.png',
			cssName: 'RESULT.css'
		}));

	spriteData.img.pipe(gulp.dest(app + 'sprites/')); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest(app + 'sprites/')); // путь, куда сохраняем стили
});
/* ================================ */

/* ====== СОЗДАНИЕ СТРАНИЦЫ ======= */
/**
 * name   (n) - Имя файла
 * title  (t) - Заголовок страницы
 * layout (l) - Шаблон страницы
 */
gulp.task('page', function() {
	var
		name = gutil.env.name || gutil.env.n || 'blank',
		title = gutil.env.title || gutil.env.t || 'Пустая страница',
		layout = gutil.env.layout || gutil.env.l || 'default',
		string =
			'extends layouts/' + layout + '\r\n' +
			'\r\n' +
			'block vars\r\n' +
			'\t-\r\n' +
			'\t\tpage = {\r\n' +
			'\t\t\ttitle: \'' + title + '\',\r\n' +
			'\t\t\tlink: \'' + name + '.html\'\r\n' +
			'\t\t}\r\n' +
			'\r\n' +
			'block content\r\n' +
			'\tinclude pages/' + name;

	fs.writeFileSync(app + 'templates/' + name + '.pug', string);
	fs.writeFileSync(app + 'templates/pages/' + name + '.pug', '');
});
/* ================================ */

/* ======= СОЗДАНИЕ БЛОКА ========= */
/**
 * name                        (n) - Имя блока
 * scss                        (s) - Генерация SCSS
 * js                          (j) - Генерация JS
 * mixins, mixin, mix          (m) - Генерация PUG миксина
 * components, component, comp (c) - Генерация PUG компонента
 * partials, partial, part     (p) - Генерация PUG части страницы
 * json                        (o) - Генерация данных JSON
 */
gulp.task('block', function() {
	var
		name = gutil.env.name || gutil.env.n, // Имя блока

		dirBlocks = app + 'src/blocks/', // Полный путь до папки с блоками
		dirTemp = app + 'templates/', // Полный путь до папки с вёрсткой

		dirThis = dirBlocks + name + '/', // Полный путь до папки с текущим блоком
		dirThisRel = 'blocks/' + name + '/', // Относительный путь до папки с текущим блоком

		keyScss = gutil.env.scss || gutil.env.s, // Ключ генерации SCSS файла
		keyJs = gutil.env.js || gutil.env.j, // Ключ генерации JS файла
		keyPugMixin = gutil.env.mixins || gutil.env.mixin || gutil.env.mix || gutil.env.m, // Ключ генерации PUG миксина
		keyPugComp = gutil.env.components || gutil.env.component || gutil.env.comp || gutil.env.c, // Ключ генерации PUG компонента
		keyPugPart = gutil.env.partials || gutil.env.partial || gutil.env.part || gutil.env.p, // Ключ генерации PUG части страницы
		keyDataJson = gutil.env.json || gutil.env.o; // Ключ генерации JSON

	// Генерация SCSS при запуске без ключей
	if (!keyScss && !keyJs && !keyPugMixin && !keyPugComp && !keyPugPart && !keyDataJson) {

		fs.access(dirBlocks + name + '.js', function(err) {

			if (err) {
				addScss(dirBlocks, 'blocks/');
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
					addScss(dirBlocks, 'blocks/');
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
					addJs(dirBlocks, 'blocks/');
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
			pathToMain = app + 'src/style.scss',
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
			app + 'src/script.js',
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

		gulp.src(app + 'src/script.js')
			.pipe(replace(
				'@@include(\'blocks/' + name + '.js\')',
				'@@include(\'' + dirThisRel + name + '.js\')'
			))
			.pipe(gulp.dest(function(file) {
				return file.base;
			}));

		return del('./' + dirBlocks + name + '.js');
	}
	function moveScssToFolder() {

		fs.mkdirSync(dirThis);

		gulp.src(dirBlocks + name + '.scss')
			.pipe(gulp.dest(dirThis));

		gulp.src(app + 'src/style.scss')
			.pipe(replace(
				'@import url(\'blocks/' + name + '.scss\');',
				'@import url(\'' + dirThisRel + name + '.scss\');'
			))
			.pipe(gulp.dest(function(file) {
				return file.base;
			}));

		return del('./' + dirBlocks + name + '.scss');
	}
});
/* ================================ */