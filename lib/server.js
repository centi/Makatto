var fs = require("fs");
var path = require("path");
var express = require("express");
var directory = require("serve-index");
var config  = require("./config.js");

var originalWrite, originalEnd, sockets;
var livereloadSnippet = "\t<script src=\"/socket.io/socket.io.js\"><\/script>\n\t<script src=\"/makatto-reload.js\"><\/script>\n";

function backup(res) {
	originalWrite = res.write;
	originalEnd = res.end;
}

function injectLivereload(req, res, next) {
	if (/^.*\.html$/.test(req.url)) {
		backup(res);
		
		res.write = function(body, encoding) {
			var body_str;
			if (body !== undefined) {
				body_str = body instanceof Buffer ? body.toString(encoding) : body;
				
				if (body_str.indexOf("</head>") > 0) {
					body_str = body_str.replace("<\/head>", livereloadSnippet + "</head>");
				}
				else if (body_str.indexOf("</body>") > 0) {
					body_str = body_str.replace("<\/body>", livereloadSnippet + "</body>");
				}
				else {
					body_str += livereloadSnippet;
				}
				
				res.setHeader("Content-Length", Buffer.byteLength(body_str, encoding));
				
				return originalWrite.call(res, body_str, encoding);
			}
			return true;
		};
		
		res.end = function() {
			restore(res);
			
			return originalEnd.call(res);
		};
	}
	
	return next();
}

function serveLivereload(req, res, next) {
	var script;
	
	if (req.url === "/makatto-reload.js") {
		script = fs.readFileSync(path.resolve(__dirname, "reload.js"), "utf-8");
		
		res.writeHead(200, {
			"Content-Type" : "text/javascript;charset=UTF-8",
			"Content-Length" : script.length,
			"Cache-Control" : "no-chache",
			"Expirse" : "-1"
		});
		res.end(script, "utf-8");
		
		return true;
	}
	return next();
}

function restore(res) {
	res.write = originalWrite;
	res.end = originalEnd;
}

function bindSockets(server) {
	if (!server) {
		return;
	}
	
	var watcher = require("./watcher.js");
	var io = require("socket.io").listen(server);
	io.set("log level", 1); // error/warning
	
	sockets = io.sockets;
	sockets.on("connection", function(socket) {
		console.log("WS< client connected");
	});
	watcher.on("change", onWatcherChange);
}

function onWatcherChange(type, itemPath, current, prev) {
	if (fs.statSync(itemPath).isFile()) {
		sockets.emit("update", {
			url : path.relative(config.paths.input, itemPath),
			action : "refresh"
		});
	}
}

module.exports = {
	serve : function(callback) {
		var app = express();
		
		if (config.options.livereload === true) {
			app.use(injectLivereload);
			app.use(serveLivereload);
		}
		app.use(directory(config.paths.output, {icons : true}));
		app.use(express.static(config.paths.output));
		
		var server = app.listen(config.options.port, callback);
		
		if (config.options.livereload === true) {
			bindSockets(server);
		}
	}
};
