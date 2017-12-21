var
	gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	fs   = require('fs'); // Чтение и запись файлов

module.exports = function(options) {
	return function(done) {

		var
			name = $.util.env.name || $.util.env.n || options.name,
			title = $.util.env.title || $.util.env.t || options.title,
			layout = $.util.env.layout || $.util.env.l || options.layout,
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

		fs.writeFileSync(options.dist + name + '.pug', string);
		fs.writeFileSync(options.dist + 'pages/' + name + '.pug', '');

		done();
	}
}