// Плагины
var
   gulp = require('gulp'),
	$    = require('gulp-load-plugins')();

// Переключатель сборки для работы или в продакшн (false для работы)
var prod = $.util.env.p || $.util.env.production;

// Каталоги и файлы
var
	app      = './app/', // Исходники
	dist     = prod ? './build/production/' : './build/dist/', // Собранный проект
	temp     = './build/temp/', // Служебные файлы
	more     = './more/', // Дополнительные материалы для работы
	jsonName = 'data.json', // Имя JSON файла
	tasks    = './tasks/'; // Задачи галпа

// Функция для подключения задач из внешних файлов
function lazyRequireTask(taskName, path, options) {
	options = options || {};
	options.taskName = taskName;
	gulp.task(taskName, function(callback) {
		var task = require(path).call(this, options);
		return task(callback);
	})
}



/* --------------------------------------------- */
/* -------------- ОСНОВНЫЕ ЗАДАЧИ -------------- */
/* --------------------------------------------- */

/** BROWSER:SYNC
 * Автоматическая перезагрузка браузера
 */
lazyRequireTask('browser:sync', tasks + 'browser-sync', {
	dist: dist // Путь для готовых файлов
});

/** JSON
 * Собирает JSON файлы в один и выгружает в служебную папку
 */
lazyRequireTask('json', tasks + 'json', {
	src: app + '/templates/data/**/*.json', // Путь к исходникам
	dist: temp, // Путь для готового файла
	fName: jsonName // Имя файла
});

/** PUG
 * Компилирует pug файлы в html, вставляет данные из JSON
 */
lazyRequireTask('pug', tasks + 'pug', {
	src: app + 'templates/*.pug', // Путь к исходникам
	dist: dist, // Путь для готовых файлов
	json: temp + jsonName, // Путь к JSON файлу для вставки контента
	prod: prod // Флаг сборки на продакшн
});

/** CSS
 * Компилирует SCSS в CSS
 */
lazyRequireTask('css', tasks + 'css', {
	src: app + 'src/style.scss', // Путь к исходникам
	dist: dist + 'css', // Путь для готовых файлов
	prod: prod // Флаг сборки на продакшн
});

/** CSS:LIBS
 * Собирает стили всех библиотек в один файл, сжимает
 */
lazyRequireTask('css:libs', tasks + 'css-libs', {
	src: app + 'src/libs.scss', // Путь к исходникам
	dist: dist + 'css', // Путь для готовых файлов
	prod: prod // Флаг сборки на продакшн
});

/** JS
 * Собирает свои js файлы в один
 */
lazyRequireTask('js', tasks + 'js', {
	src: [ // Путь к исходникам
		app + 'src/script.js',
		app + 'src/blocks/map/map.js'
	],
	dist: dist + 'js', // Путь для готовых файлов
	prod: prod // Флаг сборки на продакшн
});

/** JS:LIBS
 * Собирает js файлы библиотек в один файл, сжимает
 */
lazyRequireTask('js:libs', tasks + 'js-libs', {
	src: app + 'src/libs.js', // Путь к исходникам
	dist: dist + 'js', // Путь для готовых файлов
	prod: prod // Флаг сборки на продакшн
});

/** IMG
 * Переносит растровые картинки, ужимает по весу
 */
lazyRequireTask('img', tasks + 'img', {
	src: app + 'img/**/*.{jpg,jpeg,png,gif}', // Путь к исходникам
	dist: dist + 'img', // Путь для готовых файлов
	prod: prod // Флаг сборки на продакшн
});

/** SVG
 * Переносит векторные картинки, минифицирует
 */
lazyRequireTask('svg', tasks + 'svg', {
	src: [ // Путь к исходникам
		app + 'img/**/*.svg',
		'!' + app + 'img/svg-sprite/**/*.svg'
	],
	dist: dist + 'img/', // Путь для готовых файлов
	prod: prod // Флаг сборки на продакшн
});

/** SVG:SPRITE
 * Собирает из векторных картинок спрайт
 */
lazyRequireTask('svg:sprite', tasks + 'svg-sprite', {
	src: app + 'img/svg-sprite/**/*.svg', // Путь к исходникам
	dist: dist + 'img/', // Путь для готовых файлов
	fName: 'sprite.svg', // Имя готового файла
	prod: prod // Флаг сборки на продакшн
});

