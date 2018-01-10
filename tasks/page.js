var
	$    = require('gulp-load-plugins')(),
	fs   = require('fs'); // Чтение и запись файлов

module.exports = function(options) {
	return function(done) {

		var
			name = $.util.env.name || $.util.env.n || options.name, // Имя файла
			title = $.util.env.title || $.util.env.t || options.title, // Заголовок страницы
			layout = $.util.env.layout || $.util.env.l || options.layout, // Шаблон страницы
			string = // Содержимое страницы
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
				'\tinclude pages/' + name,
			pageInit = options.pageInit + name + '.pug', // Путь к странице с параметрами
			page = options.page + name + '.pug'; // Путь к странице с вёрсткой

		if ((fs.existsSync(pageInit)) || (fs.existsSync(page))) {
			printMsg('err', 'Страница "' + name + '.pug" уже существует!');
		} else {
			fs.writeFileSync(pageInit, string);
			fs.writeFileSync(page, '');
			setTimeout(function () {
				fs.utimesSync(pageInit, new Date, new Date);
			}, 0);

			printMsg('ok', 'Страница "' + name + '.pug" создана!');
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