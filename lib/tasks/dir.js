var path = require("path");
var fs = require("fs");

module.exports = function(dir, config) {
	if (!fs.existsSync(dir.targetPath)) {
		fs.mkdirSync(dir.targetPath);
	}
};