/** FONTS
 * Переносит шрифты
 */
lazyRequireTask('fonts', tasks + 'fonts', {
	src: app + 'fonts/**/*', // Путь к исходникам
	dist: dist + 'fonts' // Путь для готовых файлов
});

/** CLEAN
 * Удаляет папки с собранным проектом и служебными файлами
 */
lazyRequireTask('clean', tasks + 'clean', {
	dist: [ // Список удаляемых каталогов
		dist,
		temp
	]
});

/** BUILD
 * Собирает проект
 */
gulp.task('build',
	gulp.series(
		'clean',
		gulp.parallel(
			gulp.series(
				'json',
				'pug'
			),
			'css',
			'css:libs',
			'js',
			'js:libs',
			'img',
			'svg',
			'svg:sprite',
			'fonts'
		)
	)
);

/** WATCH
 * Отслеживает изменения в файлах проекта
 */
gulp.task('watch', function() {
	global.watch = true;

	gulp.watch(app + 'templates/**/*.pug', gulp.series('pug'))
		.on('all', function(event, filepath) {
			global.emittyChangedFile = filepath;
		});

	gulp.watch(app + 'templates/data/**/*.json', gulp.series('json', 'pug'));
	gulp.watch([app + 'src/**/*.scss', '!' + app + 'src/libs.scss'], gulp.series('css'));
	gulp.watch(app + 'src/libs.scss', gulp.series('css:libs'));
	gulp.watch([app + 'src/**/*.js', '!' + app + 'src/libs.js'], gulp.series('js'));
	gulp.watch(app + 'src/libs.js', gulp.series('js:libs'));
	gulp.watch(app + 'img/**/*.{jpg,jpeg,png,gif}', gulp.series('img'));
	gulp.watch([app + 'img/**/*.svg', '!' + app + 'img/svg-sprite/**/*.svg'], gulp.series('svg'));
	gulp.watch(app + 'img/svg-sprite/**/*.svg', gulp.series('svg:sprite'));
	gulp.watch(app + 'fonts/**/*', gulp.series('fonts'));
});

/** DEFAULT
 * Задача по умолчанию, запускается по команде 'gulp'
 */
gulp.task('default',
	gulp.series(
		'build',
		gulp.parallel(
			'browser:sync',
			'watch'
		)
	)
);



/* --------------------------------------------- */
/* ----------- ВСПОМОГАТЕЛЬНЫЕ ЗАДАЧИ ---------- */
/* --------------------------------------------- */

/** SPRITE
 * Собирает из растровых картинок спрайт
 */
lazyRequireTask('sprite', tasks + 'sprite', {
	src: more + 'sprite/**/*.{jpg,jpeg,png,gif}', // Путь к исходникам
	dist: more + 'sprite', // Путь для готовых файлов
	fName: 'result' // Имя готового файла
});

/** HTML2:TO:PUG
 * Конвертирует html в pug
 */
lazyRequireTask('html:to:pug', tasks + 'html-to-pug', {
	src: more + 'html-to-pug/' // Путь к исходнику
});

/** PAGE
 * Создание новой pug страницы
 *
 * name   (n) - Имя файла
 * title  (t) - Заголовок страницы
 * layout (l) - Шаблон страницы
 */
lazyRequireTask('page', tasks + 'page', {
	dist: app + 'templates/', // Расположение новой страницы
	name: 'blank', // Имя файла по умолчанию
	title: 'Пустая страница', // Заголовок по умолчанию
	layout: 'default' // Шаблон по умолчанию
});

/**
 * BLOCK
 * Создание нового блока
 *
 * name                        (n) - Имя блока
 * scss                        (s) - Генерация SCSS
 * js                          (j) - Генерация JS
 * mixins, mixin, mix          (m) - Генерация PUG миксина
 * components, component, comp (c) - Генерация PUG компонента
 * partials, partial, part     (p) - Генерация PUG включаемой области
 * json                        (o) - Генерация данных JSON
 */
lazyRequireTask('block', tasks + 'block', {
	src: app + 'src/', // Путь до корневой папки блоков
	dirBlocks: app + 'src/blocks/', // Полный путь до папки с блоками
	relBlocks: 'blocks/', // Относительный путь до папки с блоками
	dirTemp: app + 'templates/', // Полный путь до папки с вёрсткой
	name: 'block' // Имя блока по умолчанию
});