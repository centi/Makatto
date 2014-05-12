var path = require("path");
var program = require("commander");
var modulePath = path.resolve(path.dirname(module.filename), "..");
var pkg = require(path.resolve(modulePath, "package.json"));

function resolvePath(dir) {
	return path.resolve(process.cwd(), dir);
}

program.version(pkg.version);
program.option("-i, --input [path]", "The input (source) directory. Default: src", resolvePath, resolvePath("src"));
program.option("-o, --output [path]", "The output (build) directory. Default: build", resolvePath, resolvePath("build"));
program.option("-t, --tasks [path]", "The custom tasks directory. Default: tasks", resolvePath, resolvePath("tasks"));
program.option("-s, --server", "Serve the build files using a local HTTP server.");
program.option("-p, --port [port]", "Which HTTP port to use for the local HTTP server. Default: 9000", parseInt, 9000);
program.option("-l, --livereload", "Use livereload");
program.option("-d, --devel", "Devel environment flag. Can be used in templates.");
program.option("-m, --minify", "Use minification for resources (CSS/JS)");
program.option("--sourcemaps", "Generate source maps for compiled sources (JS/LESS/...)");
program.parse(process.argv);

module.exports = {
	paths : {
		module        : modulePath,
		bin           : path.resolve(modulePath, "bin"),
		lib           : path.resolve(modulePath, "lib"),
		input         : program.input,
		output        : program.output,
		tasks         : path.resolve(__dirname, "tasks"),
		userTasks     : program.tasks,
	},
	options : {
		excludeRE     : new RegExp("^/?([^_\./][^/]*/)*[^_\./][^/]*$"), // exclude paths which have _ or . at the beginning of any part
		server        : !!program.server,
		port          : program.port,
		livereload    : !!program.livereload,
		minify        : !!program.minify,
		sourcemaps    : !!program.sourcemaps,
		devel         : !!program.devel,
	}
};
