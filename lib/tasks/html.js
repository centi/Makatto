var path = require("path");
var fs = require("fs");
var swig = require("swig");

swig.setDefaults({cache : false});

module.exports = function(file, config) {
	console.log("HTML: ", file.targetPath.replace(config.paths.output, ""));
	
	fs.writeFileSync(file.targetPath, swig.renderFile(file.path, {FILE : file, ENV : config}));
};
