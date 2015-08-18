/* load Mongoose and all models */
var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.DB);

mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + config.DB);
}); 

mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
});


require('./models/record.js');
require('./models/counter.js');
require('./models/recordField.js');



