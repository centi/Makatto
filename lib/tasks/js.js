var path = require("path");
var fs = require("fs");
var uglify = require("uglify-js");

module.exports = function(file, config) {
	console.log("JS  : ", file.targetPath.replace(config.paths.output, ""));
	
	var options = config.options;
	
	if (options.minify) {
		// copy the original
		fs.writeFileSync(file.targetPath, fs.readFileSync(file.path));

		if (options.sourcemaps) {
			minifyWithSourceMaps(file);
		}
		else {
			fs.writeFileSync(
				file.targetPath,
				uglify.minify(file.path).code
			);
		}
	}
	else {
		fs.writeFileSync(
			file.targetPath,
			fs.readFileSync(file.path)
		);
	}
};

function minifyWithSourceMaps(file) {
	// change the working directory, so the by UglifyJS generated paths are relative
	var cwd = process.cwd();
	process.chdir(file.targetDirname);

	var os = require("os");
	var minFilename = file.targetFilename.replace(".js", ".min.js");
	var mapFilename = minFilename + ".map";
	var uglySource, minSource, mapSource;

	// create the minified version
	uglySource = uglify.minify(file.targetFilename, {
		outSourceMap : file.targetFilename
	});
	minSource = uglySource.code + os.EOL + "//# sourceMappingURL=" + mapFilename + os.EOL;
	mapSource = uglySource.map;
	fs.writeFileSync(minFilename, minSource);

	// create the source map file
	fs.writeFileSync(mapFilename, mapSource);

	// change the working directory back to the original one
	process.chdir(cwd);
}