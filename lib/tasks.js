var fs = require("fs");
var path = require("path");
var config = require("./config.js");

var _tasks = {};

module.exports = Tasks = {
	getAll : function() {
		if (fs.existsSync(config.paths.tasks)) {
			fs.readdirSync(config.paths.tasks).forEach(function(item, i, items) {
				var itemPath = path.resolve(config.paths.tasks, item);
				if (fs.statSync(itemPath).isFile()) {
					_tasks[path.basename(item, path.extname(item))] = require(itemPath);
				}
			});
		}
		
		if (fs.existsSync(config.paths.userTasks)) {
			fs.readdirSync(config.paths.userTasks).forEach(function(item, i, items) {
				var itemPath = path.resolve(config.paths.userTasks, item);
				if (fs.statSync(itemPath).isFile()) {
					_tasks[path.basename(item, path.extname(item))] = require(itemPath);
				}
			});
		}
		
		return _tasks;
	},
	
	getTask : function(itemPath) {
		if (fs.statSync(itemPath).isDirectory()) {
			return _tasks["dir"];
		}
		else {
			return (_tasks[path.extname(itemPath).substr(1)] || _tasks["other"]);
		}
	},
	
	runTask : function(itemPath, props) {
		var targetPath = path.resolve(
			config.paths.output,
			path.relative(config.paths.input, itemPath)
		);

		Tasks.getTask(itemPath)(
			{
				changeType     : props.changeType,
				path           : itemPath,
				targetPath     : targetPath,
				targetDirname  : path.dirname(targetPath),
				targetFilename : path.basename(targetPath),
				currentStat    : props.currentStat,
				prevStat       : props.prevStat
			},
			{
				paths : config.paths,
				options : config.options,
				tasks  : _tasks
			}
		);
	}
};
