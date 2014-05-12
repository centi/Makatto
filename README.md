# Makatto

Simple Node.js command line utility which helps with prototyping a static website. It helps to compile your HTML templates and other resources (JS, LESS). It can also run as a web server with a Livereload (file watcher) feature.

## Install

	npm install -g makatto

## Usage

The only thing you need to run Makatto is the source (input) directory, which contains the templates and resources of your static website. By default, Makatto searches for a `src` subdirectory in the directory where it was started:

	makatto

You can specify any other input directory:

	makatto -i [path]

If no build (output) directory is specified, Makatto searches for a `build` directory, or creates it when it does not exist.

### Running as a web server

If you want to see your compiled web site right away, you can use the **server** feature. If run as a server, Makatto serves the output directory:

	makatto -s

The default port is 9000, but you can specify any other:

	makatto -s -p 8888

### Livereload

If run as a server, Makatto can also watch all files for updates and automaticaly reload the web site in the browser after each change. It injects a WebSockets javascript file in every served HTML page (only if the Livereload feature is turned on, of course):

	makatto -s -p 8888 -l

### All options

	Usage: makatto [options]

	Options:

	-h, --help            output usage information
	-V, --version         output the version number
	-i, --input [path]    The input (source) directory. Default: src
	-o, --output [path]   The output (build) directory. Default: build
	-t, --tasks [path]    The custom tasks directory. Default: tasks
	-s, --server          Serve the build files using a local HTTP server.
	-p, --port [port]     Which HTTP port to use for the local HTTP server. Default: 9000
	-l, --livereload      Use livereload
	-d, --devel           Devel environment flag. Can be used in templates.
	-m, --minify          Use minification for resources (CSS/JS)
	--sourcemaps          Generate source maps for compiled sources (JS/LESS/...)

## Tasks

Makatto monitores a source folder and runs a specific **task** for each of the files. The tasks are tied to the files by their extensions.

Right now Makatto ships with theese built-in tasks:

* **html** - Compiles *.html files using the Swig templating engine
* **js** - No compiling done. But optionaly it minifies the file or/and generates source maps.
* **less** - Compiles the *.less files. Optionaly it minifies the file or/and generates source maps.
* **dir** - This task simply recreates the directory structure of the **input** directory in the **output** directory.
* **other** - This task simply copies the unmodified file to the **output** folder. This task is used for every file, which does not have a task assigned by its extension.

## Custom tasks

Makatto is built with custom tasks in mind. If you want to add some other task (to compile Stylus, to optimize PNG images, ...) or to override some built-in task, just create a **tasks** subdirectory next to your **input** directory (or any other place, if you use the `--tasks` option) and create a javascript file named by the extension of the file you want to process (if you want to process a PNG file, create png.js).

**Each task must look like this**:

	module.exports = function(file, config) {
		// do whatever you want in here
	};

The function will be called with these arguments:

* **file**
  * **path** - path to the original file
  * **targetPath** - path to the target file (the compiled file should be created here)
  * **targetDirname** - the directory part of `targetPath`
  * **targetFilename** - the basename part of `targetPath`
  * **changeType** - used mainly if the livereload feature is on. It contains the type of change: `updated`, `created` or `deleted`. On the initial build (when Makatto is started), the value is `rebuild`.
  * **currentStat** - the current stat (fs.Stat), after the file change
  * **prevStat** - the original stat (fs.Stat), before the file change
* **config**
  * **paths** - map of all paths used in the application
  * **options** - map of all options used in the application
  * **tasks** - map of all registered tasks
