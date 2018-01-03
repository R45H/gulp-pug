var del = require('del'); // Для удаления файлов и папок

module.exports = function(options) {
	return function() {

		return del(options.dist);
	}
};