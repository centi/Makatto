var MakattoReload = function() {
	this.host = location.hostname;
	this.port = location.port;
	this.socket = null;
	
	this._init();
};

MakattoReload.prototype = {
	_init : function() {
		var self = this;
		
		try {
			this.socket = io.connect("ws://" + this.host + ":" + this.port);
			this.socket.on("update", function(data) {
				self._onUpdate.apply(self, arguments);
			});
		}
		catch(e) {}
	},
	
	_onUpdate : function(data) {
		var self = this;
		
		if (data.action === "refresh") {
			if (/\.(jpg|gif|png)$/i.test(data.url)) {
				self._reloadImage(data.url);
			}
			else {
				if (/\.(less|css)$/i.test(data.url)) {
					self._reloadStyle(data.url);
				}
				else {
					self._reloadPage();
				}
			}
		}
	},
	
	_reloadPage : function() {
		location.reload(true);
	},
	
	_reloadImage : function(url) {
		var imgs = document.getElementsByTagName("img");
		var urlNormalized = url.replace(/\\/g, "/");
		var srcNormalized;
		var found = false;
		
		for (var i = 0, l = imgs.length; i < l; i++) {
			srcNormalized = imgs[i].getAttribute("src").replace(/\\/g, "/");
			if (urlNormalized === srcNormalized) {
				imgs[i].src = urlNormalized + "?ts=" + (new Date()).getTime();
				found = true;
			}
		}
		
		if (!found) {
			this._reloadPage();;
		}
	},
	
	_reloadStyle : function(url) {
		var links = document.getElementsByTagName("link");
		var urlNormalized = url.replace(/\.less$/, ".css").replace(/\\/g, "/");
		var hrefNormalized;
		var link, clone, parent;
		
		for (var i = 0, l = links.length; i < l; i++) {
			if (links[i].getAttribute("rel").toLowerCase() === "stylesheet") {
				hrefNormalized = links[i].getAttribute("href").replace(/\\/g, "/");
				if (urlNormalized === hrefNormalized) {
					link = links[i];
				}
			}
		}
		
		if (link) {
			parent = link.parentNode;
			clone = link.cloneNode(false);
			clone.href = urlNormalized + "?ts=" + (new Date()).getTime();
			if (parent.lastChild === link) {
				parent.appendChild(clone);
			}
			else {
				parent.insertBefore(clone, link.nextSibling);
			}
			link.parentNode.removeChild(link);
		}
		else {
			this._reloadPage();
		}
	}
};

new MakattoReload();
