var watchr  = require("watchr");
var path    = require("path");
var config  = require("./config.js");
var tasks   = require("./tasks.js");
var build   = require("./build.js");

var listeners = {
	error : [],
	watching : [],
	change : []
};

function onError(err) {
	console.log("Watcher: an error occured: ", err);
	
	listeners.error.forEach(function(listener) {
		listener(err);
	});
}

function onWatching(err, instance, watching) {
	if (err) {
		console.log("Watcher: watching the path " + instance.path + " failed with error: ", err);
	}
	
	listeners.watching.forEach(function(listener) {
		listener(err, intance, watching);
	});
}

function onChange(type, itemPath, current, prev) {
	if (config.options.excludeRE.test(itemPath)) {
		build.rebuild();
	}
	else {
		tasks.runTask(itemPath, {
			changeType  : type,
			currentStat : current,
			prevStat    : prev
		});
	}
	
	listeners.change.forEach(function(listener) {
		listener(type, itemPath, current, prev);
	});
}

module.exports = {
	watch : function(callback) {
		watchr.watch({
			catchupDelay : 500,
			path : config.paths.input,
			listeners : {
				error : onError,
				watching : onWatching,
				change : onChange
			},
			next : function(err, watching) {
				if (err) {
					return console.log(err);
				}
				
				callback && callback();
			}
		});
	},
	
	on : function(evtType, listener) {
		if (evtType && listener && listeners[evtType]) {
			listeners[evtType].push(listener);
		}
	}
};