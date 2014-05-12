#!/usr/bin/env node

var fs       = require("fs");
var path     = require("path");
var keypress = require("keypress");
var config   = require("../lib/config.js");
var build    = require("../lib/build.js");

var APP = {
	config : config,
	init : function() {
		var paths = config.paths;
		
		if (config.options.server === true) {
			keypress(process.stdin);
			process.stdin.on("keypress", APP._onKeypress);
			process.stdin.setRawMode(true);
			process.stdin.resume();
		}
		
		if (!fs.existsSync(paths.input)) {
			console.log("The input (source) folder does not exist: ", paths.input);
			process.exit();
		}
		if (!fs.existsSync(paths.output)) {
			console.log("The output (build) folder does not exist, it will be created: ", paths.output);
			
			fs.mkdirSync(paths.output);
		}

		build.init();
		
		return APP;
	},
	
	rebuild : function() {
		console.log("Building ...");
		build.rebuild();
		
		return APP;
	},
	
	watch : function() {
		var watcher = require("../lib/watcher.js");
		watcher.watch(function() {
			console.log("Watching ...");
		});
		
		return APP;
	},
	
	serve : function() {
		var server = require("../lib/server.js");
		server.serve(function() {
			console.log("Server listening on port: ", config.options.port);
		});
	},
	
	_onKeypress : function(ch, key) {
		if (key && key.ctrl && key.name === "c") {
			process.exit();
		}
	}
};

APP.init();
APP.rebuild();

if (config.options.server === true) {
	APP.serve();
	APP.watch();
}
