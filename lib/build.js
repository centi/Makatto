var fs       = require("fs");
var config   = require("./config.js");
var utils    = require("./utils.js");
var tasks    = require("./tasks.js");

module.exports = {
	init : function() {
		tasks.getAll();
	},
	rebuild : function() {
		utils.emptyDir(config.paths.output);
		
		var items = utils.readDir(config.paths.input, "/**/*").filter(function(itemPath) {
			return config.options.excludeRE.test(itemPath);
		});
		items.forEach(function(itemPath) {
			tasks.runTask(itemPath, {
				changeType  : "rebuild",
				currentStat : fs.statSync(itemPath),
				prevStat    : fs.statSync(itemPath)
			});
		});
	}
};
