var bs = require('browser-sync'); // Автоперезагрузка браузера

module.exports = function(options) {
	return function() {

		bs({
			server: options.dist,
			notify: false,
			ghostMode: false
		});
	}
};