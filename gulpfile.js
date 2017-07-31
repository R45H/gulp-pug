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
   path         = require('path'),                         // Для работы с путями
   runSequence  = require('run-sequence'),                 // Для синхронного выполнения задач
   pug          = require('gulp-pug'),                     // Шаблонизатор Pug (бывший Jade)
   merge        = require('gulp-merge-json'),              // Конкатенация JSON
   data         = require('gulp-data'),                    // Парс JSON
   fs           = require('fs')                            // Чтение JSON
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
var prod = gutil.env.production;

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
		.pipe(gulp.dest('temp/')); // Выплюнем
});
/* ================================ */

/* ========= ТАСК "PUG" ========== */
gulp.task('pug', function () {
	return gulp.src(app + 'templates/*.pug') // Выберем файлы по нужному пути
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(data(function(file) { // Парсим JSON
			return JSON.parse(fs.readFileSync('temp/data.json'))
		}))
		.pipe(prod ? pug({ // Сконвертим в HTML
			pretty: '\t' // Форматируем с табами вместо пробелов
		}) : pug())
		.pipe(gulp.dest(dist)) // Выплюнем их
		.pipe(reload({stream: true})); //Перезагрузим сервер
});
/* ================================ */

/* ========= ТАСК "SASS" ========== */
gulp.task('sass', function() {
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
	return gulp.src(app + 'src/script.js') // Берём все необходимые скрипты
		.pipe(plumber(err)) // Отслеживаем ошибки
		.pipe(include()) // Собираем их в один файл
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
	return del.sync([dist, temp]); // Удаляем папку "dist" перед сборкой
});
/* ================================ */

/* ========= ТАСК "BUILD" ========= */
gulp.task('build', function(callback) {
	runSequence(
		'clean',
		'json',
		[
			'pug',
			'sass',
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
	gulp.watch([app + 'src/**/*.scss', '!' + app + 'src/libs.scss'], ['sass']); // Наблюдение за своими SCSS файлами
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