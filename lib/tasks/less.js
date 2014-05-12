var path = require("path");
var fs = require("fs");
var less = require("less");

module.exports = function(file, config) {
	file.originalTargetPath = file.targetPath;
	file.targetPath = file.targetPath.replace(/\.less$/i, ".css");
	console.log("LESS: ", file.targetPath.replace(config.paths.output, ""));
	
	var options = config.options;
	var parser = new(less.Parser)({
		paths    : [path.dirname(file.path)],
		filename : path.basename(file.path)
	});
	var sourceMapFilename = file.targetFilename + ".map";
	
	parser.parse(fs.readFileSync(file.path, {encoding : "utf-8"}), function(err, tree) {
		if (err) {
			onError(err);
			return;
		}
		
		try {
			if (options.minify) {
				// copy the original
				fs.writeFileSync(file.originalTargetPath, fs.readFileSync(file.path));

				if (options.sourcemaps) {
					fs.writeFileSync(file.targetPath, tree.toCSS({
						compress : true,
						sourceMap : true,
						writeSourceMap : function(map) {
							fs.writeFileSync(
								path.resolve(file.targetDirname, sourceMapFilename),
								map
							);
						},
						sourceMapURL : sourceMapFilename
					}));
				}
				else {
					fs.writeFileSync(file.targetPath, tree.toCSS({
						compress : true
					}));
				}
			}
			else {
				fs.writeFileSync(file.targetPath, tree.toCSS());
			}
		}
		catch(err) {
			onError(err);
		}
	});
};

function onError(err) {
	console.log("=== LESS ERROR (" + err.filename + " " + err.line + " ) ============================");
	console.log("    " + err.message);
}
