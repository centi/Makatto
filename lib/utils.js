var glob = require("glob");
var fs = require("fs");

module.exports = {
	readDir : function(dir, pattern) {
		return glob.sync(dir + (pattern || "/**/*"), {dot:true});
	},
	
	emptyDir : function(dir) {
		var items = glob.sync(dir + "/**/*", {dot:true});
		var dirs = [];
		var files = [];
		
		while (items[0]) {
			item = items.shift();
			if (fs.statSync(item).isDirectory()) {
				dirs.push(item);
			}
			else {
				files.push(item);
			}
		}
		
		files.forEach(function(file) {
			fs.unlinkSync(file);
		});
		dirs.reverse().forEach(function(dir) {
			fs.rmdirSync(dir);
		})
	}
};
