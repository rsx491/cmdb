# cmdb

**How to install and run the CMDB node app**

## Prerequisites

### As Per the File Manager Appliction, Please make sure to properly configure Apache HTTP with the following:

### HTTPS Config
	-SSLEngine on
	-SSLCertificateFile /etc/apache2/ssl/apache.crt
	-SSLCertificateKeyFile /etc/apache2/ssl/apache.key

	-Request the cert from here
	-<Location "/YOUR_REQUEST_CERT_DIRECTORY">
	-SSLVerifyClient optional_no_ca
	-SSLVerifyDepth 1
	-SSLOptions +ExportCertData
	-</Location>

	-All files in CMDB/apache need to go in YOUR_REQUEST_CERT_DIRECTORY

1. Install [Node.js](http://nodejs.org) 
 - on OSX use [homebrew](http://brew.sh) `brew install node`
 - on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

2. Install these NPM packages globally

    ```bash
    npm install -g bower gulp nodemon`
    ```

### Running in dev mode
 - Run the project with `gulp serve-dev`

### Building the project
 - Build the optimized project using `gulp build`
 - This create the optimized code for the project and puts it in the build folder

### Running the optimized code
 - Run the optimize project from the build folder with `gulp serve-build`

### Importing JSON record files
 - Run 'node ./src/server/load_batch.js  location_of_json_file' in order to import a json file full of records. 
 - The fields in the records will be parsed and stored in order to accomodate any fields not predefined in the record model

### Structure
The structure also contains a gulpfile.js and a server folder. 

	/src
		/client
			/app
			/images
			/libs
			/styles
			index.html  <- client entry point
		/server
			/controllers  <-- main CRUD controller
			/models   <-- mongoose database models
			/utils    <-- 404 error page
			routes.js
			config.js
			app.js  <- server entry point
			db.js
	
### Installing Packages
When you generate the project it should run these commands, but if you notice missing pavkages, run these again:

 - `npm install`
 - `bower install`

### The Modules
The app has 4 feature modules and depends on a series of external modules and custom but cross-app modules

```
app --> [
        app.admin,
        app.dashboard,
        app.layout, 
        app.widgets,
		app.core --> [
			ngAnimate,
			ngSanitize,
			ui.router,
			blocks.exception,
			blocks.logger,
			blocks.router
		]
    ]
```

## layout/shell Module
Encloses the top nav, login/splash screen and sidebar

### dashboard Module
The primary module for the data table and record modals

### layout/sidebar
Initiates jstree based listing, calls dashboard for click events

#### core Module
Core modules are ones that are shared throughout the entire application and may be customized for the specific application. Example might be common data services.

This is an aggregator of modules that the application will need. The `core` module takes the blocks, common, and Angular sub-modules as dependencies. 

#### blocks Modules
Block modules are reusable blocks of code that can be used across projects simply by including them as dependencies.

##### blocks.logger Module
The `blocks.logger` module handles logging across the Angular app.

##### blocks.exception Module
The `blocks.exception` module handles exceptions across the Angular app.

It depends on the `blocks.logger` module, because the implementation logs the exceptions.

##### blocks.router Module
The `blocks.router` module contains a routing helper module that assists in adding routes to the $routeProvider.
