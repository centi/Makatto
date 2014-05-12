var path = require("path");
var fs = require("fs");

module.exports = function(file, config) {
	fs.writeFileSync(file.targetPath, fs.readFileSync(file.path));
};
